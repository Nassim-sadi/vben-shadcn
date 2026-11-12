<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { Button, Input } from '@vben-core/shadcn-ui';

import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

import { Card } from '#/components/ui/app';
import { $t } from '#/locales';

const PrintIcon = createIconifyIcon('lucide:printer');

const sn = ref('SN123456789');
const qrDataUrl = ref<string>('');
const loading = ref(false);
const barcodeSvgRef = ref<null | SVGSVGElement>(null);

async function generateQrCode() {
  if (!sn.value) {
    qrDataUrl.value = '';
    return;
  }
  loading.value = true;
  try {
    qrDataUrl.value = await QRCode.toDataURL(sn.value, {
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  } finally {
    loading.value = false;
  }
}

function generateBarcode() {
  if (!barcodeSvgRef.value || !sn.value) return;
  JsBarcode(barcodeSvgRef.value, sn.value, {
    format: 'CODE128',
    width: 3,
    height: 80,
    displayValue: true,
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 5,
    fontSize: 16,
    lineColor: '#000000',
    background: '#ffffff',
  });
}

async function generateAll() {
  await generateQrCode();
  await nextTick(() => {
    generateBarcode();
  });
}

function printLabels() {
  window.print();
}

onMounted(() => {
  generateAll();
});

watch(sn, generateAll);
</script>

<template>
  <Page :title="$t('page.demos.features.snPrint.title')">
    <Card>
      <template #header>
        <div class="flex items-center gap-2">
          <PrintIcon class="size-5" />
          <span>{{ $t('page.demos.features.snPrint.title') }}</span>
        </div>
      </template>
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 no-print">
        <Input
          v-model="sn"
          :placeholder="$t('page.demos.features.snPrint.enterSn')"
          class="w-80 sm:w-auto"
        />
        <Button @click="generateAll" :loading="loading">
          {{ $t('page.demos.features.snPrint.generate') }}
        </Button>
        <Button type="outline" @click="printLabels">
          <PrintIcon class="size-4 mr-1" />
          {{ $t('page.demos.features.snPrint.print') }}
        </Button>
      </div>
      <div
        class="mt-6 flex flex-col sm:flex-row gap-8 justify-center items-start"
        id="sn-labels"
      >
        <div
          class="flex flex-col items-center gap-4 p-6 border rounded bg-white"
        >
          <div class="text-sm font-medium">
            {{ $t('page.demos.features.snPrint.qrCode') }}
          </div>
          <div class="p-2 border" v-if="qrDataUrl">
            <img
              :src="qrDataUrl"
              :alt="$t('page.demos.features.snPrint.qrCode')"
              class="block max-w-[300px]"
            />
          </div>
          <div class="text-sm text-muted-foreground break-all">{{ sn }}</div>
        </div>
        <div
          class="flex flex-col items-center gap-4 p-6 border rounded bg-white"
        >
          <div class="text-sm font-medium">
            {{ $t('page.demos.features.snPrint.barcode') }}
          </div>
          <div class="p-2 border">
            <svg ref="barcodeSvgRef" class="block" />
          </div>
          <div class="text-sm text-muted-foreground break-all">{{ sn }}</div>
        </div>
      </div>
    </Card>
  </Page>
</template>

<style scoped>
.no-print {
  display: none !important;
}

@media print {
  .no-print {
    display: none !important;
  }

  body * {
    visibility: hidden !important;
  }

  #sn-labels,
  #sn-labels * {
    visibility: visible !important;
  }

  #sn-labels {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
  }
}
</style>
