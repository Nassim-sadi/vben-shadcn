import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace BaseClassesApi {
  export interface BaseClass {
    [key: string]: any;
    beginTimeStr?: string;
    classesCode: string;
    classesName: string;
    /** '0' = same day, '1' = cross day (end time before start time) */
    crossDay?: string;
    createTime?: string;
    endTimeStr?: string;
    id: string;
    remark?: string;
    status: 0 | 1;
  }
}

/** Get shift class list */
async function getClassesList(params: Recordable<any>) {
  return requestClient.get<{
    items: BaseClassesApi.BaseClass[];
    total: number;
  }>('/base/classes/list', { params });
}

/** Create a shift class */
async function createClass(
  data: Omit<BaseClassesApi.BaseClass, 'createTime' | 'id'>,
) {
  return requestClient.post('/base/classes', data);
}

/** Update a shift class */
async function updateClass(
  classesCode: string,
  data: Omit<BaseClassesApi.BaseClass, 'id'>,
) {
  return requestClient.put(`/base/classes/${classesCode}`, data);
}

/** Delete a shift class */
async function deleteClass(classesCode: string) {
  return requestClient.delete(`/base/classes/${classesCode}`);
}

export { createClass, deleteClass, getClassesList, updateClass };
