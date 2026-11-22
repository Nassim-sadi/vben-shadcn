<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api';

import { nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { useAccess } from '@vben/access';
import { ColPage, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { useDictStore } from '@vben/stores';

import { confirm as vbenConfirm } from '@vben-core/popup-ui';
import { Button } from '@vben-core/shadcn-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDictData,
  deleteDictType,
  getDictDataList,
  getDictTypeList,
} from '#/api';
import { Tag } from '#/components/ui/app';
import { $t } from '#/locales';

import {
  useDataColumns,
  useDataGridFormSchema,
  useTypeColumns,
  useTypeGridFormSchema,
} from './data';
import DataForm from './modules/data-form.vue';
import TypeForm from './modules/type-form.vue';

const route = useRoute();
const router = useRouter();
const dictStore = useDictStore();
const { hasAccessByCodes } = useAccess();

const selectedCode = ref(String(route.query.code ?? ''));
let initialized = false;

const [TypeFormModal, typeFormModalApi] = useVbenModal({
  connectedComponent: TypeForm,
  destroyOnClose: true,
});
const [DataFormModal, dataFormModalApi] = useVbenModal({
  connectedComponent: DataForm,
  destroyOnClose: true,
});

/** Highlight the row matching the current selection in the left grid. */
function syncTypeCurrentRow() {
  const grid = typeGridApi.grid;
  if (!grid?.getTableData) {
    return;
  }
  const rows = grid.getTableData().visibleData ?? [];
  const row = rows.find((item) => item.code === selectedCode.value);
  if (row) {
    void grid.setCurrentRow(row);
  } else {
    grid.clearCurrentRow?.();
  }
}

function selectType(code: string, syncUrl = true) {
  selectedCode.value = code;
  if (syncUrl) {
    void router.replace({ query: code ? { code } : {} });
  }
  void nextTick(syncTypeCurrentRow);
}

const [TypeGrid, typeGridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    schema: useTypeGridFormSchema(),
    submitOnChange: true,
  },
  gridEvents: {
    cellClick: (params: { row?: SystemDictApi.SystemDictType }) => {
      if (params.row?.code) {
        selectType(params.row.code);
      }
    },
    dataChange: () => {
      void nextTick(syncTypeCurrentRow);
    },
  },
  gridOptions: {
    columns: useTypeColumns(onTypeActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const result = await getDictTypeList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
          const items = result.items ?? [];
          if (!initialized) {
            initialized = true;
            const wanted = String(route.query.code ?? '');
            const match = items.find((item) => item.code === wanted) ?? items[0];
            if (match) {
              selectType(match.code, false);
            }
          } else if (
            selectedCode.value &&
            !items.some((item) => item.code === selectedCode.value)
          ) {
            selectType('', false);
          }
          return result;
        },
      },
    },
    rowConfig: {
      isCurrent: true,
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

const [DataGrid, dataGridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: true,
    showCollapseButton: true,
    schema: useDataGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useDataColumns(onDataActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          if (!selectedCode.value) {
            return { items: [], total: 0 };
          }
          return await getDictDataList({
            dictCode: selectedCode.value,
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

watch(selectedCode, () => {
  dataGridApi.query();
});

function onTypeActionClick({
  code,
  row,
}: OnActionClickParams<SystemDictApi.SystemDictType>) {
  switch (code) {
    case 'data': {
      selectType(row.code);
      break;
    }
    case 'delete': {
      onDeleteType(row);
      break;
    }
    case 'edit': {
      typeFormModalApi.setData(row).open();
      break;
    }
  }
}

function onDataActionClick({
  code,
  row,
}: OnActionClickParams<SystemDictApi.SystemDictData>) {
  switch (code) {
    case 'delete': {
      onDeleteData(row);
      break;
    }
    case 'edit': {
      dataFormModalApi.setData(row).open();
      break;
    }
  }
}

function onCreateType() {
  typeFormModalApi.setData(null).open();
}

function onCreateData() {
  if (!selectedCode.value) {
    return;
  }
  dataFormModalApi.setData({ dictCode: selectedCode.value }).open();
}

function refreshTypeGrid() {
  typeGridApi.query();
}

function refreshDataGrid() {
  dataGridApi.query();
}

async function onDeleteType(row: SystemDictApi.SystemDictType) {
  try {
    await vbenConfirm({
      content: $t('system.dict.deleteCascadeTip'),
      title: $t('ui.actionTitle.delete', [$t('system.dict.name')]),
    });
  } catch {
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
    refreshTypeGrid();
  } catch {
    toast.dismiss(hideLoading);
  }
}

function onDeleteData(row: SystemDictApi.SystemDictData) {
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.label]),
  );
  deleteDictData(row.id)
    .then(() => {
      dictStore.refreshDict(selectedCode.value);
      toast.success($t('ui.actionMessage.deleteSuccess', [row.label]), {
        id: hideLoading,
      });
      refreshDataGrid();
    })
    .catch(() => {
      toast.dismiss(hideLoading);
    });
}
</script>

<template>
  <ColPage
    auto-content-height
    :left-width="32"
    :left-min-width="20"
    :left-max-width="45"
    :split-line="true"
  >
    <template #left>
      <TypeFormModal @success="refreshTypeGrid" />
      <DataFormModal @success="refreshDataGrid" />
      <TypeGrid :table-title="$t('system.dict.list')">
        <template #toolbar-tools>
          <Button
            v-if="hasAccessByCodes(['SystemDict:create'])"
            @click="onCreateType"
          >
            <Plus class="size-5" />
            {{ $t('ui.actionTitle.create', [$t('system.dict.name')]) }}
          </Button>
        </template>
        <template #code="{ row }">
          <Button variant="link" size="sm" @click="selectType(row.code)">
            {{ row.code }}
          </Button>
        </template>
      </TypeGrid>
    </template>

    <DataGrid
      :table-title="`${$t('system.dict.dataList')}${selectedCode ? ` - ${selectedCode}` : ''}`"
    >
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['SystemDict:create'])"
          :disabled="!selectedCode"
          @click="onCreateData"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dict.label')]) }}
        </Button>
      </template>
      <template #label="{ row }">
        <Tag v-if="row.color" :color="row.color">{{ row.label }}</Tag>
        <span v-else>{{ row.label }}</span>
      </template>
    </DataGrid>
  </ColPage>
</template>
