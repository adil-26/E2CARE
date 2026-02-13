import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  type: "stool" | "urine";
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const stoolColors = [
  { value: "brown", label: "Brown (Normal)", hex: "#8B4513" },
  { value: "dark_brown", label: "Dark Brown", hex: "#3E1C0E" },
  { value: "light_brown", label: "Light Brown / Tan", hex: "#C4A35A" },
  { value: "yellow", label: "Yellow", hex: "#DAA520" },
  { value: "green", label: "Green", hex: "#2E8B57" },
  { value: "black", label: "Black / Tarry", hex: "#1a1a1a" },
  { value: "red", label: "Red / Bloody", hex: "#DC143C" },
  { value: "white", label: "White / Clay", hex: "#E8E0D0" },
  { value: "orange", label: "Orange", hex: "#FF8C00" },
];

const urineColors = [
  { value: "clear", label: "Clear / Transparent", hex: "#E0F0FF" },
  { value: "pale_yellow", label: "Pale Yellow (Normal)", hex: "#FFFF99" },
  { value: "yellow", label: "Yellow", hex: "#FFD700" },
  { value: "dark_yellow", label: "Dark Yellow", hex: "#FF8C00" },
  { value: "amber", label: "Amber / Honey", hex: "#FFBF00" },
  { value: "brown", label: "Brown", hex: "#8B4513" },
  { value: "red", label: "Red / Pink", hex: "#DC143C" },
  { value: "orange", label: "Orange", hex: "#FF6347" },
  { value: "blue_green", label: "Blue / Green", hex: "#20B2AA" },
  { value: "cloudy", label: "Cloudy / Milky", hex: "#E8E0D0" },
  { value: "foamy", label: "Foamy / Bubbly", hex: "#F5F5DC" },
];

export default function StoolUrineAnalysis({ type, data, onChange }: Props) {
  const update = (key: string, value: any) => onChange({ ...data, [key]: value });
  const colors = type === "stool" ? stoolColors : urineColors;
  const icon = type === "stool" ? "💩" : "🧪";
  const title = type === "stool" ? "Stool Analysis" : "Urine Analysis";

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <Label className="mb-3 block text-sm font-semibold">{icon} {title}</Label>

        {/* Color selector - responsive grid of test tubes */}
        <div className="mb-4">
          <Label className="text-xs mb-2 block">Color (tap the closest match)</Label>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:flex md:flex-wrap gap-2 sm:gap-1.5">
            {colors.map((color) => {
              const isSelected = data.color === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => update("color", color.value)}
                  className="group relative flex flex-col items-center"
                  title={color.label}
                >
                  {/* Test tube shape */}
                  <div
                    className={`w-10 h-14 sm:w-7 sm:h-14 rounded-b-full rounded-t-sm border-2 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 scale-110"
                        : "border-border hover:border-primary/50 active:scale-95"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className={`mt-1 text-[8px] sm:text-[7px] font-medium leading-tight text-center max-w-[48px] sm:max-w-[40px] line-clamp-2 ${
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {color.label.split("(")[0].trim().split("/")[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>
          {data.color && (
            <p className="mt-2 text-xs text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{colors.find(c => c.value === data.color)?.label}</span>
            </p>
          )}
        </div>

        {type === "stool" && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Consistency (Bristol Scale)</Label>
              <Select value={data.consistency || ""} onValueChange={(v) => update("consistency", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Type 1 - Hard lumps</SelectItem>
                  <SelectItem value="2">Type 2 - Lumpy sausage</SelectItem>
                  <SelectItem value="3">Type 3 - Cracks (Normal)</SelectItem>
                  <SelectItem value="4">Type 4 - Smooth (Ideal)</SelectItem>
                  <SelectItem value="5">Type 5 - Soft blobs</SelectItem>
                  <SelectItem value="6">Type 6 - Mushy (Loose)</SelectItem>
                  <SelectItem value="7">Type 7 - Watery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Frequency</Label>
              <Select value={data.frequency || ""} onValueChange={(v) => update("frequency", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="less_3_week">Less than 3x / week</SelectItem>
                  <SelectItem value="3_week">3x / week</SelectItem>
                  <SelectItem value="daily">Once daily</SelectItem>
                  <SelectItem value="2_daily">2x daily</SelectItem>
                  <SelectItem value="3_plus">3+ times daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Blood in Stool?</Label>
              <Select value={data.blood || ""} onValueChange={(v) => update("blood", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="frequently">Frequently</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mucus in Stool?</Label>
              <Select value={data.mucus || ""} onValueChange={(v) => update("mucus", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="frequently">Frequently</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {type === "urine" && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Frequency</Label>
              <Select value={data.frequency || ""} onValueChange={(v) => update("frequency", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (4-8x / day)</SelectItem>
                  <SelectItem value="frequent">Frequent (8+ / day)</SelectItem>
                  <SelectItem value="infrequent">Infrequent (&lt;4x / day)</SelectItem>
                  <SelectItem value="nocturia">Waking at night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pain / Burning?</Label>
              <Select value={data.pain || ""} onValueChange={(v) => update("pain", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="always">Always</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Blood in Urine?</Label>
              <Select value={data.blood || ""} onValueChange={(v) => update("blood", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="frequently">Frequently</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Odor</Label>
              <Select value={data.odor || ""} onValueChange={(v) => update("odor", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="strong">Strong / Foul</SelectItem>
                  <SelectItem value="sweet">Sweet / Fruity</SelectItem>
                  <SelectItem value="ammonia">Ammonia-like</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
