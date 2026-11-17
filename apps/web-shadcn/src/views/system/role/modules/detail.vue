<script lang="ts" setup>
import type { DescriptionsItemType } from '@vben/common-ui';

import type { SystemRoleApi } from '#/api/system/role';

import { computed, h, ref } from 'vue';

import { useVbenModal, VbenDescriptions } from '@vben/common-ui';

import { Tag } from '#/components/ui/app';
import { $t } from '#/locales';

const detailData = ref<SystemRoleApi.SystemRole>();

const items = computed<DescriptionsItemType[]>(() => {
  const row = detailData.value;
  const enabled = row?.status === 1;
  const permissions = row?.permissions ?? [];
  return [
    { label: $t('system.role.roleName'), content: row?.name },
    { label: $t('system.role.id'), content: row?.id },
    {
      label: $t('system.role.status'),
      content: () =>
        h(
          Tag,
          { color: enabled ? 'success' : 'error' },
          {
            default: () =>
              enabled ? $t('common.enabled') : $t('common.disabled'),
          },
        ),
    },
    {
      label: $t('system.role.setPermissions'),
      content: permissions.length > 0 ? permissions.join(', ') : '-',
    },
    { label: $t('system.role.createTime'), content: row?.createTime },
    { label: $t('system.role.remark'), content: row?.remark },
  ];
});

const [Modal, modalApi] = useVbenModal<SystemRoleApi.SystemRole>({
  onOpenChange(isOpen) {
    if (isOpen) {
      detailData.value = modalApi.getData();
    }
  },
});

defineExpose({ modalApi });
</script>
<template>
  <Modal :footer="false" :title="$t('common.detail')" class="w-full max-w-125">
    <VbenDescriptions bordered :column="1" :items="items" />
  </Modal>
</template>
