import { Phone, Flame, Shield, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EmergencyProfile } from "@/hooks/useEmergencyProfile";

const EMERGENCY_NUMBERS = [
  { label: "Ambulance", number: "108", icon: Phone, color: "text-destructive" },
  { label: "Police", number: "100", icon: Shield, color: "text-primary" },
  { label: "Fire", number: "101", icon: Flame, color: "text-warning" },
];

interface EmergencyContactsProps {
  profile: EmergencyProfile;
}

export default function EmergencyContacts({ profile }: EmergencyContactsProps) {
  const handleCall = (number: string) => {
    window.open(`tel:${number}`, "_self");
  };

  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Quick Dial
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {EMERGENCY_NUMBERS.map((e) => (
          <Button
            key={e.number}
            variant="outline"
            className="flex h-auto flex-col gap-1 py-3"
            onClick={() => handleCall(e.number)}
          >
            <e.icon className={`h-5 w-5 ${e.color}`} />
            <span className="text-xs font-medium">{e.label}</span>
            <span className="text-[10px] text-muted-foreground">{e.number}</span>
          </Button>
        ))}
      </div>

      {/* Personal emergency contact */}
      {profile.emergencyContactName && profile.emergencyContactPhone && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{profile.emergencyContactName}</p>
                  <p className="text-xs text-muted-foreground">Emergency Contact</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleCall(profile.emergencyContactPhone!)}
              >
                <Phone className="mr-1 h-3.5 w-3.5" />
                Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
