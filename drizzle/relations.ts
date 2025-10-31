import { relations } from "drizzle-orm/relations";
import { organization, groups, devices, groupDevices, groupUsers, users, emailTemplates, user, account, twoFactor, apikey, invitation, member, session } from "./schema";

export const groupsRelations = relations(groups, ({one, many}) => ({
	organization: one(organization, {
		fields: [groups.organizationId],
		references: [organization.id]
	}),
	groupDevices: many(groupDevices),
	groupUsers: many(groupUsers),
	emailTemplates: many(emailTemplates),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	groups: many(groups),
	users: many(users),
	emailTemplates: many(emailTemplates),
	devices: many(devices),
	invitations: many(invitation),
	members: many(member),
}));

export const groupDevicesRelations = relations(groupDevices, ({one}) => ({
	device: one(devices, {
		fields: [groupDevices.deviceId],
		references: [devices.id]
	}),
	group: one(groups, {
		fields: [groupDevices.groupId],
		references: [groups.id]
	}),
}));

export const devicesRelations = relations(devices, ({one, many}) => ({
	groupDevices: many(groupDevices),
	organization: one(organization, {
		fields: [devices.organizationId],
		references: [organization.id]
	}),
}));

export const groupUsersRelations = relations(groupUsers, ({one}) => ({
	group: one(groups, {
		fields: [groupUsers.groupId],
		references: [groups.id]
	}),
	user: one(users, {
		fields: [groupUsers.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	groupUsers: many(groupUsers),
	organization: one(organization, {
		fields: [users.organizationId],
		references: [organization.id]
	}),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({one}) => ({
	group: one(groups, {
		fields: [emailTemplates.groupId],
		references: [groups.id]
	}),
	organization: one(organization, {
		fields: [emailTemplates.organizationId],
		references: [organization.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	twoFactors: many(twoFactor),
	apikeys: many(apikey),
	invitations: many(invitation),
	members: many(member),
	sessions: many(session),
}));

export const twoFactorRelations = relations(twoFactor, ({one}) => ({
	user: one(user, {
		fields: [twoFactor.userId],
		references: [user.id]
	}),
}));

export const apikeyRelations = relations(apikey, ({one}) => ({
	user: one(user, {
		fields: [apikey.userId],
		references: [user.id]
	}),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id]
	}),
}));

export const memberRelations = relations(member, ({one}) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));