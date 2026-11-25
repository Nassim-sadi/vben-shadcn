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
      {
        path: 'city',
        name: 'BaseCity',
        meta: { icon: 'mdi:map-marker-outline', title: $t('system.base.city.title') },
        component: () => import('#/views/base/city/list.vue'),
      },
      {
        path: 'color',
        name: 'BaseColor',
        meta: { icon: 'mdi:palette-outline', title: $t('system.base.color.title') },
        component: () => import('#/views/base/color/list.vue'),
      },
      {
        path: 'line',
        name: 'BaseLine',
        meta: { icon: 'mdi:transit-connection-horizontal', title: $t('system.base.line.title') },
        component: () => import('#/views/base/line/list.vue'),
      },
      {
        path: 'warehouse',
        name: 'BaseWareHouse',
        meta: { icon: 'mdi:warehouse', title: $t('system.base.warehouse.title') },
        component: () => import('#/views/base/warehouse/list.vue'),
      },
      {
        path: 'field-en',
        name: 'BaseFieldEN',
        meta: { icon: 'mdi:format-list-bulleted', title: $t('system.base.fieldEn.title') },
        component: () => import('#/views/base/field-en/list.vue'),
      },
      {
        path: 'site',
        name: 'BaseSite',
        meta: { icon: 'mdi:map-marker-radius-outline', title: $t('system.base.site.title') },
        component: () => import('#/views/base/site/list.vue'),
      },
      {
        path: 'model',
        name: 'BaseModelNumber',
        meta: { icon: 'mdi:cellphone', title: $t('system.base.model.title') },
        component: () => import('#/views/base/model/list.vue'),
      },
      {
        path: 'model-material',
        name: 'BaseModelMaterial',
        meta: { icon: 'mdi:package-variant-closed', title: $t('system.base.material.title') },
        component: () => import('#/views/base/model-material/list.vue'),
      },
      {
        path: 'line-site',
        name: 'BaseLineSite',
        meta: { icon: 'mdi:layers-outline', title: $t('system.base.lineSite.title') },
        component: () => import('#/views/base/line-site/list.vue'),
      },
      {
        path: 'line-site-scan-user',
        name: 'BaseLineSiteScanUser',
        meta: { icon: 'mdi:account-check-outline', title: $t('system.base.lineScanUser.title') },
        component: () => import('#/views/base/line-site-scan-user/list.vue'),
      },
      {
        path: 'model-site',
        name: 'BaseModelSite',
        meta: { icon: 'mdi:sort-variant', title: $t('system.base.modelSite.title') },
        component: () => import('#/views/base/model-site/list.vue'),
      },
      {
        path: 'user-warehouse',
        name: 'BaseUserWareHouseRelation',
        meta: { icon: 'mdi:account-multiple-outline', title: $t('system.base.userWarehouse.title') },
        component: () => import('#/views/base/user-warehouse/list.vue'),
      },
    ],
  },
];

export default routes;
