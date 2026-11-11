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
    const rows = await sql`select 1 as ready`;
    if (rows.length !== 1 || rows[0]?.ready !== 1) throw new Error("Database health check failed");

    return NextResponse.json({
      status: "ready",
      database: "reachable",
      neonAuth: "configured_not_login_tested",
    }, { status: 200, headers });
  } catch {
    // Do not expose driver errors, URLs or credentials to public callers.
    return NextResponse.json({
      status: "unavailable",
      database: "not_verified",
      neonAuth: "configured_not_login_tested",
    }, { status: 503, headers });
  }
}
