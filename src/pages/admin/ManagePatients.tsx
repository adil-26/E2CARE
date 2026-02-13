import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Search, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ManagePatients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["admin_patients"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("full_name");
      return data || [];
    },
  });

  const filtered = patients.filter((p: any) =>
    (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.medical_id || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Manage Patients</h2>
        <Badge variant="secondary">{patients.length} total</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search patients..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center py-12">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No patients found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((p: any) => {
            const initials = (p.full_name || "P").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <Card
                key={p.id}
                className="shadow-sm cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => navigate(`/admin/patients/${p.user_id}`)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{p.full_name || "Unknown"}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {p.gender && <span className="capitalize">{p.gender}</span>}
                      {p.blood_group && <span>Blood: {p.blood_group}</span>}
                      {p.phone && <span>📞 {p.phone}</span>}
                    </div>
                  </div>
                  {p.medical_id && <Badge variant="outline" className="text-xs">ID: {p.medical_id}</Badge>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
