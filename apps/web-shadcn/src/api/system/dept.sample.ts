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
    createUserName: 'System',
    id,
    name,
    remark,
    status,
    updateTime: now,
    updateUserName: 'Administrator',
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
  data: Omit<SystemDept, 'children' | 'deptCode' | 'displayOrder' | 'id'> & {
    displayOrder?: number;
  },
): SystemDept {
  const id = nextId();
  const created = {
    ...sampleDeptFields(id),
    ...data,
    id,
    createTime: formatDateTime(new Date()),
    createUserName: 'System',
    updateTime: formatDateTime(new Date()),
    updateUserName: 'Administrator',
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
    Omit<SystemDept, 'children' | 'deptCode' | 'displayOrder' | 'id'> & {
      displayOrder?: number;
    }
  >,
): null | SystemDept {
  const current = findTreeById(deptTree, id);
  if (!current) {
    return null;
  }
  Object.assign(current, data, { id });
  return structuredClone(current);
}

export function moveSampleDeptBatch(
  moves: SystemDeptApi.DeptMove[],
): SystemDept[] {
  const isDescendant = (ancestorId: string, candidateId: string): boolean => {
    let current: string | undefined = candidateId;
    let guard = 0;
    while (current && current !== '0' && guard++ < 100) {
      if (current === ancestorId) {
        return true;
      }
      current = findTreeById(deptTree, current)?.pid;
    }
    return false;
  };

  for (const move of moves) {
    const node = findTreeById(deptTree, move.deptCode);
    if (!node) {
      continue;
    }
    const oldPid = node.pid ?? '0';
    const newPid = move.pid || '0';
    if (newPid === node.id || isDescendant(node.id, newPid)) {
      continue;
    }

    const oldSiblings =
      oldPid === '0'
        ? deptTree
        : (findTreeById(deptTree, oldPid)?.children ?? []);
    const oldIndex = oldSiblings.findIndex((n) => n.id === node.id);
    if (oldIndex >= 0) {
      oldSiblings.splice(oldIndex, 1);
    }

    let newSiblings: SystemDept[];
    if (newPid === '0') {
      newSiblings = deptTree;
    } else {
      const parent = findTreeById(deptTree, newPid);
      if (!parent) {
        continue;
      }
      parent.children = parent.children ?? [];
      newSiblings = parent.children;
    }
    const at = Math.max(0, Math.min(move.targetIndex, newSiblings.length));
    newSiblings.splice(at, 0, node);
    node.pid = newPid;

    oldSiblings.forEach((n, i) => {
      n.displayOrder = i + 1;
    });
    newSiblings.forEach((n, i) => {
      n.displayOrder = i + 1;
    });
  }
  return structuredClone(deptTree);
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
