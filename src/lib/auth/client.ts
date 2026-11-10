"use client";

import { createAuthClient } from "@neon/auth/next";

// Calls our same-origin /api/auth/* proxy, not Neon's database directly.
export const authClient = createAuthClient();
