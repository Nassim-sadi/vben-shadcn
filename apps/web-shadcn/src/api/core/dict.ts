import type { DictItem } from '@vben/stores';

import { requestClient } from '#/api/request';

import {
  getSampleAllEnabledDicts,
  getSampleDictVersion,
  getSampleEnabledDictData,
} from '../system/dict.sample';

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory dictionaries */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

export async function getDictApi(code: string) {
  if (USE_SAMPLE_DATA) {
    return getSampleEnabledDictData(code) as DictItem[];
  }
  return requestClient.get<DictItem[]>('/dict/data', {
    params: { code },
  });
}

export async function getAllDictsApi() {
  if (USE_SAMPLE_DATA) {
    return getSampleAllEnabledDicts() as Record<string, DictItem[]>;
  }
  return requestClient.get<Record<string, DictItem[]>>('/dict/all');
}

export async function getDictVersionApi() {
  if (USE_SAMPLE_DATA) {
    return getSampleDictVersion();
  }
  return requestClient.get<number>('/dict/version');
}
