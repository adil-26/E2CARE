import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Stethoscope } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

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

interface TreatmentEntry {
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  doctor: string;
  hospital: string;
  outcome: string;
  notes: string;
}

interface StepSurgeriesProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const emptySurgery: Surgery = { name: "", year: "", hospital: "", reason: "", complications: "" };
const emptyHospitalization: Hospitalization = { reason: "", year: "", duration: "", hospital: "" };
const emptyTreatment: TreatmentEntry = { name: "", type: "", start_date: "", end_date: "", doctor: "", hospital: "", outcome: "", notes: "" };

export default function StepSurgeries({ data, onChange }: StepSurgeriesProps) {
  const { t } = useLanguage();
  const surgeries: Surgery[] = data.surgeries || [];
  const hospitalizations: Hospitalization[] = data.hospitalizations || [];
  const treatments: TreatmentEntry[] = data.treatments || [];

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

  const updateTreatment = (index: number, field: keyof TreatmentEntry, value: string) => {
    const updated = [...treatments];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, treatments: updated });
  };

  const addTreatment = () => onChange({ ...data, treatments: [...treatments, { ...emptyTreatment }] });
  const removeTreatment = (i: number) => onChange({ ...data, treatments: treatments.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t.surgeries.description}
      </p>

      {/* Surgeries */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-xs sm:text-sm font-semibold">{t.surgeries.surgeriesTitle}</Label>
            <HearOutButton text={t.surgeries.surgeriesTitle} />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addSurgery} className="h-8 gap-1 text-xs active:scale-95">
            <Plus className="h-3 w-3" /> {t.surgeries.addSurgery}
          </Button>
        </div>

        {surgeries.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground italic">{t.surgeries.noSurgeries}</p>
        ) : (
          <div className="space-y-3">
            {surgeries.map((s, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{t.surgeries.surgeryItem} {i + 1}</span>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeSurgery(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.surgeryName}</Label>
                      <Input className="h-10 text-sm" placeholder="e.g. Appendectomy" value={s.name} onChange={(e) => updateSurgery(i, "name", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.yearLabel}</Label>
                      <Input className="h-10 text-sm" type="number" placeholder="e.g. 2020" value={s.year} onChange={(e) => updateSurgery(i, "year", e.target.value)} min="1900" max="2030" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.hospitalLabel}</Label>
                      <Input className="h-10 text-sm" placeholder="Hospital name" value={s.hospital} onChange={(e) => updateSurgery(i, "hospital", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.reasonLabel}</Label>
                      <Input className="h-10 text-sm" placeholder="Reason for surgery" value={s.reason} onChange={(e) => updateSurgery(i, "reason", e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Label className="text-[10px] sm:text-xs">{t.surgeries.complicationsLabel}</Label>
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
          <div className="flex items-center gap-2">
            <Label className="text-xs sm:text-sm font-semibold">{t.surgeries.hospitalizationsTitle}</Label>
            <HearOutButton text={t.surgeries.hospitalizationsTitle} />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addHospitalization} className="h-8 gap-1 text-xs active:scale-95">
            <Plus className="h-3 w-3" /> {t.surgeries.addHospitalization}
          </Button>
        </div>

        {hospitalizations.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground italic">{t.surgeries.noHospitalizations}</p>
        ) : (
          <div className="space-y-3">
            {hospitalizations.map((h, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{t.surgeries.hospitalizationItem} {i + 1}</span>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeHospitalization(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.reasonLabel}</Label>
                      <Input className="h-10 text-sm" placeholder="e.g. Pneumonia" value={h.reason} onChange={(e) => updateHospitalization(i, "reason", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.yearLabel}</Label>
                      <Input className="h-10 text-sm" type="number" placeholder="e.g. 2019" value={h.year} onChange={(e) => updateHospitalization(i, "year", e.target.value)} min="1900" max="2030" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.durationLabel}</Label>
                      <Input className="h-10 text-sm" placeholder="e.g. 5 days" value={h.duration} onChange={(e) => updateHospitalization(i, "duration", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.hospitalLabel}</Label>
                      <Input className="h-10 text-sm" placeholder="Hospital name" value={h.hospital} onChange={(e) => updateHospitalization(i, "hospital", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Treatment History */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <Label className="text-xs sm:text-sm font-semibold">{t.surgeries.treatmentTitle}</Label>
            <HearOutButton text={t.surgeries.treatmentTitle} />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addTreatment} className="h-8 gap-1 text-xs active:scale-95">
            <Plus className="h-3 w-3" /> {t.surgeries.addTreatment}
          </Button>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{t.surgeries.treatmentPlaceholder}</p>

        {treatments.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground italic">{t.surgeries.noTreatments}</p>
        ) : (
          <div className="space-y-3">
            {treatments.map((t_entry, i) => (
              <Card key={i} className="shadow-sm border-l-4 border-l-primary/40">
                <CardContent className="p-3 sm:p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{t.surgeries.treatmentItem} {i + 1}{t_entry.name ? ` — ${t_entry.name}` : ""}</span>
                    <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeTreatment(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.treatmentName}</Label>
                      <Input className="h-10 text-sm" placeholder="e.g. Chemotherapy, Physiotherapy" value={t_entry.name} onChange={(e) => updateTreatment(i, "name", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.treatmentType}</Label>
                      <Select value={t_entry.type} onValueChange={(v) => updateTreatment(i, "type", v)}>
                        <SelectTrigger className="h-10 text-xs sm:text-sm">
                          <SelectValue placeholder={t.common.all + "..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medication">💊 {t.surgeries.typeMedication}</SelectItem>
                          <SelectItem value="surgery">🏥 {t.surgeries.typeSurgery}</SelectItem>
                          <SelectItem value="therapy">🧠 {t.surgeries.typeTherapy}</SelectItem>
                          <SelectItem value="physiotherapy">🦾 {t.surgeries.typePhysiotherapy}</SelectItem>
                          <SelectItem value="radiation">☢️ {t.surgeries.typeRadiation}</SelectItem>
                          <SelectItem value="chemotherapy">💉 {t.surgeries.typeChemotherapy}</SelectItem>
                          <SelectItem value="ayurveda">🌿 {t.surgeries.typeAyurveda}</SelectItem>
                          <SelectItem value="other">📋 {t.common.other}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.startDate}</Label>
                      <Input className="h-10 text-sm" type="date" value={t_entry.start_date} onChange={(e) => updateTreatment(i, "start_date", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.endDate}</Label>
                      <Input className="h-10 text-sm" type="date" value={t_entry.end_date} onChange={(e) => updateTreatment(i, "end_date", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.doctor}</Label>
                      <Input className="h-10 text-sm" placeholder="Dr. name" value={t_entry.doctor} onChange={(e) => updateTreatment(i, "doctor", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.hospitalLabel}</Label>
                      <Input className="h-10 text-sm" placeholder="Hospital or clinic name" value={t_entry.hospital} onChange={(e) => updateTreatment(i, "hospital", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">{t.surgeries.outcome}</Label>
                      <Select value={t_entry.outcome} onValueChange={(v) => updateTreatment(i, "outcome", v)}>
                        <SelectTrigger className="h-10 text-xs sm:text-sm">
                          <SelectValue placeholder={t.common.all + "..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cured">✅ {t.surgeries.outcomeCured}</SelectItem>
                          <SelectItem value="improved">📈 {t.surgeries.outcomeImproved}</SelectItem>
                          <SelectItem value="ongoing">🔄 {t.surgeries.outcomeOngoing}</SelectItem>
                          <SelectItem value="no_change">➡️ {t.surgeries.outcomeNoChange}</SelectItem>
                          <SelectItem value="worsened">📉 {t.surgeries.outcomeWorsened}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[10px] sm:text-xs">{t.common.notes}</Label>
                      <Input className="h-10 text-sm" placeholder={t.common.notes + "..."} value={t_entry.notes} onChange={(e) => updateTreatment(i, "notes", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">{t.common.notes}</Label>
        <Textarea
          placeholder={t.common.notes + "..."}
          value={data.notes || ""}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
