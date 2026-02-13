import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface ToothData {
  status: "healthy" | "cavity" | "filled" | "crowned" | "missing" | "implant" | "root_canal" | "broken";
  details: string;
  year: string;
}

interface TeethDiagramProps {
  teethData: Record<string, ToothData>;
  onChange: (data: Record<string, ToothData>) => void;
}

const upperTeeth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const lowerTeeth = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

const toothNames: Record<number, string> = {
  1: "Upper Right 3rd Molar", 2: "Upper Right 2nd Molar", 3: "Upper Right 1st Molar",
  4: "Upper Right 2nd Premolar", 5: "Upper Right 1st Premolar", 6: "Upper Right Canine",
  7: "Upper Right Lateral Incisor", 8: "Upper Right Central Incisor",
  9: "Upper Left Central Incisor", 10: "Upper Left Lateral Incisor",
  11: "Upper Left Canine", 12: "Upper Left 1st Premolar", 13: "Upper Left 2nd Premolar",
  14: "Upper Left 1st Molar", 15: "Upper Left 2nd Molar", 16: "Upper Left 3rd Molar",
  17: "Lower Left 3rd Molar", 18: "Lower Left 2nd Molar", 19: "Lower Left 1st Molar",
  20: "Lower Left 2nd Premolar", 21: "Lower Left 1st Premolar", 22: "Lower Left Canine",
  23: "Lower Left Lateral Incisor", 24: "Lower Left Central Incisor",
  25: "Lower Right Central Incisor", 26: "Lower Right Lateral Incisor",
  27: "Lower Right Canine", 28: "Lower Right 1st Premolar", 29: "Lower Right 2nd Premolar",
  30: "Lower Right 1st Molar", 31: "Lower Right 2nd Molar", 32: "Lower Right 3rd Molar",
};

const statusColors: Record<string, string> = {
  healthy: "bg-card border-border text-foreground",
  cavity: "bg-destructive/10 border-destructive/50 text-destructive",
  filled: "bg-info/10 border-info/50 text-info-foreground",
  crowned: "bg-warning/10 border-warning/50 text-warning-foreground",
  missing: "bg-muted border-muted-foreground/30 text-muted-foreground line-through",
  implant: "bg-secondary/10 border-secondary/50 text-secondary",
  root_canal: "bg-warning/15 border-warning/60 text-warning-foreground",
  broken: "bg-destructive/15 border-destructive/60 text-destructive",
};

const statusEmoji: Record<string, string> = {
  healthy: "🦷", cavity: "🔴", filled: "🔵", crowned: "👑",
  missing: "✖️", implant: "🔩", root_canal: "🟠", broken: "💔",
};

export default function TeethDiagram({ teethData, onChange }: TeethDiagramProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const updateTooth = (toothNum: number, field: keyof ToothData, value: string) => {
    const current = teethData[toothNum] || { status: "healthy", details: "", year: "" };
    onChange({ ...teethData, [toothNum]: { ...current, [field]: value } });
  };

  const getToothStatus = (num: number): string => teethData[num]?.status || "healthy";

  const renderToothButton = (num: number) => {
    const status = getToothStatus(num);
    const isSelected = selectedTooth === num;
    return (
      <button
        key={num}
        type="button"
        onClick={() => setSelectedTooth(isSelected ? null : num)}
        className={`relative flex items-center justify-center rounded-md border-2 text-[10px] font-bold transition-all
          h-9 w-9 sm:h-10 sm:w-10 md:h-10 md:w-9
          ${statusColors[status]}
          ${isSelected ? "ring-2 ring-primary ring-offset-1 scale-110 z-10" : "hover:scale-105 active:scale-95"}`}
        title={toothNames[num]}
      >
        {status !== "healthy" ? <span className="text-sm">{statusEmoji[status]}</span> : num}
      </button>
    );
  };

  // Split teeth into halves for mobile 2-row layout
  const upperLeft = upperTeeth.slice(0, 8);
  const upperRight = upperTeeth.slice(8);
  const lowerLeft = lowerTeeth.slice(0, 8);
  const lowerRight = lowerTeeth.slice(8);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Tap any tooth to add details. Colors indicate status.
      </p>

      {/* Legend - scrollable on mobile */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(statusEmoji).map(([status, emoji]) => (
          <span key={status} className="flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap">
            {emoji} {status.replace("_", " ")}
          </span>
        ))}
      </div>

      {/* Upper jaw */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Upper Jaw</span>
        {/* Desktop: single row */}
        <div className="hidden sm:flex justify-center gap-0.5">
          {upperTeeth.map(renderToothButton)}
        </div>
        {/* Mobile: 2 rows of 8 */}
        <div className="sm:hidden space-y-1">
          <div className="flex justify-center gap-1">
            {upperLeft.map(renderToothButton)}
          </div>
          <div className="flex justify-center gap-1">
            {upperRight.map(renderToothButton)}
          </div>
        </div>
      </div>

      {/* Jaw divider */}
      <div className="mx-auto h-px w-3/4 bg-border" />

      {/* Lower jaw */}
      <div className="text-center space-y-1">
        {/* Desktop: single row */}
        <div className="hidden sm:flex justify-center gap-0.5">
          {lowerTeeth.map(renderToothButton)}
        </div>
        {/* Mobile: 2 rows of 8 */}
        <div className="sm:hidden space-y-1">
          <div className="flex justify-center gap-1">
            {lowerLeft.map(renderToothButton)}
          </div>
          <div className="flex justify-center gap-1">
            {lowerRight.map(renderToothButton)}
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Lower Jaw</span>
      </div>

      {/* Selected tooth detail panel */}
      {selectedTooth && (
        <Card className="border-primary/30 shadow-sm animate-fade-in">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs sm:text-sm font-semibold">
                🦷 Tooth #{selectedTooth} — <span className="hidden sm:inline">{toothNames[selectedTooth]}</span>
                <span className="sm:hidden">{toothNames[selectedTooth]?.split(" ").slice(-2).join(" ")}</span>
              </Label>
              <button type="button" onClick={() => setSelectedTooth(null)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={getToothStatus(selectedTooth)} onValueChange={(v) => updateTooth(selectedTooth, "status", v)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">🦷 Healthy</SelectItem>
                    <SelectItem value="cavity">🔴 Cavity</SelectItem>
                    <SelectItem value="filled">🔵 Filled</SelectItem>
                    <SelectItem value="crowned">👑 Crown</SelectItem>
                    <SelectItem value="missing">✖️ Missing / Extracted</SelectItem>
                    <SelectItem value="implant">🔩 Implant</SelectItem>
                    <SelectItem value="root_canal">🟠 Root Canal</SelectItem>
                    <SelectItem value="broken">💔 Broken / Chipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Year of Treatment</Label>
                <Input className="h-10" type="number" placeholder="e.g. 2022" value={teethData[selectedTooth]?.year || ""} onChange={(e) => updateTooth(selectedTooth, "year", e.target.value)} min="1950" max="2030" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Details</Label>
                <Input className="h-10" placeholder="Additional details..." value={teethData[selectedTooth]?.details || ""} onChange={(e) => updateTooth(selectedTooth, "details", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
