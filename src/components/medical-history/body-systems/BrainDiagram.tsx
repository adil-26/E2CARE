import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface BrainDiagramProps {
    selectedRegions?: string[];
    onToggle?: (region: string) => void;
}

// Brain regions with SVG paths
const brainRegions = [
    {
        id: "frontal_lobe",
        label: "Frontal Lobe",
        description: "Reasoning, planning, speech, movement, emotions",
        d: "M50,120 Q50,80 80,60 Q110,40 150,40 Q170,40 180,50 L180,110 Q160,115 140,110 Q120,105 100,115 Q80,125 50,120 Z",
        color: "#fca5a5", // red-300
    },
    {
        id: "parietal_lobe",
        label: "Parietal Lobe",
        description: "Touch, pressure, temperature, pain",
        d: "M150,40 Q190,40 220,60 Q230,80 230,100 L180,110 Q170,40 150,40 Z",
        color: "#fbbf24", // amber-400
    },
    {
        id: "occipital_lobe",
        label: "Occipital Lobe",
        description: "Vision processing",
        d: "M230,100 Q230,130 210,150 L180,140 L180,110 L230,100 Z",
        color: "#c084fc", // purple-400
    },
    {
        id: "temporal_lobe",
        label: "Temporal Lobe",
        description: "Hearing, memory",
        d: "M100,115 Q120,105 140,110 L180,110 L180,140 Q160,160 130,160 Q100,160 80,140 Q90,130 100,115 Z",
        color: "#86efac", // green-300
    },
    {
        id: "cerebellum",
        label: "Cerebellum",
        description: "Balance, coordination, fine muscle control",
        d: "M180,140 L210,150 Q200,180 160,180 Q150,170 150,160 Q170,150 180,140 Z",
        color: "#93c5fd", // blue-300
    },
    {
        id: "brain_stem",
        label: "Brain Stem",
        description: "Breathing, heart rate, temperature",
        d: "M130,160 Q150,160 150,180 L150,220 Q130,220 130,210 Z",
        color: "#cbd5e1", // slate-300
    },
];

export default function BrainDiagram({ selectedRegions = [], onToggle }: BrainDiagramProps) {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    const handleToggle = (id: string) => {
        if (onToggle) {
            onToggle(id);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[320px] aspect-square mx-auto bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 shadow-md p-4 overflow-hidden">
                {/* Header Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wide bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm border border-slate-200">
                    <Info className="w-3 h-3 text-slate-500" />
                    <span>Brain Anatomy</span>
                </div>

                <svg viewBox="0 0 300 300" className="w-full h-full select-none">
                    <defs>
                        <filter id="brainGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="brainShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    <g transform="translate(10, 10)">
                        {brainRegions.map((region) => {
                            const isSelected = selectedRegions.includes(region.id);
                            const isHovered = hoveredRegion === region.id;

                            return (
                                <g
                                    key={region.id}
                                    onClick={() => handleToggle(region.id)}
                                    onMouseEnter={() => setHoveredRegion(region.id)}
                                    onMouseLeave={() => setHoveredRegion(null)}
                                    className="cursor-pointer transition-all duration-300"
                                >
                                    <path
                                        d={region.d}
                                        fill={isSelected ? region.color : isHovered ? region.color : "#f1f5f9"}
                                        fillOpacity={isSelected || isHovered ? 0.9 : 0.8}
                                        stroke={isSelected || isHovered ? "#475569" : "#94a3b8"}
                                        strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                                        filter={isSelected || isHovered ? "url(#brainGlow)" : "url(#brainShadow)"}
                                        className="transition-all duration-300 ease-out"
                                        style={{
                                            transform: isHovered ? "scale(1.02)" : "scale(1)",
                                            transformOrigin: "150px 130px",
                                        }}
                                    />

                                    {/* Label on Hover */}
                                    {(isHovered || isSelected) && (
                                        <text
                                            x="150"
                                            y="260"
                                            textAnchor="middle"
                                            className="text-xs font-semibold fill-slate-700 pointer-events-none"
                                            style={{ textShadow: "0px 0px 4px white" }}
                                        >
                                            {/* This text is purely for accessibility/debugging visually in SVG, 
                           real tooltip is below */}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </g>
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredRegion && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-lg border border-slate-200 shadow-lg text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <p className="text-sm font-bold text-slate-800">
                            {brainRegions.find(r => r.id === hoveredRegion)?.label}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-tight">
                            {brainRegions.find(r => r.id === hoveredRegion)?.description}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-sm">
                {brainRegions.map((region) => (
                    <div
                        key={region.id}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] transition-colors cursor-pointer",
                            selectedRegions.includes(region.id)
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                        onClick={() => handleToggle(region.id)}
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: region.color }}
                        />
                        {region.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
