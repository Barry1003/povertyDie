import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

/**
 * Neon Auth expects { params: Promise<{ path: string[] }> }.
 * The earlier migration named this catch-all directory [...nextauth],
 * which Next.js 16 generates as { nextauth: string[] }.
 * Adapt the parameter without changing public /api/auth/* URLs.
 */
type RouteContext = { params: Promise<{ nextauth: string[] }> };

function neonContext(context: RouteContext) {
  return {
    params: context.params.then(({ nextauth }) => ({ path: nextauth })),
  };
}

const handlers = auth.handler();

export function GET(request: NextRequest, context: RouteContext) {
  return handlers.GET(request, neonContext(context));
}
export function POST(request: NextRequest, context: RouteContext) {
  return handlers.POST(request, neonContext(context));
}
export function PUT(request: NextRequest, context: RouteContext) {
  return handlers.PUT(request, neonContext(context));
}
export function DELETE(request: NextRequest, context: RouteContext) {
  return handlers.DELETE(request, neonContext(context));
}
export function PATCH(request: NextRequest, context: RouteContext) {
  return handlers.PATCH(request, neonContext(context));
}
