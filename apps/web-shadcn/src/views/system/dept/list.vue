<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept';

import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

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

async function onDeptRowDragEnd({
  dragRow,
  dragToChild,
  newRow,
  offsetIndex = 0,
}: DeptDragEnd) {
  if (!dragRow?.id || !newRow?.id) {
    return;
  }
  const newPid = dragToChild ? newRow.id : (newRow.pid || dragRow.pid || '0');
  const roots = (gridApi.grid?.getTableData()?.fullData ?? []) as DeptRow[];
  // vxe updates the visible order on the next tick, so compute the insertion
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

  const hideLoading = toast.loading('Updating...');
  try {
    await moveDeptBatch([{ deptCode: dragRow.id, pid: newPid, targetIndex }]);
    toast.success($t('ui.actionMessage.operationSuccess'), { id: hideLoading });
    refreshGrid();
  } catch (error) {
    toast.error(
      (error as Error)?.message ?? $t('ui.actionMessage.operationFailed'),
      { id: hideLoading },
    );
    refreshGrid();
  }
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
        query: async (_params) => flattenDeptTree(await getDeptList()),
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

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid :table-title="$t('system.dept.list')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['SystemDept:create'])"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dept.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
