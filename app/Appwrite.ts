import { Client, Account } from 'appwrite';
export const client = new Client();

client
  .setEndpoint('https://appwrite.overview.management/v1')
  .setProject('68b9f55700013c2cc550');


export const account = new Account(client);
export { ID } from 'appwrite';