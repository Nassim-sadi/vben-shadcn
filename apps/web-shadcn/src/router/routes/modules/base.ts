import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:database-outline',
      order: 9996,
      title: $t('system.baseData.title'),
    },
    name: 'BaseData',
    path: '/base',
    children: [
      {
        path: 'classes',
        name: 'BaseClasses',
        meta: {
          icon: 'mdi:clock-outline',
          title: $t('system.classes.title'),
        },
        component: () => import('#/views/base/classes/list.vue'),
      },
      {
        path: 'dict',
        name: 'SystemDict',
        meta: {
          icon: 'mdi:book-cog-outline',
          // Keep the page component mounted when ?code= changes on selection.
          fullPathKey: false,
          title: $t('system.dict.title'),
        },
        component: () => import('#/views/system/dict/list.vue'),
      },
    ],
  },
];

export default routes;
