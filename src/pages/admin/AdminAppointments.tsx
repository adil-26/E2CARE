import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function AdminAppointments() {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["admin_all_appointments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*, doctors(full_name, specialization)")
        .order("appointment_date", { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">All Appointments</h2>
        <Badge variant="secondary">{appointments.length} total</Badge>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : appointments.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center py-12">
            <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No appointments</p>
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
                  <p className="font-medium text-foreground">
                    {apt.reason || "Consultation"} — Dr. {(apt.doctors as any)?.full_name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(apt.appointment_date), "MMM dd, yyyy")} • {apt.start_time?.slice(0, 5)}
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
