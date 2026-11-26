import { expect, test } from '@playwright/test';

import {
  BaseDataClient,
  TestDataCleanup,
  rowKey,
  type BaseRecord,
} from './base-data-client';

test.describe('Base data API via frontend calls', () => {
  test.describe.configure({ mode: 'serial' });

  let cleanup: TestDataCleanup;
  let client: BaseDataClient;

  test.beforeEach(async ({ request }) => {
    client = new BaseDataClient(request);
    cleanup = new TestDataCleanup(client);
    await client.login();
  });

  test.afterEach(async () => {
    if (cleanup) {
      await cleanup.run();
    }
  });

  function suffix() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  type StandaloneCase = {
    codeField: string;
    extra?: Record<string, unknown>;
    keyFields: string[];
    module: string;
    nameField: string;
  };

  const standaloneCases: StandaloneCase[] = [
    {
      module: 'city',
      codeField: 'cityCode',
      nameField: 'cityName',
      keyFields: ['cityCode'],
    },
    {
      module: 'color',
      codeField: 'colorCode',
      nameField: 'colorName',
      keyFields: ['colorCode'],
    },
    {
      module: 'line',
      codeField: 'lineCode',
      nameField: 'lineName',
      keyFields: ['lineCode'],
    },
    {
      module: 'warehouse',
      codeField: 'wareHouseCode',
      nameField: 'wareHouseName',
      keyFields: ['wareHouseCode'],
      extra: { fflag: 'Y', wareHouseType: 'TEST', license: 'TEST' },
    },
    {
      module: 'field-en',
      codeField: 'baseCode',
      nameField: 'baseName',
      keyFields: ['id'],
      extra: { displayOrder: 1, fflag: 'Y' },
    },
    {
      module: 'site',
      codeField: 'siteCode',
      nameField: 'siteName',
      keyFields: ['siteCode'],
      extra: { siteOrder: 1, fflag: 'Y' },
    },
    {
      module: 'model',
      codeField: 'model',
      nameField: 'modelDesc',
      keyFields: ['model'],
      extra: { brand: 'TEST', dealFlag: 0 },
    },
  ];

  test('list/create/update/delete works for standalone modules', async () => {
    for (const item of standaloneCases) {
      const code = `TEST-${item.module.slice(0, 3).toUpperCase()}-${suffix()}`;
      const created = await client.create(item.module, {
        ...item.extra,
        [item.codeField]: code,
        [item.nameField]: `Created ${code}`,
      });
      const key = rowKey(created, item.keyFields);
      cleanup.track(item.module, key);

      expect(String(created[item.codeField]), `${item.module} code`).toBe(code);
      if (item.extra?.fflag === 'Y') {
        expect(created.fflag, `${item.module} fflag`).toBe('Y');
      }
      if (item.module === 'model') {
        expect(created.dealFlag, 'dealFlag is numeric').toBe(0);
      }

      const listed = await client.list(item.module, { code, pageSize: 10 });
      expect(listed.total, `${item.module} list total`).toBeGreaterThan(0);
      expect(
        listed.items.some((row) => String(row[item.codeField]) === code),
        `${item.module} list contains new row`,
      ).toBe(true);

      const updatedName = `Updated ${code}`;
      const updated = await client.update(item.module, key, {
        [item.nameField]: updatedName,
      });
      expect(updated[item.nameField], `${item.module} edit`).toBe(updatedName);

      expect(await client.remove(item.module, key), `${item.module} delete`).toBe(
        true,
      );
      const after = await client.list(item.module, { code, pageSize: 10 });
      expect(after.total, `${item.module} row removed`).toBe(0);
    }
  });

  test('list/create/update/delete works for dependent modules', async () => {
    const s = suffix();
    const colorCode = `TEST-COL-${s}`;
    const lineCode = `TEST-LIN-${s}`;
    const siteCode = `TEST-SIT-${s}`;
    const warehouseCode = `TEST-WHS-${s}`;
    const modelCode = `TEST-MDL-${s}`;
    const userCode = 'U012';

    const prerequisites: Array<[string, string, BaseRecord]> = [
      ['color', colorCode, await client.create('color', { colorCode, colorName: `Color ${s}` })],
      ['line', lineCode, await client.create('line', { lineCode, lineName: `Line ${s}` })],
      ['site', siteCode, await client.create('site', { siteCode, siteName: `Site ${s}`, fflag: 'Y' })],
      [
        'warehouse',
        warehouseCode,
        await client.create('warehouse', {
          wareHouseCode: warehouseCode,
          wareHouseName: `Warehouse ${s}`,
          fflag: 'Y',
        }),
      ],
      [
        'model',
        modelCode,
        await client.create('model', {
          model: modelCode,
          modelDesc: `Model ${s}`,
          colorCode,
          dealFlag: 0,
        }),
      ],
    ];
    for (const [module, key] of prerequisites) {
      cleanup.track(module, key);
    }

    type ChildCase = {
      keyFields: string[];
      module: string;
      payload: Record<string, unknown>;
      search: Record<string, string>;
      update: Record<string, unknown>;
      verifyField: string;
      verifyValue: unknown;
    };

    const childCases: ChildCase[] = [
      {
        module: 'line-site',
        keyFields: ['lineCode', 'siteCode'],
        payload: { lineCode, siteCode, siteOrder: 1, license: 'TEST' },
        search: { lineCode, siteCode },
        update: { license: 'UPDATED' },
        verifyField: 'license',
        verifyValue: 'UPDATED',
      },
      {
        module: 'line-site-scan-user',
        keyFields: ['lineCode', 'siteCode', 'scanUserCode'],
        payload: { lineCode, siteCode, scanUserCode: userCode, remark: 'TEST' },
        search: { lineCode, siteCode, scanUserCode: userCode },
        update: { remark: 'UPDATED' },
        verifyField: 'remark',
        verifyValue: 'UPDATED',
      },
      {
        module: 'model-site',
        keyFields: ['model', 'siteCode'],
        payload: { model: modelCode, siteCode, siteOrder: 1, partScanQty: 2 },
        search: { model: modelCode, siteCode },
        update: { siteOrder: 2 },
        verifyField: 'siteOrder',
        verifyValue: 2,
      },
      {
        module: 'user-warehouse',
        keyFields: ['userCode', 'wareHouseCode'],
        payload: { userCode, wareHouseCode: warehouseCode, remark: 'TEST' },
        search: { userCode, wareHouseCode: warehouseCode },
        update: { remark: 'UPDATED' },
        verifyField: 'remark',
        verifyValue: 'UPDATED',
      },
      {
        module: 'model-material',
        keyFields: ['id'],
        payload: {
          model: modelCode,
          materialCode: `TEST-MAT-${s}`,
          materialName: `Material ${s}`,
          sitecode: siteCode,
          dealFlag: 0,
        },
        search: { materialCode: `TEST-MAT-${s}` },
        update: { materialName: `Updated Material ${s}` },
        verifyField: 'materialName',
        verifyValue: `Updated Material ${s}`,
      },
    ];

    for (const item of childCases) {
      if (item.module === 'line-site-scan-user') {
        await client.create('line-site', {
          lineCode,
          siteCode,
          siteOrder: 1,
        });
        cleanup.track('line-site', `${lineCode}|${siteCode}`);
      }
      if (item.module === 'model-material') {
        await client.create('model-site', {
          model: modelCode,
          siteCode,
          siteOrder: 1,
        });
        cleanup.track('model-site', `${modelCode}|${siteCode}`);
      }

      const created = await client.create(item.module, item.payload);
      const key = rowKey(created, item.keyFields);
      cleanup.track(item.module, key);

      const listed = await client.list(item.module, {
        ...item.search,
        pageSize: 10,
      });
      expect(listed.total, `${item.module} list total`).toBeGreaterThan(0);

      const updated = await client.update(item.module, key, item.update);
      expect(updated[item.verifyField], `${item.module} edit`).toBe(
        item.verifyValue,
      );

      expect(await client.remove(item.module, key), `${item.module} delete`).toBe(
        true,
      );
      const after = await client.list(item.module, {
        ...item.search,
        pageSize: 10,
      });
      expect(after.total, `${item.module} row removed`).toBe(0);
    }
  });

  test('validation rejects bad module, missing fields, duplicates and bad parents', async () => {
    const s = suffix();

    const badModule = await client.fail('GET', '/base/not-a-module/list');
    expect(badModule.code).toBe(404);
    expect(badModule.message).toContain('Unknown base module');

    const missing = await client.fail('POST', '/base/city', {
      cityCode: `TEST-MIS-${s}`,
    });
    expect(missing.message).toContain('is required');

    const duplicateCode = `TEST-DUP-${s}`;
    const first = await client.create('city', {
      cityCode: duplicateCode,
      cityName: `City ${s}`,
    });
    cleanup.track('city', rowKey(first, ['cityCode']));
    const duplicate = await client.fail('POST', '/base/city', {
      cityCode: duplicateCode,
      cityName: `Dup ${s}`,
    });
    expect(duplicate.message).toContain('already exists');

    const fieldCode = `TEST-FLD-${s}`;
    const firstField = await client.create('field-en', {
      baseCode: fieldCode,
      baseName: `Field ${s}`,
    });
    cleanup.track('field-en', rowKey(firstField, ['id']));
    const duplicateField = await client.fail('POST', '/base/field-en', {
      baseCode: fieldCode,
      baseName: `Dup ${s}`,
    });
    expect(duplicateField.message).toContain('already exists');

    const badParent = await client.fail('POST', '/base/line-site', {
      lineCode: `NOPE-${s}`,
      siteCode: `NOPE-${s}`,
    });
    expect(badParent.message).toContain('does not exist');
  });

  test('parent rows cannot be deleted while child rows exist', async () => {
    const s = suffix();
    const colorCode = `TEST-PC-${s}`;
    const modelCode = `TEST-PM-${s}`;

    await client.create('color', { colorCode, colorName: `Color ${s}` });
    cleanup.track('color', colorCode);
    const model = await client.create('model', {
      model: modelCode,
      modelDesc: `Model ${s}`,
      colorCode,
    });
    cleanup.track('model', modelCode);

    const blocked = await client.fail('DELETE', `/base/color/${colorCode}`);
    expect(blocked.message).toContain('still used by Model');

    expect(await client.remove('model', modelCode)).toBe(true);
    expect(await client.remove('color', colorCode)).toBe(true);
  });

  test('line scan user can only be assigned to one line', async () => {
    const s = suffix();
    const lineCode1 = `TEST-SL1-${s}`;
    const lineCode2 = `TEST-SL2-${s}`;
    const siteCode = `TEST-SS-${s}`;
    const userCode = 'U012';

    await client.create('line', {
      lineCode: lineCode1,
      lineName: `Line 1 ${s}`,
    });
    cleanup.track('line', lineCode1);
    await client.create('line', {
      lineCode: lineCode2,
      lineName: `Line 2 ${s}`,
    });
    cleanup.track('line', lineCode2);
    await client.create('site', {
      siteCode,
      siteName: `Site ${s}`,
      fflag: 'Y',
    });
    cleanup.track('site', siteCode);
    await client.create('line-site', {
      lineCode: lineCode1,
      siteCode,
      siteOrder: 1,
    });
    cleanup.track('line-site', `${lineCode1}|${siteCode}`);

    const assignment = await client.create('line-site-scan-user', {
      lineCode: lineCode1,
      siteCode,
      scanUserCode: userCode,
    });
    cleanup.track(
      'line-site-scan-user',
      rowKey(assignment, ['lineCode', 'siteCode', 'scanUserCode']),
    );

    const blockedDelete = await client.fail(
      'DELETE',
      `/base/line-site/${encodeURIComponent(`${lineCode1}|${siteCode}`)}`,
    );
    expect(blockedDelete.message).toContain('still used by Line Scan User');

    const duplicate = await client.fail('POST', '/base/line-site-scan-user', {
      lineCode: lineCode2,
      siteCode,
      scanUserCode: userCode,
    });
    expect(duplicate.message).toContain('already exists');
  });

  test('model material validates site and prevents duplicate material codes', async () => {
    const s = suffix();
    const colorCode = `TEST-MC-${s}`;
    const siteCode = `TEST-MS-${s}`;
    const modelCode = `TEST-MM-${s}`;
    const materialCode = `TEST-MAT-${s}`;

    await client.create('color', {
      colorCode,
      colorName: `Color ${s}`,
    });
    cleanup.track('color', colorCode);
    await client.create('site', {
      siteCode,
      siteName: `Site ${s}`,
      fflag: 'Y',
    });
    cleanup.track('site', siteCode);
    await client.create('model', {
      model: modelCode,
      modelDesc: `Model ${s}`,
      colorCode,
      dealFlag: 0,
    });
    cleanup.track('model', modelCode);
    await client.create('model-site', {
      model: modelCode,
      siteCode,
      siteOrder: 1,
    });
    cleanup.track('model-site', `${modelCode}|${siteCode}`);

    const badSite = await client.fail('POST', '/base/model-material', {
      model: modelCode,
      materialCode: `TEST-BAD-${s}`,
      materialName: `Bad site ${s}`,
      sitecode: `NOPE-${s}`,
      dealFlag: 0,
    });
    expect(badSite.message).toContain('does not exist');

    const material = await client.create('model-material', {
      model: modelCode,
      materialCode,
      materialName: `Material ${s}`,
      sitecode: siteCode,
      dealFlag: 0,
    });
    cleanup.track('model-material', rowKey(material, ['id']));
    expect(material.factoryId).toBeFalsy();

    const blockedDelete = await client.fail(
      'DELETE',
      `/base/model-site/${encodeURIComponent(`${modelCode}|${siteCode}`)}`,
    );
    expect(blockedDelete.message).toContain('still used by Model Material');

    const badFactory = await client.fail('POST', '/base/model-material', {
      model: modelCode,
      materialCode: `TEST-FAC-${s}`,
      materialName: `Bad factory ${s}`,
      sitecode: siteCode,
      factoryId: 'WRONG',
      dealFlag: 0,
    });
    expect(badFactory.message).toContain('must match Model');

    const duplicate = await client.fail('POST', '/base/model-material', {
      model: modelCode,
      materialCode,
      materialName: `Duplicate ${s}`,
      sitecode: siteCode,
      dealFlag: 0,
    });
    expect(duplicate.message).toContain('already exists');
  });

  test('model color name follows the selected color code', async () => {
    const s = suffix();
    const blackCode = `TEST-CB-${s}`;
    const whiteCode = `TEST-CW-${s}`;
    const modelCode = `TEST-COLOR-${s}`;

    await client.create('color', {
      colorCode: blackCode,
      colorName: `Black ${s}`,
    });
    cleanup.track('color', blackCode);
    await client.create('color', {
      colorCode: whiteCode,
      colorName: `White ${s}`,
    });
    cleanup.track('color', whiteCode);

    const created = await client.create('model', {
      model: modelCode,
      modelDesc: `Model ${s}`,
      colorCode: blackCode,
      dealFlag: 0,
    });
    cleanup.track('model', modelCode);
    expect(created.color, 'color is derived on create').toBe(`Black ${s}`);

    const updated = await client.update('model', modelCode, {
      colorCode: whiteCode,
    });
    expect(updated.color, 'color is derived on update').toBe(`White ${s}`);
  });
});
