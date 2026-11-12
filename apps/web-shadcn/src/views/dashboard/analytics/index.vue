<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import { $t } from '#/locales';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';

const overviewItems: AnalysisOverviewItem[] = [
  {
    icon: SvgCardIcon,
    title: $t('page.dashboard.analytics.index.usersTitle'),
    totalTitle: $t('page.dashboard.analytics.index.usersTotal'),
    totalValue: 120_000,
    value: 2000,
  },
  {
    icon: SvgCakeIcon,
    title: $t('page.dashboard.analytics.index.visitsTitle'),
    totalTitle: $t('page.dashboard.analytics.index.visitsTotal'),
    totalValue: 500_000,
    value: 20_000,
  },
  {
    icon: SvgDownloadIcon,
    title: $t('page.dashboard.analytics.index.downloadsTitle'),
    totalTitle: $t('page.dashboard.analytics.index.downloadsTotal'),
    totalValue: 120_000,
    value: 8000,
  },
  {
    icon: SvgBellIcon,
    title: $t('page.dashboard.analytics.index.usageTitle'),
    totalTitle: $t('page.dashboard.analytics.index.usageTotal'),
    totalValue: 50_000,
    value: 5000,
  },
];

const chartTabs: TabOption[] = [
  {
    label: $t('page.dashboard.analytics.index.trafficLabel'),
    value: 'trends',
  },
  {
    label: $t('page.dashboard.analytics.index.monthlyVisitsLabel'),
    value: 'visits',
  },
];
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard
        class="mt-5 md:mt-0 md:mr-4 md:w-1/3"
        :title="$t('page.dashboard.analytics.index.visitsTitle')"
      >
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard
        class="mt-5 md:mt-0 md:mr-4 md:w-1/3"
        :title="$t('page.dashboard.analytics.visitsSource.sourceTitle')"
      >
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard
        class="mt-5 md:mt-0 md:w-1/3"
        :title="$t('page.dashboard.analytics.visitsSales.commercialShare')"
      >
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
