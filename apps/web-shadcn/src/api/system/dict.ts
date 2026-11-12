import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import {
  createSampleDictData,
  createSampleDictType,
  deleteSampleDictData,
  deleteSampleDictType,
  isSampleDictCodeExists,
  querySampleDictData,
  querySampleDictTypes,
  updateSampleDictData,
  updateSampleDictType,
} from './dict.sample';

export namespace SystemDictApi {
  export interface SystemDictType {
    [key: string]: any;
    code: string;
    createTime?: string;
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }

  export interface SystemDictData {
    [key: string]: any;
    color?: string;
    createTime?: string;
    dictCode: string;
    id: string;
    label: string;
    remark?: string;
    sort: number;
    status: 0 | 1;
    value: number | string;
  }
}

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory dictionaries */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

/**
 * Get dictionary type list
 */
async function getDictTypeList(params: Recordable<any>) {
  if (USE_SAMPLE_DATA) {
    return querySampleDictTypes(params);
  }
  return requestClient.get<{
    items: SystemDictApi.SystemDictType[];
    total: number;
  }>('/system/dict/type/list', { params });
}

/**
 * Create dictionary type
 * @param data Dictionary type data
 */
async function createDictType(
  data: Omit<SystemDictApi.SystemDictType, 'createTime' | 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return createSampleDictType(data);
  }
  return requestClient.post('/system/dict/type', data);
}

/**
 * Update dictionary type
 * @param id Dictionary type ID
 * @param data Dictionary type data
 */
async function updateDictType(
  id: string,
  data: Omit<SystemDictApi.SystemDictType, 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return updateSampleDictType(id, data);
  }
  return requestClient.put(`/system/dict/type/${id}`, data);
}

/**
 * Delete dictionary type
 * @param id Dictionary type ID
 */
async function deleteDictType(id: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleDictType(id);
  }
  return requestClient.delete(`/system/dict/type/${id}`);
}

/**
 * Check if dictionary code already exists
 * @param code Dictionary code
 * @param id ID of dictionary type being edited (optional)
 */
async function isDictCodeExists(
  code: string,
  id?: SystemDictApi.SystemDictType['id'],
) {
  if (USE_SAMPLE_DATA) {
    return isSampleDictCodeExists(code, id);
  }
  return requestClient.get<boolean>('/system/dict/type/code-exists', {
    params: { code, id },
  });
}

/**
 * Get dictionary data list
 */
async function getDictDataList(params: Recordable<any>) {
  if (USE_SAMPLE_DATA) {
    return querySampleDictData(params);
  }
  return requestClient.get<{
    items: SystemDictApi.SystemDictData[];
    total: number;
  }>('/system/dict/data/list', { params });
}

/**
 * Create dictionary data
 * @param data Dictionary data
 */
async function createDictData(
  data: Omit<SystemDictApi.SystemDictData, 'createTime' | 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return createSampleDictData(data);
  }
  return requestClient.post('/system/dict/data', data);
}

/**
 * Update dictionary data
 * @param id Dictionary data ID
 * @param data Dictionary data
 */
async function updateDictData(
  id: string,
  data: Omit<SystemDictApi.SystemDictData, 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return updateSampleDictData(id, data);
  }
  return requestClient.put(`/system/dict/data/${id}`, data);
}

/**
 * Delete dictionary data
 * @param id Dictionary data ID
 */
async function deleteDictData(id: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleDictData(id);
  }
  return requestClient.delete(`/system/dict/data/${id}`);
}

export {
  createDictData,
  createDictType,
  deleteDictData,
  deleteDictType,
  getDictDataList,
  getDictTypeList,
  isDictCodeExists,
  updateDictData,
  updateDictType,
};
