import { Heart, Pill, AlertTriangle, User, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EmergencyProfile } from "@/hooks/useEmergencyProfile";

interface CriticalInfoCardsProps {
  profile: EmergencyProfile;
}

export default function CriticalInfoCards({ profile }: CriticalInfoCardsProps) {
  return (
    <div className="space-y-3">
      {/* Blood Group & Basic Info */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-destructive/20 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-muted-foreground">Blood Group</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">
              {profile.bloodGroup || "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Gender / Age</span>
            </div>
            <p className="font-display text-lg font-bold text-foreground">
              {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "—"}
              {profile.dateOfBirth && (
                <span className="text-base font-normal text-muted-foreground">
                  {" / "}
                  {Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / 31557600000)}y
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allergies */}
      <Card className="border-warning/20 shadow-sm">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-xs font-medium text-muted-foreground">Allergies</span>
          </div>
          {profile.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.allergies.map((a) => (
                <Badge key={a} variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                  {a}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No allergies recorded</p>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Active Medications</span>
          </div>
          {profile.medications.length > 0 ? (
            <div className="space-y-1">
              {profile.medications.map((m, i) => (
                <div key={i} className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">{m.name}</span>
                  <span className="text-muted-foreground">{m.dosage} · {m.frequency}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active medications</p>
          )}
        </CardContent>
      </Card>

      {/* Conditions */}
      {profile.conditions.length > 0 && (
        <Card className="border-secondary/20 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">Medical Conditions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.conditions.map((c, i) => (
                <Badge key={i} variant="outline" className="border-secondary/30 bg-secondary/10 text-secondary">
                  {c.name} ({c.status})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
