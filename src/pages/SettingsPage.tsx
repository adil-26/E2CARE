import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save, Bell, Shield, Loader2, QrCode, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qrRef = useRef<SVGSVGElement>(null);
  const { language, setLanguage, t } = useLanguage();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile_settings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        blood_group: profile.blood_group || "",
        address: profile.address || "",
        emergency_contact_name: profile.emergency_contact_name || "",
        emergency_contact_phone: profile.emergency_contact_phone || "",
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (updates: typeof form) => {
      const cleaned = {
        ...updates,
        date_of_birth: updates.date_of_birth || null,
        phone: updates.phone || null,
        gender: updates.gender || null,
        blood_group: updates.blood_group || null,
        address: updates.address || null,
        emergency_contact_name: updates.emergency_contact_name || null,
        emergency_contact_phone: updates.emergency_contact_phone || null,
      };
      const { error } = await supabase
        .from("profiles")
        .update(cleaned)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile_settings"] });
      toast({ title: t.common.save + "!", description: t.history.historySaved.replace("{step}", t.settings.profile) });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true });

    if (upErr) {
      toast({ title: "Upload Failed", description: upErr.message, variant: "destructive" });
      return;
    }

    const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);

    await supabase
      .from("profiles")
      .update({ profile_photo_url: urlData.publicUrl })
      .eq("user_id", user!.id);

    queryClient.invalidateQueries({ queryKey: ["profile_settings"] });
    toast({ title: "Photo Updated!" });
  };

  const initials = form.full_name
    ? form.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const downloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `patient-qr-${profile?.medical_id || "code"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">{t.settings.title}</h2>
        <HearOutButton text={t.settings.title} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">{t.settings.profile}</TabsTrigger>
          <TabsTrigger value="preferences">{t.settings.preferences}</TabsTrigger>
          <TabsTrigger value="security">{t.settings.security}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 pt-4">
          {/* Avatar */}
          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="relative">
                <Avatar className="h-20 w-20 rounded-full">
                  <AvatarImage src={profile?.profile_photo_url || undefined} className="rounded-full object-cover" />
                  <AvatarFallback className="rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{form.full_name || t.common.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile?.medical_id && (
                  <p className="mt-0.5 text-xs text-muted-foreground">Medical ID: {profile.medical_id}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patient QR Card */}
          {profile?.medical_id && (
            <Card className="shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <QrCode className="h-4 w-4 text-primary" />
                  {t.settings.patientCard}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Left: Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-16 w-16 rounded-xl border-2 border-primary/20">
                      <AvatarImage src={profile?.profile_photo_url || undefined} className="rounded-xl object-cover" />
                      <AvatarFallback className="rounded-xl bg-primary/10 text-lg font-bold text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{form.full_name || t.common.name}</p>
                      <p className="text-xs text-muted-foreground">{form.blood_group && `${t.settings.bloodGroup}: ${form.blood_group}`}</p>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5">
                        <span className="text-[10px] font-mono font-bold text-primary tracking-wider">{profile.medical_id}</span>
                      </div>
                    </div>
                  </div>
                  {/* Right: QR Code */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <QRCodeSVG
                        ref={qrRef}
                        value={`E2CARE:${profile.medical_id}:${form.full_name}`}
                        size={100}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={downloadQR}>
                      <Download className="h-3 w-3" /> {t.settings.downloadQR}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Form */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {t.settings.personalInfo}
                </div>
                <HearOutButton text={t.settings.personalInfo} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t.settings.fullName}</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>{t.settings.phone}</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <Label>{t.settings.dateOfBirth}</Label>
                  <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                </div>
                <div>
                  <Label>{t.settings.gender}</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue placeholder={t.settings.selectGender} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">{t.common.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t.settings.bloodGroup}</Label>
                  <Select value={form.blood_group} onValueChange={(v) => setForm({ ...form, blood_group: v })}>
                    <SelectTrigger><SelectValue placeholder={t.settings.selectBloodGroup} /></SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>{t.settings.address}</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={t.settings.address} />
                </div>
              </div>

              <Separator />

              <h4 className="text-sm font-medium text-foreground">{t.settings.emergencyContact}</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t.settings.contactName}</Label>
                  <Input value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} />
                </div>
                <div>
                  <Label>{t.settings.contactPhone}</Label>
                  <Input value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} />
                </div>
              </div>

              <Button className="w-full" onClick={() => updateProfile.mutate(form)} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t.settings.saveChanges}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4 pt-4">
          {/* Language Toggle */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                🌐 {t.settings.language}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{t.settings.languageDesc}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${language === "en"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${language === "hi"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                >
                  🇮🇳 हिंदी
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  {t.settings.notifications}
                </div>
                <HearOutButton text={t.settings.notifications} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: t.settings.appointmentReminders, desc: t.settings.notificationDesc },
                { label: t.settings.medicationReminders, desc: t.settings.notificationDesc },
                { label: t.settings.reportReady, desc: t.settings.notificationDesc },
                { label: t.settings.newPrescriptions, desc: t.settings.notificationDesc },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {t.settings.accountSecurity}
                </div>
                <HearOutButton text={t.settings.accountSecurity} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">{t.settings.email}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.settings.emergencyPin}</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.pin_code ? `${profile.pin_code.slice(0, 2)}****` : t.settings.notSet}
                </p>
              </div>
              <Separator />
              <Button variant="destructive" className="w-full" onClick={signOut}>
                {t.settings.signOut}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
