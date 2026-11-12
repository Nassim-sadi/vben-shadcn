<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useTabs } from '@vben/hooks';

import { Button, Input } from '@vben-core/shadcn-ui';

import { Card } from '#/components/ui/app';

const router = useRouter();
const newTabTitle = ref('');

const {
  closeAllTabs,
  closeCurrentTab,
  closeLeftTabs,
  closeOtherTabs,
  closeRightTabs,
  closeTabByKey,
  refreshTab,
  resetTabTitle,
  setTabTitle,
} = useTabs();

function openTab() {
  // Route navigation, can also use path
  router.push({ name: 'VbenAbout' });
}

function openTabWithParams(id: number) {
  // Route navigation, can also use path
  router.push({ name: 'FeatureTabDetailDemo', params: { id } });
}

function reset() {
  newTabTitle.value = '';
  resetTabTitle();
}
</script>

<template>
  <Page description="For scenarios requiring tab operations" title="Tabs">
    <Card class="mb-5" title="Open/Close Tabs">
      <div class="mb-3 text-foreground/80">
        If the tab exists, switch directly. If not, open a new tab.
      </div>
      <div class="flex flex-wrap gap-3">
        <Button @click="openTab"> Open "About" Tab </Button>
        <Button @click="closeTabByKey('/vben-admin/about')">
          Close "About" Tab
        </Button>
      </div>
    </Card>

    <Card class="mb-5" title="Tab Operations">
      <div class="mb-3 text-foreground/80">
        For dynamically controlling various tab operations
      </div>
      <div class="flex flex-wrap gap-3">
        <Button @click="closeCurrentTab()"> Close Current Tab </Button>
        <Button @click="closeLeftTabs()"> Close Left Tabs </Button>
        <Button @click="closeRightTabs()"> Close Right Tabs </Button>
        <Button @click="closeAllTabs()"> Close All Tabs </Button>
        <Button @click="closeOtherTabs()"> Close Other Tabs </Button>
        <Button @click="refreshTab()"> Refresh Current Tab </Button>
      </div>
    </Card>

    <Card class="mb-5" title="Dynamic Title">
      <div class="mb-3 text-foreground/80">
        This operation does not affect the page title, only modifies the Tab
        title.
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <Input
          v-model="newTabTitle"
          class="w-40"
          placeholder="Please enter new title"
        />
        <Button @click="() => setTabTitle(newTabTitle)"> Modify </Button>
        <Button @click="reset"> Reset </Button>
      </div>
    </Card>

    <Card class="mb-5" title="Max Open Count">
      <div class="mb-3 text-foreground/80">
        Limit the maximum number of tabs opened with parameters, controlled by
        `route.meta.maxNumOfOpenTab`.
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <template v-for="item in 5" :key="item">
          <Button @click="openTabWithParams(item)">
            Open {{ item }} Detail Page
          </Button>
        </template>
      </div>
    </Card>
  </Page>
</template>
