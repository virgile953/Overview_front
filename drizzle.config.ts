import { defineConfig } from 'drizzle-kit';
import env from './app/env';

export default defineConfig({
  out: './drizzle',
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.postgresql.connectionString,

  },
});
