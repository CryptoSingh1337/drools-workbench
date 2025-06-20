import * as XLSX from "xlsx";
import { type IWorkbookData, LocaleType } from "@univerjs/presets";
import type { IWorksheetData } from "@univerjs/presets";

type Sheet = {
  name: string;
  rows: Record<string, Row>;
  merges: string[];
};

type Row = {
  cells: Record<string, Cell>;
};

type Cell = {
  text?: string;
  merge?: [number, number];
};

type UniverCell = {
  r: number;
  c: number;
  v: {
    v: string | number | boolean;
  };
};

type UniverSheet = {
  name: string;
  cellData: UniverCell[];
  merges: string[];
};

type UniverWorkbook = {
  workbook: {
    sheets: Record<string, UniverSheet>;
    sheetOrder: string[];
  };
};

async function parse(fileData: ArrayBuffer | Buffer | string): Promise<UniverWorkbook> {
  const workbook = XLSX.read(fileData, { type: "buffer" });
  const univerWorkbook: UniverWorkbook = {
    workbook: {
      sheets: {},
      sheetOrder: [],
    },
  };
  const sheets = stox(workbook);
  sheets.forEach((sheet) => {
    const cellData: UniverCell[] = [];
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
  return univerWorkbook;
}

export async function parseToUniverWorkbookData(file: File): Promise<{
  workbook: IWorkbookData;
  merges: Record<string, string[]>;
}> {
  const buffer = await file.arrayBuffer();
  const data = await parse(buffer);
  const workbook: IWorkbookData = {
    id: "workbook-1",
    sheetOrder: data.workbook.sheetOrder,
    name: "Workbook",
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
      workbook.sheets[sheetKey].cellData[rowKey][colKey] = cell.v;
    });
  }
  return {
    workbook,
    merges,
  };
}

export function stox(wb: XLSX.WorkBook): Sheet[] {
  let out: Sheet[] = [];
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
    aoa.forEach(function (r: any, i) {
      let cells: Record<string, Cell> = {};
      r.forEach(function (c: any, j: any) {
        cells[j] = {
          text: c || String(c),
        };
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
