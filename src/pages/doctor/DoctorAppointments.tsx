import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Phone, User, CheckCircle2, XCircle, StickyNote, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDoctorProfile } from "@/hooks/useDoctorPatients";
import { useDoctorAppointments, type AppointmentWithPatient } from "@/hooks/useDoctorAppointments";
import { format, isToday, parseISO } from "date-fns";

const statusVariant = (status: string) =>
  status === "upcoming" ? "default" : status === "completed" ? "secondary" : "outline";

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { doctorProfile } = useDoctorProfile();
  const { appointments, isLoading, updateStatus, saveNotes } = useDoctorAppointments(doctorProfile?.id);
  const [noteTarget, setNoteTarget] = useState<AppointmentWithPatient | null>(null);
  const [noteText, setNoteText] = useState("");

  const todayList = appointments.filter((a) => isToday(parseISO(a.appointment_date)));
  const upcoming = appointments.filter(
    (a) => a.status === "upcoming" && new Date(a.appointment_date) >= new Date(new Date().toDateString())
  );
  const past = appointments.filter(
    (a) => a.status !== "upcoming" || new Date(a.appointment_date) < new Date(new Date().toDateString())
  );

  const openNotes = (apt: AppointmentWithPatient) => {
    setNoteTarget(apt);
    setNoteText(apt.notes || "");
  };

  const renderList = (list: AppointmentWithPatient[]) => {
    if (isLoading) return <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>;
    if (list.length === 0)
      return (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center py-12">
            <Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No appointments here</p>
          </CardContent>
        </Card>
      );

    return (
      <div className="space-y-2">
        {list.map((apt) => {
          const name = apt.patient?.full_name || "Unknown patient";
          const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
          return (
            <Card key={apt.id} className="shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11">
                    {apt.patient?.profile_photo_url && (
                      <AvatarImage src={apt.patient.profile_photo_url} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{name}</p>
                      <Badge variant={statusVariant(apt.status)} className="capitalize">{apt.status}</Badge>
                      {apt.patient?.blood_group && (
                        <Badge variant="outline" className="text-[10px]">{apt.patient.blood_group}</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{apt.reason || "General consultation"}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(apt.appointment_date), "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {apt.start_time?.slice(0, 5)} – {apt.end_time?.slice(0, 5)}
                      </span>
                      {apt.patient?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {apt.patient.phone}
                        </span>
                      )}
                    </div>
                    {apt.notes && (
                      <p className="mt-2 rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground">{apt.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/doctor/patients/${apt.user_id}`)}>
                    <User className="mr-1 h-3.5 w-3.5" /> Patient file
                    <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openNotes(apt)}>
                    <StickyNote className="mr-1 h-3.5 w-3.5" /> Notes
                  </Button>
                  {apt.status === "upcoming" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: apt.id, status: "completed" })}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Appointments</h2>
        <Badge variant="secondary">{appointments.length} total</Badge>
      </div>

      <Tabs defaultValue="today">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="today">Today ({todayList.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">History ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">{renderList(todayList)}</TabsContent>
        <TabsContent value="upcoming" className="mt-4">{renderList(upcoming)}</TabsContent>
        <TabsContent value="past" className="mt-4">{renderList(past)}</TabsContent>
      </Tabs>

      <Dialog open={!!noteTarget} onOpenChange={(o) => !o && setNoteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consultation notes</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={6}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Observations, advice, follow-up plan..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteTarget(null)}>Cancel</Button>
            <Button
              disabled={saveNotes.isPending}
              onClick={() => {
                if (noteTarget) saveNotes.mutate({ id: noteTarget.id, notes: noteText });
                setNoteTarget(null);
              }}
            >
              Save notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
