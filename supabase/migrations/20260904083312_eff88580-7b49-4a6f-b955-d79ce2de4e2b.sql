CREATE TABLE public.email_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'password_reset',
  attempts INT NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_otps_lookup ON public.email_otps (email, purpose, created_at DESC);

GRANT ALL ON public.email_otps TO service_role;

ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to otp codes"
ON public.email_otps FOR ALL TO authenticated, anon
USING (false) WITH CHECK (false);