import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface StepBirthHistoryProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function StepBirthHistory({ data, onChange }: StepBirthHistoryProps) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });

  return (
    <div className="space-y-4 overflow-hidden">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Tell us about your birth and early life. This helps us understand potential hereditary conditions.
      </p>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Type of Delivery</Label>
          <Select value={data.delivery_type || ""} onValueChange={(v) => update("delivery_type", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal_vaginal">Normal Vaginal</SelectItem>
              <SelectItem value="cesarean">Cesarean (C-Section)</SelectItem>
              <SelectItem value="assisted_vaginal">Assisted Vaginal (Forceps/Vacuum)</SelectItem>
              <SelectItem value="water_birth">Water Birth</SelectItem>
              <SelectItem value="unknown">Don't Know</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Birth Weight</Label>
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
              <SelectTrigger className="w-20 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Gestational Age at Birth</Label>
          <Select value={data.gestational_age || ""} onValueChange={(v) => update("gestational_age", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="preterm">Preterm (&lt;37 weeks)</SelectItem>
              <SelectItem value="full_term">Full Term (37–42 weeks)</SelectItem>
              <SelectItem value="post_term">Post-Term (&gt;42 weeks)</SelectItem>
              <SelectItem value="unknown">Don't Know</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Birth Complications</Label>
          <Select value={data.birth_complications || ""} onValueChange={(v) => update("birth_complications", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="jaundice">Jaundice</SelectItem>
              <SelectItem value="breathing_issues">Breathing Issues</SelectItem>
              <SelectItem value="cord_around_neck">Cord Around Neck</SelectItem>
              <SelectItem value="nicu_stay">NICU Stay Required</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="unknown">Don't Know</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Blood Type (if known)</Label>
          <Select value={data.blood_type || ""} onValueChange={(v) => update("blood_type", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                <SelectItem key={bt} value={bt}>{bt}</SelectItem>
              ))}
              <SelectItem value="unknown">Don't Know</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm">Were you breastfed?</Label>
          <Select value={data.breastfed || ""} onValueChange={(v) => update("breastfed", v)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes_exclusive">Yes, exclusively</SelectItem>
              <SelectItem value="yes_mixed">Yes, mixed with formula</SelectItem>
              <SelectItem value="formula_only">Formula only</SelectItem>
              <SelectItem value="unknown">Don't Know</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs sm:text-sm">Additional Birth Notes</Label>
        <Textarea
          placeholder="Any other details about your birth or early infancy..."
          value={data.notes || ""}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
