<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api';

import { ref, watch } from 'vue';
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
  getDictTypeTree,
  moveDictData,
  moveDictType,
} from '#/api';
import { $t } from '#/locales';

import {
  useDataColumns,
  useDataSearchFormSchema,
  useTypeColumns,
  useTypeTreeFormSchema,
} from './data';
import DataForm from './modules/data-form.vue';
import TypeForm from './modules/type-form.vue';

type TypeRow = SystemDictApi.SystemDictType;
type DataRow = SystemDictApi.SystemDictData;

type TypeDragEnd = {
  dragRow: TypeRow;
  dragToChild?: boolean;
  newRow?: TypeRow;
  offsetIndex?: 0 | 1;
};

type DataDragEnd = {
  dragRow: DataRow;
  newRow?: DataRow;
  offsetIndex?: 0 | 1;
};

const route = useRoute();
const router = useRouter();
const dictStore = useDictStore();
const { hasAccessByCodes } = useAccess();

const selectedTypeCode = ref(
  String(route.query.styleCode ?? route.query.code ?? ''),
);
let typeTreeInitialized = false;

const [TypeFormModal, typeFormModalApi] = useVbenModal({
  connectedComponent: TypeForm,
  destroyOnClose: true,
});
const [DataFormModal, dataFormModalApi] = useVbenModal({
  connectedComponent: DataForm,
  destroyOnClose: true,
});

function selectType(styleCode: string, syncUrl = true) {
  selectedTypeCode.value = styleCode;
  if (syncUrl) {
    void router.replace({ query: styleCode ? { styleCode } : {} });
  }
}

function findTypeNode(
  rows: TypeRow[],
  styleCode: string,
): TypeRow | undefined {
  for (const row of rows) {
    if (row.styleCode === styleCode) {
      return row;
    }
    const found = findTypeNode(row.children ?? [], styleCode);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function syncCurrentTypeRow() {
  const grid = typeGridApi.grid;
  if (!grid || !selectedTypeCode.value) {
    return;
  }
  const data = (grid.getTableData()?.fullData ?? []) as TypeRow[];
  const row = findTypeNode(data, selectedTypeCode.value);
  if (row) {
    grid.setCurrentRow(row);
  }
}

function refreshTypeGrid() {
  void typeGridApi.query();
}

function refreshDataGrid() {
  void dataGridApi.query();
}

const [TypeGrid, typeGridApi] = useVbenVxeGrid({
  showSearchForm: false,
  formOptions: {
    collapsed: false,
    commonConfig: {
      formItemClass: 'pb-1',
      hideLabel: true,
    },
    schema: useTypeTreeFormSchema(),
    showCollapseButton: false,
    showDefaultActions: false,
    submitOnChange: true,
    wrapperClass: 'grid-cols-2',
  },
  gridEvents: {
    cellClick: ({ row }: { row?: TypeRow }) => {
      if (row?.styleCode) {
        selectType(row.styleCode);
      }
    },
    // Highlight the selected type once the tree data has actually loaded
    // (the initial selection happens before the first query resolves).
    dataChange: () => {
      syncCurrentTypeRow();
    },
    rowDragend: onTypeRowDragEnd,
  },
  gridOptions: {
    columns: useTypeColumns(onTypeActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues: Recordable<string>) => {
          const rows = await getDictTypeTree({
            styleCode: formValues?.styleCode,
            styleName: formValues?.styleName,
          });
          if (!typeTreeInitialized) {
            typeTreeInitialized = true;
            const wanted = String(
              route.query.styleCode ?? route.query.code ?? '',
            );
            const match =
              rows.find((row) => row.styleCode === wanted) ?? rows[0];
            if (match) {
              selectType(match.styleCode, false);
            }
          } else if (
            selectedTypeCode.value &&
            !rows.some((row) => row.styleCode === selectedTypeCode.value)
          ) {
            selectType('', false);
          }
          return rows;
        },
      },
    },
    rowConfig: {
      drag: true,
      isCurrent: true,
      keyField: 'styleCode',
    },
    rowDragConfig: {
      isAutoExpandToChild: true,
      isCrossDrag: true,
      isPeerDrag: true,
      isToChildDrag: true,
      showDragTip: true,
      showIcon: true,
      trigger: 'row',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    treeConfig: {
      childrenField: 'children',
      expandAll: true,
      parentField: 'parentStyleCode',
      rowField: 'styleCode',
      transform: true,
    },
  } as VxeTableGridOptions<TypeRow>,
});

const [DataGrid, dataGridApi] = useVbenVxeGrid({
  formOptions: {
    actionLayout: 'newLine',
    actionWrapperClass: 'pb-1',
    collapsed: true,
    commonConfig: {
      formItemClass: 'pb-1',
      labelClass: 'whitespace-nowrap',
      labelWidth: 130,
    },
    schema: useDataSearchFormSchema(),
    showCollapseButton: true,
    submitOnChange: true,
    wrapperClass: 'grid-cols-1 md:grid-cols-2',
  },
  gridEvents: {
    rowDragend: onDataRowDragEnd,
  },
  gridOptions: {
    columns: useDataColumns(onDataActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async (_params, formValues: Recordable<string>) => {
          if (!selectedTypeCode.value) {
            return [];
          }
          return await getDictDataList({
            styleCode: selectedTypeCode.value,
            subStyleName: formValues?.subStyleName,
            subStyleCode: formValues?.subStyleCode,
          });
        },
      },
    },
    rowConfig: {
      drag: true,
      isCurrent: true,
      keyField: 'subStyleCode',
    },
    rowDragConfig: {
      isCrossDrag: true,
      isPeerDrag: true,
      showDragTip: true,
      showIcon: true,
      trigger: 'row',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<DataRow>,
});

watch(selectedTypeCode, () => {
  syncCurrentTypeRow();
  refreshDataGrid();
});

async function onTypeRowDragEnd({
  dragRow,
  dragToChild,
  newRow,
  offsetIndex = 0,
}: TypeDragEnd) {
  if (!dragRow?.styleCode) {
    return;
  }

  const parentStyleCode =
    dragToChild && newRow?.styleCode
      ? newRow.styleCode
      : newRow?.parentStyleCode || dragRow.parentStyleCode || '0';
  const allRows = await getDictTypeTree();
  let targetIndex = -1;

  if (dragToChild && newRow?.styleCode) {
    const children = allRows.filter(
      (row) =>
        (row.parentStyleCode ?? '0') === newRow.styleCode &&
        row.styleCode !== dragRow.styleCode,
    );
    targetIndex = offsetIndex ? children.length : 0;
  } else if (newRow?.styleCode) {
    const siblings = allRows
      .filter(
        (row) =>
          (row.parentStyleCode ?? '0') === parentStyleCode &&
          row.styleCode !== dragRow.styleCode,
      )
      .toSorted(
        (a, b) =>
          a.displayOrder - b.displayOrder ||
          a.styleCode.localeCompare(b.styleCode),
      );
    const newIndex = siblings.findIndex(
      (row) => row.styleCode === newRow.styleCode,
    );
    if (newIndex >= 0) {
      targetIndex = newIndex + offsetIndex;
    }
  }

  if (targetIndex < 0) {
    const fullData = (typeGridApi.grid?.getTableData()?.fullData ??
      []) as TypeRow[];
    const parentNode =
      parentStyleCode === '0'
        ? undefined
        : findTypeNode(fullData, parentStyleCode);
    const siblings =
      parentStyleCode === '0' ? fullData : (parentNode?.children ?? []);
    targetIndex = siblings.findIndex(
      (row) => row.styleCode === dragRow.styleCode,
    );
  }
  if (targetIndex < 0) {
    return;
  }

  const hideLoading = toast.loading('Updating...');
  try {
    await moveDictType({
      styleCode: dragRow.styleCode,
      parentStyleCode,
      targetIndex,
    });
    dictStore.refreshDict();
    toast.success($t('ui.actionMessage.operationSuccess'), { id: hideLoading });
  } catch (error) {
    toast.error(
      (error as Error)?.message ?? $t('ui.actionMessage.operationFailed'),
      { id: hideLoading },
    );
  } finally {
    refreshTypeGrid();
  }
}

async function onDataRowDragEnd({
  dragRow,
  newRow,
  offsetIndex = 0,
}: DataDragEnd) {
  if (!dragRow?.subStyleCode || !selectedTypeCode.value) {
    return;
  }

  const rows = await getDictDataList({ styleCode: selectedTypeCode.value });
  const siblings = rows
    .filter((row) => row.subStyleCode !== dragRow.subStyleCode)
    .toSorted(
      (a, b) =>
        a.displayOrder - b.displayOrder ||
        a.subStyleCode.localeCompare(b.subStyleCode),
    );
  let targetIndex = siblings.length;

  if (newRow?.subStyleCode) {
    const newIndex = siblings.findIndex(
      (row) => row.subStyleCode === newRow.subStyleCode,
    );
    if (newIndex < 0) {
      return;
    }
    targetIndex = newIndex + offsetIndex;
  }

  const hideLoading = toast.loading('Updating...');
  try {
    await moveDictData({
      subStyleCode: dragRow.subStyleCode,
      targetIndex,
    });
    dictStore.refreshDict(selectedTypeCode.value);
    toast.success($t('ui.actionMessage.operationSuccess'), { id: hideLoading });
  } catch (error) {
    toast.error(
      (error as Error)?.message ?? $t('ui.actionMessage.operationFailed'),
      { id: hideLoading },
    );
  } finally {
    refreshDataGrid();
  }
}

function onTypeActionClick({
  code,
  row,
}: OnActionClickParams<TypeRow>) {
  switch (code) {
    case 'addData': {
      openDataForm(row.styleCode);
      break;
    }
    case 'delete': {
      void onDeleteType(row);
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
}: OnActionClickParams<DataRow>) {
  switch (code) {
    case 'delete': {
      void onDeleteData(row);
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

function openDataForm(styleCode: string) {
  dataFormModalApi.setData({ styleCode }).open();
}

function onCreateData() {
  if (!selectedTypeCode.value) {
    toast.info($t('system.dict.selectTypeFirst'));
    return;
  }
  openDataForm(selectedTypeCode.value);
}

async function onDeleteType(row: TypeRow) {
  try {
    await vbenConfirm({
      content: $t('system.dict.deleteTip'),
      title: $t('ui.actionTitle.delete', [row.styleName]),
    });
  } catch {
    return;
  }
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.styleName]),
  );
  try {
    await deleteDictType(row.styleCode);
    dictStore.refreshDict();
    toast.success($t('ui.actionMessage.deleteSuccess', [row.styleName]), {
      id: hideLoading,
    });
    if (selectedTypeCode.value === row.styleCode) {
      selectType('', false);
    }
    refreshTypeGrid();
  } catch (error) {
    toast.error(
      (error as Error)?.message ?? $t('ui.actionMessage.operationFailed'),
      { id: hideLoading },
    );
  }
}

async function onDeleteData(row: DataRow) {
  try {
    await vbenConfirm({
      content: $t('ui.actionMessage.deleteConfirm', [row.subStyleName]),
      title: $t('ui.actionTitle.delete', [row.subStyleName]),
    });
  } catch {
    return;
  }
  const hideLoading = toast.loading(
    $t('ui.actionMessage.deleting', [row.subStyleName]),
  );
  try {
    await deleteDictData(row.subStyleCode);
    dictStore.refreshDict(row.styleCode);
    toast.success($t('ui.actionMessage.deleteSuccess', [row.subStyleName]), {
      id: hideLoading,
    });
    refreshDataGrid();
  } catch (error) {
    toast.error(
      (error as Error)?.message ?? $t('ui.actionMessage.operationFailed'),
      { id: hideLoading },
    );
  }
}
</script>

<template>
  <ColPage auto-content-height>
    <TypeFormModal @success="refreshTypeGrid" />
    <DataFormModal @success="refreshDataGrid" />

    <template #left>
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
      </TypeGrid>
    </template>

    <DataGrid :table-title="$t('system.dict.dataList')">
      <template #toolbar-tools>
        <Button
          v-if="hasAccessByCodes(['SystemDict:create'])"
          :disabled="!selectedTypeCode"
          @click="onCreateData"
        >
          <Plus class="size-5" />
          {{ $t('system.dict.addData') }}
        </Button>
      </template>
    </DataGrid>
  </ColPage>
</template>
