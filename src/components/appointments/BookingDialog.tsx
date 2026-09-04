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

  const initials = doctor.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="space-y-0 p-5 pb-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border-b text-left">
          <DialogTitle className="sr-only">Book an appointment with {doctor.full_name}</DialogTitle>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{doctor.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{doctor.specialization}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fee</p>
              <p className="text-base font-bold text-foreground">₹{doctor.consultation_fee}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Step 1: Date picker */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
              <Label className="text-sm font-semibold">Pick a date</Label>
            </div>
            {availableDates.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-xl border border-dashed p-4 text-center">
                This doctor hasn't published availability yet.
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {availableDates.map((d) => {
                  const dateStr = format(d, "yyyy-MM-dd");
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-[4.25rem] h-[4.75rem] rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                          : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-accent"
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? "opacity-80" : "text-muted-foreground"}`}>
                        {DAY_NAMES[d.getDay()]}
                      </span>
                      <span className="text-xl font-bold leading-tight">{format(d, "d")}</span>
                      <span className={`text-[10px] ${isSelected ? "opacity-80" : "text-muted-foreground"}`}>{format(d, "MMM")}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Step 2: Time slots */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${selectedDate ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Choose a time
              </Label>
            </div>
            {!selectedDate ? (
              <p className="text-xs text-muted-foreground rounded-xl border border-dashed p-4 text-center">Select a date to see open slots.</p>
            ) : timeSlots.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-xl border border-dashed p-4 text-center">No slots left on this day. Try another date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                      selectedSlot === slot.time
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                        : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-accent"
                    }`}
                  >
                    {formatTime12h(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Step 3: Reason */}
          {selectedSlot && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
                <Label className="text-sm font-semibold">
                  Reason for visit <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
              </div>
              <Input
                className="h-11 rounded-xl text-sm"
                placeholder="e.g. Regular checkup, follow-up..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </section>
          )}

          {/* Summary */}
          {selectedDate && selectedSlot && (
            <div className="rounded-2xl border bg-muted/40 p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Summary</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(selectedDate), "EEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold text-primary">{formatTime12h(selectedSlot)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">₹{doctor.consultation_fee}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t bg-background/95 backdrop-blur p-4">
          <Button
            className="w-full h-12 rounded-xl gap-2 font-semibold"
            disabled={!selectedDate || !selectedSlot || bookAppointment.isPending}
            onClick={handleBook}
          >
            {bookAppointment.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
