import { faker } from '@faker-js/faker';

export interface DataDisplayItem {
  id: string;
  code: string;
  name: string;
  category: 'assembly' | 'electronics' | 'mechanics' | 'optical';
  line: string;
  planQuantity: number;
  completedQuantity: number;
  status: 0 | 1 | 2 | 3; // 0: 待排产, 1: 生产中, 2: 已完成, 3: 异常
  priority: 'high' | 'low' | 'medium';
  operator: string;
  createTime: string;
  remark?: string;
}

const formatterCN = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function now(): string {
  return formatterCN.format(new Date());
}

function generateInitialData(): DataDisplayItem[] {
  const lines = ['Line-A', 'Line-B', 'Line-C', 'Line-D'];
  const priorities: DataDisplayItem['priority'][] = ['low', 'medium', 'high'];
  const sampleProducts = [
    { name: '精密伺服电机控制板', category: 'electronics' as const },
    { name: '高精度CNC减速机壳体', category: 'mechanics' as const },
    { name: '工业激光测距镜头组', category: 'optical' as const },
    { name: '六轴机械臂总成单元', category: 'assembly' as const },
    { name: '嵌入式边缘计算主板', category: 'electronics' as const },
    { name: '钛合金航空紧固件', category: 'mechanics' as const },
    { name: '机器视觉CMOS成像模组', category: 'optical' as const },
    { name: '智能物流AGV驱动底盘', category: 'assembly' as const },
  ];

  const list: DataDisplayItem[] = [];

  for (let i = 1; i <= 36; i++) {
    const sample = sampleProducts[(i - 1) % sampleProducts.length] ?? {
      category: 'electronics' as const,
      name: '精密伺服电机控制板',
    };
    const planQuantity = faker.number.int({ min: 50, max: 2000 });
    const status = faker.helpers.arrayElement([0, 1, 2, 3] as const);
    let completedQuantity = 0;
    if (status === 2) {
      completedQuantity = planQuantity;
    } else if (status === 1 || status === 3) {
      completedQuantity = faker.number.int({ min: 10, max: planQuantity - 1 });
    }

    const codeNum = String(1000 + i).padStart(4, '0');
    list.push({
      id: faker.string.uuid(),
      code: `WO-${codeNum}`,
      name: `${sample.name} #${i}`,
      category: sample.category,
      line: lines[(i - 1) % lines.length] ?? 'Line-A',
      planQuantity,
      completedQuantity,
      status,
      priority: priorities[i % priorities.length] ?? 'medium',
      operator: faker.person.fullName(),
      createTime: formatterCN.format(
        faker.date.between({
          from: new Date('2025-01-01'),
          to: new Date('2026-11-01'),
        }),
      ),
      remark: `批次产线测试与质检记录 ${codeNum}`,
    });
  }

  return list;
}

const mockDataDisplayStore: DataDisplayItem[] = generateInitialData();

export interface QueryDataDisplayParams {
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

export function getDataDisplayList(params: QueryDataDisplayParams = {}) {
  let filtered = [...mockDataDisplayStore];

  if (params.code) {
    const q = params.code.toLowerCase().trim();
    filtered = filtered.filter((item) => item.code.toLowerCase().includes(q));
  }

  if (params.name) {
    const q = params.name.toLowerCase().trim();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(q));
  }

  if (params.category) {
    filtered = filtered.filter((item) => item.category === params.category);
  }

  if (params.line) {
    filtered = filtered.filter((item) => item.line === params.line);
  }

  if (params.status !== undefined && params.status !== '') {
    const statusNum = Number(params.status);
    filtered = filtered.filter((item) => item.status === statusNum);
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
      // 结束日期包含当天，避免选中日期当天被排除
      end.setHours(23, 59, 59, 999);
      const endTime = end.getTime();
      filtered = filtered.filter(
        (item) => new Date(item.createTime).getTime() <= endTime,
      );
    }
  }

  if (params.sortBy) {
    const key = params.sortBy as keyof DataDisplayItem;
    const isDesc = params.sortOrder === 'desc';
    filtered.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return isDesc ? bVal - aVal : aVal - bVal;
      }
      return isDesc
        ? String(bVal ?? '').localeCompare(String(aVal ?? ''))
        : String(aVal ?? '').localeCompare(String(bVal ?? ''));
    });
  }

  return filtered;
}

export function createDataDisplayItem(
  data: Omit<DataDisplayItem, 'createTime' | 'id'>,
): DataDisplayItem {
  const newItem: DataDisplayItem = {
    ...data,
    createTime: now(),
    id: faker.string.uuid(),
  };
  mockDataDisplayStore.unshift(newItem);
  return newItem;
}

export function updateDataDisplayItem(
  id: string,
  data: Partial<DataDisplayItem>,
): DataDisplayItem | null {
  const index = mockDataDisplayStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const current = mockDataDisplayStore[index];
  if (!current) {
    return null;
  }
  const updated: DataDisplayItem = {
    ...current,
    ...data,
    id, // Ensure id is not overwritten
  };
  mockDataDisplayStore[index] = updated;
  return updated;
}

export function deleteDataDisplayItem(id: string): boolean {
  const index = mockDataDisplayStore.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  mockDataDisplayStore.splice(index, 1);
  return true;
}

export function getDataDisplayItemById(id: string): DataDisplayItem | null {
  return mockDataDisplayStore.find((item) => item.id === id) ?? null;
}
