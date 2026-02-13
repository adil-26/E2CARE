import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

type OrganSystem = "all" | "cardio" | "gi" | "urinary" | "neuro" | "endocrine";

interface OrgansDiagramProps {
    system: OrganSystem;
    conditions: string[]; // List of selected conditions to attempt to highlight relevant organs, or just used for display logic
    onToggle?: (organ: string) => void; // Optional interaction
}

// Organ data with SVG paths
// ViewBox: 0 0 300 500
const organs = [
    {
        id: "brain",
        label: "Brain",
        system: ["neuro", "endocrine"],
        d: "M150,30 C130,30 120,45 120,65 C120,90 135,100 150,100 C165,100 180,90 180,65 C180,45 170,30 150,30 Z",
        color: "#fca5a5" // pink-300
    },
    {
        id: "thyroid",
        label: "Thyroid",
        system: ["endocrine"],
        d: "M145,115 Q150,125 155,115 L155,110 Q150,115 145,110 Z",
        color: "#fdba74" // orange-300
    },
    {
        id: "lung_r",
        label: "Right Lung",
        system: ["cardio"],
        d: "M110,130 Q140,130 145,160 L145,210 Q120,220 100,210 Q90,160 110,130 Z",
        color: "#bfdbfe" // blue-200
    },
    {
        id: "lung_l",
        label: "Left Lung",
        system: ["cardio"],
        d: "M190,130 Q160,130 155,160 L155,210 Q180,220 200,210 Q210,160 190,130 Z",
        color: "#bfdbfe" // blue-200
    },
    {
        id: "heart",
        label: "Heart",
        system: ["cardio"],
        d: "M165,165 C185,150 200,170 185,190 L160,215 L140,195 C125,180 140,155 165,165 Z",
        color: "#ef4444" // red-500
    },
    {
        id: "liver",
        label: "Liver",
        system: ["gi"],
        d: "M145,220 Q100,215 100,250 Q100,280 150,270 L170,260 Q175,230 145,220 Z",
        color: "#b91c1c" // red-700 (brownish)
    },
    {
        id: "stomach",
        label: "Stomach",
        system: ["gi"],
        d: "M160,230 Q190,230 195,250 Q200,280 180,290 Q160,285 155,250 Z",
        color: "#fcd34d" // amber-300
    },
    {
        id: "pancreas",
        label: "Pancreas",
        system: ["gi", "endocrine"],
        d: "M155,270 L180,265 L190,275 L160,280 Z",
        color: "#fde047" // yellow-300
    },
    {
        id: "kidney_r",
        label: "Right Kidney",
        system: ["urinary"],
        d: "M125,260 Q115,260 115,280 Q115,300 125,300 Q135,300 135,280 Q135,260 125,260 Z",
        color: "#7f1d1d" // red-900 (kidney bean)
    },
    {
        id: "kidney_l",
        label: "Left Kidney",
        system: ["urinary"],
        d: "M175,260 Q185,260 185,280 Q185,300 175,300 Q165,300 165,280 Q165,260 175,260 Z",
        color: "#7f1d1d"
    },
    {
        id: "intestine_large",
        label: "Large Intestine",
        system: ["gi"],
        d: "M110,320 L110,280 L190,280 L190,360 L110,360 L110,320 M125,320 L175,320", // Simplified frame
        color: "#d6d3d1" // stone-300
    },
    {
        id: "intestine_small",
        label: "Small Intestine",
        system: ["gi"],
        d: "M130,300 Q150,290 170,300 Q180,320 170,340 Q150,350 130,340 Q120,320 130,300 Z",
        color: "#fca5a5" // pink-300
    },
    {
        id: "bladder",
        label: "Bladder",
        system: ["urinary"],
        d: "M150,370 Q135,370 140,390 L150,400 L160,390 Q165,370 150,370 Z",
        color: "#fbbf24" // amber-400
    }
];

export default function OrgansDiagram({ system, conditions, onToggle }: OrgansDiagramProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[260px] aspect-[3/5] mx-auto bg-card/30 rounded-xl border p-4 overflow-hidden">
                {/* Body Outline (Ghost) */}
                <svg viewBox="0 0 300 500" className="w-full h-full select-none">
                    <path
                        d="M150,20 Q190,20 190,60 L200,70 L230,80 L230,220 L210,350 L220,500 L80,500 L90,350 L70,220 L70,80 L100,70 L110,60 Q110,20 150,20 Z"
                        fill="#f1f5f9"
                        stroke="#e2e8f0"
                        strokeWidth="2"
                    />

                    {/* Organs */}
                    {organs.map(organ => {
                        // Determining opacity based on active system
                        // If system='all', show everything.
                        // If system matches organ's system list, show full opacity.
                        // Otherwise, low opacity (ghosted).
                        const isRelevant = system === "all" || organ.system.includes(system);

                        return (
                            <path
                                key={organ.id}
                                d={organ.d}
                                fill={organ.color}
                                opacity={isRelevant ? 1 : 0.1}
                                stroke={isRelevant ? "rgba(0,0,0,0.2)" : "transparent"}
                                strokeWidth="1"
                                className={cn(
                                    "transition-all duration-300",
                                    onToggle && isRelevant ? "cursor-pointer hover:opacity-80" : ""
                                )}
                                onClick={() => onToggle?.(organ.id)}
                            >
                                <title>{organ.label}</title>
                            </path>
                        );
                    })}
                </svg>

                <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border shadow-sm">
                        {system === "all" ? "Full Anatomy" : `${system.charAt(0).toUpperCase() + system.slice(1)} System`}
                    </span>
                </div>
            </div>
        </div>
    );
}
