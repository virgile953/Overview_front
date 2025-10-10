import {
  createAuthClient
} from "better-auth/react";

import {
  adminClient,
  apiKeyClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  plugins: [
    organizationClient(),
    twoFactorClient(),
    apiKeyClient(),
    adminClient(),
  ],
})

export const signInWithGithub = async () => {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: window.location.origin + "/dashboard",
  })
}

export const {
  signIn,
  signOut,
  signUp,
  useSession
} = authClient;


export type Session = typeof authClient.$Infer.Session