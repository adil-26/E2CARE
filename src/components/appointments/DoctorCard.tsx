import { Star, MapPin, Clock, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Doctor } from "@/hooks/useAppointments";

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

const SPECIALIZATION_ICONS: Record<string, string> = {
  "General Physician": "🩺",
  "Cardiologist": "❤️",
  "Dermatologist": "🧴",
  "Orthopedic Surgeon": "🦴",
  "Pediatrician": "👶",
  "ENT Specialist": "👂",
  "Gynecologist": "🩷",
  "Neurologist": "🧠",
};

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  const specIcon = SPECIALIZATION_ICONS[doctor.specialization] || "🏥";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-accent/50 flex items-center justify-center text-2xl sm:text-3xl">
            {specIcon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                  {doctor.full_name}
                </h4>
                <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
              </div>
              {doctor.rating && (
                <Badge variant="outline" className="flex-shrink-0 gap-0.5 text-[10px] border-amber-200 text-amber-700 bg-amber-50">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  {doctor.rating}
                </Badge>
              )}
            </div>

            {doctor.qualification && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{doctor.qualification}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" /> {doctor.experience_years}y exp
              </span>
              {doctor.hospital && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" /> {doctor.hospital}
                </span>
              )}
              <span className="flex items-center gap-0.5 font-medium text-foreground">
                <IndianRupee className="h-3 w-3" /> {doctor.consultation_fee}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3">
              {doctor.languages && (
                <div className="flex gap-1 flex-wrap">
                  {doctor.languages.slice(0, 3).map((lang) => (
                    <span key={lang} className="rounded-full bg-muted px-2 py-0.5 text-[9px] text-muted-foreground">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
              <Button size="sm" className="text-xs h-8 ml-auto" onClick={() => onBook(doctor)}>
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
