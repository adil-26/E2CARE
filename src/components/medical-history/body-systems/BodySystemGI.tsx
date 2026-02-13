import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import StoolUrineAnalysis from "./StoolUrineAnalysis";

interface Props {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const giConditions = [
  "GERD / Acid Reflux", "Peptic Ulcer", "Gastritis", "IBS",
  "Crohn's Disease", "Ulcerative Colitis", "Celiac Disease",
  "Gallstones", "Pancreatitis", "Liver Disease / Hepatitis",
  "Fatty Liver", "Cirrhosis", "Hemorrhoids", "Diverticulitis",
  "Hernia (Hiatal/Inguinal)", "Appendicitis",
];

export default function BodySystemGI({ data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const toggleCondition = (cond: string) => {
    const list: string[] = data.conditions || [];
    const updated = list.includes(cond) ? list.filter((c) => c !== cond) : [...list, cond];
    update("conditions", updated);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <Label className="mb-3 block text-sm font-semibold">🫁 Digestive Conditions</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {giConditions.map((cond) => (
            <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
              <Checkbox checked={(data.conditions || []).includes(cond)} onCheckedChange={() => toggleCondition(cond)} />
              {cond}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Appetite</Label>
          <Select value={data.appetite || ""} onValueChange={(v) => update("appetite", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="increased">Increased</SelectItem>
              <SelectItem value="decreased">Decreased</SelectItem>
              <SelectItem value="variable">Variable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Nausea / Vomiting</Label>
          <Select value={data.nausea || ""} onValueChange={(v) => update("nausea", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="rarely">Rarely</SelectItem>
              <SelectItem value="often">Often</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Bloating</Label>
          <Select value={data.bloating || ""} onValueChange={(v) => update("bloating", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="after_meals">After Meals</SelectItem>
              <SelectItem value="often">Often</SelectItem>
              <SelectItem value="constant">Constant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Organ Removal</Label>
          <Select value={data.organ_removed || ""} onValueChange={(v) => update("organ_removed", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="appendix">Appendix</SelectItem>
              <SelectItem value="gallbladder">Gallbladder</SelectItem>
              <SelectItem value="spleen">Spleen</SelectItem>
              <SelectItem value="part_intestine">Part of Intestine</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.organ_removed && data.organ_removed !== "none" && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 rounded-lg border border-border p-3">
          <div className="space-y-1">
            <Label className="text-xs">Year of Removal</Label>
            <Input className="h-10" type="number" placeholder="e.g. 2018" value={data.organ_removed_year || ""} onChange={(e) => update("organ_removed_year", e.target.value)} min="1950" max="2030" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Reason for Removal</Label>
            <Input className="h-10" placeholder="Why was it removed?" value={data.organ_removed_reason || ""} onChange={(e) => update("organ_removed_reason", e.target.value)} />
          </div>
        </div>
      )}

      {/* Stool Analysis */}
      <StoolUrineAnalysis type="stool" data={data.stool || {}} onChange={(d) => update("stool", d)} />

      <div className="space-y-1.5">
        <Label className="text-xs">Additional GI Notes</Label>
        <Textarea placeholder="Any other digestive details..." value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
