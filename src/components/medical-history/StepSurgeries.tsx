import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Surgery {
  name: string;
  year: string;
  hospital: string;
  reason: string;
  complications: string;
}

interface Hospitalization {
  reason: string;
  year: string;
  duration: string;
  hospital: string;
}

interface StepSurgeriesProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const emptySurgery: Surgery = { name: "", year: "", hospital: "", reason: "", complications: "" };
const emptyHospitalization: Hospitalization = { reason: "", year: "", duration: "", hospital: "" };

export default function StepSurgeries({ data, onChange }: StepSurgeriesProps) {
  const surgeries: Surgery[] = data.surgeries || [];
  const hospitalizations: Hospitalization[] = data.hospitalizations || [];

  const updateSurgery = (index: number, field: keyof Surgery, value: string) => {
    const updated = [...surgeries];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, surgeries: updated });
  };

  const addSurgery = () => onChange({ ...data, surgeries: [...surgeries, { ...emptySurgery }] });
  const removeSurgery = (i: number) => onChange({ ...data, surgeries: surgeries.filter((_, idx) => idx !== i) });

  const updateHospitalization = (index: number, field: keyof Hospitalization, value: string) => {
    const updated = [...hospitalizations];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, hospitalizations: updated });
  };

  const addHospitalization = () => onChange({ ...data, hospitalizations: [...hospitalizations, { ...emptyHospitalization }] });
  const removeHospitalization = (i: number) => onChange({ ...data, hospitalizations: hospitalizations.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        List any surgeries or hospitalizations you've had. This is important for your medical records.
      </p>

      {/* Surgeries */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-semibold">Surgeries</Label>
          <Button type="button" size="sm" variant="outline" onClick={addSurgery} className="h-8 gap-1 text-xs active:scale-95">
            <Plus className="h-3 w-3" /> Add Surgery
          </Button>
        </div>

        {surgeries.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground italic">No surgeries added. Click "Add Surgery" if applicable.</p>
        ) : (
          <div className="space-y-3">
            {surgeries.map((s, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Surgery {i + 1}</span>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeSurgery(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">Surgery Name / Type</Label>
                      <Input className="h-10 text-sm" placeholder="e.g. Appendectomy" value={s.name} onChange={(e) => updateSurgery(i, "name", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">Year</Label>
                      <Input className="h-10 text-sm" type="number" placeholder="e.g. 2020" value={s.year} onChange={(e) => updateSurgery(i, "year", e.target.value)} min="1900" max="2030" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">Hospital</Label>
                      <Input className="h-10 text-sm" placeholder="Hospital name" value={s.hospital} onChange={(e) => updateSurgery(i, "hospital", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">Reason</Label>
                      <Input className="h-10 text-sm" placeholder="Reason for surgery" value={s.reason} onChange={(e) => updateSurgery(i, "reason", e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Label className="text-[10px] sm:text-xs">Complications (if any)</Label>
                    <Input className="h-10 text-sm" placeholder="Any post-surgery complications" value={s.complications} onChange={(e) => updateSurgery(i, "complications", e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Hospitalizations */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-semibold">Hospitalizations</Label>
          <Button type="button" size="sm" variant="outline" onClick={addHospitalization} className="h-8 gap-1 text-xs active:scale-95">
            <Plus className="h-3 w-3" /> Add Hospitalization
          </Button>
        </div>

        {hospitalizations.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground italic">No hospitalizations added.</p>
        ) : (
          <div className="space-y-3">
            {hospitalizations.map((h, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Hospitalization {i + 1}</span>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeHospitalization(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">Reason</Label>
                      <Input className="h-10 text-sm" placeholder="e.g. Pneumonia" value={h.reason} onChange={(e) => updateHospitalization(i, "reason", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">Year</Label>
                      <Input className="h-10 text-sm" type="number" placeholder="e.g. 2019" value={h.year} onChange={(e) => updateHospitalization(i, "year", e.target.value)} min="1900" max="2030" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">Duration of Stay</Label>
                      <Input className="h-10 text-sm" placeholder="e.g. 5 days" value={h.duration} onChange={(e) => updateHospitalization(i, "duration", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">Hospital</Label>
                      <Input className="h-10 text-sm" placeholder="Hospital name" value={h.hospital} onChange={(e) => updateHospitalization(i, "hospital", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Additional Notes</Label>
        <Textarea
          placeholder="Any other details about surgeries or hospital stays..."
          value={data.notes || ""}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
