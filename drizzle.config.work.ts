import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.test' });

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.TEST_DATABASE_URL!,
    },
});
