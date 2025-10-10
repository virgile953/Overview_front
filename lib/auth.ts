import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import Drizzle from "./db/db";
import { nextCookies } from "better-auth/next-js";
import { organization, apiKey, twoFactor } from "better-auth/plugins";

import * as schema from "@/drizzle/schema";

export const auth = betterAuth({
  database: drizzleAdapter(Drizzle, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 5, // 5 hour
    }
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    organization(),
    twoFactor(),
    apiKey(),
    nextCookies()]
});

export type Session = typeof auth.$Infer.Session