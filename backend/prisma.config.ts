import { defineConfig } from "prisma/config";
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});