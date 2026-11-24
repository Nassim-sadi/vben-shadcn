<script setup lang="ts">
import type { SnRecord } from './data';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, nextTick, ref, watch } from 'vue';
import { toast } from 'vue-sonner';

import { Page } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { Button } from '@vben-core/shadcn-ui';

import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { Card, ResetColumnWidthButton, SelectField } from '#/components/ui/app';
import { $t } from '#/locales';

import { SN_LIST, useColumns } from './data';

const PrintIcon = createIconifyIcon('lucide:printer');

const SVG_NS = 'http://www.w3.org/2000/svg';

type LabelType = 'barcode' | 'both' | 'qr';

const BARCODE_OPTIONS = {
  background: '#ffffff',
  displayValue: false,
  format: 'CODE128',
  height: 48,
  lineColor: '#000000',
  margin: 0,
  width: 2,
} as const;

const typeOptions = computed(() => [
  { label: $t('page.print.sn.both'), value: 'both' },
  { label: $t('page.print.sn.barcode'), value: 'barcode' },
  { label: $t('page.print.sn.qrCode'), value: 'qr' },
]);

const current = ref<SnRecord>();
const labelType = ref<LabelType>('both');
const previewBarcodeRef = ref<null | SVGSVGElement>(null);
const previewQrUrl = ref('');

const columnsFactory = () => useColumns();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: [
      {
        component: 'Input',
        fieldName: 'sn',
        label: $t('page.print.sn.sn'),
      },
      {
        component: 'Input',
        fieldName: 'model',
        label: $t('page.print.sn.model'),
      },
      {
        component: 'Input',
        fieldName: 'EAN',
        label: $t('page.print.sn.ean'),
      },
    ] as VbenFormSchema[],
    submitOnChange: true,
  },
  gridEvents: {
    cellClick: (params: { row: SnRecord }) => {
      onPreview(params.row);
    },
    ready: () => {
      const first = SN_LIST[0];
      if (!first || current.value) return;
      gridApi.grid?.setCurrentRow(first);
      onPreview(first);
    },
  },
  gridOptions: {
    columns: columnsFactory(),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          const keyword = ((formValues?.sn as string) ?? '').toLowerCase();
          const model = ((formValues?.model as string) ?? '').toLowerCase();
          const ean = ((formValues?.EAN as string) ?? '').toLowerCase();
          const filtered = SN_LIST.filter((item) => {
            const matchSn = !keyword || item.sn.toLowerCase().includes(keyword);
            const matchModel =
              !model || item.model.toLowerCase().includes(model);
            const matchEan = !ean || item.EAN.toLowerCase().includes(ean);
            return matchSn && matchModel && matchEan;
          });
          return {
            items: filtered.slice(
              (page.currentPage - 1) * page.pageSize,
              page.currentPage * page.pageSize,
            ),
            total: filtered.length,
          };
        },
      },
    },
    rowConfig: {
      isCurrent: true,
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: false,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SnRecord>,
});

function renderPreviewBarcode() {
  if (labelType.value === 'qr') return;
  nextTick(() => {
    if (previewBarcodeRef.value && current.value) {
      JsBarcode(previewBarcodeRef.value, current.value.sn, BARCODE_OPTIONS);
    }
  });
}

async function onPreview(row: SnRecord) {
  current.value = row;
  previewQrUrl.value = await QRCode.toDataURL(row.sn, {
    color: { dark: '#000000', light: '#ffffff' },
    margin: 2,
    type: 'image/png',
    width: 160,
  });
  renderPreviewBarcode();
}

watch(labelType, renderPreviewBarcode);

/**
 * Serializes the CODE128 barcode of an SN into an SVG string.
 * @param sn Serial number to encode
 */
function buildBarcodeSvg(sn: string): string {
  const svg = document.createElementNS(SVG_NS, 'svg');
  JsBarcode(svg as unknown as SVGSVGElement, sn, BARCODE_OPTIONS);
  svg.setAttribute('xmlns', SVG_NS);
  return new XMLSerializer().serializeToString(svg);
}

/**
 * Builds the full label document for the hidden print iframe.
 * @param row Selected SN record
 */
async function buildLabelHtml(row: SnRecord): Promise<string> {
  const type = labelType.value;
  const qr =
    type === 'barcode'
      ? ''
      : await QRCode.toDataURL(row.sn, {
          color: { dark: '#000000', light: '#ffffff' },
          margin: 1,
          type: 'image/png',
          width: 200,
        });
  const barcode = type === 'qr' ? '' : buildBarcodeSvg(row.sn);

  let codeRow: string;
  if (type === 'both') {
    codeRow = `${barcode}<img class="qr" src="${qr}" alt="${row.sn}" />`;
  } else if (type === 'barcode') {
    codeRow = barcode;
  } else {
    codeRow = `<img class="qr" src="${qr}" alt="${row.sn}" />`;
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <title>${row.sn}</title>
    <style>
      @page { size: 60mm 40mm; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 3mm; font-family: Arial, sans-serif; text-align: center; }
      .label { width: 54mm; height: 34mm; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .model { font-weight: bold; font-size: 8pt; }
      .m-barcode svg { width: 46mm; height: auto; }
      .m-both svg { width: 40mm; height: auto; margin-bottom: 0.5mm; }
      .m-both .qr { width: 12mm; height: 12mm; margin-top: 0.5mm; }
      .m-qr .qr { width: 22mm; height: 22mm; }
      .sn { font-family: monospace; font-weight: bold; font-size: 10pt; margin-top: 1mm; }
      .sn + .qr, .qr + .sn { margin-top: 0.5mm; }
      .ean { font-size: 7pt; }
    </style>
  </head>
  <body>
    <div class="label m-${type}">
      <div class="model">${row.model}</div>
      ${codeRow}
      <div class="sn">${row.snshow}</div>
      <div class="ean">${row.EAN}</div>
    </div>
  </body>
</html>`;
}

/**
 * Prints the selected SN label via a hidden iframe, so only the label
 * content is printed and no popup window flashes or gets blocked.
 */
async function onPrint() {
  const row = current.value;
  if (!row) {
    toast.warning($t('page.print.sn.noSelection'));
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.append(iframe);

  iframe.addEventListener('load', () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
    setTimeout(() => {
      iframe.remove();
    }, 1000);
  });

  iframe.srcdoc = await buildLabelHtml(row);
}
</script>

<template>
  <Page auto-content-height>
    <div class="flex size-full gap-4">
      <div class="w-2/3 min-w-0">
        <Grid :table-title="$t('page.print.sn.title')">
          <template #toolbar-tools>
            <ResetColumnWidthButton
              :columns-factory="columnsFactory"
              :grid-api="gridApi"
            />
          </template>
        </Grid>
      </div>

      <Card class="w-1/3 overflow-auto">
        <template #header>
          <div class="flex items-center gap-2">
            <PrintIcon class="size-5" />
            <span>{{ $t('page.print.sn.preview') }}</span>
          </div>
        </template>

        <div class="mb-3 flex items-center gap-2">
          <SelectField
            v-model="labelType"
            :options="typeOptions"
            class="flex-1"
          />
          <Button size="sm" @click="onPrint">
            <PrintIcon class="mr-1 size-4" />
            {{ $t('page.print.sn.print') }}
          </Button>
        </div>

        <div
          v-if="current"
          class="flex flex-col items-center gap-2 border rounded bg-white p-4"
        >
          <strong>{{ current.model }}</strong>

          <svg
            v-if="labelType !== 'qr'"
            ref="previewBarcodeRef"
            class="w-full"
          />
          <strong v-if="labelType !== 'qr'" class="font-mono tracking-widest">
            {{ current.snshow }}
          </strong>

          <img
            v-if="labelType !== 'barcode' && previewQrUrl"
            :src="previewQrUrl"
            :alt="current.sn"
            class="size-32"
          />

          <span class="text-muted-foreground text-xs">
            {{ current.EAN }}
          </span>
        </div>
        <div v-else class="text-muted-foreground py-8 text-center text-sm">
          {{ $t('page.print.sn.selectHint') }}
        </div>
      </Card>
    </div>
  </Page>
</template>

<style scoped>
:deep(.vxe-body--row.row--current) {
  background-color: hsl(var(--primary) / 10%) !important;
}
</style>
