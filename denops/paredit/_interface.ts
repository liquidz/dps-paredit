export type Source = string | null;
//export type Range = [number, number];

export interface Cursor {
  line: number;
  column: number;
}

export interface LineRange {
  startLine: number;
  endLine: number;
}

export interface ChangedResult {
  source: Source;
  startLine: number;
  endLine: number;
}

// export interface Range {
//
//
// }

// c.f. https://github.com/rksm/paredit.js/blob/master/index.d.ts
export interface EditorChanges {
  changes: [string, number, string | number][];
  newIndex: number;
}
