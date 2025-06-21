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
  style?: any;
  merge?: [number, number];
};

type IntermediateCell = {
  r: number;
  c: number;
  v: {
    v: string | number | boolean;
  };
  style?: any;
};

type IntermediateSheet = {
  name: string;
  cellData: IntermediateCell[];
  merges: string[];
};

type IntermediateWorkbook = {
  workbook: {
    name: string;
    sheets: Record<string, IntermediateSheet>;
    sheetOrder: string[];
  };
};
