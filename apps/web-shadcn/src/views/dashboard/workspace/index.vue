<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchQuickNav,
  WorkbenchTodo,
  WorkbenchTrends,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { $t } from '#/locales';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';

const userStore = useUserStore();

// This is example data, adjust according to actual situation in real projects.
// URL can also be an internal route, recognized and handled in the navTo method for internal navigation.
// Example: url: /dashboard/workspace
const projectItems: WorkbenchProjectItem[] = [
  {
    color: '',
    content: $t('page.dashboard.workspace.contentQuote1'),
    date: '2021-04-01',
    group: $t('page.dashboard.workspace.groupOpenSource'),
    icon: 'carbon:logo-github',
    title: 'Github',
    url: 'https://github.com',
  },
  {
    color: '#3fb27f',
    content: $t('page.dashboard.workspace.contentQuote2'),
    date: '2021-04-01',
    group: $t('page.dashboard.workspace.groupAlgorithm'),
    icon: 'ion:logo-vue',
    title: 'Vue',
    url: 'https://vuejs.org',
  },
  {
    color: '#e18525',
    content: $t('page.dashboard.workspace.contentQuote3'),
    date: '2021-04-01',
    group: $t('page.dashboard.workspace.groupPartTime'),
    icon: 'ion:logo-html5',
    title: 'Html5',
    url: 'https://developer.mozilla.org/docs/Web/HTML',
  },
  {
    color: '#bf0c2c',
    content: $t('page.dashboard.workspace.contentQuote4'),
    date: '2021-04-01',
    group: 'UI',
    icon: 'ion:logo-angular',
    title: 'Angular',
    url: 'https://angular.io',
  },
  {
    color: '#00d8ff',
    content: $t('page.dashboard.workspace.contentQuote5'),
    date: '2021-04-01',
    group: $t('page.dashboard.workspace.groupTech'),
    icon: 'bx:bxl-react',
    title: 'React',
    url: 'https://reactjs.org',
  },
  {
    color: '#EBD94E',
    content: $t('page.dashboard.workspace.contentQuote6'),
    date: '2021-04-01',
    group: $t('page.dashboard.workspace.groupArch'),
    icon: 'ion:logo-javascript',
    title: 'Js',
    url: 'https://developer.mozilla.org/docs/Web/JavaScript',
  },
];

// Same here, URL can also be an external link starting with http
const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: $t('page.dashboard.workspace.navHome'),
    url: '/',
  },
  {
    color: '#bf0c2c',
    icon: 'ion:grid-outline',
    title: $t('page.dashboard.workspace.navDashboard'),
    url: '/dashboard',
  },
  {
    color: '#e18525',
    icon: 'ion:layers-outline',
    title: $t('page.dashboard.workspace.navComponents'),
    url: '/demos/features/icons',
  },
  {
    color: '#3fb27f',
    icon: 'ion:settings-outline',
    title: $t('page.dashboard.workspace.navSystem'),
    url: '/demos/features/login-expired', // This URL is an example, adjust according to actual situation in real projects
  },
  {
    color: '#4daf1bc9',
    icon: 'ion:key-outline',
    title: $t('page.dashboard.workspace.navPermissions'),
    url: '/demos/access/page-control',
  },
  {
    color: '#00d8ff',
    icon: 'ion:bar-chart-outline',
    title: $t('page.dashboard.workspace.navCharts'),
    url: '/analytics',
  },
];

const todoItems = ref<WorkbenchTodoItem[]>([
  {
    completed: false,
    content: $t('page.dashboard.workspace.taskReviewCode'),
    date: '2024-07-30 11:00:00',
    title: $t('page.dashboard.workspace.taskReviewCodeTitle'),
  },
  {
    completed: true,
    content: $t('page.dashboard.workspace.taskPerfOpt'),
    date: '2024-07-30 11:00:00',
    title: $t('page.dashboard.workspace.taskPerfOptTitle'),
  },
  {
    completed: false,
    content: $t('page.dashboard.workspace.taskSecurity'),
    date: '2024-07-30 11:00:00',
    title: $t('page.dashboard.workspace.taskSecurityTitle'),
  },
  {
    completed: false,
    content: $t('page.dashboard.workspace.taskDeps'),
    date: '2024-07-30 11:00:00',
    title: $t('page.dashboard.workspace.taskDepsTitle'),
  },
  {
    completed: false,
    content: $t('page.dashboard.workspace.taskUI'),
    date: '2024-07-30 11:00:00',
    title: $t('page.dashboard.workspace.taskUITitle'),
  },
]);
const trendItems: WorkbenchTrendItem[] = [
  {
    avatar: 'svg:avatar-1',
    content: $t('page.dashboard.workspace.taskCreated'),
    date: $t('page.dashboard.workspace.dateJustNow'),
    title: 'William',
  },
  {
    avatar: 'svg:avatar-2',
    content: $t('page.dashboard.workspace.taskFollowed', { name: 'William' }),
    date: $t('page.dashboard.workspace.date1HourAgo'),
    title: 'Awen',
  },
  {
    avatar: 'svg:avatar-3',
    content: $t('page.dashboard.workspace.taskPublished'),
    date: $t('page.dashboard.workspace.date1DayAgo'),
    title: 'Chris',
  },
  {
    avatar: 'svg:avatar-4',
    content: $t('page.dashboard.workspace.taskArticleVben'),
    date: $t('page.dashboard.workspace.date2DaysAgo'),
    title: 'Vben',
  },
  {
    avatar: 'svg:avatar-1',
    content: $t('page.dashboard.workspace.taskReplied', {
      name: 'Jack',
      title: 'How to optimize project?',
    }),
    date: $t('page.dashboard.workspace.date3DaysAgo'),
    title: 'Pete',
  },
  {
    avatar: 'svg:avatar-2',
    content: $t('page.dashboard.workspace.taskClosed', {
      title: 'How to run project?',
    }),
    date: $t('page.dashboard.workspace.date1WeekAgo'),
    title: 'Jack',
  },
  {
    avatar: 'svg:avatar-3',
    content: $t('page.dashboard.workspace.taskPublished'),
    date: $t('page.dashboard.workspace.date1WeekAgo'),
    title: 'William',
  },
  {
    avatar: 'svg:avatar-4',
    content: $t('page.dashboard.workspace.taskPushed'),
    date: '2021-04-01 20:00',
    title: 'William',
  },
  {
    avatar: 'svg:avatar-4',
    content: $t('page.dashboard.workspace.taskArticle', {
      title: 'How to write using Admin Vben',
    }),
    date: '2021-03-01 20:00',
    title: 'Vben',
  },
];

const router = useRouter();

// This is an example method, adjust according to actual situation in real projects.
// This is a sample method, adjust according to the actual project requirements
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        {{
          $t('page.dashboard.workspace.welcome', {
            name: userStore.userInfo?.realName,
          })
        }}
      </template>
      <template #description>
        {{ $t('page.dashboard.workspace.weather') }}
      </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject
          :items="projectItems"
          :title="$t('page.dashboard.workspace.cardTitle')"
          @click="navTo"
        />
        <WorkbenchTrends
          :items="trendItems"
          class="mt-5"
          :title="$t('page.dashboard.workspace.cardTrends')"
        />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="lg:mt-0"
          :title="$t('page.dashboard.workspace.cardNav')"
          @click="navTo"
        />
        <WorkbenchTodo
          :items="todoItems"
          class="mt-5"
          :title="$t('page.dashboard.workspace.cardTodo')"
        />
        <AnalysisChartCard
          class="mt-5"
          :title="$t('page.dashboard.workspace.cardVisitSource')"
        >
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
      </div>
    </div>
  </div>
</template>
