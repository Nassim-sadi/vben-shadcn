import type { VbenFormSchema } from '#/adapter/form';
import type {
  OnActionClickFn,
  VxeTableGridColumns,
} from '#/adapter/vxe-table';
import type { BaseDataApi } from '#/api';

import { useAccess } from '@vben/access';

import { getBaseList, getUserList } from '#/api';
import { $t } from '#/locales';

type RecordType = BaseDataApi.BaseRecord;

export interface BaseModuleConfig {
  key: string;
  permission: string;
  titleKey: string;
  nameKey: string;
  nameField: string;
  keyFields: string[];
  search: () => VbenFormSchema[];
  form: () => VbenFormSchema[];
  columns: (
    onActionClick: OnActionClickFn<RecordType>,
  ) => VxeTableGridColumns<RecordType>;
}

const F = 'system.base.fields';

function label(key: string) {
  return $t(`${F}.${key}`);
}

function statusOptions() {
  return [
    { label: $t('common.enabled'), value: 1 },
    { label: $t('common.disabled'), value: 0 },
  ];
}

function statusSearchField(): VbenFormSchema {
  return {
    component: 'Select',
    componentProps: { allowClear: true, options: statusOptions() },
    fieldName: 'status',
    label: label('status'),
  };
}

function statusFormField(): VbenFormSchema {
  return {
    component: 'RadioGroup',
    componentProps: {
      buttonStyle: 'solid',
      options: statusOptions(),
      optionType: 'button',
    },
    defaultValue: 1,
    fieldName: 'status',
    label: label('status'),
  };
}

function searchText(fieldName: string, key: string): VbenFormSchema {
  return { component: 'Input', fieldName, label: label(key) };
}

function formText(
  fieldName: string,
  key: string,
  required = false,
  maxLength?: number,
): VbenFormSchema {
  return {
    component: 'Input',
    fieldName,
    label: label(key),
    rules: required ? 'required' : undefined,
    componentProps: maxLength ? { maxLength } : undefined,
  };
}

function formNumber(fieldName: string, key: string): VbenFormSchema {
  return {
    component: 'InputNumber',
    componentProps: { class: 'w-full', min: 0 },
    fieldName,
    label: label(key),
  };
}

function formTextarea(fieldName = 'remark'): VbenFormSchema {
  return {
    component: 'Textarea',
    componentProps: { maxLength: 2000, rows: 3, showCount: true },
    fieldName,
    label: label('remark'),
  };
}

function baseOptions(module: string, valueField: string, labelField: string) {
  return async () => {
    const { items } = await getBaseList(module, { page: 1, pageSize: 10_000 });
    return items.map((row) => ({
      label: String(row[labelField] ?? row[valueField] ?? ''),
      value: row[valueField],
    }));
  };
}

function userOptions() {
  return async () => {
    const rows = await getUserList({ page: 1, pageSize: 10_000 });
    const items = Array.isArray(rows) ? rows : ((rows as any)?.items ?? []);
    return items.map((row: any) => ({
      label: `${row.name ?? row.userCode} (${row.userCode})`,
      value: row.userCode,
    }));
  };
}

function formSelect(
  fieldName: string,
  key: string,
  api: () => Promise<Array<{ label: string; value: any }>>,
  required = false,
): VbenFormSchema {
  return {
    component: 'ApiSelect',
    componentProps: {
      allowClear: true,
      api,
      class: 'w-full',
      labelField: 'label',
      valueField: 'value',
    },
    fieldName,
    label: label(key),
    rules: required ? 'required' : undefined,
  };
}

function textColumn(field: string, key: string, width = 140) {
  return { field, minWidth: width, title: label(key) };
}

function statusColumn() {
  return {
    cellRender: { name: 'CellTag' },
    field: 'status',
    title: label('status'),
    width: 100,
  };
}

function flagColumn(field: string, key: string) {
  return {
    field,
    formatter: ({ cellValue }: { cellValue?: any }) =>
      cellValue === 'Y'
        ? $t('common.yes')
        : cellValue === 'N'
          ? $t('common.no')
          : (cellValue ?? ''),
    title: label(key),
    width: 110,
  };
}

function auditColumns(): any[] {
  return [
    {
      field: 'createUserName',
      formatter: ({ cellValue, row }: { cellValue?: any; row?: RecordType }) =>
        cellValue || row?.createUserCode || '',
      title: label('createUser'),
      width: 140,
    },
    { field: 'createTime', title: label('createTime'), width: 170 },
    {
      field: 'updateUserName',
      formatter: ({ cellValue, row }: { cellValue?: any; row?: RecordType }) =>
        cellValue || row?.updateUserCode || '',
      title: label('updateUser'),
      width: 140,
    },
    { field: 'updateTime', title: label('updateTime'), width: 170 },
  ];
}

function operationColumn(
  onActionClick: OnActionClickFn<RecordType>,
  nameField: string,
  nameTitle: string,
  permission: string,
) {
  const { hasAccessByCodes } = useAccess();
  return {
    align: 'center',
    cellRender: {
      attrs: {
        nameField,
        nameTitle,
        onClick: onActionClick,
      },
      name: 'CellOperation',
      options: [
        {
          code: 'edit',
          show: () => hasAccessByCodes([`${permission}:edit`]),
        },
        {
          code: 'delete',
          popConfirm: false,
          show: () => hasAccessByCodes([`${permission}:delete`]),
        },
      ],
    },
    field: 'operation',
    fixed: 'right',
    showOverflow: false,
    title: label('operation'),
    width: 150,
  };
}

function gridColumns(
  onActionClick: OnActionClickFn<RecordType>,
  fields: any[],
  nameField: string,
  nameTitle: string,
  permission: string,
): VxeTableGridColumns<RecordType> {
  const columns = [
    ...fields,
    ...auditColumns(),
    operationColumn(onActionClick, nameField, nameTitle, permission),
  ];
  return columns as VxeTableGridColumns<RecordType>;
}

function simpleConfig(
  key: string,
  permission: string,
  titleKey: string,
  nameKey: string,
  codeField: string,
  nameField: string,
): BaseModuleConfig {
  return {
    key,
    permission,
    titleKey,
    nameKey,
    nameField,
    keyFields: [codeField],
    search: () => [
      searchText('code', 'code'),
      searchText('name', 'name'),
    ],
    form: () => [
      formText(codeField, 'code', true, 100),
      formText(nameField, 'name', true, 200),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn(codeField, 'code', 160),
          textColumn(nameField, 'name', 180),
          textColumn('remark', 'remark', 200),
        ],
        nameField,
        $t(nameKey),
        permission,
      ),
  };
}

export const baseModuleConfigs: Record<string, BaseModuleConfig> = {
  city: simpleConfig(
    'city',
    'BaseCity',
    'system.base.city.title',
    'system.base.city.name',
    'cityCode',
    'cityName',
  ),
  color: simpleConfig(
    'color',
    'BaseColor',
    'system.base.color.title',
    'system.base.color.name',
    'colorCode',
    'colorName',
  ),
  line: simpleConfig(
    'line',
    'BaseLine',
    'system.base.line.title',
    'system.base.line.name',
    'lineCode',
    'lineName',
  ),
  warehouse: {
    key: 'warehouse',
    permission: 'BaseWareHouse',
    titleKey: 'system.base.warehouse.title',
    nameKey: 'system.base.warehouse.name',
    nameField: 'wareHouseName',
    keyFields: ['wareHouseCode'],
    search: () => [
      searchText('code', 'wareHouseCode'),
      searchText('name', 'wareHouseName'),
      searchText('type', 'wareHouseType'),
      statusSearchField(),
    ],
    form: () => [
      formText('wareHouseCode', 'wareHouseCode', true, 100),
      formText('wareHouseName', 'wareHouseName', true, 200),
      formText('wareHouseType', 'wareHouseType'),
      formText('license', 'license'),
      statusFormField(),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('wareHouseCode', 'wareHouseCode', 160),
          textColumn('wareHouseName', 'wareHouseName', 180),
          textColumn('wareHouseType', 'wareHouseType'),
          textColumn('license', 'license'),
          statusColumn(),
          textColumn('remark', 'remark', 180),
        ],
        'wareHouseName',
        label('wareHouseName'),
        'BaseWareHouse',
      ),
  },
  'field-en': {
    key: 'field-en',
    permission: 'BaseFieldEN',
    titleKey: 'system.base.fieldEn.title',
    nameKey: 'system.base.fieldEn.name',
    nameField: 'baseName',
    keyFields: ['id'],
    search: () => [
      searchText('code', 'code'),
      searchText('name', 'name'),
      statusSearchField(),
    ],
    form: () => [
      formText('baseCode', 'code', true, 100),
      formText('baseName', 'name', true, 200),
      formNumber('displayOrder', 'order'),
      statusFormField(),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('baseCode', 'code', 160),
          textColumn('baseName', 'name', 180),
          textColumn('displayOrder', 'order', 110),
          statusColumn(),
          textColumn('remark', 'remark', 180),
        ],
        'baseName',
        label('name'),
        'BaseFieldEN',
      ),
  },
  site: {
    key: 'site',
    permission: 'BaseSite',
    titleKey: 'system.base.site.title',
    nameKey: 'system.base.site.name',
    nameField: 'siteName',
    keyFields: ['siteCode'],
    search: () => [
      searchText('code', 'siteCode'),
      searchText('name', 'siteName'),
      searchText('section', 'section'),
      searchText('licenseType', 'licenseType'),
      statusSearchField(),
    ],
    form: () => [
      formText('siteCode', 'siteCode', true, 100),
      formText('siteName', 'siteName', true, 200),
      formNumber('siteOrder', 'order'),
      formText('materialName', 'materialName'),
      statusFormField(),
      formText('formName', 'formName'),
      formText('gongDuan', 'section'),
      formText('scanSection', 'scanSection'),
      formText('encryptKey', 'privateKey'),
      formText('qxStyle', 'authorityStyle'),
      formText('oQCStyle', 'oqcStyle'),
      formText('oeeRepairFlag', 'oeeRepairFlag'),
      formText('licType', 'licenseType'),
      formText('dllName', 'dllName'),
      formText('formNamePrint', 'printForm'),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('siteCode', 'siteCode', 150),
          textColumn('siteName', 'siteName', 160),
          textColumn('siteOrder', 'order', 100),
          textColumn('materialName', 'materialName'),
          statusColumn(),
          textColumn('formName', 'formName'),
          textColumn('gongDuan', 'section'),
          textColumn('scanSection', 'scanSection'),
          textColumn('encryptKey', 'privateKey'),
          textColumn('qxStyle', 'authorityStyle'),
          textColumn('oQCStyle', 'oqcStyle'),
          textColumn('oeeRepairFlag', 'oeeRepairFlag'),
          textColumn('licType', 'licenseType'),
          textColumn('dllName', 'dllName'),
          textColumn('formNamePrint', 'printForm'),
          textColumn('remark', 'remark', 180),
        ],
        'siteName',
        label('siteName'),
        'BaseSite',
      ),
  },
  model: {
    key: 'model',
    permission: 'BaseModelNumber',
    titleKey: 'system.base.model.title',
    nameKey: 'system.base.model.name',
    nameField: 'modelDesc',
    keyFields: ['model'],
    search: () => [
      searchText('code', 'model'),
      searchText('name', 'modelDesc'),
      searchText('brand', 'brand'),
      searchText('processGate', 'processGate'),
      searchText('dealFlag', 'dealFlag'),
    ],
    form: () => [
      formText('model', 'model', true, 100),
      formText('modelDesc', 'modelDesc', true, 200),
      formText('modelDesc2', 'modelDesc2'),
      formSelect(
        'colorCode',
        'colorCode',
        baseOptions('color', 'colorCode', 'colorName'),
      ),
      formText('color', 'color'),
      formText('ean', 'ean'),
      formNumber('imeiCount', 'imeiCount'),
      formNumber('boxNumber', 'boxNumber'),
      formNumber('palletNumber', 'palletNumber'),
      formText('boxAssembly', 'boxAssembly'),
      formText('ean6', 'ean6'),
      formText('modelType', 'modelType'),
      formText('modelDesc2Show', 'modelDesc2Show'),
      formText('modelTypeValue', 'modelTypeValue'),
      formText('productNumber', 'productNumber'),
      formText('cENumber', 'ceNumber'),
      formText('networkstandard', 'networkStandard'),
      formText('arpt', 'arpt'),
      formText('poidsNet', 'netWeight'),
      formText('poidsBrut', 'grossWeight'),
      formText('dimension', 'dimension'),
      formText('oQCStdGradeCode', 'oqcStandard'),
      formText('warantyPeriod', 'warrantyPeriod'),
      formText('giftSize', 'giftSize'),
      formText('giftWeight', 'giftWeight'),
      formText('boxSize', 'boxSize'),
      formText('boxWeight', 'boxWeight'),
      formText('palletSize', 'palletSize'),
      formText('palletWeight', 'palletWeight'),
      formText('bomFlag', 'bomFlag'),
      formText('ean14', 'ean14'),
      formNumber('dealFlag', 'dealFlag'),
      formText('factoryId', 'factory'),
      formText('mouldCode', 'mouldCode'),
      formText('mouldName', 'mouldName'),
      formText('brand', 'brand'),
      formNumber('layerNumber', 'layerNumber'),
      formNumber('palletLayerNumber', 'palletLayerNumber'),
      formNumber('priceValueFinal', 'finalPrice'),
      formNumber('weightBoxGift', 'giftBoxWeight'),
      formNumber('weightBox', 'boxWeight'),
      formNumber('snWeight', 'snWeight'),
      formNumber('boxWeightOnly', 'boxNetWeight'),
      formNumber('snWeightRange', 'snWeightRange'),
      formNumber('boxWeightOnlyRange', 'boxWeightRange'),
      formText('processGate', 'processGate'),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('model', 'model', 150),
          textColumn('modelDesc', 'modelDesc', 200),
          textColumn('modelDesc2', 'modelDesc2', 160),
          textColumn('colorCode', 'colorCode'),
          textColumn('color', 'color'),
          textColumn('ean', 'ean', 120),
          textColumn('imeiCount', 'imeiCount', 110),
          textColumn('boxNumber', 'boxNumber', 110),
          textColumn('palletNumber', 'palletNumber', 120),
          flagColumn('boxAssembly', 'boxAssembly'),
          textColumn('ean6', 'ean6'),
          textColumn('modelType', 'modelType'),
          textColumn('modelDesc2Show', 'modelDesc2Show'),
          textColumn('modelTypeValue', 'modelTypeValue'),
          textColumn('productNumber', 'productNumber'),
          textColumn('cENumber', 'ceNumber'),
          textColumn('networkstandard', 'networkStandard', 180),
          textColumn('arpt', 'arpt'),
          textColumn('poidsNet', 'netWeight'),
          textColumn('poidsBrut', 'grossWeight'),
          textColumn('dimension', 'dimension'),
          textColumn('oQCStdGradeCode', 'oqcStandard'),
          textColumn('warantyPeriod', 'warrantyPeriod', 180),
          textColumn('giftSize', 'giftSize', 180),
          textColumn('giftWeight', 'giftWeight', 180),
          textColumn('boxSize', 'boxSize', 180),
          textColumn('boxWeight', 'boxWeight', 180),
          textColumn('palletSize', 'palletSize', 180),
          textColumn('palletWeight', 'palletWeight', 180),
          flagColumn('bomFlag', 'bomFlag'),
          textColumn('ean14', 'ean14'),
          textColumn('dealFlag', 'dealFlag', 100),
          textColumn('factoryId', 'factory'),
          textColumn('mouldCode', 'mouldCode'),
          textColumn('mouldName', 'mouldName'),
          textColumn('brand', 'brand'),
          textColumn('layerNumber', 'layerNumber', 110),
          textColumn('palletLayerNumber', 'palletLayerNumber', 130),
          textColumn('priceValueFinal', 'finalPrice', 130),
          textColumn('weightBoxGift', 'giftBoxWeight', 130),
          textColumn('weightBox', 'boxWeight', 120),
          textColumn('snWeight', 'snWeight', 120),
          textColumn('boxWeightOnly', 'boxNetWeight', 130),
          textColumn('snWeightRange', 'snWeightRange', 130),
          textColumn('boxWeightOnlyRange', 'boxWeightRange', 140),
          textColumn('processGate', 'processGate'),
          textColumn('remark', 'remark', 180),
        ],
        'modelDesc',
        label('modelDesc'),
        'BaseModelNumber',
      ),
  },
  'model-material': {
    key: 'model-material',
    permission: 'BaseModelMaterial',
    titleKey: 'system.base.material.title',
    nameKey: 'system.base.material.name',
    nameField: 'materialName',
    keyFields: ['id'],
    search: () => [
      formSelect(
        'model',
        'model',
        baseOptions('model', 'model', 'modelDesc'),
      ),
      searchText('materialCode', 'materialCode'),
      searchText('materialName', 'materialName'),
      searchText('materialType', 'materialType'),
      searchText('dealFlag', 'dealFlag'),
    ],
    form: () => [
      formSelect(
        'model',
        'model',
        baseOptions('model', 'model', 'modelDesc'),
        true,
      ),
      formText('materialCode', 'materialCode'),
      formText('materialName', 'materialName'),
      formText('dataStyle', 'dataStyle'),
      formText('materialClass', 'materialClass'),
      formText('materialQty', 'materialQty'),
      formText('materialType', 'materialType'),
      formText('materialUnit', 'materialUnit'),
      formText('partStyleCode', 'partStyleCode'),
      formNumber('materialQtyReal', 'realQty'),
      formText('sitecode', 'siteCode'),
      formNumber('dealFlag', 'dealFlag'),
      formText('factoryId', 'factory'),
      formText('levelStr', 'level'),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('model', 'model', 150),
          textColumn('materialCode', 'materialCode', 160),
          textColumn('materialName', 'materialName', 200),
          textColumn('dataStyle', 'dataStyle'),
          textColumn('materialClass', 'materialClass'),
          textColumn('materialQty', 'materialQty'),
          textColumn('materialType', 'materialType'),
          textColumn('materialUnit', 'materialUnit'),
          textColumn('partStyleCode', 'partStyleCode'),
          textColumn('materialQtyReal', 'realQty', 120),
          textColumn('sitecode', 'siteCode'),
          textColumn('dealFlag', 'dealFlag', 100),
          textColumn('factoryId', 'factory'),
          textColumn('levelStr', 'level'),
          textColumn('remark', 'remark', 180),
        ],
        'materialName',
        label('materialName'),
        'BaseModelMaterial',
      ),
  },
  'line-site': {
    key: 'line-site',
    permission: 'BaseLineSite',
    titleKey: 'system.base.lineSite.title',
    nameKey: 'system.base.lineSite.name',
    nameField: 'siteCode',
    keyFields: ['lineCode', 'siteCode'],
    search: () => [
      formSelect(
        'lineCode',
        'lineCode',
        baseOptions('line', 'lineCode', 'lineName'),
      ),
      formSelect('siteCode', 'siteCode', baseOptions('site', 'siteCode', 'siteName')),
    ],
    form: () => [
      formSelect(
        'lineCode',
        'lineCode',
        baseOptions('line', 'lineCode', 'lineName'),
        true,
      ),
      formSelect(
        'siteCode',
        'siteCode',
        baseOptions('site', 'siteCode', 'siteName'),
        true,
      ),
      formNumber('siteOrder', 'order'),
      formText('license', 'license'),
      formText('priorCheck', 'priorCheck'),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('lineCode', 'lineCode', 150),
          textColumn('siteCode', 'siteCode', 150),
          textColumn('siteOrder', 'order', 100),
          textColumn('license', 'license'),
          textColumn('priorCheck', 'priorCheck'),
          textColumn('remark', 'remark', 180),
        ],
        'siteCode',
        label('siteCode'),
        'BaseLineSite',
      ),
  },
  'line-site-scan-user': {
    key: 'line-site-scan-user',
    permission: 'BaseLineSiteScanUser',
    titleKey: 'system.base.lineScanUser.title',
    nameKey: 'system.base.lineScanUser.name',
    nameField: 'scanUserCode',
    keyFields: ['lineCode', 'siteCode', 'scanUserCode'],
    search: () => [
      formSelect(
        'lineCode',
        'lineCode',
        baseOptions('line', 'lineCode', 'lineName'),
      ),
      formSelect('siteCode', 'siteCode', baseOptions('site', 'siteCode', 'siteName')),
      formSelect('scanUserCode', 'scanUserCode', userOptions()),
    ],
    form: () => [
      formSelect(
        'lineCode',
        'lineCode',
        baseOptions('line', 'lineCode', 'lineName'),
        true,
      ),
      formSelect(
        'siteCode',
        'siteCode',
        baseOptions('site', 'siteCode', 'siteName'),
        true,
      ),
      formSelect('scanUserCode', 'scanUserCode', userOptions(), true),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('lineCode', 'lineCode', 150),
          textColumn('siteCode', 'siteCode', 150),
          textColumn('scanUserCode', 'scanUserCode', 170),
          textColumn('remark', 'remark', 180),
        ],
        'scanUserCode',
        label('scanUserCode'),
        'BaseLineSiteScanUser',
      ),
  },
  'model-site': {
    key: 'model-site',
    permission: 'BaseModelSite',
    titleKey: 'system.base.modelSite.title',
    nameKey: 'system.base.modelSite.name',
    nameField: 'siteCode',
    keyFields: ['model', 'siteCode'],
    search: () => [
      formSelect(
        'model',
        'model',
        baseOptions('model', 'model', 'modelDesc'),
      ),
      formSelect('siteCode', 'siteCode', baseOptions('site', 'siteCode', 'siteName')),
    ],
    form: () => [
      formSelect(
        'model',
        'model',
        baseOptions('model', 'model', 'modelDesc'),
        true,
      ),
      formSelect(
        'siteCode',
        'siteCode',
        baseOptions('site', 'siteCode', 'siteName'),
        true,
      ),
      formNumber('siteOrder', 'order'),
      formNumber('partScanQty', 'partScanQty'),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('model', 'model', 150),
          textColumn('siteCode', 'siteCode', 150),
          textColumn('siteOrder', 'order', 100),
          textColumn('partScanQty', 'partScanQty', 120),
          textColumn('remark', 'remark', 180),
        ],
        'siteCode',
        label('siteCode'),
        'BaseModelSite',
      ),
  },
  'user-warehouse': {
    key: 'user-warehouse',
    permission: 'BaseUserWareHouseRelation',
    titleKey: 'system.base.userWarehouse.title',
    nameKey: 'system.base.userWarehouse.name',
    nameField: 'userCode',
    keyFields: ['userCode', 'wareHouseCode'],
    search: () => [
      formSelect('userCode', 'userCode', userOptions()),
      formSelect(
        'wareHouseCode',
        'wareHouseCode',
        baseOptions('warehouse', 'wareHouseCode', 'wareHouseName'),
      ),
    ],
    form: () => [
      formSelect('userCode', 'userCode', userOptions(), true),
      formSelect(
        'wareHouseCode',
        'wareHouseCode',
        baseOptions('warehouse', 'wareHouseCode', 'wareHouseName'),
        true,
      ),
      formTextarea(),
    ],
    columns: (onActionClick) =>
      gridColumns(
        onActionClick,
        [
          textColumn('userCode', 'userCode', 160),
          textColumn('wareHouseCode', 'wareHouseCode', 180),
          textColumn('remark', 'remark', 180),
        ],
        'userCode',
        label('userName'),
        'BaseUserWareHouseRelation',
      ),
  },
};

export function getBaseModuleConfig(module: string) {
  return baseModuleConfigs[module];
}
