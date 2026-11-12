<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

defineProps<{ spinning?: boolean }>();
</script>

<template>
  <div class="relative">
    <slot></slot>
    <div
      v-if="spinning"
      class="bg-background/60 absolute inset-0 flex items-center justify-center"
    >
      <IconifyIcon
        class="text-primary size-5 animate-spin"
        icon="lucide:loader-circle"
      />
    </div>
  </div>
</template>
