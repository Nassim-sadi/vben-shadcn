import type { SystemDictApi } from './dict';

import { formatDateTime } from '../sample-helpers';

/**
 * Demo data for dictionaries, used when VITE_SYSTEM_SAMPLE=true.
 * Mirrors the /system/dict/* and /dict/* backend endpoints in memory.
 */

type SystemDictData = SystemDictApi.SystemDictData;
type SystemDictType = SystemDictApi.SystemDictType;

type DictTypeWrite = Omit<
  SystemDictType,
  | 'children'
  | 'createTime'
  | 'createUserCode'
  | 'createUserName'
  | 'id'
  | 'updateTime'
  | 'updateUserCode'
  | 'updateUserName'
>;

type DictDataWrite = Omit<
  SystemDictData,
  | 'createTime'
  | 'createUserCode'
  | 'createUserName'
  | 'id'
  | 'updateTime'
  | 'updateUserCode'
  | 'updateUserName'
>;

let dictVersion = 1;
let typeSequence = 5;
let dataSequence = 17;

function bumpVersion() {
  dictVersion += 1;
}

function clean(value?: string | null): string | undefined {
  return value?.trim() || undefined;
}

function buildInitialTypes(): SystemDictType[] {
  const now = formatDateTime(new Date());
  return [
    ['user_gender', 'User Gender', 1],
    ['order_status', 'Order Status', 2],
    ['priority', 'Priority', 3],
    ['yes_no', 'Yes / No', 4],
    ['attendance_type', 'Attendance Type', 5],
  ].map(([styleCode, styleName, displayOrder], index) => ({
    createTime: now,
    displayOrder: Number(displayOrder),
    id: index + 1,
    parentStyleCode: '0',
    styleCode: String(styleCode),
    styleName: String(styleName),
  }));
}

function buildInitialData(): SystemDictData[] {
  const now = formatDateTime(new Date());
  const rows: Array<[string, string, string, string | null, number]> = [
    ['user_gender', '1', 'Male', null, 1],
    ['user_gender', '2', 'Female', null, 2],
    ['order_status', 'order_pending', 'Pending', null, 1],
    ['order_status', 'order_paid', 'Paid', null, 2],
    ['order_status', 'order_shipped', 'Shipped', null, 3],
    ['order_status', 'order_completed', 'Completed', null, 4],
    ['order_status', 'order_cancelled', 'Cancelled', null, 5],
    ['priority', 'priority_low', 'Low', null, 1],
    ['priority', 'priority_normal', 'Normal', null, 2],
    ['priority', 'priority_high', 'High', null, 3],
    ['priority', 'priority_urgent', 'Urgent', null, 4],
    ['yes_no', 'yes', 'Yes', 'success', 1],
    ['yes_no', 'no', 'No', 'error', 2],
    ['attendance_type', 'attendance_normal', 'Normal', null, 1],
    ['attendance_type', 'attendance_overtime', 'Overtime', null, 2],
    ['attendance_type', 'attendance_leave', 'Leave', null, 3],
    ['attendance_type', 'attendance_business_trip', 'Business Trip', null, 4],
  ];

  return rows.map(([styleCode, subStyleCode, subStyleName, ext, order], index) => ({
    createTime: now,
    displayOrder: order,
    id: index + 1,
    styleCode,
    subStyleCode,
    subStyleName,
    subStyleNameExt: ext,
  }));
}

let dictTypeStore: SystemDictType[] = buildInitialTypes();
let dictDataStore: SystemDictData[] = buildInitialData();

function siblingTypes(parentStyleCode: string, exclude?: string): SystemDictType[] {
  return dictTypeStore
    .filter(
      (item) =>
        item.parentStyleCode === parentStyleCode &&
        item.styleCode !== exclude,
    )
    .toSorted((a, b) => a.displayOrder - b.displayOrder || a.styleCode.localeCompare(b.styleCode));
}

function siblingData(styleCode: string, exclude?: string): SystemDictData[] {
  return dictDataStore
    .filter(
      (item) => item.styleCode === styleCode && item.subStyleCode !== exclude,
    )
    .toSorted(
      (a, b) =>
        a.displayOrder - b.displayOrder || a.subStyleCode.localeCompare(b.subStyleCode),
    );
}

function renumberTypes(parentStyleCode: string, codes: string[]) {
  const positions = new Map(codes.map((code, index) => [code, index + 1]));
  for (const item of dictTypeStore) {
    const next = positions.get(item.styleCode);
    if (next !== undefined) {
      item.displayOrder = next;
    }
  }
  void parentStyleCode;
}

function renumberData(styleCode: string, codes: string[]) {
  const positions = new Map(codes.map((code, index) => [code, index + 1]));
  for (const item of dictDataStore) {
    const next = positions.get(item.subStyleCode);
    if (next !== undefined && item.styleCode === styleCode) {
      item.displayOrder = next;
    }
  }
}

function insertAt<T>(items: T[], index: number, value: T) {
  items.splice(Math.max(0, Math.min(index, items.length)), 0, value);
}

function typeExists(styleCode: string): boolean {
  return dictTypeStore.some((item) => item.styleCode === styleCode);
}

function isTypeDescendant(ancestor: string, candidate: string): boolean {
  if (ancestor === candidate) {
    return true;
  }
  let current = clean(candidate);
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    if (current === ancestor) {
      return true;
    }
    visited.add(current);
    current = clean(dictTypeStore.find((item) => item.styleCode === current)?.parentStyleCode);
  }
  return false;
}

function orderTypes(rows: SystemDictType[]): SystemDictType[] {
  const codes = new Set(rows.map((item) => item.styleCode));
  const childrenOf = (parent: string) =>
    rows
      .filter((item) =>
        codes.has(item.parentStyleCode) ? item.parentStyleCode === parent : parent === '0',
      )
      .toSorted(
        (a, b) => a.displayOrder - b.displayOrder || a.styleCode.localeCompare(b.styleCode),
      );

  const result: SystemDictType[] = [];
  const visited = new Set<string>();

  function walk(parent: string) {
    for (const item of childrenOf(parent)) {
      if (visited.has(item.styleCode)) {
        continue;
      }
      visited.add(item.styleCode);
      result.push(item);
      walk(item.styleCode);
    }
  }

  walk('0');
  for (const item of rows) {
    if (visited.has(item.styleCode)) {
      continue;
    }
    visited.add(item.styleCode);
    result.push(item);
    walk(item.styleCode);
  }
  return result;
}

function filterTypeTree(rows: SystemDictType[], styleCode?: string, styleName?: string) {
  const matches = rows.filter(
    (item) =>
      (!styleCode ||
        item.styleCode.toLowerCase().includes(styleCode.toLowerCase())) &&
      (!styleName ||
        item.styleName.toLowerCase().includes(styleName.toLowerCase())),
  );
  if (matches.length === 0) {
    return [];
  }

  const byCode = new Map(rows.map((item) => [item.styleCode, item]));
  const included = new Set<string>();

  for (const match of matches) {
    let current = match.styleCode;
    while (byCode.has(current) && !included.has(current)) {
      included.add(current);
      const parent = byCode.get(current)?.parentStyleCode ?? '0';
      if (parent === '0') {
        break;
      }
      current = parent;
    }

    const stack = [match.styleCode];
    while (stack.length) {
      const parent = stack.pop()!;
      for (const child of rows.filter((item) => item.parentStyleCode === parent)) {
        if (!included.has(child.styleCode)) {
          included.add(child.styleCode);
          stack.push(child.styleCode);
        }
      }
    }
  }

  return orderTypes(rows.filter((item) => included.has(item.styleCode)));
}

export interface SampleDictQueryParams {
  [key: string]: any;
  code?: string;
  name?: string;
  styleCode?: string;
  styleName?: string;
  subStyleCode?: string;
  subStyleName?: string;
}

export function querySampleDictTypes(
  params: SampleDictQueryParams = {},
): SystemDictType[] {
  const styleCode = clean(params.styleCode ?? params.code);
  const styleName = clean(params.styleName ?? params.name);
  const ordered = orderTypes(dictTypeStore);
  if (!styleCode && !styleName) {
    return structuredClone(ordered);
  }
  return structuredClone(filterTypeTree(ordered, styleCode, styleName));
}

type DictTreeNode = SystemDictApi.SystemDictNode;

function typeKey(code: string) {
  return `type:${code}`;
}

function dataKey(code: string) {
  return `data:${code}`;
}

function toTypeNode(row: SystemDictType, includedCodes: Set<string>): DictTreeNode {
  const parent = row.parentStyleCode;
  const parentKey =
    !parent || parent === '0' || !includedCodes.has(parent) ? '0' : typeKey(parent);
  return {
    createTime: row.createTime,
    createUserCode: row.createUserCode,
    createUserName: row.createUserName,
    displayOrder: row.displayOrder,
    id: row.id,
    nodeKey: typeKey(row.styleCode),
    nodeType: 'type',
    parentKey,
    parentStyleCode: row.parentStyleCode,
    remark: row.remark,
    styleCode: row.styleCode,
    styleName: row.styleName,
    updateTime: row.updateTime,
    updateUserCode: row.updateUserCode,
    updateUserName: row.updateUserName,
  };
}

function toDataNode(row: SystemDictData): DictTreeNode {
  return {
    createTime: row.createTime,
    createUserCode: row.createUserCode,
    createUserName: row.createUserName,
    displayOrder: row.displayOrder,
    id: row.id,
    nodeKey: dataKey(row.subStyleCode),
    nodeType: 'data',
    parentKey: typeKey(row.styleCode),
    remark: row.remark,
    styleCode: row.styleCode,
    subStyleCode: row.subStyleCode,
    subStyleName: row.subStyleName,
    subStyleNameExt: row.subStyleNameExt,
    updateTime: row.updateTime,
    updateUserCode: row.updateUserCode,
    updateUserName: row.updateUserName,
  };
}

/** Flat pre-order tree: dictionary types with their data rows as children. */
export function querySampleDictTree(
  params: SampleDictQueryParams = {},
): DictTreeNode[] {
  const styleCode = clean(params.styleCode);
  const styleName = clean(params.styleName);
  const subStyleName = clean(params.subStyleName);
  const subStyleCode = clean(params.subStyleCode);
  const orderedTypes = orderTypes(dictTypeStore);
  const hasTypeFilter = Boolean(styleCode || styleName);
  const includedTypes = hasTypeFilter
    ? filterTypeTree(orderedTypes, styleCode, styleName)
    : orderedTypes;
  const includedCodes = new Set(includedTypes.map((item) => item.styleCode));

  const filteredData = dictDataStore.filter(
    (item) =>
      includedCodes.has(item.styleCode) &&
      (!subStyleName ||
        item.subStyleName.toLowerCase().includes(subStyleName.toLowerCase())) &&
      (!subStyleCode ||
        item.subStyleCode.toLowerCase().includes(subStyleCode.toLowerCase())),
  );

  const typesByParent = new Map<string, SystemDictType[]>();
  for (const item of includedTypes) {
    const parent =
      item.parentStyleCode && includedCodes.has(item.parentStyleCode)
        ? item.parentStyleCode
        : '0';
    typesByParent.set(parent, [...(typesByParent.get(parent) ?? []), item]);
  }
  const dataByType = new Map<string, SystemDictData[]>();
  for (const item of filteredData) {
    dataByType.set(item.styleCode, [...(dataByType.get(item.styleCode) ?? []), item]);
  }

  const sortTypes = (a: SystemDictType, b: SystemDictType) =>
    a.displayOrder - b.displayOrder || a.styleCode.localeCompare(b.styleCode);
  const sortData = (a: SystemDictData, b: SystemDictData) =>
    a.displayOrder - b.displayOrder || a.subStyleCode.localeCompare(b.subStyleCode);

  const result: DictTreeNode[] = [];
  const visited = new Set<string>();

  function walk(parent: string) {
    for (const item of (typesByParent.get(parent) ?? []).toSorted(sortTypes)) {
      if (visited.has(item.styleCode)) {
        continue;
      }
      visited.add(item.styleCode);
      result.push(toTypeNode(item, includedCodes));
      for (const child of (dataByType.get(item.styleCode) ?? []).toSorted(sortData)) {
        result.push(toDataNode(child));
      }
      walk(item.styleCode);
    }
  }

  walk('0');
  for (const item of includedTypes) {
    if (visited.has(item.styleCode)) {
      continue;
    }
    visited.add(item.styleCode);
    result.push(toTypeNode(item, includedCodes));
    walk(item.styleCode);
  }
  return structuredClone(result);
}

export function isSampleDictCodeExists(code: string, id?: string): boolean {
  return dictTypeStore.some(
    (item) => item.styleCode === code && item.styleCode !== id,
  );
}

export function createSampleDictType(data: DictTypeWrite): SystemDictType {
  const styleCode = clean(data.styleCode);
  if (!styleCode || !clean(data.styleName)) {
    throw new Error('Style Code and Style Name are required.');
  }
  if (isSampleDictCodeExists(styleCode)) {
    throw new Error(`Style Code '${styleCode}' already exists.`);
  }
  const parentStyleCode = clean(data.parentStyleCode) ?? '0';
  if (parentStyleCode !== '0' && !typeExists(parentStyleCode)) {
    throw new Error(`Parent Style Code '${parentStyleCode}' does not exist.`);
  }

  const siblings = siblingTypes(parentStyleCode).map((item) => item.styleCode);
  const requested = data.displayOrder && data.displayOrder > 0 ? data.displayOrder : siblings.length + 1;
  insertAt(siblings, requested - 1, styleCode);
  renumberTypes(parentStyleCode, siblings);

  typeSequence += 1;
  const created: SystemDictType = {
    ...data,
    createTime: formatDateTime(new Date()),
    displayOrder: requested,
    id: typeSequence,
    parentStyleCode,
    styleCode,
    styleName: data.styleName!.trim(),
  };
  dictTypeStore.push(created);
  bumpVersion();
  return structuredClone(created);
}

export function updateSampleDictType(
  styleCode: string,
  data: Partial<DictTypeWrite>,
): SystemDictType {
  const index = dictTypeStore.findIndex((item) => item.styleCode === styleCode);
  const current = dictTypeStore[index];
  if (!current) {
    throw new Error(`Dictionary type '${styleCode}' does not exist.`);
  }

  const newParent = clean(data.parentStyleCode) ?? current.parentStyleCode;
  if (newParent !== '0' && !typeExists(newParent)) {
    throw new Error(`Parent Style Code '${newParent}' does not exist.`);
  }
  if (newParent !== current.parentStyleCode && isTypeDescendant(styleCode, newParent)) {
    throw new Error('A dictionary type cannot be moved under itself or one of its descendants.');
  }

  const requested = data.displayOrder;
  const wantsSpecificOrder = requested !== undefined && requested > 0;
  if (newParent !== current.parentStyleCode || wantsSpecificOrder) {
    const siblings = siblingTypes(newParent, styleCode).map((item) => item.styleCode);
    insertAt(
      siblings,
      wantsSpecificOrder ? requested! - 1 : siblings.length,
      styleCode,
    );
    renumberTypes(newParent, siblings);
    if (newParent !== current.parentStyleCode) {
      renumberTypes(
        current.parentStyleCode,
        siblingTypes(current.parentStyleCode).map((item) => item.styleCode),
      );
    }
  }

  const updated: SystemDictType = {
    ...current,
    ...data,
    displayOrder:
      wantsSpecificOrder && requested !== undefined
        ? requested
        : current.displayOrder,
    parentStyleCode: newParent,
    styleCode,
  };
  dictTypeStore[index] = updated;
  bumpVersion();
  return structuredClone(updated);
}

export function moveSampleDictType(data: SystemDictApi.DictTypeMove): SystemDictType[] {
  const current = dictTypeStore.find((item) => item.styleCode === data.styleCode);
  if (!current) {
    throw new Error(`Dictionary type '${data.styleCode}' does not exist.`);
  }
  const parentStyleCode = clean(data.parentStyleCode) ?? current.parentStyleCode;
  if (parentStyleCode !== '0' && !typeExists(parentStyleCode)) {
    throw new Error(`Parent Style Code '${parentStyleCode}' does not exist.`);
  }
  if (parentStyleCode !== current.parentStyleCode && isTypeDescendant(current.styleCode, parentStyleCode)) {
    throw new Error('A dictionary type cannot be moved under itself or one of its descendants.');
  }

  const siblings = siblingTypes(parentStyleCode, current.styleCode).map((item) => item.styleCode);
  insertAt(siblings, data.targetIndex, current.styleCode);
  renumberTypes(parentStyleCode, siblings);
  if (parentStyleCode !== current.parentStyleCode) {
    renumberTypes(
      current.parentStyleCode,
      siblingTypes(current.parentStyleCode).map((item) => item.styleCode),
    );
  }
  current.parentStyleCode = parentStyleCode;
  bumpVersion();
  return querySampleDictTypes();
}

export function deleteSampleDictType(styleCode: string): boolean {
  const index = dictTypeStore.findIndex((item) => item.styleCode === styleCode);
  const current = dictTypeStore[index];
  if (!current) {
    return false;
  }
  if (dictTypeStore.some((item) => item.parentStyleCode === styleCode)) {
    throw new Error('Delete or move the child dictionary types first.');
  }
  if (dictDataStore.some((item) => item.styleCode === styleCode)) {
    throw new Error('Delete the dictionary data first.');
  }

  dictTypeStore.splice(index, 1);
  renumberTypes(
    current.parentStyleCode,
    siblingTypes(current.parentStyleCode).map((item) => item.styleCode),
  );
  bumpVersion();
  return true;
}

export function querySampleDictData(
  params: SampleDictQueryParams = {},
): SystemDictData[] {
  const styleCode = clean(params.styleCode ?? params.dictCode);
  if (!styleCode) {
    return [];
  }
  const subStyleName = clean(params.subStyleName ?? (params as any).label);
  const subStyleCode = clean(params.subStyleCode ?? (params as any).value);

  return structuredClone(
    siblingData(styleCode).filter(
      (item) =>
        (!subStyleName ||
          item.subStyleName.toLowerCase().includes(subStyleName.toLowerCase())) &&
        (!subStyleCode ||
          item.subStyleCode.toLowerCase().includes(subStyleCode.toLowerCase())),
    ),
  );
}

export function createSampleDictData(data: DictDataWrite): SystemDictData {
  const styleCode = clean(data.styleCode);
  const subStyleCode = clean(data.subStyleCode);
  if (!styleCode || !subStyleCode || !clean(data.subStyleName)) {
    throw new Error('Style Code, Sub Style Code and Sub Style Name are required.');
  }
  if (!typeExists(styleCode)) {
    throw new Error(`Dictionary type '${styleCode}' does not exist.`);
  }
  if (dictDataStore.some((item) => item.subStyleCode === subStyleCode)) {
    throw new Error(`Sub Style Code '${subStyleCode}' already exists.`);
  }

  const siblings = siblingData(styleCode).map((item) => item.subStyleCode);
  const requested = data.displayOrder && data.displayOrder > 0 ? data.displayOrder : siblings.length + 1;
  insertAt(siblings, requested - 1, subStyleCode);
  renumberData(styleCode, siblings);

  dataSequence += 1;
  const created: SystemDictData = {
    ...data,
    createTime: formatDateTime(new Date()),
    displayOrder: requested,
    id: dataSequence,
    styleCode,
    subStyleCode,
    subStyleName: data.subStyleName!.trim(),
    subStyleNameExt: clean(data.subStyleNameExt) ?? null,
  };
  dictDataStore.push(created);
  bumpVersion();
  return structuredClone(created);
}

export function updateSampleDictData(
  subStyleCode: string,
  data: Partial<DictDataWrite>,
): SystemDictData {
  const index = dictDataStore.findIndex((item) => item.subStyleCode === subStyleCode);
  const current = dictDataStore[index];
  if (!current) {
    throw new Error(`Dictionary data '${subStyleCode}' does not exist.`);
  }

  const requested = data.displayOrder;
  if (requested !== undefined && requested > 0 && requested !== current.displayOrder) {
    const siblings = siblingData(current.styleCode, subStyleCode).map(
      (item) => item.subStyleCode,
    );
    insertAt(siblings, requested - 1, subStyleCode);
    renumberData(current.styleCode, siblings);
  }

  dictDataStore[index] = {
    ...current,
    ...data,
    displayOrder:
      requested !== undefined && requested > 0 ? requested : current.displayOrder,
    styleCode: current.styleCode,
    subStyleCode,
    subStyleNameExt:
      data.subStyleNameExt === undefined
        ? current.subStyleNameExt
        : (clean(data.subStyleNameExt) ?? null),
  };
  bumpVersion();
  return structuredClone(dictDataStore[index]);
}

export function moveSampleDictData(data: SystemDictApi.DictDataMove): SystemDictData[] {
  const current = dictDataStore.find((item) => item.subStyleCode === data.subStyleCode);
  if (!current) {
    throw new Error(`Dictionary data '${data.subStyleCode}' does not exist.`);
  }
  const oldStyleCode = current.styleCode;
  const targetStyleCode = clean(data.targetStyleCode) ?? oldStyleCode;
  if (targetStyleCode !== oldStyleCode && !typeExists(targetStyleCode)) {
    throw new Error(`Dictionary type '${targetStyleCode}' does not exist.`);
  }

  const siblings = siblingData(targetStyleCode, current.subStyleCode).map(
    (item) => item.subStyleCode,
  );
  insertAt(siblings, data.targetIndex, current.subStyleCode);
  renumberData(targetStyleCode, siblings);
  if (targetStyleCode !== oldStyleCode) {
    renumberData(
      oldStyleCode,
      siblingData(oldStyleCode, current.subStyleCode).map((item) => item.subStyleCode),
    );
    current.styleCode = targetStyleCode;
  }
  bumpVersion();
  return querySampleDictData({ styleCode: targetStyleCode });
}

export function deleteSampleDictData(subStyleCode: string): boolean {
  const index = dictDataStore.findIndex((item) => item.subStyleCode === subStyleCode);
  const current = dictDataStore[index];
  if (!current) {
    return false;
  }
  dictDataStore.splice(index, 1);
  renumberData(
    current.styleCode,
    siblingData(current.styleCode).map((item) => item.subStyleCode),
  );
  bumpVersion();
  return true;
}

/** Enabled dict entries shaped like DictItem: { label, value, color? } */
export function getSampleEnabledDictData(code: string) {
  return dictDataStore
    .filter((item) => item.styleCode === code)
    .toSorted((a, b) => a.displayOrder - b.displayOrder)
    .map(({ subStyleName, subStyleCode, subStyleNameExt }) => ({
      ...(subStyleNameExt ? { color: subStyleNameExt } : {}),
      label: subStyleName,
      value: subStyleCode,
    }));
}

export function getSampleAllEnabledDicts() {
  const result: Record<string, ReturnType<typeof getSampleEnabledDictData>> = {};
  for (const type of dictTypeStore) {
    result[type.styleCode] = getSampleEnabledDictData(type.styleCode);
  }
  return result;
}

export function getSampleDictVersion() {
  return dictVersion;
}
