import type { UserInfo } from '@vben/types';

import type { AuthApi } from './auth';

import { useAccessStore } from '@vben/stores';

/**
 * Demo auth data, used when VITE_SYSTEM_SAMPLE=true (static deployment).
 * Mirrors the /auth/* and /user/info endpoints of the backend mock, in memory.
 */

interface SampleAccount {
  codes: string[];
  homePath: string;
  id: string;
  password: string;
  realName: string;
  roles: string[];
  username: string;
}

const SAMPLE_ACCOUNTS: SampleAccount[] = [
  {
    id: '1',
    password: '123456',
    realName: 'Vben',
    roles: ['super'],
    username: 'vben',
    homePath: '/dashboard/workspace',
    codes: ['AC_100100', 'AC_100110', 'AC_100120', 'AC_100010'],
  },
  {
    id: '2',
    password: '123456',
    realName: 'Admin',
    roles: ['admin'],
    username: 'admin',
    homePath: '/dashboard/workspace',
    codes: ['AC_100010', 'AC_100020', 'AC_100030'],
  },
  {
    id: '3',
    password: '123456',
    realName: 'Jack',
    roles: ['user'],
    username: 'jack',
    homePath: '/dashboard/analytics',
    codes: ['AC_1000001', 'AC_1000002'],
  },
];

function tokenPrefix(): string {
  return 'sample-access-';
}

/** Extracts the sample username from the generated access token */
function getUsernameFromToken(token: null | string): string {
  return token?.startsWith(tokenPrefix())
    ? token.slice(tokenPrefix().length)
    : '';
}

function findAccount(username: string): SampleAccount | undefined {
  return SAMPLE_ACCOUNTS.find((item) => item.username === username);
}

export async function loginSample(
  data: AuthApi.LoginParams,
): Promise<AuthApi.LoginResult> {
  const { password, username } = data;
  if (!password || !username) {
    throw new Error('Username and password are required');
  }

  const account = SAMPLE_ACCOUNTS.find(
    (item) => item.username === username && item.password === password,
  );

  if (!account) {
    throw new Error('Username or password is incorrect.');
  }

  return { accessToken: `${tokenPrefix()}${account.username}` };
}

/** Shaped for doRefreshToken(): reads resp.data as the new token */
export async function refreshTokenSample(): Promise<AuthApi.RefreshTokenResult> {
  const username = getUsernameFromToken(useAccessStore().accessToken);
  return { data: `${tokenPrefix()}${username}`, status: 0 };
}

export function logoutSample(): Promise<void> {
  return Promise.resolve();
}

export async function getUserInfoSample(): Promise<UserInfo> {
  const username = getUsernameFromToken(useAccessStore().accessToken);
  const account =
    findAccount(username) ??
    SAMPLE_ACCOUNTS.find((item) => item.username === 'vben');
  if (!account) {
    throw new Error('Sample account not found');
  }
  return {
    userId: account.id,
    username: account.username,
    realName: account.realName,
    roles: [...account.roles],
    homePath: account.homePath,
    desc: '',
    token: `${tokenPrefix()}${account.username}`,
  } as UserInfo;
}

export async function getAccessCodesSample(): Promise<string[]> {
  const username = getUsernameFromToken(useAccessStore().accessToken);
  const account = findAccount(username);
  return account ? [...account.codes] : [];
}
