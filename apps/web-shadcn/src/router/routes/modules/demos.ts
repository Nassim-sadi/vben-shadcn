import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        meta: {
          icon: 'mdi:shield-key-outline',
          title: $t('demos.access.frontendPermissions'),
        },
        name: 'AccessDemos',
        path: 'access',
        children: [
          {
            name: 'AccessPageControlDemo',
            path: 'page-control',
            component: () => import('#/views/demos/access/index.vue'),
            meta: {
              icon: 'mdi:page-previous-outline',
              title: $t('demos.access.pageAccess'),
              domCached: true,
            },
          },
          {
            name: 'AccessButtonControlDemo',
            path: 'button-control',
            component: () => import('#/views/demos/access/button-control.vue'),
            meta: {
              icon: 'mdi:button-cursor',
              title: $t('demos.access.buttonControl'),
            },
          },
          {
            name: 'AccessMenuVisible403Demo',
            path: 'menu-visible-403',
            component: () =>
              import('#/views/demos/access/menu-visible-403.vue'),
            meta: {
              authority: ['no-body'],
              icon: 'mdi:button-cursor',
              menuVisibleWithForbidden: true,
              title: $t('demos.access.menuVisible403'),
            },
          },
          {
            name: 'AccessSuperVisibleDemo',
            path: 'super-visible',
            component: () => import('#/views/demos/access/super-visible.vue'),
            meta: {
              authority: ['super'],
              icon: 'mdi:button-cursor',
              title: $t('demos.access.superVisible'),
            },
          },
          {
            name: 'AccessAdminVisibleDemo',
            path: 'admin-visible',
            component: () => import('#/views/demos/access/admin-visible.vue'),
            meta: {
              authority: ['admin'],
              icon: 'mdi:button-cursor',
              title: $t('demos.access.adminVisible'),
            },
          },
          {
            name: 'AccessUserVisibleDemo',
            path: 'user-visible',
            component: () => import('#/views/demos/access/user-visible.vue'),
            meta: {
              authority: ['user'],
              icon: 'mdi:button-cursor',
              title: $t('demos.access.userVisible'),
            },
          },
        ],
      },
      {
        meta: {
          icon: 'mdi:feature-highlight',
          title: $t('demos.features.title'),
        },
        name: 'FeaturesDemos',
        path: 'features',
        children: [
          {
            name: 'LoginExpiredDemo',
            path: 'login-expired',
            component: () =>
              import('#/views/demos/features/login-expired/index.vue'),
            meta: {
              icon: 'mdi:encryption-expiration',
              title: $t('demos.features.loginExpired'),
            },
          },
          {
            name: 'IconsDemo',
            path: 'icons',
            component: () => import('#/views/demos/features/icons/index.vue'),
            meta: {
              icon: 'lucide:annoyed',
              title: $t('demos.features.icons'),
            },
          },
          {
            name: 'FeatureTabsDemo',
            path: 'tabs',
            component: () => import('#/views/demos/features/tabs/index.vue'),
            meta: {
              icon: 'lucide:app-window',
              title: $t('demos.features.tabs'),
            },
          },
          {
            name: 'FeatureTabDetailDemo',
            path: 'detail/:id',
            component: () =>
              import('#/views/demos/features/tabs/tab-detail.vue'),
            meta: {
              activePath: '/demos/features/tabs',
              hideInMenu: true,
              maxNumOfOpenTab: 3,
              title: $t('demos.features.tabDetail'),
            },
          },
          {
            name: 'FullScreenDemo',
            path: 'full-screen',
            component: () =>
              import('#/views/demos/features/full-screen/index.vue'),
            meta: {
              icon: 'lucide:fullscreen',
              title: $t('demos.features.fullScreen'),
            },
          },
          {
            name: 'ClipboardDemo',
            path: 'clipboard',
            component: () =>
              import('#/views/demos/features/clipboard/index.vue'),
            meta: {
              icon: 'lucide:copy',
              title: $t('demos.features.clipboard'),
            },
          },
          {
            name: 'SnPrintDemo',
            path: 'sn-print',
            component: () =>
              import('#/views/demos/features/sn-print/index.vue'),
            meta: {
              icon: 'lucide:print',
              title: $t('page.demos.features.snPrint.title'),
            },
          },
        ],
      },
      {
        meta: {
          icon: 'mdi:lightbulb-error-outline',
          title: $t('demos.fallback.title'),
        },
        name: 'FallbackDemos',
        path: 'fallback',
        children: [
          {
            name: 'Fallback403Demo',
            path: '403',
            component: () => import('#/views/_core/fallback/forbidden.vue'),
            meta: {
              icon: 'mdi:do-not-disturb-alt',
              title: '403',
            },
          },
          {
            name: 'Fallback404Demo',
            path: '404',
            component: () => import('#/views/_core/fallback/not-found.vue'),
            meta: {
              icon: 'mdi:table-off',
              title: '404',
            },
          },
          {
            name: 'Fallback500Demo',
            path: '500',
            component: () =>
              import('#/views/_core/fallback/internal-error.vue'),
            meta: {
              icon: 'mdi:server-network-off',
              title: '500',
            },
          },
          {
            name: 'FallbackOfflineDemo',
            path: 'offline',
            component: () => import('#/views/_core/fallback/offline.vue'),
            meta: {
              icon: 'mdi:offline',
              title: $t('ui.fallback.offline'),
            },
          },
        ],
      },
    ],
  },
];

export default routes;
