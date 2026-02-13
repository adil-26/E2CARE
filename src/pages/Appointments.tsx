import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAppointments, Doctor } from "@/hooks/useAppointments";
import DoctorCard from "@/components/appointments/DoctorCard";
import BookingDialog from "@/components/appointments/BookingDialog";
import AppointmentCard from "@/components/appointments/AppointmentCard";

const SPECIALTIES = ["All", "General Physician", "Cardiologist", "Dermatologist", "Orthopedic Surgeon", "Pediatrician", "ENT Specialist", "Gynecologist", "Neurologist"];

export default function Appointments() {
  const { doctors, isDoctorsLoading, appointments, isAppointmentsLoading, cancelAppointment } = useAppointments();
  const [search, setSearch] = useState("");
  const [activeSpec, setActiveSpec] = useState("All");
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [tab, setTab] = useState<"find" | "my">("find");

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    let list = doctors;
    if (activeSpec !== "All") {
      list = list.filter((d) => d.specialization === activeSpec);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.full_name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          (d.hospital && d.hospital.toLowerCase().includes(q))
      );
    }
    return list;
  }, [doctors, activeSpec, search]);

  // Separate upcoming and past appointments
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.status === "upcoming"),
    [appointments]
  );
  const pastAppointments = useMemo(
    () => appointments.filter((a) => a.status !== "upcoming"),
    [appointments]
  );

  const isLoading = isDoctorsLoading || isAppointmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">Appointments</h2>
        {upcomingAppointments.length > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {upcomingAppointments.length} upcoming
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("find")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${tab === "find"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
        >
          <Users className="h-3.5 w-3.5" /> Find Doctor
        </button>
        <button
          onClick={() => setTab("my")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${tab === "my"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
        >
          <Calendar className="h-3.5 w-3.5" /> My Appointments
          {upcomingAppointments.length > 0 && (
            <span className="ml-0.5 bg-primary-foreground/20 rounded-full px-1.5 text-[10px]">
              {upcomingAppointments.length}
            </span>
          )}
        </button>
      </div>

      {/* Find Doctor Tab */}
      {tab === "find" && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-10 text-sm"
              placeholder="Search doctors, specialties, hospitals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Specialty filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1 snap-x">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => setActiveSpec(spec)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${activeSpec === spec
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Doctor list */}
          {filteredDoctors.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-10 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No doctors found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredDoctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} onBook={setBookingDoctor} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Appointments Tab */}
      {tab === "my" && (
        <div className="space-y-4">
          {/* Upcoming */}
          {upcomingAppointments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming</h3>
              {upcomingAppointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onCancel={(id) => cancelAppointment.mutate(id)}
                  isCancelling={cancelAppointment.isPending}
                />
              ))}
            </div>
          )}

          {/* Past */}
          {pastAppointments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Past & Cancelled</h3>
              {pastAppointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onCancel={() => { }}
                  isCancelling={false}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {appointments.length === 0 && (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <h3 className="font-semibold text-sm text-foreground">No Appointments Yet</h3>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Find a doctor and book your first appointment.
                </p>
                <button
                  onClick={() => setTab("find")}
                  className="mt-3 text-xs text-primary font-medium hover:underline"
                >
                  Find a Doctor →
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Booking dialog */}
      <BookingDialog
        doctor={bookingDoctor}
        open={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
      />
    </motion.div>
  );
}
