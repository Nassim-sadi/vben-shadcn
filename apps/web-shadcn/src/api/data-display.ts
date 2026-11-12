import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import {
  createSampleItem,
  deleteSampleItem,
  querySampleData,
  updateSampleItem,
} from './data-display.sample';

/**
 * Static demo environment (without /data-display/* interfaces) uses built-in demo data.
 * Development environment uses local Nitro mock, production preview uses in-memory demo data.
 */
const USE_SAMPLE_DATA = import.meta.env.VITE_DATA_DISPLAY_SAMPLE === 'true';

export namespace DataDisplayApi {
  export interface Item {
    [key: string]: any;
    category: 'assembly' | 'electronics' | 'mechanics' | 'optical';
    code: string;
    completedQuantity: number;
    createTime: string;
    id: string;
    line: string;
    name: string;
    operator: string;
    planQuantity: number;
    priority: 'high' | 'low' | 'medium';
    remark?: string;
    status: 0 | 1 | 2 | 3;
  }
}

/**
 * Get data display list
 */
export async function getDataDisplayList(params?: Recordable<any>) {
  if (USE_SAMPLE_DATA) {
    return querySampleData(params);
  }

  return requestClient.get<{
    items: DataDisplayApi.Item[];
    total: number;
  }>('/data-display/list', { params });
}

/**
 * Create work order data
 */
export async function createDataDisplayItem(
  data: Omit<DataDisplayApi.Item, 'createTime' | 'id'>,
) {
  if (USE_SAMPLE_DATA) {
    return createSampleItem(data);
  }

  return requestClient.post<DataDisplayApi.Item>('/data-display', data);
}

/**
 * Update work order data
 */
export async function updateDataDisplayItem(
  id: string,
  data: Partial<Omit<DataDisplayApi.Item, 'id'>>,
) {
  if (USE_SAMPLE_DATA) {
    return updateSampleItem(id, data);
  }

  return requestClient.put<DataDisplayApi.Item>(`/data-display/${id}`, data);
}

/**
 * Delete work order data
 */
export async function deleteDataDisplayItem(id: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleItem(id);
  }

  return requestClient.delete(`/data-display/${id}`);
}
