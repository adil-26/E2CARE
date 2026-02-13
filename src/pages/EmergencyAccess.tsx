import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Loader2, AlertTriangle, Heart, Pill, Activity, User, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

interface EmergencyData {
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  phone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  allergies: string[];
  medications: { name: string; dosage: string; frequency: string }[];
  conditions: { name: string; status: string }[];
}

export default function EmergencyAccess() {
  const { medicalId } = useParams<{ medicalId: string }>();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EmergencyData | null>(null);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (pin.length !== 6 || !medicalId) return;

    setLoading(true);
    setError(null);

    try {
      // Look up profile by medical_id and verify PIN
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, date_of_birth, gender, blood_group, phone, emergency_contact_name, emergency_contact_phone, pin_code")
        .eq("medical_id", medicalId)
        .maybeSingle();

      if (profileError || !profile) {
        setError("Patient not found. Please check the QR code.");
        setLoading(false);
        return;
      }

      if (profile.pin_code !== pin) {
        setError("Incorrect PIN. Please try again.");
        setLoading(false);
        return;
      }

      // Fetch medical data using user_id
      const [historyRes, medsRes] = await Promise.all([
        supabase
          .from("medical_history")
          .select("allergies, medical_conditions")
          .eq("user_id", profile.user_id)
          .maybeSingle(),
        supabase
          .from("medications")
          .select("name, dosage, frequency")
          .eq("user_id", profile.user_id)
          .eq("is_active", true),
      ]);

      const history = historyRes.data;
      const meds = medsRes.data ?? [];

      // Parse allergies
      const allergies: string[] = [];
      if (history?.allergies) {
        const a = history.allergies as Record<string, any>;
        if (Array.isArray(a.food_allergies)) allergies.push(...a.food_allergies);
        if (Array.isArray(a.drug_allergies)) allergies.push(...a.drug_allergies);
        if (Array.isArray(a.environmental_allergies)) allergies.push(...a.environmental_allergies);
      }

      // Parse conditions
      const conditions: { name: string; status: string }[] = [];
      if (history?.medical_conditions) {
        const mc = history.medical_conditions as Record<string, any>;
        if (Array.isArray(mc.conditions)) {
          mc.conditions.forEach((c: any) => {
            if (c.name) conditions.push({ name: c.name, status: c.status || "active" });
          });
        }
      }

      setData({
        fullName: profile.full_name,
        dateOfBirth: profile.date_of_birth,
        gender: profile.gender,
        bloodGroup: profile.blood_group,
        phone: profile.phone,
        emergencyContactName: profile.emergency_contact_name,
        emergencyContactPhone: profile.emergency_contact_phone,
        allergies,
        medications: meds.map((m: any) => ({ name: m.name, dosage: m.dosage, frequency: m.frequency })),
        conditions,
      });
      setVerified(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // PIN entry screen
  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Emergency Access</h1>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit PIN to view this patient's critical medical information.
            </p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <Lock className="h-5 w-5 text-muted-foreground" />

              <InputOTP
                maxLength={6}
                value={pin}
                onChange={(v) => {
                  setPin(v);
                  setError(null);
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                className="w-full"
                disabled={pin.length !== 6 || loading}
                onClick={handleVerify}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify & View
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            This is a temporary read-only view for authorized medical personnel.
          </p>
        </motion.div>
      </div>
    );
  }

  // Verified — show critical info
  if (!data) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md space-y-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Emergency Medical Profile</h1>
            <p className="text-sm text-muted-foreground">{data.fullName || "Patient"}</p>
          </div>
        </div>

        {/* Blood Group & Basic */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-destructive/20">
            <CardContent className="p-4">
              <div className="mb-1 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs text-muted-foreground">Blood Group</span>
              </div>
              <p className="font-display text-2xl font-bold">{data.bloodGroup || "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="mb-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Info</span>
              </div>
              <p className="text-sm font-medium">
                {data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : "—"}
                {data.dateOfBirth && (
                  <span className="text-muted-foreground">
                    {" / "}
                    {Math.floor((Date.now() - new Date(data.dateOfBirth).getTime()) / 31557600000)}y
                  </span>
                )}
              </p>
              {data.phone && <p className="text-xs text-muted-foreground mt-1">{data.phone}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Allergies */}
        <Card className="border-warning/20">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-muted-foreground">Allergies</span>
            </div>
            {data.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.allergies.map((a) => (
                  <Badge key={a} variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                    {a}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">None recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Active Medications</span>
            </div>
            {data.medications.length > 0 ? (
              <div className="space-y-1.5">
                {data.medications.map((m, i) => (
                  <div key={i} className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-muted-foreground">{m.dosage} · {m.frequency}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">None</p>
            )}
          </CardContent>
        </Card>

        {/* Conditions */}
        {data.conditions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-secondary" />
                <span className="text-xs font-medium text-muted-foreground">Conditions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.conditions.map((c, i) => (
                  <Badge key={i} variant="outline" className="border-secondary/30 bg-secondary/10 text-secondary">
                    {c.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {data.emergencyContactName && data.emergencyContactPhone && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Emergency Contact</p>
              <div className="flex items-center justify-between">
                <p className="font-medium">{data.emergencyContactName}</p>
                <a href={`tel:${data.emergencyContactPhone}`} className="text-sm text-primary font-medium">
                  {data.emergencyContactPhone}
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
