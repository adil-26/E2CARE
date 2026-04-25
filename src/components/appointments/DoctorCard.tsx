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
    <Card className="shadow-sm border-slate-100 hover:shadow-lg hover:border-teal-200/50 hover:bg-teal-50/10 transition-all duration-300 group overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-4">
          {/* Avatar Area */}
          <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 flex items-center justify-center text-3xl sm:text-4xl shadow-inner relative group-hover:scale-105 transition-transform duration-300">
            {specIcon}
            {doctor.is_available && (
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-bold text-base sm:text-lg text-slate-800 truncate group-hover:text-teal-700 transition-colors">
                  {doctor.full_name}
                </h4>
                <p className="text-xs sm:text-sm font-medium text-teal-600 line-clamp-1">{doctor.specialization}</p>
              </div>
              {doctor.rating && (
                <Badge className="flex-shrink-0 gap-1 text-[11px] border-none text-slate-700 bg-amber-400/20 font-bold px-2 py-0.5 shadow-sm">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {doctor.rating}
                </Badge>
              )}
            </div>

            {doctor.qualification && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{doctor.qualification}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[11px] sm:text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-teal-500" /> <span className="font-medium">{doctor.experience_years}y</span> exp
              </span>
              {doctor.hospital && (
                <span className="flex items-center gap-1 line-clamp-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" /> <span className="font-medium text-slate-600 truncate">{doctor.hospital}</span>
                </span>
              )}
              <span className="flex items-center gap-0.5 font-bold text-slate-700 ml-auto bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                <IndianRupee className="h-3.5 w-3.5 text-slate-400" /> {doctor.consultation_fee}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between mt-4 gap-3 pt-3 border-t border-slate-100/80">
              {doctor.languages && (
                <div className="flex gap-1.5 flex-wrap">
                  {doctor.languages.slice(0, 3).map((lang) => (
                    <span key={lang} className="rounded-md bg-slate-100/80 px-2 py-1 text-[10px] font-medium text-slate-500 border border-slate-200/50">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
              <Button 
                size="sm" 
                className="text-xs h-8 ml-auto flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all duration-300 shadow-sm shadow-teal-600/20 group-hover:shadow-teal-600/40" 
                onClick={() => onBook(doctor)}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
