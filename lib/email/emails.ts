"use server";

import { headers } from "next/headers";
import { and, eq, asc } from "drizzle-orm";
import { auth } from "../auth";
import Drizzle from "../db/db";
import { emailTemplates } from "../db/schema";

export interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  html: string;
  n_reminder?: number;
  groupId?: string;
  organizationId: string;
}

async function getDefaultTemplates(): Promise<EmailTemplate[]> {
  return [
    {
      id: 'default1',
      name: 'Oulala!',
      type: 'first_alert',
      subject: 'Oulala! Machine %MachineName% is down',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #e74c3c; margin-bottom: 20px; font-size: 28px;">Oulala!!1! %MachineName% is down!</h1>
    <br/>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">We haven't heard from it since %LastSeen%.</p>
    <br/>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">The location is %MachineLocation%.</p>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; font-weight: bold;">Please check on it as soon as possible.</p>
  </div>
</div>`,
      organizationId: ""
    },
    {
      id: 'default2',
      name: 'MachineStillDown',
      type: 'followup_alert',
      subject: 'The machine %MachineName% is still down',
      html: `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #e74c3c; margin-bottom: 20px; font-size: 28px;">The machine %MachineName% is still down!</h1>
    <br/>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">We still haven't heard from it since %LastSeen%.</p>
    <br/>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">The location is %MachineLocation%.</p>
    <p style="color: #d32f2f; font-size: 16px; line-height: 1.6; font-weight: bold; margin-bottom: 15px;">This requires immediate attention!</p>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; font-weight: bold;">Please take action to resolve this issue immediately.</p>
  </div>
</div>`,
      organizationId: ""
    },
  ];
}


export async function getTemplates(): Promise<EmailTemplate[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized");
  }
  const orgId = session.session.activeOrganizationId;
  if (!orgId) {
    throw new Error("No active organization");
  }

  const dbTemplates = await Drizzle.select().from(emailTemplates).where(
    eq(emailTemplates.organizationId, orgId)
  ).orderBy(asc(emailTemplates.type), asc(emailTemplates.name));

  if (dbTemplates.length === 0) {
    return getDefaultTemplates();
  }

  return dbTemplates.map(dbTemplate => ({
    id: dbTemplate.id,
    name: dbTemplate.name,
    type: dbTemplate.type,
    subject: dbTemplate.subject,
    html: dbTemplate.html,
    n_reminder: dbTemplate.nReminder || undefined,
    groupId: dbTemplate.groupId || undefined,
    organizationId: dbTemplate.organizationId,
  }));
}

export async function updateTemplate(templateId: string, template: EmailTemplate): Promise<EmailTemplate> {

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized");
  }
  const orgId = session.session.activeOrganizationId;
  if (!orgId) {
    throw new Error("No active organization");
  }

  const updatedTemplate = await Drizzle
    .update(emailTemplates)
    .set({
      name: template.name,
      type: template.type,
      subject: template.subject,
      html: template.html,
      nReminder: template.n_reminder,
      groupId: template.groupId,
    })
    .where(
      and(
        eq(emailTemplates.id, templateId),
        eq(emailTemplates.organizationId, orgId)
      )
    )
    .returning();
  console.log(`Updating template ${templateId} with data:`, template);
  const dbTemplate = updatedTemplate[0];
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    type: dbTemplate.type,
    subject: dbTemplate.subject,
    html: dbTemplate.html,
    n_reminder: dbTemplate.nReminder || undefined,
    groupId: dbTemplate.groupId || undefined,
    organizationId: dbTemplate.organizationId,
  };
}

export async function createDefaultTemplate(name: string, groupId: string | null): Promise<EmailTemplate> {

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized");
  }
  const orgId = session.session.activeOrganizationId;
  if (!orgId) {
    throw new Error("No active organization");
  }

  const [newTemplate] = await Drizzle
    .insert(emailTemplates)
    .values({
      name: name,
      type: "first_alert",
      subject: "Machine down alert",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #e74c3c; margin-bottom: 20px; font-size: 28px;">Oulala!!1! %MachineName% is down!</h1>
    <br/>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">We haven't heard from it since %LastSeen%.</p>
    <br/>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">The location is %MachineLocation%.</p>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; font-weight: bold;">Please check on it as soon as possible.</p>
  </div>
</div>`,
      nReminder: 0,
      groupId: groupId,
      organizationId: orgId,
    })
    .returning();

  return {
    id: newTemplate.id,
    name: newTemplate.name,
    type: newTemplate.type,
    subject: newTemplate.subject,
    html: newTemplate.html,
    n_reminder: newTemplate.nReminder || undefined,
    groupId: newTemplate.groupId || undefined,
    organizationId: newTemplate.organizationId,
  };
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized");
  }
  const orgId = session.session.activeOrganizationId;
  if (!orgId) {
    throw new Error("No active organization");
  }

  await Drizzle
    .delete(emailTemplates)
    .where(
      and(
        eq(emailTemplates.id, templateId),
        eq(emailTemplates.organizationId, orgId)
      )
    );
}

export async function createFromTemplate(template: EmailTemplate, groupId: string | null): Promise<EmailTemplate | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized");
  }
  const orgId = session.session.activeOrganizationId;
  if (!orgId) {
    throw new Error("No active organization");
  }

  const newTemplate = await Drizzle
    .insert(emailTemplates)
    .values({
      name: "Copy of " + template.name,
      type: template.type,
      subject: template.subject,
      html: template.html,
      nReminder: template.n_reminder,
      groupId: groupId,
      organizationId: orgId,
    })
    .returning();

  return {
    id: newTemplate[0].id,
    name: newTemplate[0].name,
    type: newTemplate[0].type,
    subject: newTemplate[0].subject,
    html: newTemplate[0].html,
    n_reminder: newTemplate[0].nReminder || undefined,
    groupId: newTemplate[0].groupId || undefined,
    organizationId: newTemplate[0].organizationId,
  };
}