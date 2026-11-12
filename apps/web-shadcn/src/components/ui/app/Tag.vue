<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { computed, useAttrs } from 'vue';

import { Badge } from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

const props = defineProps<{ color?: string }>();

const attrs = useAttrs();

/**
 * antd Tag color semantics → shadcn Badge style
 */
const COLOR_CLASSES: Record<string, HTMLAttributes['class']> = {
  default: 'border-border bg-secondary text-secondary-foreground',
  error: 'border-red-200 bg-red-50 text-red-700',
  processing: 'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
};

const classes = computed(() => [
  COLOR_CLASSES[props.color ?? 'default'] ?? COLOR_CLASSES.default,
  (attrs.class as HTMLAttributes['class']) ?? '',
]);
</script>

<template>
  <Badge variant="outline" :class="classes">
    <slot></slot>
  </Badge>
</template>
