import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface StepGenderHealthProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  gender: string | null;
}

export default function StepGenderHealth({ data, onChange, gender }: StepGenderHealthProps) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const isFemale = gender?.toLowerCase() === "female";
  const isMale = gender?.toLowerCase() === "male";

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Gender-specific health information helps your doctor provide more personalized care.
      </p>

      {(!gender || isFemale) && (
        <>
          <h4 className="font-display text-xs sm:text-sm font-semibold text-foreground">Women's Health</h4>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Age at First Period</Label>
              <Input
                className="h-10 text-sm"
                type="number"
                placeholder="e.g. 12"
                value={data.menarche_age || ""}
                onChange={(e) => update("menarche_age", e.target.value)}
                min="8" max="20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Cycle Regularity</Label>
              <Select value={data.cycle_regularity || ""} onValueChange={(v) => update("cycle_regularity", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular (21-35 days)</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="amenorrhea">Absent</SelectItem>
                  <SelectItem value="menopause">Post-Menopausal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Pregnancies</Label>
              <Input className="h-10 text-sm" type="number" placeholder="0" value={data.pregnancies || ""} onChange={(e) => update("pregnancies", e.target.value)} min="0" max="20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Live Births</Label>
              <Input className="h-10 text-sm" type="number" placeholder="0" value={data.live_births || ""} onChange={(e) => update("live_births", e.target.value)} min="0" max="20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Miscarriages / Abortions</Label>
              <Input className="h-10 text-sm" type="number" placeholder="0" value={data.miscarriages || ""} onChange={(e) => update("miscarriages", e.target.value)} min="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Last Pap Smear</Label>
              <Input className="h-10 text-sm" type="date" value={data.last_pap_smear || ""} onChange={(e) => update("last_pap_smear", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Last Mammogram</Label>
              <Input className="h-10 text-sm" type="date" value={data.last_mammogram || ""} onChange={(e) => update("last_mammogram", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Contraception</Label>
              <Select value={data.contraception || ""} onValueChange={(v) => update("contraception", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="oral_pills">Oral Pills</SelectItem>
                  <SelectItem value="iud">IUD</SelectItem>
                  <SelectItem value="condom">Condom</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="implant">Implant</SelectItem>
                  <SelectItem value="sterilization">Sterilization</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold">Gynecological Conditions</Label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {["PCOS", "Endometriosis", "Fibroids", "Ovarian Cysts", "Pelvic Inflammatory Disease", "Breast Lumps"].map((cond) => {
                const selected: string[] = data.gyn_conditions || [];
                return (
                  <label key={cond} className="flex items-center gap-2 rounded-lg border border-border p-2 sm:p-2.5 text-[11px] sm:text-sm cursor-pointer hover:bg-accent min-h-[40px] min-w-0">
                    <Checkbox
                      checked={selected.includes(cond)}
                      onCheckedChange={() => {
                        const updated = selected.includes(cond) ? selected.filter((c) => c !== cond) : [...selected, cond];
                        update("gyn_conditions", updated);
                      }}
                      className="flex-shrink-0"
                    />
                    <span className="break-words leading-tight min-w-0">{cond}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

      {(!gender || isMale) && (
        <>
          <h4 className="font-display text-xs sm:text-sm font-semibold text-foreground">Men's Health</h4>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Prostate Issues</Label>
              <Select value={data.prostate_issues || ""} onValueChange={(v) => update("prostate_issues", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="enlarged">Enlarged (BPH)</SelectItem>
                  <SelectItem value="prostatitis">Prostatitis</SelectItem>
                  <SelectItem value="cancer">Prostate Cancer</SelectItem>
                  <SelectItem value="unknown">Don't Know</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Testicular Issues</Label>
              <Select value={data.testicular_issues || ""} onValueChange={(v) => update("testicular_issues", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="undescended">Undescended</SelectItem>
                  <SelectItem value="varicocele">Varicocele</SelectItem>
                  <SelectItem value="hernia">Inguinal Hernia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Erectile Dysfunction</Label>
              <Select value={data.erectile_dysfunction || ""} onValueChange={(v) => update("erectile_dysfunction", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="occasional">Occasional</SelectItem>
                  <SelectItem value="frequent">Frequent</SelectItem>
                  <SelectItem value="prefer_not_say">Prefer Not to Say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Additional Notes</Label>
        <Textarea
          placeholder="Any other gender-specific health details..."
          value={data.notes || ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
