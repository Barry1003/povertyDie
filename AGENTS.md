# Poverty Die — development guidance

This is a **Next.js 16 App Router** app with React 19 and **Tailwind CSS v4**, deployed via Vercel. Do not treat the legacy Figma Make/Vite scaffold as the active runtime.

## Key files

- `src/app/layout.tsx`: root layout and global CSS
- `src/app/page.tsx`: authenticated group dashboard entrypoint
- `src/app/sign-in/page.tsx`: Google login page
- `src/components/google-sign-in.tsx`: Neon Auth social login client UI
- `src/lib/auth/server.ts`: Neon Auth managed server adapter
- `src/lib/auth/client.ts`: Neon browser auth client
- `proxy.ts`: Next.js 16 Neon Auth route protection
- `src/app/api/auth/[...nextauth]/route.ts`: Neon Auth HTTP proxy (historical folder name only)
- `src/lib/auth/authorization.ts`: deprecated stub (email allowlisting removed)
- `src/app/api/me/route.ts`: example authenticated API
- `src/db/schema.ts`: app-only PostgreSQL tables, deliberately excludes managed Neon identity tables
- `src/db/index.ts`: server-only Neon PostgreSQL connection with Drizzle
- `src/lib/avatar.ts`: deterministic member avatar artwork
- `src/App.tsx`: existing dashboard prototype as client component
- `src/data.ts`: sample dashboard financial data — NEVER real balances or holdings
- `src/index.css`: Tailwind import and original visual styling

## Authentication — use Neon Auth only

Use `@neon/auth` (Managed Better Auth) for Google sign-in and session management. Do NOT reintroduce `next-auth`, `@auth/drizzle-adapter`, Google app OAuth secrets in the Vercel environment, or self-hosted Better Auth tables. Neon owns its `neon_auth` schema.

Server session:`const { data: session } = await auth.getSession()`.
Client social login:`await authClient.signIn.social({ provider: "google", callbackURL: "/" })`.
Client sign-out: `await authClient.signOut()`.
The historical `[...nextauth]` folder name does not mean Auth.js is installed.

In production, Google provider configuration belongs in the Neon console. **Google sign-up is open to all email addresses.** Do not add email allowlisting. When live group records are connected, enforce membership and role permissions server-side on every financial query/mutation. Authentication alone is never financial authorization.

## Environment

- `DATABASE_URL` — pooled Neon database URL, server-only
- `NEON_AUTH_BASE_URL` — branch Auth URL, server-only
- `NEON_AUTH_COOKIE_SECRET` — random 32+ character cookie signing secret, server-only

Do not commit environment files, OAuth secrets or database credentials. See `.env.example` and `README.md`.

## Local setup and checks

```sh
npm install
npm run db:generate
npm run db:migrate
npm run typecheck
npm run build
npm run dev
```

This is a draft migration until real Neon/Vercel environment variables are present and Google login, migrations and builds pass. Keep all financial UI labels explicitly demonstrative until migrated to group-scoped live queries. Do not write unaudited investment or contribution mutations.
