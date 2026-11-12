import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import {
  createSampleUser,
  deleteSampleUser,
  querySampleUsers,
  updateSampleUser,
} from './user.sample';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    gender?: 0 | 1 | 2;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory users */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

/**
 * Get user list data
 */
async function getUserList(params: Recordable<any>) {
  if (USE_SAMPLE_DATA) {
    return querySampleUsers(params);
  }
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/system/user/list',
    { params },
  );
}

/**
 * Create user
 * @param data User data
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  if (USE_SAMPLE_DATA) {
    return createSampleUser(data);
  }
  return requestClient.post('/system/user', data);
}

/**
 * Update user
 *
 * @param id User ID
 * @param data User data
 */
async function updateUser(
  id: string,
  data: Omit<SystemUserApi.SystemUser, 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return updateSampleUser(id, data);
  }
  return requestClient.put(`/system/user/${id}`, data);
}

/**
 * Delete user
 * @param id User ID
 */
async function deleteUser(id: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleUser(id);
  }
  return requestClient.delete(`/system/user/${id}`);
}

export { createUser, deleteUser, getUserList, updateUser };
