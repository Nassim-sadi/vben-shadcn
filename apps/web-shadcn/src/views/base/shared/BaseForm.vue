<script lang="ts" setup>
import type { BaseDataApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createBase, updateBase } from '#/api';
import { $t } from '#/locales';

import { getBaseModuleConfig } from './config';

interface ModalData {
  module: string;
  row?: BaseDataApi.BaseRecord;
}

const emit = defineEmits<{
  success: [];
}>();

const modalData = ref<ModalData>();

const [Form, formApi] = useVbenForm({
  commonConfig: { labelWidth: 'auto' },
  schema: [],
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal<ModalData | null>({
  async onConfirm() {
    const payload = modalApi.getData();
    const config = getBaseModuleConfig(payload?.module ?? '');
    if (!payload || !config) {
      return;
    }

    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    modalApi.lock();
    const values = await formApi.getValues();
    const body = { ...values } as Record<string, any>;
    try {
      if (payload.row) {
        const key = config.keyFields
          .map((field) => String(payload.row?.[field] ?? values[field] ?? ''))
          .join('|');
        await updateBase(config.key, key, body);
      } else {
        await createBase(config.key, body);
      }
      modalApi.close();
      emit('success');
    } finally {
      modalApi.lock(false);
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    const payload = modalApi.getData();
    const config = getBaseModuleConfig(payload?.module ?? '');
    if (!payload || !config) {
      return;
    }

    modalData.value = payload;
    formApi.updateSchema(config.form() as any);
    await formApi.reset();
    formApi.setValues(payload.row ?? {});
  },
});

const title = computed(() => {
  const config = getBaseModuleConfig(modalData.value?.module ?? '');
  if (!config) {
    return '';
  }
  return modalData.value?.row
    ? $t('ui.actionTitle.edit', [$t(config.nameKey)])
    : $t('ui.actionTitle.create', [$t(config.nameKey)]);
});

defineExpose({ modalApi });
</script>

<template>
  <Modal :title="title">
    <Form class="mx-4" />
  </Modal>
</template>
