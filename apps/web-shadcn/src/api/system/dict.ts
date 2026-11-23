import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import {
  createSampleDictData,
  createSampleDictType,
  deleteSampleDictData,
  deleteSampleDictType,
  isSampleDictCodeExists,
  moveSampleDictData,
  moveSampleDictType,
  querySampleDictData,
  querySampleDictTree,
  querySampleDictTypes,
  updateSampleDictData,
  updateSampleDictType,
} from './dict.sample';

export namespace SystemDictApi {
  /** T_Base_Style row. Field names mirror the DB columns. */
  export interface SystemDictType {
    [key: string]: any;
    createTime?: string;
    createUserCode?: string;
    createUserName?: string;
    displayOrder: number;
    id: number;
    parentStyleCode: string;
    remark?: string;
    styleCode: string;
    styleName: string;
    updateTime?: string;
    updateUserCode?: string;
    updateUserName?: string;
    children?: SystemDictType[];
  }

  /** T_Base_StyleSub row. Field names mirror the DB columns. */
  export interface SystemDictData {
    [key: string]: any;
    createTime?: string;
    createUserCode?: string;
    createUserName?: string;
    displayOrder: number;
    id: number;
    remark?: string;
    styleCode: string;
    subStyleCode: string;
    subStyleName: string;
    subStyleNameExt?: string | null;
    updateTime?: string;
    updateUserCode?: string;
    updateUserName?: string;
  }

  export interface DictTypeMove {
    parentStyleCode: string;
    styleCode: string;
    targetIndex: number;
  }

  export interface DictDataMove {
    subStyleCode: string;
    targetIndex: number;
    targetStyleCode?: string;
  }

  /** Flat node in the combined dictionary tree (types + their data rows). */
  export interface SystemDictNode {
    [key: string]: any;
    createTime?: string;
    createUserCode?: string;
    createUserName?: string;
    displayOrder: number;
    id: number;
    nodeKey: string;
    nodeType: 'type' | 'data';
    parentKey: string;
    parentStyleCode?: string;
    remark?: string;
    styleCode: string;
    styleName?: string;
    subStyleCode?: string;
    subStyleName?: string;
    subStyleNameExt?: string | null;
    updateTime?: string;
    updateUserCode?: string;
    updateUserName?: string;
    children?: SystemDictNode[];
  }
}

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory dictionaries */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

type DictTypeWrite = Omit<
  SystemDictApi.SystemDictType,
  'children' | 'createTime' | 'createUserCode' | 'createUserName' | 'id' | 'updateTime' | 'updateUserCode' | 'updateUserName'
>;

type DictDataWrite = Omit<
  SystemDictApi.SystemDictData,
  'createTime' | 'createUserCode' | 'createUserName' | 'id' | 'updateTime' | 'updateUserCode' | 'updateUserName'
>;

/** Get the combined type + data tree for the admin grid. */
async function getDictTree(params: Recordable<any> = {}) {
  if (USE_SAMPLE_DATA) {
    return querySampleDictTree(params);
  }
  return requestClient.get<SystemDictApi.SystemDictNode[]>('/system/dict/tree', {
    params,
  });
}

/**
 * Get dictionary type tree. Returned as a flat list ordered as a tree; the grid
 * transforms it using parentStyleCode.
 */
async function getDictTypeTree(params: Recordable<any> = {}) {
  if (USE_SAMPLE_DATA) {
    return querySampleDictTypes(params);
  }
  return requestClient.get<SystemDictApi.SystemDictType[]>(
    '/system/dict/type/tree',
    { params },
  );
}

/**
 * Get dictionary type list (compatibility alias of the tree endpoint).
 */
async function getDictTypeList(params: Recordable<any> = {}) {
  return getDictTypeTree(params);
}

async function createDictType(data: DictTypeWrite) {
  if (USE_SAMPLE_DATA) {
    return createSampleDictType(data);
  }
  return requestClient.post<SystemDictApi.SystemDictType>('/system/dict/type', data);
}

async function updateDictType(styleCode: string, data: Partial<DictTypeWrite>) {
  if (USE_SAMPLE_DATA) {
    return updateSampleDictType(styleCode, data);
  }
  return requestClient.put<SystemDictApi.SystemDictType>(
    `/system/dict/type/${encodeURIComponent(styleCode)}`,
    data,
  );
}

async function deleteDictType(styleCode: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleDictType(styleCode);
  }
  return requestClient.delete<boolean>(
    `/system/dict/type/${encodeURIComponent(styleCode)}`,
  );
}

async function moveDictType(data: SystemDictApi.DictTypeMove) {
  if (USE_SAMPLE_DATA) {
    return moveSampleDictType(data);
  }
  return requestClient.put<SystemDictApi.SystemDictType[]>(
    '/system/dict/type/move',
    data,
  );
}

async function isDictCodeExists(
  styleCode: string,
  id?: SystemDictApi.SystemDictType['styleCode'],
) {
  if (USE_SAMPLE_DATA) {
    return isSampleDictCodeExists(styleCode, id);
  }
  return requestClient.get<boolean>('/system/dict/type/code-exists', {
    params: { code: styleCode, id },
  });
}

async function getDictDataList(params: Recordable<any>) {
  if (USE_SAMPLE_DATA) {
    return querySampleDictData(params);
  }
  return requestClient.get<SystemDictApi.SystemDictData[]>(
    '/system/dict/data/list',
    { params },
  );
}

async function createDictData(data: DictDataWrite) {
  if (USE_SAMPLE_DATA) {
    return createSampleDictData(data);
  }
  return requestClient.post<SystemDictApi.SystemDictData>('/system/dict/data', data);
}

async function updateDictData(subStyleCode: string, data: Partial<DictDataWrite>) {
  if (USE_SAMPLE_DATA) {
    return updateSampleDictData(subStyleCode, data);
  }
  return requestClient.put<SystemDictApi.SystemDictData>(
    `/system/dict/data/${encodeURIComponent(subStyleCode)}`,
    data,
  );
}

async function deleteDictData(subStyleCode: string) {
  if (USE_SAMPLE_DATA) {
    return deleteSampleDictData(subStyleCode);
  }
  return requestClient.delete<boolean>(
    `/system/dict/data/${encodeURIComponent(subStyleCode)}`,
  );
}

async function moveDictData(data: SystemDictApi.DictDataMove) {
  if (USE_SAMPLE_DATA) {
    return moveSampleDictData(data);
  }
  return requestClient.put<SystemDictApi.SystemDictData[]>(
    '/system/dict/data/move',
    data,
  );
}

export {
  createDictData,
  createDictType,
  deleteDictData,
  deleteDictType,
  getDictDataList,
  getDictTree,
  getDictTypeList,
  getDictTypeTree,
  isDictCodeExists,
  moveDictData,
  moveDictType,
  updateDictData,
  updateDictType,
};
