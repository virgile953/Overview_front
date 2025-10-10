import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.PG_STRING!,
});

const Drizzle = drizzle(pool);

export default Drizzle;