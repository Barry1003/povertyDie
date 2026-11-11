# Phase 3: Valuation & unit-ownership foundation

This phase is built **on top of** Phase 2's unmerged `feat/live-group-contributions` branch. It is not yet a live investment accounting system.

## Implemented

- Pure fixed-precision ownership-unit calculator: `src/lib/accounting/units.ts`.
- Test scenarios: founding issuance, late joining after a gain, losses, neutrality of new capital, fees/liabilities, ineligible claims, 8-decimal issuance rounding, zero or insolvent NAV.
- Month-by-month rotating custodian selection: `src/lib/accounting/custody.ts`.
- `custody_assignments`, `valuation_reports`, `valuation_events` and `unit_issuances` schema.
- Admin-only, rotation-based scheduling for current or following month.
- Custodian-only monthly report submission with cash, liabilities, asset mark-to-market values, source-currency/evidence references and external FX evidence for non-NGN assets.
- A shared Custody & reports tab. **Submitted figures are not shown as official group NAV, cash balances, profits or ownership.**
- Safe `GET /api/health` endpoint to check whether the Vercel deployment has the required env configuration and can execute `SELECT 1` on Neon. The response NEVER includes secrets or connection strings.

## Financial logic (preview only)

1. A bank-transfer *claim* must be independently marked `verified` first. Submitted claims are ineligible.
2. Custodian supplies a report with externally reconciled cash, investment values expressed in NGN, and liabilities. A missing or unverifiable FX quote is not acceptable.
3. Calculate `NAV = cash + sum(asset fair values) - liabilities`.
4. Eligible new, **not yet unitized**, verified contributions are included in confirmed cash. Before issuing units, deduct their amount to obtain **pre-money NAV**. If confirmed cash is insufficient to cover those deposits, stop.
5. Existing units are valued at `pre-money NAV / existing units`. New verified capital buys units at that price, so depositing cash cannot mechanically generate profits or dilute earlier members.
6. The first issuance uses a configurable future policy, presently illustrated at a **test default** of ₦1,000 per unit; founding pre-money NAV must be zero.
7. Unit quantities are integers representing 1e-8 units. Issuance always **rounds down**, never above a member's subscription value. Pricing is computed from rational BigInt ratios. Formatting to six decimal price places is for display only.
8. Post-money NAV is divided by total issued units for an informational closing price. Member unrealized gain is `attributed value - recorded unit cost basis`, with distributions and withdrawals omitted until the missing ledger exists.
9. For fair financial accounting, payout/distribution events, realized proceeds, transaction fees, corrections and withdrawals must be added in a future audited ledger. Without these, don't present unrealized gain as total investment earnings.

## Why this is not yet approved NAV

`valuation_reports` are stored as submitted-only records. There is intentionally **no public approval route** for NAV or unit issuance. The existence of `valuation_events` and `unit_issuances` tables does not mean they are populated.

An accounting approval must use a genuine database transaction with concurrency protection, unique/replay guards, a cut-off for verified/unissued contributions, bank reconciliation evidence, independent reviewer identity, and historical versioning. The current UI displays "not calculated" until that phase is complete.

Multiple currencies: custodians can report values in USD, GBP, EUR or other currencies but must also provide a manual NGN-equivalent value and dated FX-quote reference. These values are **unapproved** and should not be used to issue units until an independent reviewer validates conversion and source.

Do not derive investment profit from contribution totals.

## How the Vercel owner can verify configuration

The project owner manages Vercel. Set the three **server-only** environment variables for **Preview and Production** as appropriate:
- `DATABASE_URL`: pooled Neon Postgres connection string.
- `NEON_AUTH_BASE_URL`: Neon Auth URL for the **same branch**.
- `NEON_AUTH_COOKIE_SECRET`: random secret at least 32 characters.

Do **not** add `NEXT_PUBLIC_` to any of these. Do not paste their values into chat, screenshots, issues, or GitHub.

After saving variables, **redeploy** the relevant Vercel environment. Use `vercel env ls preview` / `vercel env ls production` to check configured names.

Once the feature branch is deployed as a preview (or PRs merged to main and redeployed), visit:

```text
https://YOUR-VERCEL-DOMAIN/api/health
```

- HTTP 200 `{"status":"ready","database":"reachable","schema":"ready","neonAuth":"configured_not_login_tested"}`: configuration present; Neon connection succeeds and the required application tables exist.
- HTTP 503 `{"status":"configuration_required", ...}`: at least one required setting is missing or invalid.
- HTTP 503 `{"status":"migrations_required","database":"reachable","schema":"not_ready", ...}`: Neon is reachable but the required group/custody tables are not installed yet. Review and apply migrations against the correct database branch.
- HTTP 503 `{"status":"unavailable", ...}`: connection or Auth base URL verification failed.

**A 200 health response does not prove Google login works, the required schema has been migrated, or any financial records are correct.** Test real Google sign-in and friend-to-friend access separately. This endpoint deliberately omits environment values and SQL errors.

## Required verification before any use with real money

- Review the generated Drizzle SQL against your existing Neon schema; **do not apply destructive migrations automatically**.
- Run `npm test`, `npm run typecheck`, `npm run db:generate`, `npm run build`.
- Test scheduling with admin/non-admin, member joins, concurrent assignment attempts, and year boundaries.
- Test report submissions with scheduled and unauthorized custodians, duplicate periods, zero and foreign-currency marks.
- Reconcile manual custody report against actual bank and broker evidence, including FX conversions.
- Implement/verify atomic approval and immutable cash/unit ledger before activating NAV or earnings.
- Perform real multi-user Google sign-in and group privacy tests, mobile and reduced-motion checks.
