# Plan: Convert All Chinese to English via i18n

## Goal

Replace every user-facing Chinese string and Chinese comment in `apps/web-shadcn/src/` with English, using the project's existing i18n infrastructure (`vue-i18n`, `$t()`, locale JSON files). After this change, the default language (`en-US`) will display English everywhere.

## Scope

**In scope — user-facing strings (must use `$t()` i18n keys):**

- `apps/web-shadcn/src/views/**/*.vue` — ~60 files with 266 Chinese matches
- `apps/web-shadcn/src/views/**/*.ts` — data files (`system/menu/data.ts`, `system/dept/data.ts`) with `'新增下级'`, `'禁用'`/`'启用'`, confirm dialogs
- `apps/web-shadcn/src/layouts/basic.vue` — notification demo data (titles, messages, dates, names)
- `apps/web-shadcn/src/layouts/auth.vue` — 1 comment

**In scope — comments (translate inline, no i18n key):**

- All `.vue` and `.ts` files under `apps/web-shadcn/src/views/`, `layouts/`, `components/`, `router/`, `store/`, `api/` that contain Chinese comments/JSDoc

**Out of scope (no Chinese found):**

- `apps/web-shadcn/src/_core/fallback/*.vue`
- `apps/web-shadcn/src/_core/about/index.vue`
- `packages/locales/src/langs/` structure (we ADD keys, don't restructure)

## Locale files to edit

- `packages/locales/src/langs/en-US/*.json` — add English translations for all new `page.*` keys
- `packages/locales/src/langs/zh-CN/*.json` — add matching Chinese values
- `packages/locales/src/langs/zh-TW/*.json` — add matching Chinese values

## Key decisions

1. **i18n approach** — not direct English replacement. Matches existing codebase patterns (`$t('ui.actionMessage.xxx')`, `$t('page.dataDisplay.edit')`) and keeps language-switching functional.
2. **Key namespace:** `page.<feature>.<view>.<key>` for page-specific strings (e.g., `page.system.menu.list.title`). Reuse existing `common.*` / `ui.*` keys where applicable (`common.edit`, `common.delete`, `ui.actionMessage.operationSuccess`, etc.).
3. **Comments:** Translate Chinese comments to English inline in source (not user-facing, no locale key).
4. **Interpolation:** Keep `{0}`, `{1}` placeholders for dynamic values (row names, counts).
5. **New `page` namespace:** `en-US` locale files don't currently have a top-level `page` key. Add `page` as a new top-level namespace in each locale file (code already references `$t('page.dataDisplay.edit')`).

## Affected files summary

### Dashboard (views)

| File | Notes |
| --- | --- |
| `dashboard/workspace/index.vue` | ~50 matches: welcome msg, tasks, trends, nav items, weather, dates, names |
| `dashboard/analytics/index.vue` | 8: metric titles/labels |
| `dashboard/analytics/analytics-visits.vue` | 1: `${index + 1}月` (template literal) |
| `dashboard/analytics/analytics-visits-data.vue` | 7: chart series names |
| `dashboard/analytics/analytics-visits-sales.vue` | 4: chart series names |
| `dashboard/analytics/analytics-visits-source.vue` | 4: chart series names |

### System management (views)

| File | Notes |
| --- | --- |
| `system/menu/data.ts` | `'新增下级'` + comments |
| `system/role/list.vue` | comments + `'禁用'`/`'启用'` + confirm dialog |
| `system/user/list.vue` | comments + `'禁用'`/`'启用'` + confirm dialog |
| `system/dept/list.vue` | comments + `'部门列表'` grid title |
| `system/dict/data.ts` | comments only |
| `system/dict/modules/data-form.vue` / `type-form.vue` | needs re-scan (0 found in earlier scan) |

### Demos (views)

| File                                     | Notes                     |
| ---------------------------------------- | ------------------------- |
| `demos/features/tabs/index.vue`          | comments + 15+ UI strings |
| `demos/features/tabs/tab-detail.vue`     | 3 UI strings              |
| `demos/features/login-expired/index.vue` | ~8 UI strings             |
| `demos/features/clipboard/index.vue`     | 2 titles                  |
| `demos/features/full-screen/index.vue`   | 1 title                   |
| `demos/features/icons/index.vue`         | ~10 UI strings            |
| `demos/access/index.vue`                 | ~6 UI strings             |
| `demos/access/button-control.vue`        | ~20 UI strings            |
| `demos/access/admin-visible.vue`         | 2                         |
| `demos/access/super-visible.vue`         | 2                         |
| `demos/access/user-visible.vue`          | 2                         |
| `demos/access/menu-visible-403.vue`      | 2                         |

### Core / profile / authentication (views)

| File                                       | Notes                         |
| ------------------------------------------ | ----------------------------- |
| `_core/profile/index.vue`                  | 5 labels + title              |
| `_core/profile/base-setting.vue`           | 6 labels                      |
| `_core/profile/security-setting.vue`       | 6 labels/descriptions         |
| `_core/profile/password-setting.vue`       | 7 labels/placeholders + toast |
| `_core/profile/notification-setting.vue`   | 4 labels/descriptions         |
| `_core/authentication/login.vue`           | comments only                 |
| `_core/authentication/code-login.vue`      | comments only                 |
| `_core/authentication/forget-password.vue` | already uses `$t()` — clean   |

### Layouts

| File | Notes |
| --- | --- |
| `layouts/basic.vue` | notification demo data (titles, messages, dates, names like '朱偏右', '曲丽丽') |
| `layouts/auth.vue` | 1 comment (`<!-- 自定义工具栏 -->`) |

### Components (comments only)

| File                                    | Notes           |
| --------------------------------------- | --------------- |
| `components/ui/app/RadioGroupField.vue` | 1 JSDoc comment |
| `components/ui/app/Tag.vue`             | 1 JSDoc comment |
| `components/ui/app/TreeSelectField.vue` | 1 JSDoc comment |

### Router (comments only)

| File                     | Notes             |
| ------------------------ | ----------------- |
| `router/routes/core.ts`  | ~6 JSDoc comments |
| `router/routes/index.ts` | ~7 JSDoc comments |

### Store (comments only)

| File            | Notes                     |
| --------------- | ------------------------- |
| `store/auth.ts` | ~10 JSDoc/inline comments |

### API (JSDoc comments only — developer-facing)

| File                     | Notes                     |
| ------------------------ | ------------------------- |
| `api/data-display.ts`    | 4 JSDoc comments          |
| `api/system/dict.ts`     | ~14 JSDoc comments        |
| `api/system/dept.ts`     | ~6 JSDoc comments         |
| `api/system/menu.ts`     | ~25 JSDoc comments        |
| `api/system/role.ts`     | ~6 JSDoc comments         |
| `api/system/user.ts`     | ~4 JSDoc comments         |
| `api/examples/status.ts` | 1 JSDoc comment           |
| `api/request.ts`         | ~10 JSDoc/inline comments |

## Implementation tasks (ordered)

### Phase 1: Final enumeration

1. Confirm complete file list above is accurate (re-run scan if needed after any prior edits).
2. For each file, identify every Chinese string → suggested English translation → i18n key.

### Phase 2: Locale files (do first, so keys exist)

3. Add `page` namespace to `en-US/*.json` with all new keys and English values.
4. Add matching keys to `zh-CN/*.json` and `zh-TW/*.json` with Chinese values.
5. Reuse existing `common.*`/`ui.*` keys where applicable — don't duplicate.

### Phase 3: Vue views — replace user-facing strings

6. Replace hardcoded Chinese strings with `$t('page.<feature>.<view>.<key>')`.
7. For dynamic/template-literal strings, use interpolation: `$t('key', { name: row.name, n: index + 1 })`.
8. For chart data arrays (`data: ['访问', '趋势']`), replace each entry with `$t()` call.
9. For `layouts/basic.vue` notification demo data, replace with English strings (these are demo data, could be direct English or `$t()` — recommend `$t()` for consistency).

### Phase 4: .ts data files

10. `system/menu/data.ts`: replace `'新增下级'` with `$t()` key.
11. `system/dept/data.ts`: replace `'新增下级'` with `$t()` key.
12. `system/role/list.vue`, `system/user/list.vue`: replace `'禁用'`/`'启用'` and confirm dialog text with `$t()` keys.

### Phase 5: Comments

13. Translate all Chinese comments/JSDoc to English inline in views, layouts, components, router, store, api files.

### Phase 6: Validate

14. `pnpm --filter @vben/web-shadcn typecheck` — exits 0.
15. `pnpm --filter @vben/web-shadcn build` — exits 0, produces `dist/client/`.
16. Re-scan `apps/web-shadcn/src/**` for `[\u4e00-\u9fff]` — should return 0 matches (all comments translated).
17. Run dev server, navigate to each page, verify no i18n missing-key warnings in console.

## Risks / edge cases

- **Dynamic/template-literal strings:** `` `标签页${index}详情页` ``, `` `你要将${row.name}的状态切换为【...】吗？` `` need i18n keys with interpolation.
- **Chart data arrays:** `data: ['访问', '趋势']`, `name: '网页'` — each entry needs `$t()`.
- **`${index + 1}月`** → `$t('page.dashboard.analytics.monthLabel', { n: index + 1 })` or plain `Month ${index + 1}`.
- **Demo names in `layouts/basic.vue`:** '朱偏右', '曲丽丽' are Chinese personal names in demo data → replace with English names.
- **Missing-key warnings:** i18n `setMissingHandler` logs undefined keys — verify zero warnings after implementation.
- **API/store/router comments are developer-facing** — translating them is optional for the user-facing goal but included since user requested ALL comments translated.

## Open questions

1. Should `page.*` keys live in `en-US/ui.json` under a `page` sub-key, or a new `en-US/pages.json` file? Recommendation: `ui.json` with `page` sub-key (single file, matches existing import pattern).
2. Are API JSDoc comments in scope for translation? They're developer-facing, not user-facing. Plan includes them but they're lower priority than view strings.

## Validation criteria (definition of done)

- `grep -rn "[\u4e00-\u9fff] apps/web-shadcn/src/"` returns 0 matches.
- `pnpm --filter @vben/web-shadcn typecheck` exits 0.
- `pnpm --filter @vben/web-shadcn build` exits 0 and produces `apps/web-shadcn/dist/client/`.
- Dev server loads all pages without i18n missing-key console warnings.

## Notes

- Earlier fixes (popover z-index, checkbox labels, Netlify outDir) are unrelated and already committed.
- I am in plan mode and cannot implement source edits. Switch to an implementation-capable agent to execute this plan.
