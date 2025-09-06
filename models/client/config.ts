import { Client, Account, Avatars, Databases, Storage } from 'appwrite';
import env from '@/app/env';

export const client = new Client()
  .setEndpoint(env.appwrite.hostUrl)
  .setProject(env.appwrite.projectId)

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);