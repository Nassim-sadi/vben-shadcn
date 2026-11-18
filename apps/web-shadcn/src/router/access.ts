import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { toast } from 'vue-sonner';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      const startedAt = Date.now();
      console.log('[menu-access] fetchMenuListAsync start', {
        at: new Date().toISOString(),
        href: location.href,
      });
      const toastId = toast.loading(`${$t('common.loadingMenu')}...`, {
        duration: 1500,
      });
      try {
        const menus = await getAllMenusApi();
        console.log('[menu-access] fetchMenuListAsync success', {
          durationMs: Date.now() - startedAt,
          count: menus?.length,
          toastId,
        });
        return menus;
      } catch (error) {
        console.error('[menu-access] fetchMenuListAsync error', {
          durationMs: Date.now() - startedAt,
          toastId,
          error,
        });
        throw error;
      } finally {
        console.log('[menu-access] fetchMenuListAsync finally; dismissing toast', {
          durationMs: Date.now() - startedAt,
          toastId,
        });
        toast.dismiss(toastId);
      }
    },
    // You can specify that you do not have permission to jump to the 403 page.
    forbiddenComponent,
    // if route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
