import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

interface StepBirthHistoryProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function StepBirthHistory({ data, onChange }: StepBirthHistoryProps) {
  const { t } = useLanguage();
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  return (
    <div className="space-y-4 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t.birthHistory.description}
      </p>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label className="text-xs sm:text-sm">{t.birthHistory.deliveryTypeLabel}</Label>
            <HearOutButton text={t.birthHistory.deliveryTypeLabel} />
          </div>
          <Select value={data.delivery_type || ""} onValueChange={(v) => update("delivery_type", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder={t.common.all + "..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal_vaginal">{t.birthHistory.normal_vaginal}</SelectItem>
              <SelectItem value="cesarean">{t.birthHistory.cesarean}</SelectItem>
              <SelectItem value="assisted_vaginal">{t.birthHistory.assisted_vaginal}</SelectItem>
              <SelectItem value="water_birth">{t.birthHistory.water_birth}</SelectItem>
              <SelectItem value="unknown">{t.birthHistory.unknown}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">{t.birthHistory.birthWeightLabel}</Label>
          <div className="flex gap-2">
            <Input
              className="h-10 flex-1 min-w-0"
              type="number"
              placeholder="e.g. 3.2"
              value={data.birth_weight || ""}
              onChange={(e) => update("birth_weight", e.target.value)}
              step="0.1"
              min="0.5"
              max="7"
            />
            <Select value={data.birth_weight_unit || "kg"} onValueChange={(v) => update("birth_weight_unit", v)}>
              <SelectTrigger className="w-24 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">{t.birthHistory.kg}</SelectItem>
                <SelectItem value="lbs">{t.birthHistory.lbs}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">{t.birthHistory.gestationalAgeLabel}</Label>
          <Select value={data.gestational_age || ""} onValueChange={(v) => update("gestational_age", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder={t.common.all + "..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preterm">{t.birthHistory.preterm}</SelectItem>
              <SelectItem value="full_term">{t.birthHistory.full_term}</SelectItem>
              <SelectItem value="post_term">{t.birthHistory.post_term}</SelectItem>
              <SelectItem value="unknown">{t.birthHistory.unknown}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">{t.birthHistory.complicationsLabel}</Label>
          <Select value={data.birth_complications || ""} onValueChange={(v) => update("birth_complications", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder={t.common.all + "..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t.birthHistory.none}</SelectItem>
              <SelectItem value="jaundice">{t.birthHistory.jaundice}</SelectItem>
              <SelectItem value="breathing_issues">{t.birthHistory.breathing_issues}</SelectItem>
              <SelectItem value="cord_around_neck">{t.birthHistory.cord_around_neck}</SelectItem>
              <SelectItem value="nicu_stay">{t.birthHistory.nicu_stay}</SelectItem>
              <SelectItem value="other">{t.birthHistory.other}</SelectItem>
              <SelectItem value="unknown">{t.birthHistory.unknown}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">{t.settings.bloodGroup} (if known)</Label>
          <Select value={data.blood_type || ""} onValueChange={(v) => update("blood_type", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder={t.common.all + "..."} />
            </SelectTrigger>
            <SelectContent>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                <SelectItem key={bt} value={bt}>{bt}</SelectItem>
              ))}
              <SelectItem value="unknown">{t.birthHistory.unknown}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">{t.birthHistory.breastfedLabel}</Label>
          <Select value={data.breastfed || ""} onValueChange={(v) => update("breastfed", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder={t.common.all + "..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes_exclusive">{t.birthHistory.yes_exclusive}</SelectItem>
              <SelectItem value="yes_mixed">{t.birthHistory.yes_mixed}</SelectItem>
              <SelectItem value="formula_only">{t.birthHistory.formula_only}</SelectItem>
              <SelectItem value="unknown">{t.birthHistory.unknown}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">{t.birthHistory.notesLabel}</Label>
        <Textarea
          placeholder={t.birthHistory.notesPlaceholder}
          value={data.notes || ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
