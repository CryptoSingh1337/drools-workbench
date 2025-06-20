import * as XLSX from "xlsx";

export const useSpreadsheetData = () => {
  const readExcelFile = async (file: File): Promise<any[][]> => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    return XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    }) as any[][];
  };

  const exportToExcel = (data: any[][], filename: string = "export.xlsx") => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
  };

  const convertArrayToUniverCells = (data: any[][]) => {
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

  return {
    readExcelFile,
    exportToExcel,
    convertArrayToUniverCells,
  };
};
