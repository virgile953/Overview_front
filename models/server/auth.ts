import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";
import env from "@/app/env";

const client = new Client()
  .setEndpoint(env.appwrite.hostUrl)
  .setProject(env.appwrite.projectId)

export async function createSessionClient() {
  const cookieStore = await cookies();
  const session = cookieStore.get("a_session");
  if (!session || !session.value) {
    return null;
  }

  // Use the session secret
  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function login() {
  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function getLoggedInUser() {
  try {
    const sessionClient = await createSessionClient();
    if (!sessionClient) {
      return null;
    }
    const { account } = sessionClient;
    return await account.get();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function verifyEmail() {
  try {
    const sessionClient = await createSessionClient();
    if (!sessionClient) {
      return { status: "no session" };
    }
    const { account } = sessionClient;
    const promise = await account.createVerification(env.appwrite.emailUrl);
    console.log("verification promise created");
    return { status: "ok", promise };
  } catch (error) {
    console.log(error);
    return { status: "error" };
  }

}

export async function createAccount(email: string, password: string, name: string) {
  try {
    const { account } = await login();
    return await account.create("unique()", email, password, name);
  } catch (error) {
    console.log(error);
    throw error;
  }
}


