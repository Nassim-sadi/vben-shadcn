import type { APIRequestContext } from '@playwright/test';

import { expect } from '@playwright/test';

export type ApiEnvelope<T> = {
  code: number;
  data: T | null;
  message?: string | null;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
};

export type BaseRecord = {
  id?: number | string;
  [key: string]: unknown;
};

type RequestData = Record<string, unknown>;
type QueryValue = boolean | number | string | undefined | null;

/**
 * Calls the same HTTP surface the frontend uses. The frontend dev server
 * proxies /api to the local MES API, so tests exercise the proxy as well.
 */
export const API_BASE_URL =
  process.env.MES_API_BASE_URL ?? 'http://localhost:5555/api';

export class BaseDataClient {
  private token = '';

  constructor(private readonly request: APIRequestContext) {}

  async login(username = 'admin', password = 'admin@123') {
    const { body } = await this.raw<{ accessToken: string }>(
      'POST',
      '/auth/login',
      { username, password },
    );

    expect(body, 'login response').not.toBeNull();
    expect(body!.code, body!.message ?? 'login failed').toBe(0);
    expect(body!.data?.accessToken, 'access token').toBeTruthy();

    this.token = body!.data!.accessToken;
  }

  async raw<T>(
    method: 'DELETE' | 'GET' | 'POST' | 'PUT',
    path: string,
    data?: RequestData,
  ) {
    const url = `${API_BASE_URL}${path}`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await this.request.fetch(url, {
      data,
      headers,
      method,
    });
    const text = await response.text();

    let body: ApiEnvelope<T> | null = null;
    if (text) {
      try {
        body = JSON.parse(text) as ApiEnvelope<T>;
      } catch {
        throw new Error(
          `${method} ${path} returned non-JSON response: ${text.slice(0, 200)}`,
        );
      }
    }

    return { body, status: response.status() };
  }

  async ok<T>(
    method: 'DELETE' | 'GET' | 'POST' | 'PUT',
    path: string,
    data?: RequestData,
  ): Promise<T> {
    const { body, status } = await this.raw<T>(method, path, data);
    const label = `${method} ${path} (HTTP ${status})`;

    expect(body, `${label} response`).not.toBeNull();
    expect(
      body!.code,
      `${label}: ${body!.message ?? 'unexpected response'}`,
    ).toBe(0);
    return body!.data as T;
  }

  async fail(
    method: 'DELETE' | 'GET' | 'POST' | 'PUT',
    path: string,
    data?: RequestData,
  ) {
    const { body, status } = await this.raw(method, path, data);
    const label = `${method} ${path} (HTTP ${status})`;

    expect(body, `${label} response`).not.toBeNull();
    expect(body!.code, `${label} should fail`).not.toBe(0);
    return body!;
  }

  async list(module: string, params: Record<string, QueryValue> = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.set(key, String(value));
      }
    }
    const suffix = query.toString();
    const path = `/base/${module}/list${suffix ? `?${suffix}` : ''}`;
    return await this.ok<PagedResult<BaseRecord>>('GET', path);
  }

  async create(module: string, data: RequestData) {
    return await this.ok<BaseRecord>('POST', `/base/${module}`, data);
  }

  async update(module: string, key: string, data: RequestData) {
    return await this.ok<BaseRecord>(
      'PUT',
      `/base/${module}/${encodeURIComponent(key)}`,
      data,
    );
  }

  async remove(module: string, key: string) {
    return await this.ok<boolean>(
      'DELETE',
      `/base/${module}/${encodeURIComponent(key)}`,
    );
  }
}

/** Deletes rows in reverse creation order so child rows go before parents. */
export class TestDataCleanup {
  private readonly entries: Array<{ key: string; module: string }> = [];

  constructor(private readonly client: BaseDataClient) {}

  track(module: string, key: string) {
    this.entries.push({ module, key });
  }

  async run() {
    for (const { module, key } of [...this.entries].reverse()) {
      try {
        await this.client.remove(module, key);
      } catch {
        // Ignore cleanup failures; the test failure already has the context.
      }
    }
    this.entries.length = 0;
  }
}

export function rowKey(row: BaseRecord, fields: string[]) {
  return fields.map((field) => String(row[field] ?? '')).join('|');
}
