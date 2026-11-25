<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { BaseDataApi } from '#/api';

import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { confirm as vbenConfirm } from '@vben-core/popup-ui';
import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteBase, getBaseList } from '#/api';
import { ResetColumnWidthButton } from '#/components/ui/app';
import { $t } from '#/locales';

import BaseForm from './BaseForm.vue';
import { getBaseModuleConfig, type BaseModuleConfig } from './config';

const props = defineProps<{
  module: string;
}>();

const resolvedConfig = getBaseModuleConfig(props.module);
if (!resolvedConfig) {
  throw new Error(`Unknown base module: ${props.module}`);
}
const config: BaseModuleConfig = resolvedConfig;

const { hasAccessByCodes } = useAccess();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: BaseForm,
  destroyOnClose: true,
});

const columnsFactory = () => config.columns(onActionClick);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    schema: config.search(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: columnsFactory(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) =>
          await getBaseList(config.key, {
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
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
  } as VxeTableGridOptions<BaseDataApi.BaseRecord>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<BaseDataApi.BaseRecord>) {
  if (code === 'edit') {
    onEdit(row);
  } else if (code === 'delete') {
    void onDelete(row);
  }
}

function onCreate() {
  formModalApi.setData({ module: config.key }).open();
}

function onEdit(row: BaseDataApi.BaseRecord) {
  formModalApi.setData({ module: config.key, row }).open();
}

function rowKey(row: BaseDataApi.BaseRecord) {
  return config.keyFields.map((field) => String(row[field] ?? '')).join('|');
}

function rowName(row: BaseDataApi.BaseRecord) {
  const firstKey = config.keyFields[0] ?? 'id';
  return String(row[config.nameField] ?? row[firstKey] ?? '');
}

async function onDelete(row: BaseDataApi.BaseRecord) {
  const name = rowName(row);
  try {
    await vbenConfirm({
      content: $t('ui.actionMessage.deleteConfirm', [name]),
      title: $t('ui.actionTitle.delete', [$t(config.nameKey)]),
    });
  } catch {
    return;
  }

  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [name]),
  );
  try {
    await deleteBase(config.key, rowKey(row));
    toast.success($t('ui.actionMessage.deleteSuccess', [name]), {
      id: hideLoading,
    });
    refreshGrid();
  } catch {
    toast.dismiss(hideLoading);
  }
}

function refreshGrid() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid :table-title="$t(config.titleKey)">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes([`${config.permission}:create`])"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t(config.nameKey)]) }}
        </Button>
        <ResetColumnWidthButton
          :columns-factory="columnsFactory"
          :grid-api="gridApi"
        />
      </template>
    </Grid>
  </Page>
</template>
