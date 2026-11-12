<div align="center">

# Admin Dashboard (Vben 5 + shadcn-vue)

Admin front end built on **[Vue Vben Admin 5.x](https://github.com/vbenjs/vue-vben-admin)** using the **shadcn-vue** based Vben core (`@vben-core/*`) as the only UI kit.

</div>

## Introduction

This project ports the `vue-vben-admin` monorepo to a lean MES admin front end by replacing the Ant Design Vue (`antdv-next`) UI kit with the pure shadcn-vue-powered Vben core (`@vben-core/shadcn-ui`, reka-ui, Tailwind CSS v4).

- **100% shadcn-vue UI**: There is **no** antd compatibility layer anymore. Every page directly uses `@vben-core/shadcn-ui` primitives or app-local shadcn compositions (`src/components/ui/app`) built on reka-ui + Tailwind (`Card`, `Tag`→`Badge`, `SelectField`, `RadioGroupField`, `DatePicker` with Popover + Calendar, `AlertConfirm` with AlertDialog, `InputNumberField`, `InputSearch`, `Spin`, …). `message.*`/`notification.*` are replaced by `vue-sonner` toasts and `Modal.confirm` by `vbenConfirm` (`@vben-core/popup-ui`).
- **Single Production App**: `apps/web-shadcn` (`@vben/web-shadcn`) — login, dynamic menus, role-based access demos, preferences panel, dark mode, i18n (`zh-CN`, `en-US`, `zh-TW`), mock API, and `vxe-table` grids all work against the bundled mock backend (`apps/backend-mock`).
- **Framework Untouched**: packages under `packages/` (`@vben/*`, `@vben-core/*`) maintain the original vben architectural foundation — access control, preferences, stores, locales, request client, layouts, and utilities.
- **Mock Backend**: `apps/backend-mock` (Nitro-based dev mock server) continues to serve authentication, dynamic menus, system administration data, and the newly added Data Display CRUD endpoints.

## Kept Packages & Workspace Structure

### Applications (`apps/`)

- **`apps/web-shadcn`** (`@vben/web-shadcn`): The primary admin application built exclusively with shadcn-vue.
- **`apps/backend-mock`** (`@vben/backend-mock`): Nitro-based mock backend service providing authentication, user info, dynamic menus, and CRUD endpoints. The upstream `playground` and the `web-antd` / `web-antdv-next` / `web-ele` / `web-naive` / `web-tdesign` template apps have been removed from the workspace.

### Core & Framework Packages (`packages/`)

- **`@vben-core/shadcn-ui`**: shadcn-vue component library (reka-ui, Lucide icons, Tailwind CSS).
- **`@vben-core/popup-ui`**: Drawer, modal, and confirm popup system (`vbenConfirm`).
- **`@vben-core/menu-ui`**: Sidebar navigation and menu rendering components.
- **`@vben-core/shared`**: Shared TypeScript types, utility functions, and constants.
- **`@vben/common-ui`**: Common compound UI wrappers (Page container, Tree, Form, etc.).
- **`@vben/access`**: Role-based and code-based access control (frontend and backend modes).
- **`@vben/layouts`**: BasicLayout and AuthPageLayout structural layouts.
- **`@vben/locales`**: Multi-language support (`zh-CN`, `en-US`, `zh-TW`).
- **`@vben/preferences`**: Application preferences and settings management.
- **`@vben/request`**: Axios-based HTTP client with token handling and refresh.
- **`@vben/stores`**: Pinia global stores (auth, access, tabbar, dict, etc.).
- **`@vben/types`**: Unified TypeScript type definitions.
- **`@vben/utils`**: General helper utilities and tree manipulation algorithms.

## Retained Pages & Features

The following pages and demo features are preserved in `apps/web-shadcn`:

| Category | Pages & Routes | Description |
| --- | --- | --- |
| **Authentication** | `/auth/login`, `/auth/code-login`, `/auth/qrcode-login`, `/auth/register`, `/auth/forget-password`, `/auth/profile` | Complete authentication flow, SMS login, QR login, password reset, and user profile |
| **Error / Fallback** | `/fallback/403`, `/fallback/404`, `/fallback/500`, `/fallback/offline`, `/fallback/coming-soon` | Standard HTTP fallback and error handling views |
| **Dashboard** | `/dashboard/analytics`, `/dashboard/workspace` | Analytics statistics cards, trend charts, and workspace dashboard |
| **Data Display** | `/data-display` | **New** MES manufacturing order CRUD management with keyword search, category/status/line filters, date range filter, add/edit drawer form, and delete confirm |
| **System Management** | `/system/user`, `/system/role`, `/system/menu`, `/system/dept`, `/system/dict` | Full CRUD administrative suite with vxe-table grids and drawers |
| **Access Control** | `/demos/access/page-control`, `/demos/access/button-control`, `/demos/access/menu-visible-403`, `/demos/access/admin-visible`, `/demos/access/super-visible`, `/demos/access/user-visible` | Dynamic permission verification across frontend and backend access modes |
| **Core Features** | `/demos/features/icons`, `/demos/features/tabs`, `/demos/features/full-screen`, `/demos/features/clipboard`, `/demos/features/login-expired` | Essential application utilities: Iconify picker, tabbar operations, fullscreen toggling, clipboard copy, and token expiration simulation |

## Tech Stack

- **Framework**: Vue 3.5, Vite 8, TypeScript 6, pnpm workspace (Turborepo)
- **UI Kit**: `@vben-core/shadcn-ui` (reka-ui) + Tailwind CSS v4 + `vue-sonner`
- **Data Table**: `vxe-table` v4
- **State & Routing**: Pinia, Vue Router 4
- **Internationalization**: `vue-i18n` (simplified Chinese `zh-CN`, English `en-US`, traditional Chinese `zh-TW`)
- **Forms & Validation**: Vben form adapter + `zod`

## Getting Started

### Prerequisites

- **Node.js**: `^22.18.0 || ^24.12.0`
- **pnpm**: `>=11.0.0` (ensure `corepack enable` is run)

### Installation & Development

```bash
# Install workspace dependencies
pnpm install

# Start the shadcn admin app (mock backend runs automatically with Vite proxy)
pnpm dev             # http://localhost:5555

# Run typecheck
pnpm check:type

# Production build
pnpm build
```

### Mock Backend Demo Accounts

The mock backend (`apps/backend-mock`) provides the following accounts:

| Username | Password | Role    | Permissions                             |
| -------- | -------- | ------- | --------------------------------------- |
| `vben`   | `123456` | `super` | Super Administrator (all pages & menus) |
| `admin`  | `123456` | `admin` | Administrator                           |
| `jack`   | `123456` | `user`  | Standard User                           |

## License

Fork of [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) (5.x), released under the [MIT License](./LICENSE).
# vben-shadcn
