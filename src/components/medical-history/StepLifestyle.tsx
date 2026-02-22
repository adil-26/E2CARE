import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { HearOutButton } from "@/components/ui/HearOutButton";

interface StepLifestyleProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function StepLifestyle({ data, onChange }: StepLifestyleProps) {
  const { t } = useLanguage();
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t.lifestyle.description}
      </p>

      {/* Smoking */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.smokingTitle}</Label>
          <HearOutButton text={t.lifestyle.smokingTitle} />
        </div>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.status}</Label>
            <Select value={data.smoking_status || ""} onValueChange={(v) => update("smoking_status", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t.common.all + "..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">{t.lifestyle.neverSmoked}</SelectItem>
                <SelectItem value="former">{t.lifestyle.formerSmoker}</SelectItem>
                <SelectItem value="current">{t.lifestyle.currentSmoker}</SelectItem>
                <SelectItem value="occasional">{t.lifestyle.occasional}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(data.smoking_status === "current" || data.smoking_status === "former") && (
            <>
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">{t.lifestyle.cigarettesDay}</Label>
                <Input className="h-10 text-sm" type="number" placeholder="e.g. 10" value={data.cigarettes_per_day || ""} onChange={(e) => update("cigarettes_per_day", e.target.value)} min="0" max="100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">{t.lifestyle.yearsSmoking}</Label>
                <Input className="h-10 text-sm" type="number" placeholder="e.g. 5" value={data.smoking_years || ""} onChange={(e) => update("smoking_years", e.target.value)} min="0" max="80" />
              </div>
              {data.smoking_status === "former" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs">{t.lifestyle.yearQuit}</Label>
                  <Input className="h-10 text-sm" type="number" placeholder="e.g. 2020" value={data.smoking_quit_year || ""} onChange={(e) => update("smoking_quit_year", e.target.value)} min="1950" max="2030" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Alcohol */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.alcoholTitle}</Label>
          <HearOutButton text={t.lifestyle.alcoholTitle} />
        </div>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.alcoholFreq}</Label>
            <Select value={data.alcohol_frequency || ""} onValueChange={(v) => update("alcohol_frequency", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t.common.all + "..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">{t.lifestyle.never}</SelectItem>
                <SelectItem value="rarely">{t.lifestyle.socially}</SelectItem>
                <SelectItem value="weekly">{t.lifestyle.weekly}</SelectItem>
                <SelectItem value="frequent">{t.lifestyle.frequent}</SelectItem>
                <SelectItem value="daily">{t.lifestyle.daily}</SelectItem>
                <SelectItem value="former">{t.lifestyle.formerDrinker}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data.alcohol_frequency && data.alcohol_frequency !== "never" && (
            <div className="space-y-1.5">
              <Label className="text-[10px] sm:text-xs">{t.lifestyle.alcoholType}</Label>
              <Input className="h-10 text-sm" placeholder="e.g. Beer, Wine, Spirits" value={data.alcohol_type || ""} onChange={(e) => update("alcohol_type", e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* Drugs */}
      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.drugsTitle}</Label>
        <Select value={data.drug_use || ""} onValueChange={(v) => update("drug_use", v)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder={t.common.all + "..."} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">{t.lifestyle.never}</SelectItem>
            <SelectItem value="former">{t.lifestyle.formerUse}</SelectItem>
            <SelectItem value="occasional">{t.lifestyle.occasional}</SelectItem>
            <SelectItem value="regular">{t.lifestyle.regular}</SelectItem>
            <SelectItem value="prefer_not_say">{t.genderHealth.preferNotSay}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exercise */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.activityTitle}</Label>
          <HearOutButton text={t.lifestyle.activityTitle} />
        </div>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.alcoholFreq}</Label>
            <Select value={data.exercise_frequency || ""} onValueChange={(v) => update("exercise_frequency", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t.common.all + "..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">{t.lifestyle.sedentary}</SelectItem>
                <SelectItem value="light">{t.lifestyle.light}</SelectItem>
                <SelectItem value="moderate">{t.lifestyle.moderate}</SelectItem>
                <SelectItem value="active">{t.lifestyle.active}</SelectItem>
                <SelectItem value="very_active">{t.lifestyle.veryActive}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.exerciseType}</Label>
            <Input className="h-10 text-sm" placeholder="e.g. Walking, Gym, Yoga" value={data.exercise_type || ""} onChange={(e) => update("exercise_type", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Diet */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.dietTitle}</Label>
          <HearOutButton text={t.lifestyle.dietTitle} />
        </div>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.dietType}</Label>
            <Select value={data.diet_type || ""} onValueChange={(v) => update("diet_type", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t.common.all + "..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetarian">{t.lifestyle.vegetarian}</SelectItem>
                <SelectItem value="vegan">{t.lifestyle.vegan}</SelectItem>
                <SelectItem value="non_vegetarian">{t.lifestyle.nonVeg}</SelectItem>
                <SelectItem value="eggetarian">{t.lifestyle.eggetarian}</SelectItem>
                <SelectItem value="pescatarian">{t.lifestyle.pescatarian}</SelectItem>
                <SelectItem value="keto">{t.lifestyle.keto}</SelectItem>
                <SelectItem value="other">{t.common.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.mealsDay}</Label>
            <Input className="h-10 text-sm" type="number" placeholder="e.g. 3" value={data.meals_per_day || ""} onChange={(e) => update("meals_per_day", e.target.value)} min="1" max="10" />
          </div>
        </div>
      </div>

      {/* Sleep */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.sleepTitle}</Label>
          <HearOutButton text={t.lifestyle.sleepTitle} />
        </div>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.history.averageSleep}</Label>
            <Input className="h-10 text-sm" type="number" placeholder="e.g. 7" value={data.sleep_hours || ""} onChange={(e) => update("sleep_hours", e.target.value)} min="1" max="16" step="0.5" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.sleepQuality}</Label>
            <Select value={data.sleep_quality || ""} onValueChange={(v) => update("sleep_quality", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t.common.all + "..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">{t.lifestyle.excellent}</SelectItem>
                <SelectItem value="good">{t.lifestyle.good}</SelectItem>
                <SelectItem value="fair">{t.lifestyle.fair}</SelectItem>
                <SelectItem value="poor">{t.lifestyle.poor}</SelectItem>
                <SelectItem value="insomnia">{t.lifestyle.insomnia}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stress & Mental Health */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.mentalTitle}</Label>
          <HearOutButton text={t.lifestyle.mentalTitle} />
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.stressLevel}</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[data.stress_level || 5]}
                onValueChange={(v) => update("stress_level", v[0])}
                max={10}
                min={1}
                step={1}
                className="flex-1"
              />
              <span className="w-8 text-center text-sm font-semibold text-foreground">{data.stress_level || 5}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">{t.lifestyle.mentalHistory}</Label>
            <Select value={data.mental_health || ""} onValueChange={(v) => update("mental_health", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={t.common.all + "..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.lifestyle.none}</SelectItem>
                <SelectItem value="depression">{t.familyHistory.depression}</SelectItem>
                <SelectItem value="anxiety">{t.familyHistory.anxiety}</SelectItem>
                <SelectItem value="both">{t.familyHistory.depression} & {t.familyHistory.anxiety}</SelectItem>
                <SelectItem value="bipolar">Bipolar</SelectItem>
                <SelectItem value="ptsd">PTSD</SelectItem>
                <SelectItem value="other">{t.common.other}</SelectItem>
                <SelectItem value="prefer_not_say">{t.genderHealth.preferNotSay}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Occupation */}
      <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.occupationTitle}</Label>
          <Input className="h-10 text-sm" placeholder="e.g. Software Engineer" value={data.occupation || ""} onChange={(e) => update("occupation", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm font-semibold">{t.lifestyle.workTypeTitle}</Label>
          <Select value={data.work_type || ""} onValueChange={(v) => update("work_type", v)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder={t.common.all + "..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desk_job">{t.lifestyle.deskJob}</SelectItem>
              <SelectItem value="physical_labor">{t.lifestyle.physicalLabor}</SelectItem>
              <SelectItem value="mixed">{t.common.mixed}</SelectItem>
              <SelectItem value="homemaker">{t.lifestyle.homemaker}</SelectItem>
              <SelectItem value="student">{t.lifestyle.student}</SelectItem>
              <SelectItem value="retired">{t.lifestyle.retired}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
