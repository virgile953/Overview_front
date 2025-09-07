import { verifyEmail } from "@/models/server/auth";
import { account } from "@/models/server/config";
import { NextResponse } from "next/server";



export async function POST() {
  try {
    console.log("verify-mail called");
    const coucou = await verifyEmail();
    console.log(coucou);
    //
    const user = await account.get();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null, error: (error as Error).message }, { status: 401 });
  }
}
