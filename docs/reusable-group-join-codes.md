# Reusable group join codes

Every newly created group receives a random twelve-character reusable code.
The code is shown only to the group admin on the group dashboard. An admin can
copy the code or a link, disable joining with it, or regenerate it. Existing
members remain members when the code is disabled or replaced.

The old seven-day one-use hashed invitation links continue to work unchanged.
The join route accepts either a one-use token or a reusable code. Both require
an authenticated Neon session. One group per user is enforced in PostgreSQL.

## Deployment prerequisite

**Do not deploy these application changes before applying and reviewing**
`db/manual/20261112_group_join_codes.sql` on the matching Neon database branch.
The SQL is additive and backfills existing groups. It has not been executed
by this code change. Review the actual database state before any production use.

## Manual acceptance checks (requires authorized test Neon branch)

1. New group creation shows an active code only to its admin.
2. A distinct authenticated account can join using a mixed-case code.
3. A second friend can join using the same code.
4. A member already in a group cannot join another via code.
5. Non-admins cannot regenerate, enable or disable codes (403).
6. Disabling rejects new code joins but preserves current membership.
7. Regeneration invalidates the old code and enables the new one.
8. Old single-use links continue to expire and cannot be reused.
9. A signed-out friend opening a code link can sign in and return to the join form.
10. Invalid codes do not disclose private group details.

CI unit tests do not demonstrate live Neon Auth or migration success.
