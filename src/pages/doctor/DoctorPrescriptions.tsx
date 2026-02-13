import { motion } from "framer-motion";
import { Pill, Eye, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDoctorProfile } from "@/hooks/useDoctorPatients";
import { useDoctorPrescriptions } from "@/hooks/usePrescriptions";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function DoctorPrescriptions() {
  const navigate = useNavigate();
  const { doctorProfile } = useDoctorProfile();
  const { prescriptions, isLoading } = useDoctorPrescriptions(doctorProfile?.id);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Prescriptions</h2>
        <Button size="sm" onClick={() => navigate("/doctor/prescriptions/new")}>
          <Plus className="mr-1 h-4 w-4" /> New Prescription
        </Button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading prescriptions...</p>
      ) : prescriptions.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center py-12">
            <Pill className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No prescriptions created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {prescriptions.map((rx: any) => (
            <Card key={rx.id} className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Pill className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{rx.diagnosis || "Prescription"}</p>
                  <p className="text-xs text-muted-foreground">
                    {Array.isArray(rx.medicines) ? `${rx.medicines.length} medicines` : "—"} •{" "}
                    {format(new Date(rx.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
                <Badge variant={rx.status === "active" ? "default" : "secondary"}>{rx.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
