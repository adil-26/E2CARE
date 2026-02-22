import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const COLUMNS = [
    { key: "wood", label: "WOOD", sub: "Gall Bladder / Liver", color: "#16a34a", light: "#f0fdf4", border: "#bbf7d0", emoji: "🌿" },
    { key: "fire_yin", label: "FIRE (Yin)", sub: "Heart / Small Intestine", color: "#dc2626", light: "#fef2f2", border: "#fecaca", emoji: "🔥" },
    { key: "fire_yang", label: "FIRE (Yang)", sub: "Triple Warmer / Pericardium", color: "#ea580c", light: "#fff7ed", border: "#fed7aa", emoji: "🌡️" },
    { key: "earth", label: "EARTH", sub: "Stomach / Spleen–Pancreas", color: "#b45309", light: "#fffbeb", border: "#fde68a", emoji: "🌍" },
    { key: "metal", label: "METAL", sub: "Lungs / Large Intestine", color: "#475569", light: "#f8fafc", border: "#e2e8f0", emoji: "⚙️" },
    { key: "water", label: "WATER", sub: "Kidney / Urinary Bladder", color: "#1d4ed8", light: "#eff6ff", border: "#bfdbfe", emoji: "💧" },
] as const;

type ColKey = typeof COLUMNS[number]["key"];

interface Row { label: string; emoji: string; values: Record<ColKey, string> }

const ROWS: Row[] = [
    { label: "Organ (Yin/Yang)", emoji: "🫀", values: { wood: "Liver / Gallbladder", fire_yin: "Heart / Small Intestine", fire_yang: "Pericardium / Triple Warmer", earth: "Spleen–Pancreas / Stomach", metal: "Lungs / Large Intestine", water: "Kidney / Urinary Bladder" } },
    { label: "Energy", emoji: "⚡", values: { wood: "Wind", fire_yin: "Heat", fire_yang: "Hotness", earth: "Humidity", metal: "Dryness", water: "Coldness" } },
    { label: "Season", emoji: "🌸", values: { wood: "Spring", fire_yin: "Summer", fire_yang: "Late Summer", earth: "Late Summer", metal: "Autumn", water: "Winter" } },
    { label: "Age", emoji: "🎂", values: { wood: "1–10", fire_yin: "11–20", fire_yang: "21–30", earth: "31–40", metal: "41–50", water: "51–60" } },
    { label: "Life Cycle", emoji: "🔄", values: { wood: "Activity", fire_yin: "Growth", fire_yang: "Full Growth", earth: "Prosperity", metal: "Atrophy", water: "Old Age / Death" } },
    { label: "Direction", emoji: "🧭", values: { wood: "East & S.E.", fire_yin: "South", fire_yang: "South", earth: "Center", metal: "West & N.W.", water: "North" } },
    { label: "Body Comp", emoji: "🦴", values: { wood: "Muscles & S.E.", fire_yin: "Circ. Sys.", fire_yang: "Nervous Sys.", earth: "Flesh", metal: "Skin & Body Hair", water: "Bones & Head Hair" } },
    { label: "Body Parts", emoji: "🧍", values: { wood: "Muscles, Ligaments, Legs, Side of Body, Groin, Diaphragm", fire_yin: "Arm Pits, Inner Arms, Outer Arms, Shoulder", fire_yang: "Chest, Temples, Outer/Inner Arms, Third Finger", earth: "Inner Legs, Face, Groin, Outer Ribs", metal: "Skin, Outer Arms, Chest, Teeth, Thumb, Sinus", water: "Bones, Head Hair, Side of Foot, Inner Legs, Neck, Back, Buttock, Back of Legs" } },
    { label: "Opening", emoji: "👁️", values: { wood: "Eyes", fire_yin: "Tongue", fire_yang: "Tongue", earth: "Mouth", metal: "Nose", water: "Ears" } },
    { label: "Emotion", emoji: "💭", values: { wood: "Anger", fire_yin: "Joy", fire_yang: "Happiness", earth: "Consciousness", metal: "Sadness", water: "Fear" } },
    { label: "Originality", emoji: "🎯", values: { wood: "Anger", fire_yin: "Desire", fire_yang: "Ambition", earth: "Consciousness", metal: "Will Power", water: "Wisdom" } },
    { label: "Colour", emoji: "🎨", values: { wood: "Green", fire_yin: "Red", fire_yang: "Orange", earth: "Yellow", metal: "White / Brown", water: "Black" } },
    { label: "Taste", emoji: "👅", values: { wood: "Sour", fire_yin: "Bitter", fire_yang: "Bitter / Orange", earth: "Sweet", metal: "Pungent", water: "Salty / Stale" } },
    { label: "Smell", emoji: "👃", values: { wood: "Musk", fire_yin: "Burnt", fire_yang: "Burnt", earth: "Sweet Fragrance", metal: "Fishy", water: "Urine" } },
    { label: "Sound", emoji: "🔊", values: { wood: "Loud", fire_yin: "Laughter", fire_yang: "Laughter", earth: "Singing / Melody", metal: "Sighing", water: "Moaning" } },
    { label: "Sense", emoji: "✨", values: { wood: "Sight", fire_yin: "Speech", fire_yang: "Consciousness", earth: "Taste", metal: "Smell / Mucous", water: "Hearing" } },
    { label: "Body Fluids", emoji: "💧", values: { wood: "Tears", fire_yin: "Sweat", fire_yang: "Sweat", earth: "Saliva", metal: "Mucous", water: "Urine" } },
    { label: "Positive Quality", emoji: "✅", values: { wood: "Patient, Enduring", fire_yin: "Self-Confidence, Speech", fire_yang: "Love, Compassion, Happy", earth: "Encouraging, Sympathetic", metal: "Positive, Social, Enthusiastic", water: "Trust, Courageous, Initiative" } },
    { label: "Negative Quality", emoji: "⚠️", values: { wood: "Frustrated, Angry, Impatient", fire_yin: "Stage Fright, Excitable, Emotional", fire_yang: "Anxiety, Hopelessness, Despair", earth: "Sceptical, Cynical, Doubtful", metal: "Coughing, Worried, Depressed", water: "Selfishness, Timidity, Fearful" } },
    { label: "Symptom", emoji: "🩺", values: { wood: "Flatulence, Nail Issues, Depression", fire_yin: "Complexion, Palpitation", fire_yang: "Tongue, Hiccough, Trembling", earth: "Lips, Belching", metal: "Body Hair, Coughing", water: "Hair on Head" } },
    { label: "Endocrines", emoji: "🔬", values: { wood: "Adrenals, Thyroid", fire_yin: "Pituitary, Pineal", fire_yang: "Pituitary, Pineal, Thyroid", earth: "Lymph, Pancreas, Adrenals", metal: "Thymus", water: "Parathyroid, Genital Organs" } },
];

// ─── Mobile card view: one card per element ───────────────────────────────────
function MobileCards() {
    const [activeCol, setActiveCol] = useState<ColKey>("wood");
    const col = COLUMNS.find(c => c.key === activeCol)!;

    return (
        <div className="space-y-3">
            {/* Element selector tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {COLUMNS.map(c => (
                    <button
                        key={c.key}
                        onClick={() => setActiveCol(c.key)}
                        className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all ${activeCol === c.key ? "text-white shadow-sm scale-105" : "text-muted-foreground bg-muted hover:bg-accent"
                            }`}
                        style={activeCol === c.key ? { background: c.color } : {}}
                    >
                        <span>{c.emoji}</span> {c.label}
                    </button>
                ))}
            </div>

            {/* Selected element card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCol}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="rounded-2xl border-2 overflow-hidden"
                    style={{ borderColor: col.border, background: col.light }}
                >
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center gap-3" style={{ background: col.color }}>
                        <span className="text-2xl">{col.emoji}</span>
                        <div>
                            <p className="text-white font-bold text-sm">{col.label}</p>
                            <p className="text-white/80 text-[10px]">{col.sub}</p>
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-border/40">
                        {ROWS.map((row, i) => (
                            <div key={row.label} className={`flex items-start gap-3 px-4 py-2.5 ${i % 2 === 0 ? "" : "bg-white/40"}`}>
                                <span className="text-xs mt-0.5 shrink-0 w-5">{row.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">{row.label}</p>
                                    <p className="text-[11px] text-foreground leading-snug mt-0.5">{row.values[activeCol]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ─── Desktop table view ───────────────────────────────────────────────────────
function DesktopTable() {
    return (
        <div className="rounded-xl border border-border/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table
                    className="border-collapse text-[9px] sm:text-[10px]"
                    style={{ width: "100%", tableLayout: "fixed" }}
                >
                    <colgroup>
                        {/* row label col */}
                        <col style={{ width: "13%" }} />
                        {/* 6 element cols — equal width */}
                        {COLUMNS.map(col => <col key={col.key} style={{ width: "14.5%" }} />)}
                    </colgroup>

                    <thead>
                        <tr className="border-b border-border">
                            <th className="sticky left-0 z-20 bg-muted text-left px-2 py-2 text-[8px] font-bold uppercase tracking-wide text-muted-foreground border-r border-border">
                                ATTRIBUTE
                            </th>
                            {COLUMNS.map(col => (
                                <th
                                    key={col.key}
                                    className="px-1.5 py-2 border-r border-border/60 last:border-r-0 text-center"
                                    style={{ background: col.light }}
                                >
                                    <div className="font-extrabold text-[9px] sm:text-[10px] uppercase leading-tight" style={{ color: col.color }}>
                                        {col.emoji} {col.label}
                                    </div>
                                    <div className="text-[7px] sm:text-[8px] text-muted-foreground mt-0.5 leading-tight font-normal">
                                        {col.sub}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {ROWS.map((row, ri) => (
                            <tr
                                key={row.label}
                                className={`border-b border-border/40 hover:bg-accent/20 transition-colors ${ri % 2 === 0 ? "bg-background" : "bg-muted/15"}`}
                            >
                                {/* Sticky row label */}
                                <td className="sticky left-0 z-10 bg-inherit px-2 py-1.5 border-r border-border font-semibold text-foreground">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] shrink-0">{row.emoji}</span>
                                        <span className="text-[8px] sm:text-[9px] leading-tight">{row.label}</span>
                                    </div>
                                </td>
                                {/* Element value cells */}
                                {COLUMNS.map((col, ci) => (
                                    <td
                                        key={col.key}
                                        className="px-1.5 py-1.5 border-r border-border/30 last:border-r-0 text-center align-top"
                                        style={{ background: ri % 2 !== 0 ? col.light + "55" : undefined }}
                                    >
                                        <span className="text-[8px] sm:text-[9px] leading-snug text-foreground/80 break-words">
                                            {row.values[col.key as ColKey]}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


// ─── Main Export ──────────────────────────────────────────────────────────────
export default function FiveElementChart() {
    const [open, setOpen] = useState(true);

    return (
        <div className="space-y-3">
            {/* Toggle header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-xl font-bold">五行</span>
                    <div className="text-left">
                        <p className="font-bold text-sm">Five Element Chart</p>
                        <p className="text-[10px] text-indigo-200">Traditional Chinese Medicine Reference Table</p>
                    </div>
                </div>
                {open ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {/* Mobile: card-per-element; Desktop: full table */}
                        <div className="block sm:hidden">
                            <MobileCards />
                        </div>
                        <div className="hidden sm:block">
                            <DesktopTable />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
