import env from "@/app/env";
import { drizzle } from "drizzle-orm/node-postgres";



const Drizzle = drizzle(env.postgresql.connectionString);

export default Drizzle;