<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api';

import { createDateRangeCodec } from '#/utils/date-range-codec';
import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLogList } from '#/api';
import { $t } from '#/locales';

import { useLogColumns, useLogGridFormSchema } from './data';

interface LogSearchFormValues extends Record<string, unknown> {
  createTime?: [Dayjs, Dayjs];
}

const logSearchCodec = createDateRangeCodec<LogSearchFormValues>()({
  endField: 'endTime',
  rangeField: 'createTime',
  startField: 'startTime',
});

type LogSearchSubmitValues = ReturnType<typeof logSearchCodec.encode>;

const [Grid] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    codec: logSearchCodec,
    schema: useLogGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useLogColumns(),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues: LogSearchSubmitValues) => {
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
    <Grid :table-title="$t('system.log.list')" />
  </Page>
</template>
