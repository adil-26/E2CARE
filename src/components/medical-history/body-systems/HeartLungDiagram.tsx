import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface HeartLungDiagramProps {
    conditions?: string[];
    onToggle?: (part: string) => void;
}

// Simplified Heart & Lung Anatomy
const cardioParts = [
    // Lungs
    {
        id: "right_lung",
        label: "Right Lung",
        d: "M80,110 Q110,110 115,140 L115,200 Q90,210 70,200 Q60,150 80,110 Z",
        color: "#bfdbfe", // blue-200
        type: "lung"
    },
    {
        id: "left_lung",
        label: "Left Lung",
        d: "M170,110 Q140,110 135,140 L135,160 Q150,170 160,190 L180,200 Q190,150 170,110 Z",
        color: "#bfdbfe",
        type: "lung"
    },
    // Heart
    {
        id: "heart",
        label: "Heart",
        d: "M125,150 C145,135 160,155 145,175 L125,195 L105,175 C90,155 105,135 125,150 Z",
        color: "#ef4444", // red-500
        type: "heart"
    },
];

export default function HeartLungDiagram({ conditions = [], onToggle }: HeartLungDiagramProps) {
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);

    // Helper to check if a part should be highlighted based on conditions (simplified logic)
    const isAffected = (partId: string) => {
        if (partId.includes("lung")) {
            return conditions.some(c => ["Asthma", "COPD", "Pneumonia", "Bronchitis", "Lung Cancer", "Tuberculosis"].some(k => c.includes(k)));
        }
        if (partId === "heart") {
            return conditions.some(c => ["Heart", "Angina", "Arrhythmia", "Valve", "Aortic"].some(k => c.includes(k)));
        }
        return false;
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[4/5] mx-auto bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-blue-100 shadow-sm p-4 overflow-hidden">
                {/* Header Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-semibold text-rose-600 uppercase tracking-wide bg-white/80 px-2.5 py-1 rounded-md border border-rose-100 shadow-sm z-10">
                    <Info className="w-3 h-3" />
                    <span>Cardio-Respiratory</span>
                </div>

                <svg viewBox="0 0 250 300" className="w-full h-full select-none">
                    <defs>
                        <filter id="cardioGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>

                        <linearGradient id="gradLung" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#dbeafe" stopOpacity="1" />
                            <stop offset="100%" stopColor="#bfdbfe" stopOpacity="1" />
                        </linearGradient>

                        <linearGradient id="gradHeart" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                            <stop offset="100%" stopColor="#b91c1c" stopOpacity="1" />
                        </linearGradient>
                    </defs>

                    {/* Grid/Background lines (medical tech feel) */}
                    <line x1="20" y1="50" x2="230" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
                    <line x1="20" y1="250" x2="230" y2="250" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />

                    <g>
                        {/* Major Vessels (Background) */}
                        <path d="M125,110 L125,150" stroke="#b91c1c" strokeWidth="8" strokeLinecap="round" />
                        <path d="M115,110 L115,150" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />

                        {cardioParts.map((part) => {
                            const affected = isAffected(part.id);
                            const isHovered = hoveredPart === part.id;

                            return (
                                <path
                                    key={part.id}
                                    d={part.d}
                                    onMouseEnter={() => setHoveredPart(part.id)}
                                    onMouseLeave={() => setHoveredPart(null)}
                                    onClick={() => onToggle?.(part.id)}
                                    fill={part.type === "lung" ? "url(#gradLung)" : "url(#gradHeart)"}
                                    fillOpacity={affected ? 1 : 0.9}
                                    stroke={affected ? "#991b1b" : "white"}
                                    strokeWidth={affected || isHovered ? 2 : 1}
                                    className={cn(
                                        "transition-all duration-300 ease-out",
                                        onToggle && "cursor-pointer"
                                    )}
                                    filter={(affected || isHovered) ? "url(#cardioGlow)" : undefined}
                                    style={{
                                        transformOrigin: "center",
                                        transform: isHovered ? "scale(1.02)" : "scale(1)",
                                    }}
                                />
                            );
                        })}
                    </g>
                </svg>

                {/* Hover Tooltip */}
                {hoveredPart && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <span className="bg-slate-800/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md animate-in fade-in slide-in-from-bottom-1 border border-slate-700">
                            {cardioParts.find(r => r.id === hoveredPart)?.label}
                        </span>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span>
                    Lungs
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    Heart
                </div>
            </div>
        </div>
    );
}
