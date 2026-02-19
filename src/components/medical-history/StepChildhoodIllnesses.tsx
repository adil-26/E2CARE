import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface IllnessEntry {
  illness: string;
  from_date?: string;
}

interface StepChildhoodIllnessesProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const illnesses = [
  "Chickenpox", "Measles", "Mumps", "Rubella", "Whooping Cough",
  "Scarlet Fever", "Rheumatic Fever", "Polio", "Diphtheria",
  "Hepatitis", "Tuberculosis", "Asthma", "Eczema",
  "Frequent Ear Infections", "Tonsillitis", "Epilepsy / Seizures",
  "Heart Murmur", "Anemia", "Jaundice",
];

const vaccines = [
  "BCG", "DPT / DTaP", "Polio (OPV/IPV)", "MMR", "Hepatitis B",
  "Hepatitis A", "Varicella", "Typhoid", "Pneumococcal",
  "Rotavirus", "HPV", "Influenza (Flu)",
];

export default function StepChildhoodIllnesses({ data, onChange }: StepChildhoodIllnessesProps) {
  // Support both old format (string[]) and new format ({illness, from_date}[])
  const illnessEntries: IllnessEntry[] = (data.illness_entries || []);
  const selected: string[] = illnessEntries.map((e) => e.illness);
  const selectedVaccines: string[] = data.vaccines || [];

  const toggleIllness = (illness: string) => {
    const isSelected = selected.includes(illness);
    const updated = isSelected
      ? illnessEntries.filter((e) => e.illness !== illness)
      : [...illnessEntries, { illness, from_date: "" }];
    onChange({ ...data, illness_entries: updated, illnesses: updated.map((e) => e.illness) });
  };

  const updateIllnessDate = (illness: string, from_date: string) => {
    const updated = illnessEntries.map((e) =>
      e.illness === illness ? { ...e, from_date } : e
    );
    onChange({ ...data, illness_entries: updated });
  };

  const getIllnessDate = (illness: string) =>
    illnessEntries.find((e) => e.illness === illness)?.from_date || "";

  const toggleVaccine = (vaccine: string) => {
    const updated = selectedVaccines.includes(vaccine)
      ? selectedVaccines.filter((v) => v !== vaccine)
      : [...selectedVaccines, vaccine];
    onChange({ ...data, vaccines: updated });
  };

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Select any illnesses you had during childhood. This helps identify past infections and immunity.
      </p>

      <div>
        <Label className="mb-2.5 block text-xs sm:text-sm font-semibold">Childhood Illnesses</Label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3">
          {illnesses.map((illness) => {
            const isChecked = selected.includes(illness);
            return (
              <div key={illness} className="flex flex-col gap-1">
                <label
                  className={`flex items-center gap-2 rounded-lg border p-2 sm:p-2.5 text-[11px] sm:text-sm transition-colors cursor-pointer min-h-[40px] min-w-0 ${isChecked ? "border-primary/50 bg-primary/5" : "border-border hover:bg-accent"
                    }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleIllness(illness)}
                    className="flex-shrink-0"
                  />
                  <span className="break-words leading-tight min-w-0">{illness}</span>
                </label>
                {isChecked && (
                  <div className="px-1">
                    <Label className="text-[10px] text-muted-foreground">From when?</Label>
                    <Input
                      type="month"
                      className="h-8 text-xs mt-0.5"
                      value={getIllnessDate(illness)}
                      onChange={(e) => updateIllnessDate(illness, e.target.value)}
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
        <Label className="text-xs sm:text-sm">Other Childhood Illnesses</Label>
        <Input
          className="h-10"
          placeholder="Any not listed above..."
          value={data.other_illnesses || ""}
          onChange={(e) => onChange({ ...data, other_illnesses: e.target.value })}
        />
      </div>

      <div>
        <Label className="mb-2.5 block text-xs sm:text-sm font-semibold">Vaccinations Received</Label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3">
          {vaccines.map((vaccine) => (
            <label
              key={vaccine}
              className="flex items-center gap-2 rounded-lg border border-border p-2 sm:p-2.5 text-[11px] sm:text-sm transition-colors hover:bg-accent cursor-pointer min-h-[40px] min-w-0"
            >
              <Checkbox
                checked={selectedVaccines.includes(vaccine)}
                onCheckedChange={() => toggleVaccine(vaccine)}
                className="flex-shrink-0"
              />
              <span className="break-words leading-tight min-w-0">{vaccine}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Developmental Milestones</Label>
        <Textarea
          placeholder="Any developmental delays, learning disabilities, speech issues, etc."
          value={data.developmental_notes || ""}
          onChange={(e) => onChange({ ...data, developmental_notes: e.target.value })}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
