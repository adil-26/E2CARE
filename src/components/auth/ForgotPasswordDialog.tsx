import { useState } from "react";
import { sendResetOtp, resetPasswordWithOtp } from "@/lib/passwordReset";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, Lock, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type Step = "email" | "otp" | "new-password" | "done";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

export function ForgotPasswordDialog({ open, onOpenChange, defaultEmail = "" }: ForgotPasswordDialogProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const close = (value: boolean) => {
    if (!value) {
      setStep("email");
      setOtp("");
      setNewPassword("");
    }
    onOpenChange(value);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Invalid email", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await sendResetOtp(email);
    setIsLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setOtp("");
    setStep("otp");
    toast({ title: "Code sent", description: "Check your inbox for the 6-digit code." });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast({ title: "Enter all 6 digits", variant: "destructive" });
      return;
    }
    setStep("new-password");
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      passwordSchema.parse(newPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Weak password", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await resetPasswordWithOtp(email, otp, newPassword);
    setIsLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setStep("done");
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            {step === "email" && "We'll email you a 6-digit verification code."}
            {step === "otp" && `Enter the code sent to ${email}`}
            {step === "new-password" && "Choose a new password for your account."}
            {step === "done" && "Your password has been updated."}
          </DialogDescription>
        </DialogHeader>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send code
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              Continue
            </Button>
            <button
              type="button"
              className="w-full text-sm text-muted-foreground hover:underline"
              onClick={() => setStep("email")}
            >
              Use a different email
            </button>
          </form>
        )}

        {step === "new-password" && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label>New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-10"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update password
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <p className="text-sm text-muted-foreground">You're signed in with your new password.</p>
            <Button className="w-full" onClick={() => close(false)}>
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
