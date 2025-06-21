<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { v4 as uuidv4 } from "uuid";

import { createUniver, defaultTheme, LocaleType, merge } from "@univerjs/presets";
import type { FUniver, Univer } from "@univerjs/presets";
import type { Workbook } from "@univerjs/presets";

import { UniverSheetsCorePreset } from "@univerjs/presets/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/presets/preset-sheets-core/locales/en-US";
import "@univerjs/presets/lib/styles/preset-sheets-core.css";

import { UniverSheetsFilterPreset } from "@univerjs/presets/preset-sheets-filter";
import sheetsFilterEnUS from "@univerjs/presets/preset-sheets-filter/locales/en-US";
import "@univerjs/presets/lib/styles/preset-sheets-filter.css";

import { UniverSheetsHyperLinkPreset } from "@univerjs/presets/preset-sheets-hyper-link";
import sheetsHyperLinkEnUS from "@univerjs/presets/preset-sheets-hyper-link/locales/en-US";
import "@univerjs/presets/lib/styles/preset-sheets-hyper-link.css";

const container = ref<HTMLElement | null>(null);
const filename = ref<string>("");

let univerInstance: Univer | null = null;
let univerAPIInstance: FUniver | null = null;

const { importFile, exportFile } = useSpreadsheetData();

onMounted(() => {
  const start = performance.now()
  const { univer, univerAPI } = createUniver({
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: merge(
        {},
        UniverPresetSheetsCoreEnUS,
        sheetsFilterEnUS,
        sheetsHyperLinkEnUS
      ),
    },
    theme: defaultTheme,
    presets: [
      UniverSheetsCorePreset({
        container: container.value as HTMLElement,
      }),
      UniverSheetsFilterPreset(),
      UniverSheetsHyperLinkPreset(),
    ],
  });
  console.info("Initialized univer successfully!");
  univerAPI.createWorkbook();
  univerInstance = univer;
  univerAPIInstance = univerAPI;
  const activeWorkbook = univerAPI.getActiveWorkbook();
  filename.value = activeWorkbook.name || uuidv4();
  console.info("Workbook created successfully");
  console.debug(`Time taken for univer initialization: ${performance.now() - start} ms`)
});

onBeforeUnmount(() => {
  univerInstance?.dispose();
  univerAPIInstance?.dispose();
  univerInstance = null;
  univerAPIInstance = null;
});

async function handleFileChange(event: Event) {
  const start = performance.now()
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    console.info("Selected file:", file.name);
    const { workbook, merges } = await importFile(file);
    const wb = univerAPIInstance?.getActiveWorkbook() as Workbook;
    const unitId = wb.getId();
    if (unitId) {
      if (univerAPIInstance?.disposeUnit(unitId)) {
        const fWorkbook = univerAPIInstance.createWorkbook(workbook);
        filename.value = fWorkbook.id;
        for (let sheetKey in merges) {
          const fWorksheet = fWorkbook.getSheetBySheetId(sheetKey);
          const ranges = merges[sheetKey];
          ranges.forEach((range) => {
            const fRange = fWorksheet.getRange(range);
            fRange.merge();
          });
        }
      }
    }
    console.info(`Successfully imported: ${file.name}`)
  }
  console.debug(`Time taken to load: ${performance.now() - start} ms`)
}

function handleExport() {
  const start = performance.now()
  if (univerAPIInstance) {
    const activeWorkbook = univerAPIInstance.getActiveWorkbook();
    exportFile(activeWorkbook.save());
  }
  console.debug(`Time taken to export: ${performance.now() - start} ms`)
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <div class="grid h-12 grid-cols-12 gap-2 p-2">
      <div class="col-span-10 flex items-center">
        <UIcon name="file-icons:microsoft-excel" class="mr-4" size="25" />
        <span>{{ filename }}</span>
      </div>
      <label
        for="file-upload"
        class="placeholder:text-dimmed text-highlighted bg-elevated ring-accented focus-visible:ring-primary w-full gap-1.5 rounded-md border-0 px-2.5 py-1.5 text-sm ring transition-colors ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-75"
      >
        Import
      </label>
      <input
        type="file"
        id="file-upload"
        accept=".xlsx"
        class="hidden"
        @change="handleFileChange"
      />
      <UButton @click="handleExport">Export</UButton>
    </div>
    <div ref="container" class="spreadsheet-container"></div>
  </div>
</template>

<style scoped>
.spreadsheet-container {
  height: calc(100vh - 48px);
}
</style>
