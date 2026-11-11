# Poverty Die

A small, private investment group for friends. **Next.js 16, React 19, Tailwind CSS v4, Neon PostgreSQL + Drizzle, Neon Auth (Managed Better Auth)**, and optional Three.js/React Three Fiber visuals.

## What the live app does

- Google and email/password sign-in are managed by Neon Auth. Authentication alone **cannot read another group's financial data**.
- An authenticated person can create their first group and becomes its admin.
- The admin can issue a cryptographically random, one-time invite link (expires in seven days). Each friend signs in with Google or email/password and redeems an invitation to join the same group.
- All group members share a **single live overview and contribution register** with member avatars, verified contributions, and submitted amounts awaiting verification.
- A member submits a manual transfer reference and amount. The claim remains **pending** until another authorized person checks the receiving account outside the app and records a review.
- The admin can appoint reviewers. A reviewer or admin **cannot verify their own claim**.
- Group financial information is derived from database records, **not** the old Figma sample dataset. Money is stored as Postgres NUMERIC, calculated in integer kobo, and never silently treated as verified after a form submission.
- The active home page uses `GroupHub`/`GroupSetup`. The old `src/App.tsx` is retained as an **unused design reference**, not the live financial dashboard.

## Required environment

Configure in your local `.env.local` and your own Vercel project; never put secrets into GitHub.

| Name | Source |
| --- | --- |
| `DATABASE_URL` | Neon pooled PostgreSQL connection string |
| `NEON_AUTH_BASE_URL` | Branch-specific Neon Auth URL |
| `NEON_AUTH_COOKIE_SECRET` | Random secret of 32+ characters, e.g. `openssl rand -base64 32` |

Google OAuth credentials are managed by **Neon Auth**; do not add Auth.js or app-level `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`. Enable the Google provider and trusted development / production domains in Neon.

Neon Auth's identity tables are managed in the `neon_auth` schema; Drizzle only creates our application tables. Use the database and Auth URL from the **same Neon branch**.

## Authentication and deployment notes

- Google, email/password registration and login, and password recovery use Neon Auth.
- Unique user handles are saved in the app's profile records. Username/password login is not enabled: the managed Neon Auth client must natively support this before it can be offered.
- Set the necessary environment variable names in both **Production** and **Preview** when deploying feature branches. Existing deployment environments do not inherit newly added variables; redeploy.
- Configure trusted domains and email/password settings in Neon Auth. Production may require its own Google OAuth credentials and email provider configured within Neon.
- The feature branch's /api/health route checks database connectivity and required app tables; it cannot validate a complete Google or email login flow.
## Local run / database setup

Use Node.js 22+.

```bash
npm install
cp .env.example .env.local
# Put your real Neon connection URL and Auth values in .env.local.
npm run db:generate
npm run db:migrate
npm test
npm run typecheck
npm run build
npm run dev
```

Open http://localhost:3000. An initial signed-in account can create the group and invite friends. **Apply migrations before signing in**, since profile creation requires the app tables.

Important: migration generation uses `drizzle.config.ts` and creates files under `drizzle/`. Review the generated SQL against the target Neon branch before applying, particularly if any previous prototype tables already exist; don't use destructive resets. We have not applied migrations to a live Neon project from this repository.

## Live group rules

- Each person belongs to **one group** in this MVP. All group finance endpoints require an authenticated user and membership in that exact group.
- Any authenticated account without a private invitation sees only the create/join screen.
- Group admins manage invitations and appoint independent reviewers.
- Submitted payment claims have a status `submitted`, `verified` or `rejected`, with an audit record for each review.
- Verified contribution totals include only `verified` records. Submitted and rejected transfers are excluded.
- The app does **not** transfer money or independently confirm bank transactions. The verification button is a manual attestation after comparing against bank records.
- **Investment earnings, ownership units, NAV, distributions and withdrawals are not implemented.** We intentionally show “Not calculated yet” instead of fictitious returns.

## Relevant code

| Purpose | File |
| --- | --- |
| Dashboard entry | `src/app/page.tsx` |
| Shared live group UI | `src/components/group/group-hub.tsx` |
| First group / joining | `src/components/group/group-setup.tsx` |
| Schema | `src/db/schema.ts` |
| Session, authorization | `src/lib/group/security.ts` |
| Member totals & history | `src/lib/group/queries.ts` |
| Exact NGN arithmetic | `src/lib/group/money.ts` |
| Group/invite/join endpoints | `src/app/api/groups/` |
| Submit and review endpoints | `src/app/api/contributions/` |
| Character avatars | `src/components/identity/character-avatar.tsx` |
| 3D artwork | `src/components/3d/` |
| Tests | `tests/money.test.ts` |

See `docs/phase-2-live-groups.md` for permissions, data invariants, manual QA, and known limitations.

## Security / launch status

The code and automated checks can be evaluated in GitHub, but **live Neon migrations, cross-account authentication, CSRF/origin checks, and the manual verification flow must be tested end-to-end** before letting anyone record actual transfers. Next phases: proper investment valuations and member unit accounting, receipt evidence, reconciliation/exports, transaction corrections, group governance, and security review.

Old Vite/Figma files remain for reference but are not used at runtime. Vercel setup is managed separately by the project owner.
