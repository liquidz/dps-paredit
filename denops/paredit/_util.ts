import { Cursor } from "./_interface.ts";

export function idxToPos(
  src: string,
  baseLnum: number,
  idx: number,
): Cursor {
  const arr = src.substring(0, idx).split("\n");
  return {
    line: baseLnum + arr.length - 1,
    column: arr[arr.length - 1].length,
  };
}
