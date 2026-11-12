<script setup lang="ts">
import { computed } from 'vue';

import { ProfileNotificationSetting } from '@vben/common-ui';

const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: 'Account Password',
      description: "Other users' messages will be notified via station mail",
    },
    {
      value: true,
      fieldName: 'systemMessage',
      label: 'System Message',
      description: 'System messages will be notified via station mail',
    },
    {
      value: true,
      fieldName: 'todoTask',
      label: 'To-do Task',
      description: 'To-do tasks will be notified via station mail',
    },
  ];
});
</script>
<template>
  <ProfileNotificationSetting :form-schema="formSchema" />
</template>
