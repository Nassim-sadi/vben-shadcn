import type { Recordable } from '@vben/types';

import type { DataDisplayApi } from '#/api/data-display';

/**
 * Demo data: used for static deployment (without /data-display/* interfaces) to display the Data Display page.
 *
 * Only enabled when VITE_DATA_DISPLAY_SAMPLE=true, data is stored in memory,
 * and resets to initial state after page refresh (satisfies add/delete/edit/query interaction in demo environment).
 */

const CATEGORIES: DataDisplayApi.Item['category'][] = [
  'electronics',
  'mechanics',
  'optical',
  'assembly',
];

const LINES = ['Line-A', 'Line-B', 'Line-C', 'Line-D'];

const OPERATORS = [
  'Alice Chen',
  'Bruno Rossi',
  'Chen Wei',
  'Daniel Kim',
  'Emma Novak',
  'Farid Haddad',
  'Grace Liu',
  'Hiro Tanaka',
];

const PRODUCTS = [
  'Precision Servo Motor Control Board',
  'High-Precision CNC Gearbox Housing',
  'Optical Encoder Module',
  'Servo Drive Assembly Kit',
  'Industrial Robot Joint Actuator',
  'Linear Guide Rail Set',
  'Laser Positioning Sensor',
  'Motor Rotor Lamination Stack',
  'Aluminum Heatsink Enclosure',
  'Planetary Reduction Gear Set',
  'Vision Camera Mount Bracket',
  'Control Cabinet Wiring Harness',
];

const PRIORITIES: DataDisplayApi.Item['priority'][] = ['low', 'medium', 'high'];

const SAMPLE_SIZE = 32;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Format consistent with backend mock: YYYY-MM-DD HH:mm:ss */
function formatDateTime(date: Date): string {
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(' ');
}

function buildInitialItems(): DataDisplayApi.Item[] {
  const now = Date.now();

  return Array.from({ length: SAMPLE_SIZE }, (_, index) => {
    // Each record spaced 8 hours apart to ensure stable order when sorted by creation time
    const created = new Date(now - index * 8 * 60 * 60 * 1000);
    const planQuantity = 60 + ((index * 37) % 240);
    const status = (index % 4) as DataDisplayApi.Item['status'];
    let completedQuantity: number;
    if (status === 0) {
      completedQuantity = 0;
    } else if (status === 2) {
      completedQuantity = planQuantity;
    } else {
      completedQuantity = Math.min(
        Math.floor(planQuantity * (0.15 + ((index * 13) % 60) / 100)),
        planQuantity,
      );
    }

    return {
      id: `sample-${1001 + index}`,
      code: `WO-${1001 + index}`,
      name: PRODUCTS[index % PRODUCTS.length] as string,
      category: CATEGORIES[
        index % CATEGORIES.length
      ] as DataDisplayApi.Item['category'],
      line: LINES[index % LINES.length] as string,
      planQuantity,
      completedQuantity,
      status,
      priority: PRIORITIES[
        index % PRIORITIES.length
      ] as DataDisplayApi.Item['priority'],
      operator: OPERATORS[index % OPERATORS.length] as string,
      createTime: formatDateTime(created),
      remark: index % 5 === 0 ? 'Expedited order for Q4 delivery.' : undefined,
    };
  });
}

let sampleStore: DataDisplayApi.Item[] = buildInitialItems();
let sequence = 1001 + SAMPLE_SIZE;

export interface SampleQueryParams extends Recordable<any> {
  category?: string;
  code?: string;
  endTime?: string;
  line?: string;
  name?: string;
  page?: number | string;
  pageSize?: number | string;
  sortBy?: string;
  sortOrder?: string;
  startTime?: string;
  status?: number | string;
}

export function querySampleData(params: SampleQueryParams = {}) {
  let filtered = [...sampleStore];

  if (params.code) {
    const keyword = params.code.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.code.toLowerCase().includes(keyword),
    );
  }

  if (params.name) {
    const keyword = params.name.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }

  if (params.category) {
    filtered = filtered.filter((item) => item.category === params.category);
  }

  if (params.line) {
    filtered = filtered.filter((item) => item.line === params.line);
  }

  if (params.status !== undefined && params.status !== '') {
    const status = Number(params.status);
    filtered = filtered.filter((item) => item.status === status);
  }

  if (params.startTime) {
    const start = new Date(params.startTime);
    if (!Number.isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
      const startTime = start.getTime();
      filtered = filtered.filter(
        (item) => new Date(item.createTime).getTime() >= startTime,
      );
    }
  }

  if (params.endTime) {
    const end = new Date(params.endTime);
    if (!Number.isNaN(end.getTime())) {
      // End date includes today, avoid excluding the selected date itself
      end.setHours(23, 59, 59, 999);
      const endTime = end.getTime();
      filtered = filtered.filter(
        (item) => new Date(item.createTime).getTime() <= endTime,
      );
    }
  }

  if (params.sortBy) {
    const key = params.sortBy as keyof DataDisplayApi.Item;
    const isDesc = params.sortOrder === 'desc';
    filtered.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isDesc ? bValue - aValue : aValue - bValue;
      }
      return isDesc
        ? String(bValue ?? '').localeCompare(String(aValue ?? ''))
        : String(aValue ?? '').localeCompare(String(bValue ?? ''));
    });
  }

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
  };
}

export function createSampleItem(
  data: Omit<DataDisplayApi.Item, 'createTime' | 'id'>,
): DataDisplayApi.Item {
  const item: DataDisplayApi.Item = {
    category: data.category,
    code: data.code,
    completedQuantity: data.completedQuantity,
    line: data.line,
    name: data.name,
    operator: data.operator,
    planQuantity: data.planQuantity,
    priority: data.priority,
    remark: data.remark,
    status: data.status,
    id: `sample-${sequence}`,
    createTime: formatDateTime(new Date()),
  };
  sequence += 1;
  sampleStore = [item, ...sampleStore];
  return item;
}

export function updateSampleItem(
  id: string,
  data: Partial<DataDisplayApi.Item>,
): DataDisplayApi.Item | null {
  const index = sampleStore.findIndex((item) => item.id === id);
  const current = sampleStore[index];
  if (!current) {
    return null;
  }
  const updated: DataDisplayApi.Item = { ...current, ...data, id };
  sampleStore[index] = updated;
  return updated;
}

export function deleteSampleItem(id: string): boolean {
  const index = sampleStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  sampleStore.splice(index, 1);
  return true;
}
