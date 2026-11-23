<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { ref } from 'vue';
import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';

import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDept, getDeptList, moveDeptBatch } from '#/api/system/dept';
import { $t } from '#/locales';

import { useColumns } from './data';
import Form from './modules/form.vue';

type DeptRow = SystemDeptApi.SystemDept;
type DeptDragEnd = {
  dragRow: DeptRow;
  dragToChild?: boolean;
  newRow?: DeptRow;
  offsetIndex?: number;
};

/** Drag is locked by default; moves are staged until Save is pressed. */
const dragUnlocked = ref(false);
const pendingMoves = ref<SystemDeptApi.DeptMove[]>([]);
const savingOrder = ref(false);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { hasAccessByCodes } = useAccess();

/**
 * 编辑部门
 * @param row
 */
function onEdit(row: SystemDeptApi.SystemDept) {
  formModalApi.setData(row).open();
}

/**
 * 添加下级部门
 * @param row
 */
function onAppend(row: SystemDeptApi.SystemDept) {
  formModalApi.setData({ pid: row.id }).open();
}

/**
 * 创建新部门
 */
function onCreate() {
  formModalApi.setData(null).open();
}

/**
 * 删除部门
 * @param row
 */
function onDelete(row: SystemDeptApi.SystemDept) {
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.name]),
  );
  deleteDept(row.id)
    .then(() => {
      toast.success($t('ui.actionMessage.deleteSuccess', [row.name]), {
        id: hideLoading,
      });
      refreshGrid();
    })
    .catch(() => {
      toast.dismiss(hideLoading);
    });
}

/**
 * 表格操作按钮的回调函数
 */
function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemDeptApi.SystemDept>) {
  if (dragUnlocked.value) {
    toast.warning($t('system.dept.orderModeActive'));
    return;
  }
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
  }
}

/** vxe rebuilds the tree from flat rows when treeConfig.transform is true. */
function flattenDeptTree(rows: DeptRow[]): DeptRow[] {
  return rows.flatMap((row) => {
    const { children, ...flat } = row;
    return [flat, ...flattenDeptTree(children ?? [])];
  });
}

function collectRows(rows: DeptRow[]): DeptRow[] {
  return rows.flatMap((row) => [row, ...collectRows(row.children ?? [])]);
}

function onDeptRowDragEnd({
  dragRow,
  dragToChild,
  newRow,
  offsetIndex = 0,
}: DeptDragEnd) {
  if (!dragUnlocked.value || !dragRow?.id || !newRow?.id) {
    return;
  }
  const newPid = dragToChild
    ? newRow.id
    : (newRow.pid || dragRow.pid || '0');
  const roots = (gridApi.grid?.getTableData()?.fullData ?? []) as DeptRow[];
  // vxe updates the DOM order on the next tick, so compute the insertion
  // position relative to the drop target in the current sibling list.
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
  pendingMoves.value = [
    ...pendingMoves.value,
    { deptCode: dragRow.id, pid: newPid, targetIndex },
  ];
}

function toggleDrag() {
  dragUnlocked.value = !dragUnlocked.value;
}

async function onSaveOrder() {
  if (pendingMoves.value.length === 0) {
    return;
  }
  savingOrder.value = true;
  const hideLoading = toast.loading($t('system.dept.savingOrder'));
  try {
    await moveDeptBatch(pendingMoves.value);
    pendingMoves.value = [];
    dragUnlocked.value = false;
    toast.success($t('system.dept.orderSaved'), { id: hideLoading });
    refreshGrid();
  } catch (error) {
    toast.error(
      (error as Error)?.message ?? $t('ui.actionMessage.operationFailed'),
      { id: hideLoading },
    );
  } finally {
    savingOrder.value = false;
  }
}

function onDiscardOrder() {
  pendingMoves.value = [];
  dragUnlocked.value = false;
  refreshGrid();
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {
    rowDragend: onDeptRowDragEnd,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      ajax: {
        query: async (_params) => {
          pendingMoves.value = [];
          return flattenDeptTree(await getDeptList());
        },
      },
    },
    rowConfig: {
      drag: true,
      keyField: 'id',
    },
    rowDragConfig: {
      disabledMethod: () => !dragUnlocked.value,
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

/**
 * 刷新表格
 */
function refreshGrid() {
  pendingMoves.value = [];
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid :table-title="$t('system.dept.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['SystemDept:edit'])"
          :title="
            dragUnlocked
              ? $t('system.dept.lockDrag')
              : $t('system.dept.unlockDrag')
          "
          :variant="dragUnlocked ? 'default' : 'outline'"
          @click="toggleDrag"
        >
          <IconifyIcon
            class="size-4"
            :icon="dragUnlocked ? 'lucide:lock-open' : 'lucide:lock'"
          />
        </Button>
        <template v-if="dragUnlocked">
          <span class="text-muted-foreground whitespace-nowrap text-xs">
            {{ $t('system.dept.dragHint') }}
          </span>
          <Button
            :disabled="pendingMoves.length === 0"
            :loading="savingOrder"
            @click="onSaveOrder"
          >
            {{ $t('system.dept.saveOrder') }}
            <span v-if="pendingMoves.length > 0">
              ({{ pendingMoves.length }})
            </span>
          </Button>
          <Button
            :disabled="pendingMoves.length === 0 || savingOrder"
            variant="ghost"
            @click="onDiscardOrder"
          >
            {{ $t('system.dept.discardOrder') }}
          </Button>
        </template>
        <Button
          v-if="hasAccessByCodes(['SystemDept:create'])"
          :disabled="dragUnlocked"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dept.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
