<script lang="ts" setup>
import type {
  VxeGridApi,
  VxeTableGridColumns,
} from '#/adapter/vxe-table';

import { toast } from 'vue-sonner';

import { IconifyIcon } from '@vben/icons';

import { Button } from '@vben-core/shadcn-ui';

import { useTableColumnWidths } from '#/adapter/vxe-table';
import { $t } from '#/locales';

type ColumnFactory = () => VxeTableGridColumns<any>;

interface Props {
  /** The grid api from useVbenVxeGrid. */
  gridApi: VxeGridApi<any, any, any, any, any>;
  /** Rebuilds the grid's default columns after saved widths are cleared. */
  columnsFactory: ColumnFactory;
}

const props = defineProps<Props>();
const { resetWidths } = useTableColumnWidths();

function onResetColumnWidths() {
  resetWidths();
  props.gridApi.setGridOptions({ columns: props.columnsFactory() });
  toast.success($t('common.reset'));
}
</script>

<template>
  <Button
    variant="ghost"
    :title="$t('ui.actionTitle.resetColumnWidth')"
    @click="onResetColumnWidths"
  >
    <IconifyIcon class="size-5" icon="lucide:columns-3" />
    {{ $t('ui.actionTitle.resetColumnWidth') }}
  </Button>
</template>
