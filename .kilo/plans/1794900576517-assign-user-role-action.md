# Plan: Add "Assign role" action to user table

**Goal:** Add a new table action on the user list page that calls the real .NET Core backend `POST /api/system/user/{id}/roles` with body `{"roleCode": ""}` to assign a role to a user.

**Scope:** Frontend only (`apps/web-shadcn`). The backend mock (`apps/backend-mock`) and the `.NET Core` server at `localhost:7032` are out of scope — the frontend simply calls the existing real backend.

## Affected files

| File | Change |
|------|--------|
| `apps/web-shadcn/src/api/system/user.ts` | Add `assignUserRole(userCode: string, roleCode: string)` → `requestClient.post('/system/user/${userCode}/roles', { roleCode })`. Export it. |
| `apps/web-shadcn/src/views/system/user/list.vue` | Import `assignUserRole`. Add an "Assign role" action (main action or dropdown) with a role picker. On confirm, call `assignUserRole(row.userCode, roleCode)`, toast success/error, then `onRefresh()` to reload the grid. |

## Design decisions

1. **Where the action lives:** Add to `:dropdown-actions` next to Delete (consistent with existing pattern), or as a main toolbar action. Recommendation: main toolbar-level action is awkward because it's per-row; put it in `:dropdown-actions` as a non-danger item with an icon (e.g. `lucide:user-check`).

2. **Role selection UI:** Need a way for the operator to pick a role code. Existing `getRoleList` (`api/system/role.ts`) returns `SystemRoleApi.SystemRole` with `id`/`name` — **no `roleCode` field**, but the backend expects `roleCode`.

   **Decision to resolve during implementation (recommended):** Either
   - (a) extend `SystemRoleApi.SystemRole` with optional `roleCode` and have the backend return it, then open a small select/modal listing roles; or
   - (b) treat the role `id` as the `roleCode` sent to the backend (simplest, no interface change).

   The plan does not block on this; implementer picks (a) or (b).

3. **Auth guard:** The action carries `auth: ['SystemUser']` like the other table actions.

4. **Error handling:** Mirror `onDelete`/`onStatusChange` — toast loading → call API → toast success + `onRefresh()` on success, dismiss loading + toast error on failure.

## Data flow

`User clicks "Assign role" on row` → open role picker (select role by code/name) → confirm → `assignUserRole(row.userCode, selectedRoleCode)` → `POST /system/user/{userCode}/roles { roleCode }` → success → toast + `gridApi.query()` → failure → toast error.

## Validation / checks to run after implementation

- `pnpm -F @vben/web-shadcn run typecheck` (or `vue-tsc --noEmit` in the web-shadcn app)
- `pnpm -F @vben/web-shadcn run lint`
- Manual: open user list, click Assign role on a row, pick a role, confirm; verify the .NET Core server receives `POST /api/system/user/{id}/roles` with body `{"roleCode":"..."}` and the grid refreshes.

## Open question (for implementer)

- Role picker implementation: reuse an existing modal/select pattern in the codebase, or build a minimal inline `Select` of roles fetched via `getRoleList`? Flag `roleCode` mapping as decision (a) vs (b) above.
