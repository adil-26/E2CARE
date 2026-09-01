import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Plus, Trash2, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDoctorProfile } from "@/hooks/useDoctorPatients";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorAvailability() {
  const { doctorProfile } = useDoctorProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [day, setDay] = useState("1");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [slot, setSlot] = useState("30");

  const doctorId = doctorProfile?.id;

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["doctor_availability", doctorId],
    enabled: !!doctorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_availability")
        .select("*")
        .eq("doctor_id", doctorId!)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data || [];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["doctor_availability", doctorId] });

  const addSlot = useMutation({
    mutationFn: async () => {
      if (end <= start) throw new Error("End time must be after start time");
      const { error } = await supabase.from("doctor_availability").insert({
        doctor_id: doctorId!,
        day_of_week: Number(day),
        start_time: start,
        end_time: end,
        slot_duration_minutes: Number(slot),
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Availability added" });
    },
    onError: (e: any) => toast({ title: "Could not add slot", description: e.message, variant: "destructive" }),
  });

  const toggleSlot = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("doctor_availability").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctor_availability").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Slot removed" });
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Availability</h2>
        <Badge variant="secondary">{slots.filter((s: any) => s.is_active).length} active</Badge>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" /> Add weekly slot
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-5">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Day</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => (
                  <SelectItem key={d} value={String(i)}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input type="time" className="h-10" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input type="time" className="h-10" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Slot (min)</Label>
            <Select value={slot} onValueChange={setSlot}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["15", "20", "30", "45", "60"].map((m) => (
                  <SelectItem key={m} value={m}>{m} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-5">
            <Button onClick={() => addSlot.mutate()} disabled={addSlot.isPending || !doctorId} className="w-full sm:w-auto">
              <Plus className="mr-1 h-4 w-4" /> Add slot
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4 text-primary" /> Weekly schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : slots.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No availability set — patients cannot see your open slots yet.
            </p>
          ) : (
            <div className="space-y-2">
              {slots.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{DAYS[s.day_of_week]}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)} • {s.slot_duration_minutes} min slots
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Power className={`h-3.5 w-3.5 ${s.is_active ? "text-primary" : "text-muted-foreground"}`} />
                    <Switch
                      checked={s.is_active}
                      onCheckedChange={(v) => toggleSlot.mutate({ id: s.id, is_active: v })}
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeSlot.mutate(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
