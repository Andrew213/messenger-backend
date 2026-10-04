import * as path from 'path';
import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

import appConfig from '../config/app.config.js';

const { db } = appConfig();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: db.host,
  port: Number(db.port || 5432),
  username: db.username,
  password: db.password,
  database: db.database,
  schema: 'public',
  logging: true,
  entities: [path.resolve(import.meta.dirname, '../**/*.entity.{ts,js}')],
  migrations: [path.resolve(import.meta.dirname, 'migrations/*.{ts,js}')],
};

export const AppDataSource = new DataSource(dataSourceOptions);
