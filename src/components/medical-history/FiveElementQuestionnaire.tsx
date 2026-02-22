/**
 * Five Element Questionnaire
 *
 * Asks the user ~30 questions derived from every row of the Five Element Chart
 * (emotions, body symptoms, taste/smell/sound preferences, seasonal affinity,
 * body-part issues, personality traits, sensory tendencies).
 *
 * Each answer contributes a score to one or more Element keys.
 * At the end a full Elemental diagnosis is shown.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FIVE_ELEMENTS, ElementKey } from "@/data/fiveElementData";
import { ChevronRight, ChevronLeft, RefreshCw, CheckCircle2, Heart, Lightbulb, TrendingUp } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

// ─── Question bank ─────────────────────────────────────────────────────────────

type AnswerOption = { label: string; scores: Partial<Record<ElementKey, number>> };
type Category = "Emotions" | "Physical Symptoms" | "Taste & Smell" | "Sound & Voice" | "Seasonal Affinity" | "Body Parts" | "Personality";

export interface Question {
    id: string;
    category: Category;
    emoji: string;
    text: string;
    options: AnswerOption[];
}

export const QUESTIONS: Question[] = [
    // ── EMOTIONS ──────────────────────────────────────────────────────────────
    {
        id: "em1",
        category: "Emotions",
        emoji: "💭",
        text: "Which emotion do you experience most often?",
        options: [
            { label: "Anger / Frustration / Irritability", scores: { wood: 4 } },
            { label: "Overexcitement / Joy that feels uncontrollable", scores: { fire_yin: 4 } },
            { label: "Anxiety / Hopelessness / Despair", scores: { fire_yang: 4 } },
            { label: "Worry / Overthinking / Doubt", scores: { earth: 4 } },
            { label: "Sadness / Grief / Depression", scores: { metal: 4 } },
            { label: "Fear / Timidity / Insecurity", scores: { water: 4 } },
        ],
    },
    {
        id: "em2",
        category: "Emotions",
        emoji: "😤",
        text: "How do you typically react under stress?",
        options: [
            { label: "I get angry and need to shout or move", scores: { wood: 3 } },
            { label: "I become scattered and over-stimulated", scores: { fire_yin: 3 } },
            { label: "I feel hopeless and paralysed", scores: { fire_yang: 3 } },
            { label: "I ruminate and over-analyse everything", scores: { earth: 3 } },
            { label: "I withdraw and feel heavy sadness", scores: { metal: 3 } },
            { label: "I freeze and feel deeply fearful", scores: { water: 3 } },
        ],
    },
    {
        id: "em3",
        category: "Emotions",
        emoji: "🧘",
        text: "Which positive quality describes you best?",
        options: [
            { label: "Patient and enduring — I push through difficulties", scores: { wood: 3 } },
            { label: "Confident and expressive — I speak my truth", scores: { fire_yin: 3 } },
            { label: "Loving and compassionate — I care deeply", scores: { fire_yang: 3 } },
            { label: "Nurturing and supportive — I encourage others", scores: { earth: 3 } },
            { label: "Positive and enthusiastic — I inspire people", scores: { metal: 3 } },
            { label: "Courageous and determined — I face challenges head-on", scores: { water: 3 } },
        ],
    },

    // ── PHYSICAL SYMPTOMS ─────────────────────────────────────────────────────
    {
        id: "ph1",
        category: "Physical Symptoms",
        emoji: "🧍",
        text: "Which physical complaint do you struggle with most?",
        options: [
            { label: "Muscle/tendon tightness, eye strain, nail problems", scores: { wood: 4 } },
            { label: "Heart palpitations, poor circulation, sweating", scores: { fire_yin: 4 } },
            { label: "Temperature regulation issues, trembling, hiccoughs", scores: { fire_yang: 4 } },
            { label: "Bloating, belching, digestive issues, weight problems", scores: { earth: 4 } },
            { label: "Cough, dry skin, sinus congestion, constipation", scores: { metal: 4 } },
            { label: "Lower back pain, hearing issues, hair thinning, urinary problems", scores: { water: 4 } },
        ],
    },
    {
        id: "ph2",
        category: "Physical Symptoms",
        emoji: "👁️",
        text: "Which sensory organ gives you the most trouble?",
        options: [
            { label: "Eyes — dry, strained, or blurry vision", scores: { wood: 3 } },
            { label: "Tongue — speech, taste sensitivity, ulcers", scores: { fire_yin: 2, fire_yang: 2 } },
            { label: "Mouth / Digestion — appetite issues, lips", scores: { earth: 3 } },
            { label: "Nose — sinus, smell sensitivity, congestion", scores: { metal: 3 } },
            { label: "Ears — hearing loss, tinnitus, ear infections", scores: { water: 3 } },
        ],
    },
    {
        id: "ph3",
        category: "Physical Symptoms",
        emoji: "🩺",
        text: "Do you notice any of the following body-fluid irregularities?",
        options: [
            { label: "Excessive tearing / dry or watery eyes", scores: { wood: 3 } },
            { label: "Excessive sweating even when cool", scores: { fire_yin: 3, fire_yang: 2 } },
            { label: "Excessive saliva or drooling, mouth dryness", scores: { earth: 3 } },
            { label: "Excessive mucus / phlegm / nasal discharge", scores: { metal: 3 } },
            { label: "Urinary urgency, frequency, or discolouration", scores: { water: 3 } },
            { label: "None of the above", scores: {} },
        ],
    },
    {
        id: "ph4",
        category: "Physical Symptoms",
        emoji: "💤",
        text: "How would you describe your sleep quality?",
        options: [
            { label: "I wake up between 1–3 AM, often from vivid dreams or anger", scores: { wood: 3 } },
            { label: "I can't switch off — my mind races with excitement or anxiety", scores: { fire_yin: 3 } },
            { label: "I sleep lightly and feel anxious on waking", scores: { fire_yang: 3 } },
            { label: "I sleep too much or feel heavy and unrefreshed", scores: { earth: 3 } },
            { label: "I wake early (3–5 AM) and feel sad or empty", scores: { metal: 3 } },
            { label: "I feel exhausted but can't sleep — restless legs, night sweats", scores: { water: 3 } },
        ],
    },
    {
        id: "ph5",
        category: "Physical Symptoms",
        emoji: "🦴",
        text: "Which body area is most frequently painful or problematic for you?",
        options: [
            { label: "Muscles, tendons, side of body or groin", scores: { wood: 3 } },
            { label: "Chest, inner/outer arms, armpits, shoulders", scores: { fire_yin: 3 } },
            { label: "Temples, third finger, nervous tingling in chest", scores: { fire_yang: 3 } },
            { label: "Inner legs, abdomen, outer ribs, face", scores: { earth: 3 } },
            { label: "Skin, chest, thumb, sinuses, teeth", scores: { metal: 3 } },
            { label: "Lower back, knees, bones, heels, back of legs", scores: { water: 3 } },
        ],
    },

    // ── TASTE & SMELL ─────────────────────────────────────────────────────────
    {
        id: "ts1",
        category: "Taste & Smell",
        emoji: "👅",
        text: "Which taste do you crave most or are strongly drawn to?",
        options: [
            { label: "Sour — pickles, citrus, vinegar", scores: { wood: 4 } },
            { label: "Bitter — dark chocolate, coffee, bitter greens", scores: { fire_yin: 3, fire_yang: 1 } },
            { label: "Sweet — desserts, sugary snacks, honey", scores: { earth: 4 } },
            { label: "Pungent / spicy — chilli, garlic, onions, ginger", scores: { metal: 4 } },
            { label: "Salty — crisps, pickled foods, soy sauce", scores: { water: 4 } },
        ],
    },
    {
        id: "ts2",
        category: "Taste & Smell",
        emoji: "👃",
        text: "Which smell do you notice most strongly from your own body or environment?",
        options: [
            { label: "Musty / rancid smell", scores: { wood: 3 } },
            { label: "Burnt / scorched smell", scores: { fire_yin: 2, fire_yang: 2 } },
            { label: "Sweet / fragrant body odour", scores: { earth: 3 } },
            { label: "Fishy or unusual body smell", scores: { metal: 3 } },
            { label: "Urine-like or stale smell", scores: { water: 3 } },
            { label: "No particular smell I notice", scores: {} },
        ],
    },

    // ── SOUND & VOICE ─────────────────────────────────────────────────────────
    {
        id: "sv1",
        category: "Sound & Voice",
        emoji: "🎵",
        text: "How would others describe your voice or speaking style?",
        options: [
            { label: "Loud, assertive, sometimes shouting", scores: { wood: 3 } },
            { label: "Laughs a lot, bright and expressive", scores: { fire_yin: 3 } },
            { label: "Giggly or emotionally variable", scores: { fire_yang: 3 } },
            { label: "Melodic, singsong, nurturing tone", scores: { earth: 3 } },
            { label: "Soft, sighing, often trailing off", scores: { metal: 3 } },
            { label: "Deep, groaning or moaning quality, or very quiet", scores: { water: 3 } },
        ],
    },

    // ── SEASONAL AFFINITY ─────────────────────────────────────────────────────
    {
        id: "sa1",
        category: "Seasonal Affinity",
        emoji: "🌸",
        text: "In which season do you feel most alive and energised?",
        options: [
            { label: "Spring — fresh starts, new growth, movement", scores: { wood: 4 } },
            { label: "Early summer — warmth, brightness, activity", scores: { fire_yin: 4 } },
            { label: "Late summer — fullness, socialising, abundance", scores: { fire_yang: 3, earth: 1 } },
            { label: "Late summer / harvest — grounded, settled", scores: { earth: 4 } },
            { label: "Autumn — crisp air, clarity, reflection", scores: { metal: 4 } },
            { label: "Winter — stillness, rest, going inward", scores: { water: 4 } },
        ],
    },
    {
        id: "sa2",
        category: "Seasonal Affinity",
        emoji: "🌡️",
        text: "Which season makes you feel most unwell or depleted?",
        options: [
            { label: "Spring — I get headaches, stiff joints, irritable", scores: { wood: 3 } },
            { label: "Summer — I overheat, get heart issues, feel manic", scores: { fire_yin: 3 } },
            { label: "Late summer — I feel foggy, bloated, sluggish", scores: { earth: 3 } },
            { label: "Autumn — I get dry skin, coughs, frequent colds", scores: { metal: 3 } },
            { label: "Winter — I get back pain, low energy, feel fearful", scores: { water: 3 } },
        ],
    },

    // ── PERSONALITY ───────────────────────────────────────────────────────────
    {
        id: "pe1",
        category: "Personality",
        emoji: "🙋",
        text: "How do people usually see you?",
        options: [
            { label: "Driven, competitive, sometimes stubborn", scores: { wood: 3 } },
            { label: "Enthusiastic, charismatic, sometimes too intense", scores: { fire_yin: 3 } },
            { label: "Warm, loving, but sometimes overly dependent", scores: { fire_yang: 3 } },
            { label: "Caring, supportive, a natural nurturer", scores: { earth: 3 } },
            { label: "Organised, detail-oriented, sometimes rigid", scores: { metal: 3 } },
            { label: "Wise, deep-thinking, reserved or introverted", scores: { water: 3 } },
        ],
    },
    {
        id: "pe2",
        category: "Personality",
        emoji: "⚡",
        text: "What is your typical energy pattern through the day?",
        options: [
            { label: "Morning burst of energy, fades mid-afternoon", scores: { wood: 2 } },
            { label: "High energy from midday onward, hard to wind down", scores: { fire_yin: 2 } },
            { label: "Erratic energy — spikes then crashes", scores: { fire_yang: 2 } },
            { label: "Steady but slow — needs regular meals to keep going", scores: { earth: 2 } },
            { label: "Low in the morning, best in the afternoon", scores: { metal: 2 } },
            { label: "Very low overall — relies on quiet to conserve energy", scores: { water: 2 } },
        ],
    },
    {
        id: "pe3",
        category: "Personality",
        emoji: "🎨",
        text: "Which colour are you most naturally drawn to?",
        options: [
            { label: "Green / forest tones", scores: { wood: 3 } },
            { label: "Red / vibrant warm tones", scores: { fire_yin: 3 } },
            { label: "Orange / bright fiery tones", scores: { fire_yang: 3 } },
            { label: "Yellow / amber / golden tones", scores: { earth: 3 } },
            { label: "White / grey / silver / beige", scores: { metal: 3 } },
            { label: "Black / dark blue / deep navy", scores: { water: 3 } },
        ],
    },

    // ── BODY PARTS ────────────────────────────────────────────────────────────
    {
        id: "bp1",
        category: "Body Parts",
        emoji: "🔬",
        text: "Which type of health condition appears most in your family or personal history?",
        options: [
            { label: "Liver, gallbladder, eye, muscle/joint conditions", scores: { wood: 4 } },
            { label: "Heart, circulation, blood pressure conditions", scores: { fire_yin: 4 } },
            { label: "Thyroid, neurological, hormonal conditions", scores: { fire_yang: 4 } },
            { label: "Diabetes, pancreas, digestive, weight conditions", scores: { earth: 4 } },
            { label: "Lung, skin, immune, bowel conditions", scores: { metal: 4 } },
            { label: "Kidney, bone, reproductive, hearing conditions", scores: { water: 4 } },
        ],
    },
    {
        id: "bp2",
        category: "Body Parts",
        emoji: "💊",
        text: "Which endocrine / gland issue have you or your family experienced?",
        options: [
            { label: "Adrenal fatigue or thyroid imbalance", scores: { wood: 3 } },
            { label: "Pituitary or pineal gland issues", scores: { fire_yin: 2, fire_yang: 2 } },
            { label: "Lymphatic swelling or pancreas/insulin issues", scores: { earth: 3 } },
            { label: "Thymus / immune system weakness", scores: { metal: 3 } },
            { label: "Parathyroid, reproductive, or bone density issues", scores: { water: 3 } },
            { label: "None known", scores: {} },
        ],
    },
];

// ─── Scoring ───────────────────────────────────────────────────────────────────

function computeScores(answers: Record<string, AnswerOption>): Record<ElementKey, number> {
    const totals: Record<ElementKey, number> = {
        wood: 0, fire_yin: 0, fire_yang: 0, earth: 0, metal: 0, water: 0,
    };
    for (const opt of Object.values(answers)) {
        for (const [el, pts] of Object.entries(opt.scores) as [ElementKey, number][]) {
            totals[el] += pts;
        }
    }
    return totals;
}

function normalise(raw: Record<ElementKey, number>): Record<ElementKey, number> {
    const max = Math.max(...Object.values(raw), 1);
    const out: Record<ElementKey, number> = {} as any;
    for (const [k, v] of Object.entries(raw) as [ElementKey, number][]) {
        out[k] = Math.round((v / max) * 100);
    }
    return out;
}

const CATS: Category[] = [
    "Emotions", "Physical Symptoms", "Taste & Smell",
    "Sound & Voice", "Seasonal Affinity", "Personality", "Body Parts",
];

const CAT_EMOJI: Record<Category, string> = {
    Emotions: "💭",
    "Physical Symptoms": "🩺",
    "Taste & Smell": "👅",
    "Sound & Voice": "🎵",
    "Seasonal Affinity": "🌸",
    Personality: "🙋",
    "Body Parts": "🦴",
};

// ─── Result view ───────────────────────────────────────────────────────────────

function Results({ scores, onReset }: { scores: Record<ElementKey, number>; onReset: () => void }) {
    const normalised = normalise(scores);
    const sorted = (Object.entries(normalised) as [ElementKey, number][]).sort((a, b) => b[1] - a[1]);
    const [dominant, dominantScore] = sorted[0];
    const profile = FIVE_ELEMENTS[dominant];

    const radarData = sorted.map(([key, val]) => ({
        element: FIVE_ELEMENTS[key].name,
        score: val,
        fullMark: 100,
    }));

    const recMap: Record<ElementKey, string[]> = {
        wood: ["Eat sour/green foods: lemon, leafy greens, pickles", "Stretch tendons daily — yoga, tai chi", "Reduce alcohol & greasy foods", "Channel anger creatively — journaling, movement"],
        fire_yin: ["Eat bitter/red foods: dark berries, dark chocolate, beet", "Maintain regular sleep schedule — avoid caffeine after 2 PM", "Practise heart-opening breathwork (box breathing)", "Limit overstimulation — screens, loud music, crowds"],
        fire_yang: ["Support thyroid: iodine-rich seaweed, Brazil nuts", "Warm chest-opening exercises: swimming, yoga backbends", "Regulate temperature: avoid extremes of hot/cold", "Cultivate compassion and limit emotional extremes"],
        earth: ["Eat warm, cooked foods: soups, stews, root vegetables", "Avoid cold raw foods and refined sugar", "Ground yourself: barefoot walks, gardening, cooking", "Keep regular meal times to stabilise blood sugar"],
        metal: ["Diaphragmatic breathing exercises — 10 minutes daily", "Eat pungent/white foods: garlic, onion, radish, pear", "Process grief consciously — allow yourself to feel sadness", "Prioritise immune support: vitamin C, zinc, elderberry"],
        water: ["Drink warm water; eat salty/black foods: black sesame, kidney beans", "Strength-train for bone density; adequate calcium & D3", "Ensure 7–9 hours sleep — kidneys regenerate at night", "Face one small fear daily to build courage gradually"],
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Dominant element banner */}
            <div
                className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-2"
                style={{ background: profile.gradientFrom + "55", borderColor: profile.color + "88" }}
            >
                <div className="text-5xl">{profile.emoji}</div>
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-lg font-bold text-foreground">Dominant Element: {profile.name}</p>
                        <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                            style={{ background: profile.color }}
                        >
                            {dominantScore}% signal
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {profile.yinOrgan} / {profile.yangOrgan} · {profile.season} · Age {profile.ageRange}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Body areas: {profile.bodyParts.slice(0, 4).join(", ")}
                    </p>
                </div>
            </div>

            {/* Radar */}
            <Card className="shadow-sm">
                <CardContent className="px-2 py-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> Your Elemental Profile
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="element" tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} />
                            <Radar name="Score" dataKey="score" stroke={profile.color} fill={profile.color} fillOpacity={0.25} strokeWidth={2} />
                            <Tooltip formatter={(v: number) => [`${v}%`, "Signal"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* All element bars */}
            <Card className="shadow-sm">
                <CardContent className="p-4 space-y-3">
                    {sorted.map(([key, score], i) => {
                        const p = FIVE_ELEMENTS[key];
                        return (
                            <div key={key} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{p.emoji}</span>
                                        <span className="text-xs font-semibold">{p.name}</span>
                                        {i === 0 && <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 rounded-full font-bold">Most Active</span>}
                                        {i === sorted.length - 1 && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 rounded-full font-bold">Least Active</span>}
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: p.color }}>{score}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.05 }}
                                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${p.gradientFrom}, ${p.gradientTo})` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Insights */}
            <Card className="shadow-sm">
                <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-semibold">Elemental Insights</p>
                    </div>
                    {[
                        `Your responses point most strongly to the ${profile.name} element (${profile.yinOrgan} / ${profile.yangOrgan}).`,
                        `This element governs the ${profile.season} season and relates to the colour ${profile.colour}, taste ${profile.taste}, and the sense of ${profile.sense}.`,
                        `When your ${profile.name} element is imbalanced you may experience: ${profile.emotions.negative.slice(0, 3).join(", ")}.`,
                        `When it flows freely you express: ${profile.emotions.positive.slice(0, 3).join(", ")}.`,
                        `Key body areas to nurture: ${profile.bodyParts.slice(0, 4).join(", ")}.`,
                    ].map((t, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-indigo-400 shrink-0 mt-0.5">◆</span><span>{t}</span>
                        </p>
                    ))}
                </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-sm">
                <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Heart className="h-4 w-4 text-rose-500" />
                        <p className="text-xs font-semibold">Personalised Recommendations</p>
                    </div>
                    {(recMap[dominant] || []).map((r, i) => (
                        <div key={i} className="flex gap-2">
                            <span className="text-emerald-500 text-xs shrink-0 mt-0.5">→</span>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{r}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Disclaimer + reset */}
            <div className="flex flex-col items-center gap-3 pb-4">
                <p className="text-[9px] text-muted-foreground text-center px-4">
                    This assessment is based on TCM Five Element theory for informational purposes only.
                    Always consult a qualified healthcare professional.
                </p>
                <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5 text-xs">
                    <RefreshCw className="h-3.5 w-3.5" /> Retake Assessment
                </Button>
            </div>
        </motion.div>
    );
}

// ─── Main Questionnaire Component ─────────────────────────────────────────────

export default function FiveElementQuestionnaire() {
    const [answers, setAnswers] = useState<Record<string, AnswerOption>>({});
    const [currentCatIdx, setCurrentCatIdx] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const currentCat = CATS[currentCatIdx];
    const catQuestions = useMemo(() => QUESTIONS.filter(q => q.category === currentCat), [currentCat]);
    const answeredInCat = catQuestions.filter(q => answers[q.id]).length;
    const totalAnswered = Object.keys(answers).length;
    const progress = Math.round((totalAnswered / QUESTIONS.length) * 100);

    const canProceed = catQuestions.every(q => answers[q.id]);
    const isLastCat = currentCatIdx === CATS.length - 1;

    const handleAnswer = (qId: string, opt: AnswerOption) => {
        setAnswers(prev => ({ ...prev, [qId]: opt }));
    };

    const handleNext = () => {
        if (isLastCat) { setSubmitted(true); } else { setCurrentCatIdx(i => i + 1); }
    };

    const handleBack = () => {
        if (currentCatIdx > 0) setCurrentCatIdx(i => i - 1);
    };

    const handleReset = () => {
        setAnswers({});
        setCurrentCatIdx(0);
        setSubmitted(false);
    };

    if (submitted) {
        const raw = computeScores(answers);
        return <Results scores={raw} onReset={handleReset} />;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="rounded-xl p-4 text-white" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-sm sm:text-base">五行 Health Assessment</p>
                        <p className="text-[10px] text-indigo-200 mt-0.5">Answer questions to diagnose your elemental balance</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">{progress}%</p>
                        <p className="text-[9px] text-indigo-200">{totalAnswered}/{QUESTIONS.length} answered</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-white rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {CATS.map((cat, i) => {
                    const catQs = QUESTIONS.filter(q => q.category === cat);
                    const catAnswered = catQs.every(q => answers[q.id]);
                    return (
                        <button
                            key={cat}
                            onClick={() => setCurrentCatIdx(i)}
                            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-all ${i === currentCatIdx ? "bg-indigo-600 text-white" :
                                    catAnswered ? "bg-emerald-100 text-emerald-700" :
                                        "bg-muted text-muted-foreground hover:bg-accent"
                                }`}
                        >
                            {catAnswered ? <CheckCircle2 className="h-3 w-3" /> : <span>{CAT_EMOJI[cat]}</span>}
                            <span className="hidden sm:inline">{cat}</span>
                        </button>
                    );
                })}
            </div>

            {/* Questions for current category */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentCat}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{CAT_EMOJI[currentCat]}</span>
                        <h3 className="font-semibold text-sm text-foreground">{currentCat}</h3>
                        <span className="text-[10px] text-muted-foreground">({answeredInCat}/{catQuestions.length} answered)</span>
                    </div>

                    {catQuestions.map((q, qi) => (
                        <Card key={q.id} className={`shadow-sm transition-all ${answers[q.id] ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10" : "border-border"}`}>
                            <CardContent className="p-4 space-y-3">
                                <p className="text-xs sm:text-sm font-semibold text-foreground flex gap-2">
                                    <span className="shrink-0 text-muted-foreground">{qi + 1}.</span>
                                    <span>{q.text}</span>
                                </p>
                                <div className="space-y-2">
                                    {q.options.map((opt, oi) => {
                                        const isSelected = answers[q.id]?.label === opt.label;
                                        return (
                                            <button
                                                key={oi}
                                                onClick={() => handleAnswer(q.id, opt)}
                                                className={`w-full text-left text-[11px] sm:text-xs px-3 py-2.5 rounded-lg border transition-all ${isSelected
                                                        ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                                                        : "border-border bg-muted/30 hover:bg-accent hover:border-accent-foreground/20 text-foreground/80"
                                                    }`}
                                            >
                                                <span className="flex items-start gap-2">
                                                    <span className={`mt-0.5 h-3.5 w-3.5 rounded-full border-2 flex-shrink-0 ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-muted-foreground"}`} />
                                                    {opt.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between pb-4">
                <Button variant="outline" size="sm" onClick={handleBack} disabled={currentCatIdx === 0} className="gap-1 text-xs">
                    <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <span className="text-[10px] text-muted-foreground">
                    Section {currentCatIdx + 1} of {CATS.length}
                </span>
                <Button size="sm" onClick={handleNext} disabled={!canProceed} className={`gap-1 text-xs ${isLastCat ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}>
                    {isLastCat ? "Show Diagnosis" : "Next"} <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
