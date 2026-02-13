import { useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Search, Check, X, Trash2, Loader2, Clock, UserCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ManageDoctors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["admin_doctors"],
    queryFn: async () => {
      const { data } = await supabase.from("doctors").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const approveDoctor = useMutation({
    mutationFn: async (doctor: any) => {
      // Update status to approved
      const { error: updateErr } = await supabase
        .from("doctors")
        .update({ status: "approved", is_available: true })
        .eq("id", doctor.id);
      if (updateErr) throw updateErr;

      // Grant doctor role if user_id exists
      if (doctor.user_id) {
        const { error: roleErr } = await supabase
          .from("user_roles")
          .upsert({ user_id: doctor.user_id, role: "doctor" as any }, { onConflict: "user_id,role" });
        if (roleErr) throw roleErr;

        // Send notification
        await supabase.from("notifications").insert({
          user_id: doctor.user_id,
          title: "Doctor Application Approved! 🎉",
          message: "Your doctor registration has been approved. You can now access the doctor portal.",
          type: "success",
          link: "/doctor",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_doctors"] });
      toast({ title: "Doctor Approved ✅", description: "The doctor can now access their portal." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const rejectDoctor = useMutation({
    mutationFn: async (doctor: any) => {
      const { error } = await supabase
        .from("doctors")
        .update({ status: "rejected", is_available: false })
        .eq("id", doctor.id);
      if (error) throw error;

      if (doctor.user_id) {
        await supabase.from("notifications").insert({
          user_id: doctor.user_id,
          title: "Doctor Application Update",
          message: "Your doctor registration was not approved at this time. Please contact support for details.",
          type: "warning",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_doctors"] });
      toast({ title: "Application Rejected" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteDoctor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_doctors"] });
      toast({ title: "Doctor Removed" });
    },
  });

  const filterByStatus = (status: string) =>
    doctors.filter(
      (d: any) =>
        d.status === status &&
        (d.full_name.toLowerCase().includes(search.toLowerCase()) ||
          d.specialization.toLowerCase().includes(search.toLowerCase()))
    );

  const pendingDoctors = filterByStatus("pending");
  const approvedDoctors = filterByStatus("approved");
  const rejectedDoctors = filterByStatus("rejected");

  const DoctorCard = ({ doc, showActions }: { doc: any; showActions: "pending" | "approved" | "rejected" }) => (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
            <Stethoscope className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground">Dr. {doc.full_name}</p>
              <Badge variant={
                doc.status === "approved" ? "default" :
                doc.status === "rejected" ? "destructive" : "secondary"
              } className="text-xs">
                {doc.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{doc.specialization}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
              {doc.qualification && <span>{doc.qualification}</span>}
              <span>{doc.experience_years}y experience</span>
              <span>₹{doc.consultation_fee} fee</span>
              {doc.hospital && <span>{doc.hospital}</span>}
              {doc.license_number && <span>License: {doc.license_number}</span>}
            </div>
            {doc.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.bio}</p>}
            <div className="flex gap-2 mt-1.5 flex-wrap items-center">
              {doc.languages && doc.languages.length > 0 && doc.languages.map((lang: string) => (
                <Badge key={lang} variant="outline" className="text-[10px] px-1.5 py-0">{lang}</Badge>
              ))}
              {doc.license_url && (
                <a href={doc.license_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium text-primary underline">
                  View License
                </a>
              )}
              {doc.certificate_url && (
                <a href={doc.certificate_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium text-primary underline">
                  View Certificate
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {showActions === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 gap-1"
                  onClick={() => approveDoctor.mutate(doc)}
                  disabled={approveDoctor.isPending}
                >
                  {approveDoctor.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 gap-1"
                  onClick={() => rejectDoctor.mutate(doc)}
                  disabled={rejectDoctor.isPending}
                >
                  <X className="h-3 w-3" /> Reject
                </Button>
              </>
            )}
            {showActions === "approved" && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteDoctor.mutate(doc.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
            {showActions === "rejected" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1"
                onClick={() => approveDoctor.mutate(doc)}
                disabled={approveDoctor.isPending}
              >
                <Check className="h-3 w-3" /> Approve
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ icon: Icon, message }: { icon: any; message: string }) => (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col items-center py-12">
        <Icon className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="font-display text-xl font-bold text-foreground">Manage Doctors</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search doctors..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            Pending ({pendingDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1">
            <UserCheck className="h-3.5 w-3.5" />
            Approved ({approvedDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1">
            <UserX className="h-3.5 w-3.5" />
            Rejected ({rejectedDoctors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-2 pt-4">
          {pendingDoctors.length === 0 ? (
            <EmptyState icon={Clock} message="No pending applications" />
          ) : (
            pendingDoctors.map((doc: any) => <DoctorCard key={doc.id} doc={doc} showActions="pending" />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-2 pt-4">
          {approvedDoctors.length === 0 ? (
            <EmptyState icon={UserCheck} message="No approved doctors" />
          ) : (
            approvedDoctors.map((doc: any) => <DoctorCard key={doc.id} doc={doc} showActions="approved" />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-2 pt-4">
          {rejectedDoctors.length === 0 ? (
            <EmptyState icon={UserX} message="No rejected applications" />
          ) : (
            rejectedDoctors.map((doc: any) => <DoctorCard key={doc.id} doc={doc} showActions="rejected" />)
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
