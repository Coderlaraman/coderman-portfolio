import { DatabaseClient } from './types';
import { PrismaDatabaseAdapter } from './prisma-adapter';

// Use Prisma adapter as the database client
export const db: DatabaseClient = new PrismaDatabaseAdapter();

// Export for easy access
export default db;