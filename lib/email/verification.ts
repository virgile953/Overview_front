import { sendMail } from "./send-mail";

export async function verifyEmail(body: { email: string, token: string, url: string }): Promise<boolean> {
  console.log('Sending verification email :', { email: body.email, url: body.url });
  const res = await sendMail(body.email, 'Please verify your email', `Click the link to verify your email: ${body.url}`);
  if (res.response.status === 200) {
    console.log('Verification email sent');
  } else {
    console.error('Failed to send verification email', res);
  }
  if (res.response.status !== 200) {
    return false;
  }
  return true;
}