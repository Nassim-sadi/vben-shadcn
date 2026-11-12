# MES Admin Front-End Port — Progress Log

> **Branch**: `feat/mes-shadcn` · **Repo**: [Nassim-sadi/admin-dashboard-vben-shadcn](https://github.com/Nassim-sadi/admin-dashboard-vben-shadcn) · **Last updated**: 2026-11-11

---

## ✅ Phase 1 — Scaffold

- Inspected the monorepo structure and created `apps/web-shadcn` from the playground app
- Added shadcn-vue component shims and created `src/adapter-ui` barrel
- Removed all direct `antdv-next` imports
- Fixed duplicate `vue-router` issue via `pnpm-workspace.yaml` override
- Pinned `reka-ui@2.11.0` and other new deps; `pnpm install` succeeds
- Added root overrides for `@vue/compiler-sfc`
- Updated app bootstrap (Toaster, sonner, locale)

---

## ✅ Phase 2 — Pure shadcn-vue Port + Data Display CRUD

**Commit**: `16ed2b04b` — `feat(@vben/web-shadcn): port to pure shadcn-vue and add Data Display CRUD`

### shadcn-vue Port

- **Deleted** entire `src/adapter-ui/` shim layer (12 files)
- **Created** `src/components/ui/app/` — 13 app-local shadcn compositions: `AlertConfirm.vue`, `Card.vue`, `DatePickerField.vue`, `DividerField.vue`, `InputNumberField.vue`, `InputSearch.vue`, `RadioGroupField.vue`, `RangePickerField.vue`, `SelectField.vue`, `Spin.vue`, `Tag.vue`, `TextareaField.vue`, `TreeSelectField.vue`, `index.ts`
- Updated `src/adapter/component/index.ts` — all imports now use `@vben-core/shadcn-ui` and `#/components/ui/app`
- Updated `src/adapter/vxe-table.ts` — replaced compat wrappers with direct shadcn-ui primitives
- Updated `src/adapter/form.ts`

### Cleanup

- Deleted unused example API files, router modules and `views/examples/**`; kept the access control and feature demos under `views/demos/**`
- Trimmed `demos.json` locale files (zh-CN, en-US, zh-TW) and deleted `examples.json` (all 3 langs)

### Data Display CRUD

- **Mock backend** (`apps/backend-mock/`):
  - `utils/data-display-utils.ts` — in-memory data store + helpers
  - `api/data-display/list.ts` — `GET /api/data-display/list`
  - `api/data-display/.post.ts` — `POST /api/data-display`
  - `api/data-display/[id].put.ts` — `PUT /api/data-display/:id`
  - `api/data-display/[id].delete.ts` — `DELETE /api/data-display/:id`
  - Added "Data Display" menu to `MOCK_MENUS` (all 3 user roles) and `MOCK_MENU_LIST`
- **API client**: `src/api/data-display.ts`, exported from `src/api/index.ts`
- **Route**: `src/router/routes/modules/data-display.ts`
- **Views**: `src/views/data-display/index.vue`, `data.ts`, `modules/form.vue`
- **i18n**: Data Display keys added to `page.json` (zh-CN, en-US, zh-TW)

### README

- Updated with full package list, retained demo pages table, getting-started guide, mock-backend notes

### Verification

- `pnpm -F @vben/web-shadcn run typecheck` → **0 errors**
- `pnpm -F @vben/backend-mock run typecheck` → **0 errors**
- Production build succeeded — 5724 modules, 22.42 s

---

## ✅ Phase 3 — Workspace Prune

**Commit**: `144fcc96c` — `chore(project): prune unused workspace catalogs and remove ghost docs folder (Phase 3 final)`

- Removed `docs` from `pnpm-workspace.yaml` packages list
- Removed 5 unused catalog entries:
  - `@nolebase/vitepress-plugin-git-changelog`
  - `@vite-pwa/vitepress`
  - `medium-zoom`
  - `vitepress`
  - `vitepress-plugin-group-icons`
- Deleted the empty `docs/` folder
- Ran `pnpm install` → lockfile updated, postinstall stubs rebuilt, clean
- Full turbo typecheck: **40/40 tasks successful**
- Pushed → pre-push hooks passed (40/40 cached, 433 ms)

---

## ✅ Phase 4 — Workspace Cleanup + shadcn-Only Scripts

- Removed the root `playground/` app entirely (tracked files + workspace entry) and deleted the `antdv-next` catalog entry
- Root scripts now target the shadcn app only:
  - `dev` → `pnpm -F @vben/web-shadcn run dev`
  - `build` → `turbo build --filter=@vben/web-shadcn`
  - `preview`, `test:e2e` → scoped to `@vben/web-shadcn`
  - added `dev:mock` for running `apps/backend-mock` standalone
- Fixed runtime bugs left over from the port:
  - delete loading toasts now resolve (`toast.success(..., { id: hideLoading })`) in Data Display and all system pages
  - added the missing `common.action` key to `common.json` (en-US / zh-CN / zh-TW)
  - removed the playground-only preferences extension (its locale keys no longer exist)
  - IconPicker now uses the shadcn input protocol (no antd `addonAfter` slot)
  - Data Display date filter includes the whole end day
  - `RadioGroup` honours antd-style `buttonStyle` by rendering a toggle group
- Removed the `/examples/drawer` e2e case (its page no longer exists); `layout-system` suite now only uses retained routes
- Updated Dockerfile (copies `apps/web-shadcn/dist`), VS Code launch/workspace configs, Tailwind `@source`, oxlint ignores, changeset and CHANGELOG references
- README/progress no longer reference the removed playground

---

## 📌 Constraints & Rules (for future work)

| Rule | Detail |
| --- | --- |
| Package manager | `pnpm` only — no npm/yarn |
| New dependencies | Pin to exact version; no packages published in last 14 days |
| Backend mock | Only extend it (add endpoints/data); never modify existing logic |
| i18n | All new user-visible strings must have zh-CN, en-US, zh-TW keys |
| Workspace | Only `apps/web-shadcn` + `apps/backend-mock`; root `dev` / `build` / `preview` / `test:e2e` target the shadcn app |
| Commitlint scope | Must be a valid package name or one of: `project`, `style`, `lint`, `ci`, `dev`, `deploy`, `other` |
| Git / pnpm install | Require `BypassSandbox: true` |

---

## 🔭 Roadmap (not yet started)

- [ ] MES Module: Excel import/export (`exceljs` + `@vxe-ui/plugin-export-xlsx`), zod validation, barcode/QR labels, print, ECharts dashboards
- [ ] Richer Data Display view: proper MES work order UI with status workflows and domain fields
- [ ] Peer dependency cleanup: investigate `pnpm peers check` warnings
- [x] Remove playground from workspace — done in Phase 4
