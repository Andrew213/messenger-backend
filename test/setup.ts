import { config } from 'dotenv';

config({ path: '.env' });
config({ path: '.env.test.local', override: true });
