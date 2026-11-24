import type { SystemMenuApi } from './menu';

import {
  findTreeById,
  flattenTreeIds,
  formatDateTime,
} from '../sample-helpers';

/**
 * Demo data for the menu tree, used when VITE_SYSTEM_SAMPLE=true.
 * Mirrors the /system/menu/* endpoints of the backend mock, in memory.
 */

type SystemMenu = SystemMenuApi.SystemMenu;

let sequence = 500;

function nextId(): string {
  sequence += 1;
  return `sample-menu-${sequence}`;
}

function button(
  id: string,
  pid: string,
  name: string,
  authCode: string,
): SystemMenu {
  let title = 'common.delete';
  if (name.endsWith('Create')) {
    title = 'common.create';
  } else if (name.endsWith('Edit')) {
    title = 'common.edit';
  }
  return {
    authCode,
    id,
    name,
    pid,
    path: '',
    status: 1,
    type: 'button',
    meta: { title },
  };
}

function buildInitialTree(): SystemMenu[] {
  const node = (
    data: Partial<SystemMenu> & {
      id: string;
      name: string;
      path: string;
      type: SystemMenu['type'];
    },
  ): SystemMenu => ({
    authCode: '',
    pid: '',
    status: 1,
    createTime: formatDateTime(new Date()),
    createUserName: 'System',
    updateTime: formatDateTime(new Date()),
    updateUserName: 'Administrator',
    ...data,
  });

  return [
    node({
      id: 'sample-menu-1',
      name: 'Dashboard',
      path: '/dashboard',
      type: 'catalog',
      meta: {
        icon: 'lucide:layout-dashboard',
        order: 1,
        title: 'page.dashboard.title',
      },
      redirect: '/dashboard/analytics',
      children: [
        node({
          id: 'sample-menu-101',
          pid: 'sample-menu-1',
          name: 'Analytics',
          path: '/dashboard/analytics',
          type: 'menu',
          component: '/dashboard/analytics/index',
          meta: {
            affixTab: true,
            icon: 'lucide:area-chart',
            keepAlive: true,
            title: 'page.dashboard.analytics',
          },
        }),
        node({
          id: 'sample-menu-102',
          pid: 'sample-menu-1',
          name: 'Workspace',
          path: '/dashboard/workspace',
          type: 'menu',
          component: '/dashboard/workspace/index',
          meta: { icon: 'carbon:workspace', title: 'page.dashboard.workspace' },
        }),
      ],
    }),
    node({
      id: 'sample-menu-2',
      name: 'DataDisplay',
      path: '/data-display',
      type: 'menu',
      component: '/data-display/index',
      meta: {
        icon: 'lucide:table-properties',
        order: 10,
        title: 'page.dataDisplay.title',
      },
    }),
    node({
      id: 'sample-menu-3',
      name: 'System',
      path: '/system',
      type: 'catalog',
      meta: {
        icon: 'ion:settings-outline',
        order: 9997,
        title: 'system.title',
      },
      children: [
        node({
          id: 'sample-menu-301',
          pid: 'sample-menu-3',
          name: 'SystemMenu',
          path: '/system/menu',
          type: 'menu',
          authCode: 'System:Menu:List',
          component: '/system/menu/list',
          meta: { icon: 'mdi:menu', title: 'system.menu.title' },
          children: [
            button(
              'sample-menu-3011',
              'sample-menu-301',
              'SystemMenuCreate',
              'System:Menu:Create',
            ),
            button(
              'sample-menu-3012',
              'sample-menu-301',
              'SystemMenuEdit',
              'System:Menu:Edit',
            ),
            button(
              'sample-menu-3013',
              'sample-menu-301',
              'SystemMenuDelete',
              'System:Menu:Delete',
            ),
          ],
        }),
        node({
          id: 'sample-menu-302',
          pid: 'sample-menu-3',
          name: 'SystemRole',
          path: '/system/role',
          type: 'menu',
          authCode: 'System:Role:List',
          component: '/system/role/list',
          meta: { icon: 'mdi:account-group', title: 'system.role.title' },
          children: [
            button(
              'sample-menu-3021',
              'sample-menu-302',
              'SystemRoleCreate',
              'System:Role:Create',
            ),
            button(
              'sample-menu-3022',
              'sample-menu-302',
              'SystemRoleEdit',
              'System:Role:Edit',
            ),
            button(
              'sample-menu-3023',
              'sample-menu-302',
              'SystemRoleDelete',
              'System:Role:Delete',
            ),
          ],
        }),
        node({
          id: 'sample-menu-303',
          pid: 'sample-menu-3',
          name: 'SystemUser',
          path: '/system/user',
          type: 'menu',
          authCode: 'System:User:List',
          component: '/system/user/list',
          meta: { icon: 'mdi:user', title: 'system.user.title' },
          children: [
            button(
              'sample-menu-3031',
              'sample-menu-303',
              'SystemUserCreate',
              'System:User:Create',
            ),
            button(
              'sample-menu-3032',
              'sample-menu-303',
              'SystemUserEdit',
              'System:User:Edit',
            ),
            button(
              'sample-menu-3033',
              'sample-menu-303',
              'SystemUserDelete',
              'System:User:Delete',
            ),
          ],
        }),
        node({
          id: 'sample-menu-304',
          pid: 'sample-menu-3',
          name: 'SystemDept',
          path: '/system/dept',
          type: 'menu',
          authCode: 'System:Dept:List',
          component: '/system/dept/list',
          meta: { icon: 'charm:organisation', title: 'system.dept.title' },
        }),
        node({
          id: 'sample-menu-305',
          pid: 'sample-menu-3',
          name: 'SystemDict',
          path: '/system/dict',
          type: 'menu',
          authCode: 'System:Dict:List',
          component: '/system/dict/list',
          meta: { icon: 'mdi:book-cog-outline', title: 'system.dict.title' },
        }),
      ],
    }),
    node({
      id: 'sample-menu-4',
      name: 'Print',
      path: '/print',
      type: 'catalog',
      meta: { icon: 'lucide:printer', order: 900, title: 'page.print.title' },
      children: [
        node({
          id: 'sample-menu-401',
          pid: 'sample-menu-4',
          name: 'PrintSn',
          path: '/print/sn',
          type: 'menu',
          component: '/print/sn/index',
          meta: { icon: 'lucide:scan-barcode', title: 'page.print.sn.title' },
        }),
      ],
    }),
  ];
}

let menuTree: SystemMenu[] = buildInitialTree();

export function getSampleMenuList(): SystemMenu[] {
  return structuredClone(menuTree);
}

export function isSampleMenuNameExists(name: string, id?: string): boolean {
  const walk = (nodes: SystemMenu[]): boolean =>
    nodes.some(
      (node) =>
        (node.name === name && node.id !== id) ||
        (node.children && walk(node.children)),
    );
  return walk(menuTree);
}

export function isSampleMenuPathExists(path: string, id?: string): boolean {
  const walk = (nodes: SystemMenu[]): boolean =>
    nodes.some(
      (node) =>
        (node.path === path && node.id !== id) ||
        (node.children && walk(node.children)),
    );
  return walk(menuTree);
}

export function createSampleMenu(
  data: Omit<SystemMenu, 'children' | 'id'>,
): SystemMenu {
  const created = {
    ...data,
    id: nextId(),
  } as SystemMenu;
  const parent = data.pid ? findTreeById(menuTree, data.pid) : undefined;
  if (parent) {
    parent.children = [...(parent.children ?? []), created];
  } else {
    menuTree = [...menuTree, created];
  }
  return structuredClone(created);
}

export function updateSampleMenu(
  id: string,
  data: Partial<Omit<SystemMenu, 'children' | 'id'>>,
): null | SystemMenu {
  const current = findTreeById(menuTree, id);
  if (!current) {
    return null;
  }
  Object.assign(current, data, { id });
  return structuredClone(current);
}

export function deleteSampleMenu(id: string): boolean {
  const remove = (nodes: SystemMenu[]): boolean => {
    const index = nodes.findIndex((node) => node.id === id);
    if (index !== -1) {
      nodes.splice(index, 1);
      return true;
    }
    return nodes.some((node) => node.children && remove(node.children));
  };
  return remove(menuTree);
}

export function moveSampleMenu(move: SystemMenuApi.MenuMove): SystemMenu | null {
  const isDescendant = (ancestorId: string, candidateId: string): boolean => {
    let current: string | undefined = candidateId;
    let guard = 0;
    while (current && current !== '0' && guard++ < 100) {
      if (current === ancestorId) return true;
      current = findTreeById(menuTree, current)?.pid;
    }
    return false;
  };

  const node = findTreeById(menuTree, move.menuCode);
  if (!node) return null;
  const oldPid = node.pid || '0';
  const newPid = move.pid || '0';
  if (newPid === node.id || isDescendant(node.id, newPid)) return null;
  const parent = newPid === '0' ? undefined : findTreeById(menuTree, newPid);
  if (newPid !== '0' && !parent) return null;
  if (parent?.type === 'button') return null;

  const oldSiblings =
    oldPid === '0' ? menuTree : (findTreeById(menuTree, oldPid)?.children ?? []);
  const oldIndex = oldSiblings.findIndex((n) => n.id === node.id);
  if (oldIndex >= 0) oldSiblings.splice(oldIndex, 1);

  let newSiblings: SystemMenu[];
  if (newPid === '0') {
    newSiblings = menuTree;
  } else {
    parent!.children = parent!.children ?? [];
    newSiblings = parent!.children;
  }
  const at = Math.max(0, Math.min(move.targetIndex, newSiblings.length));
  newSiblings.splice(at, 0, node);
  node.pid = newPid;
  oldSiblings.forEach((n, i) => {
    n.meta = { ...n.meta, order: i + 1 };
  });
  newSiblings.forEach((n, i) => {
    n.meta = { ...n.meta, order: i + 1 };
  });
  return structuredClone(node);
}

export function getSampleMenuIds(): string[] {
  return flattenTreeIds(menuTree);
}
