<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { $t } from '@vben/locales';

import { MenuBadge } from '@vben-core/menu-ui';
import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid, useTableColumnWidths } from '#/adapter/vxe-table';
import {
  deleteMenu,
  getMenuList,
  moveMenu,
  SystemMenuApi,
} from '#/api/system/menu';
import { refreshAccessibleRoutes } from '#/router/refresh';

import { useColumns } from './data';
import Form from './modules/form.vue';

type MenuRow = SystemMenuApi.SystemMenu;
type MenuDragEnd = {
  dragRow: MenuRow;
  dragToChild?: boolean;
  newRow?: MenuRow;
  offsetIndex?: number;
};

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/** vxe rebuilds the tree from flat rows when treeConfig.transform is true. */
function flattenMenuTree(rows: MenuRow[]): MenuRow[] {
  return rows.flatMap((row) => {
    const { children, ...flat } = row;
    return [flat, ...flattenMenuTree(children ?? [])];
  });
}

function collectRows(rows: MenuRow[]): MenuRow[] {
  return rows.flatMap((row) => [row, ...collectRows(row.children ?? [])]);
}

async function onMenuRowDragEnd({
  dragRow,
  dragToChild,
  newRow,
  offsetIndex = 0,
}: MenuDragEnd) {
  if (!dragRow?.id || !newRow?.id) {
    return;
  }
  const newPid = dragToChild ? newRow.id : (newRow.pid || dragRow.pid || '0');
  const roots = (gridApi.grid?.getTableData()?.fullData ?? []) as MenuRow[];
  const siblings = collectRows(roots).filter(
    (row) => (row.pid || '0') === newPid && row.id !== dragRow.id,
  );
  let targetIndex: number;
  if (dragToChild) {
    targetIndex = offsetIndex ? siblings.length : 0;
  } else {
    const newIndex = siblings.findIndex((row) => row.id === newRow.id);
    if (newIndex < 0) {
      return;
    }
    targetIndex = newIndex + offsetIndex;
  }

  const hideLoading = toast.loading('Updating...');
  try {
    await moveMenu({ menuCode: dragRow.id, pid: newPid, targetIndex });
    toast.success($t('ui.actionMessage.operationSuccess'), { id: hideLoading });
    await onMenuChanged();
  } catch (error) {
    toast.error(
      (error as Error)?.message ?? $t('ui.actionMessage.operationFailed'),
      { id: hideLoading },
    );
    onRefresh();
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {
    rowDragend: onMenuRowDragEnd,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: '100%',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => flattenMenuTree(await getMenuList()),
      },
    },
    rowConfig: {
      drag: true,
      keyField: 'id',
    },
    rowDragConfig: {
      isAutoExpandToChild: true,
      isCrossDrag: true,
      isPeerDrag: true,
      isToChildDrag: true,
      showDragTip: true,
      showIcon: true,
      trigger: 'row',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
    treeConfig: {
      childrenField: 'children',
      expandAll: true,
      parentField: 'pid',
      rowField: 'id',
      transform: true,
    },
  } as VxeTableGridOptions,
});

const { resetWidths } = useTableColumnWidths();

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemMenuApi.SystemMenu>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
    default: {
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

async function onMenuChanged() {
  onRefresh();
  // Menu metadata (icon, activeIcon, order, etc.) is baked into the
  // accessible routes when the guard first runs. Rebuild them in place so
  // the sidebar/header/tabs update without a full page reload.
  await refreshAccessibleRoutes();
}

function onResetColumnWidths() {
  resetWidths();
  gridApi.setGridOptions({ columns: useColumns(onActionClick) });
  toast.success($t('common.reset'));
}
function onEdit(row: SystemMenuApi.SystemMenu) {
  formModalApi.setData(row).open();
}
const { hasAccessByCodes } = useAccess();

function onCreate() {
  formModalApi.setData({}).open();
}
function onAppend(row: SystemMenuApi.SystemMenu) {
  formModalApi.setData({ pid: row.id }).open();
}

function onDelete(row: SystemMenuApi.SystemMenu) {
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.name]),
  );
  deleteMenu(row.id)
    .then(() => {
      toast.success($t('ui.actionMessage.deleteSuccess', [row.name]), {
        id: hideLoading,
      });
      onMenuChanged();
    })
    .catch(() => {
      toast.dismiss(hideLoading);
    });
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="onMenuChanged" />
    <Grid>
      <template #toolbar-tools>
        <Button v-if="hasAccessByCodes(['SystemMenu:create'])" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.menu.name')]) }}
        </Button>
        <Button variant="ghost" @click="onResetColumnWidths">
          <IconifyIcon class="size-5" icon="lucide:columns-3" />
          {{ $t('ui.actionTitle.resetColumnWidth') }}
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 shrink-0">
            <IconifyIcon
              v-if="row.type === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta?.icon"
              :icon="row.meta?.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ $t(row.meta?.title) }}</span>
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge
          v-if="row.meta?.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
    </Grid>
  </Page>
</template>
<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
