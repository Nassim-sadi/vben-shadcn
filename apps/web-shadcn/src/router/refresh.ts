import { useAccessStore, useUserStore } from '@vben/stores';

import { router } from '#/router';
import { accessRoutes } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

let refreshing = false;

/**
 * Rebuild accessible routes and menus after menu management changes.
 *
 * The access guard normally does this once at login, so without this the
 * sidebar keeps the old icon/order until a full page reload.
 */
async function refreshAccessibleRoutes() {
  if (refreshing) {
    return;
  }
  refreshing = true;
  try {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());

    const { accessibleMenus, accessibleRoutes } = await generateAccess(
      {
        roles: userInfo.roles ?? [],
        router,
        routes: accessRoutes,
      },
      { silent: true },
    );

    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
  } catch (error) {
    console.error('[menu-access] failed to refresh accessible routes', error);
  } finally {
    refreshing = false;
  }
}

export { refreshAccessibleRoutes };
