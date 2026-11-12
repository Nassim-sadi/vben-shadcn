import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import {
  createSampleMenu,
  deleteSampleMenu,
  getSampleMenuList,
  isSampleMenuNameExists,
  isSampleMenuPathExists,
  updateSampleMenu,
} from './menu.sample';

export namespace SystemMenuApi {
  /** Badge color collection */
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;
  /** Badge type collection */
  export const BadgeTypes = ['dot', 'normal'] as const;
  /** Menu type collection */
  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;
  /** System menu */
  export interface SystemMenu {
    [key: string]: any;
    /** Backend permission identifier */
    authCode: string;
    /** Child items */
    children?: SystemMenu[];
    /** Component */
    component?: string;
    /** Menu ID */
    id: string;
    /** Menu metadata */
    meta?: {
      /** Icon displayed when active */
      activeIcon?: string;
      /** Path that needs to be activated when used as a route */
      activePath?: string;
      /** Pinned to tag bar */
      affixTab?: boolean;
      /** Order pinned on tag bar */
      affixTabOrder?: number;
      /** Badge content (valid when badge type is normal) */
      badge?: string;
      /** Badge type */
      badgeType?: (typeof BadgeTypes)[number];
      /** Badge color */
      badgeVariants?: (typeof BadgeVariants)[number];
      /** Hide children in menu */
      hideChildrenInMenu?: boolean;
      /** Hide in breadcrumb */
      hideInBreadcrumb?: boolean;
      /** Hide in menu */
      hideInMenu?: boolean;
      /** Hide in tag bar */
      hideInTab?: boolean;
      /** Menu icon */
      icon?: string;
      /** Embedded iframe URL */
      iframeSrc?: string;
      /** Whether to cache page */
      keepAlive?: boolean;
      /** External link page URL */
      link?: string;
      /** Max number of tags opened for same route */
      maxNumOfOpenTab?: number;
      /** No basic layout */
      noBasicLayout?: boolean;
      /** Whether to open in new window */
      openInNewWindow?: boolean;
      /** Menu sort order */
      order?: number;
      /** Additional route parameters */
      query?: Recordable<any>;
      /** Menu title */
      title?: string;
    };
    /** Menu name */
    name: string;
    /** Route path */
    path: string;
    /** Parent ID */
    pid: string;
    /** Redirect */
    redirect?: string;
    /** Menu type */
    type: (typeof MenuTypes)[number];
  }
}

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory menus */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

/**
 * Get menu data list
 */
async function getMenuList() {
  if (USE_SAMPLE_DATA) {
    return getSampleMenuList();
  }
  return requestClient.get<Array<SystemMenuApi.SystemMenu>>(
    '/system/menu/list',
  );
}

async function isMenuNameExists(
  name: string,
  id?: SystemMenuApi.SystemMenu['id'],
) {
  if (USE_SAMPLE_DATA) {
    return isSampleMenuNameExists(name, id);
  }
  return requestClient.get<boolean>('/system/menu/name-exists', {
    params: { id, name },
  });
}

async function isMenuPathExists(
  path: string,
  id?: SystemMenuApi.SystemMenu['id'],
) {
  if (USE_SAMPLE_DATA) {
    return isSampleMenuPathExists(path, id);
  }
  return requestClient.get<boolean>('/system/menu/path-exists', {
    params: { id, path },
  });
}

/**
 * Create menu
 * @param data Menu data
 */
async function createMenu(
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return createSampleMenu(data);
  }
  return requestClient.post('/system/menu', data);
}

/**
 * Update menu
 *
 * @param id Menu ID
 * @param data Menu data
 */
async function updateMenu(
  id: string,
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return updateSampleMenu(id, data);
  }
  return requestClient.put(`/system/menu/${id}`, data);
}

/**
 * Delete menu
 * @param id Menu ID
 */
async function deleteMenu(id: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleMenu(id);
  }
  return requestClient.delete(`/system/menu/${id}`);
}

export {
  createMenu,
  deleteMenu,
  getMenuList,
  isMenuNameExists,
  isMenuPathExists,
  updateMenu,
};
