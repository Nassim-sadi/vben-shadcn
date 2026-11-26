import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * Get all menus of user
 */
export async function getAllMenusApi() {
  return await requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}
