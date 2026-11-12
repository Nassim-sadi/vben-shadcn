import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:printer',
      order: 900,
      title: $t('page.print.title'),
    },
    name: 'Print',
    path: '/print',
    children: [
      {
        name: 'PrintSn',
        path: 'sn',
        component: () => import('#/views/print/sn/index.vue'),
        meta: {
          icon: 'lucide:scan-barcode',
          title: $t('page.print.sn.title'),
        },
      },
    ],
  },
];

export default routes;
