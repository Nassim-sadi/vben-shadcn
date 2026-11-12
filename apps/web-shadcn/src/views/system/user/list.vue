<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemDeptApi, SystemUserApi } from '#/api';

import { onMounted, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import { Page, Tree, useVbenDrawer } from '@vben/common-ui';
import { Download, ExternalLink, Plus } from '@vben/icons';

import { confirm as vbenConfirm } from '@vben-core/popup-ui';
import { Button } from '@vben-core/shadcn-ui';

import ExcelJS from 'exceljs';

import { useVbenVxeGrid, VbenTableAction } from '#/adapter/vxe-table';
import {
  createUser,
  deleteUser,
  getDeptList,
  getUserList,
  updateUser,
} from '#/api';
import { Card, InputSearch } from '#/components/ui/app';
import { $t } from '#/locales';
import { createDateRangeCodec } from '#/utils/date-range-codec';

import { useColumns, useGridFormSchema } from './data';
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

const deptList = ref<SystemDeptApi.SystemDept[]>([]);
const inputSearchValue = ref('');
const selectedDeptId = ref<string>('');
const importFileInput = ref<HTMLInputElement | null>(null);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    codec: userSearchCodec,
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues: UserSearchSubmitValues) => {
          return await getUserList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
            deptId: selectedDeptId.value,
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
    await updateUser(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemUserApi.SystemUser) {
  formDrawerApi.setData(row).open();
}

function onDetail(row: SystemUserApi.SystemUser) {
  detailDrawerApi.setData(row).open();
}

function onDelete(row: SystemUserApi.SystemUser) {
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.name]),
  );
  deleteUser(row.id)
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
  formDrawerApi.setData(null).open();
}

async function loadDeptList() {
  try {
    const res = await getDeptList();
    deptList.value = res;
  } catch (error) {
    console.error('Failed to load department list:', error);
  }
}

function selectDept(v: string) {
  selectedDeptId.value = v;
  gridApi.query();
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

function handleImportFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  (async () => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        toast.error('No worksheet found in file');
        return;
      }

      const rows: SystemUserApi.SystemUser[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const id = row.getCell(1).value as string;
        const name = row.getCell(2).value as string;
        const gender = row.getCell(3).value as number;
        const statusRaw = row.getCell(4).value as string;
        const deptId = row.getCell(5).value as string;
        const remark = row.getCell(6).value as string;
        const createTime = row.getCell(7).value as string;

        if (!id || !name) return;

        rows.push({
          id,
          name,
          gender: (gender as 0 | 1 | 2) ?? 0,
          status: statusRaw === $t('common.enabled') ? 1 : 0,
          deptId: deptId ?? '',
          remark: remark ?? '',
          createTime: createTime ?? '',
          permissions: [],
        });
      });

      if (rows.length === 0) {
        toast.warning('No valid user data found');
        return;
      }

      const hideLoading = toast.loading(
        $t('ui.actionMessage.deleting', ['Importing users...']),
        { duration: 0 },
      );

      await Promise.all(rows.map((user) => createUser(user)));

      toast.dismiss(hideLoading);
      toast.success(
        $t('ui.actionMessage.operationSuccess', [rows.length.toString()]),
      );
      input.value = '';
      onRefresh();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error($t('ui.actionMessage.operationFailed'));
    }
  })();

  input.value = '';
}

function openImportFile() {
  importFileInput.value?.click();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer @success="onRefresh" />
    <div class="flex size-full">
      <Card class="w-1/6">
        <InputSearch
          v-model:value="inputSearchValue"
          :placeholder="$t('system.user.placeholder')"
        />
        <Tree
          label-field="name"
          value-field="id"
          :tree-data="deptList"
          :default-expanded-level="2"
          @select="selectDept"
        />
      </Card>

      <div class="w-5/6 ml-4">
        <Grid :table-title="$t('system.user.list')">
          <template #toolbar-tools>
            <Button @click="onCreate" class="mr-2">
              <Plus class="size-5" />
              {{ $t('ui.actionTitle.create', [$t('system.user.name')]) }}
            </Button>
            <Button type="outline" @click="handleExport" class="mr-2">
              <Download class="size-4 mr-1" />
              {{ $t('common.export') }}
            </Button>
            <Button type="outline" @click="openImportFile" class="mr-2">
              <ExternalLink class="size-4 mr-1" />
              {{ $t('common.import') }}
            </Button>
            <input
              ref="importFileInput"
              type="file"
              accept=".xlsx,.xls"
              @change="handleImportFileChange"
              class="hidden"
            />
          </template>
          <template #action="{ row }">
            <VbenTableAction
              :actions="[
                {
                  text: $t('common.detail'),
                  icon: 'lucide:eye',
                  onClick: () => onDetail(row),
                },
                {
                  text: $t('common.edit'),
                  icon: 'lucide:edit',
                  onClick: () => onEdit(row),
                },
              ]"
              :dropdown-actions="[
                {
                  text: $t('common.delete'),
                  icon: 'lucide:trash-2',
                  danger: true,
                  popConfirm: {
                    title: $t('ui.actionMessage.deleteConfirm', [row.name]),
                    confirm: () => onDelete(row),
                  },
                  auth: ['AC_100100'],
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

<style>

</style>
