import type { SystemDictApi } from './dict';

import { formatDateTime, paginate } from '../sample-helpers';

/**
 * Demo data for dictionaries, used when VITE_SYSTEM_SAMPLE=true.
 * Mirrors the /system/dict/*, /dict/* endpoints of the backend mock, in memory.
 */

type SystemDictData = SystemDictApi.SystemDictData;
type SystemDictType = SystemDictApi.SystemDictType;

let dictVersion = 1;

function bumpVersion() {
  dictVersion += 1;
}

function buildInitialTypes(): SystemDictType[] {
  const now = formatDateTime(new Date());
  return [
    {
      id: 'sample-dict-type-1',
      name: 'User gender',
      code: 'user_gender',
      status: 1,
      remark: 'User gender dictionary',
      createTime: now,
    },
    {
      id: 'sample-dict-type-2',
      name: 'General status',
      code: 'common_status',
      status: 1,
      remark: 'enable/disable',
      createTime: now,
    },
    {
      id: 'sample-dict-type-3',
      name: 'Whether',
      code: 'yes_no',
      status: 1,
      remark: 'Is it an option?',
      createTime: now,
    },
  ];
}

function buildInitialData(): SystemDictData[] {
  const now = formatDateTime(new Date());
  const data = (
    id: string,
    dictCode: string,
    label: string,
    value: number | string,
    sort: number,
    color?: string,
  ): SystemDictData => ({
    color,
    dictCode,
    id,
    label,
    sort,
    status: 1,
    value,
    createTime: now,
  });

  return [
    data('sample-dict-data-1', 'user_gender', 'male', 1, 1),
    data('sample-dict-data-2', 'user_gender', 'female', 0, 2),
    data('sample-dict-data-3', 'user_gender', 'unknown', 2, 3),
    data('sample-dict-data-4', 'common_status', 'enable', 1, 1, 'success'),
    data('sample-dict-data-5', 'common_status', 'disable', 0, 2, 'error'),
    data('sample-dict-data-6', 'yes_no', 'yes', 1, 1),
    data('sample-dict-data-7', 'yes_no', 'no', 0, 2),
  ];
}

let dictTypeStore: SystemDictType[] = buildInitialTypes();
let dictDataStore: SystemDictData[] = buildInitialData();

let typeSequence = 3;
let dataSequence = 7;

export interface SampleDictQueryParams {
  [key: string]: any;
  code?: string;
  dictCode?: string;
  label?: string;
  name?: string;
  page?: number | string;
  pageSize?: number | string;
  status?: number | string;
}

export function querySampleDictTypes(params: SampleDictQueryParams = {}): {
  items: SystemDictType[];
  total: number;
} {
  let filtered = [...dictTypeStore];

  if (params.name) {
    const keyword = params.name.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }

  if (params.code) {
    const keyword = params.code.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.code.toLowerCase().includes(keyword),
    );
  }

  if (params.status !== undefined && params.status !== '') {
    filtered = filtered.filter((item) => item.status === Number(params.status));
  }

  return paginate(filtered, params.page, params.pageSize);
}

export function isSampleDictCodeExists(code: string, id?: string): boolean {
  return dictTypeStore.some((item) => item.code === code && item.id !== id);
}

export function createSampleDictType(
  data: Omit<SystemDictType, 'createTime' | 'id'>,
): SystemDictType {
  typeSequence += 1;
  const created = {
    ...data,
    id: `sample-dict-type-${typeSequence}`,
    createTime: formatDateTime(new Date()),
  } as SystemDictType;
  dictTypeStore = [created, ...dictTypeStore];
  bumpVersion();
  return structuredClone(created);
}

export function updateSampleDictType(
  id: string,
  data: Partial<Omit<SystemDictType, 'id'>>,
): null | SystemDictType {
  const index = dictTypeStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const updated = { ...dictTypeStore[index], ...data, id } as SystemDictType;
  dictTypeStore[index] = updated;
  bumpVersion();
  return structuredClone(updated);
}

export function deleteSampleDictType(id: string): boolean {
  const index = dictTypeStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  dictTypeStore.splice(index, 1);
  bumpVersion();
  return true;
}

export function querySampleDictData(
  params: SampleDictQueryParams = {},
): null | { items: SystemDictData[]; total: number } {
  if (!params.dictCode) {
    return null;
  }

  let filtered = dictDataStore.filter(
    (item) => item.dictCode === params.dictCode,
  );

  if (params.label) {
    const keyword = params.label.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.label.toLowerCase().includes(keyword),
    );
  }

  if (params.status !== undefined && params.status !== '') {
    filtered = filtered.filter((item) => item.status === Number(params.status));
  }

  return paginate(filtered, params.page, params.pageSize);
}

export function createSampleDictData(
  data: Omit<SystemDictData, 'createTime' | 'id'>,
): SystemDictData {
  dataSequence += 1;
  const created = {
    ...data,
    id: `sample-dict-data-${dataSequence}`,
    createTime: formatDateTime(new Date()),
  } as SystemDictData;
  dictDataStore = [...dictDataStore, created];
  bumpVersion();
  return structuredClone(created);
}

export function updateSampleDictData(
  id: string,
  data: Partial<Omit<SystemDictData, 'id'>>,
): null | SystemDictData {
  const index = dictDataStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const updated = { ...dictDataStore[index], ...data, id } as SystemDictData;
  dictDataStore[index] = updated;
  bumpVersion();
  return structuredClone(updated);
}

export function deleteSampleDictData(id: string): boolean {
  const index = dictDataStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  dictDataStore.splice(index, 1);
  bumpVersion();
  return true;
}

/** Enabled dict entries shaped like DictItem: { label, value, color? } */
export function getSampleEnabledDictData(code: string) {
  return [...dictDataStore]
    .filter((item) => item.dictCode === code && item.status === 1)
    .toSorted((a, b) => a.sort - b.sort)
    .map(({ color, label, value }) => ({
      ...(color ? { color } : {}),
      label,
      value,
    }));
}

export function getSampleAllEnabledDicts() {
  const result: Record<
    string,
    { color?: string; label: string; value: number | string }[]
  > = {};
  for (const type of dictTypeStore) {
    if (type.status === 1) {
      result[type.code] = getSampleEnabledDictData(type.code);
    }
  }
  return result;
}

export function getSampleDictVersion() {
  return dictVersion;
}
