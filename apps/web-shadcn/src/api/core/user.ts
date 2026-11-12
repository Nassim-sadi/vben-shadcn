import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

import { getUserInfoSample } from './auth.sample';

/** Static demo environment (VITE_SYSTEM_SAMPLE=true) uses in-memory accounts */
const USE_SAMPLE_DATA = import.meta.env.VITE_SYSTEM_SAMPLE === 'true';

/**
 * Get user information
 */
export async function getUserInfoApi() {
  if (USE_SAMPLE_DATA) {
    return getUserInfoSample();
  }
  return requestClient.get<UserInfo>('/user/info');
}
