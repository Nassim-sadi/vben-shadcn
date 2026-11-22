<script lang="ts" setup>
import type { BaseClassesApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createClass, updateClass } from '#/api';
import { $t } from '#/locales';

import { useClassesFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();

const formData = ref<BaseClassesApi.BaseClass>();

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.classes.name')])
    : $t('ui.actionTitle.create', [$t('system.classes.name')]);
});

const [Form, formApi] = useVbenForm({
  commonConfig: { labelWidth: 'auto' },
  schema: useClassesFormSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal<null | BaseClassesApi.BaseClass>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    const formValues = await formApi.getValues();
    const values = {
      ...formValues,
      crossDay: formValues.crossDay ? '1' : '0',
    } as Omit<BaseClassesApi.BaseClass, 'createTime' | 'id'>;
    try {
      await (formData.value?.id
        ? updateClass(formData.value.classesCode, values)
        : createClass(values));
      modalApi.close();
      emit('success');
    } finally {
      modalApi.lock(false);
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData();
      if (data) {
        formData.value = data;
        formApi.setValues({ ...data, crossDay: data.crossDay === '1' });
      } else {
        formData.value = undefined;
      }
    }
  },
});

defineExpose({ modalApi });
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
  </Modal>
</template>
