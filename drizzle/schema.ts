import { pgTable, index, foreignKey, uuid, text, timestamp, integer, unique, boolean, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const groups = pgTable("groups", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	name: text().notNull(),
	localisation: text().notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("groups_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("groups_org_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "groups_organization_id_organization_id_fk"
		}).onDelete("cascade"),
]);

export const groupDevices = pgTable("group_devices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	groupId: uuid("group_id").notNull(),
	deviceId: uuid("device_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("group_devices_device_idx").using("btree", table.deviceId.asc().nullsLast().op("uuid_ops")),
	index("group_devices_group_idx").using("btree", table.groupId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.deviceId],
			foreignColumns: [devices.id],
			name: "group_devices_device_id_devices_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [groups.id],
			name: "group_devices_group_id_groups_id_fk"
		}).onDelete("cascade"),
]);

export const groupUsers = pgTable("group_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	groupId: uuid("group_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("group_users_group_idx").using("btree", table.groupId.asc().nullsLast().op("uuid_ops")),
	index("group_users_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [groups.id],
			name: "group_users_group_id_groups_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "group_users_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	name: text().notNull(),
	lastName: text("last_name").notNull(),
	email: text().notNull(),
	function: text().notNull(),
	service: text().notNull(),
	title: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("users_org_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "users_organization_id_organization_id_fk"
		}).onDelete("cascade"),
]);

export const emailTemplates = pgTable("email_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	groupId: uuid("group_id"),
	name: text().notNull(),
	type: text().notNull(),
	subject: text().notNull(),
	html: text().notNull(),
	nReminder: integer("n_reminder"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("email_templates_group_idx").using("btree", table.groupId.asc().nullsLast().op("uuid_ops")),
	index("email_templates_org_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	index("email_templates_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [groups.id],
			name: "email_templates_group_id_groups_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "email_templates_organization_id_organization_id_fk"
		}).onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const twoFactor = pgTable("two_factor", {
	id: text().primaryKey().notNull(),
	secret: text().notNull(),
	backupCodes: text("backup_codes").notNull(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "two_factor_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const devices = pgTable("devices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	status: text().notNull(),
	location: text().notNull(),
	ipAddress: text("ip_address").notNull(),
	macAddress: text("mac_address").notNull(),
	serialNumber: text("serial_number").notNull(),
	firmwareVersion: text("firmware_version").notNull(),
	lastActive: timestamp("last_active", { mode: 'string' }).notNull(),
	organizationId: text("organization_id").notNull(),
}, (table) => [
	index("devices_id_idx").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
	index("devices_ip_idx").using("btree", table.ipAddress.asc().nullsLast().op("text_ops")),
	index("devices_mac_idx").using("btree", table.macAddress.asc().nullsLast().op("text_ops")),
	index("devices_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("devices_org_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	index("devices_serial_idx").using("btree", table.serialNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "devices_organization_id_organization_id_fk"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	twoFactorEnabled: boolean("two_factor_enabled").default(false),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const apikey = pgTable("apikey", {
	id: text().primaryKey().notNull(),
	name: text(),
	start: text(),
	prefix: text(),
	key: text().notNull(),
	userId: text("user_id").notNull(),
	refillInterval: integer("refill_interval"),
	refillAmount: integer("refill_amount"),
	lastRefillAt: timestamp("last_refill_at", { mode: 'string' }),
	enabled: boolean().default(true),
	rateLimitEnabled: boolean("rate_limit_enabled").default(true),
	rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
	rateLimitMax: integer("rate_limit_max").default(10),
	requestCount: integer("request_count").default(0),
	remaining: integer(),
	lastRequest: timestamp("last_request", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	permissions: text(),
	metadata: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "apikey_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const organization = pgTable("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	metadata: text(),
}, (table) => [
	unique("organization_slug_unique").on(table.slug),
]);

export const invitation = pgTable("invitation", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	email: text().notNull(),
	role: text(),
	status: text().default('pending').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	inviterId: text("inviter_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [user.id],
			name: "invitation_inviter_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "invitation_organization_id_organization_id_fk"
		}).onDelete("cascade"),
]);

export const member = pgTable("member", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	userId: text("user_id").notNull(),
	role: text().default('member').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "member_organization_id_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "member_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
	activeOrganizationId: text("active_organization_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

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
