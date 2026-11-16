import { computed } from 'vue';
import { useRoute } from 'vue-router';

const STORAGE_PREFIX = 'vben-table-column-widths';

function getStorageKey(routePath: string): string {
  return `${STORAGE_PREFIX}:${routePath}`;
}

function readSavedWidths(key: string): Record<string, number> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const result: Record<string, number> = {};
    for (const [field, width] of Object.entries(parsed)) {
      if (
        typeof width === 'number' &&
        Number.isFinite(width) &&
        width > 0
      ) {
        result[field] = width;
      }
    }
    return result;
  } catch {
    // Ignore corrupt or unreadable storage data.
  }
  return {};
}

function writeSavedWidths(
  key: string,
  widths: Record<string, number>,
): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(widths));
  } catch {
    // Ignore storage quota or serialization errors.
  }
}

/**
 * Persist vxe-table column widths to localStorage, keyed by route path.
 *
 * - On mount, saved widths are merged into the grid columns.
 * - On `column-resizable-change`, the resized column's width is saved.
 * - `resetWidths()` clears the saved layout for the current route.
 */
export function useTableColumnWidths() {
  const route = useRoute();
  const storageKey = computed(() => getStorageKey(route.path));

  function applySavedWidths(
    columns: Array<any> | undefined,
  ): Array<any> {
    if (!columns) return [];
    const saved = readSavedWidths(storageKey.value);
    if (!Object.keys(saved).length) return columns;
    return columns.map((column) => {
      const field = column?.field;
      if (field && saved[field] !== undefined) {
        return { ...column, width: saved[field] };
      }
      return column;
    });
  }

  function handleResize(params: any) {
    const column = params?.column;
    const resizeWidth = params?.resizeWidth;
    const field = column?.field;
    if (
      !field ||
      typeof resizeWidth !== 'number' ||
      !Number.isFinite(resizeWidth) ||
      resizeWidth <= 0
    ) {
      return;
    }
    const saved = readSavedWidths(storageKey.value);
    saved[field] = resizeWidth;
    writeSavedWidths(storageKey.value, saved);
  }

  function resetWidths() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKey.value);
    }
  }

  return {
    applySavedWidths,
    handleResize,
    resetWidths,
    storageKey,
  };
}