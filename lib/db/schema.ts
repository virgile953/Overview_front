import { pgTable, index, primaryKey, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

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

export const devices = pgTable('devices', {
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
	lastActive: timestamp('last_active', { mode: "date" }).notNull(),
}, (table) => [
	index('devices_org_idx').using('btree', table.organizationId),
	index('devices_id_idx').using('btree', table.id),
	index('devices_mac_idx').using('btree', table.macAddress),
	index('devices_name_idx').using('btree', table.name),
	index('devices_serial_idx').using('btree', table.serialNumber),
	index('devices_ip_idx').using('btree', table.ipAddress),
]);

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	name: text('name').notNull(),
	lastName: text('last_name').notNull(),
	email: text('email').notNull(),
	function: text('function').notNull(),
	service: text('service').notNull(),
	title: text('title'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
}, (table) => [
	index('users_org_idx').using('btree', table.organizationId),
	index('users_email_idx').using('btree', table.email),
	index('users_name_idx').using('btree', table.name),
]);

export const groups = pgTable('groups', {
	id: uuid('id').primaryKey().defaultRandom(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	name: text('name').notNull(),
	localisation: text('localisation').notNull(),
	description: text('description').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
}, (table) => [
	index('groups_org_idx').using('btree', table.organizationId),
	index('groups_name_idx').using('btree', table.name),
]);

// Many-to-many relationship between groups and users
export const groupUsers = pgTable('group_users', {
	id: uuid('id').primaryKey().defaultRandom(),
	groupId: uuid('group_id')
		.notNull()
		.references(() => groups.id, { onDelete: "cascade" }),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
	index('group_users_group_idx').using('btree', table.groupId),
	index('group_users_user_idx').using('btree', table.userId),
]);

// Many-to-many relationship between groups and devices
export const groupDevices = pgTable('group_devices', {
	id: uuid('id').primaryKey().defaultRandom(),
	groupId: uuid('group_id')
		.notNull()
		.references(() => groups.id, { onDelete: "cascade" }),
	deviceId: uuid('device_id')
		.notNull()
		.references(() => devices.id, { onDelete: "cascade" }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
	index('group_devices_group_idx').using('btree', table.groupId),
	index('group_devices_device_idx').using('btree', table.deviceId),
]);

// Email templates table
export const emailTemplates = pgTable('email_templates', {
	id: uuid('id').primaryKey().defaultRandom(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	groupId: uuid('group_id')
		.references(() => groups.id, { onDelete: "set null" }),
	name: text('name').notNull(),
	type: text('type').notNull(),
	subject: text('subject').notNull(),
	html: text('html').notNull(),
	nReminder: integer('n_reminder'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
}, (table) => [
	index('email_templates_org_idx').using('btree', table.organizationId),
	index('email_templates_group_idx').using('btree', table.groupId),
	index('email_templates_type_idx').using('btree', table.type),
]);

// Add relations after table definitions
export const groupsRelations = relations(groups, ({ many }) => ({
	groupUsers: many(groupUsers),
	groupDevices: many(groupDevices),
	emailTemplates: many(emailTemplates),
}));

export const usersRelations = relations(users, ({ many }) => ({
	groupUsers: many(groupUsers),
}));

export const devicesRelations = relations(devices, ({ many }) => ({
	groupDevices: many(groupDevices),
}));

export const groupUsersRelations = relations(groupUsers, ({ one }) => ({
	group: one(groups, {
		fields: [groupUsers.groupId],
		references: [groups.id],
	}),
	user: one(users, {
		fields: [groupUsers.userId],
		references: [users.id],
	}),
}));

export const groupDevicesRelations = relations(groupDevices, ({ one }) => ({
	group: one(groups, {
		fields: [groupDevices.groupId],
		references: [groups.id],
	}),
	device: one(devices, {
		fields: [groupDevices.deviceId],
		references: [devices.id],
	}),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
	organization: one(organization, {
		fields: [emailTemplates.organizationId],
		references: [organization.id],
	}),
	group: one(groups, {
		fields: [emailTemplates.groupId],
		references: [groups.id],
	}),
}));

export type DeviceLogs = typeof deviceLogs.$inferSelect;
export type NewDeviceLogs = typeof deviceLogs.$inferInsert;
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;
export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;
export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;
export type TwoFactor = typeof twoFactor.$inferSelect;
export type NewTwoFactor = typeof twoFactor.$inferInsert;
export type Apikey = typeof apikey.$inferSelect;
export type NewApikey = typeof apikey.$inferInsert;
export type Device = typeof devices.$inferSelect;
export type NewDevice = typeof devices.$inferInsert;
export type Users = typeof users.$inferSelect;
export type NewUsers = typeof users.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupUser = typeof groupUsers.$inferSelect;
export type NewGroupUser = typeof groupUsers.$inferInsert;
export type GroupDevice = typeof groupDevices.$inferSelect;
export type NewGroupDevice = typeof groupDevices.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;

// Utility types to avoid circular references
export type GroupBase = Omit<Group, 'users' | 'devices'>;
export type UserBase = Omit<Users, 'groups'>;

// Extended types with relations
export type GroupWithUsers = GroupBase & {
  users: UserBase[];
};

export type GroupWithDevices = GroupBase & {
  devices: Device[];
};

export type GroupWithRelations = GroupBase & {
  users: UserBase[];
  devices: Device[];
};

export type UserWithGroups = UserBase & {
  groups: GroupBase[];
};

export type UserWithFullGroups = UserBase & {
  groups: GroupWithRelations[];
};