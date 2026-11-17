<script lang="ts" setup>
import type { DescriptionsItemType } from '@vben/common-ui';

import type { SystemUserApi } from '#/api/system/user';

import { computed, h, ref } from 'vue';

import { useVbenModal, VbenDescriptions } from '@vben/common-ui';
import { useDictStore } from '@vben/stores';

import { Tag } from '#/components/ui/app';
import { $t } from '#/locales';

const USER_GENDER_CODE = 'user_gender';

const detailData = ref<SystemUserApi.SystemUser>();

const items = computed<DescriptionsItemType[]>(() => {
  const row = detailData.value;
  const dictStore = useDictStore();
  const enabled = row?.status === 1;
  return [
    { label: $t('system.user.name'), content: row?.name },
    { label: $t('system.user.userCode'), content: row?.userCode },
    { label: $t('system.user.id'), content: row?.id },
    { label: $t('system.user.dept'), content: row?.deptId },
    {
      label: $t('system.user.gender'),
      content: dictStore.getDictLabel(USER_GENDER_CODE, row?.gender),
    },
    {
      label: $t('system.user.status'),
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
    { label: $t('system.user.createTime'), content: row?.createTime },
    { label: $t('system.user.remark'), content: row?.remark },
  ];
});

const [Modal, modalApi] = useVbenModal<SystemUserApi.SystemUser>({
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
