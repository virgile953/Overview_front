import connect from 'node-mailjet'


const coucou = new connect({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
})

export async function sendMail(mailTo: string, subject: string, body: string | null) {
  const request = coucou.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'mail@overview.management',
          Name: 'Admin',
        },
        To: [
          {
            Email: mailTo,
            Name: 'You',
          },
        ],
        Subject: subject,
        TextPart: body,
        HTMLPart: `<h3>${body ? body : '<h3>Dear passenger 1, welcome to <a href="https://www.mailjet.com/">Mailjet</a>!</h3><br />May the delivery force be with you!'}</h3>`,
      },
    ],
  })

  return request
}

export function sendTemplate(mailTo: string, templateId: number, variables: object) {
  const request = coucou.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        subject: 'Please verify your email',
        To: [
          {
            Email: mailTo,
            Name: 'You',
          },
        ],
        TemplateID: templateId,
        TemplateLanguage: true,
        Variables: variables,
      },
    ],
  })

  return request
}