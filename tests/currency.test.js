import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// currency.js is a classic browser script, so load it into a sandbox and pull its functions out.
const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL("../src/currency.js", import.meta.url), "utf8"), ctx);
const { parseFxQuery, parseFxAmount, formatFxNumber, formatFxFixed, fxRateDecimals, fxCopyText, fxChipPairs, fxShiftDate, fxChartPoints, fxSmoothPath } = ctx;

// Values built inside the sandbox have a foreign Object prototype; compare them as plain data.
const plain = (v) => JSON.parse(JSON.stringify(v));
const NB = " ";

test("parses the canonical query from the design", () => {
  assert.deepEqual(plain(parseFxQuery("100 usd to rub")), { amount: 100, raw: "100", from: "USD", to: "RUB" });
});

test("accepts in/into/в, arrows, glued amounts and any case", () => {
  for (const q of ["100 usd in rub", "100 usd into rub", "100 USD TO RUB", "100usd rub", "100 usd -> rub", "100 usd→rub", "  100 usd to rub  "]) {
    assert.deepEqual(plain(parseFxQuery(q)), { amount: 100, raw: "100", from: "USD", to: "RUB" }, q);
  }
  assert.deepEqual(plain(parseFxQuery("100 руб в usd")), { amount: 100, raw: "100", from: "RUB", to: "USD" });
});

test("resolves aliases to ISO codes", () => {
  assert.equal(parseFxQuery("100 yen to uah").from, "JPY");
  assert.equal(parseFxQuery("5 euro to грн").to, "UAH");
});

test("without an amount it converts 1 unit but requires a separator", () => {
  assert.deepEqual(plain(parseFxQuery("usd to rub")), { amount: 1, raw: "", from: "USD", to: "RUB" });
  assert.equal(parseFxQuery("usd rub"), null);
});

test("leaves ordinary searches alone", () => {
  for (const q of ["set to off", "notes to self", "100 abc to rub", "100 usd to", "100 usd to ru", "chrome", "", "kill usd"]) {
    assert.equal(parseFxQuery(q), null, q);
  }
});

test("parses grouped and decimal amounts", () => {
  assert.equal(parseFxAmount("1 000"), 1000);
  assert.equal(parseFxAmount("1,5"), 1.5);
  assert.equal(parseFxAmount("1,500"), 1500);
  assert.equal(parseFxAmount("1,234.56"), 1234.56);
  assert.equal(parseFxAmount("12."), 12);
  assert.ok(Number.isNaN(parseFxAmount("1.2.3")));
});

test("formats numbers like the design", () => {
  assert.equal(formatFxNumber(9124.12), `9${NB}124`);
  assert.equal(formatFxNumber(91.2412), "91.24");
  assert.equal(formatFxNumber(100), "100");
  assert.equal(formatFxNumber(1.5), "1.5");
  assert.equal(formatFxNumber(1234567.8), `1${NB}234${NB}568`);
  assert.equal(formatFxNumber(0.0112345), "0.01123");
  assert.equal(formatFxNumber(-2.564), "-2.56");
  assert.equal(formatFxNumber(0), "0");
});

test("rates keep a fixed precision that follows their magnitude", () => {
  assert.equal(fxRateDecimals(91.2412), 2);
  assert.equal(fxRateDecimals(0.01174), 5);
  assert.equal(formatFxFixed(85.2, 2), "85.20");
  assert.equal(formatFxFixed(-2.564, 2), "-2.56");
  assert.equal(formatFxFixed(110345.123, 2), `110${NB}345.12`);
  assert.equal(formatFxFixed(-0.001, 2), "0.00");
  assert.equal(formatFxFixed(0.011742, 5), "0.01174");
});

test("copy text keeps cents and drops grouping", () => {
  assert.equal(fxCopyText(9124.123), "9124.12");
  assert.equal(fxCopyText(100), "100");
  assert.equal(fxCopyText(0.0112345), "0.01123");
});

test("chips show recent pairs first, then defaults, never the current pair", () => {
  assert.deepEqual(plain(fxChipPairs("USD-RUB", [])), ["USD-UAH", "USD-BYN", "JPY-UAH"]);
  assert.deepEqual(plain(fxChipPairs("USD-UAH", [])), ["USD-BYN", "JPY-UAH", "EUR-USD"]);
  assert.deepEqual(plain(fxChipPairs("USD-RUB", ["USD-RUB", "EUR-PLN", "USD-BYN"])), ["EUR-PLN", "USD-BYN", "USD-UAH"]);
});

test("shifts ISO dates across month boundaries", () => {
  assert.equal(fxShiftDate("2026-10-12", -1), "2026-10-11");
  assert.equal(fxShiftDate("2026-03-01", -1), "2026-02-28");
});

test("chart points span the plot box, highest value on top", () => {
  const box = { left: 13, right: 225, top: 38, bottom: 76 };
  const pts = plain(fxChartPoints([3, 1, 2], box));
  assert.deepEqual(pts.map((p) => p.x), [13, 119, 225]);
  assert.deepEqual(pts.map((p) => p.y), [38, 76, 57]);
  assert.deepEqual(plain(fxChartPoints([5, 5], box)).map((p) => p.y), [57, 57]);
});

test("smooth path passes through every point without NaN", () => {
  const pts = fxChartPoints([94, 95, 95, 92, 91, 91.2, 91.24], { left: 13, right: 225, top: 38, bottom: 76 });
  const d = fxSmoothPath(pts);
  assert.ok(!d.includes("NaN"), d);
  assert.ok(d.startsWith(`M${pts[0].x} ${pts[0].y}`), d);
  assert.ok(d.endsWith(`${pts[6].x} ${pts[6].y}`), d);
});
