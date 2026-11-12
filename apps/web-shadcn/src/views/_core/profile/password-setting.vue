<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed } from 'vue';
import { toast } from 'vue-sonner';

import { ProfilePasswordSetting, z } from '@vben/common-ui';

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: 'Old Password',
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: 'Please enter old password',
      },
    },
    {
      fieldName: 'newPassword',
      label: 'New Password',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: 'Please enter new password',
      },
    },
    {
      fieldName: 'confirmPassword',
      label: 'Confirm Password',
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: 'Please enter new password again',
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({ error: 'Please enter new password again' })
            .min(1, { message: 'Please enter new password again' })
            .refine((value) => value === newPassword, {
              message: 'The two passwords entered are inconsistent',
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

function handleSubmit() {
  toast.success('Password changed successfully');
}
</script>
<template>
  <ProfilePasswordSetting
    class="w-1/3"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
