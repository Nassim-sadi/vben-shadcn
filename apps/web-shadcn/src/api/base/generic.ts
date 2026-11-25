import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace BaseDataApi {
  export interface BaseRecord {
    [key: string]: any;
    id: number | string;
    status?: 0 | 1;
  }

  export interface BaseListResult {
    items: BaseRecord[];
    total: number;
  }
}

/** Generic list endpoint for every base-data module. */
async function getBaseList(module: string, params?: Recordable<any>) {
  return requestClient.get<BaseDataApi.BaseListResult>(`/base/${module}/list`, {
    params,
  });
}

/** Generic create endpoint for every base-data module. */
async function createBase(module: string, data: Recordable<any>) {
  return requestClient.post<BaseDataApi.BaseRecord>(`/base/${module}`, data);
}

/** Generic update endpoint; `key` is the encoded natural/primary key. */
async function updateBase(module: string, key: string, data: Recordable<any>) {
  return requestClient.put<BaseDataApi.BaseRecord>(
    `/base/${module}/${encodeURIComponent(key)}`,
    data,
  );
}

/** Generic delete endpoint; `key` is the encoded natural/primary key. */
async function deleteBase(module: string, key: string) {
  return requestClient.delete<boolean>(`/base/${module}/${encodeURIComponent(key)}`);
}

export { createBase, deleteBase, getBaseList, updateBase };
