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
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-muted text-muted-foreground",
  no_show: "bg-red-50 text-red-700 border-red-200",
};

export default function AppointmentCard({ appointment, onCancel, isCancelling }: AppointmentCardProps) {
  const doc = appointment.doctor;
  const apptDate = new Date(appointment.appointment_date + "T00:00:00");
  const isUpcoming = appointment.status === "upcoming" && !isPast(apptDate);
  const todayAppt = isToday(apptDate) && appointment.status === "upcoming";

  return (
    <Card className={`shadow-sm ${todayAppt ? "ring-2 ring-primary/30" : ""}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Date block */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-accent/50">
            <span className="text-lg font-bold text-foreground leading-tight">{format(apptDate, "d")}</span>
            <span className="text-[10px] text-muted-foreground">{format(apptDate, "MMM")}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-medium text-sm truncate text-foreground">
                {doc?.full_name || "Doctor"}
              </h4>
              <Badge variant="outline" className={`text-[9px] flex-shrink-0 ${STATUS_STYLES[appointment.status]}`}>
                {todayAppt ? "Today" : appointment.status}
              </Badge>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {doc?.specialization} {doc?.hospital && `· ${doc.hospital}`}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                {format(apptDate, "EEE, MMM d")}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {formatTime12h(appointment.start_time)}
              </span>
            </div>
            {appointment.reason && (
              <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                💬 {appointment.reason}
              </p>
            )}
          </div>

          {/* Actions */}
          {isUpcoming && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive flex-shrink-0"
              onClick={() => onCancel(appointment.id)}
              disabled={isCancelling}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
