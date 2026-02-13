import { motion } from "framer-motion";
import { Users, Stethoscope, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const { data: doctorCount = 0 } = useQuery({
    queryKey: ["admin_doctor_count"],
    queryFn: async () => {
      const { count } = await supabase.from("doctors").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: patientCount = 0 } = useQuery({
    queryKey: ["admin_patient_count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: appointmentCount = 0 } = useQuery({
    queryKey: ["admin_appointment_count"],
    queryFn: async () => {
      const { count } = await supabase.from("appointments").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const stats = [
    { label: "Total Doctors", value: doctorCount, icon: Stethoscope, color: "text-secondary" },
    { label: "Total Patients", value: patientCount, icon: Users, color: "text-primary" },
    { label: "Total Appointments", value: appointmentCount, icon: Calendar, color: "text-warning" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h2>

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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage doctors, view patient activity, and monitor platform health from this dashboard.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
