"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function loginAction(email: string, password: string) {
  try {
    // Get the session from Better Auth on the server
    const session = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    })

    if (session) {
      return { success: true }
    } else {
      throw new Error("Login failed")
    }
  } catch (error) {
    console.error("Server login error:", error)
    throw new Error("Authentication failed")
  }
}

