import { motion } from "framer-motion";
import { Users, Calendar, FileText, Pill, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoctorProfile, useDoctorPatients } from "@/hooks/useDoctorPatients";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function DoctorDashboard() {
  const { doctorProfile } = useDoctorProfile();
  const { patients } = useDoctorPatients(doctorProfile?.id);

  const { data: todayAppointments = [] } = useQuery({
    queryKey: ["doctor_today_appointments", doctorProfile?.id],
    enabled: !!doctorProfile?.id,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctorProfile!.id)
        .eq("appointment_date", today)
        .order("start_time");
      return data || [];
    },
  });

  const { data: recentPrescriptions = [] } = useQuery({
    queryKey: ["doctor_recent_prescriptions", doctorProfile?.id],
    enabled: !!doctorProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("doctor_id", doctorProfile!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const stats = [
    { label: "Total Patients", value: patients.length, icon: Users, color: "text-primary" },
    { label: "Today's Appointments", value: todayAppointments.length, icon: Calendar, color: "text-secondary" },
    { label: "Prescriptions", value: recentPrescriptions.length, icon: Pill, color: "text-info" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Welcome, Dr. {doctorProfile?.full_name || "Doctor"}
        </h2>
        <p className="text-sm text-muted-foreground">{doctorProfile?.specialization}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Appointments */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />
            Today's Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No appointments today</p>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((apt: any) => (
                <div key={apt.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      Patient
                    </p>
                    <p className="text-xs text-muted-foreground">{apt.reason || "General consultation"}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{apt.start_time?.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
