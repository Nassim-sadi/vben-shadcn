<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { computed, useAttrs } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    allowClear?: boolean;
    disabled?: boolean;
    fieldNames?: { label?: string; value?: string };
    modelValue?: any;
    options?: any[];
    placeholder?: string;
  }>(),
  {
    allowClear: false,
    disabled: false,
    fieldNames: () => ({ label: 'label', value: 'value' }),
    modelValue: undefined,
    options: () => [],
    placeholder: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [any];
}>();

const attrs = useAttrs();

function get(item: any, path: string) {
  let acc = item;
  for (const key of path.split('.')) {
    acc = acc?.[key];
  }
  return acc;
}

const normalizedOptions = computed(() =>
  (props.options ?? []).map((item) => ({
    label: String(get(item, props.fieldNames?.label ?? 'label') ?? ''),
    value: get(item, props.fieldNames?.value ?? 'value'),
  })),
);

const internalValue = computed(() => {
  const matched = normalizedOptions.value.find(
    (item) => String(item.value) === String(props.modelValue),
  );
  if (matched) {
    return String(matched.value);
  }
  if (props.modelValue === null || props.modelValue === undefined) {
    return '';
  }
  return String(props.modelValue);
});

function onSelect(value: any) {
  const matched = normalizedOptions.value.find(
    (item) => String(item.value) === String(value),
  );
  emit('update:modelValue', matched ? matched.value : value);
}
function onClear() {
  emit('update:modelValue', undefined);
}

const triggerClass = computed(
  () => (attrs.class as HTMLAttributes['class']) ?? '',
);
</script>

<template>
  <div class="relative">
    <Select
      :model-value="internalValue"
      :disabled="disabled"
      @update:model-value="onSelect"
    >
      <SelectTrigger :class="[triggerClass, allowClear ? 'pr-8' : '']">
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="item in normalizedOptions"
          :key="String(item.value)"
          :value="String(item.value)"
        >
          {{ item.label }}
        </SelectItem>
      </SelectContent>
    </Select>
    <button
      v-if="allowClear && modelValue != null"
      class="hover:bg-accent absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5"
      type="button"
      @click.stop="onClear"
    >
      <IconifyIcon class="text-muted-foreground size-3.5" icon="lucide:x" />
    </button>
  </div>
</template>
