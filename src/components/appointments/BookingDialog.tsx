import { useState, useMemo } from "react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Doctor, useAppointments } from "@/hooks/useAppointments";

interface BookingDialogProps {
  doctor: Doctor | null;
  open: boolean;
  onClose: () => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateTimeSlots(startTime: string, endTime: string, durationMin: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;

  while (current + durationMin <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += durationMin;
  }
  return slots;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function BookingDialog({ doctor, open, onClose }: BookingDialogProps) {
  const { useDoctorAvailability, useBookedSlots, bookAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data: availability } = useDoctorAvailability(doctor?.id || null);
  const { data: bookedSlots } = useBookedSlots(doctor?.id || null, selectedDate);

  // Generate next 14 days that match doctor's availability
  const availableDates = useMemo(() => {
    if (!availability) return [];
    const availDays = new Set(availability.map((a) => a.day_of_week));
    const today = startOfToday();
    const dates: Date[] = [];

    for (let i = 0; i < 30 && dates.length < 14; i++) {
      const d = addDays(today, i);
      if (availDays.has(d.getDay())) {
        dates.push(d);
      }
    }
    return dates;
  }, [availability]);

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !availability) return [];
    const selectedDow = new Date(selectedDate).getDay();
    const daySlots = availability.filter((a) => a.day_of_week === selectedDow);

    const allSlots: { time: string; duration: number }[] = [];
    daySlots.forEach((ds) => {
      const slots = generateTimeSlots(ds.start_time, ds.end_time, ds.slot_duration_minutes);
      slots.forEach((s) => allSlots.push({ time: s, duration: ds.slot_duration_minutes }));
    });

    // Filter out booked slots
    const bookedSet = new Set((bookedSlots || []).map((b) => b.start_time.substring(0, 5)));
    return allSlots.filter((s) => !bookedSet.has(s.time));
  }, [selectedDate, availability, bookedSlots]);

  const slotDuration = availability?.[0]?.slot_duration_minutes || 30;

  const handleBook = async () => {
    if (!doctor || !selectedDate || !selectedSlot) return;

    const [h, m] = selectedSlot.split(":").map(Number);
    const endMin = h * 60 + m + slotDuration;
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    await bookAppointment.mutateAsync({
      doctorId: doctor.id,
      date: selectedDate,
      startTime: selectedSlot,
      endTime,
      reason,
    });

    setSelectedDate(null);
    setSelectedSlot(null);
    setReason("");
    onClose();
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedSlot(null);
    setReason("");
    onClose();
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md mx-4 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-primary" />
            Book with {doctor.full_name}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">{doctor.specialization} · ₹{doctor.consultation_fee}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Step 1: Date picker */}
          <div>
            <Label className="text-xs mb-2 block">Select Date</Label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              {availableDates.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-[4.5rem] h-20 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                        : "bg-white text-slate-600 border-slate-100 hover:border-teal-200 hover:bg-teal-50/30"
                    }`}
                  >
                    <span className={`text-[10px] font-bold tracking-wider uppercase mb-1 ${isSelected ? "text-teal-100" : "text-slate-400"}`}>{DAY_NAMES[d.getDay()]}</span>
                    <span className="text-2xl font-black leading-none">{format(d, "d")}</span>
                    <span className={`text-[10px] font-medium mt-1 ${isSelected ? "text-teal-100" : "text-slate-500"}`}>{format(d, "MMM")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Time slots */}
          {selectedDate && (
            <div>
              <Label className="text-xs mb-2 block flex items-center gap-1">
                <Clock className="h-3 w-3" /> Available Slots
              </Label>
              {timeSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No available slots for this date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`rounded-xl border-2 py-2.5 px-2 text-xs font-bold transition-all duration-300 ${
                        selectedSlot === slot.time
                          ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                          : "bg-slate-50 text-slate-700 border-slate-100 hover:border-teal-200 hover:bg-teal-50"
                      }`}
                    >
                      {formatTime12h(slot.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Reason */}
          {selectedSlot && (
            <div>
              <Label className="text-xs font-bold text-slate-700 mb-2 block">Reason for Visit <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Input
                className="h-11 text-sm rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-teal-500/30"
                placeholder="e.g. Regular checkup, follow-up..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          {/* Confirm */}
          {selectedDate && selectedSlot && (
            <div className="rounded-2xl bg-gradient-to-br from-teal-50/80 to-blue-50/50 border border-teal-100 p-4 space-y-2 mt-2">
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2">Appointment Summary</p>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-slate-700 flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Date</span>
                  {format(new Date(selectedDate), "EEE, MMM d, yyyy")}
                </p>
                <p className="text-sm font-bold text-teal-700 flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-medium">Time</span>
                  {formatTime12h(selectedSlot)}
                </p>
                <p className="text-sm font-medium text-slate-700 flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Doctor</span>
                  {doctor.full_name}
                </p>
                <p className="text-sm font-bold text-slate-800 flex items-center justify-between mt-1 pt-1 border-t border-teal-200/50">
                  <span className="text-slate-500 text-xs font-medium">Total Fee</span>
                  ₹{doctor.consultation_fee}
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full gap-2 h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all duration-300 mt-2"
            disabled={!selectedDate || !selectedSlot || bookAppointment.isPending}
            onClick={handleBook}
          >
            {bookAppointment.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Confirming Booking...</>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
