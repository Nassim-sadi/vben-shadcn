import type { DescriptionsItemType } from '@vben/common-ui';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { h } from 'vue';

import { useDictStore } from '@vben/stores';

import { getDeptList } from '#/api';
import { Tag } from '#/components/ui/app';
import { $t } from '#/locales';

const USER_GENDER_CODE = 'user_gender';

export function useFormSchema(): VbenFormSchema[] {
  const dictStore = useDictStore();
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.user.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'userCode',
      label: $t('system.user.userCode'),
      rules: 'required',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getDeptList,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'deptId',
      label: $t('system.user.dept'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 100,
      },
      fieldName: 'mobile',
      label: $t('system.user.mobile'),
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 20,
      },
      fieldName: 'photoPath',
      label: $t('system.user.photoPath'),
    },
    {
      component: 'RadioGroup',
      componentProps: () => ({
        buttonStyle: 'solid',
        options: dictStore.getDictSync(USER_GENDER_CODE),
        optionType: 'button',
      }),
      fieldName: 'gender',
      label: $t('system.user.gender'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.user.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.user.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const dictStore = useDictStore();
  return [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: $t('system.user.nameCode'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        allowClear: true,
        api: () => dictStore.getDict(USER_GENDER_CODE),
        class: 'w-full',
      },
      fieldName: 'gender',
      label: $t('system.user.gender'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('system.user.state'),
    },
  ];
}

/**
 * User details description list item
 * @param row User data
 */
export function useDescriptionItems(row?: SystemUserApi.SystemUser): DescriptionsItemType[] {
  const dictStore = useDictStore();
  const enabled = row?.status === 1;
  return [
    { label: $t('system.user.name'), content: row?.name },
    { label: $t('system.user.userCode'), content: row?.userCode },
    { label: $t('system.user.id'), content: row?.id },
    {
      label: $t('system.user.deptName'),
      content: row?.deptName || row?.deptId,
    },
    { label: $t('system.role.roleName'), content: row?.roleName || row?.roleCode },
    { label: $t('system.user.mobile'), content: row?.mobile },
    { label: $t('system.user.photoPath'), content: row?.photoPath },
    {
      label: $t('system.user.gender'),
      content:
        row?.genderName ||
        dictStore.getDictLabel(USER_GENDER_CODE, row?.gender) ||
        '',
    },
    {
      label: $t('system.user.state'),
      content: () =>
        h(
          Tag,
          {
            color: enabled ? 'success' : 'error',
          },
          {
            default: () => (enabled ? $t('common.enabled') : $t('common.disabled')),
          },
        ),
    },
    { label: $t('system.user.createUser'), content: row?.createUserName },
    { label: $t('system.user.createTime'), content: row?.createTime },
    { label: $t('system.user.updateUser'), content: row?.updateUserName },
    { label: $t('system.user.updateTime'), content: row?.updateDate },
    { label: $t('system.user.remark'), content: row?.remark },
  ];
}

export function useColumns(
  onStatusChange?: (
    newStatus: any,
    row: SystemUserApi.SystemUser,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns {
  return [
    {
      field: 'userCode',
      title: $t('system.user.userCode'),
      width: 180,
      sortable: true,
    },
    {
      field: 'name',
      title: $t('system.user.name'),
      width: 180,
      sortable: true,
    },
    {
      field: 'deptName',
      title: $t('system.user.deptName'),
      width: 180,
    },
    {
      field: 'roleName',
      title: $t('system.role.roleName'),
      width: 160,
    },
    {
      field: 'roleCode',
      title: $t('system.role.roleCode'),
      width: 160,
      sortable: true,
    },
    {
      field: 'mobile',
      title: $t('system.user.mobile'),
      width: 140,
    },
    {
      cellRender: {
        name: 'CellDict',
        props: { code: USER_GENDER_CODE },
      },
      field: 'gender',
      title: $t('system.user.gender'),
      width: 100,
      sortable: true,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.user.state'),
      width: 100,
      sortable: true,
    },
    {
      field: 'photoPath',
      title: $t('system.user.photoPath'),
      width: 160,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.user.remark'),
      sortable: true,
    },
    {
      field: 'createUserName',
      title: $t('system.user.createUser'),
      width: 140,
    },
    {
      field: 'createTime',
      title: $t('system.user.createTime'),
      width: 180,
      sortable: true,
    },
    {
      field: 'updateUserName',
      title: $t('system.user.updateUser'),
      width: 140,
    },
    {
      field: 'updateDate',
      title: $t('system.user.updateTime'),
      width: 180,
      sortable: true,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'action' },
      title: $t('system.user.operation'),
      width: 180,
    },
  ];
}
