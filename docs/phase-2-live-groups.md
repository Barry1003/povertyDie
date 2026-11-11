# Phase 2 — live group membership and contributions

## What members can do

1. Sign in with any Google account through Neon Auth. Signing in does **not** grant access to another group's finances.
2. If not a group member, create one group or enter a single-use private invite.
3. The creator becomes administrator and can send 7-day, one-use invitation links.
4. Every member sees the **same shared group overview**, verified group total, pending claims, member totals, and the latest 100 contributions.
5. Members can submit a payment **claim** with month, amount, bank transfer reference, and optional note. It is marked `submitted`, NOT verified.
6. Group administrators can grant or revoke the reviewer role for another member.
7. Only administrators or reviewers can verify or reject claims from **other** members. The reviewer must independently inspect the receiving bank account. Each review is immutable in `contribution_reviews`.
8. Verified totals count **only** claims with status `verified`. Rejected and pending money never appears in verified totals.

## Identity, money and security invariants

- Neon Auth owns identity; `profiles` is a local user-ID based display cache.
- **Group membership is the data boundary**, not Google sign-in. All queries are scoped to the user's membership; all mutations check membership and role on the server.
- No emails or names are trusted from request bodies; values come from server-side Neon session.
- A one-use invite is 32 cryptographically random bytes, hashed with SHA-256 in the database and consumed in an atomic SQL statement. Never share it publicly.
- Database uniqueness guarantees one membership per user for this one-group MVP, even under concurrent submissions.
- A group creator and their admin membership are created atomically.
- Submitted contribution amounts use NUMERIC(18,2) and integer kobo for group arithmetic, not JavaScript float.
- Reference + group + submitter is unique to avoid accidentally submitting the same bank reference twice.
- Review state transitions are atomic with an immutable audit entry and require `submitted` status.
- Admins cannot mark their own transfer verified; add a trusted independent reviewer before verifying an administrator's claim.
- The app uses no payments API; it never sends funds or reads bank balances.
- No earnings/profit figures or unit ownership are computed yet. Contributions and investment returns are different quantities.

## Setup

1. Configure Neon PostgreSQL and Neon Auth; `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and `NEON_AUTH_COOKIE_SECRET` are server-only.
2. Run `npm install`, `npm run db:generate` and `npm run db:migrate` against the **same Neon branch**.
3. Run `npm test`, `npm run typecheck` and `npm run build`.
4. Launch app and have founder create "Poverty Die" group; send an invitation to another friend.
5. Have each friend sign in with their Google account, join with invitation, and confirm they see exactly the same member counts.
6. Verify authorization: a signed-in uninvited Google account sees group creation/join, not group financial records.
7. Submit a claim and confirm it is pending, not counted in the verified total.
8. Assign a reviewer, sign in as that independent person, verify after **external bank confirmation**, then verify the total updates for every member.
9. Try self-review: must return 409. Try reusing invite: must return 409. Try cross-group claim and role changes: must return 403/404.

## Known remaining limitations / next phase

- No payments processor, proof upload, bank reconciliation integration, KYC or compliance workflow.
- No unit issuance, investment NAV, profit/loss allocation, earnings, distributions or withdrawals.
- No member self-service removal, invite revocation or group switching; one group per user for this private-friends MVP.
- Recent claims are capped at 100; pagination and long-term audit export are needed.
- Groups are private but the new member may join by **possession** of a link; use identity-bound invitations if you need stricter admission.
- This code must pass database migrations and a two-user Neon Auth integration test before real contributions are accepted.
- The previous Figma prototype remains in `src/App.tsx` for design reference but **is not mounted** at `/`.
