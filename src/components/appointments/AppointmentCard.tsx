import { format, isPast, isToday } from "date-fns";
import { Calendar, Clock, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/hooks/useAppointments";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  isCancelling: boolean;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-teal-50 text-teal-700 border-teal-200 shadow-sm",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  no_show: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AppointmentCard({ appointment, onCancel, isCancelling }: AppointmentCardProps) {
  const doc = appointment.doctor;
  const apptDate = new Date(`${appointment.appointment_date}T${appointment.start_time || "00:00"}:00`);
  
  // Only upcoming if status says upcoming AND the actual time has not passed yet
  const isUpcoming = appointment.status === "upcoming" && !isPast(apptDate);
  const todayAppt = isToday(apptDate) && isUpcoming;

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${todayAppt ? "ring-2 ring-teal-500/50 shadow-md scale-[1.01]" : "shadow-sm border-slate-200 hover:shadow-md hover:border-teal-200/50"}`}>
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Date block */}
          <div className={`flex-shrink-0 flex flex-col items-center justify-center w-16 sm:w-20 border-r border-slate-100 p-2 ${todayAppt ? "bg-gradient-to-b from-teal-500 to-teal-600 text-white" : "bg-slate-50/80 text-slate-700"}`}>
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider opacity-80">{format(apptDate, "MMM")}</span>
            <span className="text-xl sm:text-3xl font-black leading-none my-1">{format(apptDate, "d")}</span>
            <span className="text-[9px] sm:text-[10px] font-medium opacity-80">{format(apptDate, "EEE")}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className={`font-bold text-sm sm:text-base truncate ${todayAppt ? "text-teal-900" : "text-slate-800"}`}>
                  {doc?.full_name || "Doctor"}
                </h4>
                <p className="text-[11px] sm:text-xs font-medium text-teal-600 truncate mt-0.5">
                  {doc?.specialization} {doc?.hospital && <span className="text-slate-400 font-normal">· {doc.hospital}</span>}
                </p>
              </div>
              <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 flex-shrink-0 border ${isUpcoming ? STATUS_STYLES.upcoming : STATUS_STYLES[appointment.status] || STATUS_STYLES.cancelled}`}>
                {todayAppt ? "TODAY" : isUpcoming ? "UPCOMING" : appointment.status === "upcoming" ? "COMPLETED" : appointment.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100/80 text-[11px] sm:text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Clock className="h-3.5 w-3.5 text-teal-500" />
                {formatTime12h(appointment.start_time)}
              </span>
              
              {appointment.reason && (
                <span className="flex items-center gap-1 text-slate-500 truncate bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex-1">
                  <span className="text-blue-500 font-bold">Res:</span>
                  <span className="truncate">{appointment.reason}</span>
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {isUpcoming && (
            <div className="flex items-center justify-center px-3 border-l border-slate-100 bg-slate-50/50">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-full"
                onClick={() => onCancel(appointment.id)}
                disabled={isCancelling}
                title="Cancel Appointment"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
