<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDeptApi, SystemUserApi } from '#/api';

import { onMounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, Tree, useVbenModal } from '@vben/common-ui';
import { Download, Plus } from '@vben/icons';

import { confirm as vbenConfirm } from '@vben-core/popup-ui';
import { Button } from '@vben-core/shadcn-ui';

import ExcelJS from 'exceljs';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import { deleteUser, getDeptList, getUserList, updateUser } from '#/api';
import { Card, InputSearch } from '#/components/ui/app';
import { TABLE } from '#/constants/table';
import { $t } from '#/locales';
import { createDateRangeCodec } from '#/utils/date-range-codec';

import { useColumns, useGridFormSchema } from './data';
import AssignRole from './modules/assign-role.vue';
import Detail from './modules/detail.vue';
import Form from './modules/form.vue';

interface UserSearchFormValues extends Record<string, unknown> {
  createTime?: [Dayjs, Dayjs];
}

const userSearchCodec = createDateRangeCodec<UserSearchFormValues>()({
  endField: 'endTime',
  rangeField: 'createTime',
  startField: 'startTime',
});

type UserSearchSubmitValues = ReturnType<typeof userSearchCodec.encode>;

const { hasAccessByCodes } = useAccess();

const deptList = ref<SystemDeptApi.SystemDept[]>([]);
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

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    codec: userSearchCodec,
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
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues: UserSearchSubmitValues) => {
          return await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            deptId: selectedDeptId.value || undefined,
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

/**
 * Wraps vbenConfirm as a promise for easy use in async functions.
 * @param content Prompt content
 * @param title Prompt title
 */
async function confirm(content: string, title: string) {
  await vbenConfirm({ content, title });
}

/**
 * Status switch is about to change
 * @param newStatus Expected new status value
 * @param row Row data
 * @returns Returns false to abort the change, returns other values (undefined, true) to allow the change
 */
async function onStatusChange(
  newStatus: number,
  row: SystemUserApi.SystemUser,
) {
  const status: Recordable<string> = {
    0: $t('common.disabled'),
    1: $t('common.enabled'),
  };
  try {
    await confirm(
      $t('page.system.user.confirmStatus', {
        name: row.name,
        status: status[newStatus.toString()],
      }),
      $t('page.system.user.switchStatus'),
    );
    await updateUser(row.userCode, { status: newStatus });
    return true;
  } catch {
    return false;
  }
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

async function handleExport() {
  try {
    const res = await getUserList({
      page: 1,
      pageSize: 9999,
      deptId: selectedDeptId.value,
    });
    const users = Array.isArray(res)
      ? res
      : (((res as Record<string, unknown>)?.items ??
          []) as SystemUserApi.SystemUser[]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: $t('system.user.id'), key: 'id', width: 30 },
      { header: $t('system.user.name'), key: 'name', width: 30 },
      { header: $t('system.user.userCode'), key: 'userCode', width: 30 },
      { header: $t('system.user.gender'), key: 'gender', width: 15 },
      { header: $t('system.user.status'), key: 'status', width: 15 },
      { header: $t('system.user.dept'), key: 'deptId', width: 30 },
      { header: $t('system.user.remark'), key: 'remark', width: 40 },
      { header: $t('system.user.createTime'), key: 'createTime', width: 30 },
    ];

    users.forEach((user: SystemUserApi.SystemUser) => {
      const statusLabel =
        user.status === 1 ? $t('common.enabled') : $t('common.disabled');
      worksheet.addRow({
        id: user.id,
        name: user.name,
        userCode: user.userCode ?? '',
        gender: user.gender ?? 0,
        status: statusLabel,
        deptId: user.deptId ?? '',
        remark: user.remark ?? '',
        createTime: user.createTime ?? '',
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

    toast.success($t('ui.actionMessage.operationSuccess'));
  } catch (error) {
    console.error('Export failed:', error);
    toast.error($t('ui.actionMessage.operationFailed'));
  }
}
</script>

<template>
  <Page auto-content-height>
  <FormModal @success="onRefresh" />
  <DetailModal />
  <AssignRoleModal @success="onRefresh" />
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
            :tree-data="deptList"
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
