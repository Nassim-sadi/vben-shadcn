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

import { RangeCalendar } from '#/components/ui/range-calendar';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: [Dayjs, Dayjs] | null;
    placeholder?: string;
  }>(),
  {
    modelValue: null,
    placeholder: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [[Dayjs, Dayjs] | null];
}>();

const display = computed(() => {
  const [start, end] = props.modelValue ?? [];
  if (!start || !end) {
    return '';
  }
  return `${dayjs(start).format('YYYY-MM-DD')} ~ ${dayjs(end).format('YYYY-MM-DD')}`;
});

const calendarValue = computed(() => {
  const [start, end] = props.modelValue ?? [];
  if (!start || !end) {
    return null;
  }
  return {
    end: toCalendarDate(end),
    start: toCalendarDate(start),
  };
});

function toCalendarDate(value: Dayjs): CalendarDate {
  const d = dayjs(value);
  return new CalendarDate(d.year(), d.month() + 1, d.date());
}

function toDayjs(value: CalendarDate): Dayjs {
  return dayjs(new Date(value.year, value.month - 1, value.day));
}

function onCalendarChange(value: any) {
  const start = value?.start;
  const end = value?.end;
  if (!start || !end) {
    emit('update:modelValue', null);
    return;
  }
  emit('update:modelValue', [toDayjs(start), toDayjs(end)]);
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <div class="relative w-full">
        <Input
          :model-value="display"
          :placeholder="placeholder ?? 'YYYY-MM-DD ~ YYYY-MM-DD'"
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
      <RangeCalendar
        :model-value="calendarValue"
        initial-focus
        @update:model-value="onCalendarChange"
      />
    </PopoverContent>
  </Popover>
</template>
