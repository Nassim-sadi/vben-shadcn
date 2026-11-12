import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { DataDisplayApi } from '#/api/data-display';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('page.dataDisplay.code'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('page.dataDisplay.name'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: $t('page.dataDisplay.categoryOptions.electronics'),
            value: 'electronics',
          },
          {
            label: $t('page.dataDisplay.categoryOptions.mechanics'),
            value: 'mechanics',
          },
          {
            label: $t('page.dataDisplay.categoryOptions.optical'),
            value: 'optical',
          },
          {
            label: $t('page.dataDisplay.categoryOptions.assembly'),
            value: 'assembly',
          },
        ],
      },
      defaultValue: 'electronics',
      fieldName: 'category',
      label: $t('page.dataDisplay.category'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: 'Line-A', value: 'Line-A' },
          { label: 'Line-B', value: 'Line-B' },
          { label: 'Line-C', value: 'Line-C' },
          { label: 'Line-D', value: 'Line-D' },
        ],
      },
      defaultValue: 'Line-A',
      fieldName: 'line',
      label: $t('page.dataDisplay.line'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
      },
      defaultValue: 100,
      fieldName: 'planQuantity',
      label: $t('page.dataDisplay.planQuantity'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
      },
      defaultValue: 0,
      fieldName: 'completedQuantity',
      label: $t('page.dataDisplay.completedQuantity'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('page.dataDisplay.priorityOptions.low'), value: 'low' },
          {
            label: $t('page.dataDisplay.priorityOptions.medium'),
            value: 'medium',
          },
          { label: $t('page.dataDisplay.priorityOptions.high'), value: 'high' },
        ],
        optionType: 'button',
      },
      defaultValue: 'medium',
      fieldName: 'priority',
      label: $t('page.dataDisplay.priority'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          {
            label: $t('page.dataDisplay.statusOptions.pending'),
            value: 0,
          },
          {
            label: $t('page.dataDisplay.statusOptions.inProduction'),
            value: 1,
          },
          {
            label: $t('page.dataDisplay.statusOptions.completed'),
            value: 2,
          },
          {
            label: $t('page.dataDisplay.statusOptions.exception'),
            value: 3,
          },
        ],
        optionType: 'button',
      },
      defaultValue: 0,
      fieldName: 'status',
      label: $t('page.dataDisplay.status'),
    },
    {
      component: 'Input',
      fieldName: 'operator',
      label: $t('page.dataDisplay.operator'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('page.dataDisplay.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('page.dataDisplay.code'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('page.dataDisplay.name'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('page.dataDisplay.categoryOptions.electronics'),
            value: 'electronics',
          },
          {
            label: $t('page.dataDisplay.categoryOptions.mechanics'),
            value: 'mechanics',
          },
          {
            label: $t('page.dataDisplay.categoryOptions.optical'),
            value: 'optical',
          },
          {
            label: $t('page.dataDisplay.categoryOptions.assembly'),
            value: 'assembly',
          },
        ],
      },
      fieldName: 'category',
      label: $t('page.dataDisplay.category'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: $t('page.dataDisplay.statusOptions.pending'),
            value: 0,
          },
          {
            label: $t('page.dataDisplay.statusOptions.inProduction'),
            value: 1,
          },
          {
            label: $t('page.dataDisplay.statusOptions.completed'),
            value: 2,
          },
          {
            label: $t('page.dataDisplay.statusOptions.exception'),
            value: 3,
          },
        ],
      },
      fieldName: 'status',
      label: $t('page.dataDisplay.status'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: 'Line-A', value: 'Line-A' },
          { label: 'Line-B', value: 'Line-B' },
          { label: 'Line-C', value: 'Line-C' },
          { label: 'Line-D', value: 'Line-D' },
        ],
      },
      fieldName: 'line',
      label: $t('page.dataDisplay.line'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: $t('page.dataDisplay.createTime'),
    },
  ];
}

export function useColumns<T = DataDisplayApi.Item>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridColumns {
  return [
    { type: 'seq', width: 50 },
    {
      field: 'code',
      title: $t('page.dataDisplay.code'),
      width: 130,
    },
    {
      field: 'name',
      minWidth: 180,
      title: $t('page.dataDisplay.name'),
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'processing',
            label: $t('page.dataDisplay.categoryOptions.electronics'),
            value: 'electronics',
          },
          {
            color: 'warning',
            label: $t('page.dataDisplay.categoryOptions.mechanics'),
            value: 'mechanics',
          },
          {
            color: 'default',
            label: $t('page.dataDisplay.categoryOptions.optical'),
            value: 'optical',
          },
          {
            color: 'success',
            label: $t('page.dataDisplay.categoryOptions.assembly'),
            value: 'assembly',
          },
        ],
      },
      field: 'category',
      title: $t('page.dataDisplay.category'),
      width: 120,
    },
    {
      field: 'line',
      title: $t('page.dataDisplay.line'),
      width: 100,
    },
    {
      field: 'planQuantity',
      title: $t('page.dataDisplay.planQuantity'),
      width: 100,
    },
    {
      field: 'completedQuantity',
      title: $t('page.dataDisplay.completedQuantity'),
      width: 100,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'default',
            label: $t('page.dataDisplay.priorityOptions.low'),
            value: 'low',
          },
          {
            color: 'processing',
            label: $t('page.dataDisplay.priorityOptions.medium'),
            value: 'medium',
          },
          {
            color: 'error',
            label: $t('page.dataDisplay.priorityOptions.high'),
            value: 'high',
          },
        ],
      },
      field: 'priority',
      title: $t('page.dataDisplay.priority'),
      width: 90,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'default',
            label: $t('page.dataDisplay.statusOptions.pending'),
            value: 0,
          },
          {
            color: 'processing',
            label: $t('page.dataDisplay.statusOptions.inProduction'),
            value: 1,
          },
          {
            color: 'success',
            label: $t('page.dataDisplay.statusOptions.completed'),
            value: 2,
          },
          {
            color: 'error',
            label: $t('page.dataDisplay.statusOptions.exception'),
            value: 3,
          },
        ],
      },
      field: 'status',
      title: $t('page.dataDisplay.status'),
      width: 110,
    },
    {
      field: 'operator',
      title: $t('page.dataDisplay.operator'),
      width: 110,
    },
    {
      field: 'createTime',
      title: $t('page.dataDisplay.createTime'),
      width: 165,
    },
    {
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('page.dataDisplay.title'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit', 'delete'],
      },
      field: 'action',
      fixed: 'right',
      title: $t('common.action'),
      width: 140,
    },
  ];
}
