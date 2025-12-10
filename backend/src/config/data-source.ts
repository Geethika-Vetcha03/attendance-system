import { DataSource } from 'typeorm';

const enableSsl = (() => {
  if (process.env.DATABASE_SSL && process.env.DATABASE_SSL.toLowerCase() === 'true') return true;
  // If DATABASE_URL contains sslmode=require treat as ssl enabled
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')) return true;
  return false;
})();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl: enableSsl ? { rejectUnauthorized: false } : false,
});
