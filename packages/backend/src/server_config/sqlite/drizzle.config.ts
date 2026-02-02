import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/server_config/sqlite/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data_db/database.sqlite',
  },
});

