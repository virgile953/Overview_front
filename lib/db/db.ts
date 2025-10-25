import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { groups, groupUsers, groupDevices, users, devices } from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const Drizzle = drizzle(pool, { schema: { groups, groupUsers, groupDevices, users, devices } });
// const Drizzle = drizzle(pool);

export default Drizzle;