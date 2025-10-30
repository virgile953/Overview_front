"use server";

import Drizzle from "../db/db";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  n_reminder?: number;
  groupId?: string;
  organizationId: string;
}

export async function getTemplates(organizationId: string): Promise<EmailTemplate[]> {
  // Placeholder function to simulate fetching email templates for an organization
  return [
    {
      id: 'template1',
      name: 'Oulala!',
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
  ];
}