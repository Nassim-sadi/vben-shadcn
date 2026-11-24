import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { useAccess } from '@vben/access';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'roleCode',
      label: $t('system.role.roleCode'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: $t('system.role.nameCode'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridColumns {
  const { hasAccessByCodes } = useAccess();
  return [
    {
      field: 'name',
      title: $t('system.role.roleName'),
      width: 200,
    },
    {
      field: 'roleCode',
      title: $t('system.role.roleCode'),
      width: 200,
    },

    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.role.remark'),
    },
    {
      field: 'createUserName',
      formatter: ({ cellValue, row }) =>
        cellValue || row.createUserCode || '',
      title: $t('system.role.createUser'),
      width: 140,
    },
    {
      field: 'createTime',
      title: $t('system.role.createTime'),
      width: 170,
    },
    {
      field: 'updateUserName',
      formatter: ({ cellValue, row }) =>
        cellValue || row.updateUserCode || '',
      title: $t('system.role.updateUser'),
      width: 140,
    },
    {
      field: 'updateTime',
      title: $t('system.role.updateTime'),
      width: 170,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { code: 'edit', show: () => hasAccessByCodes(['SystemRole:edit']) },
          { code: 'detail', show: () => hasAccessByCodes(['SystemRole']) },
          {
            code: 'permissions',
            text: $t('system.role.setPermissions'),
            show: () => hasAccessByCodes(['SystemRole:setPermissions']),
          },
          { code: 'delete', show: () => hasAccessByCodes(['SystemRole:delete']) },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 220,
    },
  ];
}
