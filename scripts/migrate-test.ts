import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({ path: '.env' });
config({ path: '.env.test.local', override: true });

if (process.env.POSTGRES_DB !== 'messenger_test') {
  throw new Error('Refusing migrations outside test database');
}

async function main() {
  const { dataSourceOptions } = await import('../src/database/ormconfig.js');

  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [],
  });

  try {
    await dataSource.initialize();

    const [{ database }] = await dataSource.query<{ database: string }[]>(
      'SELECT current_database() AS database',
    );

    if (database !== 'messenger_test') {
      throw new Error(`Unsafe database: ${database}`);
    }

    await dataSource.runMigrations();
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
