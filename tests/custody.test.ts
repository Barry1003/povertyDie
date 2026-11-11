import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { currentPeriod, nextCustodian, nextPeriod, validPeriod } from "../src/lib/accounting/custody";

const roster = [
  { userId: "b", joinedAt: "2026-05-02T10:00:00.000Z" },
  { userId: "a", joinedAt: "2026-04-01T10:00:00.000Z" },
  { userId: "c", joinedAt: "2026-05-02T10:00:00.000Z" },
];

describe("monthly rotating custody", () => {
  it("starts with the earliest member", () => {
    assert.equal(nextCustodian(roster, null), "a");
  });

  it("advances in consistent order and wraps", () => {
    assert.equal(nextCustodian(roster, "a"), "b");
    assert.equal(nextCustodian(roster, "b"), "c");
    assert.equal(nextCustodian(roster, "c"), "a");
  });

  it("handles a former custodian who has left the group", () => {
    assert.equal(nextCustodian(roster, "former"), "a");
  });

  it("validates nonempty unique roster", () => {
    assert.throws(() => nextCustodian([], null), /At least/);
    assert.throws(() => nextCustodian([roster[0], roster[0]], null), /Invalid/);
  });

  it("validates YYYY-MM and handles year boundaries", () => {
    assert.equal(validPeriod("2026-11"), true);
    assert.equal(validPeriod("2026-00"), false);
    assert.equal(validPeriod("2026-13"), false);
    assert.equal(nextPeriod("2026-12"), "2027-01");
    assert.equal(currentPeriod(new Date("2026-11-11T00:00:00Z")), "2026-11");
  });
});
