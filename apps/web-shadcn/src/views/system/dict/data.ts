import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemDictApi } from '#/api';

import { useAccess } from '@vben/access';

import { z } from '#/adapter/form';
import { isDictCodeExists } from '#/api';
import { $t } from '#/locales';

const COLOR_OPTIONS = [
  { label: 'success', value: 'success' },
  { label: 'processing', value: 'processing' },
  { label: 'warning', value: 'warning' },
  { label: 'error', value: 'error' },
  { label: 'default', value: 'default' },
];

/** Left tree search form: dictionary types only. */
export function useTypeTreeFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('system.dict.styleName'),
      },
      fieldName: 'styleName',
      label: $t('system.dict.styleName'),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('system.dict.styleCode'),
      },
      fieldName: 'styleCode',
      label: $t('system.dict.styleCode'),
    },
  ];
}

/** Right table search form: data rows of the selected type. */
export function useDataSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'subStyleName',
      label: $t('system.dict.subStyleName'),
    },
    {
      component: 'Input',
      fieldName: 'subStyleCode',
      label: $t('system.dict.subStyleCode'),
    },
  ];
}

/** Dictionary type create/edit form. styleCode is the PK and is immutable. */
export function useTypeFormSchema(
  getStyleCode: () => string | undefined,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'styleName',
      label: $t('system.dict.styleName'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.dict.styleName'), 2]))
        .max(50, $t('ui.formRules.maxLength', [$t('system.dict.styleName'), 50])),
    },
    {
      component: 'Input',
      componentProps: () => ({ disabled: !!getStyleCode() }),
      fieldName: 'styleCode',
      label: $t('system.dict.styleCode'),
      rules: z
        .string()
        .regex(/^[a-z][a-z0-9_]*$/, $t('system.dict.codeFormat'))
        .min(2, $t('ui.formRules.minLength', [$t('system.dict.styleCode'), 2]))
        .max(50, $t('ui.formRules.maxLength', [$t('system.dict.styleCode'), 50]))
        .refine(
          async (value: string) => !(await isDictCodeExists(value, getStyleCode())),
          {
            error: (issue) =>
              $t('ui.formRules.alreadyExists', [
                $t('system.dict.styleCode'),
                issue.input,
              ]),
          },
        ),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '0',
      },
      defaultValue: '0',
      fieldName: 'parentStyleCode',
      label: $t('system.dict.parentCode'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 1,
      },
      fieldName: 'displayOrder',
      label: $t('system.dict.displayOrder'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 100,
        rows: 3,
        showCount: true,
      },
      fieldName: 'remark',
      label: $t('system.dict.remark'),
      rules: z
        .string()
        .max(100, $t('ui.formRules.maxLength', [$t('system.dict.remark'), 100]))
        .optional(),
    },
  ];
}

/** Dictionary data create/edit form. subStyleCode is the PK and is immutable. */
export function useDataFormSchema(
  getSubStyleCode: () => string | undefined,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'styleCode',
      label: $t('system.dict.styleCode'),
    },
    {
      component: 'Input',
      componentProps: () => ({ disabled: !!getSubStyleCode() }),
      fieldName: 'subStyleCode',
      label: $t('system.dict.subStyleCode'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'subStyleName',
      label: $t('system.dict.subStyleName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.dict.subStyleName')]))
        .max(50, $t('ui.formRules.maxLength', [$t('system.dict.subStyleName'), 50])),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: COLOR_OPTIONS,
      },
      fieldName: 'subStyleNameExt',
      label: $t('system.dict.color'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 1,
      },
      fieldName: 'displayOrder',
      label: $t('system.dict.displayOrder'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 100,
        rows: 3,
        showCount: true,
      },
      fieldName: 'remark',
      label: $t('system.dict.remark'),
      rules: z
        .string()
        .max(100, $t('ui.formRules.maxLength', [$t('system.dict.remark'), 100]))
        .optional(),
    },
  ];
}

/** Left sortable dictionary type tree columns. */
export function useTypeColumns(
  onActionClick: OnActionClickFn<SystemDictApi.SystemDictType>,
): VxeTableGridColumns<SystemDictApi.SystemDictType> {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      dragSort: true,
      field: 'styleName',
      minWidth: 180,
      title: $t('system.dict.styleName'),
      treeNode: true,
    },
    {
      field: 'styleCode',
      minWidth: 150,
      title: $t('system.dict.styleCode'),
    },
    {
      field: 'displayOrder',
      title: $t('system.dict.displayOrder'),
      width: 90,
    },
    {
      field: 'remark',
      minWidth: 120,
      title: $t('system.dict.remark'),
    },
    {
      field: 'createTime',
      title: $t('system.dict.createTime'),
      width: 170,
    },
    {
      field: 'createUserName',
      formatter: ({ cellValue, row }) =>
        cellValue || row.createUserCode || '',
      title: $t('system.dict.createUser'),
      width: 140,
    },
    {
      field: 'updateTime',
      title: $t('system.dict.updateTime'),
      width: 170,
    },
    {
      field: 'updateUserName',
      formatter: ({ cellValue, row }) =>
        cellValue || row.updateUserCode || '',
      title: $t('system.dict.updateUser'),
      width: 140,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'styleName',
          nameTitle: $t('system.dict.styleName'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'addData',
            show: () => hasAccessByCodes(['SystemDict:create']),
            text: $t('system.dict.addData'),
          },
          {
            code: 'edit',
            show: () => hasAccessByCodes(['SystemDict:edit']),
          },
          {
            code: 'delete',
            popConfirm: false,
            show: () => hasAccessByCodes(['SystemDict:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      title: $t('system.dict.operation'),
      width: 220,
    },
  ];
}

/** Right dictionary data table columns. */
export function useDataColumns(
  onActionClick: OnActionClickFn<SystemDictApi.SystemDictData>,
): VxeTableGridColumns<SystemDictApi.SystemDictData> {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      dragSort: true,
      field: 'subStyleName',
      minWidth: 180,
      title: $t('system.dict.subStyleName'),
    },
    {
      field: 'subStyleCode',
      minWidth: 150,
      title: $t('system.dict.subStyleCode'),
    },
    {
      field: 'displayOrder',
      title: $t('system.dict.displayOrder'),
      width: 90,
    },
    {
      field: 'remark',
      minWidth: 120,
      title: $t('system.dict.remark'),
    },
    {
      field: 'createTime',
      title: $t('system.dict.createTime'),
      width: 170,
    },
    {
      field: 'createUserName',
      formatter: ({ cellValue, row }) =>
        cellValue || row.createUserCode || '',
      title: $t('system.dict.createUser'),
      width: 140,
    },
    {
      field: 'updateTime',
      title: $t('system.dict.updateTime'),
      width: 170,
    },
    {
      field: 'updateUserName',
      formatter: ({ cellValue, row }) =>
        cellValue || row.updateUserCode || '',
      title: $t('system.dict.updateUser'),
      width: 140,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'subStyleName',
          nameTitle: $t('system.dict.subStyleName'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            show: () => hasAccessByCodes(['SystemDict:edit']),
          },
          {
            code: 'delete',
            popConfirm: false,
            show: () => hasAccessByCodes(['SystemDict:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      title: $t('system.dict.operation'),
      width: 160,
    },
  ];
}
