import { initPreferences } from '@vben/preferences';
import { unmountGlobalLoading } from '@vben/utils';

import { overridesPreferences } from './preferences';

/**
 * After the application initialization is completed, the page is loaded and rendered.
 */
async function initApplication() {
  // name is used to specify the unique identifier of the project
  // Key prefixes used to distinguish preferences between different projects, stored data, and other data that need to be isolated
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;

  // App preferences initialization
  await initPreferences({
    namespace,
    overrides: overridesPreferences,
  });

  // Start the application and mount it
  // Vue application main logic and views
  const { bootstrap } = await import('./bootstrap');
  await bootstrap(namespace);

  // Remove and destroy loading
  unmountGlobalLoading();
}

void initApplication();
