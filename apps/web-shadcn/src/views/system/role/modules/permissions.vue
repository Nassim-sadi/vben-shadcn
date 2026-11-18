<script lang="ts" setup>
import type { SystemRoleApi } from '#/api/system/role';

import { ref } from 'vue';

import { Tree, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { getMenuList } from '#/api/system/menu';
import { updateRolePermissions } from '#/api/system/role';
import { Spin } from '#/components/ui/app';
import { $t } from '#/locales';

interface DataNode {
  children?: DataNode[];
  [key: string]: any;
}

const emit = defineEmits(['success']);

const role = ref<SystemRoleApi.SystemRole>();
const checkedKeys = ref<Array<number | string>>([]);
const treeData = ref<DataNode[]>([]);
const loadingTree = ref(false);

const [Modal, modalApi] = useVbenModal<null | SystemRoleApi.SystemRole>({
  async onConfirm() {
    if (!role.value) return;
    modalApi.lock();
    try {
      await updateRolePermissions(
        role.value.id,
        checkedKeys.value as string[],
      );
      modalApi.close();
      emit('success');
    } finally {
      modalApi.lock(false);
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    role.value = modalApi.getData() ?? undefined;
    checkedKeys.value = [...(role.value?.permissions ?? [])];

    if (treeData.value.length === 0) {
      loadingTree.value = true;
      try {
        treeData.value = (await getMenuList()) as unknown as DataNode[];
      } finally {
        loadingTree.value = false;
      }
    }
  },
});

defineExpose({ modalApi });
</script>
<template>
  <Modal
    :confirm-text="$t('common.save')"
    :title="$t('system.role.setPermissions')"
    class="w-full max-w-100"
  >
    <Spin :spinning="loadingTree" class="w-full">
      <Tree
        v-model="checkedKeys"
        :tree-data="treeData"
        multiple
        bordered
        :default-expanded-level="2"
        value-field="id"
        label-field="meta.title"
        icon-field="meta.icon"
      >
        <template #node="{ value }">
          <IconifyIcon v-if="value.meta?.icon" :icon="value.meta.icon" />
          {{ $t(value.meta?.title ?? '') }}
        </template>
      </Tree>
    </Spin>
  </Modal>
</template>
