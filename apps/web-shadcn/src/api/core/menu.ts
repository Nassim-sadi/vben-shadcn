import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * Get all menus of user
 */
export async function getAllMenusApi() {
  const startedAt = Date.now();
  console.log('[menu-api] GET /menu/all start', {
    at: new Date().toISOString(),
  });
  try {
    const menus = await requestClient.get<RouteRecordStringComponent[]>('/menu/all');
    console.log('[menu-api] GET /menu/all success', {
      durationMs: Date.now() - startedAt,
      count: menus?.length,
    });
    return menus;
  } catch (error) {
    console.error('[menu-api] GET /menu/all error', {
      durationMs: Date.now() - startedAt,
      error,
    });
    throw error;
  }
}
