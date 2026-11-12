<script lang="ts" setup>
import { computed } from 'vue';

import {
  RadioGroup,
  RadioGroupItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Compatible with antd buttonStyle, use button group style after configuration */
    buttonStyle?: string;
    fieldNames?: { label?: string; value?: string };
    modelValue?: any;
    optionType?: 'button' | 'default';
    options?: any[];
  }>(),
  {
    buttonStyle: undefined,
    fieldNames: () => ({ label: 'label', value: 'value' }),
    modelValue: undefined,
    optionType: 'default',
    options: () => [],
  },
);

const emit = defineEmits<{
  'update:modelValue': [any];
}>();

const useButtonGroup = computed(
  () => props.optionType === 'button' || Boolean(props.buttonStyle),
);

const normalizedOptions = computed(() =>
  (props.options ?? []).map((item) => ({
    label: String(item[props.fieldNames?.label ?? 'label'] ?? ''),
    value: item[props.fieldNames?.value ?? 'value'],
  })),
);

const internalValue = computed(() =>
  props.modelValue === null || props.modelValue === undefined
    ? ''
    : String(props.modelValue),
);

function onUpdate(value: any) {
  const matched = normalizedOptions.value.find(
    (item) => String(item.value) === String(value),
  );
  emit('update:modelValue', matched ? matched.value : value);
}
</script>

<template>
  <ToggleGroup
    v-if="useButtonGroup"
    :model-value="internalValue"
    type="single"
    variant="outline"
    @update:model-value="onUpdate"
  >
    <ToggleGroupItem
      v-for="item in normalizedOptions"
      :key="String(item.value)"
      :value="String(item.value)"
      size="sm"
    >
      {{ item.label }}
    </ToggleGroupItem>
  </ToggleGroup>
  <RadioGroup
    v-else
    :model-value="internalValue"
    @update:model-value="onUpdate"
  >
    <div class="flex flex-wrap items-center gap-4">
      <div
        v-for="item in normalizedOptions"
        :key="String(item.value)"
        class="flex items-center gap-2"
      >
        <RadioGroupItem :value="String(item.value)" />
        <span class="text-sm">{{ item.label }}</span>
      </div>
    </div>
  </RadioGroup>
</template>
