import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface StepLifestyleProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function StepLifestyle({ data, onChange }: StepLifestyleProps) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  return (
    <div className="space-y-5 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Your daily habits and lifestyle greatly impact your health. Please answer honestly for accurate health insights.
      </p>

      {/* Smoking */}
      <div className="space-y-2.5">
        <Label className="text-xs sm:text-sm font-semibold">Smoking / Tobacco</Label>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Status</Label>
            <Select value={data.smoking_status || ""} onValueChange={(v) => update("smoking_status", v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never Smoked</SelectItem>
                <SelectItem value="former">Former Smoker</SelectItem>
                <SelectItem value="current">Current Smoker</SelectItem>
                <SelectItem value="occasional">Occasional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(data.smoking_status === "current" || data.smoking_status === "former") && (
            <>
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">Cigarettes per Day</Label>
                <Input className="h-10 text-sm" type="number" placeholder="e.g. 10" value={data.cigarettes_per_day || ""} onChange={(e) => update("cigarettes_per_day", e.target.value)} min="0" max="100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs">Years of Smoking</Label>
                <Input className="h-10 text-sm" type="number" placeholder="e.g. 5" value={data.smoking_years || ""} onChange={(e) => update("smoking_years", e.target.value)} min="0" max="80" />
              </div>
              {data.smoking_status === "former" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs">Year Quit</Label>
                  <Input className="h-10 text-sm" type="number" placeholder="e.g. 2020" value={data.smoking_quit_year || ""} onChange={(e) => update("smoking_quit_year", e.target.value)} min="1950" max="2030" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Alcohol */}
      <div className="space-y-2.5">
        <Label className="text-xs sm:text-sm font-semibold">Alcohol Consumption</Label>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Frequency</Label>
            <Select value={data.alcohol_frequency || ""} onValueChange={(v) => update("alcohol_frequency", v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="rarely">Rarely (social only)</SelectItem>
                <SelectItem value="weekly">1-2 times/week</SelectItem>
                <SelectItem value="frequent">3-5 times/week</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="former">Former Drinker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data.alcohol_frequency && data.alcohol_frequency !== "never" && (
            <div className="space-y-1.5">
              <Label className="text-[10px] sm:text-xs">Type of Alcohol</Label>
              <Input className="h-10 text-sm" placeholder="e.g. Beer, Wine, Spirits" value={data.alcohol_type || ""} onChange={(e) => update("alcohol_type", e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* Drugs */}
      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm font-semibold">Recreational Drug Use</Label>
        <Select value={data.drug_use || ""} onValueChange={(v) => update("drug_use", v)}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Never</SelectItem>
            <SelectItem value="former">Former Use</SelectItem>
            <SelectItem value="occasional">Occasional</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="prefer_not_say">Prefer Not to Say</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exercise */}
      <div className="space-y-2.5">
        <Label className="text-xs sm:text-sm font-semibold">Physical Activity</Label>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Exercise Frequency</Label>
            <Select value={data.exercise_frequency || ""} onValueChange={(v) => update("exercise_frequency", v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Light (1-2 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (3-4 days/week)</SelectItem>
                <SelectItem value="active">Active (5-6 days/week)</SelectItem>
                <SelectItem value="very_active">Very Active (daily)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Type of Exercise</Label>
            <Input className="h-10 text-sm" placeholder="e.g. Walking, Gym, Yoga" value={data.exercise_type || ""} onChange={(e) => update("exercise_type", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Diet */}
      <div className="space-y-2.5">
        <Label className="text-xs sm:text-sm font-semibold">Diet</Label>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Dietary Preference</Label>
            <Select value={data.diet_type || ""} onValueChange={(v) => update("diet_type", v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="eggetarian">Eggetarian</SelectItem>
                <SelectItem value="pescatarian">Pescatarian</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Meals per Day</Label>
            <Input className="h-10 text-sm" type="number" placeholder="e.g. 3" value={data.meals_per_day || ""} onChange={(e) => update("meals_per_day", e.target.value)} min="1" max="10" />
          </div>
        </div>
      </div>

      {/* Sleep */}
      <div className="space-y-2.5">
        <Label className="text-xs sm:text-sm font-semibold">Sleep</Label>
        <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Average Sleep (hours/night)</Label>
            <Input className="h-10 text-sm" type="number" placeholder="e.g. 7" value={data.sleep_hours || ""} onChange={(e) => update("sleep_hours", e.target.value)} min="1" max="16" step="0.5" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Sleep Quality</Label>
            <Select value={data.sleep_quality || ""} onValueChange={(v) => update("sleep_quality", v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="insomnia">Insomnia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stress & Mental Health */}
      <div className="space-y-2.5">
        <Label className="text-xs sm:text-sm font-semibold">Mental Health & Stress</Label>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] sm:text-xs">Stress Level (1 = Low, 10 = Extreme)</Label>
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
            <Label className="text-[10px] sm:text-xs">Mental Health History</Label>
            <Select value={data.mental_health || ""} onValueChange={(v) => update("mental_health", v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="depression">Depression</SelectItem>
                <SelectItem value="anxiety">Anxiety</SelectItem>
                <SelectItem value="both">Depression & Anxiety</SelectItem>
                <SelectItem value="bipolar">Bipolar</SelectItem>
                <SelectItem value="ptsd">PTSD</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_say">Prefer Not to Say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Occupation */}
      <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm font-semibold">Occupation</Label>
          <Input className="h-10 text-sm" placeholder="e.g. Software Engineer" value={data.occupation || ""} onChange={(e) => update("occupation", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm font-semibold">Work Type</Label>
          <Select value={data.work_type || ""} onValueChange={(v) => update("work_type", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="desk_job">Desk Job</SelectItem>
              <SelectItem value="physical_labor">Physical Labor</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="homemaker">Homemaker</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Additional Lifestyle Notes</Label>
        <Textarea
          placeholder="Any other lifestyle details, travel history, environmental exposures..."
          value={data.notes || ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
