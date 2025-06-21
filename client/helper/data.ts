import type { IWorkbookData } from "@univerjs/presets";
import { LocaleType } from "@univerjs/presets";

export const WORKBOOK_DATA: IWorkbookData = {
  id: "workbook-1",
  sheetOrder: ["sheet-1"],
  name: "Workbook",
  appVersion: "",
  locale: LocaleType.EN_US,
  styles: {},
  sheets: {
    "sheet-1": {
      name: "Sheet1",
      id: "sheet-1",
      tabColor: "",
      hidden: 0,
      rowCount: 100,
      columnCount: 26,
      defaultColumnWidth: 73,
      defaultRowHeight: 19,
      mergeData: [],
      cellData: {
        "0": {
          "0": {
            v: 123,
          },
        },
      },
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
    },
  },
  resources: [
    {
      name: "SHEET_DEFINED_NAME_PLUGIN",
      data: "",
    },
  ],
};
