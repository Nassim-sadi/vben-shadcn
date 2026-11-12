<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { computed, useAttrs } from 'vue';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@vben-core/shadcn-ui';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  cancelText?: string;
  description?: string;
  okText?: string;
  title?: string;
}>();

const emit = defineEmits<{
  confirm: [];
}>();

const attrs = useAttrs();

const buttonClasses = computed(
  () => (attrs.class as HTMLAttributes['class']) ?? '',
);
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <Button variant="link" size="sm" :class="buttonClasses">
        <slot></slot>
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ cancelText }}</AlertDialogCancel>
        <AlertDialogAction @click="emit('confirm')">
          {{ okText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
