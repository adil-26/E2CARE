import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const heartConditions = [
  "Heart Attack (MI)", "Angina", "Heart Failure", "Arrhythmia",
  "Heart Murmur", "Valve Disease", "Cardiomyopathy",
  "Pericarditis", "Aortic Aneurysm", "DVT / Blood Clots",
  "Peripheral Artery Disease", "High Blood Pressure",
];

const lungConditions = [
  "Asthma", "COPD", "Pneumonia (recurrent)", "Bronchitis (chronic)",
  "Pulmonary Fibrosis", "Pulmonary Embolism", "Tuberculosis",
  "Pleural Effusion", "Sleep Apnea", "Lung Cancer",
];

export default function BodySystemCardio({ data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const toggleItem = (list: string[], item: string, key: string) => {
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    update(key, updated);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <Label className="mb-3 block text-sm font-semibold">❤️ Heart Conditions</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {heartConditions.map((cond) => (
            <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
              <Checkbox checked={(data.heart_conditions || []).includes(cond)} onCheckedChange={() => toggleItem(data.heart_conditions || [], cond, "heart_conditions")} />
              {cond}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Chest Pain</Label>
          <Select value={data.chest_pain || ""} onValueChange={(v) => update("chest_pain", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="occasionally">Occasionally</SelectItem>
              <SelectItem value="with_exertion">With Physical Activity</SelectItem>
              <SelectItem value="at_rest">Even at Rest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Palpitations</Label>
          <Select value={data.palpitations || ""} onValueChange={(v) => update("palpitations", v)}>
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
          <Label className="text-xs">Last ECG / Heart Test</Label>
          <Input className="h-10" type="date" value={data.last_ecg || ""} onChange={(e) => update("last_ecg", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cardiac Procedures</Label>
          <Select value={data.cardiac_procedure || ""} onValueChange={(v) => update("cardiac_procedure", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="angioplasty">Angioplasty / Stent</SelectItem>
              <SelectItem value="bypass">Bypass Surgery (CABG)</SelectItem>
              <SelectItem value="pacemaker">Pacemaker</SelectItem>
              <SelectItem value="valve_replacement">Valve Replacement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-3 block text-sm font-semibold">🫁 Lung & Respiratory</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {lungConditions.map((cond) => (
            <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
              <Checkbox checked={(data.lung_conditions || []).includes(cond)} onCheckedChange={() => toggleItem(data.lung_conditions || [], cond, "lung_conditions")} />
              {cond}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Shortness of Breath</Label>
          <Select value={data.shortness_of_breath || ""} onValueChange={(v) => update("shortness_of_breath", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="with_exertion">With Exertion</SelectItem>
              <SelectItem value="climbing_stairs">Climbing Stairs</SelectItem>
              <SelectItem value="at_rest">Even at Rest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Chronic Cough</Label>
          <Select value={data.chronic_cough || ""} onValueChange={(v) => update("chronic_cough", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="dry">Yes - Dry Cough</SelectItem>
              <SelectItem value="productive">Yes - With Phlegm</SelectItem>
              <SelectItem value="blood">Yes - With Blood</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Additional Notes</Label>
        <Textarea placeholder="Any other heart/lung details..." value={data.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
