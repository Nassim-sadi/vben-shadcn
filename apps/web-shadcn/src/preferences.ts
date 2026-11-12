import {
  appCopyrightPreferences,
  defineOverridesPreferences,
} from '@vben/preferences';

/**
 * @description 项目配置
 * 这里的配置会覆盖默认配置，修改后无需重启，刷新页面即可生效
 * !!! 请不要修改下面的注释，否则会导致配置失效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    // 默认语言为英语；用户仍可在偏好设置中切换为中文
    locale: 'en-US',
    name: import.meta.env.VITE_APP_TITLE,
  },
  copyright: appCopyrightPreferences,
});
