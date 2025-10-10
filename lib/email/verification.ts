import { sendTemplate } from "./send-mail";

export async function verifyEmail(body: { email: string, token: string, url: string }): Promise<boolean> {
  console.log('Sending verification email :', { email: body.email, url: body.url });
  const res = await sendTemplate(body.email, 7387702, { verification_link: body.url });
  res.response.status === 200 ? console.log('Verification email sent') : console.error('Failed to send verification email', res);
  if (res.response.status !== 200) {
    return false;
  }
  return true;
}