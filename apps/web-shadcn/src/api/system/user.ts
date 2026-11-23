import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import {
  createSampleUser,
  deleteSampleUser,
  querySampleUserExportPage,
  querySampleUsers,
  updateSampleUser,
} from './user.sample';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    createTime?: string;
    createUserCode?: string;
    createUserName?: string;
    deptId?: string;
    deptName?: string;
    gender?: 0 | 1 | 2;
    genderName?: string;
    id: string;
    mobile?: string;
    name: string;
    permissions: string[];
    photoPath?: string;
    remark?: string;
    roleCode?: string;
    roleName?: string;
    status: 0 | 1;
    updateDate?: string;
    updateUserCode?: string;
    updateUserName?: string;
    userCode: string;
  }

  /** Lean row returned by the keyset-paged all-users export. */
  export interface SystemUserExport {
    createTime?: string;
    createUserName?: string;
    deptCode?: string;
    deptName?: string;
    gender: number;
    genderName?: string;
    id: string;
    mobile?: string;
    name: string;
    photoPath?: string;
    remark?: string;
    roleCode?: string;
    roleName?: string;
    status: 0 | 1;
    updateDate?: string;
    updateUserName?: string;
    userCode: string;
  }

  export interface UserExportPage {
    hasMore: boolean;
    items: SystemUserExport[];
    nextAfter?: string | null;
    /** Populated only for the first page. */
    total: number;
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
  return requestClient.get<Array<SystemUserApi.SystemUser>>('/system/user/list', { params });
}

/**
 * Fetch one page of the all-users export. Uses keyset pagination so the
 * server never needs OFFSET or a COUNT on every request.
 */
async function getUserExportPage(
  params: { after?: string; limit?: number },
  signal?: AbortSignal,
) {
  if (USE_SAMPLE_DATA) {
    return querySampleUserExportPage(params.after, params.limit);
  }
  return requestClient.get<SystemUserApi.UserExportPage>('/system/user/export-page', {
    params,
    signal,
  });
}

/**
 * Create user
 * @param data User data
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  if (USE_SAMPLE_DATA) {
    return createSampleUser(data);
  }
  const res = requestClient.post('/system/user', {
    ...data,
    id: data.userCode,
  });
  return res;
}

/**
 * Update user
 *
 * @param id User ID
 * @param data User data
 */
async function updateUser(userCode: string, data: Omit<SystemUserApi.SystemUser, 'userCode'>) {
  if (USE_SAMPLE_DATA) {
    return updateSampleUser(userCode, data);
  }
  return requestClient.put(`/system/user/${userCode}`, data);
}

/**
 * Delete user
 * @param id User ID
 */
async function deleteUser(userCode: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleUser(userCode);
  }
  return requestClient.delete(`/system/user/${userCode}`);
}

/**
 * Assign role to user
 * @param userCode User code
 * @param roleCode Role code
 */
async function assignUserRole(userCode: string, roleCode: string) {
  return requestClient.post(`/system/user/${userCode}/roles`, { roleCode });
}

export {
  assignUserRole,
  createUser,
  deleteUser,
  getUserExportPage,
  getUserList,
  updateUser,
};
