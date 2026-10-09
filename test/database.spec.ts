import { DataSource } from 'typeorm';
import { describe, expect, it } from 'vitest';

import { PhoneVerification } from '@/auth/entities/phone-verification.entity.js';
import { Session } from '@/sessions/entities/session.entity.js';
import { User } from '@/users/entities/user.entity.js';

import { dataSourceOptions } from '../src/database/ormconfig.js';

describe('Test database connection', () => {
  it('should connect to messenger_test', async () => {
    expect(dataSourceOptions.database).toBe('messenger_test');

    const dataSource = new DataSource({
      ...dataSourceOptions,
      entities: [User, Session, PhoneVerification],
      migrations: [],
    });

    try {
      await dataSource.initialize();

      const result: { database: string; username: string }[] =
        await dataSource.query(
          `SELECT
            current_database() AS database,
            current_user AS username
          `,
        );

      expect(result[0].database).toBe('messenger_test');
      expect(result[0].username).toBe('messenger_test_user');
    } finally {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
  });
});
