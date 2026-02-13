import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface SkeletonDiagramProps {
    painAreas: string[];
    onToggle: (area: string) => void;
}

// Enhanced map of body parts with more anatomically accurate SVG paths
const bodyParts = [
    // ========== HEAD & NECK ==========
    {
        id: "Skull",
        label: "Skull / Cranium",
        // More realistic skull with cranium, eye sockets, nasal cavity
        d: "M150,15 C130,15 115,25 115,50 C115,58 117,65 120,70 L118,75 C118,75 115,78 115,82 C115,88 120,95 125,98 L128,102 L132,100 C135,102 140,103 145,103 L145,108 L155,108 L155,103 C160,103 165,102 168,100 L172,102 L175,98 C180,95 185,88 185,82 C185,78 182,75 182,75 L180,70 C183,65 185,58 185,50 C185,25 170,15 150,15 Z M130,55 C130,55 125,58 125,63 C125,68 130,71 130,71 M170,55 C170,55 175,58 175,63 C175,68 170,71 170,71 M145,82 L155,82 L153,90 L147,90 Z"
    },
    {
        id: "Jaw",
        label: "Mandible / Jaw",
        d: "M128,102 L132,115 L142,118 L150,119 L158,118 L168,115 L172,102"
    },
    {
        id: "Neck",
        label: "Cervical Spine (C1-C7)",
        d: "M147,119 L153,119 L153,135 L147,135 Z M148,122 L152,122 M148,126 L152,126 M148,130 L152,130"
    },

    // ========== SHOULDER GIRDLE ==========
    {
        id: "Clavicle (L)",
        label: "Left Clavicle",
        // S-shaped clavicle
        d: "M153,135 Q165,137 180,142 Q192,145 198,148 L198,153 Q192,150 180,147 Q165,142 153,140 Z"
    },
    {
        id: "Clavicle (R)",
        label: "Right Clavicle",
        d: "M147,135 Q135,137 120,142 Q108,145 102,148 L102,153 Q108,150 120,147 Q135,142 147,140 Z"
    },
    {
        id: "Shoulder (L)",
        label: "Left Scapula",
        d: "M198,148 L205,155 L205,175 L198,185 L193,180 L193,160 Z"
    },
    {
        id: "Shoulder (R)",
        label: "Right Scapula",
        d: "M102,148 L95,155 L95,175 L102,185 L107,180 L107,160 Z"
    },

    // ========== THORAX ==========
    {
        id: "Sternum",
        label: "Sternum",
        d: "M147,140 L153,140 L152,165 L151,180 L149,180 L148,165 Z M148,182 Q150,185 152,182 L151,195 L149,195 Z"
    },
    // Individual ribs for better anatomy
    {
        id: "Ribs (L)",
        label: "Left Ribs (1-12)",
        d: "M153,145 Q175,148 185,155 Q190,165 188,175 Q185,185 178,190 L175,188 Q182,183 184,173 Q186,163 181,155 Q172,150 153,148 Z M153,152 Q172,155 180,162 Q185,172 183,182 Q180,192 172,197 L169,195 Q177,190 179,180 Q181,170 176,162 Q168,157 153,155 Z M153,162 Q170,165 177,172 Q182,182 180,192 Q177,202 169,207 L166,205 Q174,200 176,190 Q178,180 173,172 Q165,167 153,165 Z M153,172 Q167,175 174,182 Q179,192 177,202 Q174,212 166,217 L163,215 Q171,210 173,200 Q175,190 170,182 Q162,177 153,175 Z"
    },
    {
        id: "Ribs (R)",
        label: "Right Ribs (1-12)",
        d: "M147,145 Q125,148 115,155 Q110,165 112,175 Q115,185 122,190 L125,188 Q118,183 116,173 Q114,163 119,155 Q128,150 147,148 Z M147,152 Q128,155 120,162 Q115,172 117,182 Q120,192 128,197 L131,195 Q123,190 121,180 Q119,170 124,162 Q132,157 147,155 Z M147,162 Q130,165 123,172 Q118,182 120,192 Q123,202 131,207 L134,205 Q126,200 124,190 Q122,180 127,172 Q135,167 147,165 Z M147,172 Q133,175 126,182 Q121,192 123,202 Q126,212 134,217 L137,215 Q129,210 127,200 Q125,190 130,182 Q138,177 147,175 Z"
    },

    // ========== SPINE ==========
    {
        id: "Spine (Thoracic)",
        label: "Thoracic Spine (T1-T12)",
        d: "M148,180 L152,180 L152,230 L148,230 Z M148.5,183 L151.5,183 M148.5,188 L151.5,188 M148.5,193 L151.5,193 M148.5,198 L151.5,198 M148.5,203 L151.5,203 M148.5,208 L151.5,208 M148.5,213 L151.5,213 M148.5,218 L151.5,218 M148.5,223 L151.5,223 M148.5,228 L151.5,228"
    },
    {
        id: "Spine (Lumbar)",
        label: "Lumbar Spine (L1-L5)",
        d: "M147,230 L153,230 L153,260 L147,260 Z M147.5,235 L152.5,235 M147.5,242 L152.5,242 M147.5,249 L152.5,249 M147.5,256 L152.5,256"
    },
    {
        id: "Sacrum",
        label: "Sacrum / Coccyx",
        d: "M147,260 L153,260 L152,275 L150,282 L148,275 Z"
    },

    // ========== PELVIS ==========
    {
        id: "Pelvis",
        label: "Pelvis / Ilium",
        // More anatomically shaped pelvis
        d: "M125,255 Q150,265 175,255 L185,265 Q185,278 180,285 L175,295 L165,298 L165,285 Q162,280 155,278 L153,280 L153,285 L147,285 L147,280 L145,278 Q138,280 135,285 L135,298 L125,295 L120,285 Q115,278 115,265 Z"
    },
    {
        id: "Hip Joint (L)",
        label: "Left Hip Socket",
        d: "M175,280 C175,280 172,285 168,288 C164,291 165,295 168,295 C171,295 176,292 178,288 C180,284 178,280 175,280 Z"
    },
    {
        id: "Hip Joint (R)",
        label: "Right Hip Socket",
        d: "M125,280 C125,280 128,285 132,288 C136,291 135,295 132,295 C129,295 124,292 122,288 C120,284 122,280 125,280 Z"
    },

    // ========== UPPER LIMBS ==========
    {
        id: "Humerus (L)",
        label: "Left Humerus",
        d: "M198,155 L205,158 L198,235 L190,235 Z M202,160 L200,165 M201,175 L199,180"
    },
    {
        id: "Humerus (R)",
        label: "Right Humerus",
        d: "M102,155 L95,158 L102,235 L110,235 Z M98,160 L100,165 M99,175 L101,180"
    },
    {
        id: "Elbow (L)",
        label: "Left Elbow / Olecranon",
        d: "M190,235 L198,235 L197,245 L191,248 L185,245 L186,240 Z"
    },
    {
        id: "Elbow (R)",
        label: "Right Elbow / Olecranon",
        d: "M110,235 L102,235 L103,245 L109,248 L115,245 L114,240 Z"
    },
    {
        id: "Radius/Ulna (L)",
        label: "Left Forearm (Radius & Ulna)",
        d: "M191,248 L197,245 L188,320 L180,320 Z M194,250 L182,322 M189,260 L187,265"
    },
    {
        id: "Radius/Ulna (R)",
        label: "Right Forearm (Radius & Ulna)",
        d: "M109,248 L103,245 L112,320 L120,320 Z M106,250 L118,322 M111,260 L113,265"
    },
    {
        id: "Wrist (L)",
        label: "Left Wrist / Carpals",
        d: "M180,320 L188,320 L186,330 L182,332 L178,330 Z M181,323 L183,323 M179,326 L185,326"
    },
    {
        id: "Wrist (R)",
        label: "Right Wrist / Carpals",
        d: "M120,320 L112,320 L114,330 L118,332 L122,330 Z M119,323 L117,323 M121,326 L115,326"
    },
    {
        id: "Hand (L)",
        label: "Left Hand / Metacarpals",
        d: "M178,330 L186,330 L184,345 L182,355 L176,362 L172,358 L174,348 Z M181,335 L180,345 M179,335 L178,343 M177,335 L176,342 M175,335 L174,340"
    },
    {
        id: "Hand (R)",
        label: "Right Hand / Metacarpals",
        d: "M122,330 L114,330 L116,345 L118,355 L124,362 L128,358 L126,348 Z M119,335 L120,345 M121,335 L122,343 M123,335 L124,342 M125,335 L126,340"
    },

    // ========== LOWER LIMBS ==========
    {
        id: "Femur (L)",
        label: "Left Femur",
        d: "M168,295 L178,298 L172,395 L162,395 Z M174,305 L170,315 M173,325 L169,335"
    },
    {
        id: "Femur (R)",
        label: "Right Femur",
        d: "M132,295 L122,298 L128,395 L138,395 Z M126,305 L130,315 M127,325 L131,335"
    },
    {
        id: "Knee (L)",
        label: "Left Patella / Knee",
        d: "M162,395 L172,395 L170,405 L167,410 L163,410 L160,405 Z M165,398 Q167,402 165,406"
    },
    {
        id: "Knee (R)",
        label: "Right Patella / Knee",
        d: "M138,395 L128,395 L130,405 L133,410 L137,410 L140,405 Z M135,398 Q133,402 135,406"
    },
    {
        id: "Tibia/Fibula (L)",
        label: "Left Shin (Tibia & Fibula)",
        d: "M163,410 L170,410 L166,500 L158,500 Z M168,415 L160,502 M164,425 L162,435"
    },
    {
        id: "Tibia/Fibula (R)",
        label: "Right Shin (Tibia & Fibula)",
        d: "M137,410 L130,410 L134,500 L142,500 Z M132,415 L140,502 M136,425 L138,435"
    },
    {
        id: "Ankle (L)",
        label: "Left Ankle / Tarsals",
        d: "M158,500 L166,500 L164,510 L161,513 L157,510 Z M159,503 L163,503 M158,507 L164,507"
    },
    {
        id: "Ankle (R)",
        label: "Right Ankle / Tarsals",
        d: "M142,500 L134,500 L136,510 L139,513 L143,510 Z M141,503 L137,503 M142,507 L136,507"
    },
    {
        id: "Foot (L)",
        label: "Left Foot / Metatarsals",
        d: "M157,510 L164,510 L168,525 L166,535 L158,538 L152,534 L154,525 Z M161,515 L162,525 M159,515 L160,523 M157,515 L158,521 M155,515 L156,518"
    },
    {
        id: "Foot (R)",
        label: "Right Foot / Metatarsals",
        d: "M143,510 L136,510 L132,525 L134,535 L142,538 L148,534 L146,525 Z M139,515 L138,525 M141,515 L140,523 M143,515 L142,521 M145,515 L144,518"
    },
];


export default function SkeletonDiagram({ painAreas, onToggle }: SkeletonDiagramProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[320px] aspect-[3/5] mx-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 rounded-2xl border-2 border-slate-200/80 shadow-lg p-5 overflow-hidden">
                {/* Instruction Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 text-[11px] font-semibold text-slate-700 uppercase tracking-wide bg-white/90 px-3 py-2 rounded-lg backdrop-blur-md border border-slate-300/50 shadow-sm z-10">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Click Bones</span>
                </div>

                <svg viewBox="0 0 300 560" className="w-full h-full select-none drop-shadow-md" aria-label="Interactive skeleton diagram">
                    <defs>
                        {/* Bone gradient for realistic appearance */}
                        <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#f8f4ed', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#f0e9dc', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#e8dcc8', stopOpacity: 1 }} />
                        </linearGradient>

                        {/* Selected bone gradient (red) */}
                        <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#fca5a5', stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: '#f87171', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                        </linearGradient>

                        {/* Glow effect for selected bones */}
                        <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feFlood floodColor="#ef4444" floodOpacity="0.6" />
                            <feComposite in2="blur" operator="in" result="glow" />
                            <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>

                        {/* Soft shadow for depth */}
                        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                            <feOffset dx="1" dy="1" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3" />
                            </feComponentTransfer>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>

                        {/* Hover glow */}
                        <filter id="hoverGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feFlood floodColor="#3b82f6" floodOpacity="0.4" />
                            <feComposite in2="blur" operator="in" result="glow" />
                            <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                    </defs>

                    {/* Skeleton Body */}
                    <g transform="translate(0, 10)">
                        {bodyParts.map((part) => {
                            const isSelected = painAreas.includes(part.id);
                            return (
                                <path
                                    key={part.id}
                                    d={part.d}
                                    onClick={() => onToggle(part.id)}
                                    className={cn(
                                        "cursor-pointer transition-all duration-300 ease-out",
                                        isSelected
                                            ? "stroke-red-600 stroke-[2] animate-pulse"
                                            : "stroke-amber-900/40 stroke-[1.5] hover:stroke-blue-500 hover:stroke-[2.5]"
                                    )}
                                    style={{
                                        fill: isSelected ? "url(#selectedGradient)" : "url(#boneGradient)",
                                        filter: isSelected ? "url(#selectedGlow)" : "url(#softShadow)",
                                        transformOrigin: "center",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.filter = "url(#hoverGlow)";
                                            e.currentTarget.style.transform = "scale(1.05)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.filter = "url(#softShadow)";
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

                    {/* Anatomical orientation labels */}
                    <text x="270" y="545" textAnchor="end" fontSize="11" fill="#64748b" fontWeight="500" fontStyle="italic">Left</text>
                    <text x="30" y="545" textAnchor="start" fontSize="11" fill="#64748b" fontWeight="500" fontStyle="italic">Right</text>
                </svg>
            </div>

            {/* Selected Areas Display */}
            {painAreas.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
                    {painAreas.map(area => {
                        const part = bodyParts.find(p => p.id === area);
                        return (
                            <span
                                key={area}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-100 to-red-50 text-red-700 text-xs font-semibold border-2 border-red-200 shadow-sm animate-in fade-in zoom-in duration-300 hover:shadow-md transition-shadow"
                            >
                                {part?.label || area}
                                <button
                                    onClick={() => onToggle(area)}
                                    className="ml-0.5 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-200/50 transition-colors"
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
