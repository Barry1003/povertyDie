import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safe readiness endpoint: never return env values, hostnames, SQL errors,
 * session data, or user records. Checks the schema actually used by Phase 3.
 * An HTTP 200 still does NOT verify OAuth round-trip or financial correctness.
 */
export async function GET() {
  const headers = {
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow",
  };

  const { DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET } = process.env;
  if (!DATABASE_URL || !NEON_AUTH_BASE_URL ||
      !NEON_AUTH_COOKIE_SECRET || NEON_AUTH_COOKIE_SECRET.length < 32) {
    return NextResponse.json({
      status: "configuration_required", database: "not_checked", neonAuth: "not_checked",
    }, { status: 503, headers });
  }

  try {
    const authUrl = new URL(NEON_AUTH_BASE_URL);
    if (authUrl.protocol !== "https:") throw new Error("Invalid auth configuration");

    const sql = neon(DATABASE_URL);
    // to_regclass avoids querying a missing table; information_schema checks
    // catch the less obvious case where a table exists but old columns remain.
    const rows = await sql`
      SELECT
        to_regclass('public.profiles') IS NOT NULL AS profiles_ready,
        to_regclass('public.groups') IS NOT NULL AS groups_ready,
        to_regclass('public.memberships') IS NOT NULL AS memberships_ready,
        to_regclass('public.group_invitations') IS NOT NULL AS invitations_ready,
        to_regclass('public.contributions') IS NOT NULL AS contributions_ready,
        to_regclass('public.contribution_reviews') IS NOT NULL AS reviews_ready,
        to_regclass('public.custody_assignments') IS NOT NULL AS custody_ready,
        to_regclass('public.valuation_reports') IS NOT NULL AS reports_ready,
        to_regclass('public.valuation_events') IS NOT NULL AS valuation_events_ready,
        to_regclass('public.unit_issuances') IS NOT NULL AS unit_issuances_ready,
        (
          SELECT count(*)::integer = 4 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'profiles'
          AND column_name IN ('display_name', 'email', 'username', 'updated_at')
        ) AS profile_columns_ready,
        (
          SELECT count(*)::integer = 4 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'contributions'
          AND column_name IN ('contribution_month', 'payment_reference', 'note', 'review_note')
        ) AS contribution_columns_ready,
        (
          SELECT count(*)::integer = 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'groups'
          AND column_name = 'created_by'
        ) AS group_owner_column_ready
    `;

    if (rows.length !== 1) throw new Error("Unexpected database response");
    const schemaReady = Object.values(rows[0]).every(value => value === true);
    return NextResponse.json({
      status: schemaReady ? "ready" : "migrations_required",
      database: "reachable",
      schema: schemaReady ? "ready" : "not_ready",
      neonAuth: "configured_not_login_tested",
    }, { status: schemaReady ? 200 : 503, headers });
  } catch {
    return NextResponse.json({
      status: "unavailable",
      database: "not_verified",
      neonAuth: "configured_not_login_tested",
    }, { status: 503, headers });
  }
}
