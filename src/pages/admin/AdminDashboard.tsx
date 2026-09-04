import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Stethoscope,
  Calendar,
  FileText,
  Pill,
  MessageSquare,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAdminAnalytics, useRecentActivity } from "@/hooks/useAdminAnalytics";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { analytics, isLoading } = useAdminAnalytics();
  const { activity } = useRecentActivity();

  const a = analytics;
  const stats = [
    { label: "Patients", value: a?.patients ?? 0, icon: Users, tint: "bg-primary/10 text-primary", to: "/admin/patients" },
    { label: "Doctors", value: a?.doctors ?? 0, icon: Stethoscope, tint: "bg-secondary/10 text-secondary", to: "/admin/doctors" },
    { label: "Appointments", value: a?.appointments ?? 0, icon: Calendar, tint: "bg-warning/10 text-warning", to: "/admin/appointments" },
    { label: "Reports", value: a?.reports ?? 0, icon: FileText, tint: "bg-info/10 text-info" },
    { label: "Prescriptions", value: a?.prescriptions ?? 0, icon: Pill, tint: "bg-primary/10 text-primary" },
    { label: "Conversations", value: a?.conversations ?? 0, icon: MessageSquare, tint: "bg-secondary/10 text-secondary" },
  ];

  const totalApt = Math.max(a?.appointments ?? 0, 1);
  const breakdown = [
    { label: "Today", value: a?.todayScheduled ?? 0, icon: Clock, tone: "text-secondary" },
    { label: "Upcoming", value: a?.upcoming ?? 0, icon: Clock, tone: "text-primary" },
    { label: "Needs update", value: a?.pendingReview ?? 0, icon: Clock, tone: "text-warning" },
    { label: "Completed", value: a?.completed ?? 0, icon: CheckCircle2, tone: "text-secondary" },
    { label: "Missed", value: a?.missed ?? 0, icon: XCircle, tone: "text-warning" },
    { label: "Cancelled", value: a?.cancelled ?? 0, icon: XCircle, tone: "text-destructive" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">Live platform overview across all portals</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="h-3 w-3" /> {a?.newPatientsThisWeek ?? 0} new patients this week
        </Badge>
      </div>

      {/* Action required */}
      {(a?.pendingDoctors ?? 0) > 0 && (
        <Card className="border-warning/40 shadow-sm">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <ShieldAlert className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{a?.pendingDoctors} doctor application(s) awaiting review</p>
                <p className="text-xs text-muted-foreground">Verify license and certificate documents before approving.</p>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate("/admin/doctors")}>
              Review now <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card
            key={s.label}
            className={`shadow-sm ${s.to ? "cursor-pointer transition-colors hover:bg-muted/50" : ""}`}
            onClick={() => s.to && navigate(s.to)}
          >
            <CardContent className="space-y-2 p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.tint}`}>
                <s.icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Appointment breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Appointment status
              </span>
              <Badge variant="outline">{a?.appointmentsToday ?? 0} today</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((b) => (
              <div key={b.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <b.icon className={`h-3.5 w-3.5 ${b.tone}`} /> {b.label}
                  </span>
                  <span className="font-semibold text-foreground">{b.value}</span>
                </div>
                <Progress value={(b.value / totalApt) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Doctor verification funnel */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-secondary" /> Doctor verification
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending", value: a?.pendingDoctors ?? 0, tone: "text-warning" },
              { label: "Approved", value: a?.approvedDoctors ?? 0, tone: "text-secondary" },
              { label: "Rejected", value: a?.rejectedDoctors ?? 0, tone: "text-destructive" },
            ].map((d) => (
              <div key={d.label} className="rounded-xl border p-3 text-center">
                <p className={`text-2xl font-bold ${d.tone}`}>{d.value}</p>
                <p className="text-xs text-muted-foreground">{d.label}</p>
              </div>
            ))}
            <div className="col-span-3">
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/admin/doctors")}>
                Manage doctors
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Newest patients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(activity?.patients || []).length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">No patients yet</p>
            )}
            {(activity?.patients || []).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-foreground">{p.full_name || "Unnamed"}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent doctor applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(activity?.doctors || []).length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">No applications</p>
            )}
            {(activity?.doctors || []).map((d: any) => (
              <div key={d.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-foreground">Dr. {d.full_name}</span>
                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">{d.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              Latest reports
              {(a?.unresolvedAlerts ?? 0) > 0 && (
                <Badge variant="destructive" className="text-[10px]">{a?.unresolvedAlerts} alerts</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(activity?.reports || []).length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">No reports uploaded</p>
            )}
            {(activity?.reports || []).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-foreground">{r.title}</span>
                <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">{r.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
