import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface EarDiagramProps {
    selectedAreas: string[];
    onToggle: (area: string) => void;
}

// Detailed ear anatomy parts
const earParts = [
    // Outer Ear
    {
        id: "Pinna/Auricle",
        label: "Outer Ear (Pinna)",
        d: "M50,150 Q30,120 35,90 Q40,60 60,50 Q80,45 90,60 L95,80 Q100,100 95,120 Q90,140 80,155 L70,165 Q55,165 50,150 Z M60,70 Q70,65 75,75 M65,90 Q72,88 75,95 M60,110 Q68,108 72,115",
        color: "#fde68a" // amber-200 (skin tone)
    },
    {
        id: "Ear Canal",
        label: "External Auditory Canal",
        d: "M80,155 L110,140 Q120,138 125,140 L125,160 Q120,162 110,160 L80,165 Z",
        color: "#fbbf24" // amber-400
    },

    // Middle Ear
    {
        id: "Eardrum",
        label: "Tympanic Membrane (Eardrum)",
        d: "M125,140 Q130,135 135,140 L135,160 Q130,165 125,160 Z",
        color: "#fed7aa" // orange-200
    },
    {
        id: "Malleus",
        label: "Malleus (Hammer)",
        d: "M135,145 L145,140 L147,142 L137,147 Z M145,140 L148,135",
        color: "#f5f5f4" // stone-100 (bone)
    },
    {
        id: "Incus",
        label: "Incus (Anvil)",
        d: "M147,142 L155,145 L156,147 L148,144 Z M155,145 L158,142",
        color: "#f5f5f4"
    },
    {
        id: "Stapes",
        label: "Stapes (Stirrup)",
        d: "M156,147 L163,150 Q165,150 165,152 L163,154 L156,151 Z",
        color: "#f5f5f4"
    },
    {
        id: "Eustachian Tube",
        label: "Eustachian Tube",
        d: "M130,165 Q140,175 155,180 L157,178 Q142,173 132,163 Z",
        color: "#fca5a5" // red-300 (mucosa)
    },

    // Inner Ear
    {
        id: "Cochlea",
        label: "Cochlea",
        d: "M165,152 Q175,152 180,158 Q185,165 182,172 Q178,178 170,178 Q165,178 163,175 Q170,175 175,170 Q178,165 175,160 Q172,156 168,156 Q165,156 165,152 Z",
        color: "#c7d2fe" // indigo-200
    },
    {
        id: "Semicircular Canals",
        label: "Semicircular Canals (Balance)",
        d: "M168,145 Q175,140 180,145 Q182,150 180,155 Q175,158 170,155 M172,140 Q178,135 183,140 Q185,145 183,150 M175,135 Q180,128 186,132 Q188,137 185,142",
        color: "#c7d2fe"
    },
    {
        id: "Vestibular Nerve",
        label: "Vestibular Nerve",
        d: "M180,155 L195,150 L197,152 L182,157 Z",
        color: "#fef08a" // yellow-200
    },
    {
        id: "Cochlear Nerve",
        label: "Cochlear Nerve",
        d: "M175,172 L192,165 L194,167 L177,174 Z",
        color: "#fef08a"
    },
];

export default function EarDiagram({ selectedAreas, onToggle }: EarDiagramProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[4/3] mx-auto bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 rounded-2xl border border-indigo-200 shadow-sm p-4 overflow-hidden">
                {/* Instruction Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-semibold text-indigo-700 uppercase tracking-wide bg-white/80 px-2.5 py-1 rounded-md border border-indigo-200 shadow-sm z-10">
                    <Info className="w-3 h-3 text-indigo-600" />
                    <span>Ear Anatomy</span>
                </div>

                <svg viewBox="0 0 250 200" className="w-full h-full select-none drop-shadow-md" aria-label="Interactive ear anatomy diagram">
                    <defs>
                        {/* Tissue gradients */}
                        <linearGradient id="earSkinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#fde68a', stopOpacity: 1 }} />
                        </linearGradient>

                        <linearGradient id="earBoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fafaf9', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#e7e5e4', stopOpacity: 1 }} />
                        </linearGradient>

                        {/* Selected glow */}
                        <filter id="earSelectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feFlood floodColor="#ef4444" floodOpacity="0.7" />
                            <feComposite in2="blur" operator="in" result="glow" />
                            <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>

                        <filter id="earSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
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

                    {/* Cross-section background */}
                    <rect x="20" y="40" width="210" height="150" rx="5" fill="#fef9f3" opacity="0.4" />

                    {/* Ear anatomy parts */}
                    <g transform="translate(0, 0)">
                        {earParts.map((part) => {
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
                                            : "stroke-slate-700/30 stroke-[1] hover:stroke-indigo-500 hover:stroke-[2]"
                                    )}
                                    style={{
                                        fill: isSelected ? "#f87171" : part.color,
                                        filter: isSelected ? "url(#earSelectedGlow)" : "url(#earSoftShadow)",
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

                    {/* Labels for sections */}
                    <text x="60" y="25" fontSize="9" fill="#64748b" fontWeight="600">Outer</text>
                    <text x="125" y="25" fontSize="9" fill="#64748b" fontWeight="600">Middle</text>
                    <text x="175" y="25" fontSize="9" fill="#64748b" fontWeight="600">Inner</text>

                    {/* Division lines */}
                    <line x1="105" y1="30" x2="105" y2="190" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                    <line x1="160" y1="30" x2="160" y2="190" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                </svg>
            </div>

            {/* Selected Areas Display */}
            {selectedAreas.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 max-w-xs">
                    {selectedAreas.map(area => {
                        const part = earParts.find(p => p.id === area);
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
