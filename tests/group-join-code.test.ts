import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateGroupJoinCode, GROUP_JOIN_CODE_LENGTH, normalizeGroupJoinCode } from "../src/lib/group/join-code";

describe("reusable group join codes", () => {
  it("generates random 12-character codes with unambiguous characters", () => {
    const values = Array.from({ length: 128 }, generateGroupJoinCode);
    assert.equal(new Set(values).size, values.length);
    for (const value of values) {
      assert.equal(value.length, GROUP_JOIN_CODE_LENGTH);
      assert.match(value, /^[A-HJ-NP-Z2-9]{12}$/);
    }
  });

  it("accepts lowercase codes and surrounding whitespace", () => {
    assert.equal(normalizeGroupJoinCode(" abcd2345wxyz "), "ABCD2345WXYZ");
    assert.equal(normalizeGroupJoinCode("A0123456789B"), "A0123456789B");
  });

  it("rejects malformed codes and tokens", () => {
    for (const input of [null, 42, "", "short", "ABCDEFGHIJKLM", "ABCD-2345XYZ",
      "AAAAAAAAAAAA\nmalicious", "Abcd 2345wxyz"]) {
      assert.equal(normalizeGroupJoinCode(input), null);
    }
  });
});
