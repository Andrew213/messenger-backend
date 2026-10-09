import * as path from 'path';
import { DataSource } from 'typeorm';
import type { PostgresDataSourceOptions } from 'typeorm/driver/postgres/PostgresDataSourceOptions.js';

import { PhoneVerification } from '../auth/entities/phone-verification.entity.js';
import appConfig from '../config/app.config.js';
import { Session } from '../sessions/entities/session.entity.js';
import { User } from '../users/entities/user.entity.js';

const { db } = appConfig();

export const dataSourceOptions: PostgresDataSourceOptions = {
  type: 'postgres',
  host: db.host,
  port: Number(db.port || 5432),
  username: db.username,
  password: db.password,
  database: db.database,
  schema: 'public',
  logging: true,
  entities: [User, Session, PhoneVerification],

  // entities: [path.resolve(import.meta.dirname, '../**/*.entity.{ts,js}')],
  migrations: [path.resolve(import.meta.dirname, 'migrations/*.{ts,js}')],
};

export const AppDataSource = new DataSource(dataSourceOptions);
