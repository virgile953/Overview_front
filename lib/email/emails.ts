import Drizzle from "../db/db";


export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  groupId?: string;
  organizationId: string;
}

export async function getTemplates(organizationId: string): Promise<EmailTemplate[]> {
  // Placeholder function to simulate fetching email templates for an organization


  return [
    {
      id: 'template1',
      name: 'Welcome Email',
      subject: 'Welcome to Our Service',
      html: '<h1>Welcome to our service!</h1><p>We are glad to have you.</p>',
      groupId: "7f036c54-cd09-4ad3-a4e8-17fda4fe6e24",
      organizationId: organizationId
    },
    {
      id: 'template2',
      name: 'Password Reset',
      subject: 'Password Reset Request',
      html: '<h1>Password Reset Request</h1><p>Click <a href="#">here</a> to reset your password.</p>',
      organizationId: organizationId
    },
  ];
}