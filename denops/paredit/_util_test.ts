import { asserts } from "./deps.ts";
import * as sut from "./_util.ts";

Deno.test("idxToPos", async () => {
  asserts.assertEquals(sut.idxToPos("abc", 0, 0), { line: 0, column: 0 });
  asserts.assertEquals(sut.idxToPos("abc", 1, 0), { line: 1, column: 0 });

  asserts.assertEquals(sut.idxToPos("a\nb\nc", 0, 0), { line: 0, column: 0 });
  asserts.assertEquals(sut.idxToPos("a\nb\nc", 0, 1), { line: 0, column: 1 });
  //asserts.assertEquals(sut.idxToPos("a\nb\nc", 0, 2), [1, 0]);

  //asserts.assertEquals(sut.idxToPos("a\n\nb", 0, 2), [1, 0]);
});
