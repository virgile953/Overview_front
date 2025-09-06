import { db } from '../name';
import createDeviceCollection from './device.collection';
import { databases } from './config';

export async function getOrCreateDB() {
  try {
    await databases.get(db);
    console.log(`Database '${db}' connected.`);
  } catch (error) {
    console.log(error);
    try {
      await databases.create(db, db);
      console.log(`Database '${db}' created.`);
      await Promise.all([
        createDeviceCollection()
       ]);
    } catch (createError) {
      console.error("Error creating database:", createError);
    }
  }
  return databases;
}