import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToothData {
  status: "healthy" | "cavity" | "filled" | "crowned" | "missing" | "implant" | "root_canal" | "broken";
  details: string;
  year: string;
}

interface TeethDiagramProps {
  teethData: Record<string, ToothData>;
  onChange: (data: Record<string, ToothData>) => void;
}

// ─── Constants & Metadata ───

// Standard Universal Numbering System
// Upper Arch: 1 (Right Molar) -> 16 (Left Molar)
// Lower Arch: 32 (Right Molar) -> 17 (Left Molar)
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

// Colors for SVG fill
const statusColors: Record<string, string> = {
  healthy: "#f8fafc", // slate-50 (white-ish)
  cavity: "#fca5a5", // red-300
  filled: "#93c5fd", // blue-300
  crowned: "#fcd34d", // amber-300
  missing: "#e2e8f0", // slate-200 (faded)
  implant: "#cbd5e1", // slate-300 (metal grey)
  root_canal: "#fdba74", // orange-300
  broken: "#f87171", // red-400
};

const statusStroke: Record<string, string> = {
  healthy: "#94a3b8", // slate-400
  cavity: "#ef4444", // red-500
  filled: "#3b82f6", // blue-500
  crowned: "#b45309", // amber-700
  missing: "#94a3b8", // slate-400
  implant: "#64748b", // slate-500
  root_canal: "#c2410c", // orange-700
  broken: "#b91c1c", // red-700
};

const statusDescriptions: Record<string, string> = {
  healthy: "Healthy", cavity: "Cavity", filled: "Filled", crowned: "Crown",
  missing: "Missing", implant: "Implant", root_canal: "Root Canal", broken: "Broken",
};

// ─── Helper Functions for Geometry ───

// Get X,Y on ellipse for a given angle (degrees)
// cx, cy: center
// rx, ry: radii
// angle: degrees (0 is Right, 90 is Down, 180 is Left, 270 is Up)
function getPointOnEllipse(cx: number, cy: number, rx: number, ry: number, angleDeg: number) {
  const theta = (angleDeg * Math.PI) / 180;
  return {
    x: cx + rx * Math.cos(theta),
    y: cy + ry * Math.sin(theta),
  };
}

export default function TeethDiagram({ teethData, onChange }: TeethDiagramProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const updateTooth = (toothNum: number, field: keyof ToothData, value: string) => {
    const current = teethData[toothNum] || { status: "healthy", details: "", year: "" };
    onChange({ ...teethData, [toothNum]: { ...current, [field]: value } });
  };

  const getToothStatus = (num: number): string => teethData[num]?.status || "healthy";

  // ─── Render Single Tooth ───
  const RenderTooth = ({ num, cx, cy, angle, isUpper }: { num: number; cx: number; cy: number; angle: number; isUpper: boolean }) => {
    const status = getToothStatus(num);
    const isSelected = selectedTooth === num;

    // Determine tooth type based on position
    const getToothType = (toothNum: number): "molar" | "premolar" | "canine" | "incisor" => {
      const position = toothNum % 16 || 16;
      if (position >= 1 && position <= 3) return "molar";
      if (position >= 4 && position <= 5) return "premolar";
      if (position === 6) return "canine";
      return "incisor";
    };

    const toothType = getToothType(num);
    const color = statusColors[status];
    const stroke = isSelected ? "#2563eb" : statusStroke[status];
    const strokeWidth = isSelected ? 2.5 : 1.2;

    // Calculate position
    const pos = getPointOnEllipse(cx, cy, 140, 160, angle);
    const rotation = angle + 90;

    // Different tooth shapes based on type
    const getToothPath = () => {
      switch (toothType) {
        case "molar":
          // Molar: wider with 4 cusps
          return "M-12,-18 Q-14,-14 -12,-10 L-12,0 Q-14,8 -10,14 Q-5,18 0,18 Q5,18 10,14 Q14,8 12,0 L12,-10 Q14,-14 12,-18 Q5,-22 0,-22 Q-5,-22 -12,-18 M-8,-15 L-8,-12 M-4,-16 L-4,-12 M4,-16 L4,-12 M8,-15 L8,-12";
        case "premolar":
          // Premolar: medium with 2 cusps
          return "M-10,-16 Q-12,-12 -10,-8 L-10,2 Q-12,10 -8,14 Q-4,16 0,16 Q4,16 8,14 Q12,10 10,2 L10,-8 Q12,-12 10,-16 Q4,-20 0,-20 Q-4,-20 -10,-16 M-5,-14 L-5,-10 M5,-14 L5,-10";
        case "canine":
          // Canine: pointed single cusp
          return "M-8,-14 Q-10,-10 -8,-6 L-8,4 Q-10,12 -6,16 Q-3,18 0,18 Q3,18 6,16 Q10,12 8,4 L8,-6 Q10,-10 8,-14 Q4,-20 0,-20 Q-4,-20 -8,-14 M0,-18 L0,-14";
        case "incisor":
          // Incisor: flat cutting edge
          return "M-7,-12 L-7,-6 L-7,6 Q-8,14 -4,16 Q-2,17 0,17 Q2,17 4,16 Q8,14 7,6 L7,-6 L7,-12 Q4,-16 0,-16 Q-4,-16 -7,-12";
      }
    };

    return (
      <g
        transform={`translate(${pos.x}, ${pos.y}) rotate(${rotation})`}
        onClick={() => setSelectedTooth(isSelected ? null : num)}
        className="cursor-pointer group transition-all duration-300"
      >
        {/* Outer glow on hover */}
        <path
          d={getToothPath()}
          fill="transparent"
          stroke={isSelected ? "#3b82f6" : "transparent"}
          strokeWidth={isSelected ? 6 : 4}
          opacity={isSelected ? 0.3 : 0}
          className="group-hover:opacity-20 group-hover:stroke-blue-400 transition-all duration-300"
        />

        {/* Main Tooth Body with gradient */}
        <defs>
          <linearGradient id={`toothGrad-${num}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopOpacity: 0.85, stopColor: status === "healthy" ? "#e2e8f0" : color }} />
          </linearGradient>
          <filter id={`toothShadow-${num}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
            <feOffset dx="0.5" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={getToothPath()}
          fill={`url(#toothGrad-${num})`}
          stroke={stroke}
          strokeWidth={strokeWidth}
          filter={`url(#toothShadow-${num})`}
          className="transition-all duration-300"
          style={{
            transformOrigin: "center",
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.transform = "scale(1.12)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
        />

        {/* Missing Cross */}
        {status === "missing" && (
          <path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
        )}

        {/* Cavity indicator */}
        {status === "cavity" && (
          <circle cx="0" cy="-5" r="3" fill="#7f1d1d" opacity="0.7" />
        )}

        {/* Crown indicator */}
        {status === "crowned" && (
          <path d="M-6,-18 L-3,-14 L0,-18 L3,-14 L6,-18" stroke="#b45309" strokeWidth="1.5" fill="none" />
        )}

        {/* Number Label */}
        <text
          y={2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fontWeight="600"
          fill={status === "filled" || status === "broken" || status === "root_canal" ? "white" : "#475569"}
          transform={`rotate(${-rotation})`}
          className="pointer-events-none select-none"
        >
          {num}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        {/* SVG Container */}
        <div className="relative w-full max-w-[400px] aspect-[4/5] mx-auto bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50 rounded-2xl border-2 border-slate-200/60 shadow-lg p-4 overflow-hidden">

          {/* Header Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide bg-white/90 px-3 py-1.5 rounded-lg backdrop-blur-md border border-slate-200 shadow-sm z-10">
            <Info className="w-3 h-3 text-slate-500" />
            <span className="bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">Dental Chart</span>
          </div>

          <svg viewBox="0 0 400 500" className="w-full h-full select-none drop-shadow-sm">
            {/* Center Cross / Mouth BG (Optional) */}
            {/* <ellipse cx="200" cy="250" rx="100" ry="120" fill="#f1f5f9" opacity="0.5" /> */}

            {/* Labels */}
            <text x="50" y="50" fontSize="10" fill="#94a3b8" fontWeight="bold">RIGHT</text>
            <text x="310" y="50" fontSize="10" fill="#94a3b8" fontWeight="bold">LEFT</text>

            <text x="200" y="110" textAnchor="middle" fontSize="10" fill="#cbd5e1" letterSpacing="2" fontWeight="600">UPPER ARCH</text>
            <text x="200" y="390" textAnchor="middle" fontSize="10" fill="#cbd5e1" letterSpacing="2" fontWeight="600">LOWER ARCH</text>

            {/* Upper Teeth (1-16) */}
            {/* 1 (Right Molar) is at ~190 deg (Left on screen) -> Wait, Reference image: 
                R 1...16 L (Top)
                R 32...17 L (Bottom)
                So on SCREEN: Left side is Right Side of Mouth (Patient's Right).
                So Tooth 1 is Top-Left of screen. Tooth 16 Top-Right.
                Angle range: 1 is near 180 (Left). 8/9 is 270 (Top). 16 is 0 (Right).
                Let's use 190 deg to 350 deg.
            */}
            {upperTeeth.map((num, i) => {
              // Map index 0..15 to Angle Range
              const startAngle = 195;
              const endAngle = 345;
              const angle = startAngle + (i / 15) * (endAngle - startAngle);
              return <RenderTooth key={num} num={num} cx={200} cy={220} angle={angle} isUpper={true} />;
            })}

            {/* Lower Teeth (32-17) */}
            {/* 32 (Right Molar) is Bottom-Left on screen. 17 (Left Molar) is Bottom-Right.
                17 is near 0. 24/25 near 90. 32 near 180.
                So range: 32 -> 165 deg. 17 -> 15 deg.
                Order in array: [32, 31... 17].
                So i=0 (Tooth 32) -> Angle 165.
                i=15 (Tooth 17) -> Angle 15.
            */}
            {lowerTeeth.map((num, i) => {
              const startAngle = 165;
              const endAngle = 15;
              const angle = startAngle - (i / 15) * (startAngle - endAngle);
              return <RenderTooth key={num} num={num} cx={200} cy={280} angle={angle} isUpper={false} />;
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-sm">
          {Object.entries(statusDescriptions).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/30 border border-border/50 text-[10px] text-muted-foreground">
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10"
                style={{ backgroundColor: statusColors[key] }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTooth && (
        <Card className="border-primary/50 shadow-md animate-in slide-in-from-bottom-2 fade-in duration-300">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-primary flex items-center gap-2">
                  Tooth #{selectedTooth}
                  <span className="text-xs font-normal text-muted-foreground bg-accent px-2 py-0.5 rounded-full">
                    {selectedTooth <= 16 ? "Upper" : "Lower"} Arch
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{toothNames[selectedTooth]}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTooth(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Concerm / Status</Label>
                <Select value={getToothStatus(selectedTooth)} onValueChange={(v) => updateTooth(selectedTooth, "status", v)}>
                  <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusDescriptions).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[key] }} />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Year Treated</Label>
                <Input
                  className="h-9"
                  type="number"
                  placeholder="e.g. 2023"
                  value={teethData[selectedTooth]?.year || ""}
                  onChange={(e) => updateTooth(selectedTooth, "year", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Notes</Label>
                <Input
                  className="h-9"
                  placeholder="Specific details..."
                  value={teethData[selectedTooth]?.details || ""}
                  onChange={(e) => updateTooth(selectedTooth, "details", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
