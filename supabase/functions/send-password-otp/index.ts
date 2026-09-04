import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'
import { sendMail, otpEmailHtml } from '../_shared/mailer.ts'

const BodySchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['password_reset', 'verify_email']).default('password_reset'),
})

async function sha256(value: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400)

    const email = parsed.data.email.trim().toLowerCase()
    const purpose = parsed.data.purpose

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    // Simple abuse guard: max 5 codes per email per hour
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('email_otps')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', hourAgo)

    if ((count ?? 0) >= 5) {
      return json({ error: 'Too many codes requested. Please try again later.' }, 429)
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const codeHash = await sha256(`${email}:${code}`)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error: insertError } = await admin.from('email_otps').insert({
      email,
      code_hash: codeHash,
      purpose,
      expires_at: expiresAt,
    })
    if (insertError) throw insertError

    await sendMail({
      to: email,
      subject: purpose === 'password_reset' ? 'Your E2Care password reset code' : 'Your E2Care verification code',
      html: otpEmailHtml(
        code,
        purpose === 'password_reset'
          ? 'Use this code to reset your password.'
          : 'Use this code to verify your email address.',
      ),
      text: `Your E2Care code is ${code}. It expires in 10 minutes.`,
    })

    return json({ success: true })
  } catch (err) {
    console.error('send-password-otp failed:', err)
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
