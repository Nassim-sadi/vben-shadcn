import { appCopyrightPreferences, defineOverridesPreferences } from '@vben/preferences';

/**
 * @description Project configuration
 * The configuration here will overwrite the default configuration. There is no need to restart after modification. Refresh the page to take effect.
 * !!! Please do not modify the following comments, otherwise the configuration will become invalid.
 */
export const overridesPreferences = defineOverridesPreferences({
  // Overrides
  app: {
    // The default language is English; users can still switch to Chinese in preferences
    locale: 'en-US',
    name: import.meta.env.VITE_APP_TITLE,
    // Routes are delivered by the backend /menu/all (filtered by role permissions), and buttons are controlled by /auth/codes
    accessMode: 'backend',
    // Header Two Column
    layout: 'header-mixed-nav',
  },
  theme: {
    mode: 'light',
    semiDarkHeader: true,
    semiDarkSidebar: true,
  },
  copyright: appCopyrightPreferences,
});
