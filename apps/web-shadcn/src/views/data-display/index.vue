<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DataDisplayApi } from '#/api/data-display';

import { toast } from 'vue-sonner';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDataDisplayItem, getDataDisplayList } from '#/api/data-display';
import { $t } from '#/locales';
import { createDateRangeCodec } from '#/utils/date-range-codec';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

interface SearchFormValues extends Record<string, unknown> {
  createTime?: [Dayjs, Dayjs];
}

const searchCodec = createDateRangeCodec<SearchFormValues>()({
  endField: 'endTime',
  rangeField: 'createTime',
  startField: 'startTime',
});

type SearchSubmitValues = ReturnType<typeof searchCodec.encode>;

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    codec: searchCodec,
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page, sort }, formValues: SearchSubmitValues) => {
          return await getDataDisplayList({
            page: page.currentPage,
            pageSize: page.pageSize,
            sortBy: sort.field,
            sortOrder: sort.order,
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
  } as VxeTableGridOptions<DataDisplayApi.Item>,
});

function onActionClick(e: OnActionClickParams<DataDisplayApi.Item>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function onEdit(row: DataDisplayApi.Item) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: DataDisplayApi.Item) {
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.name]),
  );
  deleteDataDisplayItem(row.id)
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
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button class="mr-2" size="sm" @click="onCreate">
          <Plus class="mr-2 size-4" />
          {{ $t('page.dataDisplay.addNew') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
