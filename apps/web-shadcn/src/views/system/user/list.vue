<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDeptApi, SystemUserApi } from '#/api';

import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, Tree, useVbenModal } from '@vben/common-ui';
import { Download, Plus } from '@vben/icons';

import { confirm as vbenConfirm } from '@vben-core/popup-ui';
import { Button, Progress } from '@vben-core/shadcn-ui';

import ExcelJS from 'exceljs';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  deleteUser,
  getDeptList,
  getUserExportPage,
  getUserList,
  updateUser,
} from '#/api';
import { Card, InputSearch, SortDropdown } from '#/components/ui/app';
import { TABLE } from '#/constants/table';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import AssignRole from './modules/assign-role.vue';
import Detail from './modules/detail.vue';
import Form from './modules/form.vue';

const { hasAccessByCodes } = useAccess();

const deptList = ref<SystemDeptApi.SystemDept[]>([]);
const deptTreeData = computed(() => {
  const withCodes = (
    nodes: SystemDeptApi.SystemDept[],
  ): SystemDeptApi.SystemDept[] =>
    nodes.map((node) => ({
      ...node,
      name: node.id ? `${node.name} (${node.id})` : node.name,
      children: node.children?.length ? withCodes(node.children) : [],
    }));
  return withCodes(deptList.value);
});
const inputSearchValue = ref('');
const selectedDeptId = ref<string>('');

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const [AssignRoleModal, assignRoleModalApi] = useVbenModal({
  connectedComponent: AssignRole,
  destroyOnClose: true,
});

const EXPORT_PAGE_SIZE = 500;

type ExportStatus = 'idle' | 'running' | 'done' | 'aborted' | 'error';

const exportState = ref<{
  loaded: number;
  message: string;
  percent: number;
  status: ExportStatus;
  total: number;
}>({
  loaded: 0,
  message: '',
  percent: 0,
  status: 'idle',
  total: 0,
});

let exportController: AbortController | null = null;

/**
 * Guards every close path of the export modal. While the export is running,
 * closing is only possible after confirming that the operation is aborted.
 */
async function requestExportClose() {
  if (exportState.value.status !== 'running') {
    return true;
  }
  if (!(await confirm($t('system.user.exportAbortConfirm'), $t('system.user.exportAbort')))) {
    return false;
  }
  exportController?.abort();
  return true;
}

const [ExportProgressModal, exportModalApi] = useVbenModal({
  closable: false,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  showCancelButton: false,
  showConfirmButton: false,
  onBeforeClose: requestExportClose,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: false,
    showCollapseButton: false,
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: TABLE.DEFAULT_PAGE_SIZE,
    },
    sortConfig: {
      remote: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page, sort }, formValues: Recordable<any>) => {
          const sortArr = (sort as unknown) as Array<{ field?: string; order?: string }> | undefined;
          return await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            deptId: selectedDeptId.value || undefined,
            sortBy: sortArr?.[0]?.field,
            sortOrder: sortArr?.[0]?.order,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

/** Returns true only when the user confirms the dialog. */
async function confirm(content: string, title: string) {
  try {
    await vbenConfirm({ content, title });
    return true;
  } catch {
    return false;
  }
}

/** Shared by the State switch and the Lock/Unlock row actions. */
async function setUserStatus(
  row: SystemUserApi.SystemUser,
  status: 0 | 1,
): Promise<boolean> {
  const statusLabel = status === 1 ? $t('common.enabled') : $t('common.disabled');
  if (
    !(await confirm(
      $t('page.system.user.confirmStatus', {
        name: row.name,
        status: statusLabel,
      }),
      $t('page.system.user.switchStatus'),
    ))
  ) {
    return false;
  }

  try {
    await updateUser(row.userCode, { status });
    row.status = status;
    onRefresh();
    return true;
  } catch {
    return false;
  }
}

/** CellSwitch hook: return false to keep the old value. */
async function onStatusChange(newStatus: number, row: SystemUserApi.SystemUser) {
  return await setUserStatus(row, newStatus === 1 ? 1 : 0);
}

function onEdit(row: SystemUserApi.SystemUser) {
  formModalApi.setData(row).open();
}

function onDetail(row: SystemUserApi.SystemUser) {
  detailModalApi.setData(row).open();
}

function onDelete(row: SystemUserApi.SystemUser) {
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.name]),
  );
  deleteUser(row.userCode)
    .then(() => {
      toast.success($t('ui.actionMessage.deleteSuccess', [row.name]), {
        id: hideLoading,
      });
      onRefresh();
    })
    .catch(() => {
      toast.dismiss(hideLoading);
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formModalApi.setData(null).open();
}

async function loadDeptList() {
  try {
    const res = await getDeptList();
    deptList.value = res;
  } catch (error) {
    console.error('Failed to load department list:', error);
  }
}

/**
 * The Tree select event passes a reka-ui FlattenedItem; the department id
 * lives on `value` (the original node data). Clicking the selected node
 * again (Tree has allow-clear) clears the department filter.
 */
function selectDept(v: any) {
  const id = v?.value?.id ?? v?.id ?? '';
  selectedDeptId.value = selectedDeptId.value === id ? '' : id;
  gridApi.reload();
}

function searchDept(value: string) {
  if (!value) {
    loadDeptList();
    return;
  }
  const filtered = deptList.value.filter((dept) =>
    dept.name.toLowerCase().includes(value.toLowerCase()),
  );
  deptList.value = filtered;
}

onMounted(() => {
  loadDeptList();
});

watch(inputSearchValue, (value) => {
  searchDept(value);
});

/**
 * Exports every non-deleted user (no filters) in sequential keyset pages.
 * The browser does the XLSX work, so the server only sees small paged reads.
 */
async function handleExport() {
  if (exportState.value.status === 'running') {
    return;
  }

  const controller = new AbortController();
  exportController = controller;
  exportState.value = {
    loaded: 0,
    message: '',
    percent: 0,
    status: 'running',
    total: 0,
  };
  exportModalApi.open();

  const users: SystemUserApi.SystemUserExport[] = [];
  let after = '';

  try {
    while (true) {
      if (controller.signal.aborted) {
        throw new DOMException('Export aborted', 'AbortError');
      }

      const page = await getUserExportPage(
        { after, limit: EXPORT_PAGE_SIZE },
        controller.signal,
      );
      if (page.total > 0) {
        exportState.value.total = page.total;
      }
      users.push(...page.items);
      exportState.value.loaded = users.length;
      exportState.value.percent =
        exportState.value.total > 0
          ? Math.min(100, Math.round((users.length / exportState.value.total) * 100))
          : 0;
      await nextTick();

      if (!page.hasMore || !page.nextAfter) {
        break;
      }
      after = page.nextAfter;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');
    worksheet.columns = [
      { header: $t('system.user.id'), key: 'id', width: 30 },
      { header: $t('system.user.name'), key: 'name', width: 30 },
      { header: $t('system.user.userCode'), key: 'userCode', width: 30 },
      { header: $t('system.role.roleName'), key: 'roleName', width: 24 },
      { header: $t('system.role.roleCode'), key: 'roleCode', width: 24 },
      { header: $t('system.user.deptCode'), key: 'deptCode', width: 30 },
      { header: $t('system.user.mobile'), key: 'mobile', width: 24 },
      { header: $t('system.user.photoPath'), key: 'photoPath', width: 30 },
      { header: $t('system.user.gender'), key: 'gender', width: 15 },
      { header: $t('system.user.state'), key: 'state', width: 15 },
      { header: $t('system.user.remark'), key: 'remark', width: 40 },
      { header: $t('system.user.createUser'), key: 'createUserName', width: 24 },
      { header: $t('system.user.createTime'), key: 'createTime', width: 30 },
      { header: $t('system.user.updateUser'), key: 'updateUserName', width: 24 },
      { header: $t('system.user.updateTime'), key: 'updateDate', width: 30 },
    ];

    users.forEach((user) => {
      worksheet.addRow({
        id: user.id,
        name: user.name,
        userCode: user.userCode ?? '',
        roleName: user.roleName ?? '',
        roleCode: user.roleCode ?? '',
        deptCode: user.deptCode ?? '',
        mobile: user.mobile ?? '',
        photoPath: user.photoPath ?? '',
        gender: user.gender ?? 0,
        state: user.status === 1 ? $t('common.enabled') : $t('common.disabled'),
        remark: user.remark ?? '',
        createUserName: user.createUserName ?? '',
        createTime: user.createTime ?? '',
        updateUserName: user.updateUserName ?? '',
        updateDate: user.updateDate ?? '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    exportState.value.percent = 100;
    exportState.value.status = 'done';
    await nextTick();
    await exportModalApi.close();
    toast.success($t('ui.actionMessage.operationSuccess'));
  } catch (error) {
    if (controller.signal.aborted) {
      exportState.value.status = 'aborted';
      await exportModalApi.close();
      toast($t('system.user.exportAborted'));
      return;
    }
    console.error('Export failed:', error);
    exportState.value.status = 'error';
    exportState.value.message = $t('system.user.exportFailed');
  } finally {
    exportController = null;
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <DetailModal />
    <AssignRoleModal @success="onRefresh" />
    <ExportProgressModal :title="$t('system.user.exportTitle')">
      <div class="space-y-3 px-1 py-2">
        <Progress :model-value="exportState.percent" :max="100" />
        <div class="text-muted-foreground text-sm">
          {{
            $t('system.user.exportProgress', {
              loaded: exportState.loaded,
              total: exportState.total || '…',
            })
          }}
        </div>
        <div v-if="exportState.message" class="text-destructive text-sm">
          {{ exportState.message }}
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end p-2">
          <Button type="outline" @click="exportModalApi.close()">
            {{
              exportState.status === 'running'
                ? $t('system.user.exportAbort')
                : $t('system.user.exportClose')
            }}
          </Button>
        </div>
      </template>
    </ExportProgressModal>
    <div class="flex size-full">
      <Card class="dept-card w-1/6">
        <div class="shrink-0">
          <InputSearch
            v-model="inputSearchValue"
            :placeholder="$t('system.user.placeholder')"
          />
        </div>
        <div class="min-h-0 flex-1 overflow-auto">
          <Tree
            label-field="name"
            value-field="id"
            allow-clear
            :tree-data="deptTreeData"
            :default-expanded-level="2"
            @select="selectDept"
          />
        </div>
      </Card>

      <div class="w-5/6 ml-4">
        <Grid :table-title="$t('system.user.list')">
          <template #toolbar-tools>
            <Button
              v-if="hasAccessByCodes(['SystemUser:create'])"
              @click="onCreate"
              class="mr-2"
            >
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create', [$t('system.user.name')]) }}
            </Button>
            <Button type="outline" @click="handleExport" class="mr-2">
              <Download class="size-4 mr-1" />
              {{ $t('common.export') }}
            </Button>
            <SortDropdown :gridApi="gridApi" />
          </template>
          <template #action="{ row }">
            <VbenTableAction
              :actions="[
                {
                  text: $t('common.detail'),
                  icon: 'lucide:eye',
                  auth: ['SystemUser'],
                  onClick: () => onDetail(row),
                },
                {
                  text: $t('common.edit'),
                  icon: 'lucide:edit',
                  auth: ['SystemUser:edit'],
                  onClick: () => onEdit(row),
                },
              ]"
:dropdown-actions="[
  {
    text: $t('system.user.lock'),
    icon: 'lucide:lock',
    auth: ['SystemUser:edit'],
    disabled: row.status === 0,
    onClick: () => setUserStatus(row, 0),
  },
  {
    text: $t('system.user.unlock'),
    icon: 'lucide:lock-open',
    auth: ['SystemUser:edit'],
    disabled: row.status === 1,
    onClick: () => setUserStatus(row, 1),
  },
  {
    text: $t('system.user.assignRole'),
    icon: 'lucide:user-check',
    auth: ['SystemUser:assignRole'],
    onClick: () => assignRoleModalApi.setData(row).open(),
  },
  {
    text: $t('common.delete'),
    icon: 'lucide:trash-2',
    danger: true,
    auth: ['SystemUser:delete'],
    popConfirm: {
      title: $t('ui.actionMessage.deleteConfirm', [row.name]),
      confirm: () => onDelete(row),
    },
  },
]"
              align="center"
            />
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

<style scoped>
/* Keep the department card at full height with a scrollable tree area. */
.dept-card :deep([data-slot='card-content']) {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}
</style>
