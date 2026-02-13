import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const eyeConditions = [
  "Myopia (Near-sighted)", "Hyperopia (Far-sighted)", "Astigmatism",
  "Presbyopia", "Cataracts", "Glaucoma", "Macular Degeneration",
  "Diabetic Retinopathy", "Dry Eyes", "Color Blindness",
  "Strabismus (Squint)", "Amblyopia (Lazy Eye)", "Conjunctivitis (recurring)",
  "Floaters", "Night Blindness",
];

export default function BodySystemEyes({ data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });
  const conditions: string[] = data.conditions || [];

  const toggleCondition = (cond: string) => {
    const updated = conditions.includes(cond) ? conditions.filter((c) => c !== cond) : [...conditions, cond];
    update("conditions", updated);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <Label className="mb-3 block text-sm font-semibold">👁️ Eye Conditions</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {eyeConditions.map((cond) => (
            <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
              <Checkbox checked={conditions.includes(cond)} onCheckedChange={() => toggleCondition(cond)} />
              {cond}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Do you wear glasses/contacts?</Label>
          <Select value={data.corrective_lens || ""} onValueChange={(v) => update("corrective_lens", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No</SelectItem>
              <SelectItem value="glasses">Glasses</SelectItem>
              <SelectItem value="contacts">Contact Lenses</SelectItem>
              <SelectItem value="both">Both</SelectItem>
              <SelectItem value="lasik">Had LASIK Surgery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Since when?</Label>
          <Input className="h-10" type="number" placeholder="Year started" value={data.lens_since || ""} onChange={(e) => update("lens_since", e.target.value)} min="1950" max="2030" />
        </div>
      </div>

      {(data.corrective_lens === "glasses" || data.corrective_lens === "contacts" || data.corrective_lens === "both") && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Left Eye Power (Sphere)</Label>
            <Input className="h-10" placeholder="e.g. -2.50" value={data.left_power || ""} onChange={(e) => update("left_power", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Right Eye Power (Sphere)</Label>
            <Input className="h-10" placeholder="e.g. -3.00" value={data.right_power || ""} onChange={(e) => update("right_power", e.target.value)} />
          </div>
        </div>
      )}

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Last Eye Exam</Label>
          <Input className="h-10" type="date" value={data.last_exam || ""} onChange={(e) => update("last_exam", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Eye Surgery History</Label>
          <Select value={data.eye_surgery || ""} onValueChange={(v) => update("eye_surgery", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="lasik">LASIK/PRK</SelectItem>
              <SelectItem value="cataract">Cataract Surgery</SelectItem>
              <SelectItem value="retinal">Retinal Surgery</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Additional Eye Notes</Label>
        <Textarea placeholder="Any other eye-related details..." value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
