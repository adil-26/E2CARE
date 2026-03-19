import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Loader2, ArrowLeft, Gift, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");
const genderSchema = z.string().min(1, "Please select your gender");

// ── 6-box OTP input ──────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const update = (idx: number, ch: string) => {
    const d = digits.slice();
    d[idx] = ch;
    const next = d.join("").replace(/[^0-9]/g, "").slice(0, 6);
    onChange(next);
    if (ch && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={e => update(i, e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => handleKey(i, e)}
          className="w-11 h-12 text-center text-lg font-bold border-2 rounded-lg bg-background transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          style={{ caretColor: "transparent" }}
        />
      ))}
    </div>
  );
}

// ── password strength bar ──────────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  const score = [
    password.length >= 6,
    /[A-Za-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const label = ["", "Weak", "Fair", "Good", "Strong"][score];
  const colour = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][score];

  if (!password) return null;
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="h-1 flex-1 rounded-full transition-colors" style={{ background: n <= score ? colour : "#e5e7eb" }} />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: colour }}>{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type ForgotStep = "email" | "otp" | "new-password" | "done";

export default function PatientAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // signup
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupGender, setSignupGender] = useState("");
  const [signupReferralCode, setSignupReferralCode] = useState("");

  // forgot password OTP flow
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const { signIn, signUp, user, sendOtp, verifyOtp, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useRole();

  useEffect(() => {
    if (user && role) navigate("/dashboard", { replace: true });
  }, [user, role, navigate]);

  // ── handlers ──────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      const message = error.message.includes("Invalid login")
        ? "Invalid email or password."
        : error.message.includes("Email not confirmed")
          ? "Please verify your email before signing in."
          : error.message;
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(signupName);
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      genderSchema.parse(signupGender);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Validation Error", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupGender, signupReferralCode);
    setIsLoading(false);
    if (error) {
      const message = error.message.includes("already registered")
        ? "This email is already registered. Try logging in."
        : error.message;
      toast({ title: "Signup Failed", description: message, variant: "destructive" });
    } else {
      toast({ title: "Account Created!", description: "Please check your email to verify your account." });
    }
  };

  // Step 1: send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try { emailSchema.parse(resetEmail); } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Invalid email", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await sendOtp(resetEmail);
    setIsLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOtp("");
      setForgotStep("otp");
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast({ title: "Enter all 6 digits", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await verifyOtp(resetEmail, otp);
    setIsLoading(false);
    if (error) {
      toast({ title: "Invalid code", description: "The OTP is incorrect or expired. Please try again.", variant: "destructive" });
    } else {
      setForgotStep("new-password");
    }
  };

  // Step 3: set new password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try { passwordSchema.parse(newPassword); } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Weak password", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await updatePassword(newPassword);
    setIsLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setForgotStep("done");
    }
  };

  const resetForgot = () => {
    setForgotMode(false);
    setForgotStep("email");
    setOtp("");
    setNewPassword("");
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (error) toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
    } catch {
      toast({ title: "Google Sign-In Failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ── Google SVG ────────────────────────────────────────────────────────
  const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-xl bg-primary/10 px-4 py-4">
              <img src="/logo.png" alt="E2Care" className="h-20 w-auto" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Patient Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Access your health records</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-4">

              {/* ── LOGIN TAB ── */}
              <TabsContent value="login" className="mt-0">
                <AnimatePresence mode="wait">
                  {forgotMode ? (
                    <motion.div key="forgot" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>

                      {/* Step indicators */}
                      {forgotStep !== "done" && (
                        <div className="mb-5 flex items-center gap-2">
                          {["email", "otp", "new-password"].map((s, i) => {
                            const steps: ForgotStep[] = ["email", "otp", "new-password"];
                            const current = steps.indexOf(forgotStep);
                            const past = i < current;
                            const active = i === current;
                            return (
                              <div key={s} className="flex flex-1 items-center gap-2">
                                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${active ? "bg-primary text-primary-foreground" : past ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                                  {past ? "✓" : i + 1}
                                </div>
                                {i < 2 && <div className={`h-px flex-1 transition-colors ${past ? "bg-emerald-500" : "bg-muted"}`} />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* STEP 1 – Email */}
                      {forgotStep === "email" && (
                        <>
                          <CardTitle className="mb-1 text-lg">Forgot Password</CardTitle>
                          <CardDescription className="mb-4">We'll send a 6-digit code to your email.</CardDescription>
                          <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-2">
                              <Label>Email address</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input type="email" placeholder="you@example.com" className="pl-10" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                              </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send OTP
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="w-full gap-1" onClick={resetForgot}>
                              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                            </Button>
                          </form>
                        </>
                      )}

                      {/* STEP 2 – OTP */}
                      {forgotStep === "otp" && (
                        <>
                          <CardTitle className="mb-1 text-lg flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" /> Verify Code
                          </CardTitle>
                          <CardDescription className="mb-5">
                            Enter the 6-digit code sent to <span className="font-medium text-foreground">{resetEmail}</span>
                          </CardDescription>
                          <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <OtpInput value={otp} onChange={setOtp} />
                            <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Verify Code
                            </Button>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <button type="button" className="hover:underline" onClick={() => setForgotStep("email")}>
                                ← Change email
                              </button>
                              <button type="button" className="text-primary hover:underline" onClick={handleSendOtp}>
                                Resend code
                              </button>
                            </div>
                          </form>
                        </>
                      )}

                      {/* STEP 3 – New password */}
                      {forgotStep === "new-password" && (
                        <>
                          <CardTitle className="mb-1 text-lg">Set New Password</CardTitle>
                          <CardDescription className="mb-4">Choose a strong password for your account.</CardDescription>
                          <form onSubmit={handleSetPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label>New password</Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  type={showNewPw ? "text" : "password"}
                                  placeholder="Min 6 characters"
                                  className="pl-10 pr-10"
                                  value={newPassword}
                                  onChange={e => setNewPassword(e.target.value)}
                                  required
                                />
                                <button type="button" onClick={() => setShowNewPw(s => !s)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              <StrengthBar password={newPassword} />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
                            </Button>
                          </form>
                        </>
                      )}

                      {/* DONE */}
                      {forgotStep === "done" && (
                        <div className="flex flex-col items-center gap-4 py-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Password updated!</p>
                            <p className="mt-1 text-sm text-muted-foreground">You can now sign in with your new password.</p>
                          </div>
                          <Button className="w-full" onClick={resetForgot}>Sign In</Button>
                        </div>
                      )}

                    </motion.div>
                  ) : (
                    <motion.div key="login" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2 }}>
                      <CardTitle className="mb-1 text-lg">Welcome back</CardTitle>
                      <CardDescription className="mb-4">Sign in to your patient account</CardDescription>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input type="email" placeholder="you@example.com" className="pl-10" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Password</Label>
                            <button type="button"
                              onClick={() => { setForgotMode(true); setForgotStep("email"); setResetEmail(loginEmail); }}
                              className="text-[11px] text-primary hover:underline">
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showLoginPw ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10"
                              value={loginPassword}
                              onChange={e => setLoginPassword(e.target.value)}
                              required
                            />
                            <button type="button" onClick={() => setShowLoginPw(s => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In
                        </Button>
                      </form>
                      <div className="relative my-4">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or</span>
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                        {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                        Continue with Google
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* ── SIGN UP TAB ── */}
              <TabsContent value="signup" className="mt-0">
                <CardTitle className="mb-1 text-lg">Create account</CardTitle>
                <CardDescription className="mb-4">Start managing your health today</CardDescription>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="John Doe" className="pl-10" value={signupName} onChange={e => setSignupName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={signupGender} onValueChange={setSignupGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" className="pl-10" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="password" placeholder="Min 6 characters" className="pl-10" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Referral Code (Optional)</Label>
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Enter referral code" className="pl-10" value={signupReferralCode} onChange={e => setSignupReferralCode(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Account
                  </Button>
                </form>
                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">or</span>
                </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                  {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                  Continue with Google
                </Button>
              </TabsContent>

            </CardContent>
          </Tabs>
        </Card>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to role selection
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
