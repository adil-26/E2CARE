import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { z } from 'https://esm.sh/zod@3.23.8'

const BodySchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(100000).optional(),
  text: z.string().min(1).max(100000).optional(),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400)
    }
    const { to, subject, html, text } = parsed.data
    if (!html && !text) {
      return json({ error: 'Provide html or text' }, 400)
    }

    const host = Deno.env.get('SMTP_HOST')!
    const port = Number(Deno.env.get('SMTP_PORT') ?? '465')
    const username = Deno.env.get('SMTP_USER')!
    const password = Deno.env.get('SMTP_PASSWORD')!
    const fromName = Deno.env.get('SMTP_FROM_NAME') ?? 'E2Care'

    if (!host || !username || !password) {
      return json({ error: 'SMTP is not configured' }, 500)
    }

    const client = new SMTPClient({
      connection: {
        hostname: host,
        port,
        tls: port === 465,
        auth: { username, password },
      },
    })

    await client.send({
      from: `${fromName} <${username}>`,
      to,
      subject,
      content: text ?? 'This email requires an HTML capable client.',
      html: html ?? undefined,
    })

    await client.close()

    return json({ success: true })
  } catch (err) {
    console.error('send-email failed:', err)
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
