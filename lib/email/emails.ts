"use server";

import { headers } from "next/headers";
import { auth } from "../auth";

// import Drizzle from "../db/db";

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

export async function getTemplates(organizationId: string): Promise<EmailTemplate[]> {
  return [
    {
      id: 'template1',
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
      groupId: "7f036c54-cd09-4ad3-a4e8-17fda4fe6e24",
      organizationId: organizationId
    },
    {
      id: 'template2',
      name: 'MachineDown',
      type: 'first_alert',
      subject: 'The machine %MachineName% is down',
      html: `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #e74c3c; margin-bottom: 20px; font-size: 28px;">The machine %MachineName% is down!</h1>
    <br/>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">We haven't heard from it since %LastSeen%.</p>
    <br/>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">The location is %MachineLocation%.</p>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; font-weight: bold;">Please check on it as soon as possible.</p>
  </div>
</div>`,
      organizationId: organizationId
    },
    {
      id: 'template3',
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
      organizationId: organizationId
    },
  ];
}

export async function updateTemplate(templateId: string, template: EmailTemplate): Promise<EmailTemplate> {

  const session = await auth.api.getSession(
    {
      headers: await headers()
    })
  if (!session) {
    throw new Error("Unauthorized");
  }
  const orgId = session.session.activeOrganizationId;
  if (!orgId) {
    throw new Error("No active organization");
  }
  console.log(orgId);


  console.log(`Updating template ${templateId} with data:`, template);
  return template;
}