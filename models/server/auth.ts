import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";
import env from "@/app/env";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(env.appwrite.hostUrl)
    .setProject(env.appwrite.projectId);

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
  const client = new Client()
    .setEndpoint(env.appwrite.hostUrl)
    .setProject(env.appwrite.projectId)

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


