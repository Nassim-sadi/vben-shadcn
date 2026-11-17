# Column Width Persistence Plan

**Scope:** Persist vxe-table column widths to `localStorage` so resized columns survive reloads. Column **ordering** is explicitly out of scope.

## Decisions (settled)

| Decision | Choice |
|---|---|
| Scope | **Global** — all tables using `useVbenVxeGrid` get persistence automatically |
| Storage shape | Single JSON object per route: `{ [field]: width }` |
| Storage key | `vben-table-column-widths:<route.path>` (e.g. `/system/menu`) |
| Keying | `route.path` from `vue-router` — stable across reloads, unique per page |
| Event | vxe-table `resizableChange` (params: `{ column, resizeWidth }`) |
| Reset UX | Toolbar button on menu view; other views get persistence silently |
| Column ordering | **Not implemented** |

## Implementation (already done)

1. **New composable** — `apps/web-shadcn/src/adapter/vxe-table/use-column-widths.ts`
   - `useTableColumnWidths()` returns `{ applySavedWidths, handleResize, resetWidths, storageKey }`
   - `applySavedWidths(columns)` merges saved widths into grid columns on mount; validates each value is a finite positive number; corrupt/unreadable storage is ignored
   - `handleResize(params)` reads `params.resizeWidth` and writes the map back on `resizableChange`
   - `resetWidths()` clears the layout for the current route

2. **Adapter wired in** — `apps/web-shadcn/src/adapter/vxe-table.ts`
   - `useVbenVxeGrid` now calls `useTableColumnWidths()` and:
     - applies saved widths to `gridOptions.columns` before delegating to the base composable
     - attaches `resizableChange: handleResize` to `gridEvents`
   - `useTableColumnWidths` re-exported from the adapter barrel
   - This is the single chokepoint all 16 views use, so persistence is automatic everywhere

3. **Reset button demo** — `apps/web-shadcn/src/views/system/menu/list.vue`
   - "Reset column width" button in `#toolbar-tools` calls `resetWidths()` then re-applies default columns via `gridApi.setGridOptions({ columns: useColumns(onActionClick) })`

4. **Locales** — `packages/locales/src/langs/{zh-CN,en-US,zh-TW}/ui.json`
   - Added `ui.actionTitle.resetColumnWidth` to all three locale files

## Files changed

- `apps/web-shadcn/src/adapter/vxe-table/use-column-widths.ts` (new)
- `apps/web-shadcn/src/adapter/vxe-table.ts` (modified)
- `apps/web-shadcn/src/views/system/menu/list.vue` (modified)
- `packages/locales/src/langs/zh-CN/ui.json` (modified)
- `packages/locales/src/langs/en-US/ui.json` (modified)
- `packages/locales/src/langs/zh-TW/ui.json` (modified)

## Validation

- `pnpm typecheck` in `apps/web-shadcn` passes (already verified)
- Manual: open `/system/menu`, drag a column border, reload — width persists
- Manual: click "Reset column width" — widths return to defaults and storage key is cleared
- Manual: verify other views (e.g. `/system/user`, `/system/role`) persist widths without any per-view code

## Known limitations

- Two grids on the same route share one layout (no per-table `tableId` yet)
- `minWidth` columns (e.g. `component`) can be shrunk below their declared `minWidth` by the user; saved value is written as-is and restored on next load
- No UI to clear widths except the reset button on the menu view