<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import { computed } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@vben-core/shadcn-ui';

import { CalendarDate } from '@internationalized/date';
import dayjs from 'dayjs';

import { Calendar } from '#/components/ui/calendar';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: Dayjs | null;
    placeholder?: string;
  }>(),
  {
    modelValue: null,
    placeholder: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [Dayjs | null];
}>();

const display = computed(() =>
  props.modelValue ? dayjs(props.modelValue).format('YYYY-MM-DD') : '',
);

const calendarValue = computed(() => toCalendarDate(props.modelValue));

function toCalendarDate(value?: Dayjs | null): CalendarDate | null {
  const d = dayjs(value);
  if (!value || !d.isValid()) {
    return null;
  }
  return new CalendarDate(d.year(), d.month() + 1, d.date());
}

function toDayjs(value: CalendarDate): Dayjs | null {
  if (!value) {
    return null;
  }
  return dayjs(new Date(value.year, value.month - 1, value.day));
}

function onCalendarChange(value: any) {
  emit('update:modelValue', toDayjs(value));
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <div class="relative w-full">
        <Input
          :model-value="display"
          :placeholder="placeholder ?? 'YYYY-MM-DD'"
          class="pr-9"
          readonly
        />
        <IconifyIcon
          class="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2"
          icon="lucide:calendar"
        />
      </div>
    </PopoverTrigger>
    <PopoverContent align="start" class="w-auto p-0">
      <Calendar
        :model-value="calendarValue"
        initial-focus
        @update:model-value="onCalendarChange"
      />
    </PopoverContent>
  </Popover>
</template>
