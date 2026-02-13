import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface SkinBodyDiagramProps {
    selectedRegions?: string[];
    onToggle?: (region: string) => void;
}

// Simplified body regions for skin conditions
const bodyRegions = [
    {
        id: "head_face",
        label: "Head & Face",
        d: "M100,50 Q100,30 115,30 Q130,30 130,50 Q130,65 115,65 Q100,65 100,50 Z",
    },
    {
        id: "chest",
        label: "Chest / Torso",
        d: "M90,70 L140,70 L135,120 L95,120 Z",
    },
    {
        id: "abdomen",
        label: "Abdomen",
        d: "M95,125 L135,125 L130,160 L100,160 Z",
    },
    {
        id: "left_arm",
        label: "Left Arm",
        d: "M145,75 Q160,80 160,110 L155,140 L145,135 L145,75 Z",
    },
    {
        id: "right_arm",
        label: "Right Arm",
        d: "M85,75 Q70,80 70,110 L75,140 L85,135 L85,75 Z",
    },
    {
        id: "left_hand",
        label: "Left Hand",
        d: "M160,145 Q165,155 155,160 L150,150 Z",
    },
    {
        id: "right_hand",
        label: "Right Hand",
        d: "M70,145 Q65,155 75,160 L80,150 Z",
    },
    {
        id: "left_leg",
        label: "Left Leg",
        d: "M130,165 L140,165 L135,240 L125,240 Z",
    },
    {
        id: "right_leg",
        label: "Right Leg",
        d: "M100,165 L90,165 L95,240 L105,240 Z",
    },
    {
        id: "feet",
        label: "Feet",
        d: "M90,245 L105,245 L110,255 L85,255 Z M125,245 L140,245 L145,255 L120,255 Z",
    },
];

export default function SkinBodyDiagram({ selectedRegions = [], onToggle }: SkinBodyDiagramProps) {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    const handleToggle = (id: string) => {
        if (onToggle) {
            onToggle(id);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[1/2] mx-auto bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden">
                {/* Header Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    <Info className="w-3 h-3" />
                    <span>Select Affected Areas</span>
                </div>

                <svg viewBox="0 0 230 280" className="w-full h-full select-none">
                    <defs>
                        {/* Simple glow for selection */}
                        <filter id="skinGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Simple Body Outline Style */}
                    <g transform="translate(0, 0)">
                        {bodyRegions.map((region) => {
                            const isSelected = selectedRegions.includes(region.id);
                            const isHovered = hoveredRegion === region.id;

                            return (
                                <path
                                    key={region.id}
                                    d={region.d}
                                    onClick={() => handleToggle(region.id)}
                                    onMouseEnter={() => setHoveredRegion(region.id)}
                                    onMouseLeave={() => setHoveredRegion(null)}
                                    fill={isSelected ? "#fca5a5" : isHovered ? "#fee2e2" : "#f1f5f9"} // Red-300 selected, Red-100 hover
                                    stroke={isSelected ? "#b91c1c" : "#94a3b8"}
                                    strokeWidth={isSelected ? 1.5 : 1}
                                    className="cursor-pointer transition-colors duration-200"
                                    filter={isSelected ? "url(#skinGlow)" : undefined}
                                />
                            );
                        })}
                    </g>
                </svg>

                {/* Hover Tooltip */}
                {hoveredRegion && (
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="bg-slate-800/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                            {bodyRegions.find(r => r.id === hoveredRegion)?.label}
                        </span>
                    </div>
                )}
            </div>

            {/* Legend / Selected Tags */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
                {selectedRegions.map(regionId => {
                    const region = bodyRegions.find(r => r.id === regionId);
                    return region ? (
                        <div key={regionId} className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                            <span>{region.label}</span>
                            <button onClick={() => handleToggle(regionId)} className="hover:text-red-900 ml-1">×</button>
                        </div>
                    ) : null;
                })}
            </div>
        </div>
    );
}
