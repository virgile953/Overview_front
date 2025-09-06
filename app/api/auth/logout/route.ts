import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  success: boolean
}

export async function POST(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Remove the session cookie
  const cookieStore = await cookies();
  console.log("Logging out, removing cookie");  
  cookieStore.delete("a_session");
  return NextResponse.json({ success: true });
}
  // res.status(200).json({ success: true }); --- IGNORE ---