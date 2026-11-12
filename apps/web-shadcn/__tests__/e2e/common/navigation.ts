import type { Page } from '@playwright/test';

/**
 * The app uses history routing in development and hash routing in the
 * production build (`VITE_ROUTER_HISTORY=hash`), so tests must build URLs for
 * whichever mode is currently active.
 *
 * Call this only when the app origin is already loaded, so the active router
 * mode can be detected from `window.location`.
 */
async function gotoAppRoute(page: Page, path: string) {
  const hashRouting = await page.evaluate(() =>
    window.location.hash.startsWith('#/'),
  );
  await page.goto(hashRouting ? `/#${path}` : path);
}

export { gotoAppRoute };
