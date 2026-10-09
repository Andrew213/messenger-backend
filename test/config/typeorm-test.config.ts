import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from '@/database/ormconfig.js';

if (
  dataSourceOptions.database !== 'messenger_test' ||
  dataSourceOptions.username !== 'messenger_test_user'
) {
  throw new Error('Invalid test database configuration');
}

export const TestDB: DynamicModule = TypeOrmModule.forRoot({
  ...dataSourceOptions,
  migrations: [],
  autoLoadEntities: true,
  migrationsRun: false,
  synchronize: false,
  dropSchema: false,
  retryAttempts: 0,
});
