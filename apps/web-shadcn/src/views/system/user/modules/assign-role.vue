<script lang="ts" setup>
import type { SystemRoleApi } from '#/api/system/role';
import type { SystemUserApi } from '#/api/system/user';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { getRoleList } from '#/api/system/role';
import { assignUserRole } from '#/api/system/user';
import { SelectField, Spin } from '#/components/ui/app';
import { $t } from '#/locales';

const emit = defineEmits(['success']);

const user = ref<SystemUserApi.SystemUser>();
const roleOptions = ref<Array<{ label: string; value: string }>>([]);
const selectedRoleCode = ref<string>('');
const loadingRoles = ref(false);
const loading = ref(false);

const [Modal, modalApi] = useVbenModal<null | SystemUserApi.SystemUser>({
  async onConfirm() {
    if (!user.value || !selectedRoleCode.value) return;
    modalApi.lock();
    loading.value = true;
    try {
      await assignUserRole(user.value.userCode, selectedRoleCode.value);
      modalApi.close();
      emit('success');
    } finally {
      modalApi.lock(false);
      loading.value = false;
    }
  },
  async onOpenChange(isOpen) {
    if (!isOpen) return;
    user.value = modalApi.getData() ?? undefined;
    selectedRoleCode.value = '';
    if (roleOptions.value.length === 0) {
      loadingRoles.value = true;
      try {
        const roles = (await getRoleList({})) as
          | SystemRoleApi.SystemRole[]
          | { items: SystemRoleApi.SystemRole[]; total: number };
        const roleList = Array.isArray(roles) ? roles : (roles?.items ?? []);
        roleOptions.value = roleList
          .filter((role) => role.roleCode)
          .map((role) => ({
            label: role.name,
            value: role.roleCode as string,
          }));
      } finally {
        loadingRoles.value = false;
      }
    }
  },
});

defineExpose({ modalApi });
</script>
<template>
  <Modal :confirm-text="$t('common.save')" :title="$t('system.user.assignRole')" class="w-full max-w-96">
    <Spin :spinning="loadingRoles || loading" class="w-full">
      <SelectField
        v-model="selectedRoleCode"
        :options="roleOptions"
        :placeholder="$t('system.user.selectRole')"
        class="w-full"
      />
    </Spin>
  </Modal>
</template>
