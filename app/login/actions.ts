"use server";
import { account } from "@/models/server/config";
import { cookies } from "next/headers";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cookieStore = await cookies();
  try {
    const session = await account.createEmailPasswordSession(email, password);
    cookieStore.set("a_session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      
    });
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Login failed" };
  }
}