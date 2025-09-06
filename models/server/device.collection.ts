import { Permission } from 'node-appwrite';
import { db, deviceCollection } from '../name';
import { databases } from './config';

export default async function createDeviceCollection() {

  //creating the table
  await databases.createCollection(db, deviceCollection, deviceCollection, [
    Permission.read("any"),
    Permission.read("users"),
    Permission.create("users"),
    Permission.update("users"),
    Permission.delete("users"),
  ]);
  console.log(`Collection '${deviceCollection}' created successfully.`);

  await Promise.all([
    databases.createStringAttribute(db, deviceCollection, 'name', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'type', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'status', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'location', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'ipAddress', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'macAddress', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'serialNumber', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'firmwareVersion', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'lastActive', 255, true),
    databases.createStringAttribute(db, deviceCollection, 'ownerId', 255, true),
  ]);
  console.log(`Attributes for collection '${deviceCollection}' created successfully.`);

}