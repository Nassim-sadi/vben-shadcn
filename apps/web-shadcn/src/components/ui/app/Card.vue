<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

defineProps<{ title?: string }>();
</script>

<template>
  <Card v-bind="$attrs">
    <CardHeader v-if="title || $slots.title || $slots.header">
      <slot name="header">
        <CardTitle>
          <slot name="title">{{ title }}</slot>
        </CardTitle>
      </slot>
    </CardHeader>
    <CardContent>
      <slot></slot>
    </CardContent>
  </Card>
</template>
