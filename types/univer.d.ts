declare module "@univerjs/presets" {
  export interface Univer {
    dispose(): void;
  }

  export interface FUniver {
    dispose(): void;
    createWorkbook(config: any): any;
    getActiveWorkbook(): any;
    onWorkbookChange(callback: (workbook: any) => void): void;
    disposeUnit(unitId: string): boolean;
  }

  export function createUniver(config: any): {
    univer: Univer;
    univerAPI: FUniver;
  };

  export const defaultTheme: any;
  export enum LocaleType {
    EN_US = "en-US",
  }

  export function merge(...objects: any[]): any;

  export interface IWorkbookData {
    /**
     * Id of the Univer Sheet.
     */
    id: string;
    /**
     * Revision of this spreadsheet. Used in collaborated editing. Starts from one.
     * @ignore
     */
    rev?: number;
    /**
     * Name of the Univer Sheet.
     */
    name: string;
    /**
     * Version of Univer model definition.
     */
    appVersion: string;
    /**
     * Locale of the document.
     */
    locale: LocaleType;
    /**
     * Style references.
     */
    styles: Record<string, Nullable<IStyleData>>;
    /** Ids of {@link IWorksheetData}s of this Univer Sheet in sequence order. */
    sheetOrder: string[];
    /**
     * Data of each {@link IWorksheetData} in this Univer Sheet.
     */
    sheets: {
      [sheetId: string]: Partial<IWorksheetData>;
    };
    /**
     * @property {string|Nullable<IStyleData>} [defaultStyle] - Default style id or style data of Workbook.
     */
    defaultStyle?: Nullable<IStyleData> | string;
    /**
     * Resources of the Univer Sheet. It is used to store the data of other plugins.
     */
    resources?: IResources;
    /**
     * User stored custom fields
     */
    custom?: CustomData;
  }

  export interface IWorksheetData {
    /**
     * Id of the worksheet. This should be unique and immutable across the lifecycle of the worksheet.
     */
    id: string;
    /** Name of the sheet. */
    name: string;
    tabColor: string;
    /**
     * Determine whether the sheet is hidden.
     *
     * @remarks
     * See {@link BooleanNumber| the BooleanNumber enum} for more details.
     *
     * @defaultValue `BooleanNumber.FALSE`
     */
    hidden: BooleanNumber;
    rowCount: number;
    columnCount: number;
    defaultColumnWidth: number;
    defaultRowHeight: number;
    /** All merged cells in this worksheet. */
    mergeData: IRange[];
    /** A matrix storing cell contents by row and column index. */
    cellData: IObjectMatrixPrimitiveType<ICellData>;
    rowData: IObjectArrayPrimitiveType<Partial<IRowData>>;
    columnData: IObjectArrayPrimitiveType<Partial<IColumnData>>;
    /**
     * @property {string|Nullable<IStyleData>} [defaultStyle] - Default style id or style data of Worksheet.
     */
    defaultStyle?: Nullable<IStyleData> | string;
    rowHeader: {
      width: number;
      hidden?: BooleanNumber;
    };
    columnHeader: {
      height: number;
      hidden?: BooleanNumber;
    };
    showGridlines: BooleanNumber;
    /**
     * Color of the gridlines.
     */
    gridlinesColor?: string;
    rightToLeft: BooleanNumber;
    /**
     * User stored custom fields
     */
    custom?: CustomData;
  }

  interface IRangeLocation {
    /**
     * Id of the Workbook the range belongs to.
     * When this field is not defined, it should be considered as the range in the currently activated worksheet.
     */
    unitId?: string;
    /**
     * Id of the Worksheet the range belongs to.
     * When this field is not defined, it should be considered as the range in the currently activated worksheet.
     */
    sheetId?: string;
  }
  export interface IRowRange extends IRangeLocation {
    /**
     * The start row (inclusive) of the range
     * startRow
     */
    startRow: number;
    /**
     * The end row (exclusive) of the range
     * endRow
     */
    endRow: number;
  }
  export interface IColumnRange extends IRangeLocation {
    /**
     * The start column (inclusive) of the range
     * startColumn
     */
    startColumn: number;
    /**
     * The end column (exclusive) of the range
     * endColumn
     */
    endColumn: number;
  }
  /**
   * Range data structure
   *
   * One of the range types,
   *
   * e.g.,
   * {
   *    startRow:0 ,
   *    startColumn:0,
   *    endRow:1,
   *    endColumn:1,
   * }
   *
   * means "A1:B2"
   */
  export interface IRange extends IRowRange, IColumnRange {
    rangeType?: RANGE_TYPE;
    startAbsoluteRefType?: AbsoluteRefType;
    endAbsoluteRefType?: AbsoluteRefType;
  }

  export type CustomData = Nullable<Record<string, any>>;
  /**
   * Properties of row data
   */
  export interface IRowData {
    /**
     * height in pixel
     */
    h?: number;
    /**
     * is current row self-adaptive to its content, use `ah` to set row height when true, else use `h`.
     */
    ia?: BooleanNumber;
    /**
     * auto height
     */
    ah?: number;
    /**
     * hidden
     */
    hd?: BooleanNumber;
    /**
     * style id
     */
    s?: Nullable<IStyleData | string>;
    /**
     * User stored custom fields
     */
    custom?: CustomData;
  }
  export interface IRowAutoHeightInfo {
    row: number;
    autoHeight?: number;
  }
  /**
   * Properties of column data
   */
  export interface IColumnData {
    /**
     * width
     */
    w?: number;
    /**
     * hidden
     */
    hd?: BooleanNumber;
    /**
     * style id
     */
    s?: Nullable<IStyleData | string>;
    /**
     * User stored custom fields
     */
    custom?: CustomData;
  }
  export interface IColAutoWidthInfo {
    col: number;
    width?: number;
  }
  /**
   * Cell value type
   */
  export type CellValue = string | number | boolean;
  /**
   * Cell data
   */
  export interface ICellData {
    /**
     * The unique key, a random string, is used for the plug-in to associate the cell. When the cell information changes,
     * the plug-in does not need to change the data, reducing the pressure on the back-end interface id?: string.
     */
    p?: Nullable<IDocumentData>;
    /** style id */
    s?: Nullable<IStyleData | string>;
    /**
     * Origin value
     */
    v?: Nullable<CellValue>;
    t?: Nullable<CellValueType>;
    /**
     * Raw formula string. For example `=SUM(A1:B4)`.
     */
    f?: Nullable<string>;
    /**
     * If the formula is a formula array, this field is used to store the referencing range.
     * @ignore
     */
    ref?: Nullable<string>;
    /**
     * Id of the formula.
     */
    si?: Nullable<string>;
    /**
     * User stored custom fields
     */
    custom?: CustomData;
  }

  export interface ITextDecoration {
    /**
     * show
     */
    s: BooleanNumber;
    /**
     * color is follow the font color. the default value is TRUE, it's also TRUE if it is undefined. the cl has no effect when `c` is TRUE.
     */
    c?: BooleanNumber;
    /**
     * color
     */
    cl?: IColorStyle;
    /**
     * lineType
     */
    t?: TextDecoration;
  }
  /**
   * RGB color or theme color
   */
  export interface IColorStyle {
    rgb?: Nullable<string>;
    th?: ThemeColorType;
  }
  /**
   * Format of RBGA color
   */
  export interface IColor {
    r: number;
    g: number;
    b: number;
    a?: number;
  }
  /**
   * Style properties of border
   */
  export interface IBorderStyleData {
    s: BorderStyleTypes;
    cl: IColorStyle;
  }
  /**
   * Style properties of top, bottom, left and right border
   *
   * TLBR = 'tlbr', //START_TOP_LEFT_END_BOTTOM_RIGHT
   * TLBC = 'tlbc', // START_TOP_LEFT_END_BOTTOM_CENTER

   * TLMR = 'tlmr', // START_TOP_LEFT_END_MIDDLE_RIGHT

   * BLTR = 'bltr', // START_BOTTOM_LEFT_END_TOP_RIGHT

   * MLTR = 'mltr', // START_MIDDLE_LEFT_END_TOP_RIGHT

   * BCTR = 'bctr', // START_BOTTOM_CENTER_END_TOP_RIGHT
   */
  export interface IBorderData {
    t?: Nullable<IBorderStyleData>;
    r?: Nullable<IBorderStyleData>;
    b?: Nullable<IBorderStyleData>;
    l?: Nullable<IBorderStyleData>;
    tl_br?: Nullable<IBorderStyleData>;
    tl_bc?: Nullable<IBorderStyleData>;
    tl_mr?: Nullable<IBorderStyleData>;
    bl_tr?: Nullable<IBorderStyleData>;
    ml_tr?: Nullable<IBorderStyleData>;
    bc_tr?: Nullable<IBorderStyleData>;
  }
  export interface ITextRotation {
    /**
     * angle
     */
    a: number;
    /**
     * vertical
     * true : 1
     * false : 0
     */
    v?: BooleanNumber;
  }
  /**
   * Top,right,bottom,left padding
   */
  export interface IPaddingData {
    t?: number;
    r?: number;
    b?: number;
    l?: number;
  }
  /**
   * Basics properties of cell style
   */
  export interface IStyleBase {
    /**
     * fontFamily
     */
    ff?: Nullable<string>;
    /**
     * fontSize
     *
     * pt
     */
    fs?: number;
    /**
     * italic
     * 0: false
     * 1: true
     */
    it?: BooleanNumber;
    /**
     * bold
     * 0: false
     * 1: true
     */
    bl?: BooleanNumber;
    /**
     * underline
     */
    ul?: ITextDecoration;
    /**
     * bottomBorerLine
     */
    bbl?: ITextDecoration;
    /**
     * strikethrough
     */
    st?: ITextDecoration;
    /**
     * overline
     */
    ol?: ITextDecoration;
    /**
     * background
     */
    bg?: Nullable<IColorStyle>;
    /**
     * border
     */
    bd?: Nullable<IBorderData>;
    /**
     * foreground
     */
    cl?: Nullable<IColorStyle>;
    /**
     * (Subscript 下标 /Superscript上标 Text)
     */
    va?: Nullable<BaselineOffset>;
    /**
     * Numfmt pattern
     */
    n?: Nullable<{
      pattern: string;
    }>;
  }
  /**
   * Properties of cell style
   */
  export interface IStyleData extends IStyleBase {
    /**
     * textRotation
     */
    tr?: Nullable<ITextRotation>;
    /**
     * textDirection @TODO
     * @description The `td` property has not been fully implemented yet.
     */
    td?: Nullable<TextDirection>;
    /**
     * horizontalAlignment
     */
    ht?: Nullable<HorizontalAlign>;
    /**
     * verticalAlignment
     */
    vt?: Nullable<VerticalAlign>;
    /**
     * wrapStrategy
     */
    tb?: Nullable<WrapStrategy>;
    /**
     * padding
     */
    pd?: Nullable<IPaddingData>;
  }

  export declare class Workbook extends UnitModel<IWorkbookData, UniverInstanceType.UNIVER_SHEET> {
    private readonly _logService;
    type: UniverInstanceType.UNIVER_SHEET;
    private readonly _sheetCreated$;
    readonly sheetCreated$: Observable<Worksheet>;
    private readonly _sheetDisposed$;
    readonly sheetDisposed$: Observable<Worksheet>;
    private readonly _activeSheet$;
    private get _activeSheet();
    readonly activeSheet$: Observable<Nullable<Worksheet>>;
    /**
     * sheets list
     * @private
     */
    private _worksheets;
    /**
     * Common style
     * @private
     */
    private _styles;
    /**
     * number format
     * @private
     */
    private _snapshot;
    private _unitId;
    private _count;
    private readonly _name$;
    readonly name$: Observable<string>;
    get name(): string;
    static isIRangeType(range: IRangeType | IRangeType[]): boolean;
    constructor(workbookData: Partial<IWorkbookData> | undefined, _logService: ILogService);
    dispose(): void;
    /**
     * Create a clone of the current snapshot.
     * Call resourceLoaderService.saveWorkbook to save the data associated with the current plugin if needed.
     * @memberof Workbook
     */
    save(): IWorkbookData;
    /**
     * Get current snapshot reference.
     * Call resourceLoaderService.saveWorkbook to save the data associated with the current plugin if needed.
     * @return {*}  {IWorkbookData}
     * @memberof Workbook
     */
    getSnapshot(): IWorkbookData;
    /** @deprecated use use name property instead */
    getName(): string;
    setName(name: string): void;
    getUnitId(): string;
    getId(): string;
    getRev(): number;
    incrementRev(): void;
    setRev(rev: number): void;
    /**
     * Add a Worksheet into Workbook.
     */
    addWorksheet(id: string, index: number, worksheetSnapshot: Partial<IWorksheetData>): boolean;
    getSheetOrders(): Readonly<string[]>;
    getWorksheets(): Map<string, Worksheet>;
    getActiveSpreadsheet(): Workbook;
    getStyles(): Styles;
    getConfig(): IWorkbookData;
    getIndexBySheetId(sheetId: string): number;
    /**
     * Get the active sheet.
     */
    getActiveSheet(): Worksheet;
    getActiveSheet(allowNull: true): Nullable<Worksheet>;
    /**
     * If there is no active sheet, the first sheet would
     * be set active.
     * @returns
     */
    ensureActiveSheet(): Worksheet;
    /**
     * ActiveSheet should not be null!
     * There is at least one sheet in a workbook. You can not delete all sheets in a workbook.
     * @param worksheet
     */
    setActiveSheet(worksheet: Worksheet): void;
    removeSheet(sheetId: string): boolean;
    getActiveSheetIndex(): number;
    getSheetSize(): number;
    getSheets(): Worksheet[];
    getSheetsName(): string[];
    getSheetIndex(sheet: Worksheet): number;
    getSheetBySheetName(name: string): Nullable<Worksheet>;
    getSheetBySheetId(sheetId: string): Nullable<Worksheet>;
    getSheetByIndex(index: number): Nullable<Worksheet>;
    getHiddenWorksheets(): string[];
    getUnhiddenWorksheets(): string[];
    load(config: IWorkbookData): void;
    /**
     * Check if sheet name is unique
     * @param name sheet name
     * @returns True if sheet name is unique
     */
    checkSheetName(name: string): boolean;
    /**
     *  Check whether the sheet name is unique and generate a new unique sheet name
     * @param name sheet name
     * @returns Unique sheet name
     */
    uniqueSheetName(name?: string): string;
    /**
     * Automatically generate new sheet name
     * @param name sheet name
     * @returns New sheet name
     */
    generateNewSheetName(name: string): string;
    /**
     * Get Default Sheet
     */
    private _parseWorksheetSnapshots;
    /**
     * Get custom metadata of workbook
     * @returns {CustomData | undefined} custom metadata
     */
    getCustomMetadata(): CustomData | undefined;
    /**
     * Set custom metadata of workbook
     * @param {CustomData | undefined} custom custom metadata
     */
    setCustomMetadata(custom: CustomData | undefined): void;
  }
}

declare module "@univerjs/presets/preset-sheets-core" {
  export function UniverSheetsCorePreset(config: any): any;
}

declare module "@univerjs/presets/preset-sheets-core/locales/en-US" {
  const locale: any;
  export default locale;
}
