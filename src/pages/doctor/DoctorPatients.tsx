import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Eye, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDoctorProfile, useDoctorPatients } from "@/hooks/useDoctorPatients";
import { useNavigate } from "react-router-dom";

export default function DoctorPatients() {
  const navigate = useNavigate();
  const { doctorProfile } = useDoctorProfile();
  const { patients, isLoading } = useDoctorPatients(doctorProfile?.id);
  const [search, setSearch] = useState("");

  const filtered = patients.filter((p: any) =>
    (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.medical_id || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">My Patients</h2>
        <Badge variant="secondary">{patients.length} patients</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or ID..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading patients...</p>
      ) : filtered.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center py-12">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No patients found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((patient: any) => {
            const initials = (patient.full_name || "P")
              .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <Card key={patient.id} className="shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 font-medium text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{patient.full_name || "Unknown Patient"}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {patient.gender && <span className="capitalize">{patient.gender}</span>}
                      {patient.blood_group && <span>Blood: {patient.blood_group}</span>}
                      {patient.medical_id && <span>ID: {patient.medical_id}</span>}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/doctor/patients/${patient.user_id}`)}
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    View
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
