import * as sut from "./editor.ts";
import { asserts } from "../deps.ts";
import { ChangedResult } from "../_interface.ts";

type TestPattern = [string, number, ChangedResult];
type TestPattern2 = [string, Array<number>, ChangedResult];
let patterns = [] as Array<TestPattern>;
let patterns2 = [] as Array<TestPattern2>;

Deno.test("barfSexp", async () => {
  patterns = [
    [`(a (b))`, 0, { source: null, startLine: 0, endLine: 0 }],
    [`(a (b))`, 1, { source: `(a) (b)`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 2, { source: `(a) (b)`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 3, { source: `(a )(b)`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 4, { source: `(a ()b)`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 5, { source: null, startLine: 0, endLine: 0 }],
    [`(a (b))`, 6, { source: null, startLine: 0, endLine: 0 }],

    [`(a\n(b)\n)`, 0, { source: null, startLine: 0, endLine: 0 }],
    //[`(a\n(b)\n)`, 1, { source: `(a)\n(b)\n`, startLine: 0, endLine: 2 }],
    [`(a\n(b)\n)`, 1, { source: `(a)\n(b)`, startLine: 0, endLine: 2 }],
  ];
  for (const [src, idx, expected] of patterns) {
    asserts.assertEquals(sut.barfSexp(src, idx), expected);
  }
});

Deno.test("slurpSexp", async () => {
  patterns = [
    [`(a (b)) c`, 0, { source: null, startLine: 0, endLine: 0 }],
    [`(a (b)) c`, 1, { source: `(a (b) c)`, startLine: 0, endLine: 0 }],
    [`(a (b)) c`, 2, { source: `(a (b) c)`, startLine: 0, endLine: 0 }],
    [`(a (b)) c`, 3, { source: `(a (b) c)`, startLine: 0, endLine: 0 }],
    [`(a (b)) c`, 4, { source: `(a (b) c)`, startLine: 0, endLine: 0 }],
    [`(a (b)) c`, 5, { source: `(a (b) c)`, startLine: 0, endLine: 0 }],
    [`(a (b)) c`, 6, { source: `(a (b) c)`, startLine: 0, endLine: 0 }],
    [`(a (b)) c`, 7, { source: null, startLine: 0, endLine: 0 }],
    [`(a (b)) c`, 8, { source: null, startLine: 0, endLine: 0 }],

    [`(a\n(b)) c`, 0, { source: null, startLine: 0, endLine: 0 }],
    [`(a\n(b)) c`, 1, { source: `(b) c)`, startLine: 1, endLine: 1 }],
    [`(a\n(b)) c`, 2, { source: `(b) c)`, startLine: 1, endLine: 1 }],
    [`(a\n(b)) c`, 3, { source: `(b) c)`, startLine: 1, endLine: 1 }],
    [`(a\n(b)) c`, 4, { source: `(b) c)`, startLine: 1, endLine: 1 }],

    [`(a\n)\nc`, 1, { source: `\nc)`, startLine: 1, endLine: 2 }],

    // @
    // TODO: it should be [`(a @b)`, 0]
    [`(a) @b`, 1, { source: `(a @)b`, startLine: 0, endLine: 0 }],
  ];
  for (const [src, idx, expected] of patterns) {
    asserts.assertEquals(sut.slurpSexp(src, idx), expected);
  }
});

Deno.test("killSexp", async () => {
  patterns = [
    [`(a (b))`, 0, { source: ``, startLine: 0, endLine: 0 }],
    [`(a (b))`, 1, { source: `( (b))`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 2, { source: `(a)`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 3, { source: `(a )`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 4, { source: `(a ())`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 5, { source: null, startLine: 0, endLine: 0 }],
    [`(a (b))`, 6, { source: null, startLine: 0, endLine: 0 }],

    [`(a\n (b))`, 3, { source: `)`, startLine: 1, endLine: 1 }],
  ];
  for (const [src, idx, expected] of patterns) {
    asserts.assertEquals(sut.killSexp(src, idx), expected);
  }
});

Deno.test("killLine", async () => {
  patterns = [
    [`(a (b))`, 0, { source: ``, startLine: 0, endLine: 0 }],
    [`(a (b))`, 1, { source: `()`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 2, { source: `(a)`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 3, { source: `(a )`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 4, { source: `(a ())`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 5, { source: null, startLine: 0, endLine: 0 }],
    [`(a (b))`, 6, { source: null, startLine: 0, endLine: 0 }],

    [`(a) (b)`, 0, { source: ``, startLine: 0, endLine: 0 }],
    [`(a) (b)`, 1, { source: `()`, startLine: 0, endLine: 0 }],
    [`(a) (b)`, 2, { source: `(a)`, startLine: 0, endLine: 0 }],
    [`(a) (b)`, 3, { source: `(a)`, startLine: 0, endLine: 0 }],
    [`(a) (b)`, 4, { source: `(a) `, startLine: 0, endLine: 0 }],
    [`(a) (b)`, 5, { source: `(a) ()`, startLine: 0, endLine: 0 }],
    [`(a) (b)`, 6, { source: null, startLine: 0, endLine: 0 }],

    [`(a\n(b))`, 0, { source: `(`, startLine: 0, endLine: 0 }],
    [`(a\n(b))`, 1, { source: `(`, startLine: 0, endLine: 0 }],
    [`(a\n(b))`, 3, { source: `)`, startLine: 1, endLine: 1 }],
    [`(a\n(b))`, 4, { source: `())`, startLine: 1, endLine: 1 }],
    [`(a\n(b))`, 5, { source: null, startLine: 1, endLine: 1 }],
    [`(a\n(b))`, 6, { source: null, startLine: 1, endLine: 1 }],
  ];

  for (const [src, idx, expected] of patterns) {
    asserts.assertEquals(sut.killLine(src, idx), expected);
  }
});

Deno.test("deleteChar", async () => {
  patterns = [
    [`a()(b)`, 0, { source: `()(b)`, startLine: 0, endLine: 0 }],
    [`a()(b)`, 1, { source: `a(b)`, startLine: 0, endLine: 0 }],
    [`a()(b)`, 2, { source: `a(b)`, startLine: 0, endLine: 0 }],
    [`a()(b)`, 3, { source: null, startLine: 0, endLine: 0 }],
    [`a()(b)`, 4, { source: `a()()`, startLine: 0, endLine: 0 }],
    [`a()(b)`, 5, { source: null, startLine: 0, endLine: 0 }],

    //// Test patterns containing new lines
    [`(a\nb)`, 0, { source: null, startLine: 0, endLine: 0 }],
    [`(a\nb)`, 1, { source: `(`, startLine: 0, endLine: 0 }],
    [`(a\nb)`, 3, { source: `)`, startLine: 1, endLine: 1 }],
    [`(a\nb)`, 4, { source: null, startLine: 0, endLine: 0 }],

    [`(\n)`, 2, { source: ``, startLine: 0, endLine: 1 }],

    [`(a)\n(b)\n(c)`, 0, { source: null, startLine: 0, endLine: 0 }],
    [`(a)\n(b)\n(c)`, 1, { source: `()`, startLine: 0, endLine: 0 }],
    [`(a)\n(b)\n(c)`, 2, { source: null, startLine: 0, endLine: 0 }],
    [`(a)\n(b)\n(c)`, 4, { source: null, startLine: 0, endLine: 0 }],
    [`(a)\n(b)\n(c)`, 5, { source: `()`, startLine: 1, endLine: 1 }],

    [`()\n()`, 0, { source: ``, startLine: 0, endLine: 0 }],
    [`()\n()`, 1, { source: ``, startLine: 0, endLine: 0 }],
    [`()\n()`, 3, { source: ``, startLine: 1, endLine: 1 }],
    [`()\n()`, 4, { source: ``, startLine: 1, endLine: 1 }],
  ];
  for (const [src, idx, expected] of patterns) {
    asserts.assertEquals(sut.deleteChar(src, idx), expected);
  }
});

Deno.test("killRange", async () => {
  patterns2 = [
    [`(a (b))`, [0, 6], { source: ``, startLine: 0, endLine: 0 }],
    [`(a (b))`, [0, 5], { source: `()`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [0, 4], { source: `(())`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [0, 3], { source: `((b))`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [0, 2], { source: `((b))`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [0, 1], { source: `( (b))`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [0, 0], { source: null, startLine: 0, endLine: 0 }],

    [`(a (b))`, [1, 6], { source: `()`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [1, 5], { source: `()`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [1, 4], { source: `(())`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [1, 3], { source: `((b))`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [1, 2], { source: `((b))`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [1, 1], { source: `( (b))`, startLine: 0, endLine: 0 }],
    [`(a (b))`, [1, 4], { source: `(())`, startLine: 0, endLine: 0 }],

    //// Test patterns containing new lines
    [`(a\n(b\n(c)))`, [0, 10], { source: ``, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [0, 9], { source: `()`, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [0, 8], { source: `(())`, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [0, 7], { source: `((()))`, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [0, 6], { source: `(((c)))`, startLine: 0, endLine: 2 }],
    //[`(a\n(b\n(c)))`, [0, 5], { source: `(((c)))`, startLine: 0, endLine: 1 }],
    [`(a\n(b\n(c)))`, [0, 4], { source: `((`, startLine: 0, endLine: 1 }],
    [`(a\n(b\n(c)))`, [0, 3], { source: `((b`, startLine: 0, endLine: 1 }],
    //[`(a\n(b\n(c)))`, [0, 2], { source: `((b`, startLine: 0, endLine: 1 }],
    [`(a\n(b\n(c)))`, [0, 1], { source: `(`, startLine: 0, endLine: 0 }],
    [`(a\n(b\n(c)))`, [0, 0], { source: null, startLine: 0, endLine: 0 }],

    [`(a\n(b\n(c)))`, [1, 10], { source: `()`, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [1, 9], { source: `()`, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [1, 8], { source: `(())`, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [1, 7], { source: `((()))`, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [1, 6], { source: `(((c)))`, startLine: 0, endLine: 2 }],
    //[`(a\n(b\n(c)))`, [1, 5], { source: `(((c)))`, startLine: 0, endLine: 2 }],
    [`(a\n(b\n(c)))`, [1, 4], { source: `((`, startLine: 0, endLine: 1 }],
    [`(a\n(b\n(c)))`, [1, 3], { source: `((b`, startLine: 0, endLine: 1 }],
    //[`(a\n(b\n(c)))`, [1, 2], { source: `((b`, startLine: 0, endLine: 1 }],
    [`(a\n(b\n(c)))`, [1, 1], { source: `(`, startLine: 0, endLine: 0 }],

    [`(a\n(b\n(c)))`, [3, 10], { source: `)`, startLine: 1, endLine: 2 }],
    [`(a\n(b\n(c)))`, [3, 9], { source: `)`, startLine: 1, endLine: 2 }],
    [`(a\n(b\n(c)))`, [3, 8], { source: `())`, startLine: 1, endLine: 2 }],
    [`(a\n(b\n(c)))`, [3, 7], { source: `(()))`, startLine: 1, endLine: 2 }],
    [`(a\n(b\n(c)))`, [3, 6], { source: `((c)))`, startLine: 1, endLine: 2 }],
    //[`(a\n(b\n(c)))`, [3, 5], { source: `((c)))`, startLine: 1, endLine: 2 }],
    [`(a\n(b\n(c)))`, [3, 4], { source: `(`, startLine: 1, endLine: 1 }],
    [`(a\n(b\n(c)))`, [3, 3], { source: null, startLine: 1, endLine: 1 }],
  ];
  for (const [src, [startIdx, endIdx], expected] of patterns2) {
    asserts.assertEquals(sut.killRange(src, startIdx, endIdx), expected);
  }
});
