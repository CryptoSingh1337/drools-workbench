<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createUniver, defaultTheme, FUniver, LocaleType, merge, Univer } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/presets/preset-sheets-core";
import UniverPresetSheetsCoreEnUS from "@univerjs/presets/preset-sheets-core/locales/en-US";
import * as XLSX from "xlsx";

// Template refs
const univerContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Univer instances
let univerInstance: Univer | null = null;
let univerAPIInstance: FUniver | null = null;

// Reactive state
const currentWorkbookName = ref("New Workbook");
const statusInfo = ref("");

// Initialize Univer
onMounted(() => {
  if (!univerContainer.value) return;

  try {
    const { univer, univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge({}, UniverPresetSheetsCoreEnUS),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container: univerContainer.value,
        }),
      ],
    });

    // Create initial workbook
    univerAPI.createWorkbook({
      name: "New Workbook",
      sheets: [
        {
          name: "Sheet1",
          id: "sheet1",
        },
      ],
    });

    univerInstance = univer;
    univerAPIInstance = univerAPI;

    statusInfo.value = "Univer initialized successfully";
  } catch (error) {
    console.error("Failed to initialize Univer:", error);
    statusInfo.value = "Failed to initialize Univer";
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (univerInstance) {
    univerInstance.dispose();
    univerInstance = null;
  }
  if (univerAPIInstance) {
    univerAPIInstance.dispose();
    univerAPIInstance = null;
  }
});

// File import functionality
const triggerFileImport = () => {
  fileInput.value?.click();
};

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file || !univerAPIInstance) return;

  try {
    statusInfo.value = "Importing file...";

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON with proper formatting
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    }) as any[][];

    // Convert to Univer format
    const cellData = convertToUniverFormat(jsonData);

    // Create new workbook in Univer
    const workbookName = file.name.replace(/\.[^/.]+$/, "");

    univerAPIInstance.createWorkbook({
      name: workbookName,
      sheets: [
        {
          name: firstSheetName,
          cellData: cellData,
          rowCount: Math.max(1000, jsonData.length + 100),
          columnCount: Math.max(26, getMaxColumnCount(jsonData) + 10),
        },
      ],
    });

    currentWorkbookName.value = workbookName;
    statusInfo.value = `Imported: ${file.name}`;
  } catch (error) {
    console.error("Import error:", error);
    statusInfo.value = "Import failed";
  }

  // Clear file input
  target.value = "";
};

// Convert array data to Univer cell format
const convertToUniverFormat = (data: any[][]) => {
  const cellData: Record<number, Record<number, any>> = {};

  data.forEach((row, rowIndex) => {
    if (row.some((cell) => cell !== null && cell !== undefined && cell !== "")) {
      cellData[rowIndex] = {};
      row.forEach((cellValue, colIndex) => {
        if (cellValue !== null && cellValue !== undefined && cellValue !== "") {
          cellData[rowIndex][colIndex] = {
            v: cellValue,
            t: typeof cellValue === "number" ? "n" : "s",
          };
        }
      });
    }
  });

  return cellData;
};

// Get maximum column count from data
const getMaxColumnCount = (data: any[][]) => {
  return Math.max(...data.map((row) => row.length), 0);
};

// Export functionality
const exportToExcel = () => {
  if (!univerAPIInstance) return;

  try {
    statusInfo.value = "Exporting...";

    const activeWorkbook = univerAPIInstance.getActiveWorkbook();
    if (!activeWorkbook) return;

    const activeSheet = activeWorkbook.getActiveSheet();
    if (!activeSheet) return;

    // Get sheet data
    const sheetData = activeSheet.getSheetData();
    const cellData = sheetData.cellData || {};

    // Convert to array format
    const worksheetData = convertFromUniverFormat(cellData);

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    XLSX.utils.book_append_sheet(wb, ws, activeSheet.getName() || "Sheet1");

    // Export file
    const fileName = `${currentWorkbookName.value}.xlsx`;
    XLSX.writeFile(wb, fileName);

    statusInfo.value = `Exported: ${fileName}`;
  } catch (error) {
    console.error("Export error:", error);
    statusInfo.value = "Export failed";
  }
};

// Convert Univer cell data to array format
const convertFromUniverFormat = (cellData: Record<number, Record<number, any>>) => {
  const result: any[][] = [];
  const maxRow = Math.max(...Object.keys(cellData).map(Number), -1);

  for (let row = 0; row <= maxRow; row++) {
    const rowData: any[] = [];
    const rowCells = cellData[row] || {};
    const maxCol = Math.max(...Object.keys(rowCells).map(Number), -1);

    for (let col = 0; col <= maxCol; col++) {
      const cell = rowCells[col];
      rowData[col] = cell?.v || "";
    }

    result.push(rowData);
  }

  return result;
};

// Create new workbook
const createNewWorkbook = () => {
  if (!univerAPIInstance) return;

  univerAPIInstance.createWorkbook({
    name: "New Workbook",
    sheets: [
      {
        name: "Sheet1",
        id: `sheet_${Date.now()}`,
      },
    ],
  });

  currentWorkbookName.value = "New Workbook";
  statusInfo.value = "New workbook created";
};

// Add new sheet
const addNewSheet = () => {
  if (!univerAPIInstance) return;

  const activeWorkbook = univerAPIInstance.getActiveWorkbook();
  if (!activeWorkbook) return;

  const sheetCount = activeWorkbook.getSheets().length;
  const newSheetName = `Sheet${sheetCount + 1}`;

  activeWorkbook.insertSheet({
    name: newSheetName,
    id: `sheet_${Date.now()}`,
  });

  statusInfo.value = `Added: ${newSheetName}`;
};
</script>

<template>
  <div class="spreadsheet-app">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-section">
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          @change="handleFileImport"
          style="display: none"
        />
        <button @click="triggerFileImport" class="btn btn-primary">📁 Import</button>
        <button @click="exportToExcel" class="btn btn-success">💾 Export</button>
      </div>

      <div class="toolbar-section">
        <button @click="createNewWorkbook" class="btn btn-outline">📄 New</button>
        <button @click="addNewSheet" class="btn btn-outline">➕ Add Sheet</button>
      </div>

      <div class="toolbar-section">
        <span class="workbook-name">{{ currentWorkbookName }}</span>
      </div>
    </div>

    <!-- Univer Container -->
    <div ref="univerContainer" class="univer-container"></div>

    <!-- Status Bar -->
    <div class="status-bar">
      <span class="status-text">Ready</span>
      <span class="status-info">{{ statusInfo }}</span>
    </div>
  </div>
</template>

<style scoped></style>
