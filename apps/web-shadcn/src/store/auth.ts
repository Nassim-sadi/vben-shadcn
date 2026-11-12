import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { defineStore } from 'pinia';

import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * Asynchronously handle the login process
   * @param params Login form data
   * @param onSuccess Callback function after success
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // Asynchronously process user login and get accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await loginApi(params);

      // If accessToken is successfully obtained
      if (accessToken) {
        accessStore.setAccessToken(accessToken);

        // Get user info and store into accessStore
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          toast.success($t('authentication.loginSuccessDesc'), {
            description: userInfo?.realName,
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  const isLoggingOut = ref(false); // Flag indicating logout is in progress, prevents /logout infinite loop.

  async function logout(redirect: boolean = true) {
    if (isLoggingOut.value) return; // Logging out in progress, means loop entered, return directly.
    isLoggingOut.value = true; // Set flag

    try {
      await logoutApi();
    } catch {
      // Do nothing
    } finally {
      isLoggingOut.value = false; // Reset flag

      resetAllStores();
      accessStore.setLoginExpired(false);
    }

    // Cannot carry redirect when already on login page: currentRoute.fullPath is the login page itself,
    // encoding another layer would produce "login page?redirect=encoded login page", then nest again each time,
    // repeated logout would make URL grow jump by jump without limit.
    const currentRoute = router.currentRoute.value;
    const alreadyOnLogin = currentRoute.path === LOGIN_PATH;

    // Return to login page with current route address
    await router.replace({
      path: LOGIN_PATH,
      query:
        redirect && !alreadyOnLogin
          ? { redirect: encodeURIComponent(currentRoute.fullPath) }
          : {},
    });
  }

  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
