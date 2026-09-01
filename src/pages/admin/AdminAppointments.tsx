import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Search, Clock, User, Stethoscope, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAppointments } from "@/hooks/useDoctorAppointments";
import { format, parseISO } from "date-fns";

const FILTERS = ["all", "upcoming", "completed", "cancelled"] as const;

export default function AdminAppointments() {
  const navigate = useNavigate();
  const { appointments, isLoading } = useAdminAppointments();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const filtered = appointments.filter((apt: any) => {
    const matchStatus = filter === "all" || apt.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (apt.patient?.full_name || "").toLowerCase().includes(q) ||
      (apt.doctors?.full_name || "").toLowerCase().includes(q) ||
      (apt.reason || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">All Appointments</h2>
        <Badge variant="secondary">{appointments.length} total</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by patient, doctor or reason..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">
              {f} ({f === "all" ? appointments.length : appointments.filter((a: any) => a.status === f).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center py-12">
            <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No appointments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((apt: any) => (
            <Card key={apt.id} className="shadow-sm">
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{apt.reason || "Consultation"}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {apt.patient?.full_name || "Unknown patient"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" /> Dr. {apt.doctors?.full_name || "Unassigned"}
                      {apt.doctors?.specialization ? ` • ${apt.doctors.specialization}` : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(apt.appointment_date), "MMM dd, yyyy")} • {apt.start_time?.slice(0, 5)}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={apt.status === "upcoming" ? "default" : apt.status === "cancelled" ? "outline" : "secondary"}
                  className="capitalize"
                >
                  {apt.status}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/patients/${apt.user_id}`)}>
                  Patient <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
