# Poverty Die

Next.js App Router + Tailwind CSS v4 + Neon PostgreSQL + Google OAuth (Auth.js).

## Setup

1. Use Node.js 22+ and run `npm install` (Vercel install command is configured for npm while the original Figma `pnpm-lock.yaml` is retained for reference).
2. Copy `.env.example` to `.env.local`, and configure the secrets listed below.
3. In Google Cloud Console, create an OAuth 2.0 **Web application**. Add `http://localhost:3000/api/auth/callback/google` locally and `https://YOUR_DOMAIN/api/auth/callback/google` for production.
4. Run `npm run db:generate` then `npm run db:migrate` using the Neon connection URL (schema creation required before signing in).
5. Run `npm run dev`. Build using `npm run build`.

## Vercel environment variables

- `DATABASE_URL` - Neon pooled PostgreSQL connection string (server only).
- `AUTH_SECRET` - generate with `openssl rand -base64 32`.
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` - from Google Cloud OAuth consent screen + credentials.
- `ALLOWED_EMAILS` - comma-separated list of the friends' verified Google email addresses. **No access is allowed when this list is empty.**

Never prefix secrets with `NEXT_PUBLIC_`, store secrets in source, or commit `.env.local`.

## State of the migration

- Original Figma prototype screens and sample data remain for visual continuity. **Sample amounts are not live bank balances.**
- Access is now guarded by server-side Google OAuth and an email allowlist; member avatar artwork is deterministically derived from each unique Auth.js user ID and persisted in `profiles`.
- Neon schema supports user accounts, profiles, groups, membership roles, contributions and investments. Database migrations must be applied before the app can run.
- The original investment screens still render static sample data and must be wired to authorized Neon queries before handling real contributions or portfolio figures. No payment processing or investment approvals are implemented yet.
- No real financial data must be assumed from the seeded demo dataset.

## Security reminder

Only add invited friends' emails to `ALLOWED_EMAILS`. Access to group financial data must require a group membership row and server-side authorization; the sample UI is **not** a production financial system. Never rely on UI-only role checks.
