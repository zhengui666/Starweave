import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const boards = sqliteTable('boards', {
 userId: text('user_id').primaryKey(),
 state: text('state').notNull(),
 revision: integer('revision').notNull().default(1),
});
