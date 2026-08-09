import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const speakingSessions = sqliteTable(
  "speaking_sessions",
  {
    id: text("id").primaryKey(),
    ownerScope: text("owner_scope").notNull(),
    importedAt: text("imported_at").notNull(),
    schemaVersion: text("schema_version").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    contentHash: text("content_hash").notNull(),
    reviewJson: text("review_json").notNull(),
  },
  (table) => [
    uniqueIndex("idx_speaking_sessions_owner_idempotency").on(
      table.ownerScope,
      table.idempotencyKey,
    ),
    uniqueIndex("idx_speaking_sessions_owner_hash").on(
      table.ownerScope,
      table.contentHash,
    ),
    index("idx_speaking_sessions_owner_imported").on(
      table.ownerScope,
      table.importedAt,
    ),
  ],
);
