import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useDictStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

function setupCommonGuard(router: Router) {
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    if (!to.meta.loaded && preferences.transition.progress) {
      void startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    loadedPaths.add(to.path);

    if (preferences.transition.progress) {
      void stopProgress();
    }
  });
}

function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();
    if (coreRouteNames.includes(to.name)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    if (!accessStore.accessToken) {
      if (to.meta.ignoreAccess) {
        return true;
      }

      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          replace: true,
        };
      }
      return to;
    }

    if (accessStore.isAccessChecked) {
      return true;
    }

    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];

    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,

      routes: accessRoutes,
    });

    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);

    useDictStore()
      .loadAllDicts()
      .catch((error) => {
        console.error('Failed to preload dictionaries:', error);
      });

    let redirectPath: string;
    if (from.query.redirect) {
      redirectPath = from.query.redirect as string;
    } else if (to.fullPath === preferences.app.defaultHomePath) {
      redirectPath = preferences.app.defaultHomePath;
    } else if (userInfo.homePath && to.fullPath === userInfo.homePath) {
      redirectPath = userInfo.homePath;
    } else {
      redirectPath = to.fullPath;
    }
    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

function createRouterGuard(router: Router) {
  /** Universal */
  setupCommonGuard(router);
  /** Permission access */
  setupAccessGuard(router);
}

export { createRouterGuard };
