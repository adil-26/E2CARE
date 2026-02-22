import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

interface IllnessEntry {
  illness: string;
  from_date?: string;
}

interface StepChildhoodIllnessesProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const illnessIds = [
  "chickenpox", "measles", "mumps", "rubella", "whoopingCough",
  "scarletFever", "rheumaticFever", "polio", "diphtheria",
  "hepatitis", "tuberculosis", "asthma", "eczema",
  "earInfections", "tonsillitis", "epilepsy",
  "heartMurmur", "anemia", "jaundice",
];

const vaccineIds = [
  "bcg", "dpt", "polio", "mmr", "hepb",
  "hepa", "varicella", "typhoid", "pneumococcal",
  "rotavirus", "hpv", "influenza",
];

export default function StepChildhoodIllnesses({ data, onChange }: StepChildhoodIllnessesProps) {
  const { t } = useLanguage();

  // Support both old format (string[]) and new format ({illness, from_date}[])
  const illnessEntries: IllnessEntry[] = (data.illness_entries || []);
  const selected: string[] = illnessEntries.map((e) => e.illness);
  const selectedVaccines: string[] = data.vaccines || [];

  const toggleIllness = (illnessId: string) => {
    const isSelected = selected.includes(illnessId);
    const updated = isSelected
      ? illnessEntries.filter((e) => e.illness !== illnessId)
      : [...illnessEntries, { illness: illnessId, from_date: "" }];
    onChange({ ...data, illness_entries: updated });
  };

  const updateIllnessDate = (illnessId: string, from_date: string) => {
    const updated = illnessEntries.map((e) =>
      e.illness === illnessId ? { ...e, from_date } : e
    );
    onChange({ ...data, illness_entries: updated });
  };

  const getIllnessDate = (illnessId: string) =>
    illnessEntries.find((e) => e.illness === illnessId)?.from_date || "";

  const toggleVaccine = (vaccineId: string) => {
    const updated = selectedVaccines.includes(vaccineId)
      ? selectedVaccines.filter((v) => v !== vaccineId)
      : [...selectedVaccines, vaccineId];
    onChange({ ...data, vaccines: updated });
  };

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t.childhoodIllnesses.description}
      </p>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <Label className="block text-xs sm:text-sm font-semibold">{t.childhoodIllnesses.illnessesTitle}</Label>
          <HearOutButton text={t.childhoodIllnesses.illnessesTitle} />
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3">
          {illnessIds.map((id) => {
            const isChecked = selected.includes(id);
            const label = t.childhoodIllnesses[id as keyof typeof t.childhoodIllnesses] as string;
            return (
              <div key={id} className="flex flex-col gap-1">
                <label
                  className={`flex items-center gap-2 rounded-lg border p-2 sm:p-2.5 text-[11px] sm:text-sm transition-colors cursor-pointer min-h-[40px] min-w-0 ${isChecked ? "border-primary/50 bg-primary/5" : "border-border hover:bg-accent"
                    }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleIllness(id)}
                    className="flex-shrink-0"
                  />
                  <span className="break-words leading-tight min-w-0">{label}</span>
                </label>
                {isChecked && (
                  <div className="px-1">
                    <Label className="text-[10px] text-muted-foreground">{t.history.fromWhen}</Label>
                    <Input
                      type="month"
                      className="h-8 text-xs mt-0.5"
                      value={getIllnessDate(id)}
                      onChange={(e) => updateIllnessDate(id, e.target.value)}
                      placeholder="MM/YYYY"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">{t.childhoodIllnesses.otherIllnessesLabel}</Label>
        <Input
          className="h-10"
          placeholder={t.common.all + "..."}
          value={data.other_illnesses || ""}
          onChange={(e) => onChange({ ...data, other_illnesses: e.target.value })}
        />
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <Label className="block text-xs sm:text-sm font-semibold">{t.childhoodIllnesses.vaccinesTitle}</Label>
          <HearOutButton text={t.childhoodIllnesses.vaccinesTitle} />
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3">
          {vaccineIds.map((id) => {
            const label = t.childhoodIllnesses[id as keyof typeof t.childhoodIllnesses] as string;
            return (
              <label
                key={id}
                className="flex items-center gap-2 rounded-lg border border-border p-2 sm:p-2.5 text-[11px] sm:text-sm transition-colors hover:bg-accent cursor-pointer min-h-[40px] min-w-0"
              >
                <Checkbox
                  checked={selectedVaccines.includes(id)}
                  onCheckedChange={() => toggleVaccine(id)}
                  className="flex-shrink-0"
                />
                <span className="break-words leading-tight min-w-0">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">{t.childhoodIllnesses.milestonesLabel}</Label>
        <Textarea
          placeholder={t.childhoodIllnesses.milestonesPlaceholder}
          value={data.developmental_notes || ""}
          onChange={(e) => onChange({ ...data, developmental_notes: e.target.value })}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
