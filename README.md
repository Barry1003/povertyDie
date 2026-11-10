# Poverty Die

A private wealth collective built with **Next.js App Router**, **Tailwind CSS v4**, **Neon PostgreSQL + Drizzle**, and **Neon Auth (Managed Better Auth)**.

## Architecture

- Next.js 16 (React 19) renders the dashboard, with server-only APIs and queries.
- Neon Auth handles Google sign-in and sessions. Its identity tables live in Neon's managed `neon_auth` schema.
- App-specific tables (`profiles`, `groups`, `memberships`, `contributions`, `investments`) are maintained through Drizzle in the public schema. Do **not** run Auth.js migrations or recreate managed auth tables.
- Each approved member receives a stable avatar seeded from the unique Neon Auth user ID. It stays the same across devices.
- `ALLOWED_EMAILS` is a fail-closed app access gate; a valid Google login alone does not authorize access to financial pages. For production, every group-specific query and mutation must also validate membership and role.

## Neon + Vercel prerequisites

1. Create a Neon PostgreSQL database, preferably in an AWS region supporting Neon Auth.
2. Enable **Neon Auth / Managed Better Auth** for the SAME Neon branch as your database. Enable the Google social provider in Neon Console.
3. Add `http://localhost:3000` and your eventual Vercel production domain to the branch's **trusted domains**.
4. Copy the branch's **Auth URL** and the database's **pooled PostgreSQL connection string**.
5. Add the environment variables below in Vercel and your local `.env.local`. Do not commit secrets.
6. For development Neon may provide shared Google OAuth credentials. For production you may need your own Google OAuth application **configured inside Neon**, not in Vercel app environment variables (follow Neon's production checklist).
7. Generate and apply Drizzle migrations before first use.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Server-only pooled PostgreSQL URL from Neon |
| `NEON_AUTH_BASE_URL` | Yes | Neon managed Auth URL for the same database branch |
| `NEON_AUTH_COOKIE_SECRET` | Yes | Next.js session-cache cookie signing, 32+ random characters |
| `ALLOWED_EMAILS` | Yes | Comma-separated verified Google emails approved to enter the private group |

Generate the cookie secret with `openssl rand -base64 32`.

**No `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`, or separate Auth.js provider is needed.** Authentication is delegated to Neon.

## Run locally

Requires Node 22+.

```bash
npm install
cp .env.example .env.local
# Fill in real values in .env.local
npm run db:generate
npm run db:migrate
npm run typecheck
npm run dev
```

Open http://localhost:3000 and use an approved Google account.

For Vercel, `npm run build` is configured. The old `pnpm-lock.yaml` and Figma/Vite scaffold files are retained for reference but unused by the Next.js runtime. The `vercel.json` install command uses npm.

## Migration status

- The Next.js app, Neon Auth handler, proxy, server-side session guard, Google sign-in button, sign-out action, and avatar persistence are implemented.
- Existing Figma dashboard screens retain **sample data only**; no real payment, earnings, holdings, verification, or ledger operations are wired yet.
- The database schema is ready for the next stage; no real financial records have been imported.
- The `/api/me` endpoint returns only the authenticated, allowlisted user's profile and group roles.
- The `src/app/api/auth/[...nextauth]` directory retains a historical filename, but runs a **Neon Auth** handler. It does NOT use `next-auth`.
- Server-side role, group authorization and accounting/investment rules still need implementing before any live financial activity.

The project is in a **draft pull request** until `npm install`, `npm run typecheck`, `npm run build`, Google login and database migrations are tested with configured Neon services.

## Security

The access gate intentionally fails closed when `ALLOWED_EMAILS` is empty. Neon Auth itself may still create an identity for a Google account before this app decides whether that identity is allowed in Poverty Die. An identity is not a group membership. Never assume sign-in alone grants visibility into another user's contributions or investments.
