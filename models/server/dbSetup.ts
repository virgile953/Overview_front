// import { db } from '../name';
// import createDeviceCollection from './device.collection';
// import { databases } from './config';

// export async function getOrCreateDB() {
//   try {
//     await databases.get(db);
//   } catch (error) {
//     console.log(error);
//     try {
//       await databases.create(db, db);
//       await Promise.all([
//         createDeviceCollection()
//        ]);
//     } catch (createError) {
//     }
//   }
//   return databases;
// }