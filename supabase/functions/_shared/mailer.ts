import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  const host = Deno.env.get('SMTP_HOST')
  const port = Number(Deno.env.get('SMTP_PORT') ?? '465')
  const username = Deno.env.get('SMTP_USER')
  const password = Deno.env.get('SMTP_PASSWORD')
  const fromName = Deno.env.get('SMTP_FROM_NAME') ?? 'E2Care'

  if (!host || !username || !password) throw new Error('SMTP is not configured')

  const client = new SMTPClient({
    connection: { hostname: host, port, tls: port === 465, auth: { username, password } },
  })

  await client.send({
    from: `${fromName} <${username}>`,
    to: opts.to,
    subject: opts.subject,
    content: opts.text ?? 'This email requires an HTML capable client.',
    html: opts.html,
  })

  await client.close()
}

export function otpEmailHtml(code: string, purposeLabel: string) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f8fa;padding:32px">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e3eaef">
      <h2 style="margin:0 0 8px;color:#0f766e">E2Care</h2>
      <p style="margin:0 0 24px;color:#475569;font-size:14px">${purposeLabel}</p>
      <div style="text-align:center;margin:24px 0">
        <span style="display:inline-block;font-size:34px;letter-spacing:10px;font-weight:700;color:#0f172a;background:#ecfdf5;border-radius:12px;padding:16px 24px">${code}</span>
      </div>
      <p style="color:#64748b;font-size:13px;margin:0">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
    </div>
  </div>`
}
