<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { computed, useAttrs } from 'vue';

import { Input } from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    max?: number;
    min?: number;
    modelValue?: number;
    step?: number;
  }>(),
  {
    max: undefined,
    min: undefined,
    modelValue: undefined,
    step: 1,
  },
);

const emit = defineEmits<{
  'update:modelValue': [number | undefined];
}>();

const attrs = useAttrs();

const classes = computed(() => (attrs.class as HTMLAttributes['class']) ?? '');

function onInput(value: number | string) {
  if (value === '' || value === undefined || value === null) {
    emit('update:modelValue', undefined);
    return;
  }
  const parsed = Number(value);
  emit('update:modelValue', Number.isNaN(parsed) ? undefined : parsed);
}
</script>

<template>
  <Input
    v-bind="$attrs"
    :class="classes"
    :max="max"
    :min="min"
    :model-value="modelValue ?? ''"
    :step="step"
    type="number"
    @update:model-value="onInput"
  />
</template>
