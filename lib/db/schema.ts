import { pgTable, index, primaryKey, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"

export const deviceLogs = pgTable("device_logs", {
	id: uuid().defaultRandom().notNull(),
	deviceId: text("device_id").notNull(),
	level: text().notNull(),
	message: text().notNull(),
	latency: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("device_logs_created_at_idx").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	primaryKey({ columns: [table.id, table.createdAt], name: "device_logs_pkey" }),
]);


export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	twoFactorEnabled: boolean("two_factor_enabled").default(false),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	activeOrganizationId: text("active_organization_id"),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at").notNull(),
	metadata: text("metadata"),
});

export const member = pgTable("member", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	role: text("role").default("member").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").default("pending").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	inviterId: text("inviter_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const twoFactor = pgTable("two_factor", {
	id: text("id").primaryKey(),
	secret: text("secret").notNull(),
	backupCodes: text("backup_codes").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const apikey = pgTable("apikey", {
	id: text("id").primaryKey(),
	name: text("name"),
	start: text("start"),
	prefix: text("prefix"),
	key: text("key").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	refillInterval: integer("refill_interval"),
	refillAmount: integer("refill_amount"),
	lastRefillAt: timestamp("last_refill_at"),
	enabled: boolean("enabled").default(true),
	rateLimitEnabled: boolean("rate_limit_enabled").default(true),
	rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
	rateLimitMax: integer("rate_limit_max").default(10),
	requestCount: integer("request_count").default(0),
	remaining: integer("remaining"),
	lastRequest: timestamp("last_request"),
	expiresAt: timestamp("expires_at"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	permissions: text("permissions"),
	metadata: text("metadata"),
});

export const devicesTable = pgTable('devices', {
	id: uuid('id').primaryKey().defaultRandom(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	name: text('name').notNull(),
	type: text('type').notNull(),
	status: text('status').notNull(),
	location: text('location').notNull(),
	ipAddress: text('ip_address').notNull(),
	macAddress: text('mac_address').notNull(),
	serialNumber: text('serial_number').notNull(),
	firmwareVersion: text('firmware_version').notNull(),
	lastActive: timestamp('last_active').notNull(),
}
	, (table) => [
		index('devices_org_idx').using('btree', table.organizationId),
		index('devices_id_idx').using('btree', table.id),
		index('devices_mac_idx').using('btree', table.macAddress),
		index('devices_name_idx').using('btree', table.name),
		index('devices_serial_idx').using('btree', table.serialNumber),
		index('devices_ip_idx').using('btree', table.ipAddress),
	]);

export type Device = typeof devicesTable.$inferSelect;
export type NewDevice = typeof devicesTable.$inferInsert;