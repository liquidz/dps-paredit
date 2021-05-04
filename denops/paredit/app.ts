import * as paredit from "./paredit.ts";
import { idxToPos } from "./_util.ts";
import {
  getLines,
  moveCursor,
  parsePos,
  replaceLines,
  setLines,
} from "./vim.ts";
import { Cursor, LineRange } from "./_interface.ts";
import { denops } from "./deps.ts";

// ========================================================
// NOTE:
// lnum and cnum are converted to 0-based index by ./vim.ts
// ========================================================

async function getAroundSrcAndIdx(
  vim: denops.Vim,
  start: Cursor,
  offset: number,
  end?: Cursor,
): Promise<[string, number, number, LineRange]> {
  const { line: fromLine, column: fromColumn } = start;
  const { line: toLine, column: toColumn } = (end === undefined) ? start : end;

  const startLine = Math.max(0, fromLine - offset);
  const endLine = toLine + offset;
  const lines = await getLines(vim, fromLine, toLine + offset);

  let src = lines.join("\n");
  let idx = fromColumn;
  // WARN: In linewise visual mode, toColumn seems to be too large number (e.g. 2147483649)
  let endIdx = Math.min(lines[toLine - 1].length - 1, toColumn);

  if (toLine !== fromLine) {
    const srcBeforeEndCursor =
      lines.slice(0, Math.min(lines.length - 1, toLine - fromLine)).join("\n") +
      "\n";
    endIdx += srcBeforeEndCursor.length;
  }

  if (startLine !== fromLine) {
    const exLines = await getLines(vim, startLine, fromLine - 1);
    const exSrc = exLines.join("\n") + "\n";
    src = exSrc + src;
    idx += exSrc.length;
    endIdx += exSrc.length;
  }

  return [src, idx, endIdx, { startLine: startLine, endLine: endLine }];
}

async function visualRange(vim: denops.Vim): Promise<[Cursor, Cursor]> {
  const start = parsePos(
    await vim.call("getpos", "'<"),
  );
  const end = parsePos(
    await vim.call("getpos", "'>"),
  );
  return Promise.resolve([start, end]);
}

denops.main(async ({ vim }) => {
  vim.register({
    async forwardSexp(pos: unknown): Promise<unknown> {
      const { line, column } = parsePos(pos);
      // NOTE: forwardSexp handles only current line
      const lines = await getLines(vim, line, line);
      const nextCursor = {
        line: line,
        column: paredit.forwardSexp(lines.join("\n"), column),
      };
      return moveCursor(vim, nextCursor);
    },

    // async backwardSexp(pos: unknown): Promise<unknown> {
    //   const [lnum, cnum] = util_vim.parsePos(pos);
    //   const lines = await util_vim.getLines(vim, lnum, lnum);
    //   const next_cnum = paredit.backwardSexp(lines.join("\n"), cnum);
    //   return vim.call("cursor", lnum, next_cnum);
    // },

    async sexpRange(pos: unknown): Promise<unknown> {
      const cursor = parsePos(pos);
      const [src, idx, , rng] = await getAroundSrcAndIdx(vim, cursor, 100);
      const { startLine: baseLine } = rng;
      const [start, end] = paredit.sexpRange(src, idx);

      const startCursor = idxToPos(src, baseLine, start);
      const endCursor = idxToPos(src, baseLine, end);

      await moveCursor(vim, startCursor);
      await vim.execute("normal! v");
      return moveCursor(vim, {
        line: endCursor.line,
        column: endCursor.column - 1,
      });
    },

    // async sexpRangeExpansion(pos: unknown): Promise<unknown> {
    //   const [[startLnum, startCnum], [endLnum, endCnum]] = await visualRange(
    //     vim,
    //   );
    //   // const [startLnum, startCnum] = util_vim.parsePos(
    //   //   await vim.call("getpos", "'<"),
    //   // );
    //   // const [endLnum, endCnum] = util_vim.parsePos(
    //   //   await vim.call("getpos", "'>"),
    //   // );
    //
    //   const [src, startIdx, [baseLine]] = await getAroundSrcAndIdx(
    //     vim,
    //     [startLnum, startCnum],
    //     (endLnum - startLnum) + 100,
    //   );
    //   return Promise.resolve(true);
    // },

    async barfSexp(pos: unknown): Promise<unknown> {
      const cursor = parsePos(pos);
      const [src, idx, , rng] = await getAroundSrcAndIdx(vim, cursor, 100);
      const { startLine: baseLine } = rng;
      const { source, startLine } = paredit.barfSexp(src, idx);
      return setLines(vim, baseLine + startLine, source);
    },

    async slurpSexp(pos: unknown): Promise<unknown> {
      const cursor = parsePos(pos);
      const [src, idx, , rng] = await getAroundSrcAndIdx(vim, cursor, 100);
      const { startLine: baseLine } = rng;

      const { source, startLine } = paredit.slurpSexp(src, idx);
      return setLines(vim, baseLine + startLine, source);
    },

    async delete(pos: unknown): Promise<unknown> {
      const cursor = parsePos(pos);
      const [src, idx, , rng] = await getAroundSrcAndIdx(vim, cursor, 100);
      const { startLine: baseLine } = rng;
      const { source, startLine, endLine } = paredit.deleteChar(src, idx);

      if (source === null) {
        const nextCursor = { line: cursor.line, column: cursor.column + 1 };
        return moveCursor(vim, nextCursor);
      }
      return replaceLines(vim, {
        startLine: baseLine + startLine,
        endLine: baseLine + endLine,
      }, source);
    },

    async killSexp(pos: unknown): Promise<unknown> {
      const cursor = parsePos(pos);
      const [src, idx, , rng] = await getAroundSrcAndIdx(vim, cursor, 100);
      const { startLine: baseLine } = rng;
      const { source, startLine } = paredit.killSexp(src, idx);
      return setLines(vim, baseLine + startLine, source);
    },

    async killLine(pos: unknown): Promise<unknown> {
      const cursor = parsePos(pos);
      const [src, idx, , rng] = await getAroundSrcAndIdx(vim, cursor, 100);
      const { startLine: baseLine } = rng;

      const { source, startLine } = paredit.killLine(src, idx);
      return setLines(vim, baseLine + startLine, source);
    },

    async killRange(): Promise<unknown> {
      const [fromCursor, toCursor] = await visualRange(vim);
      const [src, idx, endIdx, rng] = await getAroundSrcAndIdx(
        vim,
        fromCursor,
        100,
        toCursor,
      );
      const { startLine: baseLine } = rng;

      const { source, startLine, endLine } = paredit.killRange(
        src,
        idx,
        endIdx,
      );
      return replaceLines(vim, {
        startLine: baseLine + startLine,
        endLine: baseLine + endLine,
      }, source);
    },

    async spliceSexp(pos: unknown): Promise<unknown> {
      const { line, column } = parsePos(pos);
      const lines = await getLines(vim, line, line + 100);
      const newSrc = paredit.spliceSexp(lines.join("\n"), column);
      return setLines(vim, line, newSrc);
    },

    async splitSexp(pos: unknown): Promise<unknown> {
      const { line, column } = parsePos(pos);
      const lines = await getLines(vim, line, line + 100);
      const newSrc = paredit.splitSexp(lines.join("\n"), column);
      return setLines(vim, line, newSrc);
    },

    async wrapAround(pos: unknown): Promise<unknown> {
      const { line, column } = parsePos(pos);
      const lines = await getLines(vim, line, line + 100);
      const newSrc = paredit.wrapAround(lines.join("\n"), column);
      return setLines(vim, line, newSrc);
    },
  });

  // Use 'vim.execute()' to execute Vim script
  await vim.execute(`
    command! DPForwardSexp         call denops#request("${vim.name}", "forwardSexp", [getpos('.')])
    command! DPSexpRange           call denops#request("${vim.name}", "sexpRange", [getpos('.')])
    command! -range DPSexpRangeExpansion  call denops#request("${vim.name}", "sexpRangeExpansion", [getpos('.')])
    command! DPBarfSexp            call denops#request("${vim.name}", "barfSexp", [getpos('.')])
    command! DPSlurpSexp           call denops#request("${vim.name}", "slurpSexp", [getpos('.')])
    command! DPDelete              call denops#request("${vim.name}", "delete", [getpos('.')])
    command! DPKillSexp            call denops#request("${vim.name}", "killSexp", [getpos('.')])
    command! DPKillLine            call denops#request("${vim.name}", "killLine", [getpos('.')])
    command! -range DPKillRange    call denops#request("${vim.name}", "killRange", [])
    command! DPSpliceSexp          call denops#request("${vim.name}", "spliceSexp", [getpos('.')])
    command! DPSplitSexp           call denops#request("${vim.name}", "splitSexp", [getpos('.')])
    command! DPWrapAround          call denops#request("${vim.name}", "wrapAround", [getpos('.')])

    nnoremap <silent> <Plug>(dps_paredit_barf)                  :<C-u>DPBarfSexp<CR>
    nnoremap <silent> <Plug>(dps_paredit_slurp)                 :<C-u>DPSlurpSexp<CR>
    nnoremap <silent> <Plug>(dps_paredit_delete)                :<C-u>DPDelete<CR>
    nnoremap <silent> <Plug>(dps_paredit_kill_sexp)             :<C-u>DPKillSexp<CR>
    nnoremap <silent> <Plug>(dps_paredit_kill_sexp_after_all)   :<C-u>DPKillSexpAfterAll<CR>
    nnoremap <silent> <Plug>(dps_paredit_splice_sexp)           :<C-u>DPSpliceSexp<CR>
    nnoremap <silent> <Plug>(dps_paredit_split_sexp)            :<C-u>DPSplitSexp<CR>
    nnoremap <silent> <Plug>(dps_paredit_wrap_around)           :<C-u>DPWrapAround<CR>
    nnoremap <silent> <Plug>(dps_paredit_sexp_range)            :<C-u>DPSexpRange<CR>

    vnoremap <silent> <Plug>(dps_paredit_sexp_range_expansion)  :<C-u>DPSexpRangeExpansion<CR>
  `);

  console.log("dps-paredit has loaded");
});
