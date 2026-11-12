<script setup lang="ts">
import { computed } from 'vue';

import { ProfileSecuritySetting } from '@vben/common-ui';

const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: 'Account Password',
      description: 'Current password strength: Strong',
    },
    {
      value: true,
      fieldName: 'securityPhone',
      label: 'Security Phone',
      description: 'Bound phone: 138****8293',
    },
    {
      value: true,
      fieldName: 'securityQuestion',
      label: 'Security Question',
      description:
        'Security question not set, security questions can effectively protect account security',
    },
    {
      value: true,
      fieldName: 'securityEmail',
      label: 'Backup Email',
      description: 'Bound email: ant***sign.com',
    },
    {
      value: false,
      fieldName: 'securityMfa',
      label: 'MFA Device',
      description:
        'MFA device not bound, can perform secondary confirmation after binding',
    },
  ];
});
</script>
<template>
  <ProfileSecuritySetting :form-schema="formSchema" />
</template>
