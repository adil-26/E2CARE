import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

interface StepGenderHealthProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  gender: string | null;
}

export default function StepGenderHealth({ data, onChange, gender }: StepGenderHealthProps) {
  const { t } = useLanguage();
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  const isFemale = gender?.toLowerCase() === "female";
  const isMale = gender?.toLowerCase() === "male";

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t.genderHealth.description}
      </p>

      {(!gender || isFemale) && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs sm:text-sm font-semibold text-foreground">{t.genderHealth.femaleTitle}</h4>
            <HearOutButton text={t.genderHealth.femaleTitle} />
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.ageAtFirstPeriod}</Label>
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
              <Label className="text-xs sm:text-sm">{t.genderHealth.cycleRegularity}</Label>
              <Select value={data.cycle_regularity || ""} onValueChange={(v) => update("cycle_regularity", v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t.common.all + "..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">{t.genderHealth.regular}</SelectItem>
                  <SelectItem value="irregular">{t.genderHealth.irregular}</SelectItem>
                  <SelectItem value="amenorrhea">{t.genderHealth.amenorrhea}</SelectItem>
                  <SelectItem value="menopause">{t.genderHealth.menopause}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.pregnancies}</Label>
              <Input className="h-10 text-sm" type="number" placeholder="0" value={data.pregnancies || ""} onChange={(e) => update("pregnancies", e.target.value)} min="0" max="20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.liveBirths}</Label>
              <Input className="h-10 text-sm" type="number" placeholder="0" value={data.live_births || ""} onChange={(e) => update("live_births", e.target.value)} min="0" max="20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.miscarriages}</Label>
              <Input className="h-10 text-sm" type="number" placeholder="0" value={data.miscarriages || ""} onChange={(e) => update("miscarriages", e.target.value)} min="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.lastPapSmear}</Label>
              <Input className="h-10 text-sm" type="date" value={data.last_pap_smear || ""} onChange={(e) => update("last_pap_smear", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.lastMammogram}</Label>
              <Input className="h-10 text-sm" type="date" value={data.last_mammogram || ""} onChange={(e) => update("last_mammogram", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.contraception}</Label>
              <Select value={data.contraception || ""} onValueChange={(v) => update("contraception", v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t.common.all + "..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.genderHealth.none}</SelectItem>
                  <SelectItem value="oral_pills">{t.genderHealth.oralPills}</SelectItem>
                  <SelectItem value="iud">{t.genderHealth.iud}</SelectItem>
                  <SelectItem value="condom">{t.genderHealth.condom}</SelectItem>
                  <SelectItem value="injection">{t.genderHealth.injection}</SelectItem>
                  <SelectItem value="implant">{t.genderHealth.implant}</SelectItem>
                  <SelectItem value="sterilization">{t.genderHealth.sterilization}</SelectItem>
                  <SelectItem value="other">{t.common.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold">{t.genderHealth.gynConditions}</Label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {[
                { id: "PCOS", label: t.genderHealth.pcos },
                { id: "Endometriosis", label: t.genderHealth.endometriosis },
                { id: "Fibroids", label: t.genderHealth.fibroids },
                { id: "Ovarian Cysts", label: t.genderHealth.ovarianCysts },
                { id: "Pelvic Inflammatory Disease", label: t.genderHealth.pid },
                { id: "Breast Lumps", label: t.genderHealth.breastLumps },
              ].map((item) => {
                const selected: string[] = data.gyn_conditions || [];
                return (
                  <label key={item.id} className="flex items-center gap-2 rounded-lg border border-border p-2 sm:p-2.5 text-[11px] sm:text-sm cursor-pointer hover:bg-accent min-h-[40px] min-w-0">
                    <Checkbox
                      checked={selected.includes(item.id)}
                      onCheckedChange={() => {
                        const updated = selected.includes(item.id) ? selected.filter((c) => c !== item.id) : [...selected, item.id];
                        update("gyn_conditions", updated);
                      }}
                      className="flex-shrink-0"
                    />
                    <span className="break-words leading-tight min-w-0">{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}

      {(!gender || isMale) && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xs sm:text-sm font-semibold text-foreground">{t.genderHealth.maleTitle}</h4>
            <HearOutButton text={t.genderHealth.maleTitle} />
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.prostateIssues}</Label>
              <Select value={data.prostate_issues || ""} onValueChange={(v) => update("prostate_issues", v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t.common.all + "..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.genderHealth.none}</SelectItem>
                  <SelectItem value="enlarged">{t.genderHealth.enlargedProstate}</SelectItem>
                  <SelectItem value="prostatitis">{t.genderHealth.prostatitis}</SelectItem>
                  <SelectItem value="cancer">{t.genderHealth.prostateCancer}</SelectItem>
                  <SelectItem value="unknown">{t.common.unknown}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.testicularIssues}</Label>
              <Select value={data.testicular_issues || ""} onValueChange={(v) => update("testicular_issues", v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t.common.all + "..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t.genderHealth.none}</SelectItem>
                  <SelectItem value="undescended">{t.genderHealth.undescendedTesticle}</SelectItem>
                  <SelectItem value="varicocele">{t.genderHealth.varicocele}</SelectItem>
                  <SelectItem value="hernia">{t.genderHealth.hernia}</SelectItem>
                  <SelectItem value="other">{t.common.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">{t.genderHealth.erectileDysfunction}</Label>
              <Select value={data.erectile_dysfunction || ""} onValueChange={(v) => update("erectile_dysfunction", v)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t.common.all + "..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">{t.common.no}</SelectItem>
                  <SelectItem value="occasional">{t.genderHealth.occasional}</SelectItem>
                  <SelectItem value="frequent">{t.genderHealth.frequent}</SelectItem>
                  <SelectItem value="prefer_not_say">{t.genderHealth.preferNotSay}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">{t.common.notes}</Label>
        <Textarea
          placeholder={t.common.notes + "..."}
          value={data.notes || ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
