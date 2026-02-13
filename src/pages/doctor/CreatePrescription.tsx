import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDoctorProfile, useDoctorPatients } from "@/hooks/useDoctorPatients";
import { useDoctorPrescriptions, Medicine } from "@/hooks/usePrescriptions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function CreatePrescription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatient = searchParams.get("patient") || "";
  const { toast } = useToast();
  const { doctorProfile } = useDoctorProfile();
  const { patients } = useDoctorPatients(doctorProfile?.id);
  const { createPrescription } = useDoctorPrescriptions(doctorProfile?.id);

  const [patientId, setPatientId] = useState(preselectedPatient);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSubmit = () => {
    if (!patientId || !diagnosis || medicines.some((m) => !m.name || !m.dosage)) {
      toast({ title: "Missing Fields", description: "Fill patient, diagnosis, and all medicine details.", variant: "destructive" });
      return;
    }

    createPrescription.mutate(
      { patient_id: patientId, diagnosis, notes, medicines },
      {
        onSuccess: () => {
          toast({ title: "Prescription Created", description: "Patient has been notified." });
          navigate("/doctor/prescriptions");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create prescription.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>

      <h2 className="font-display text-xl font-bold text-foreground">Create Prescription</h2>

      {/* Patient & Diagnosis */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Patient & Diagnosis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.map((p: any) => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.full_name || "Unknown"} {p.medical_id ? `(${p.medical_id})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Diagnosis</Label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g., Viral fever with throat infection" />
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional instructions or observations" rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Medicines */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Medicines</CardTitle>
          <Button size="sm" variant="outline" onClick={addMedicine}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Medicine
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {medicines.map((med, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Medicine {i + 1}</span>
                {medicines.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMedicine(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input value={med.name} onChange={(e) => updateMedicine(i, "name", e.target.value)} placeholder="e.g., Paracetamol" />
                </div>
                <div>
                  <Label className="text-xs">Dosage</Label>
                  <Input value={med.dosage} onChange={(e) => updateMedicine(i, "dosage", e.target.value)} placeholder="e.g., 500mg" />
                </div>
                <div>
                  <Label className="text-xs">Frequency</Label>
                  <Input value={med.frequency} onChange={(e) => updateMedicine(i, "frequency", e.target.value)} placeholder="e.g., 3x daily" />
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <Input value={med.duration} onChange={(e) => updateMedicine(i, "duration", e.target.value)} placeholder="e.g., 5 days" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Instructions</Label>
                <Input value={med.instructions || ""} onChange={(e) => updateMedicine(i, "instructions", e.target.value)} placeholder="e.g., After meals" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={createPrescription.isPending}>
        {createPrescription.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Create Prescription & Notify Patient
      </Button>
    </motion.div>
  );
}
