import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Stethoscope, Upload, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDoctorProfile } from "@/hooks/useDoctorPatients";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function DoctorProfile() {
  const { doctorProfile, isLoading } = useDoctorProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    full_name: "",
    specialization: "",
    qualification: "",
    hospital: "",
    bio: "",
    languages: "",
    experience_years: 0,
    consultation_fee: 0,
    is_available: true,
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!doctorProfile) return;
    setForm({
      full_name: doctorProfile.full_name ?? "",
      specialization: doctorProfile.specialization ?? "",
      qualification: doctorProfile.qualification ?? "",
      hospital: doctorProfile.hospital ?? "",
      bio: doctorProfile.bio ?? "",
      languages: (doctorProfile.languages ?? []).join(", "),
      experience_years: doctorProfile.experience_years ?? 0,
      consultation_fee: doctorProfile.consultation_fee ?? 0,
      is_available: doctorProfile.is_available ?? true,
      avatar_url: doctorProfile.avatar_url ?? "",
    });
  }, [doctorProfile]);

  const set = (key: keyof typeof form, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/doctor-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      set("avatar_url", data.publicUrl);
      toast({ title: "Photo uploaded", description: "Remember to save your profile." });
    }
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorProfile) return;
    setSaving(true);
    const { error } = await supabase
      .from("doctors")
      .update({
        full_name: form.full_name,
        specialization: form.specialization,
        qualification: form.qualification || null,
        hospital: form.hospital || null,
        bio: form.bio || null,
        languages: form.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        experience_years: Number(form.experience_years) || 0,
        consultation_fee: Number(form.consultation_fee) || 0,
        is_available: form.is_available,
        avatar_url: form.avatar_url || null,
      })
      .eq("id", doctorProfile.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["doctor_profile"] });
    toast({ title: "Profile updated" });
  };

  if (isLoading) {
    return <div className="py-16 text-center text-muted-foreground">Loading profile…</div>;
  }

  if (!doctorProfile) {
    return <div className="py-16 text-center text-muted-foreground">No doctor profile found for this account.</div>;
  }

  const initials = (form.full_name || "Dr").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Profile</h2>
        <Badge variant={doctorProfile.status === "approved" ? "default" : "secondary"} className="gap-1 capitalize">
          <BadgeCheck className="h-3 w-3" /> {doctorProfile.status}
        </Badge>
      </div>

      <form onSubmit={save} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-primary" /> Professional details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {form.avatar_url && <AvatarImage src={form.avatar_url} className="object-cover" />}
                <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  id="doctor-avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById("doctor-avatar")?.click()}
                >
                  {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
                  Change photo
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Full name</Label>
                <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Specialization</Label>
                <Input value={form.specialization} onChange={(e) => set("specialization", e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Qualification</Label>
                <Input value={form.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="MBBS, MD" />
              </div>
              <div className="space-y-1">
                <Label>Hospital / clinic</Label>
                <Input value={form.hospital} onChange={(e) => set("hospital", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.experience_years}
                  onChange={(e) => set("experience_years", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Consultation fee (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.consultation_fee}
                  onChange={(e) => set("consultation_fee", e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Languages (comma separated)</Label>
                <Input value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="English, Hindi" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>About you</Label>
                <Textarea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Consultation settings</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Accepting new appointments</p>
              <p className="text-xs text-muted-foreground">Turn off to hide your slots from patients.</p>
            </div>
            <Switch checked={form.is_available} onCheckedChange={(v) => set("is_available", v)} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Save changes
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
