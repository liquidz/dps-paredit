import * as sut from "./editor.ts";
import { asserts } from "../deps.ts";
import { ChangedResult } from "../_interface.ts";

type TestPattern = [string, number, ChangedResult];
let patterns = [] as Array<TestPattern>;

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

Deno.test("killSexpAfterAll", async () => {
  patterns = [
    [`(a (b))`, 0, { source: ``, startLine: 0, endLine: 0 }],
    [`(a (b))`, 1, { source: `()`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 2, { source: `(a)`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 3, { source: `(a )`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 4, { source: `(a ())`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 5, { source: `(a (b))`, startLine: 0, endLine: 0 }],
    [`(a (b))`, 6, { source: `(a (b))`, startLine: 0, endLine: 0 }],

    [`(a) (b)`, 0, { source: ``, startLine: 0, endLine: 0 }],
    // TODO
    //[`(a\n(b))`, 0, { source: `(`, startLine: 0, endLine: 0 }],
  ];

  for (const [src, idx, expected] of patterns) {
    asserts.assertEquals(sut.killSexpAfterAll(src, idx), expected);
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

    // あれ？？
    [`()\n()\n()`, 0, { source: `()`, startLine: 0, endLine: 0 }],
    // あれ？？
    [`()\n()\n()`, 1, { source: `()`, startLine: 0, endLine: 0 }],
    [`()\n()\n()`, 3, { source: ``, startLine: 1, endLine: 1 }],
  ];
  for (const [src, idx, expected] of patterns) {
    asserts.assertEquals(sut.deleteChar(src, idx), expected);
  }
});
