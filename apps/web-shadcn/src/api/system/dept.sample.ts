import type { SystemDeptApi } from './dept';

import {
  findTreeById,
  flattenTreeIds,
  formatDateTime,
} from '../sample-helpers';

/**
 * Demo data for the department tree, used when VITE_SYSTEM_SAMPLE=true.
 * Mirrors the /system/dept/* endpoints of the backend mock, in memory.
 */

type SystemDept = SystemDeptApi.SystemDept;

let sequence = 100;

function nextId(): string {
  sequence += 1;
  return `sample-dept-${sequence}`;
}

function sampleDeptFields(id: string) {
  const suffix = id.replace('sample-dept-', '');
  return { deptCode: `D${suffix}`, displayOrder: Number(suffix) || 0 };
}

function buildInitialTree(): SystemDept[] {
  const now = formatDateTime(new Date());
  const node = (
    id: string,
    name: string,
    status: 0 | 1,
    remark?: string,
    children?: SystemDept[],
  ): SystemDept => ({
    children,
    createTime: now,
    id,
    name,
    remark,
    status,
    ...sampleDeptFields(id),
  });

  return [
    node('sample-dept-1', 'Headquarters', 1, 'Company headquarters', [
      node('sample-dept-11', 'R&D Center', 1, undefined, [
        node('sample-dept-111', 'Frontend Team', 1),
        node('sample-dept-112', 'Backend Team', 1),
        node('sample-dept-113', 'QA Team', 1),
      ]),
      node('sample-dept-12', 'Manufacturing', 1, undefined, [
        node('sample-dept-121', 'Assembly Line A', 1),
        node('sample-dept-122', 'Assembly Line B', 1),
        node('sample-dept-123', 'Quality Control', 1),
      ]),
      node('sample-dept-13', 'Procurement', 1),
      node('sample-dept-14', 'Sales', 1),
      node('sample-dept-15', 'Finance', 0, 'Merged soon'),
      node('sample-dept-16', 'HR', 1),
    ]),
  ];
}

let deptTree: SystemDept[] = buildInitialTree();

export function getSampleDeptList(): SystemDept[] {
  return structuredClone(deptTree);
}

/** Looks up a department label for sample users. */
export function getSampleDeptName(id?: string): string {
  if (!id) {
    return '';
  }
  return findTreeById(deptTree, id)?.name ?? '';
}

export function createSampleDept(
  data: Omit<SystemDept, 'children' | 'deptCode' | 'displayOrder' | 'id'>,
): SystemDept {
  const id = nextId();
  const created = {
    ...data,
    ...sampleDeptFields(id),
    id,
    createTime: formatDateTime(new Date()),
  } as unknown as SystemDept;
  const parentId = (data as Record<string, any>).pid;
  const parent =
    parentId && parentId !== '0' ? findTreeById(deptTree, parentId) : undefined;
  if (parent) {
    parent.children = [...(parent.children ?? []), created];
  } else {
    deptTree = [...deptTree, created];
  }
  return structuredClone(created);
}

export function updateSampleDept(
  id: string,
  data: Partial<
    Omit<SystemDept, 'children' | 'deptCode' | 'displayOrder' | 'id'>
  >,
): null | SystemDept {
  const current = findTreeById(deptTree, id);
  if (!current) {
    return null;
  }
  Object.assign(current, data, { id });
  return structuredClone(current);
}

export function deleteSampleDept(id: string): boolean {
  const current = findTreeById(deptTree, id);
  if (!current) {
    return false;
  }
  const remove = (nodes: SystemDept[]): boolean => {
    const index = nodes.findIndex((node) => node.id === id);
    if (index !== -1) {
      nodes.splice(index, 1);
      return true;
    }
    return nodes.some((node) => node.children && remove(node.children));
  };
  return remove(deptTree);
}

export function getSampleDeptIds(): string[] {
  return flattenTreeIds(deptTree);
}
