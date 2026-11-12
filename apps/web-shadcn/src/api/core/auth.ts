import { baseRequestClient, requestClient } from '#/api/request';

import {
  getAccessCodesSample,
  loginSample,
  logoutSample,
  refreshTokenSample,
} from './auth.sample';

export namespace AuthApi {
  /** Login interface parameters */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** Login interface return value */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory accounts */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

/**
 * Log in
 */
export async function loginApi(data: AuthApi.LoginParams) {
  if (USE_SAMPLE_DATA) {
    return loginSample(data);
  }
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data, {
    withCredentials: true,
  });
}

/**
 * Refresh accessToken
 */
export async function refreshTokenApi() {
  if (USE_SAMPLE_DATA) {
    return refreshTokenSample();
  }
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/auth/refresh',
    null,
    {
      withCredentials: true,
    },
  );
}

/**
 * Log out
 */
export async function logoutApi() {
  if (USE_SAMPLE_DATA) {
    return logoutSample();
  }
  return baseRequestClient.post('/auth/logout', null, {
    withCredentials: true,
  });
}

/**
 * Get user permission code
 */
export async function getAccessCodesApi() {
  if (USE_SAMPLE_DATA) {
    return getAccessCodesSample();
  }
  return requestClient.get<string[]>('/auth/codes');
}
