import { useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEmergencyProfile } from "@/hooks/useEmergencyProfile";
import SOSButton from "@/components/emergency/SOSButton";
import CriticalInfoCards from "@/components/emergency/CriticalInfoCards";
import EmergencyContacts from "@/components/emergency/EmergencyContacts";
import EmergencyQRCode from "@/components/emergency/EmergencyQRCode";

export default function Emergency() {
  const { data: profile, isLoading } = useEmergencyProfile();

  const handleSOS = useCallback(() => {
    window.open("tel:112", "_self");
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">Unable to load emergency profile.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="font-display text-xl font-bold text-foreground">Emergency</h2>
      </div>

      {/* SOS Button */}
      <div className="flex justify-center py-2">
        <SOSButton onActivate={handleSOS} />
      </div>

      {/* Critical Info */}
      <CriticalInfoCards profile={profile} />

      {/* Emergency QR Code */}
      <EmergencyQRCode
        medicalId={profile.medicalId}
        pinCode={profile.pinCode}
        patientName={profile.fullName}
      />

      {/* Emergency Contacts & Quick Dial */}
      <EmergencyContacts profile={profile} />
    </motion.div>
  );
}
