import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemLogApi {
  export interface SystemLog {
    [key: string]: any;
    createTime?: string;
    createUserCode?: string;
    createUserIp?: string;
    createUserName?: string;
    id: number;
    logData?: string;
    menuCode?: string;
    remark?: string;
    swStyleCode?: string;
  }
}

/** Get system log list (read-only) */
async function getLogList(params: Recordable<any>) {
  return requestClient.get<{
    items: SystemLogApi.SystemLog[];
    total: number;
  }>('/system/log/list', { params });
}

export { getLogList };
