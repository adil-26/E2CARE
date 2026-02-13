import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface NoseThroatDiagramProps {
    selectedAreas: string[];
    onToggle: (area: string) => void;
}

// Detailed nose and throat anatomy (sagittal/side view)
const noseThroatParts = [
    // Nasal structures
    {
        id: "Frontal Sinus",
        label: "Frontal Sinus",
        d: "M120,30 Q130,25 140,30 L140,45 Q130,50 120,45 Z",
        color: "#fef3c7" // amber-100 (air-filled)
    },
    {
        id: "Nasal Bone",
        label: "Nasal Bone",
        d: "M135,45 L140,70 L138,72 L133,47 Z",
        color: "#e7e5e4" // stone-200 (bone)
    },
    {
        id: "Nasal Septum",
        label: "Nasal Septum",
        d: "M138,72 L140,110 L138,110 L136,72 Z",
        color: "#fecaca" // red-200 (cartilage)
    },
    {
        id: "Superior Turbinate",
        label: "Superior Turbinate",
        d: "M140,75 Q155,75 160,82 Q158,88 150,88 Q142,85 140,80 Z",
        color: "#fca5a5" // red-300 (mucosa)
    },
    {
        id: "Middle Turbinate",
        label: "Middle Turbinate",
        d: "M140,88 Q158,88 165,95 Q163,102 152,102 Q142,98 140,92 Z",
        color: "#fca5a5"
    },
    {
        id: "Inferior Turbinate",
        label: "Inferior Turbinate",
        d: "M140,102 Q160,102 168,110 Q165,117 153,117 Q142,112 140,106 Z",
        color: "#fca5a5"
    },
    {
        id: "Maxillary Sinus",
        label: "Maxillary Sinus (Cheek)",
        d: "M165,95 Q180,95 185,105 Q185,120 175,125 Q165,122 165,110 Z",
        color: "#fef3c7"
    },
    {
        id: "Sphenoid Sinus",
        label: "Sphenoid Sinus",
        d: "M115,65 Q105,65 100,72 Q100,82 108,88 Q118,88 120,78 Z",
        color: "#fef3c7"
    },
    {
        id: "Ethmoid Sinus",
        label: "Ethmoid Sinus",
        d: "M120,55 Q112,55 108,62 Q108,68 115,72 Q122,70 122,62 Z",
        color: "#fef3c7"
    },
    {
        id: "Olfactory Region",
        label: "Olfactory Region (Smell)",
        d: "M135,72 L138,72 L138,78 L135,78 Z M136,73 L137,70",
        color: "#fde047" // yellow-300
    },

    // Throat structures
    {
        id: "Nasopharynx",
        label: "Nasopharynx",
        d: "M138,110 L120,110 L120,130 L138,130 Z",
        color: "#fed7aa" // orange-200
    },
    {
        id: "Adenoids",
        label: "Adenoids",
        d: "M125,112 Q130,110 132,115 Q130,118 125,118 Z",
        color: "#f87171" // red-400
    },
    {
        id: "Soft Palate",
        label: "Soft Palate",
        d: "M138,125 Q148,125 155,128 Q152,132 145,132 Q140,130 138,128 Z",
        color: "#fecdd3" // rose-200
    },
    {
        id: "Uvula",
        label: "Uvula",
        d: "M148,132 Q150,135 148,140 Q146,140 146,135 Z",
        color: "#fda4af" // rose-300
    },
    {
        id: "Oropharynx",
        label: "Oropharynx",
        d: "M138,130 L155,130 L155,160 L138,160 Z",
        color: "#fed7aa"
    },
    {
        id: "Palatine Tonsils",
        label: "Palatine Tonsils",
        d: "M140,135 Q145,133 148,138 Q145,142 140,142 Z M150,135 Q153,133 155,138 Q153,142 150,142",
        color: "#f87171"
    },
    {
        id: "Tongue",
        label: "Tongue",
        d: "M155,128 Q175,130 180,140 Q178,152 170,155 Q160,153 155,145 Z",
        color: "#fb7185" // rose-400
    },
    {
        id: "Epiglottis",
        label: "Epiglottis",
        d: "M142,158 Q148,156 152,160 L150,165 Q145,163 142,162 Z",
        color: "#fde68a" // amber-200
    },
    {
        id: "Laryngopharynx",
        label: "Laryngopharynx",
        d: "M138,160 L152,160 L150,180 L138,180 Z",
        color: "#fed7aa"
    },
    {
        id: "Larynx",
        label: "Larynx (Voice Box)",
        d: "M138,175 L148,175 L148,195 L138,195 Z",
        color: "#c7d2fe" // indigo-200
    },
    {
        id: "Vocal Cords",
        label: "Vocal Cords",
        d: "M140,182 L146,182 M140,186 L146,186",
        color: "#818cf8" // indigo-400
    },
    {
        id: "Esophagus",
        label: "Esophagus (to stomach)",
        d: "M135,195 L142,195 L142,230 L135,230 Z",
        color: "#fecaca" // red-200
    },
    {
        id: "Trachea",
        label: "Trachea (windpipe)",
        d: "M145,195 L152,195 L152,230 L145,230 Z M146,200 L151,200 M146,208 L151,208 M146,216 L151,216 M146,224 L151,224",
        color: "#bfdbfe" // blue-200
    },
];

export default function NoseThroatDiagram({ selectedAreas, onToggle }: NoseThroatDiagramProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[300px] aspect-[3/4] mx-auto bg-gradient-to-br from-orange-50 via-rose-50/30 to-amber-50 rounded-2xl border border-orange-200 shadow-sm p-4 overflow-hidden">
                {/* Instruction Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-semibold text-orange-700 uppercase tracking-wide bg-white/80 px-2.5 py-1 rounded-md border border-orange-200 shadow-sm z-10">
                    <Info className="w-3 h-3 text-orange-600" />
                    <span>Nose & Throat</span>
                </div>

                <svg viewBox="0 0 300 250" className="w-full h-full select-none drop-shadow-md" aria-label="Interactive nose and throat anatomy diagram">
                    <defs>
                        {/* Mucosa gradient */}
                        <linearGradient id="mucosaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fed7aa', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#fdba74', stopOpacity: 1 }} />
                        </linearGradient>

                        {/* Sinus gradient */}
                        <linearGradient id="sinusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fefce8', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
                        </linearGradient>

                        {/* Selected glow */}
                        <filter id="ntSelectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feFlood floodColor="#ef4444" floodOpacity="0.7" />
                            <feComposite in2="blur" operator="in" result="glow" />
                            <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>

                        <filter id="ntSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                            <feOffset dx="0.5" dy="0.5" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.25" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Head outline (ghost) */}
                    <path
                        d="M90,20 Q150,15 180,35 Q195,55 195,85 L190,120 Q185,145 180,160 L170,185 L165,210 L160,235 L130,240 L125,200 L115,180 Q95,150 85,120 L80,85 Q80,50 90,20 Z"
                        fill="#fef3c7"
                        opacity="0.15"
                        stroke="#e7e5e4"
                        strokeWidth="1"
                        strokeDasharray="3,2"
                    />

                    {/* Nose and throat anatomy */}
                    <g transform="translate(0, 0)">
                        {noseThroatParts.map((part) => {
                            const isSelected = selectedAreas.includes(part.id);
                            return (
                                <path
                                    key={part.id}
                                    d={part.d}
                                    onClick={() => onToggle(part.id)}
                                    className={cn(
                                        "cursor-pointer transition-all duration-300 ease-out",
                                        isSelected
                                            ? "stroke-red-600 stroke-[2] animate-pulse"
                                            : "stroke-slate-700/30 stroke-[0.8] hover:stroke-orange-500 hover:stroke-[1.8]"
                                    )}
                                    style={{
                                        fill: isSelected ? "#f87171" : part.color,
                                        filter: isSelected ? "url(#ntSelectedGlow)" : "url(#ntSoftShadow)",
                                        transformOrigin: "center",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.transform = "scale(1.08)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.transform = "scale(1)";
                                        }
                                    }}
                                    aria-label={part.label}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <title>{part.label}</title>
                                </path>
                            );
                        })}
                    </g>

                    {/* Airflow arrow */}
                    <defs>
                        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
                        </marker>
                    </defs>
                    <path d="M185,95 Q190,95 195,100" stroke="#3b82f6" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)" opacity="0.5" />
                    <text x="200" y="102" fontSize="8" fill="#3b82f6" fontStyle="italic">air in</text>

                    {/* Section labels */}
                    <text x="200" y="75" fontSize="9" fill="#64748b" fontWeight="600">Sinuses</text>
                    <text x="165" y="125" fontSize="9" fill="#64748b" fontWeight="600">Pharynx</text>
                    <text x="165" y="190" fontSize="9" fill="#64748b" fontWeight="600">Larynx</text>
                </svg>
            </div>

            {/* Selected Areas Display */}
            {selectedAreas.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 max-w-sm">
                    {selectedAreas.map(area => {
                        const part = noseThroatParts.find(p => p.id === area);
                        return (
                            <span
                                key={area}
                                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-100 to-red-50 text-red-700 text-[11px] font-semibold border-2 border-red-200 shadow-sm animate-in fade-in zoom-in duration-300"
                            >
                                {part?.label || area}
                                <button
                                    onClick={() => onToggle(area)}
                                    className="hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-200/50 transition-colors text-sm"
                                    aria-label={`Remove ${part?.label || area}`}
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
