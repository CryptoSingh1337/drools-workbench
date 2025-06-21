import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { type IWorkbookData, LocaleType } from "@univerjs/presets";
import type { IWorksheetData } from "@univerjs/presets";
import type { WorkBook, WorkSheet } from "xlsx";

export function xlsxToUniver(data: IntermediateWorkbook): {
  workbook: IWorkbookData;
  merges: Record<string, string[]>;
} {
  const workbook: IWorkbookData = {
    id: data.workbook.name,
    sheetOrder: data.workbook.sheetOrder,
    name: data.workbook.name,
    appVersion: "",
    locale: LocaleType.EN_US,
    styles: {},
    sheets: {},
    resources: [
      {
        name: "SHEET_DEFINED_NAME_PLUGIN",
        data: "",
      },
    ],
  };
  const merges: Record<string, string[]> = {};
  for (let sheetKey in data.workbook.sheets) {
    console.info("Reading", sheetKey);
    merges[sheetKey] = data.workbook.sheets[sheetKey].merges;
    workbook.sheets[sheetKey] = {
      name: sheetKey,
      id: sheetKey,
      tabColor: "",
      hidden: 0,
      rowCount: 600,
      columnCount: 26,
      defaultColumnWidth: 73,
      defaultRowHeight: 19,
      mergeData: [],
      cellData: {},
      rowData: [],
      columnData: [],
      showGridlines: 1,
      rowHeader: {
        width: 40,
        hidden: 0,
      },
      columnHeader: {
        height: 20,
        hidden: 0,
      },
      rightToLeft: 0,
    } as IWorksheetData;
    console.info("Cell data", data.workbook.sheets[sheetKey].cellData);
    data.workbook.sheets[sheetKey].cellData.forEach((cell) => {
      const rowKey = `${cell.r}`;
      const colKey = `${cell.c}`;
      if (!workbook.sheets[sheetKey].cellData[rowKey]) {
        workbook.sheets[sheetKey].cellData[rowKey] = {};
      }
      if (String(cell.v.v).startsWith("=")) {
        workbook.sheets[sheetKey].cellData[rowKey][colKey] = {
          f: cell.v.v,
        };
      } else {
        workbook.sheets[sheetKey].cellData[rowKey][colKey] = cell.v;
      }
    });
  }
  return {
    workbook,
    merges,
  };
}

export async function xlsxToInternalSheets(buffer: ArrayBuffer): Promise<Sheet[]> {
  let out: Sheet[] = [];
  const wb = XLSX.read(buffer, { type: "buffer" });
  const workbookExcelJS = new ExcelJS.Workbook();
  await workbookExcelJS.xlsx.load(buffer);
  wb.SheetNames.forEach(function (name: string) {
    let o: Sheet = {
      name: name,
      rows: {},
      merges: [],
    };
    let ws = wb.Sheets[name];
    if (!ws || !ws["!ref"]) return;
    let range = XLSX.utils.decode_range(ws["!ref"]);
    range.s = {
      r: 0,
      c: 0,
    };
    let aoa = XLSX.utils.sheet_to_json(ws, {
      raw: false,
      header: 1,
      range: range,
    });
    const sheetExcelJS = workbookExcelJS.getWorksheet(name);
    aoa.forEach(function (r: any, i) {
      let cells: Record<string, Cell> = {};
      r.forEach(function (c: any, j: any) {
        cells[j] = {
          text: c || String(c),
        };
        if (sheetExcelJS) {
          const cell = sheetExcelJS.getRow(i + 1).getCell(j + 1);
          cells[j].style = {
            font: cell.font,
            fill: cell.fill,
            border: cell.border,
            alignment: cell.alignment,
          };
        }
        let cellRef = XLSX.utils.encode_cell({
          r: i,
          c: j,
        });
        if (ws[cellRef] != null && ws[cellRef].f != null) {
          cells[j].text = "=" + ws[cellRef].f;
        }
      });
      o.rows[i] = {
        cells: cells,
      };
    });
    o.merges = [];
    (ws["!merges"] || []).forEach(function (merge: any, i: any) {
      if (o.rows[merge.s.r] == null) {
        o.rows[merge.s.r] = {
          cells: {},
        };
      }
      if (o.rows[merge.s.r].cells[merge.s.c] == null) {
        o.rows[merge.s.r].cells[merge.s.c] = {};
      }
      o.rows[merge.s.r].cells[merge.s.c].merge = [merge.e.r - merge.s.r, merge.e.c - merge.s.c];
      o.merges[i] = XLSX.utils.encode_range(merge);
    });
    out.push(o);
  });
  return out;
}

export function univerToXlsx(workbookData: IWorkbookData): XLSX.WorkBook {
  const out: WorkBook = XLSX.utils.book_new();
  const sheets = workbookData.sheets;
  Object.values(sheets).forEach((sheet) => {
    const ws: WorkSheet = {};
    let minCoord = { r: Infinity, c: Infinity };
    let maxCoord = { r: 0, c: 0 };

    const cellData = sheet.cellData || {};

    // Iterate over rows
    Object.keys(cellData).forEach((rowKey) => {
      const row = cellData[rowKey];
      const r = parseInt(rowKey);

      // Iterate over columns in that row
      Object.keys(row).forEach((colKey) => {
        const c = parseInt(colKey);
        const cell = row[colKey];

        const cellRef = XLSX.utils.encode_cell({ r, c });

        // Update bounds
        if (r < minCoord.r) minCoord.r = r;
        if (c < minCoord.c) minCoord.c = c;
        if (r > maxCoord.r) maxCoord.r = r;
        if (c > maxCoord.c) maxCoord.c = c;

        // Determine value and type
        let value = cell.v ?? cell.m ?? "";
        let type = "s";

        if (value === "") {
          type = "z";
        } else if (typeof value === "number" || !isNaN(Number(value))) {
          value = Number(value);
          type = "n";
        } else if (
          value.toString().toLowerCase() === "true" ||
          value.toString().toLowerCase() === "false"
        ) {
          value = value.toString().toLowerCase() === "true";
          type = "b";
        }

        ws[cellRef] = { v: value, t: type };

        // Formula
        if (cell.f) {
          ws[cellRef].f = cell.f;
        }
      });
    });

    // Merges
    if (sheet.mergeData) {
      ws["!merges"] = [];
      Object.values(sheet.mergeData).forEach((merge) => {
        ws["!merges"]?.push({
          s: { r: merge.startRow, c: merge.startColumn },
          e: { r: merge.endRow, c: merge.endColumn },
        });
      });
    }

    // Set sheet bounds
    if (minCoord.r <= maxCoord.r && minCoord.c <= maxCoord.c) {
      ws["!ref"] = XLSX.utils.encode_range({ s: minCoord, e: maxCoord });
    } else {
      ws["!ref"] = "A1";
    }
    XLSX.utils.book_append_sheet(out, ws, sheet.name);
  });
  return out;
}
