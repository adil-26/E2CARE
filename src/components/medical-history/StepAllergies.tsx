import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepAllergiesProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const drugAllergies = [
  "Penicillin", "Sulfa Drugs", "Aspirin / NSAIDs", "Ibuprofen",
  "Codeine / Morphine", "Local Anesthetics", "Contrast Dye",
  "Insulin", "ACE Inhibitors", "Statins", "Tetracycline",
];

const foodAllergies = [
  "Peanuts", "Tree Nuts", "Milk / Dairy", "Eggs", "Wheat / Gluten",
  "Soy", "Fish", "Shellfish", "Sesame", "Corn", "Mustard",
];

const environmentalAllergies = [
  "Dust Mites", "Pollen (Seasonal)", "Pet Dander", "Mold",
  "Latex", "Insect Stings (Bee/Wasp)", "Cockroach", "Perfume / Fragrance",
];

export default function StepAllergies({ data, onChange }: StepAllergiesProps) {
  const selectedDrugs: string[] = data.drug_allergies || [];
  const selectedFoods: string[] = data.food_allergies || [];
  const selectedEnv: string[] = data.environmental_allergies || [];

  const toggle = (list: string[], item: string, key: string) => {
    const updated = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
    onChange({ ...data, [key]: updated });
  };

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Accurate allergy information is critical for safe medical treatment. Select all known allergies.
      </p>

      {/* Drug Allergies */}
      <div>
        <Label className="mb-2.5 block text-xs sm:text-sm font-semibold">Drug / Medication Allergies</Label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3">
          {drugAllergies.map((allergy) => (
            <label key={allergy} className="flex items-center gap-2 rounded-lg border border-border p-2 sm:p-2.5 text-[11px] sm:text-sm cursor-pointer hover:bg-accent min-h-[40px] min-w-0">
              <Checkbox
                checked={selectedDrugs.includes(allergy)}
                onCheckedChange={() => toggle(selectedDrugs, allergy, "drug_allergies")}
                className="flex-shrink-0"
              />
              <span className="break-words leading-tight min-w-0">{allergy}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 space-y-1.5">
          <Label className="text-[10px] sm:text-xs">Other Drug Allergies</Label>
          <Input
            className="h-10 text-sm"
            placeholder="Any not listed above..."
            value={data.other_drug_allergies || ""}
            onChange={(e) => onChange({ ...data, other_drug_allergies: e.target.value })}
          />
        </div>
      </div>

      {/* Food Allergies */}
      <div>
        <Label className="mb-2.5 block text-xs sm:text-sm font-semibold">Food Allergies / Intolerances</Label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3">
          {foodAllergies.map((allergy) => (
            <label key={allergy} className="flex items-center gap-2 rounded-lg border border-border p-2 sm:p-2.5 text-[11px] sm:text-sm cursor-pointer hover:bg-accent min-h-[40px] min-w-0">
              <Checkbox
                checked={selectedFoods.includes(allergy)}
                onCheckedChange={() => toggle(selectedFoods, allergy, "food_allergies")}
                className="flex-shrink-0"
              />
              <span className="break-words leading-tight min-w-0">{allergy}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Environmental Allergies */}
      <div>
        <Label className="mb-2.5 block text-xs sm:text-sm font-semibold">Environmental Allergies</Label>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3">
          {environmentalAllergies.map((allergy) => (
            <label key={allergy} className="flex items-center gap-2 rounded-lg border border-border p-2 sm:p-2.5 text-[11px] sm:text-sm cursor-pointer hover:bg-accent min-h-[40px] min-w-0">
              <Checkbox
                checked={selectedEnv.includes(allergy)}
                onCheckedChange={() => toggle(selectedEnv, allergy, "environmental_allergies")}
                className="flex-shrink-0"
              />
              <span className="break-words leading-tight min-w-0">{allergy}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Worst Allergic Reaction</Label>
        <Select value={data.worst_reaction || ""} onValueChange={(v) => onChange({ ...data, worst_reaction: v })}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mild">Mild (rash, itching)</SelectItem>
            <SelectItem value="moderate">Moderate (swelling, hives)</SelectItem>
            <SelectItem value="severe">Severe (Anaphylaxis)</SelectItem>
            <SelectItem value="none">Never had a reaction</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Do you carry an EpiPen?</Label>
        <Select value={data.epipen || ""} onValueChange={(v) => onChange({ ...data, epipen: v })}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Additional Allergy Notes</Label>
        <Textarea
          placeholder="Describe specific reactions, triggers, or any other allergy details..."
          value={data.notes || ""}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
