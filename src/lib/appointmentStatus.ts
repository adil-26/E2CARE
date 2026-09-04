import { isPast, isToday } from "date-fns";

export type EffectiveStatus =
  | "today"
  | "upcoming"
  | "pending_review"
  | "completed"
  | "missed"
  | "cancelled";

export interface AppointmentLike {
  appointment_date: string;
  start_time: string;
  end_time?: string | null;
  status: string;
}

export function appointmentDateTime(a: AppointmentLike): Date {
  return new Date(`${a.appointment_date}T${(a.start_time || "00:00").slice(0, 5)}:00`);
}

export function appointmentEndDateTime(a: AppointmentLike): Date {
  return new Date(
    `${a.appointment_date}T${(a.end_time || a.start_time || "00:00").slice(0, 5)}:00`
  );
}

/**
 * Resolves the real-world status of an appointment.
 * A DB row still marked "upcoming" whose slot has already passed becomes
 * "pending_review" — the patient must confirm whether it happened or was missed.
 */
export function getEffectiveStatus(a: AppointmentLike): EffectiveStatus {
  const s = (a.status || "").toLowerCase();
  if (s === "cancelled") return "cancelled";
  if (s === "completed" || s === "done") return "completed";
  if (s === "missed" || s === "no_show") return "missed";

  const end = appointmentEndDateTime(a);
  if (isPast(end)) return "pending_review";
  if (isToday(appointmentDateTime(a))) return "today";
  return "upcoming";
}

export const STATUS_LABEL: Record<EffectiveStatus, string> = {
  today: "TODAY",
  upcoming: "UPCOMING",
  pending_review: "NEEDS UPDATE",
  completed: "COMPLETED",
  missed: "MISSED",
  cancelled: "CANCELLED",
};

export const STATUS_BADGE: Record<EffectiveStatus, string> = {
  today: "bg-teal-50 text-teal-700 border-teal-200 shadow-sm",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  missed: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export function isActiveStatus(s: EffectiveStatus) {
  return s === "today" || s === "upcoming";
}

export interface StatusSummary {
  total: number;
  today: number;
  upcoming: number;
  pending_review: number;
  completed: number;
  missed: number;
  cancelled: number;
}

/** Counts appointments by their real-world (time-aware) status. */
export function summarizeAppointments(list: AppointmentLike[]): StatusSummary {
  const s: StatusSummary = {
    total: list.length,
    today: 0,
    upcoming: 0,
    pending_review: 0,
    completed: 0,
    missed: 0,
    cancelled: 0,
  };
  for (const a of list) s[getEffectiveStatus(a)]++;
  return s;
}
