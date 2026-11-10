import { auth } from "@/lib/auth/server";

// Next.js 16 route protection. Signed-out users can reach the login and
// authorization-error pages; the auth proxy itself is handled by Neon.
export default auth.middleware({
  loginUrl: "/sign-in",
  publicRoutes: ["/sign-in", "/not-invited"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.png).*)"],
};
