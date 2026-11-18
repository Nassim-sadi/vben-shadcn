<script lang="ts" setup>
import type { VxeGridApi } from '#/adapter/vxe-table';

import { computed, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@vben-core/shadcn-ui';

interface Props {
  /** The grid api from useVbenVxeGrid. */
  gridApi: VxeGridApi<any, any, any, any, any>;
  /** Column fields to hide from the menu (e.g. action columns). */
  exclude?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  exclude: () => ['operation'],
});

interface SortOption {
  field: string;
  order: 'asc' | 'desc';
  title: string;
}

const open = ref(false);

/** Read the grid's live columns so titles stay in sync with the locale. */
const options = computed<SortOption[]>(() => {
  const grid = props.gridApi.grid;
  const columns = (grid?.getColumns?.() ?? []) as Array<{
    field?: string;
    title?: string;
  }>;
  const result: SortOption[] = [];
  for (const column of columns) {
    if (!column.field || props.exclude.includes(column.field)) continue;
    result.push({
      field: column.field,
      order: 'asc',
      title: column.title ?? column.field,
    });
    result.push({
      field: column.field,
      order: 'desc',
      title: column.title ?? column.field,
    });
  }
  return result;
});

/** Current sort state, to highlight the active item and show "clear". */
const activeSort = ref<undefined | { field: string; order: string }>();

function onOpenChange(isOpen: boolean) {
  open.value = isOpen;
  if (isOpen) {
    const sortState = (props.gridApi.grid?.sortConfig as Array<{ field?: string; order?: string }> | undefined) ?? [];
    const first = sortState[0];
    activeSort.value =
      first?.field && first?.order
        ? { field: first.field, order: first.order }
        : undefined;
  }
}

function sortBy(option: SortOption) {
  activeSort.value = { field: option.field, order: option.order };
  props.gridApi.grid?.sort(option.field, option.order);
  open.value = false;
}

function clearSort() {
  activeSort.value = undefined;
  props.gridApi.grid?.clearSort();
  props.gridApi.query();
  open.value = false;
}
</script>

<template>
  <DropdownMenu @update:open="onOpenChange">
    <DropdownMenuTrigger as-child>
      <Button class="mr-2" size="icon" title="Sort" variant="outline">
        <IconifyIcon class="size-4" icon="lucide:arrow-up-down" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="max-h-80 w-56 overflow-y-auto">
      <template v-for="option in options" :key="`${option.field}:${option.order}`">
        <DropdownMenuItem
          :class="{
            'bg-accent text-accent-foreground':
              activeSort?.field === option.field &&
              activeSort?.order === option.order,
          }"
          @click="sortBy(option)"
        >
          <span class="flex-1 truncate">{{ option.title }}</span>
          <IconifyIcon
            class="size-4 shrink-0"
            :icon="option.order === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'"
          />
        </DropdownMenuItem>
      </template>
      <template v-if="activeSort">
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="clearSort">
          <span class="text-muted-foreground flex-1">Clear sort</span>
          <IconifyIcon class="size-4 shrink-0" icon="lucide:x" />
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
