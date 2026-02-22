import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password is too long");

type Step = "verifying" | "form" | "success" | "invalid";

export default function ResetPassword() {
    const [step, setStep] = useState<Step>("verifying");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { updatePassword } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Supabase sends the recovery token as a hash fragment — it exchanges
    // automatically via onAuthStateChange when the event is PASSWORD_RECOVERY.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setStep("form");
            } else if (event === "SIGNED_IN" && step === "verifying") {
                // Already signed in (no recovery token) — go home
                navigate("/", { replace: true });
            }
        });

        // If after 4 seconds we still don't have a recovery event, the link is invalid
        const timeout = setTimeout(() => {
            setStep(prev => prev === "verifying" ? "invalid" : prev);
        }, 4000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [navigate, step]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            passwordSchema.parse(newPassword);
        } catch (err) {
            if (err instanceof z.ZodError) {
                toast({ title: "Invalid password", description: err.errors[0].message, variant: "destructive" });
                return;
            }
        }
        if (newPassword !== confirmPassword) {
            toast({ title: "Passwords don't match", description: "Please make sure both passwords are identical.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const { error } = await updatePassword(newPassword);
        setIsLoading(false);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setStep("success");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-6 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-xl bg-primary/10 px-4 py-4">
                            <img src="/logo.png" alt="E2Care" className="h-16 w-auto" />
                        </div>
                    </div>
                    <h1 className="font-display text-2xl font-bold text-foreground">E2Care</h1>
                </div>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {step === "verifying" && "Verifying link…"}
                            {step === "form" && "Set new password"}
                            {step === "success" && "Password updated!"}
                            {step === "invalid" && "Link expired"}
                        </CardTitle>
                        <CardDescription>
                            {step === "verifying" && "Please wait while we verify your reset link."}
                            {step === "form" && "Enter your new password below."}
                            {step === "success" && "Your password has been changed successfully."}
                            {step === "invalid" && "This reset link is invalid or has expired. Please request a new one."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>

                        {/* Verifying spinner */}
                        {step === "verifying" && (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}

                        {/* Form */}
                        {step === "form" && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min 6 characters"
                                            className="pl-10 pr-10"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(s => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Re-enter password"
                                            className="pl-10"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password strength hint */}
                                {newPassword.length > 0 && (
                                    <div className="space-y-1">
                                        {[
                                            { label: "At least 6 characters", ok: newPassword.length >= 6 },
                                            { label: "Contains a number", ok: /\d/.test(newPassword) },
                                            { label: "Contains a letter", ok: /[a-zA-Z]/.test(newPassword) },
                                        ].map(({ label, ok }) => (
                                            <div key={label} className={`flex items-center gap-1.5 text-[11px] ${ok ? "text-emerald-600" : "text-muted-foreground"}`}>
                                                <span>{ok ? "✓" : "○"}</span> {label}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </form>
                        )}

                        {/* Success */}
                        {step === "success" && (
                            <div className="flex flex-col items-center gap-4 py-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                </div>
                                <p className="text-sm text-muted-foreground">You can now sign in with your new password.</p>
                                <Button className="w-full" onClick={() => navigate("/auth/patient")}>
                                    Go to Sign In
                                </Button>
                            </div>
                        )}

                        {/* Invalid link */}
                        {step === "invalid" && (
                            <div className="flex flex-col items-center gap-4 py-4">
                                <Button variant="outline" className="w-full" onClick={() => navigate("/auth/patient")}>
                                    Back to Sign In
                                </Button>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
