import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, isSameMonth } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BarChart3, Users, IndianRupee, CalendarCheck, Pill, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useDoctorProfile } from "@/hooks/useDoctorPatients";
import { getEffectiveStatus } from "@/lib/appointmentStatus";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

function StatCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string; hint?: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DoctorAnalytics() {
  const { doctorProfile } = useDoctorProfile();
  const doctorId = doctorProfile?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["doctor_analytics", doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const [apptRes, prescRes] = await Promise.all([
        supabase.from("appointments").select("*").eq("doctor_id", doctorId!),
        supabase.from("prescriptions").select("id, created_at").eq("doctor_id", doctorId!),
      ]);
      if (apptRes.error) throw apptRes.error;
      if (prescRes.error) throw prescRes.error;
      return { appointments: apptRes.data || [], prescriptions: prescRes.data || [] };
    },
  });

  const stats = useMemo(() => {
    const appts = data?.appointments ?? [];
    const effective = appts.map((a: any) => ({ ...a, eff: getEffectiveStatus(a) }));

    const completed = effective.filter((a) => a.eff === "completed").length;
    const missed = effective.filter((a) => a.eff === "missed").length;
    const upcoming = effective.filter((a) => a.eff === "upcoming").length;
    const cancelled = effective.filter((a) => a.eff === "cancelled").length;
    const uniquePatients = new Set(appts.map((a: any) => a.user_id)).size;
    const fee = doctorProfile?.consultation_fee ?? 0;

    const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
    const trend = months.map((m) => {
      const inMonth = effective.filter((a) => isSameMonth(new Date(a.appointment_date), m));
      return {
        month: format(m, "MMM"),
        consultations: inMonth.filter((a) => a.eff === "completed").length,
        booked: inMonth.length,
      };
    });

    const breakdown = [
      { name: "Completed", value: completed },
      { name: "Upcoming", value: upcoming },
      { name: "Missed", value: missed },
      { name: "Cancelled", value: cancelled },
    ].filter((d) => d.value > 0);

    const finished = completed + missed;
    return {
      completed,
      missed,
      upcoming,
      uniquePatients,
      revenue: completed * fee,
      trend,
      breakdown,
      showRate: finished ? Math.round((completed / finished) * 100) : 0,
      prescriptions: data?.prescriptions.length ?? 0,
    };
  }, [data, doctorProfile]);

  if (isLoading) {
    return <div className="py-16 text-center text-muted-foreground">Loading analytics…</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Practice Analytics</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Consultations" value={String(stats.completed)} hint={`${stats.upcoming} upcoming`} />
        <StatCard icon={Users} label="Patients" value={String(stats.uniquePatients)} hint="Unique patients seen" />
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} hint="Completed × fee" />
        <StatCard icon={TrendingUp} label="Show rate" value={`${stats.showRate}%`} hint={`${stats.missed} missed`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Last 6 months</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="booked" name="Booked" fill="hsl(var(--muted-foreground))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="consultations" name="Completed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Appointment mix</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {stats.breakdown.length === 0 ? (
              <p className="pt-16 text-center text-sm text-muted-foreground">No appointments yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.breakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {stats.breakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <Pill className="h-5 w-5 text-warning" />
          <p className="text-sm text-foreground">
            <span className="font-bold">{stats.prescriptions}</span> prescriptions issued from your account.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
