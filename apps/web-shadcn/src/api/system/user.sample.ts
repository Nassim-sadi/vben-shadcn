import type { SystemUserApi } from './user';

import { formatDateTime, inTimeRange, paginate } from '../sample-helpers';
import { getSampleDeptIds } from './dept.sample';
import { getSampleRoleCodes } from './role.sample';

/**
 * Demo data for the user list, used when VITE_SYSTEM_SAMPLE=true.
 * Mirrors the /system/user/* endpoints of the backend mock, in memory.
 */

type SystemUser = SystemUserApi.SystemUser;

const NAMES = [
  'Alice Chen',
  'Bruno Rossi',
  'Chen Wei',
  'Daniel Kim',
  'Emma Novak',
  'Farid Haddad',
  'Grace Liu',
  'Hiro Tanaka',
  'Ines Silva',
  'Jakub Kowalski',
  'Karim Aziz',
  'Lena Fischer',
  'Marco Bianchi',
  'Nadia Petrova',
  'Omar Khalil',
  'Paula Mendes',
  'Qi Wang',
  'Rania Toumi',
  'Sofia Andersen',
  'Tommy Nguyen',
  'Uma Patel',
  'Victor Dubois',
  'Wen Li',
  'Yara Mansour',
];

const SAMPLE_SIZE = 24;

function buildInitialUsers(): SystemUser[] {
  const deptIds = getSampleDeptIds();
  const roleCodes = getSampleRoleCodes();
  const now = Date.now();

  return NAMES.map((name, index) => {
    const created = new Date(now - (index + 1) * 12 * 60 * 60 * 1000);
    return {
      id: `sample-user-${index + 1}`,
      name,
      userCode: `UC-${String(index + 1).padStart(4, '0')}`,
      roleCode: roleCodes[index % roleCodes.length] as string,
      gender: (index % 3) as 0 | 1 | 2,
      status: index % 4 === 3 ? 0 : 1,
      deptId: deptIds[index % deptIds.length] as string,
      remark: index % 3 === 0 ? 'Key account manager.' : undefined,
      permissions: [],
      createTime: formatDateTime(created),
    } satisfies SystemUser;
  });
}

let userStore: SystemUser[] = buildInitialUsers();
let sequence = SAMPLE_SIZE;

export interface SampleUserQueryParams {
  [key: string]: any;
  deptId?: string;
  endTime?: string;
  gender?: number | string;
  id?: string;
  keyword?: string;
  name?: string;
  page?: number | string;
  pageSize?: number | string;
  startTime?: string;
  status?: number | string;
  userCode?: string;
}

export function querySampleUsers(params: SampleUserQueryParams = {}) {
  let filtered = [...userStore];

  if (params.keyword) {
    const keyword = params.keyword.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.userCode.toLowerCase().includes(keyword),
    );
  }

  if (params.name) {
    const keyword = params.name.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }

  if (params.id) {
    const keyword = params.id.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.id.toLowerCase().includes(keyword),
    );
  }

  if (params.userCode) {
    const keyword = params.userCode.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.userCode.toLowerCase().includes(keyword),
    );
  }

  if (params.deptId) {
    filtered = filtered.filter((item) => item.deptId === params.deptId);
  }

  if (params.status !== undefined && params.status !== '') {
    filtered = filtered.filter((item) => item.status === Number(params.status));
  }

  if (params.gender !== undefined && params.gender !== '') {
    filtered = filtered.filter((item) => item.gender === Number(params.gender));
  }

  filtered = filtered.filter((item) =>
    inTimeRange(item.createTime ?? '', params.startTime, params.endTime),
  );

  return paginate(filtered, params.page, params.pageSize);
}

/** Mirrors GET /system/user/export-page for the sample-data environment. */
export function querySampleUserExportPage(after?: string, limit?: number) {
  const size = Math.min(Math.max(limit ?? 500, 1), 1000);
  const cursor = after ?? '';
  const sorted = [...userStore].sort((a, b) => a.userCode.localeCompare(b.userCode));
  const found = cursor
    ? sorted.findIndex((item) => item.userCode.localeCompare(cursor) > 0)
    : 0;
  const start = found < 0 ? sorted.length : found;
  const items = sorted.slice(start, start + size);
  const hasMore = start + items.length < sorted.length;

  return {
    hasMore,
    items: items.map(
      (item): SystemUserApi.SystemUserExport => ({
        createTime: item.createTime,
        createUserName: 'Sample',
        deptCode: item.deptId ?? '',
        gender: item.gender ?? 0,
        id: item.id,
        mobile: item.mobile,
        name: item.name,
        photoPath: item.photoPath,
        remark: item.remark,
        roleCode: item.roleCode ?? '',
        roleName: item.roleCode ?? '',
        status: item.status,
        updateDate: item.updateDate,
        updateUserName: item.updateUserName,
        userCode: item.userCode,
      }),
    ),
    nextAfter: hasMore ? (items[items.length - 1]?.userCode ?? null) : null,
    total: cursor ? 0 : sorted.length,
  } satisfies SystemUserApi.UserExportPage;
}

export function createSampleUser(data: Omit<SystemUser, 'id'>): SystemUser {
  sequence += 1;
  const created = {
    ...data,
    id: `sample-user-${sequence}`,
    createTime: formatDateTime(new Date()),
  } as unknown as SystemUser;
  userStore = [created, ...userStore];
  return structuredClone(created);
}

export function updateSampleUser(
  id: string,
  data: Partial<Omit<SystemUser, 'id'>>,
): null | SystemUser {
  const index = userStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const updated = { ...userStore[index], ...data, id } as SystemUser;
  userStore[index] = updated;
  return structuredClone(updated);
}

export function deleteSampleUser(id: string): boolean {
  const index = userStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  userStore.splice(index, 1);
  return true;
}
