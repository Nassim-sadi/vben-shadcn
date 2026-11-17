<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api';

import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { Plus } from '@vben/icons';
import { useDictStore } from '@vben/stores';

import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDictData, getDictDataList } from '#/api';
import { Tag } from '#/components/ui/app';
import { $t } from '#/locales';

import { useDataColumns, useDataGridFormSchema } from './data';
import Form from './modules/data-form.vue';

const route = useRoute();
const { closeCurrentTab, setTabTitle } = useTabs();
const dictStore = useDictStore();

const dictCode = computed(() => String(route.params.code ?? ''));

// 标签页在布局里才登记，setup 阶段调用 setTabTitle 找不到标签。
// 挂载后再写入，并用 computed 跟随编码和语言变化。
onMounted(() => {
  setTabTitle(
    computed(() => `${$t('system.dict.dataTitle')} - ${dictCode.value}`),
  );
});

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    schema: useDataGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useDataColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDictDataList({
            dictCode: dictCode.value,
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
  } as VxeTableGridOptions<SystemDictApi.SystemDictData>,
});

watch(dictCode, () => {
  refreshGrid();
});

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemDictApi.SystemDictData>) {
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
  formModalApi.setData({ dictCode: dictCode.value }).open();
}

function onEdit(row: SystemDictApi.SystemDictData) {
  formModalApi.setData(row).open();
}

function onDelete(row: SystemDictApi.SystemDictData) {
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.label]),
  );
  deleteDictData(row.id)
    .then(() => {
      dictStore.refreshDict(dictCode.value);
      toast.success($t('ui.actionMessage.deleteSuccess', [row.label]), {
        id: hideLoading,
      });
      refreshGrid();
    })
    .catch(() => {
      toast.dismiss(hideLoading);
    });
}

function onClose() {
  closeCurrentTab();
}

function refreshGrid() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="refreshGrid" />
    <Grid :table-title="$t('system.dict.dataList')">
      <template #toolbar-tools>
        <Button class="mr-2" @click="onClose">
          {{ $t('preferences.tabbar.contextMenu.close') }}
        </Button>
        <Button v-if="hasAccessByCodes(['SystemDict:create'])" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dict.label')]) }}
        </Button>
      </template>
      <template #label="{ row }">
        <Tag v-if="row.color" :color="row.color">{{ row.label }}</Tag>
        <span v-else>{{ row.label }}</span>
      </template>
    </Grid>
  </Page>
</template>
