import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface EyeDiagramProps {
    selectedAreas: string[];
    onToggle: (area: string) => void;
    conditions?: string[]; // Optional: to highlight based on conditions
}

// Detailed eye anatomy parts (cross-sectional view)
const eyeParts = [
    // Anterior segment
    {
        id: "Cornea",
        label: "Cornea (Clear Front Surface)",
        d: "M180,150 Q200,135 220,150 Q200,165 180,150 Z",
        color: "rgba(173, 216, 230, 0.3)", // light blue, transparent
        stroke: "#60a5fa"
    },
    {
        id: "Anterior Chamber",
        label: "Anterior Chamber (Aqueous Humor)",
        d: "M185,150 Q200,138 215,150 L200,165 Q185,165 185,150 Z",
        color: "rgba(191, 219, 254, 0.4)", // blue-200, transparent
        stroke: "#93c5fd"
    },
    {
        id: "Iris",
        label: "Iris (Colored Part)",
        d: "M190,145 Q200,140 210,145 L210,155 Q200,160 190,155 Z",
        color: "#8b5cf6", // violet-500 (varies by person)
        stroke: "#7c3aed"
    },
    {
        id: "Pupil",
        label: "Pupil (Light Opening)",
        d: "M197,147 Q200,145 203,147 L203,153 Q200,155 197,153 Z",
        color: "#000000",
        stroke: "#000000"
    },
    {
        id: "Lens",
        label: "Lens (Focuses Light)",
        d: "M210,145 Q218,150 210,155 Q205,150 210,145 Z",
        color: "#fef3c7", // amber-100, slightly opaque
        stroke: "#fbbf24"
    },
    {
        id: "Ciliary Body",
        label: "Ciliary Body & Muscles",
        d: "M188,143 L190,145 L190,155 L188,157 M212,143 L210,145 L210,155 L212,157",
        color: "#fca5a5", // red-300
        stroke: "#f87171"
    },
    {
        id: "Zonules",
        label: "Zonular Fibers (Suspensory Ligaments)",
        d: "M190,144 L210,144 M190,156 L210,156",
        color: "#e5e7eb",
        stroke: "#9ca3af"
    },

    // Posterior segment
    {
        id: "Vitreous Humor",
        label: "Vitreous Humor (Gel)",
        d: "M218,150 Q240,150 260,150 Q260,140 240,130 Q220,125 218,145 Q260,160 240,170 Q220,175 218,155 Z",
        color: "rgba(224, 242, 254, 0.3)", // sky-100, very transparent
        stroke: "#bae6fd"
    },
    {
        id: "Retina",
        label: "Retina (Light-Sensing Layer)",
        d: "M220,128 Q242,128 262,140 L262,160 Q242,172 220,172 Z",
        color: "#fed7aa", // orange-200
        stroke: "#fb923c"
    },
    {
        id: "Macula",
        label: "Macula (Central Vision)",
        d: "M238,145 Q242,143 246,145 L246,155 Q242,157 238,155 Z",
        color: "#fdba74", // orange-300
        stroke: "#f97316"
    },
    {
        id: "Fovea",
        label: "Fovea (Sharpest Vision Spot)",
        d: "M241,148 Q242,147 243,148 L243,152 Q242,153 241,152 Z",
        color: "#ea580c", // orange-600
        stroke: "#c2410c"
    },
    {
        id: "Optic Disc",
        label: "Optic Disc (Blind Spot)",
        d: "M265,145 Q268,143 271,145 L271,155 Q268,157 265,155 Z",
        color: "#fef3c7", // amber-100
        stroke: "#fbbf24"
    },
    {
        id: "Optic Nerve",
        label: "Optic Nerve (to Brain)",
        d: "M268,145 L285,140 L288,142 L271,147 M268,155 L285,160 L288,158 L271,153",
        color: "#fde68a", // amber-200
        stroke: "#f59e0b"
    },

    // Outer layers
    {
        id: "Sclera",
        label: "Sclera (White of Eye)",
        d: "M175,150 Q175,125 200,115 Q230,110 255,120 Q275,130 275,150 Q275,170 255,180 Q230,190 200,185 Q175,175 175,150 Z M180,150 Q180,130 200,120 Q225,115 250,125 Q270,135 270,150 Q270,165 250,175 Q225,185 200,180 Q180,170 180,150 Z",
        color: "#fefce8", // yellow-50 (white)
        stroke: "#f5f5f4"
    },
    {
        id: "Choroid",
        label: "Choroid (Blood Vessel Layer)",
        d: "M218,126 Q240,126 264,138 M218,174 Q240,174 264,162",
        color: "#7f1d1d", // red-900
        stroke: "#991b1b"
    },

    // Muscles (simplified)
    {
        id: "Extraocular Muscles",
        label: "Eye Muscles (Movement)",
        d: "M175,140 L165,135 M175,160 L165,165 M275,140 L285,135 M275,160 L285,165",
        color: "#fca5a5", // red-300
        stroke: "#f87171"
    },
];

export default function EyeDiagram({ selectedAreas, onToggle, conditions = [] }: EyeDiagramProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[320px] aspect-[4/3] mx-auto bg-gradient-to-br from-sky-50 via-blue-50/30 to-indigo-50 rounded-2xl border-2 border-sky-200/80 shadow-lg p-4 overflow-hidden">
                {/* Instruction Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-semibold text-sky-700 uppercase tracking-wide bg-white/90 px-3 py-1.5 rounded-lg backdrop-blur-md border border-sky-300/50 shadow-sm z-10">
                    <Info className="w-3 h-3 text-sky-600" />
                    <span className="bg-gradient-to-r from-sky-600 to-blue-500 bg-clip-text text-transparent">Eye Cross-Section</span>
                </div>

                <svg viewBox="0 0 320 220" className="w-full h-full select-none drop-shadow-md" aria-label="Interactive eye anatomy diagram">
                    <defs>
                        {/* Light path gradient */}
                        <linearGradient id="lightPath" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 0.6 }} />
                            <stop offset="100%" style={{ stopColor: '#fed7aa', stopOpacity: 0.3 }} />
                        </linearGradient>

                        {/* Selected glow */}
                        <filter id="eyeSelectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feFlood floodColor="#ef4444" floodOpacity="0.8" />
                            <feComposite in2="blur" operator="in" result="glow" />
                            <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>

                        <filter id="eyeSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                            <feOffset dx="0.5" dy="0.5" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.2" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Arrowhead for light path */}
                        <marker id="lightArrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                            <polygon points="0 0, 5 2.5, 0 5" fill="#f59e0b" opacity="0.7" />
                        </marker>
                    </defs>

                    {/* Light path visualization */}
                    <path
                        d="M160,150 L180,150 L200,150 L242,150"
                        stroke="url(#lightPath)"
                        strokeWidth="3"
                        fill="none"
                        markerEnd="url(#lightArrow)"
                        opacity="0.6"
                    />
                    <text x="155" y="145" fontSize="8" fill="#d97706" fontStyle="italic">light →</text>

                    {/* Eye anatomy parts */}
                    <g transform="translate(0, 20)">
                        {eyeParts.map((part) => {
                            const isSelected = selectedAreas.includes(part.id);
                            return (
                                <path
                                    key={part.id}
                                    d={part.d}
                                    onClick={() => onToggle(part.id)}
                                    className={cn(
                                        "cursor-pointer transition-all duration-300 ease-out",
                                        isSelected && "animate-pulse"
                                    )}
                                    style={{
                                        fill: isSelected ? "#f87171" : part.color,
                                        stroke: isSelected ? "#dc2626" : part.stroke,
                                        strokeWidth: isSelected ? "2" : "1",
                                        filter: isSelected ? "url(#eyeSelectedGlow)" : "url(#eyeSoftShadow)",
                                        transformOrigin: "center",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.transform = "scale(1.06)";
                                            e.currentTarget.style.strokeWidth = "1.5";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.strokeWidth = "1";
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

                    {/* Anatomical labels */}
                    <text x="160" y="205" fontSize="9" fill="#64748b" fontWeight="600">Anterior</text>
                    <text x="250" y="205" fontSize="9" fill="#64748b" fontWeight="600">Posterior</text>
                </svg>
            </div>

            {/* Selected Areas Display */}
            {selectedAreas.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 max-w-md">
                    {selectedAreas.map(area => {
                        const part = eyeParts.find(p => p.id === area);
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
