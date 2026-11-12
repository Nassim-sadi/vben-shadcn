<script lang="ts" setup>
import type { LoginExpiredModeType } from '@vben/types';

import { Page } from '@vben/common-ui';
import { preferences, updatePreferences } from '@vben/preferences';

import { Button } from '@vben-core/shadcn-ui';

import { getMockStatusApi } from '#/api';
import { Card } from '#/components/ui/app';

async function handleClick(type: LoginExpiredModeType) {
  const loginExpiredMode = preferences.app.loginExpiredMode;

  updatePreferences({ app: { loginExpiredMode: type } });
  await getMockStatusApi('401');
  updatePreferences({ app: { loginExpiredMode } });
}
</script>

<template>
  <Page title="Login Expired Demo">
    <template #description>
      <div class="mt-2 text-foreground/80">
        When the API request encounters a 401 status code, re-login is required.
        There are two ways:
        <p>
          1. Go to the login page, and after successful login, jump back to the
          original page.
        </p>
        <p>
          2. Pop up the re-login dialog. After logging in and closing the
          dialog, no page jump is performed (it will still jump to the login
          page after refresh).
        </p>
      </div>
    </template>

    <Card class="mb-5" title="Redirect to Login Page Mode">
      <Button type="primary" @click="handleClick('page')">
        Click to Trigger
      </Button>
    </Card>
    <Card class="mb-5" title="Login Dialog Mode">
      <Button type="primary" @click="handleClick('modal')">
        Click to Trigger
      </Button>
    </Card>
  </Page>
</template>
