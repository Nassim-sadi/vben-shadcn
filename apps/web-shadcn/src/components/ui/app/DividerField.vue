<script lang="ts" setup>
import { Separator } from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

defineProps<{ label?: string }>();
</script>

<template>
  <div v-if="label" class="flex items-center gap-3">
    <Separator v-bind="$attrs" class="flex-1" />
    <span class="text-muted-foreground text-xs">{{ label }}</span>
    <Separator class="flex-1" />
  </div>
  <Separator v-else v-bind="$attrs" />
</template>
