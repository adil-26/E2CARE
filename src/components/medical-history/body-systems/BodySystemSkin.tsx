import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const skinConditions = [
  "Acne", "Eczema / Dermatitis", "Psoriasis", "Vitiligo",
  "Hives (Urticaria)", "Fungal Infections", "Skin Cancer / Moles",
  "Rosacea", "Alopecia (Hair Loss)", "Excessive Sweating",
  "Warts", "Cellulitis", "Scars (Keloid)", "Dandruff",
];

export default function BodySystemSkin({ data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const toggleCondition = (cond: string) => {
    const list: string[] = data.conditions || [];
    const updated = list.includes(cond) ? list.filter((c) => c !== cond) : [...list, cond];
    update("conditions", updated);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <Label className="mb-3 block text-sm font-semibold">🧴 Skin & Hair Conditions</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {skinConditions.map((cond) => (
            <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
              <Checkbox checked={(data.conditions || []).includes(cond)} onCheckedChange={() => toggleCondition(cond)} />
              {cond}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Skin Type</Label>
          <Select value={data.skin_type || ""} onValueChange={(v) => update("skin_type", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="dry">Dry</SelectItem>
              <SelectItem value="oily">Oily</SelectItem>
              <SelectItem value="combination">Combination</SelectItem>
              <SelectItem value="sensitive">Sensitive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hair Loss</Label>
          <Select value={data.hair_loss || ""} onValueChange={(v) => update("hair_loss", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Hair Loss</SelectItem>
              <SelectItem value="mild">Mild Thinning</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe / Bald Patches</SelectItem>
              <SelectItem value="pattern">Male/Female Pattern Baldness</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Nail Problems</Label>
          <Select value={data.nail_problems || ""} onValueChange={(v) => update("nail_problems", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="fungal">Fungal Infection</SelectItem>
              <SelectItem value="brittle">Brittle / Breaking</SelectItem>
              <SelectItem value="discolored">Discolored</SelectItem>
              <SelectItem value="ingrown">Ingrown Nails</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Additional Notes</Label>
        <Textarea placeholder="Any other skin/hair/nail details..." value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
