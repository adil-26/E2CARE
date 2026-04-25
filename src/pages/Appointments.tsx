import { useState, useMemo } from "react";
import { isPast } from "date-fns";
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
    () => appointments.filter((a) => {
      if (a.status !== "upcoming") return false;
      const apptDate = new Date(`${a.appointment_date}T${a.start_time || "00:00"}:00`);
      return !isPast(apptDate);
    }),
    [appointments]
  );
  const pastAppointments = useMemo(
    () => appointments.filter((a) => {
      if (a.status !== "upcoming") return true;
      const apptDate = new Date(`${a.appointment_date}T${a.start_time || "00:00"}:00`);
      return isPast(apptDate);
    }),
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-50/80 to-blue-50/50 p-5 rounded-2xl border border-teal-100/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-teal-600 rounded-full" />
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-800 m-0">Appointments</h2>
            <p className="text-xs text-slate-500 mt-0.5">Find doctors and manage your consultations</p>
          </div>
        </div>
        {upcomingAppointments.length > 0 && (
          <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-teal-100 shadow-sm shrink-0">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </div>
            <span className="text-xs font-semibold text-teal-700">{upcomingAppointments.length} upcoming</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100/80 rounded-xl overflow-hidden w-full max-w-sm border border-slate-200/60 shadow-inner">
        <button
          onClick={() => setTab("find")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${tab === "find"
              ? "bg-white text-teal-700 shadow-sm ring-1 ring-slate-900/5"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
        >
          <Users className="h-4 w-4" /> Find Doctor
        </button>
        <button
          onClick={() => setTab("my")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${tab === "my"
              ? "bg-white text-teal-700 shadow-sm ring-1 ring-slate-900/5"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
        >
          <Calendar className="h-4 w-4" /> My Appointments
        </button>
      </div>

      {/* Find Doctor Tab */}
      <motion.div 
        key={tab} 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.2 }}
        className="w-full"
      >
      {tab === "find" && (
        <div className="space-y-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              className="pl-12 h-12 text-sm sm:text-base rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-teal-500/30"
              placeholder="Search doctors, specialties, hospitals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Specialty filter pills */}
          <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-none -mx-1 px-1 snap-x mt-4">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => setActiveSpec(spec)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${activeSpec === spec
                    ? "bg-teal-600 text-white shadow-md shadow-teal-500/20 scale-105"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/50 shadow-sm"
                  }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Doctor list */}
          {filteredDoctors.length === 0 ? (
            <Card className="shadow-sm border-dashed border-slate-300 bg-slate-50/50 mt-6">
              <CardContent className="py-14 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No doctors found matching your search.</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
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
      </motion.div>

      {/* Booking dialog */}
      <BookingDialog
        doctor={bookingDoctor}
        open={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
      />
    </motion.div>
  );
}
