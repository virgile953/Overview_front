import { pgTable, index, primaryKey, uuid, text, timestamp, integer } from "drizzle-orm/pg-core"

export const deviceLogs = pgTable("device_logs", {
	id: uuid().defaultRandom().notNull(),
	deviceId: text("device_id").notNull(),
	level: text().notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	latency: integer().notNull(),
}, (table) => [
	index("device_logs_created_at_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	primaryKey({ columns: [table.id, table.createdAt], name: "device_logs_pkey"}),
]);
