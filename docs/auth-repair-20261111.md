# Poverty Die — auth and schema repair (11 November 2026)

## Verified evidence

- Current GitHub `main` remains the Google-only UI; PR #4 targets `main`, and PR #5 targets PR #4's branch. **Nothing in this repair was merged into `main`.**
- Neon project: `povertyDie`. Default branch `production`; existing Vercel-managed preview branch `preview/feat/valuation-unit-foundation`.
- Both the Neon production and that existing preview branch initially contained `profiles`, `groups`, `memberships`, `contributions`, and `investments`, with the old schema and missing Phase 2/3 tables.
- Initial production aggregate: one identity, seven auth session records, **zero application profiles**. This supports an auth-to-app handoff failure but does not establish which request or cookie failed.
- Confirmed deterministic **PR #5 runtime fault**: `getViewer()` inserts/updates profile `display_name`, `email`, and `updated_at`, which do not exist in the currently provisioned databases. Therefore any valid-session request to the PR #5 dashboard will fail until a matching schema is installed.
- Neon Auth production configuration confirms Google provider enabled, email/password enabled, and the canonical `povertydie.vercel.app` origin trusted. Configuration alone does not prove working OAuth cookies or Vercel environment-value correctness.
- No authenticated Vercel logs or production OAuth browser session were available to verify the older `main` login problem; **its exact root cause remains unconfirmed**.

## Changes on this repair branch

1. Replace the custom `[...nextauth]` route-parameter bridge with the Neon SDK's canonical `[...path]` route (same external `/api/auth/*` endpoint).
2. Harden `/api/health` so it reports `migrations_required` when Phase 2/3 tables **or columns** are missing; no credentials or row data are disclosed.
3. Add a root application error boundary with a retry action so a database exception is visible to the member.
4. Provide `db/manual/20261111_phase3_additive_upgrade.sql` as a reviewed **manual**, additive upgrade for a database matching the inspected main-branch schema.
5. Enable repair-branch CI with existing tests/typecheck/migration-generation/build.

## Migration validation

The equivalent 38 SQL statements were executed in a single transaction against the isolated Neon branch
`repair-auth-schema-validation-20261111`, forked from `production`. Verification confirmed:
- All ten Phase 2/3 core tables expected by this app are present;
- Six expected profile columns, four added contribution fields, and the unique membership-by-user index are present;
- The transaction completed successfully, with no production schema/data modification.

This validation does **not** test the application's Next.js runtime against that branch or execute a real Google sign-in. It also does not certify the script against arbitrary legacy data. Missing profile identity matches and nonconforming legacy records intentionally cause SQL rollback at the `NOT NULL` / uniqueness / check constraints.

## Deployment handoff (owner action only; not completed)

1. Inspect the exact Vercel deployed commit, branch, build logs and runtime logs. Confirm all three required server-side variable *values* point to the correct Neon branch; names-only screenshots are insufficient.
2. Configure Preview values for `DATABASE_URL` and `NEON_AUTH_BASE_URL` from **the same preview branch**, and `NEON_AUTH_COOKIE_SECRET` with a valid secret, without sharing their values.
3. Review the manual SQL with the DBA. Apply it first to the Vercel Preview database branch and verify health. **Do not run it in Production without explicit approval and a backup/rollback plan.**
4. Deploy the repair branch as Preview after its PR passes checks, then check `/api/health`. An HTTP 200 indicates schema and environment readiness only.
5. Test Google sign-in (new/returning), email registration/password recovery, refresh/logout, first-time group creation and invitations, independent contribution verification and cross-group denials.
6. Inspect network requests and Vercel runtime logs around `/api/auth/callback/*` and `/` if a redirect loop persists. Record the failing status/stack trace before claiming an exact production root cause.
7. Only after successful browser/E2E and accounting/security review should the stacked PRs be considered for merging. **No production deployment, PR merge, or production migrations were carried out.**

### Migration bookkeeping caveat

The repository has no checked-in Drizzle migration journal even though Neon production records one historical migration. This SQL is **not** a journal entry. Do not blindly run `npm run db:migrate` or deploy auto-migration hooks against an existing database: reconcile the original migration baseline, schema and Drizzle journal first. `npm run db:generate` verifies syntax generation, **not** that the generated SQL is safe to apply over legacy tables.

### Security and money accounting

Managed `neon_auth` identity/session tables are unchanged. Passwords remain in managed Neon Auth. Real fund transfers are never auto-verified. NAV approval, dividends, withdrawals and unit issuance remain disabled and require independently reconciled accounting workflows.
