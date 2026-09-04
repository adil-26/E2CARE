import { supabase } from "@/integrations/supabase/client";

/** Sends a 6-digit code to the email using our own SMTP mailer. */
export async function sendResetOtp(email: string): Promise<{ error: Error | null }> {
  const { data, error } = await supabase.functions.invoke("send-password-otp", {
    body: { email: email.trim().toLowerCase(), purpose: "password_reset" },
  });
  if (error) return { error: new Error((data as any)?.error ?? error.message) };
  if ((data as any)?.error) return { error: new Error(String((data as any).error)) };
  return { error: null };
}

/** Verifies the code and sets the new password. */
export async function resetPasswordWithOtp(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ error: Error | null }> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase.functions.invoke("verify-password-otp", {
    body: { email: normalized, code, newPassword, purpose: "password_reset" },
  });
  if (error) return { error: new Error((data as any)?.error ?? error.message) };
  if ((data as any)?.error) return { error: new Error(String((data as any).error)) };

  // Sign the user straight in with the new password.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalized,
    password: newPassword,
  });
  if (signInError) return { error: new Error(signInError.message) };
  return { error: null };
}
