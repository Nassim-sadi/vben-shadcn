<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLogList } from '#/api';
import { ResetColumnWidthButton } from '#/components/ui/app';
import { $t } from '#/locales';

import { useLogColumns, useLogGridFormSchema } from './data';

const columnsFactory = () => useLogColumns();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    schema: useLogGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: columnsFactory(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues: Recordable<any>) => {
          return await getLogList({
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
  } as VxeTableGridOptions<SystemLogApi.SystemLog>,
});
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.log.list')">
      <template #toolbar-tools>
        <ResetColumnWidthButton
          :columns-factory="columnsFactory"
          :grid-api="gridApi"
        />
      </template>
    </Grid>
  </Page>
</template>
