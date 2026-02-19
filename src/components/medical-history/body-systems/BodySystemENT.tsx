import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import TeethDiagram from "./TeethDiagram";
import EarDiagram from "./EarDiagram";
import NoseThroatDiagram from "./NoseThroatDiagram";

interface Props {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const earConditions = ["Hearing Loss", "Tinnitus", "Ear Infections", "Vertigo", "Earwax Buildup", "Perforated Eardrum"];
const noseConditions = ["Sinusitis", "Nasal Polyps", "Deviated Septum", "Allergic Rhinitis", "Frequent Nosebleeds", "Loss of Smell"];
const throatConditions = ["Tonsillitis", "Sore Throat (recurrent)", "Difficulty Swallowing", "Snoring / Sleep Apnea", "Voice Changes", "Acid Reflux"];
const tongueConditions = ["Coated Tongue", "Geographic Tongue", "Tongue Ulcers", "Burning Sensation", "Swollen Tongue", "Tongue Tie", "Dry Mouth", "Taste Changes"];
const gumConditions = ["Bleeding Gums", "Gum Recession", "Gingivitis", "Periodontitis", "Gum Swelling", "Gum Pain", "Gum Abscess", "Sensitive Gums"];

export default function BodySystemENT({ data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const toggleItem = (list: string[], item: string, key: string) => {
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    update(key, updated);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Ears */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <Label className="mb-3 block text-sm font-semibold">👂 Ears & Hearing</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {earConditions.map((cond) => (
              <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
                <Checkbox
                  checked={(data.ear_conditions || []).includes(cond)}
                  onCheckedChange={() => toggleItem(data.ear_conditions || [], cond, "ear_conditions")}
                />
                {cond}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <EarDiagram
              selectedAreas={data.ear_problem_areas || []}
              onToggle={(area) => {
                const list: string[] = data.ear_problem_areas || [];
                const updated = list.includes(area) ? list.filter((a) => a !== area) : [...list, area];
                update("ear_problem_areas", updated);
              }}
            />
          </div>
          <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Hearing Aid?</Label>
              <Select value={data.hearing_aid || ""} onValueChange={(v) => update("hearing_aid", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="left">Left ear</SelectItem>
                  <SelectItem value="right">Right ear</SelectItem>
                  <SelectItem value="both">Both ears</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Last Hearing Test</Label>
              <Input className="h-10" type="date" value={data.last_hearing_test || ""} onChange={(e) => update("last_hearing_test", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nose & Sinuses */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <Label className="mb-3 block text-sm font-semibold">👃 Nose & Sinuses</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {noseConditions.map((cond) => (
              <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
                <Checkbox
                  checked={(data.nose_conditions || []).includes(cond)}
                  onCheckedChange={() => toggleItem(data.nose_conditions || [], cond, "nose_conditions")}
                />
                {cond}
              </label>
            ))}
          </div>
          <div className="mt-4">
            <NoseThroatDiagram
              selectedAreas={data.nose_throat_areas || []}
              onToggle={(area) => {
                const list: string[] = data.nose_throat_areas || [];
                const updated = list.includes(area) ? list.filter((a) => a !== area) : [...list, area];
                update("nose_throat_areas", updated);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Throat */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <Label className="mb-3 block text-sm font-semibold">🗣️ Throat</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {throatConditions.map((cond) => (
              <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
                <Checkbox
                  checked={(data.throat_conditions || []).includes(cond)}
                  onCheckedChange={() => toggleItem(data.throat_conditions || [], cond, "throat_conditions")}
                />
                {cond}
              </label>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            <Label className="text-xs">Tonsils Status</Label>
            <Select value={data.tonsils_status || ""} onValueChange={(v) => update("tonsils_status", v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present (Normal)</SelectItem>
                <SelectItem value="enlarged">Enlarged</SelectItem>
                <SelectItem value="removed">Removed (Tonsillectomy)</SelectItem>
              </SelectContent>
            </Select>
            {data.tonsils_status === "removed" && (
              <div className="mt-2 grid gap-2 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Year Removed</Label>
                  <Input className="h-10" type="number" placeholder="e.g. 2015" value={data.tonsils_removed_year || ""} onChange={(e) => update("tonsils_removed_year", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reason</Label>
                  <Input className="h-10" placeholder="Reason for removal" value={data.tonsils_removed_reason || ""} onChange={(e) => update("tonsils_removed_reason", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teeth - Interactive Diagram */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <Label className="mb-3 block text-sm font-semibold">🦷 Teeth & Dental</Label>
          <TeethDiagram teethData={data.teeth || {}} onChange={(teeth) => update("teeth", teeth)} />
          <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Last Dental Visit</Label>
              <Input className="h-10" type="date" value={data.last_dental_visit || ""} onChange={(e) => update("last_dental_visit", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Dental Appliances</Label>
              <Select value={data.dental_appliances || ""} onValueChange={(v) => update("dental_appliances", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="braces">Braces</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="dentures_partial">Partial Dentures</SelectItem>
                  <SelectItem value="dentures_full">Full Dentures</SelectItem>
                  <SelectItem value="implants">Dental Implants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tongue - NEW */}
      <Card className="shadow-sm border-l-4 border-l-orange-400">
        <CardContent className="p-3 sm:p-4">
          <Label className="mb-3 block text-sm font-semibold">👅 Tongue</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {tongueConditions.map((cond) => (
              <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
                <Checkbox
                  checked={(data.tongue_conditions || []).includes(cond)}
                  onCheckedChange={() => toggleItem(data.tongue_conditions || [], cond, "tongue_conditions")}
                />
                {cond}
              </label>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            <Label className="text-xs">Tongue Notes</Label>
            <Textarea
              placeholder="Any other tongue-related details..."
              value={data.tongue_notes || ""}
              onChange={(e) => update("tongue_notes", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gums - NEW */}
      <Card className="shadow-sm border-l-4 border-l-pink-400">
        <CardContent className="p-3 sm:p-4">
          <Label className="mb-3 block text-sm font-semibold">🩸 Gums & Oral Health</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {gumConditions.map((cond) => (
              <label key={cond} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5 min-h-[44px] text-xs sm:text-sm cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors">
                <Checkbox
                  checked={(data.gum_conditions || []).includes(cond)}
                  onCheckedChange={() => toggleItem(data.gum_conditions || [], cond, "gum_conditions")}
                />
                {cond}
              </label>
            ))}
          </div>
          <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Last Gum Treatment</Label>
              <Input className="h-10" type="date" value={data.last_gum_treatment || ""} onChange={(e) => update("last_gum_treatment", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gum Treatment Type</Label>
              <Select value={data.gum_treatment_type || ""} onValueChange={(v) => update("gum_treatment_type", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="scaling">Scaling / Cleaning</SelectItem>
                  <SelectItem value="surgery">Gum Surgery</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <Label className="text-xs">Gum Notes</Label>
            <Textarea
              placeholder="Any other gum-related details..."
              value={data.gum_notes || ""}
              onChange={(e) => update("gum_notes", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        <Label>Additional ENT Notes</Label>
        <Textarea
          placeholder="Any other ENT details..."
          value={data.notes || ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}
