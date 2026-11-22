<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { BaseClassesApi } from '#/api';

import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { confirm as vbenConfirm } from '@vben-core/popup-ui';
import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteClass, getClassesList } from '#/api';
import { $t } from '#/locales';

import { useClassesColumns, useClassesGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    schema: useClassesGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useClassesColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getClassesList({
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
  } as VxeTableGridOptions<BaseClassesApi.BaseClass>,
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<BaseClassesApi.BaseClass>) {
  switch (code) {
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

const { hasAccessByCodes } = useAccess();

function onCreate() {
  formModalApi.setData(null).open();
}

function onEdit(row: BaseClassesApi.BaseClass) {
  formModalApi.setData(row).open();
}

async function onDelete(row: BaseClassesApi.BaseClass) {
  try {
    await vbenConfirm({
      content: $t('ui.actionMessage.deleteConfirm', [row.classesName]),
      title: $t('ui.actionTitle.delete', [$t('system.classes.name')]),
    });
  } catch {
    return;
  }
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.classesName]),
  );
  try {
    await deleteClass(row.classesCode);
    toast.success($t('ui.actionMessage.deleteSuccess', [row.classesName]), {
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
    <Grid :table-title="$t('system.classes.list')">
      <template #toolbar-tools>
        <Button v-if="hasAccessByCodes(['BaseClasses:create'])" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.classes.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
