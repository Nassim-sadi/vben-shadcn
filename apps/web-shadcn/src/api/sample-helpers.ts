/**
 * Shared helpers for in-memory sample data stores.
 *
 * Sample stores power the static demo deployment (no backend) and are
 * gated by flags such as VITE_SYSTEM_SAMPLE / VITE_DATA_DISPLAY_SAMPLE.
 * Data lives in memory and resets after a page refresh.
 */

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Format consistent with backend mock: YYYY-MM-DD HH:mm:ss */
export function formatDateTime(date: Date): string {
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(' ');
}

/** Returns true when createTime falls into the optional [start, end] range */
export function inTimeRange(
  createTime: string,
  startTime?: string,
  endTime?: string,
): boolean {
  const time = new Date(createTime).getTime();
  if (startTime) {
    const start = new Date(startTime);
    if (!Number.isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
      if (time < start.getTime()) {
        return false;
      }
    }
  }
  if (endTime) {
    const end = new Date(endTime);
    if (!Number.isNaN(end.getTime())) {
      // End date includes the selected day itself
      end.setHours(23, 59, 59, 999);
      if (time > end.getTime()) {
        return false;
      }
    }
  }
  return true;
}

/** Slices a list into the { items, total } page response shape */
export function paginate<T>(
  list: T[],
  page?: number | string,
  pageSize?: number | string,
): { items: T[]; total: number } {
  const pageNumber = Math.max(1, Number(page) || 1);
  const size = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const start = (pageNumber - 1) * size;
  return {
    items: list.slice(start, start + size),
    total: list.length,
  };
}

/** Recursively looks for a node with the given id in a tree */
export function findTreeById<T extends { children?: T[]; id: string }>(
  tree: T[],
  id: string,
): T | undefined {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children?.length) {
      const found = findTreeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/** Collects all ids of a tree, including nested children */
export function flattenTreeIds<T extends { children?: T[]; id: string }>(
  tree: T[],
): string[] {
  const ids: string[] = [];
  const walk = (nodes: T[]) => {
    for (const node of nodes) {
      ids.push(node.id);
      if (node.children?.length) {
        walk(node.children);
      }
    }
  };
  walk(tree);
  return ids;
}
