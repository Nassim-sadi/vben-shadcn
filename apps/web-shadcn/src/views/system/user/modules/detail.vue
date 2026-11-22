<script lang="ts" setup>
import type { DescriptionsItemType } from '@vben/common-ui';

import type { SystemUserApi } from '#/api/system/user';

import { computed, ref } from 'vue';

import { useVbenModal, VbenDescriptions } from '@vben/common-ui';

import { $t } from '#/locales';

import { useDescriptionItems } from '../data';

const detailData = ref<SystemUserApi.SystemUser>();

const items = computed<DescriptionsItemType[]>(() =>
  useDescriptionItems(detailData.value),
);

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
