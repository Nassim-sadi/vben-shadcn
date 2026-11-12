<script lang="ts" setup>
import { computed } from 'vue';

import SelectField from './SelectField.vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    fieldNames?: { children?: string; label?: string; value?: string };
    modelValue?: any;
    treeData?: any[];
  }>(),
  {
    fieldNames: () => ({
      children: 'children',
      label: 'label',
      value: 'value',
    }),
    modelValue: undefined,
    treeData: () => [],
  },
);

const emit = defineEmits<{
  'update:modelValue': [any];
}>();

/**
 * Flatten tree data to { label, value }, hierarchy expressed with full-width space indentation
 */
const flatOptions = computed(() => {
  const result: Array<{ label: string; value: any }> = [];
  const walk = (nodes: any[], depth: number) => {
    for (const node of nodes ?? []) {
      const value = node[props.fieldNames?.value ?? 'value'];
      const label = String(node[props.fieldNames?.label ?? 'label'] ?? '');
      result.push({
        label: `${'　'.repeat(depth)}${label}`,
        value,
      });
      const children = node[props.fieldNames?.children ?? 'children'];
      if (Array.isArray(children) && children.length > 0) {
        walk(children, depth + 1);
      }
    }
  };
  walk(props.treeData, 0);
  return result;
});
</script>

<template>
  <SelectField
    v-bind="$attrs"
    :field-names="{ label: 'label', value: 'value' }"
    :model-value="modelValue"
    :options="flatOptions"
    @update:model-value="(value) => emit('update:modelValue', value)"
  />
</template>
