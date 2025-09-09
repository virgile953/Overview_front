import { createAccount } from "@/models/server/auth";


export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }
    await createAccount(email, password, name);
    return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
} 