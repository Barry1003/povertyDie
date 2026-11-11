import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deployment readiness check. It never returns environment variable values,
 * connection strings, hostnames, secret lengths, SQL errors, or Neon user data.
 *
 * Auth round-trip still requires a separate real Google sign-in test.
 */
export async function GET() {
  const headers = {
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow",
  };

  const { DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET } = process.env;
  if (!DATABASE_URL || !NEON_AUTH_BASE_URL || !NEON_AUTH_COOKIE_SECRET || NEON_AUTH_COOKIE_SECRET.length < 32) {
    return NextResponse.json({
      status: "configuration_required",
      database: "not_checked",
      neonAuth: "not_checked",
    }, { status: 503, headers });
  }

  try {
    const authUrl = new URL(NEON_AUTH_BASE_URL);
    if (authUrl.protocol !== "https:") throw new Error("Invalid Neon Auth URL");

    const sql = neon(DATABASE_URL);
    const rows = await sql`
      select
        to_regclass('public.groups') is not null as groups_ready,
        to_regclass('public.contributions') is not null as contributions_ready,
        to_regclass('public.custody_assignments') is not null as custody_ready,
        to_regclass('public.valuation_reports') is not null as reports_ready
    `;
    if (rows.length !== 1) throw new Error("Database health check failed");
    const schemaReady = rows[0].groups_ready === true &&
      rows[0].contributions_ready === true &&
      rows[0].custody_ready === true &&
      rows[0].reports_ready === true;

    return NextResponse.json({
      status: schemaReady ? "ready" : "migrations_required",
      database: "reachable",
      schema: schemaReady ? "ready" : "not_ready",
      neonAuth: "configured_not_login_tested",
    }, { status: schemaReady ? 200 : 503, headers });
  } catch {
    // Do not expose driver errors, URLs or credentials to public callers.
    return NextResponse.json({
      status: "unavailable",
      database: "not_verified",
      neonAuth: "configured_not_login_tested",
    }, { status: 503, headers });
  }
}
