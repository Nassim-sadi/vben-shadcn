import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api';

import { defaultQueryRange } from '#/utils/date-range-codec';
import { $t } from '#/locales';

/** Log search form */
export function useLogGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'menuCode',
      label: $t('system.log.menuCode'),
    },
    {
      component: 'Input',
      fieldName: 'createUserCode',
      label: $t('system.log.userCode'),
    },
    {
      component: 'RangePicker',
      defaultValue: defaultQueryRange(),
      fieldName: 'createTime',
      label: $t('system.log.createTime'),
    },
  ];
}

/** Log table columns (read-only) */
export function useLogColumns(): VxeTableGridColumns<SystemLogApi.SystemLog> {
  return [
    {
      field: 'createTime',
      title: $t('system.log.createTime'),
      width: 180,
    },
    {
      field: 'createUserName',
      minWidth: 120,
      title: $t('system.log.userName'),
    },
    {
      field: 'createUserCode',
      minWidth: 110,
      title: $t('system.log.userCode'),
    },
    {
      field: 'menuCode',
      minWidth: 110,
      title: $t('system.log.menuCode'),
    },
    {
      field: 'swStyleCode',
      minWidth: 110,
      title: $t('system.log.styleCode'),
    },
    {
      field: 'createUserIp',
      minWidth: 130,
      title: $t('system.log.ip'),
    },
    {
      field: 'logData',
      minWidth: 160,
      title: $t('system.log.data'),
    },
    {
      field: 'remark',
      minWidth: 120,
      title: $t('system.log.remark'),
    },
  ];
}
