<script lang="ts" setup>
import type { SystemDictApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { useDictStore } from '@vben/stores';

import { useVbenForm } from '#/adapter/form';
import { createDictData, updateDictData } from '#/api';
import { $t } from '#/locales';

import { useDataFormSchema } from '../data';

const emit = defineEmits<{
  success: [];
}>();
const dictStore = useDictStore();
const formData = ref<SystemDictApi.SystemDictData>();
type DictDataModalData =
  | Pick<SystemDictApi.SystemDictData, 'styleCode'>
  | SystemDictApi.SystemDictData;

const getTitle = computed(() => {
  return formData.value?.subStyleCode
    ? $t('ui.actionTitle.edit', [$t('system.dict.subStyleName')])
    : $t('ui.actionTitle.create', [$t('system.dict.subStyleName')]);
});

const [Form, formApi] = useVbenForm({
  commonConfig: { labelWidth: 'auto' },
  schema: useDataFormSchema(() => formData.value?.subStyleCode),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal<DictDataModalData>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    const values = (await formApi.getValues()) as Omit<
      SystemDictApi.SystemDictData,
      | 'createTime'
      | 'createUserCode'
      | 'createUserName'
      | 'id'
      | 'updateTime'
      | 'updateUserCode'
      | 'updateUserName'
    >;
    try {
      if (formData.value?.subStyleCode) {
        await updateDictData(formData.value.subStyleCode, values);
      } else {
        await createDictData(values);
      }
      dictStore.refreshDict(values.styleCode);
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
        formData.value = 'subStyleCode' in data ? data : undefined;
        formApi.setValues(data);
      } else {
        formData.value = undefined;
        formApi.reset();
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
