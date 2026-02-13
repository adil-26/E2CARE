import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import StoolUrineAnalysis from "./StoolUrineAnalysis";
import KidneyUrinaryDiagram from "./KidneyUrinaryDiagram";

interface Props {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const urinaryConditions = [
  "UTI (recurrent)", "Kidney Stones", "Kidney Disease",
  "Incontinence", "Overactive Bladder", "Prostate Issues",
  "Bladder Infection", "Nephritis", "Dialysis",
];

export default function BodySystemUrinary({ data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const toggleCondition = (cond: string) => {
    const list: string[] = data.conditions || [];
    const updated = list.includes(cond) ? list.filter((c) => c !== cond) : [...list, cond];
    update("conditions", updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <Label className="mb-3 block text-sm font-semibold">🧪 Urinary Conditions</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {urinaryConditions.map((cond) => (
                <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
                  <Checkbox checked={(data.conditions || []).includes(cond)} onCheckedChange={() => toggleCondition(cond)} />
                  {cond}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Kidney Removed?</Label>
              <Select value={data.kidney_removed || ""} onValueChange={(v) => update("kidney_removed", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="left">Left Kidney</SelectItem>
                  <SelectItem value="right">Right Kidney</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {data.kidney_removed && data.kidney_removed !== "no" && (
              <div className="space-y-1">
                <Label className="text-xs">Year Removed</Label>
                <Input className="h-10" type="number" placeholder="e.g. 2019" value={data.kidney_removed_year || ""} onChange={(e) => update("kidney_removed_year", e.target.value)} min="1950" max="2030" />
              </div>
            )}
          </div>
        </div>

        {/* Kidney Diagram - Hidden on small mobile, visible on desktop */}
        <div className="hidden sm:block lg:col-span-1">
          <KidneyUrinaryDiagram
            kidneyRemoved={data.kidney_removed as any}
            selectedConditions={data.conditions || []}
          />
        </div>
      </div>

      {/* Urine Analysis */}
      <StoolUrineAnalysis type="urine" data={data.urine || {}} onChange={(d) => update("urine", d)} />

      <div className="space-y-1.5">
        <Label className="text-xs">Additional Notes</Label>
        <Textarea placeholder="Any other urinary system details..." value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
