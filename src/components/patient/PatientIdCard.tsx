import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Compass, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientIdCardProps {
  patient: {
    id?: string;
    full_name?: string;
    gender?: string;
    date_of_birth?: string;
    blood_group?: string;
    phone?: string;
    avatar_url?: string;
  };
  patientId: string;
}

export const PatientIdCard = forwardRef<HTMLDivElement, PatientIdCardProps>(({ patient, patientId }, ref) => {
  const initials = (patient.full_name || "P").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://e2care.com';
  
  // Provide a pure URL so standard cameras and Google Lens instantly detect it as a tappable link
  const qrData = `${baseUrl}/id/${patientId}`;

  return (
    <div 
      ref={ref}
      className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 to-primary shadow-2xl p-[2px]"
      style={{
        boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
      }}
    >
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden h-full flex flex-col border border-white/20">
        
        {/* Header Ribbon */}
        <div className="bg-white/95 px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-primary tracking-tight leading-none text-base">E2Care</h1>
              <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider leading-tight">My Health Compass</p>
            </div>
          </div>
          <Badge type="digital" />
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-20 h-20 border-2 border-white shadow-lg ring-4 ring-white/20 relative z-10 bg-white">
              <AvatarImage src={patient.avatar_url} />
              <AvatarFallback className="bg-primary-foreground text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pt-1 text-white drop-shadow-md">
              <h2 className="font-display font-bold text-xl leading-tight mb-1">{patient.full_name || "Unknown Patient"}</h2>
              <div className="inline-flex items-center gap-1.5 bg-black/20 rounded-full px-2.5 py-0.5 text-xs border border-white/10 shadow-inner mb-2">
                <span className="opacity-80">ID:</span>
                <span className="font-mono font-medium tracking-wide">{patientId.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-white/90 pb-6 mb-auto border-b border-white/20">
            <InfoField label="D.O.B" value={patient.date_of_birth} />
            <InfoField label="Blood Group" value={patient.blood_group} isBold />
            <InfoField label="Gender" value={patient.gender} capitalize />
            <InfoField label="Contact" value={patient.phone} />
          </div>

          {/* QR Code Section */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] text-white/70 tracking-widest uppercase font-semibold mb-1">Authentic Record</p>
              <p className="text-xs text-white/90 leading-tight pr-4">Scan QR code to access secure digital health records.</p>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
              <QRCodeSVG 
                value={qrData} 
                size={64} 
                level="L" 
                fgColor="#0f172a" 
                bgColor="#ffffff"
              />
            </div>
          </div>
        </div>

        {/* Decorative Wave/Footer */}
        <div className="h-2 bg-gradient-to-r from-teal-400 via-primary to-blue-600 opacity-80" />
      </div>
    </div>
  );
});

PatientIdCard.displayName = "PatientIdCard";

// Helpers
function Badge({ type }: { type: string }) {
  return (
    <div className="bg-primary/5 border border-primary/20 px-2 py-1 rounded-md flex items-center gap-1">
      <User className="w-3 h-3 text-primary" />
      <span className="text-[9px] uppercase tracking-bold font-bold text-primary">Patient ID</span>
    </div>
  );
}

function InfoField({ label, value, capitalize, isBold }: { label: string; value?: string; capitalize?: boolean; isBold?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-white/60 mb-0.5 font-medium">{label}</span>
      <span className={`text-sm ${isBold ? 'font-bold text-white shadow-sm' : 'font-medium'} ${capitalize ? 'capitalize' : ''} drop-shadow-sm truncate`}>
        {value}
      </span>
    </div>
  );
}
