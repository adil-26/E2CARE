import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFiveElementDiagnosis } from "@/hooks/useFiveElementDiagnosis";
import { FIVE_ELEMENTS, ElementKey } from "@/data/fiveElementData";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { HearOutButton } from "@/components/ui/HearOutButton";
import { Stethoscope, TrendingUp, Heart, Lightbulb, Leaf, Flame, Globe, Wind, Droplets } from "lucide-react";
import FiveElementChart from "@/components/medical-history/FiveElementChart";

interface FiveElementDiagnosticProps {
    history: Record<string, any> | null | undefined;
}

const ELEMENT_ICONS: Record<ElementKey, React.ReactNode> = {
    wood: <Leaf className="h-4 w-4" />,
    fire_yin: <Flame className="h-4 w-4" />,
    fire_yang: <Flame className="h-4 w-4 opacity-70" />,
    earth: <Globe className="h-4 w-4" />,
    metal: <Wind className="h-4 w-4" />,
    water: <Droplets className="h-4 w-4" />,
};

const ELEMENT_LABELS: Record<ElementKey, string> = {
    wood: "Wood",
    fire_yin: "Fire ♥",
    fire_yang: "Fire ☯",
    earth: "Earth",
    metal: "Metal",
    water: "Water",
};

// ─── Radar chart ─────────────────────────────────────────────────────────────
function ElementRadar({ scores }: { scores: { element: ElementKey; score: number }[] }) {
    const data = scores.map(s => ({
        element: ELEMENT_LABELS[s.element],
        score: s.score,
        fullMark: 100,
    }));

    return (
        <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                    dataKey="element"
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                />
                <Radar
                    name="Signal"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.22}
                    strokeWidth={2}
                />
                <Tooltip
                    formatter={(v: number) => [`${v}%`, "Signal"]}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}

// ─── Element score bar ────────────────────────────────────────────────────────
function ElementBar({ element, score, matched }: { element: ElementKey; score: number; matched: string[] }) {
    const profile = FIVE_ELEMENTS[element];
    const isHigh = score >= 60;
    const isMid = score >= 25 && score < 60;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className="flex items-center justify-center h-7 w-7 rounded-lg text-white shrink-0"
                        style={{ background: profile.color }}
                    >
                        {ELEMENT_ICONS[element]}
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground">{profile.name}</span>
                        <span className="hidden sm:inline text-[10px] text-muted-foreground ml-1.5">
                            {profile.yinOrgan} / {profile.yangOrgan}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {isHigh && <Badge className="text-[9px] h-4 px-1.5 bg-rose-100 text-rose-700 border-rose-200">High</Badge>}
                    {isMid && <Badge className="text-[9px] h-4 px-1.5 bg-amber-100 text-amber-700 border-amber-200">Mid</Badge>}
                    <span className="text-xs font-bold w-8 text-right" style={{ color: profile.color }}>{score}%</span>
                </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${profile.gradientFrom}, ${profile.gradientTo})` }}
                />
            </div>
            {matched.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {matched.slice(0, 5).map(kw => (
                        <span key={kw} className="text-[9px] rounded-full bg-muted/80 px-2 py-0.5 text-muted-foreground">{kw}</span>
                    ))}
                    {matched.length > 5 && (
                        <span className="text-[9px] text-muted-foreground">+{matched.length - 5} more</span>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FiveElementDiagnostic({ history }: FiveElementDiagnosticProps) {
    const result = useFiveElementDiagnosis(history);

    const domProfile = useMemo(
        () => (result.dominantElement ? FIVE_ELEMENTS[result.dominantElement] : null),
        [result.dominantElement]
    );
    const ageProfile = useMemo(
        () => (result.ageElement ? FIVE_ELEMENTS[result.ageElement] : null),
        [result.ageElement]
    );

    const insightText = result.insights.join(" ");

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 w-full"
        >
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm sm:text-base text-foreground">五行 Five Element Analysis</h3>
                        <p className="text-[10px] text-muted-foreground">TCM diagnostic mapping of your medical history</p>
                    </div>
                </div>
                <HearOutButton text={insightText} size="sm" />
            </div>

            {/* ── Reference chart ────────────────────────────────────────────────── */}
            <FiveElementChart />

            {/* ── Age-phase banner ───────────────────────────────────────────────── */}
            {ageProfile && (
                <div
                    className="rounded-xl px-3 py-2.5 flex items-center gap-2.5 border"
                    style={{ background: ageProfile.gradientFrom + "44", borderColor: ageProfile.color + "55" }}
                >
                    <span className="text-lg shrink-0">{FIVE_ELEMENTS[result.ageElement!].emoji}</span>
                    <div>
                        <p className="text-xs font-semibold text-foreground">
                            Your age → {ageProfile.name} element phase
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            {ageProfile.season} · {ageProfile.yinOrgan} / {ageProfile.yangOrgan}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Desktop 2-col layout ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Left: Radar + Element bars */}
                <div className="space-y-4">
                    {/* Radar */}
                    {result.scores.length > 0 && result.totalSignals > 0 && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-0 pt-4 px-4">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <TrendingUp className="h-3.5 w-3.5" /> Elemental Signal Strength
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-2 pb-2">
                                <ElementRadar scores={result.scores} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Bars */}
                    <Card className="shadow-sm">
                        <CardContent className="p-4 space-y-4">
                            {result.scores.length > 0 ? (
                                result.scores.map(s => (
                                    <ElementBar key={s.element} element={s.element} score={s.score} matched={s.matchedKeywords} />
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-6">
                                    Complete your medical history to activate the Five Element analysis.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Dominant element + Insights + Recommendations */}
                <div className="space-y-4">
                    {/* Dominant element card */}
                    {domProfile && (
                        <Card className="shadow-sm border-2" style={{ borderColor: domProfile.color + "55" }}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-2xl">{domProfile.emoji}</span>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Dominant: {domProfile.name}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {domProfile.yinOrgan} · {domProfile.yangOrgan} · {domProfile.season}
                                        </p>
                                    </div>
                                </div>

                                {/* Body parts */}
                                <div>
                                    <p className="text-[9px] uppercase font-semibold text-muted-foreground mb-1.5 tracking-wider">Body Areas Governed</p>
                                    <div className="flex flex-wrap gap-1">
                                        {domProfile.bodyParts.slice(0, 5).map(bp => (
                                            <span key={bp} className="text-[9px] rounded-full bg-muted px-2 py-0.5 text-foreground/70">{bp}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Emotional balance */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2">
                                        <p className="text-[9px] uppercase font-semibold text-emerald-600 mb-1">✓ Balanced</p>
                                        {domProfile.emotions.positive.slice(0, 3).map(e => (
                                            <p key={e} className="text-[10px] text-foreground/70">{e}</p>
                                        ))}
                                    </div>
                                    <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 p-2">
                                        <p className="text-[9px] uppercase font-semibold text-rose-500 mb-1">⚠ Imbalanced</p>
                                        {domProfile.emotions.negative.slice(0, 3).map(e => (
                                            <p key={e} className="text-[10px] text-foreground/70">{e}</p>
                                        ))}
                                    </div>
                                </div>

                                {/* Elemental qualities row */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {[
                                        { label: "Taste", value: domProfile.taste },
                                        { label: "Colour", value: domProfile.colour },
                                        { label: "Sense", value: domProfile.sense },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="rounded-lg bg-muted/60 py-2">
                                            <p className="text-[9px] text-muted-foreground uppercase">{label}</p>
                                            <p className="text-[10px] font-semibold text-foreground mt-0.5">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Insights */}
                    {result.insights.length > 0 && (
                        <Card className="shadow-sm">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                    <p className="text-xs font-semibold text-foreground">Elemental Insights</p>
                                </div>
                                {result.insights.map((insight, i) => (
                                    <p key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                                        <span className="text-indigo-400 shrink-0 mt-0.5">◆</span>
                                        <span>{insight}</span>
                                    </p>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <Card className="shadow-sm">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    <p className="text-xs font-semibold text-foreground">Personalised Recommendations</p>
                                </div>
                                {result.recommendations.map((rec, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-emerald-500 text-xs shrink-0 mt-0.5">→</span>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[9px] text-muted-foreground text-center px-2 pb-2">
                This analysis is based on Traditional Chinese Medicine (TCM) Five Element theory for informational purposes only.
                Always consult a qualified healthcare professional for diagnosis and treatment.
            </p>
        </motion.div>
    );
}
