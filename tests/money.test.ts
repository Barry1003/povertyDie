import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatNaira, koboToDecimal, normalizeAmount, toKobo } from "../src/lib/group/money";

describe("exact-money arithmetic", () => {
  it("never loses fractional kobo through JS floating-point rounding", () => {
    const total = toKobo("0.10") + toKobo("0.20");
    assert.equal(koboToDecimal(total), "0.30");
  });

  it("formats verified NGN values with thousands separators", () => {
    assert.equal(formatNaira("25000.00"), "₦25,000.00");
    assert.equal(formatNaira("1234567.89"), "₦1,234,567.89");
  });

  it("normalizes accepted contribution amounts", () => {
    assert.equal(normalizeAmount("25000"), "25000.00");
    assert.equal(normalizeAmount("100.5"), "100.50");
    assert.equal(normalizeAmount("1.00"), "1.00");
  });

  it("rejects zero, negatives, excess decimals and scientific notation", () => {
    for (const invalid of ["0", "0.00", "-200", "1.001", "1e4", "1,000", "100.", ""]) {
      assert.equal(normalizeAmount(invalid), null);
    }
  });

  it("rejects unaudited excessive claim amounts", () => {
    assert.equal(normalizeAmount("1000000001"), null);
  });

  it("rejects malformed persisted values", () => {
    assert.throws(() => toKobo("1.005"), /Invalid decimal/);
    assert.throws(() => toKobo("NaN"), /Invalid decimal/);
  });
});
