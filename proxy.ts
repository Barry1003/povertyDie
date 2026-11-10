import { auth } from "@/lib/auth/server";

// Next.js 16 route protection. Anyone can sign up through Neon Google Auth.
// Signed-out visitors can reach sign-in; other app routes need a session.
export default auth.middleware({
  loginUrl: "/sign-in",
  publicRoutes: ["/sign-in"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.png).*)"],
};
