import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDoctorProfile } from "@/hooks/useDoctorPatients";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function DoctorAppointments() {
  const { doctorProfile } = useDoctorProfile();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["doctor_all_appointments", doctorProfile?.id],
    enabled: !!doctorProfile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", doctorProfile!.id)
        .order("appointment_date", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">My Appointments</h2>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : appointments.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center py-12">
            <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No appointments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {appointments.map((apt: any) => (
            <Card key={apt.id} className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{apt.reason || "Consultation"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(apt.appointment_date), "MMM dd, yyyy")} • {apt.start_time?.slice(0, 5)} - {apt.end_time?.slice(0, 5)}
                  </p>
                </div>
                <Badge variant={apt.status === "upcoming" ? "default" : "secondary"}>{apt.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
