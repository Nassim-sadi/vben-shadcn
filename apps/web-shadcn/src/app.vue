<script lang="ts" setup>
import { Toaster } from '#/components/ui/sonner';

defineOptions({ name: 'App' });
</script>

<template>
  <RouterView />
  <Toaster position="top-center" />
</template>
