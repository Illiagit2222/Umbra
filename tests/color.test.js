import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// color.js is a classic browser script, so load it into a sandbox and pull its functions out.
const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL("../src/color.js", import.meta.url), "utf8"), ctx);
const { parseColorQuery, colorToHex, colorToHsl, colorShade } = ctx;
const plain = (v) => JSON.parse(JSON.stringify(v));

test("parses hex in every common length, any case", () => {
  for (const q of ["#C83939", "#c83939", "#c83939ff", "  #C83939  "]) {
    assert.deepEqual(plain(parseColorQuery(q)), { r: 200, g: 57, b: 57 }, q);
  }
  assert.deepEqual(plain(parseColorQuery("#c83")), { r: 204, g: 136, b: 51 });
  assert.deepEqual(plain(parseColorQuery("#c83f")), { r: 204, g: 136, b: 51 });
});

test("parses rgb() with commas or spaces", () => {
  assert.deepEqual(plain(parseColorQuery("rgb(200, 57, 57)")), { r: 200, g: 57, b: 57 });
  assert.deepEqual(plain(parseColorQuery("RGB(200 57 57)")), { r: 200, g: 57, b: 57 });
});

test("leaves ordinary searches alone", () => {
  for (const q of ["#", "#c8", "#c8393", "#hashtag", "c83939", "rgb(300, 0, 0)", "rgb", "chrome"]) {
    assert.equal(parseColorQuery(q), null, q);
  }
});

test("formats hex and HSL like the design", () => {
  const c = { r: 200, g: 57, b: 57 };
  assert.equal(colorToHex(c), "#C83939");
  assert.equal(colorToHsl(c), "0, 57%, 50%");
  assert.equal(colorToHsl({ r: 128, g: 128, b: 128 }), "0, 0%, 50%");
});

test("shades are 25% towards white and 25% towards black", () => {
  const c = { r: 200, g: 57, b: 57 };
  assert.equal(colorToHex(colorShade(c, 0.25)), "#D66B6B");
  assert.equal(colorToHex(colorShade(c, -0.25)), "#962B2B");
});
