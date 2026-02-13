import { motion } from "framer-motion";
import { Calendar, FileText, Pill, Activity, Clock as ClockIcon, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTimeline, TimelineEvent } from "@/hooks/useTimeline";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  appointment: { icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
  report: { icon: FileText, color: "text-secondary", bg: "bg-secondary/10" },
  prescription: { icon: Stethoscope, color: "text-info", bg: "bg-info/10" },
  medication: { icon: Pill, color: "text-warning", bg: "bg-warning/10" },
  vital: { icon: Activity, color: "text-success", bg: "bg-success/10" },
};

function formatDate(dateStr: string) {
  try {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, "MMM dd, yyyy") : dateStr;
  } catch {
    return dateStr;
  }
}

export default function Timeline() {
  const { events, isLoading } = useTimeline();

  // Group events by month
  const grouped: Record<string, TimelineEvent[]> = {};
  events.forEach((e) => {
    try {
      const d = parseISO(e.date);
      const key = isValid(d) ? format(d, "MMMM yyyy") : "Unknown";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    } catch {
      if (!grouped["Unknown"]) grouped["Unknown"] = [];
      grouped["Unknown"].push(e);
    }
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">Health Timeline</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <ClockIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ClockIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="font-display text-lg font-semibold text-foreground">Your Health Journey</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your timeline will populate as you book appointments, upload reports, and receive prescriptions.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month}>
            <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {month}
            </h3>
            <div className="relative ml-4 border-l-2 border-border pl-6 space-y-4">
              {monthEvents.map((event) => {
                const config = typeConfig[event.type] || typeConfig.vital;
                const Icon = config.icon;
                return (
                  <div key={event.id} className="relative">
                    <div className={cn("absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full", config.bg)}>
                      <Icon className={cn("h-3 w-3", config.color)} />
                    </div>
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-foreground">{event.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                            {event.status && (
                              <Badge variant={event.status === "active" || event.status === "upcoming" ? "default" : "secondary"} className="text-[10px]">
                                {event.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}
