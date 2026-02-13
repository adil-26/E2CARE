import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface KidneyUrinaryDiagramProps {
    kidneyRemoved?: "no" | "left" | "right";
    selectedConditions?: string[];
    onToggle?: (condition: string) => void;
}

// Urinary system parts
const urinaryParts = [
    {
        id: "right_kidney", // Patient's right is on left of screen
        label: "Right Kidney",
        d: "M80,90 Q65,85 60,105 Q55,125 60,140 Q65,155 80,150 Q95,145 90,125 Q85,110 80,90 Z",
        color: "#e11d48", // rose-600 (kidney bean color)
    },
    {
        id: "left_kidney", // Patient's left is on right of screen
        label: "Left Kidney",
        d: "M170,85 Q155,80 150,100 Q145,120 150,135 Q155,150 170,145 Q185,140 180,120 Q175,105 170,85 Z",
        color: "#e11d48",
    },
    {
        id: "right_ureter",
        label: "Right Ureter",
        d: "M85,135 Q85,160 105,190 L110,210 L115,210 L110,190 Q95,160 90,135 Z",
        color: "#fca5a5", // rose-300
    },
    {
        id: "left_ureter",
        label: "Left Ureter",
        d: "M155,130 Q155,155 135,185 L130,210 L125,210 L130,185 Q145,155 150,130 Z",
        color: "#fca5a5",
    },
    {
        id: "bladder",
        label: "Bladder",
        d: "M120,205 Q95,205 95,230 Q95,255 120,260 Q145,255 145,230 Q145,205 120,205 Z",
        color: "#f43f5e", // rose-500
    },
];

export default function KidneyUrinaryDiagram({ kidneyRemoved = "no", selectedConditions = [], onToggle }: KidneyUrinaryDiagramProps) {
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);

    // Map parts to possible conditions for highlighting (simplified mapping)
    // This helps visually link conditions to anatomy
    const isPartAffected = (partId: string) => {
        if (selectedConditions.includes("Kidney Stones") || selectedConditions.includes("Kidney Disease")) {
            if (partId.includes("kidney")) return true;
        }
        if (selectedConditions.includes("Bladder Infection") || selectedConditions.includes("Overactive Bladder") || selectedConditions.includes("Incontinence") || selectedConditions.includes("UTI (recurrent)")) {
            if (partId === "bladder") return true;
        }
        return false;
    };

    const isRemoved = (partId: string) => {
        if (partId === "right_kidney" && kidneyRemoved === "right") return true;
        if (partId === "left_kidney" && kidneyRemoved === "left") return true;
        return false;
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[3/4] mx-auto bg-gradient-to-b from-rose-50 to-white rounded-2xl border border-rose-100 shadow-sm p-4 overflow-hidden">
                {/* Header Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-semibold text-rose-600 uppercase tracking-wide bg-white/80 px-2.5 py-1 rounded-md border border-rose-100">
                    <Info className="w-3 h-3" />
                    <span>Urinary Tract</span>
                </div>

                <svg viewBox="0 0 240 300" className="w-full h-full select-none">
                    <defs>
                        <filter id="kidneyGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>

                        <pattern id="removedPattern" width="8" height="8" patternUnits="userSpaceOnUse">
                            <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
                        </pattern>
                    </defs>

                    <g transform="translate(0, 0)">
                        {/* Veins/Arteries Background (simplified) */}
                        <path d="M120,50 L120,200" stroke="#ef4444" strokeWidth="8" opacity="0.1" strokeLinecap="round" />
                        <path d="M112,50 L112,200" stroke="#3b82f6" strokeWidth="8" opacity="0.1" strokeLinecap="round" />

                        {urinaryParts.map((part) => {
                            const removed = isRemoved(part.id);
                            const affected = isPartAffected(part.id);
                            const isHovered = hoveredPart === part.id;

                            return (
                                <g key={part.id}>
                                    <path
                                        d={part.d}
                                        onMouseEnter={() => setHoveredPart(part.id)}
                                        onMouseLeave={() => setHoveredPart(null)}
                                        fill={removed ? "url(#removedPattern)" : (affected ? "#be123c" : part.color)} // Darker red if affected
                                        fillOpacity={removed ? 0.3 : (affected ? 1 : 0.8)}
                                        stroke={removed ? "#94a3b8" : (affected ? "#881337" : "#be123c")}
                                        strokeWidth={removed ? 1 : (affected || isHovered ? 2 : 1)}
                                        className={cn(
                                            "transition-all duration-300",
                                            !removed && "cursor-pointer hover:drop-shadow-md"
                                        )}
                                        filter={(!removed && (affected || isHovered)) ? "url(#kidneyGlow)" : undefined}
                                        style={{
                                            transform: !removed && isHovered ? "scale(1.03)" : "scale(1)",
                                            transformOrigin: "center",
                                        }}
                                    />

                                    {/* Cross out if removed */}
                                    {removed && (
                                        <path
                                            d={part.id === "right_kidney" ? "M60,90 L90,150 M60,150 L90,90" : "M150,85 L180,145 M150,145 L180,85"}
                                            stroke="#ef4444"
                                            strokeWidth="2"
                                            opacity="0.6"
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* Labels */}
                    <text x="40" y="80" fontSize="10" fill="#94a3b8" fontWeight="bold">RIGHT</text>
                    <text x="170" y="80" fontSize="10" fill="#94a3b8" fontWeight="bold">LEFT</text>
                </svg>

                {/* Hover Tooltip */}
                {hoveredPart && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <span className="bg-rose-950/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md">
                            {urinaryParts.find(r => r.id === hoveredPart)?.label}
                            {isRemoved(hoveredPart) && " (Removed)"}
                        </span>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    Healthy
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-900 border border-rose-200"></span>
                    Affected
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-300 relative overflow-hidden bg-slate-100">
                        <span className="absolute inset-0 bg-slate-300 rotate-45 w-[1px] h-[150%] left-1/2 -top-1"></span>
                    </span>
                    Removed
                </div>
            </div>
        </div>
    );
}
