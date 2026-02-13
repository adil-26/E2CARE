import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import BrainDiagram from "./BrainDiagram";

interface Props {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const neuroConditions = [
  "Migraine", "Tension Headache", "Epilepsy / Seizures",
  "Stroke", "TIA (Mini-Stroke)", "Parkinson's Disease",
  "Multiple Sclerosis", "Neuropathy (Nerve Damage)",
  "Carpal Tunnel", "Tremors", "Memory Loss",
  "Bell's Palsy", "Vertigo / Dizziness", "Sciatica",
  "Concussion / Head Injury",
];

export default function BodySystemNeuro({ data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const toggleCondition = (cond: string) => {
    const list: string[] = data.conditions || [];
    const updated = list.includes(cond) ? list.filter((c) => c !== cond) : [...list, cond];
    update("conditions", updated);
  };

  const selectedRegions = data.affected_regions || [];
  const toggleRegion = (region: string) => {
    const updated = selectedRegions.includes(region)
      ? selectedRegions.filter((r: string) => r !== region)
      : [...selectedRegions, region];
    update("affected_regions", updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <Label className="mb-3 block text-sm font-semibold">🧠 Neurological Conditions</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {neuroConditions.map((cond) => (
                <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
                  <Checkbox checked={(data.conditions || []).includes(cond)} onCheckedChange={() => toggleCondition(cond)} />
                  {cond}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Brain Diagram - Hidden on small mobile, visible on desktop */}
        <div className="hidden sm:block lg:col-span-1">
          <BrainDiagram
            selectedRegions={selectedRegions}
            onToggle={toggleRegion}
          />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Headache Frequency</Label>
          <Select value={data.headache_frequency || ""} onValueChange={(v) => update("headache_frequency", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rarely">Rarely</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="several_week">Several times / week</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Numbness / Tingling</Label>
          <Select value={data.numbness || ""} onValueChange={(v) => update("numbness", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="hands">Hands / Fingers</SelectItem>
              <SelectItem value="feet">Feet / Toes</SelectItem>
              <SelectItem value="both">Both Hands & Feet</SelectItem>
              <SelectItem value="face">Face</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Fainting / Loss of Consciousness</Label>
          <Select value={data.fainting || ""} onValueChange={(v) => update("fainting", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="once">Once</SelectItem>
              <SelectItem value="multiple">Multiple Times</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Last Neurological Exam</Label>
          <Input className="h-10" type="date" value={data.last_exam || ""} onChange={(e) => update("last_exam", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Additional Notes</Label>
        <Textarea placeholder="Any other neurological details..." value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
