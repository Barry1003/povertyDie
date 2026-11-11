import { auth } from "@/lib/auth/server";

// Canonical Neon Auth route. Keep /api/auth/* public URLs unchanged.
// The SDK expects Next.js [...path] params when building the upstream path.
export const runtime = "nodejs";
export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
