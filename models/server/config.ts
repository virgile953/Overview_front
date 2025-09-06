import env from '@/app/env';
import { Client, Avatars, Databases, Storage, Users, Account } from 'node-appwrite';

export const client = new Client()
  .setEndpoint(env.appwrite.hostUrl)
  .setProject(env.appwrite.projectId)
  .setKey(env.appwrite.apiKey);

export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);
export const account = new Account(client);
