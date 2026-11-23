import { requestClient } from '#/api/request';

import {
  createSampleDept,
  deleteSampleDept,
  getSampleDeptList,
  moveSampleDeptBatch,
  updateSampleDept,
} from './dept.sample';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    deptCode: string;
    displayOrder: number;
    id: string;
    name: string;
    pid?: string;
    remark?: string;
    status: 0 | 1;
  }

  /** One staged drag-and-drop move, applied in order by the batch endpoint. */
  export interface DeptMove {
    deptCode: string;
    pid: string;
    targetIndex: number;
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
  data: Omit<
    SystemDeptApi.SystemDept,
    'children' | 'deptCode' | 'displayOrder' | 'id'
  > & { displayOrder?: number },
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
  data: Omit<
    SystemDeptApi.SystemDept,
    'children' | 'deptCode' | 'displayOrder' | 'id'
  > & { displayOrder?: number },
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

/** Apply staged drag-and-drop moves in one batch */
async function moveDeptBatch(moves: SystemDeptApi.DeptMove[]) {
  if (USE_SAMPLE_DATA) {
    return moveSampleDeptBatch(moves);
  }
  return requestClient.put<SystemDeptApi.SystemDept[]>(
    '/system/dept/move',
    moves,
  );
}

export { createDept, deleteDept, getDeptList, moveDeptBatch, updateDept };
