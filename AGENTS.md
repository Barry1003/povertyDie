# Poverty Die — development guidance

Private friends' investment record app. Runtime: **Next.js 16 App Router**, **React 19**, **Tailwind CSS 4**, **Neon PostgreSQL/Drizzle**, **Neon Auth (managed Google OAuth)**, and selective client-only React Three Fiber.

## Current application

- `src/app/page.tsx` — active, fully server-guarded, Neon-backed group entry.
- `src/components/group/group-setup.tsx` — create group, join with one-use invitation.
- `src/components/group/group-hub.tsx` — live shared dashboard with verified and pending contributions, member summaries and reviewer UI.
- `src/lib/group/security.ts` — Neon Auth session and group-role checks.
- `src/lib/group/queries.ts` — membership-filtered queries returning the active private group, all member totals, and recent claims.
- `src/lib/group/money.ts` — exact money arithmetic (integer kobo).
- `src/db/schema.ts` — member profiles, groups, memberships, invitations, contributions, reviews, investments.
- `src/app/api/groups/**` — create, join, invitation and role assignment.
- `src/app/api/contributions/**` — submit payment claim, independent review.
- `src/components/identity/character-avatar.tsx` — unique deterministic avatar.
- `src/components/3d/**` — decorative lazy WebGL, never accounting data.
- `src/App.tsx`, `src/data.ts` — historical Figma demo **not mounted in the live home page**.

## Security invariants (non-negotiable)

1. Any Google identity can authenticate with Neon Auth, but **sign-in alone never authorizes access to financial records**. Every read/write is scoped to a verified group membership.
2. A single-use invite is random, SHA-256 hashed in DB, expires in seven days, consumed atomically.
3. A user belongs to exactly one private group in this initial MVP.
4. Role changes and invitation creation require a group `admin`.
5. A `reviewer` or `admin` may verify **other** members' submitted claims only. Review must follow independent inspection of the receiving bank records. Every review has an immutable audit entry.
6. `submitted` amount is not cash received. Only `verified` claims count in contribution totals.
7. Never conflate contributions with portfolio valuation, earnings, distributions, or ownership units. The latter **are not implemented**.
8. Never use JavaScript floating-point arithmetic for money. PostgreSQL NUMERIC(18,2), string decimals and bigint integer kobo only.
9. No API endpoint may trust a client-supplied userId, role or membership. Rely on server Neon session and database checks.
10. No Google OAuth client secrets are needed in Vercel; Neon handles Google login. Do not install Auth.js, Clerk or self-host Better Auth.

## Local testing

```bash
npm install
npm run db:generate
npm run db:migrate
npm test
npm run typecheck
npm run build
npm run dev
```

Database migrations require real Neon and must be reviewed before execution. Front-end compilation in CI uses dummy non-functional environment values. Never claim actual bank verification or end-to-end database tests on a CI build alone. See `docs/phase-2-live-groups.md` and `README.md`.

Environment: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` (server-only). The owner handles Vercel; do not alter its live deployment without their instruction.

## Authentication status

Google OAuth and email/password authentication are owned by managed Neon Auth. The app stores unique username profile handles but does not validate account passwords or expose a public username-to-email mapping. A native managed Neon username/password feature must be verified before enabling that login method. Neon Auth settings and verification mail are configured in Neon; Vercel Production and Preview environment variables are separate. Do not paste secrets into issues or logs.
