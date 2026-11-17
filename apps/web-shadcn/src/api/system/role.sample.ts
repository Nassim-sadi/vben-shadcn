import type { SystemRoleApi } from './role';

import { formatDateTime, inTimeRange, paginate } from '../sample-helpers';
import { getSampleMenuIds } from './menu.sample';

/**
 * Demo data for the role list, used when VITE_SYSTEM_SAMPLE=true.
 * Mirrors the /system/role/* endpoints of the backend mock, in memory.
 */

type SystemRole = SystemRoleApi.SystemRole;

const SAMPLE_SIZE = 8;
const ROLES: Array<{ code: string; name: string }> = [
  { code: 'super-admin', name: 'Super Admin' },
  { code: 'sys-admin', name: 'System Admin' },
  { code: 'prod-manager', name: 'Production Manager' },
  { code: 'wh-operator', name: 'Warehouse Operator' },
  { code: 'qc-inspector', name: 'Quality Inspector' },
  { code: 'line-supervisor', name: 'Line Supervisor' },
  { code: 'viewer', name: 'Viewer' },
  { code: 'maintenance', name: 'Maintenance' },
];

let roleStore: SystemRole[] = [];
let sequence = SAMPLE_SIZE;

function buildInitialRoles(): SystemRole[] {
  const menuIds = getSampleMenuIds();
  const now = Date.now();

  return ROLES.map((role, index) => {
    const created = new Date(now - (index + 1) * 24 * 60 * 60 * 1000);
    const permissionCount = Math.max(2, menuIds.length - index * 2);
    return {
      id: `sample-role-${index + 1}`,
      name: role.name,
      roleCode: role.code,
      status: index === SAMPLE_SIZE - 1 ? 0 : 1,
      permissions: menuIds.slice(0, permissionCount),
      remark: index % 2 === 0 ? undefined : 'Auto generated role.',
      createTime: formatDateTime(created),
    } satisfies SystemRole;
  });
}

export interface SampleRoleQueryParams {
  [key: string]: any;
  endTime?: string;
  keyword?: string;
  name?: string;
  page?: number | string;
  pageSize?: number | string;
  remark?: string;
  startTime?: string;
  status?: number | string;
}

export function querySampleRoles(params: SampleRoleQueryParams = {}) {
  let filtered = [...roleStore];

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        (item.roleCode ?? '').toLowerCase().includes(keyword),
    );
  }

  if (params.name) {
    const keyword = params.name.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }

  if (params.remark) {
    const keyword = params.remark.toLowerCase().trim();
    filtered = filtered.filter(
      (item) => item.remark && item.remark.toLowerCase().includes(keyword),
    );
  }

  if (params.status !== undefined && params.status !== '') {
    filtered = filtered.filter((item) => item.status === Number(params.status));
  }

  filtered = filtered.filter((item) =>
    inTimeRange(item.createTime, params.startTime, params.endTime),
  );

  return paginate(filtered, params.page, params.pageSize);
}

export function createSampleRole(data: Omit<SystemRole, 'id'>): SystemRole {
  sequence += 1;
  const created = {
    ...data,
    id: `sample-role-${sequence}`,
    createTime: formatDateTime(new Date()),
  } as unknown as SystemRole;
  roleStore = [created, ...roleStore];
  return structuredClone(created);
}

export function updateSampleRole(
  id: string,
  data: Partial<Omit<SystemRole, 'id'>>,
): null | SystemRole {
  const index = roleStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const updated = { ...roleStore[index], ...data, id } as SystemRole;
  roleStore[index] = updated;
  return structuredClone(updated);
}

export function deleteSampleRole(id: string): boolean {
  const index = roleStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  roleStore.splice(index, 1);
  return true;
}

export function getSampleRoleCodes(): string[] {
  return ROLES.map((role) => role.code);
}

roleStore = buildInitialRoles();
