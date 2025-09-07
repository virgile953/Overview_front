import { NextResponse } from 'next/server';
import connect from 'node-mailjet'


export async function POST(request: Request) {
  const { email, subject } = await request.json();

  console.log(`Sending email to: ${email}`);
  console.log(`Subject: ${subject}`);
  const res = await sendMail(email, subject, null);
  return NextResponse.json(res.body);
}

const coucou = new connect({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
})

async function sendMail(mailTo: string, subject: string, body: string | null) {
  const request = coucou.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'mail@overview.management',
          Name: 'Me',
        },
        To: [
          {
            Email: mailTo,
            Name: 'You',
          },
        ],
        Subject: subject,
        TextPart: body,
        HTMLPart: `<h3>${body ? body : '<h3>Dear passenger 1, welcome to <a href="https://www.mailjet.com/">Mailjet</a>!</h3><br />May the delivery force be with you!' }</h3>`,
      },
    ],
  })

  return request
}
