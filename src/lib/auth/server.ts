import { createNeonAuth } from "@neon/auth/next/server";

// Neon manages the actual OAuth exchange and identity tables for this branch.
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
