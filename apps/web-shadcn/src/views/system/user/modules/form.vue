<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getMenuList } from '#/api/system/menu';
import { createUser, updateUser } from '#/api/system/user';
import { Spin } from '#/components/ui/app';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

interface DataNode {
  children?: DataNode[];
  [key: string]: any;
}

const emits = defineEmits(['success']);

const formData = ref<SystemUserApi.SystemUser>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);

const userCode = ref();
const [Modal, modalApi] = useVbenModal<null | SystemUserApi.SystemUser>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    modalApi.lock();
    (userCode.value ? updateUser(userCode.value, values) : createUser(values))
      .then(() => {
        emits('success');
        modalApi.close();
      })
      .catch(() => {
        modalApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData();
      formApi.reset();

      if (data) {
        formData.value = data;
        userCode.value = data.userCode;
      } else {
        formData.value = undefined;
        userCode.value = undefined;
      }

      if (permissions.value.length === 0) {
        await loadPermissions();
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

defineExpose({ modalApi });

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getMenuList();
    permissions.value = res as unknown as DataNode[];
  } finally {
    loadingPermissions.value = false;
  }
}

const getModalTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Modal :title="getModalTitle">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" class="w-full">
          <Tree
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps.componentProps"
            value-field="id"
            label-field="name"
          />
        </Spin>
      </template>
    </Form>
  </Modal>
</template>
