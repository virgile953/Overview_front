import { pgTable, uuid, varchar, date } from "drizzle-orm/pg-core"

export const deviceLogs = pgTable("device_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	deviceId: varchar("device_id", { length: 255 }).notNull(),
	level: varchar().notNull(),
	message: varchar({ length: 255 }).notNull(),
	createdAt: date("created_at").defaultNow().notNull(),
});

