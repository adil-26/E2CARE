import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface DigestiveSystemDiagramProps {
    conditions?: string[];
    organRemoved?: string;
    onToggle?: (part: string) => void;
}

// Digestive Anatomy Parts
const digestiveParts = [
    {
        id: "esophagus",
        label: "Esophagus",
        d: "M135,60 L145,60 L145,110 L135,110 Z",
        color: "#fca5a5", // red-300
        group: "upper_gi"
    },
    {
        id: "liver",
        label: "Liver",
        d: "M100,110 Q140,105 150,140 Q150,170 110,165 Q90,160 100,110 Z",
        color: "#b91c1c", // red-700
        group: "liver"
    },
    {
        id: "stomach",
        label: "Stomach",
        d: "M145,110 Q170,110 175,130 Q180,160 160,165 Q140,160 145,110 Z",
        color: "#fbbf24", // amber-400
        group: "stomach"
    },
    {
        id: "gallbladder",
        label: "Gallbladder",
        d: "M130,150 Q135,150 135,160 Q130,165 125,160 Q125,150 130,150 Z",
        color: "#16a34a", // green-600
        group: "gallbladder"
    },
    {
        id: "pancreas",
        label: "Pancreas",
        d: "M145,165 L170,160 L175,170 L150,175 Z",
        color: "#fde047", // yellow-300
        group: "pancreas"
    },
    {
        id: "large_intestine",
        label: "Large Intestine (Colon)",
        d: "M100,180 L180,180 L180,240 L160,240 L160,200 L120,200 L120,240 L100,240 Z",
        color: "#d6d3d1", // stone-300
        group: "colon"
    },
    {
        id: "small_intestine",
        label: "Small Intestine",
        d: "M125,205 Q140,200 155,205 Q155,225 140,230 Q125,225 125,205 Z",
        color: "#fda4af", // rose-300
        group: "small_intestine"
    },
    {
        id: "appendix",
        label: "Appendix",
        d: "M100,240 L105,240 L102,250 L98,250 Z",
        color: "#f87171", // red-400
        group: "appendix"
    },
    {
        id: "rectum",
        label: "Rectum",
        d: "M135,240 L145,240 L142,260 L138,260 Z",
        color: "#a8a29e", // stone-400
        group: "rectum"
    }
];

export default function DigestiveSystemDiagram({ conditions = [], organRemoved, onToggle }: DigestiveSystemDiagramProps) {
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);

    // Map parts to conditions
    const isAffected = (partId: string) => {
        if (partId === "esophagus" && conditions.some(c => c.includes("Reflux") || c.includes("GERD"))) return true;
        if (partId === "stomach" && conditions.some(c => c.includes("Ulcer") || c.includes("Gastritis"))) return true;
        if (partId === "liver" && conditions.some(c => c.includes("Liver") || c.includes("Hepatitis") || c.includes("Cirrhosis"))) return true;
        if (partId === "gallbladder" && conditions.some(c => c.includes("Gallstones"))) return true;
        if (partId === "pancreas" && conditions.some(c => c.includes("Pancreat"))) return true;
        if ((partId === "large_intestine" || partId === "small_intestine") && conditions.some(c => c.includes("IBS") || c.includes("Colitis") || c.includes("Crohn") || c.includes("Diverticulitis"))) return true;
        if (partId === "appendix" && conditions.some(c => c.includes("Appendicitis"))) return true;

        return false;
    };

    const isRemoved = (partId: string) => {
        if (!organRemoved || organRemoved === "none") return false;
        if (partId === "appendix" && organRemoved === "appendix") return true;
        if (partId === "gallbladder" && organRemoved === "gallbladder") return true;
        if (partId === "spleen" && organRemoved === "spleen") return true; // Spleen not drawn but logic exists
        // Simplified checks for partial removals could be added
        return false;
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[3/4] mx-auto bg-gradient-to-b from-amber-50 to-orange-50/50 rounded-2xl border border-amber-100 shadow-sm p-4 overflow-hidden">
                {/* Header Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-semibold text-amber-700 uppercase tracking-wide bg-white/80 px-2.5 py-1 rounded-md border border-amber-200 shadow-sm z-10">
                    <Info className="w-3 h-3" />
                    <span>Digestive Tract</span>
                </div>

                <svg viewBox="0 0 280 320" className="w-full h-full select-none">
                    <defs>
                        <filter id="digestiveGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>

                        <pattern id="removedPatternGI" width="6" height="6" patternUnits="userSpaceOnUse">
                            <path d="M-1,1 l2,-2 M0,6 l6,-6 M5,7 l2,-2" stroke="#a8a29e" strokeWidth="1" opacity="0.5" />
                        </pattern>
                    </defs>

                    {/* Background Body Outline */}
                    <path
                        d="M80,50 Q140,40 200,50 L210,150 Q220,250 200,300 L80,300 Q60,250 70,150 Z"
                        fill="#fff7ed"
                        stroke="#fed7aa"
                        strokeWidth="1"
                        strokeDasharray="4,2"
                        opacity="0.5"
                    />

                    <g transform="translate(0, 0)">
                        {digestiveParts.map((part) => {
                            const removed = isRemoved(part.id);
                            const affected = isAffected(part.id);
                            const isHovered = hoveredPart === part.id;

                            return (
                                <g key={part.id}>
                                    <path
                                        d={part.d}
                                        onMouseEnter={() => setHoveredPart(part.id)}
                                        onMouseLeave={() => setHoveredPart(null)}
                                        onClick={() => !removed && onToggle?.(part.id)}
                                        fill={removed ? "url(#removedPatternGI)" : part.color}
                                        fillOpacity={removed ? 0.3 : (affected ? 1 : 0.9)}
                                        stroke={removed ? "#d6d3d1" : (affected ? "#991b1b" : "#78350f")}
                                        strokeWidth={removed ? 1 : (affected || isHovered ? 1.5 : 0.5)}
                                        strokeOpacity={0.6}
                                        className={cn(
                                            "transition-all duration-300",
                                            !removed && "cursor-pointer"
                                        )}
                                        filter={(!removed && (affected || isHovered)) ? "url(#digestiveGlow)" : undefined}
                                        style={{
                                            transform: !removed && isHovered ? "scale(1.02)" : "scale(1)",
                                            transformOrigin: "center",
                                        }}
                                    />

                                    {/* Cross out if removed */}
                                    {removed && (
                                        <path
                                            d={`M${5} ${5} l10 10 M5 15 l10 -10`} // Placeholder cross, in reality needs centroid
                                        // Using a simple cross over the bounding box center would be better but requires complex calc.
                                        // For now, simpler: just the fill pattern indicates removal.
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </g>
                </svg>

                {/* Hover Tooltip */}
                {hoveredPart && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <span className="bg-amber-950/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md animate-in fade-in slide-in-from-bottom-1">
                            {digestiveParts.find(r => r.id === hoveredPart)?.label}
                            {isRemoved(hoveredPart) && " (Removed)"}
                            {!isRemoved(hoveredPart) && isAffected(hoveredPart) && " (Affected)"}
                        </span>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Stomach
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-700"></span>
                    Liver
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-300 relative overflow-hidden">
                        <span className="absolute inset-0 bg-stone-400/50 rotate-45 w-[1px] h-[150%] left-1/2 -top-1"></span>
                    </span>
                    Removed
                </div>
            </div>
        </div>
    );
}
