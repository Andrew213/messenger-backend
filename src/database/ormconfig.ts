import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import * as path from 'path';
import 'dotenv/config';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  schema: 'public',
  logging: true,
  entities: [path.resolve(import.meta.dirname, '../**/*.entity.{ts,js}')],
  migrations: [path.resolve(import.meta.dirname, 'migrations/*.{ts,js}')],
};

export const AppDataSource = new DataSource(dataSourceOptions);
