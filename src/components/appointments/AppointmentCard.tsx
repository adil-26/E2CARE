import { format } from "date-fns";
import { Clock, X, Check, CalendarX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/hooks/useAppointments";
import {
  getEffectiveStatus,
  appointmentDateTime,
  STATUS_BADGE,
  STATUS_LABEL,
  isActiveStatus,
} from "@/lib/appointmentStatus";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  isCancelling: boolean;
  onMark?: (id: string, status: "completed" | "missed") => void;
  isMarking?: boolean;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function AppointmentCard({
  appointment,
  onCancel,
  isCancelling,
  onMark,
  isMarking,
}: AppointmentCardProps) {
  const doc = appointment.doctor;
  const apptDate = appointmentDateTime(appointment);
  const eff = getEffectiveStatus(appointment);
  const todayAppt = eff === "today";
  const active = isActiveStatus(eff);
  const needsReview = eff === "pending_review";

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        todayAppt
          ? "ring-2 ring-teal-500/50 shadow-md"
          : needsReview
          ? "ring-1 ring-amber-300/70 shadow-sm border-amber-200"
          : eff === "missed"
          ? "border-rose-200/70 shadow-sm"
          : "shadow-sm border-slate-200 hover:shadow-md hover:border-teal-200/50"
      }`}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Date block */}
          <div
            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 sm:w-20 border-r border-slate-100 p-2 ${
              todayAppt
                ? "bg-gradient-to-b from-teal-500 to-teal-600 text-white"
                : eff === "missed"
                ? "bg-rose-50 text-rose-700"
                : "bg-slate-50/80 text-slate-700"
            }`}
          >
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
                  {doc?.specialization}
                  {doc?.hospital && <span className="text-slate-400 font-normal"> · {doc.hospital}</span>}
                </p>
              </div>
              <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 flex-shrink-0 border ${STATUS_BADGE[eff]}`}>
                {STATUS_LABEL[eff]}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100/80 text-[11px] sm:text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Clock className="h-3.5 w-3.5 text-teal-500" />
                {formatTime12h(appointment.start_time)}
              </span>

              {appointment.reason && (
                <span className="flex items-center gap-1 text-slate-500 truncate bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex-1">
                  <span className="text-blue-500 font-bold">Reason:</span>
                  <span className="truncate">{appointment.reason}</span>
                </span>
              )}
            </div>

            {/* Past-but-unresolved prompt */}
            {needsReview && onMark && (
              <div className="mt-3 rounded-lg bg-amber-50/70 border border-amber-200 p-2.5">
                <p className="text-[11px] font-semibold text-amber-800">
                  This appointment date has passed. Did you attend it?
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    className="h-7 px-3 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isMarking}
                    onClick={() => onMark(appointment.id, "completed")}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Yes, attended
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-[11px] border-rose-200 text-rose-700 hover:bg-rose-50"
                    disabled={isMarking}
                    onClick={() => onMark(appointment.id, "missed")}
                  >
                    <CalendarX className="h-3.5 w-3.5 mr-1" /> No, missed
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {active && (
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
