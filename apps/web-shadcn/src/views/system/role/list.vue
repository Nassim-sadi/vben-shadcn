<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { confirm as vbenConfirm } from '@vben-core/popup-ui';
import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRole, getRoleList, updateRole } from '#/api';
import { TABLE } from '#/constants/table';
import { $t } from '#/locales';
import { createDateRangeCodec } from '#/utils/date-range-codec';

import { useColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';
import Form from './modules/form.vue';
import Permissions from './modules/permissions.vue';

interface RoleSearchFormValues extends Record<string, unknown> {
  createTime?: [Dayjs, Dayjs];
}

const roleSearchCodec = createDateRangeCodec<RoleSearchFormValues>()({
  endField: 'endTime',
  rangeField: 'createTime',
  startField: 'startTime',
});

type RoleSearchSubmitValues = ReturnType<typeof roleSearchCodec.encode>;

const { hasAccessByCodes } = useAccess();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const [PermissionsModal, permissionsModalApi] = useVbenModal({
  connectedComponent: Permissions,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    codec: roleSearchCodec,
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      pageSize: TABLE.DEFAULT_PAGE_SIZE,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues: RoleSearchSubmitValues) => {
          return await getRoleList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
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
  } as VxeTableGridOptions<SystemRoleApi.SystemRole>,
});

function onActionClick(e: OnActionClickParams<SystemRoleApi.SystemRole>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'detail': {
      onDetail(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'permissions': {
      onPermissions(e.row);
      break;
    }
  }
}

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
  row: SystemRoleApi.SystemRole,
) {
  const status: Recordable<string> = {
    0: $t('common.disabled'),
    1: $t('common.enabled'),
  };
  try {
    await confirm(
      $t('page.system.role.confirmStatus', {
        name: row.name,
        status: status[newStatus.toString()],
      }),
      $t('page.system.role.switchStatus'),
    );
    await updateRole(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemRoleApi.SystemRole) {
  formModalApi.setData(row).open();
}

function onDetail(row: SystemRoleApi.SystemRole) {
  detailModalApi.setData(row).open();
}

function onPermissions(row: SystemRoleApi.SystemRole) {
  permissionsModalApi.setData(row).open();
}

function onDelete(row: SystemRoleApi.SystemRole) {
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.name]),
  );
  deleteRole(row.id)
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
</script>
<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <DetailModal />
    <PermissionsModal @success="onRefresh" />
    <Grid :table-title="$t('system.role.list')">
      <template #toolbar-tools>
        <Button v-if="hasAccessByCodes(['SystemRole:create'])" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.role.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
