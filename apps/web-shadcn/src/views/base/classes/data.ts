import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { BaseClassesApi } from '#/api';

import { useAccess } from '@vben/access';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

function getStatusOptions() {
  return [
    { label: $t('common.enabled'), value: 1 },
    { label: $t('common.disabled'), value: 0 },
  ];
}

/** Shift search form */
export function useClassesGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.classes.name'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.classes.code'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: getStatusOptions(),
      },
      fieldName: 'status',
      label: $t('system.classes.status'),
    },
  ];
}

/** Shift edit form */
export function useClassesFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'classesCode',
      label: $t('system.classes.code'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.classes.code')]))
        .max(50, $t('ui.formRules.maxLength', [$t('system.classes.code'), 50])),
    },
    {
      component: 'Input',
      fieldName: 'classesName',
      label: $t('system.classes.name'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.classes.name')]))
        .max(50, $t('ui.formRules.maxLength', [$t('system.classes.name'), 50])),
    },
    {
      component: 'TimePicker',
      fieldName: 'beginTimeStr',
      label: $t('system.classes.beginTime'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.classes.beginTime')])),
    },
    {
      component: 'TimePicker',
      fieldName: 'endTimeStr',
      label: $t('system.classes.endTime'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.required', [$t('system.classes.endTime')])),
    },
    {
      component: 'Checkbox',
      defaultValue: false,
      fieldName: 'crossDay',
      label: $t('system.classes.crossDay'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: getStatusOptions(),
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.classes.status'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 100,
        rows: 3,
        showCount: true,
      },
      fieldName: 'remark',
      label: $t('system.classes.remark'),
      rules: z
        .string()
        .max(100, $t('ui.formRules.maxLength', [$t('system.classes.remark'), 100]))
        .optional(),
    },
  ];
}

/** Shift table columns */
export function useClassesColumns(
  onActionClick: OnActionClickFn<BaseClassesApi.BaseClass>,
): VxeTableGridColumns<BaseClassesApi.BaseClass> {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      field: 'classesCode',
      minWidth: 130,
      title: $t('system.classes.code'),
    },
    {
      field: 'classesName',
      minWidth: 140,
      title: $t('system.classes.name'),
    },
    {
      field: 'beginTimeStr',
      minWidth: 100,
      title: $t('system.classes.beginTime'),
    },
    {
      field: 'endTimeStr',
      minWidth: 100,
      title: $t('system.classes.endTime'),
    },
    {
      field: 'crossDay',
      formatter: ({ cellValue }) =>
        cellValue === '1' ? $t('common.yes') : $t('common.no'),
      title: $t('system.classes.crossDay'),
      width: 100,
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.classes.status'),
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 120,
      title: $t('system.classes.remark'),
    },
    {
      field: 'createTime',
      title: $t('system.classes.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'classesName',
          nameTitle: $t('system.classes.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { code: 'edit', show: () => hasAccessByCodes(['BaseClasses:edit']) },
          {
            code: 'delete',
            popConfirm: false,
            show: () => hasAccessByCodes(['BaseClasses:delete']),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      showOverflow: false,
      title: $t('system.classes.operation'),
      width: 150,
    },
  ];
}
