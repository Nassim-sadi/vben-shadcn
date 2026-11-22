<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { computed, useAttrs } from 'vue';

import { Textarea } from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    maxlength?: number;
    modelValue?: string;
    rows?: number;
    showCount?: boolean;
  }>(),
  {
    maxlength: undefined,
    modelValue: undefined,
    rows: 4,
    showCount: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [string];
}>();

const attrs = useAttrs();

const classes = computed(() => (attrs.class as HTMLAttributes['class']) ?? '');

const count = computed(() => String(props.modelValue ?? '').length);
</script>

<template>
  <div class="relative w-full">
    <Textarea
      v-bind="$attrs"
      :class="[classes, showCount ? 'pb-6' : '']"
      :maxlength="maxlength"
      :model-value="modelValue ?? ''"
      :rows="rows"
      @update:model-value="
        (value) => emit('update:modelValue', String(value ?? ''))
      "
    />
    <span
      v-if="showCount && maxlength"
      class="text-muted-foreground absolute right-3 bottom-2 text-xs"
    >
      {{ count }}/{{ maxlength }}
    </span>
  </div>
</template>
