import { getLoggedInUser } from "@/models/server/auth";

import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from "next/server";
type ResponseData = {
  authenticated: boolean
}

export async function POST(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const user = await getLoggedInUser();

  return NextResponse.json({ authenticated: !!user });
}
