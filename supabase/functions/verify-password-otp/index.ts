import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.23.8'

const BodySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(6).max(72).optional(),
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
    const { code, newPassword, purpose } = parsed.data

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )

    const { data: rows, error } = await admin
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .is('consumed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) throw error

    const record = rows?.[0]
    if (!record) return json({ error: 'No active code. Please request a new one.' }, 400)
    if (new Date(record.expires_at).getTime() < Date.now()) return json({ error: 'Code expired.' }, 400)
    if (record.attempts >= 5) return json({ error: 'Too many attempts. Request a new code.' }, 429)

    const codeHash = await sha256(`${email}:${code}`)
    if (codeHash !== record.code_hash) {
      await admin.from('email_otps').update({ attempts: record.attempts + 1 }).eq('id', record.id)
      return json({ error: 'Incorrect code.' }, 400)
    }

    await admin.from('email_otps').update({ consumed_at: new Date().toISOString() }).eq('id', record.id)

    if (purpose === 'password_reset') {
      if (!newPassword) return json({ error: 'New password is required.' }, 400)

      // Find the auth user for this email
      let userId: string | null = null
      let page = 1
      while (page <= 20 && !userId) {
        const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 200 })
        if (listError) throw listError
        userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null
        if (data.users.length < 200) break
        page++
      }
      if (!userId) return json({ error: 'No account found for this email.' }, 404)

      const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
        password: newPassword,
        email_confirm: true,
      })
      if (updateError) throw updateError
    }

    return json({ success: true })
  } catch (err) {
    console.error('verify-password-otp failed:', err)
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})
