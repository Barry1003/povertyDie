import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canonicalUsername, usernameError } from "../src/lib/auth/username";

describe("usernames", () => {
  it("normalizes case and whitespace without leaking authentication identifiers", () => {
    assert.equal(canonicalUsername("  Ishola_1003  "), "ishola_1003");
    assert.equal(canonicalUsername("nigeria"), "nigeria");
  });
  it("rejects usernames unsafe for a shared group", () => {
    for(const name of ["", "aa", "_friend", "john-doe", "john@demo.com", "user space", "a".repeat(25), "admin", "ADMIN", "support", 123, null]){
      assert.equal(canonicalUsername(name), null);
      assert.ok(usernameError(name));
    }
  });
  it("requires a letter prefix and allows only ASCII alphanumerics and underscore", () => {
    assert.equal(canonicalUsername("Member99"), "member99");
    assert.equal(canonicalUsername("7member"), null);
    assert.equal(canonicalUsername("user_name"), "user_name");
  });
});
