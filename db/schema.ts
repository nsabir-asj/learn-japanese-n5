import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const userProgress = sqliteTable('user_progress', {
  userId: text('user_id').primaryKey(),
  revision: integer('revision').notNull().default(0),
  storesJson: text('stores_json').notNull().default('{}'),
  recentMutationIdsJson: text('recent_mutation_ids_json').notNull().default('[]'),
  updatedAt: integer('updated_at').notNull(),
});
