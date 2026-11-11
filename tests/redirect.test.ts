import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeReturnTo } from "../src/lib/auth/redirect";

describe("authentication redirect safety", () => {
  it("allows internal invitation URLs and dashboard", () => {
    assert.equal(safeReturnTo("/"), "/");
    assert.equal(safeReturnTo("/?invite=abc"), "/?invite=abc");
    assert.equal(safeReturnTo("/profile"), "/profile");
  });
  it("blocks external redirects, auth APIs and control chars", () => {
    for (const url of ["https://evil.example", "//evil.example", "/\\evil", "/api/me",
      "/sign-in", "/forgot-password", "/reset-password?token=x", "/\nevil", null, {}]) {
      assert.equal(safeReturnTo(url), "/");
    }
  });
});
