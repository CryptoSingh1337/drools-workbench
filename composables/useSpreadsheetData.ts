import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import type { IWorkbookData } from "@univerjs/presets";
import { xlsxToInternalSheets, xlsxToUniver, univerToXlsx } from "@/helper/spreadsheet";

export const useSpreadsheetData = () => {
  const importFile = async (
    file: File
  ): Promise<{
    workbook: IWorkbookData;
    merges: Record<string, string[]>;
  }> => {
    const buffer = await file.arrayBuffer();
    const univerWorkbook: IntermediateWorkbook = {
      workbook: {
        name: file.name,
        sheets: {},
        sheetOrder: [],
      },
    };
    const sheets = await xlsxToInternalSheets(buffer);
    console.log("Intermediate sheet representation", sheets);
    sheets.forEach((sheet) => {
      const cellData: IntermediateCell[] = [];
      for (let rowsKey in sheet.rows) {
        const row = sheet.rows[rowsKey];
        for (let cellsKey in row.cells) {
          const cell = row.cells[cellsKey];
          cellData.push({
            r: Number(rowsKey),
            c: Number(cellsKey),
            v: {
              v: cell.text ?? "",
            },
          });
        }
      }
      univerWorkbook.workbook.sheets[sheet.name] = {
        name: sheet.name,
        cellData: cellData,
        merges: sheet.merges,
      };
      univerWorkbook.workbook.sheetOrder.push(sheet.name);
    });
    return xlsxToUniver(univerWorkbook);
  };

  const exportFile = (univerWorkbook: IWorkbookData) => {
    const wb = univerToXlsx(univerWorkbook);
    let filename = univerWorkbook.name;
    if (filename.length == 0) {
      filename = uuidv4();
    }
    if (!univerWorkbook.name.endsWith(".xlsx")) {
      filename += ".xlsx";
    }
    console.log("file", filename);
    XLSX.writeFile(wb, filename);
  };
  return {
    importFile,
    exportFile,
  };
};
