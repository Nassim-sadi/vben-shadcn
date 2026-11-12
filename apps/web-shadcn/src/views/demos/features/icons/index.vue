<script lang="ts" setup>
import { ref } from 'vue';

import { IconPicker, Page } from '@vben/common-ui';
import {
  MdiKeyboardEsc,
  SvgAvatar1Icon,
  SvgAvatar2Icon,
  SvgAvatar3Icon,
  SvgAvatar4Icon,
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
  SvgGithubIcon,
  SvgGoogleIcon,
  SvgQQChatIcon,
  SvgWeChatIcon,
} from '@vben/icons';

import { Card } from '#/components/ui/app';

const iconValue1 = ref('ant-design:trademark-outlined');
const iconValue2 = ref('svg:avatar-1');
const iconValue3 = ref('mdi:alien-outline');
const iconValue4 = ref('mdi-light:book-multiple');
</script>

<template>
  <Page title="Icons">
    <template #description>
      <div class="mt-2 text-foreground/80">
        Icons can be found at
        <a
          class="text-primary"
          href="https://icon-sets.iconify.design/"
          target="_blank"
        >
          Iconify
        </a>
        , supporting multiple icon libraries such as Material Design, Font
        Awesome, Jam Icons, etc.
      </div>
    </template>

    <Card class="mb-5" title="Iconify">
      <div class="flex items-center gap-5">
        <SvgGithubIcon class="size-8" />
        <SvgGoogleIcon class="size-8" />
        <SvgQQChatIcon class="size-8" />
        <SvgWeChatIcon class="size-8" />
        <MdiKeyboardEsc class="size-8" />
      </div>
    </Card>

    <Card class="mb-5" title="Svg Icons">
      <div class="flex items-center gap-5">
        <SvgAvatar1Icon class="size-8" />
        <SvgAvatar2Icon class="size-8 text-red-500" />
        <SvgAvatar3Icon class="size-8 text-green-500" />
        <SvgAvatar4Icon class="size-8" />
        <SvgCakeIcon class="size-8" />
        <SvgBellIcon class="size-8" />
        <SvgCardIcon class="size-8" />
        <SvgDownloadIcon class="size-8" />
      </div>
    </Card>

    <Card class="mb-5" title="Tailwind CSS">
      <div class="flex items-center gap-5 text-3xl">
        <span class="icon-[ant-design--alipay-circle-outlined]"></span>
        <span class="icon-[ant-design--account-book-filled]"></span>
        <span class="icon-[ant-design--container-outlined]"></span>
        <span class="icon-[svg-spinners--wind-toy]"></span>
        <span class="icon-[svg-spinners--blocks-wave]"></span>
        <span class="icon-[line-md--compass-filled-loop]"></span>
      </div>
    </Card>

    <Card class="mb-5" title="Icon Picker">
      <div class="mb-5 flex items-center gap-5">
        <span>Original Style (Iconify):</span>
        <IconPicker v-model="iconValue1" class="w-50" />
      </div>
      <div class="mb-5 flex items-center gap-5">
        <span>Original Style (svg):</span>
        <IconPicker v-model="iconValue2" class="w-50" prefix="svg" />
      </div>
      <div class="mb-5 flex items-center gap-5">
        <span>Custom Input:</span>
        <IconPicker v-model="iconValue3" class="w-50" prefix="mdi" />
      </div>
      <div class="flex items-center gap-5">
        <span>Displayed as an Icon:</span>
        <IconPicker v-model="iconValue4" prefix="mdi-light" type="icon" />
      </div>
    </Card>
  </Page>
</template>
