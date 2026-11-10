// Historical route directory name from the original prototype migration.
// This is the Neon Auth managed proxy, NOT an Auth.js route.
import { auth } from "@/lib/auth/server";

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
export const runtime = "nodejs";
