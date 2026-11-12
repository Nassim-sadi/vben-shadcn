import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:table-properties',
      keepAlive: true,
      order: 10,
      title: $t('page.dataDisplay.title'),
    },
    name: 'DataDisplay',
    path: '/data-display',
    component: () => import('#/views/data-display/index.vue'),
  },
];

export default routes;
