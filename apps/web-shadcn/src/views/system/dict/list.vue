<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api';

import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { useDictStore } from '@vben/stores';

import { confirm as vbenConfirm } from '@vben-core/popup-ui';
import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDictType, getDictTypeList } from '#/api';
import { $t } from '#/locales';

import { useTypeColumns, useTypeGridFormSchema } from './data';
import Form from './modules/type-form.vue';

const router = useRouter();
const dictStore = useDictStore();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useTypeGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useTypeColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDictTypeList({
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
  } as VxeTableGridOptions<SystemDictApi.SystemDictType>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemDictApi.SystemDictType>) {
  switch (code) {
    case 'data': {
      onOpenData(row);
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

function onCreate() {
  formModalApi.setData(null).open();
}

function onEdit(row: SystemDictApi.SystemDictType) {
  formModalApi.setData(row).open();
}

function onOpenData(row: SystemDictApi.SystemDictType) {
  router.push({
    name: 'SystemDictData',
    params: { code: row.code },
  });
}

async function onDelete(row: SystemDictApi.SystemDictType) {
  try {
    await vbenConfirm({
      content: $t('system.dict.deleteCascadeTip'),
      title: $t('ui.actionTitle.delete', [$t('system.dict.name')]),
    });
  } catch {
    // 用户取消删除
    return;
  }
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.name]),
  );
  try {
    await deleteDictType(row.id);
    dictStore.refreshDict(row.code);
    toast.success($t('ui.actionMessage.deleteSuccess', [row.name]), {
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
    <Grid :table-title="$t('system.dict.list')">
      <template #toolbar-tools>
        <Button @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dict.name')]) }}
        </Button>
      </template>
      <template #code="{ row }">
        <Button variant="link" size="sm" @click="onOpenData(row)">
          {{ row.code }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
