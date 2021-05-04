import { denops } from "./deps.ts";
import { Cursor, LineRange, Source } from "./_interface.ts";

export async function getLines(
  vim: denops.Vim,
  start: number, // 0-based
  end: number | string, // 0-based
): Promise<Array<string>> {
  const lines = await vim.call(
    "getline",
    start + 1,
    (typeof end === "number") ? end + 1 : end,
  );
  if (!Array.isArray(lines)) {
    throw new Error(`The lines must be an Array.`);
  }
  return Promise.resolve(lines);
}

export async function setLines(
  vim: denops.Vim,
  startLineNum: number, // 0-based
  text: Source,
): Promise<unknown> {
  if (text === null) {
    return Promise.resolve(true);
  }
  return vim.call("setline", startLineNum + 1, text.split("\n"));
}

export async function replaceLines(
  vim: denops.Vim,
  range: LineRange,
  text: Source,
): Promise<unknown> {
  if (text === null) {
    return Promise.resolve(true);
  }
  const texts = text.split("\n");
  // const lineCount = text.split("\n").length;
  // const xCount = range.endLine - range.startLine + 1;

  if (texts.length === (range.endLine - range.startLine + 1)) {
    return setLines(vim, range.startLine, text);
  } else {
    await vim.execute(`:${range.startLine + 1},${range.endLine + 1}delete`);
    vim.call("append", range.startLine, texts);
  }
}

export function parsePos(pos: unknown): Cursor {
  if (!Array.isArray(pos)) {
    throw new Error(`The pos must be an Array`);
  }
  const [, lnum, col] = pos;
  if (typeof lnum !== "number" || typeof col !== "number") {
    throw new Error(`The lnum and col must be a number`);
  }
  // lnum and cnum is 1-based index, so convert to 0-based index
  return { line: lnum - 1, column: col - 1 };
}

export async function moveCursor(
  vim: denops.Vim,
  cursor: Cursor, // 0-based
): Promise<unknown> {
  return vim.call("cursor", cursor.line + 1, cursor.column + 1);
}

export async function selectByCursor(
  vim: denops.Vim,
  from: Cursor, // 0-based
  to: Cursor, // 0-based
): Promise<unknown> {
  await moveCursor(vim, from);
  await vim.execute("normal! v");
  return moveCursor(vim, {
    line: to.line,
    column: to.column - 1,
  });
}
