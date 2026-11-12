<script lang="ts" setup>
import type { DataDisplayApi } from '#/api/data-display';

import { computed, nextTick, ref } from 'vue';
import { toast } from 'vue-sonner';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createDataDisplayItem,
  updateDataDisplayItem,
} from '#/api/data-display';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<DataDisplayApi.Item>();
const id = ref<string>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer<DataDisplayApi.Item | null>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      if (id.value) {
        await updateDataDisplayItem(id.value, values);
        toast.success($t('ui.actionMessage.operationSuccess'));
      } else {
        await createDataDisplayItem(values as any);
        toast.success($t('ui.actionMessage.operationSuccess'));
      }
      emits('success');
      drawerApi.close();
    } catch (error) {
      console.error(error);
    } finally {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      formApi.reset();

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        formData.value = undefined;
        id.value = undefined;
      }

      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

defineExpose({ drawerApi });

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('page.dataDisplay.edit')
    : $t('page.dataDisplay.addNew');
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
