<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

import { Input } from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

const props = defineProps<{ modelValue?: string }>();

const emit = defineEmits<{
  'update:modelValue': [string];
}>();
</script>

<template>
  <div class="relative">
    <IconifyIcon
      class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
      icon="lucide:search"
    />
    <Input
      v-bind="$attrs"
      :model-value="props.modelValue"
      class="pl-9"
      @update:model-value="
        (value) => emit('update:modelValue', String(value ?? ''))
      "
    />
  </div>
</template>
