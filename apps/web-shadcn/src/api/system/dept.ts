import { requestClient } from '#/api/request';

import {
  createSampleDept,
  deleteSampleDept,
  getSampleDeptList,
  updateSampleDept,
} from './dept.sample';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory departments */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

/**
 * Get department list data
 */
async function getDeptList() {
  if (USE_SAMPLE_DATA) {
    return getSampleDeptList();
  }
  return requestClient.get<Array<SystemDeptApi.SystemDept>>(
    '/system/dept/list',
  );
}

/**
 * Create department
 * @param data Department data
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return createSampleDept(data);
  }
  return requestClient.post('/system/dept', data);
}

/**
 * Update department
 *
 * @param id Department ID
 * @param data Department data
 */
async function updateDept(
  id: string,
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return updateSampleDept(id, data);
  }
  return requestClient.put(`/system/dept/${id}`, data);
}

/**
 * Delete department
 * @param id Department ID
 */
async function deleteDept(id: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleDept(id);
  }
  return requestClient.delete(`/system/dept/${id}`);
}

export { createDept, deleteDept, getDeptList, updateDept };
