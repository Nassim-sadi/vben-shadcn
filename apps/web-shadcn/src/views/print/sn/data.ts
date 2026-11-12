import type { VxeTableGridColumns } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export interface SnRecord {
  EAN: string;
  id: string;
  model: string;
  sn: string;
  snshow: string;
}

export function useColumns(): VxeTableGridColumns<SnRecord> {
  return [
    {
      field: 'sn',
      minWidth: 130,
      sortable: true,
      title: $t('page.print.sn.sn'),
    },
    {
      field: 'snshow',
      minWidth: 130,
      title: $t('page.print.sn.snshow'),
    },
    {
      field: 'model',
      minWidth: 120,
      sortable: true,
      title: $t('page.print.sn.model'),
    },
    {
      field: 'EAN',
      minWidth: 150,
      title: $t('page.print.sn.ean'),
    },
  ];
}

/** Mock SN list with PrintOrdersnInfo fields, replace with a real API call later */
export const SN_LIST: SnRecord[] = Array.from({ length: 12 }, (_, i) => ({
  EAN: `69012345678${String(i).padStart(2, '0')}`,
  id: String(i + 1),
  model: i < 6 ? 'MODEL-X1' : 'MODEL-X2',
  sn: `SN-${String(i + 1).padStart(6, '0')}`,
  snshow: `SN-${String(i + 1).padStart(6, '0')}`,
}));
