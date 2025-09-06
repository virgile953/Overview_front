import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST( ) {
  // Remove the session cookie
  const cookieStore = await cookies();
  console.log("Logging out, removing cookie");  
  cookieStore.delete("a_session");
  return NextResponse.json({ success: true });
}