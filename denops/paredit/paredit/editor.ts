import * as nav from "./navigator.ts";
import { idxToPos } from "../_util.ts";
import { ChangedResult, EditorChanges, Source } from "../_interface.ts";
import { paredit } from "../deps.ts";

// NOTE:
// `idx` is zero-based index.

const slurpMaxDepth = 10;

function insertStringAt(s: string, idx: number, c: string): string {
  return s.slice(0, idx) + c + s.slice(idx);
}

function removeStringAt(s: string, idx: number, n: number): string {
  return s.slice(0, idx) + s.slice(idx + n);
}

function applyChanges(
  src: string,
  editorChanges: EditorChanges | null,
  returnMinimizeChanges: boolean,
): ChangedResult {
  let result = src;
  let minColumn = src.length;
  let maxColumn = 0;

  let startLine = -1;
  let endLine = -1;

  if (
    editorChanges === null || editorChanges === undefined ||
    editorChanges.changes.length === 0
  ) {
    return { source: null, startLine: 0, endLine: 0 };
  }

  for (const change of editorChanges.changes) {
    if (change.length !== 3) continue;
    const [changeType, idx, arg] = change;
    if (typeof idx !== "number") continue;

    if (changeType === "insert" && typeof arg === "string") {
      result = insertStringAt(result, idx, arg);

      const newIdx = idx + arg.length - 1;
      minColumn = (minColumn < newIdx) ? minColumn : newIdx;
      maxColumn = (maxColumn > newIdx) ? maxColumn : newIdx;
    } else if (changeType === "remove" && typeof arg === "number") {
      minColumn = (minColumn < idx) ? minColumn : idx;
      maxColumn = (maxColumn > idx) ? maxColumn : idx;

      // NOTE: `remove` may also remove newlines
      const willRemoveEndLine = idxToPos(result, 0, idx + arg).line;
      if (endLine < willRemoveEndLine) {
        endLine = willRemoveEndLine;
      }

      result = removeStringAt(result, idx, arg);
    }
  }

  startLine = idxToPos(result, 0, minColumn).line;
  const maxColumnEndLine = idxToPos(result, 0, maxColumn).line;
  if (endLine < maxColumnEndLine) {
    endLine = maxColumnEndLine;
  }

  if (returnMinimizeChanges) {
    // not containing the character at minColumn
    const lastNearestNewLine = result.lastIndexOf(
      "\n",
      Math.max(0, minColumn - 1),
    );
    if (lastNearestNewLine != -1) {
      // containing the character at lastNearestNewLine
      result = result.slice(lastNearestNewLine + 1);
      maxColumn = maxColumn - (lastNearestNewLine + 1);
    }

    // containing the character at maxColumn
    const nearestNewLine = result.indexOf("\n", maxColumn);
    if (nearestNewLine != -1) {
      result = result.slice(0, nearestNewLine);
    }
  }

  return { source: result, startLine: startLine, endLine: endLine };
}

export function barfSexp(src: string, idx: number): ChangedResult {
  const ast = paredit.parse(src);
  try {
    const res = paredit.editor.barfSexp(ast, src, idx, {});
    return applyChanges(src, res, true);
  } catch (e) {
    return { source: null, startLine: 0, endLine: 0 };
  }
}

export function slurpSexp(src: string, idx: number): ChangedResult {
  const ast = paredit.parse(src);
  let currentIdx = idx;

  for (let i = 0; i < slurpMaxDepth; i++) {
    try {
      const res = paredit.editor.slurpSexp(ast, src, currentIdx, {});
      if (res !== undefined) {
        return applyChanges(src, res, true);
      }

      const [parentIdx] = nav.parentFormRange(ast, currentIdx);
      currentIdx = (currentIdx === parentIdx)
        ? Math.max(1, parentIdx - 1)
        : parentIdx;
    } catch (e) {
      break;
    }
  }

  return { source: null, startLine: 0, endLine: 0 };
}

export function deleteChar(src: string, idx: number): ChangedResult {
  const ast = paredit.parse(src);
  const res = paredit.editor.delete(ast, src, idx, {});
  return applyChanges(src, res, true);
}

// let src = `(\n)`;
// let ast = paredit.parse(src);
// const res = paredit.editor.delete(ast, src, 2, {});
// console.log(res);
//console.log(deleteChar(`(a)\n(b)\n(foo)`, 5));

export function killSexp(src: string, idx: number): ChangedResult {
  const ast = paredit.parse(src);
  const res = paredit.editor.killSexp(ast, src, idx, {});
  // const [newSrc] = applyChanges(src, res, true);
  // return newSrc;
  return applyChanges(src, res, true);
}

export function spliceSexp(src: string, idx: number): Source {
  const ast = paredit.parse(src);
  const res = paredit.editor.spliceSexp(ast, src, idx);
  const { source } = applyChanges(src, res, true);
  return source;
}

export function splitSexp(src: string, idx: number): Source {
  const ast = paredit.parse(src);
  const res = paredit.editor.splitSexp(ast, src, idx);
  const { source } = applyChanges(src, res, true);
  return source;
}

export function wrapAround(src: string, idx: number): Source {
  const ast = paredit.parse(src);
  const res = paredit.editor.wrapAround(ast, src, idx, "(", ")", {});
  const { source } = applyChanges(src, res, true);
  return source;
}

export function killSexpAfterAll(src: string, idx: number): ChangedResult {
  let currentSrc = src;
  let { line } = idxToPos(src, 0, idx);

  while (true) {
    const ast = paredit.parse(currentSrc);
    const res = paredit.editor.killSexp(ast, currentSrc, idx, {});
    if (res === null) break;

    const { source: newSrc } = applyChanges(currentSrc, res, false);

    if (newSrc === null) break;
    currentSrc = newSrc;
  }

  return {
    source: currentSrc.split("\n")[line],
    startLine: line,
    endLine: line,
  };
}