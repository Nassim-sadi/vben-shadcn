# Netlify Build Fix Plan — COMPLETE

## Summary

Fixed the Netlify deployment failure for `@vben/web-shadcn`.

## Problem

Netlify UI config: build `turbo run build --filter @vben/web-shadcn`, publish `apps/web-shadcn/dist/client`. Vite default `outDir` is `dist`, not `dist/client` — so even a successful build would publish an empty/missing directory.

## Change

`apps/web-shadcn/vite.config.ts:7-9` — added `build.outDir: 'dist/client'`:

```ts
vite: {
  build: {
    outDir: 'dist/client',
  },
```

## Verification

- `pnpm --filter @vben/web-shadcn build` → exits 0, outputs to `apps/web-shadcn/dist/client/`
- `apps/web-shadcn/dist/client/index.html` exists ✓
- `pnpm --filter @vben/web-shadcn typecheck` → passes ✓
- Committed as `64c56ab88`: `chore(@vben/web-shadcn): set vite outDir to dist/client`

## Notes

- The exit code 2 on Netlify could not be reproduced locally — the build succeeds locally. The `dist/client` mismatch is the confirmed root cause of the "publish directory does not exist" error.
- The earlier popover z-index fix and checkbox label fix (separate work) are unrelated to this build fix.
