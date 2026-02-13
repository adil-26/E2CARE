import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const musculoConditions = [
  "Osteoarthritis", "Rheumatoid Arthritis", "Osteoporosis",
  "Gout", "Herniated Disc", "Scoliosis", "Frozen Shoulder",
  "Rotator Cuff Injury", "Tennis / Golfer's Elbow",
  "ACL / Meniscus Tear", "Fractures (past)", "Fibromyalgia",
  "Carpal Tunnel", "Plantar Fasciitis", "Tendonitis",
  "Muscle Spasms", "Joint Replacement",
];

const bodyAreas = [
  "Neck", "Shoulder (L)", "Shoulder (R)", "Upper Back",
  "Lower Back", "Hip (L)", "Hip (R)", "Knee (L)", "Knee (R)",
  "Ankle (L)", "Ankle (R)", "Wrist (L)", "Wrist (R)",
  "Elbow (L)", "Elbow (R)", "Fingers", "Toes",
];

export default function BodySystemMusculo({ data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const toggleCondition = (cond: string) => {
    const list: string[] = data.conditions || [];
    const updated = list.includes(cond) ? list.filter((c) => c !== cond) : [...list, cond];
    update("conditions", updated);
  };

  const togglePainArea = (area: string) => {
    const list: string[] = data.pain_areas || [];
    const updated = list.includes(area) ? list.filter((a) => a !== area) : [...list, area];
    update("pain_areas", updated);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <Label className="mb-3 block text-sm font-semibold">🦴 Bone & Joint Conditions</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {musculoConditions.map((cond) => (
            <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
              <Checkbox checked={(data.conditions || []).includes(cond)} onCheckedChange={() => toggleCondition(cond)} />
              {cond}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-3 block text-sm font-semibold">Pain Areas (tap all that apply)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {bodyAreas.map((area) => {
            const selected = (data.pain_areas || []).includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => togglePainArea(area)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium transition-all flex items-center gap-2",
                  selected
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground hover:bg-accent active:scale-95"
                )}
              >
                {selected ? "🔴" : "⚪"} {area}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Joint Replacement?</Label>
          <Select value={data.joint_replacement || ""} onValueChange={(v) => update("joint_replacement", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="knee">Knee Replacement</SelectItem>
              <SelectItem value="hip">Hip Replacement</SelectItem>
              <SelectItem value="shoulder">Shoulder Replacement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {data.joint_replacement && data.joint_replacement !== "none" && (
          <div className="space-y-1">
            <Label className="text-xs">Year of Replacement</Label>
            <Input className="h-10" type="number" placeholder="e.g. 2021" value={data.replacement_year || ""} onChange={(e) => update("replacement_year", e.target.value)} min="1980" max="2030" />
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs">Mobility Aids</Label>
          <Select value={data.mobility_aids || ""} onValueChange={(v) => update("mobility_aids", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="cane">Walking Cane</SelectItem>
              <SelectItem value="walker">Walker</SelectItem>
              <SelectItem value="wheelchair">Wheelchair</SelectItem>
              <SelectItem value="brace">Brace / Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Additional Notes</Label>
        <Textarea placeholder="Any other bone/joint details..." value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
