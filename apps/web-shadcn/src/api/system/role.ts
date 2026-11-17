import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import {
  createSampleRole,
  deleteSampleRole,
  querySampleRoles,
  updateSampleRole,
} from './role.sample';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: string;
    name: string;
    roleCode?: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory roles */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

/**
 * Get role list data
 */
async function getRoleList(params: Recordable<any>) {
  if (USE_SAMPLE_DATA) {
    return querySampleRoles(params);
  }
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(
    '/system/role/list',
    { params },
  );
}

/**
 * Create role
 * @param data Role data
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  if (USE_SAMPLE_DATA) {
    return createSampleRole(data);
  }
  return requestClient.post('/system/role', data);
}

/**
 * Update role
 *
 * @param id Role ID
 * @param data Role data
 */
async function updateRole(
  id: string,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return updateSampleRole(id, data);
  }
  return requestClient.put(`/system/role/${id}`, data);
}

/**
 * Delete role
 * @param id Role ID
 */
async function deleteRole(id: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleRole(id);
  }
  return requestClient.delete(`/system/role/${id}`);
}

export { createRole, deleteRole, getRoleList, updateRole };
