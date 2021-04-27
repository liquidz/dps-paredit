import { paredit } from "../deps.ts";

function parse(srcOrObj: string | object): object {
  return (typeof srcOrObj === "string") ? paredit.parse(srcOrObj) : srcOrObj;
}

export function forwardSexp(srcOrObj: string | object, idx: number): number {
  const ast = parse(srcOrObj);
  return paredit.navigator.forwardSexp(ast, idx) + 1;
}

export function forwardDownSexp(
  srcOrObj: string | object,
  idx: number,
): number {
  const ast = parse(srcOrObj);
  return paredit.navigator.forwardDownSexp(ast, idx) + 1;
}

export function backwardSexp(srcOrObj: string | object, idx: number): number {
  const ast = parse(srcOrObj);
  return paredit.navigator.backwardSexp(ast, idx) + 1;
}

export function backwardUpSexp(srcOrObj: string | object, idx: number): number {
  const ast = parse(srcOrObj);
  return paredit.navigator.backwardUpSexp(ast, idx) + 1;
}

export function sexpRange(
  srcOrObj: string | object,
  idx: number,
): [number, number] {
  const ast = parse(srcOrObj);
  return paredit.navigator.sexpRange(ast, idx);
}

export function sexpRangeExpansion(
  srcOrObj: string | object,
  startIdx: number,
  endIdx: number,
): [number, number] {
  const ast = parse(srcOrObj);
  return paredit.navigator.sexpRangeExpansion(ast, startIdx, endIdx);
}

export function rangeForDefun(
  srcOrObj: string | object,
  idx: number,
): [number, number] {
  const ast = parse(srcOrObj);
  return paredit.navigator.rangeForDefun(ast, idx);
}

export function parentFormRange(
  srcOrObj: string | object,
  idx: number,
): [number, number] {
  const ast = parse(srcOrObj);
  const [lnum, cnum] = sexpRange(ast, idx);
  return sexpRangeExpansion(ast, lnum, cnum);
}

//
//
// export function closeList(
//   srcOrObj: string | object,
//   idx: number,
// ): [number, number] {
//   const ast = parse(srcOrObj);
//   paredit.navigator.closeList(ast, idx)
//   return paredit.navigator.sexpRange(ast, idx);
// }

// let src = `(foo (bar (baz)))`;
// let ast = paredit.parse(src);
// let [x, y] = paredit.navigator.sexpRange(ast, 8);
// console.log(paredit.navigator.sexpRangeExpansion(ast, x, y));
