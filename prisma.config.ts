// prisma.config.ts

import { defineConfig, env } from 'prisma/config';
import 'dotenv/config'; // Ensures .env file is loaded for the CLI

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    // You may need to specify your migrations path here
    seed: 'prisma/seed.ts',
    path: 'prisma/migrations', 
  },
  // The database URL is now configured here for CLI commands
  datasource: {
    url: env('DATABASE_URL'),
  },
});