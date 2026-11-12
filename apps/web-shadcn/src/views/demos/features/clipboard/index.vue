<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Input } from '@vben-core/shadcn-ui';

import { useClipboard } from '@vueuse/core';

import { Card } from '#/components/ui/app';

const source = ref('Hello');
const { copy, text } = useClipboard({ legacy: true, source });
</script>

<template>
  <Page title="Clipboard Demo">
    <Card title="Basic Usage">
      <p class="mb-3">
        Current copied: <code>{{ text || 'none' }}</code>
      </p>
      <div class="flex">
        <Input v-model="source" class="mr-3 flex w-50" />
        <Button @click="copy(source)"> Copy </Button>
      </div>
    </Card>
  </Page>
</template>
