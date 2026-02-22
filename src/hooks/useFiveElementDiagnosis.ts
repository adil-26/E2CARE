/**
 * useFiveElementDiagnosis
 *
 * Analyses a patient's complete medical history against the TCM Five Element Chart.
 * Returns a scored elemental profile, imbalance indicators, and personalised insights.
 */

import { useMemo } from "react";
import { FIVE_ELEMENTS, ElementKey, buildKeywordIndex } from "@/data/fiveElementData";

export interface ElementScore {
    element: ElementKey;
    score: number;           // 0-100
    matchedKeywords: string[];
    affectedOrgans: string[];
}

export interface DiagnosticResult {
    scores: ElementScore[];
    dominantElement: ElementKey | null;
    weakestElement: ElementKey | null;
    ageElement: ElementKey | null;      // element matching patient's age band
    insights: string[];
    recommendations: string[];
    emotionalProfile: { positive: string[]; negative: string[] };
    totalSignals: number;
}

const KEYWORD_INDEX = buildKeywordIndex();

/**
 * Flatten the medical history JSON into a single searchable string blob
 * plus a structured list of individual values for keyword scanning.
 */
function flattenHistory(history: Record<string, any>): string[] {
    const tokens: string[] = [];

    function recurse(obj: any) {
        if (!obj || typeof obj !== "object") {
            if (typeof obj === "string" || typeof obj === "number") {
                tokens.push(String(obj).toLowerCase());
            }
            return;
        }
        if (Array.isArray(obj)) {
            obj.forEach(recurse);
            return;
        }
        for (const val of Object.values(obj)) {
            recurse(val);
        }
    }

    recurse(history);
    return tokens;
}

/**
 * Calculate how strongly a list of tokens matches an element's keyword list.
 * Returns score 0-100 and list of matched keywords.
 */
function scoreElement(tokens: string[], elementKey: ElementKey): { score: number; matched: string[] } {
    const profile = FIVE_ELEMENTS[elementKey];
    const allKeywords = [...profile.conditionKeywords, ...profile.bodySystemKeywords, ...profile.symptoms.map(s => s.toLowerCase())];
    const matched = new Set<string>();

    for (const token of tokens) {
        for (const kw of allKeywords) {
            if (token.includes(kw) || kw.includes(token)) {
                if (token.length > 3) matched.add(kw); // avoid noise from tiny matches
            }
        }
    }

    // Keyword index O(1) check as secondary pass
    for (const token of tokens) {
        const directMatch = KEYWORD_INDEX.get(token);
        if (directMatch === elementKey && token.length > 3) {
            matched.add(token);
        }
    }

    const raw = matched.size;
    // Normalise: anything >= 5 keyword matches = 100
    const score = Math.min(100, Math.round((raw / 5) * 100));
    return { score, matched: Array.from(matched) };
}

/**
 * Determine which element corresponds to the patient's age.
 */
function getAgeElement(age: number | undefined | null): ElementKey | null {
    if (!age) return null;
    for (const [key, profile] of Object.entries(FIVE_ELEMENTS) as [ElementKey, typeof FIVE_ELEMENTS.wood][]) {
        if (age >= profile.ageMin && age <= profile.ageMax) return key;
    }
    // Over 60 → Water is the deepest/oldest element
    if (age > 60) return "water";
    return null;
}

/**
 * Extract patient age from birth history or profile data.
 */
function extractAge(history: Record<string, any>): number | null {
    try {
        const bh = history?.birth_history;
        if (bh?.date_of_birth) {
            const dob = new Date(bh.date_of_birth);
            const diff = Date.now() - dob.getTime();
            return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        }
    } catch (_) { /* ignore */ }
    return null;
}

/**
 * Generate natural language insights based on scores and top element.
 */
function generateInsights(
    scores: ElementScore[],
    dominant: ElementKey | null,
    weakest: ElementKey | null,
    ageEl: ElementKey | null
): { insights: string[]; recommendations: string[] } {
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (!dominant) {
        insights.push("No strong elemental imbalance detected from the available medical history.");
        recommendations.push("Complete all sections of your medical history for a more accurate Five Element analysis.");
        return { insights, recommendations };
    }

    const dom = FIVE_ELEMENTS[dominant];
    const weak = weakest ? FIVE_ELEMENTS[weakest] : null;

    insights.push(
        `Your health signals point most strongly to the ${dom.name} element (${dom.yinOrgan} / ${dom.yangOrgan}).`
    );
    insights.push(
        `The ${dom.name} element governs the ${dom.season} season and relates to ${dom.bodyParts.slice(0, 3).join(", ")}.`
    );
    insights.push(
        `Emotionally, an imbalanced ${dom.name} element can manifest as: ${dom.emotions.negative.slice(0, 3).join(", ")}.`
    );
    if (weak) {
        insights.push(
            `Your ${weak.name} element appears to have fewer associated signals — this may indicate latent deficiency or untapped vitality.`
        );
    }
    if (ageEl && ageEl !== dominant) {
        const ageProfile = FIVE_ELEMENTS[ageEl];
        insights.push(
            `Your current age corresponds to the ${ageProfile.name} element phase (${ageProfile.ageRange} years), governing the ${ageProfile.yinOrgan} / ${ageProfile.yangOrgan}.`
        );
    }

    // Recommendations per dominant element
    const recMap: Record<ElementKey, string[]> = {
        wood: [
            "Incorporate liver-supportive foods: leafy greens, dandelion, turmeric.",
            "Practice movements that stretch tendons and ligaments (yoga, tai chi).",
            "Reduce alcohol and fried foods to ease liver burden.",
            "Cultivate patience and manage frustration through breathwork or journaling.",
        ],
        fire_yin: [
            "Support heart health through omega-3s, berries, and dark chocolate in moderation.",
            "Maintain a regular sleep schedule to support Heart-Mind coherence.",
            "Practice mindfulness to manage over-excitement and stage anxiety.",
            "Avoid excessive stimulants (caffeine, screens before bed).",
        ],
        fire_yang: [
            "Support thyroid/triple warmer through iodine-rich foods and stress management.",
            "Balance temperature regulation with warm, nourishing soups in cooler months.",
            "Regular chest-opening exercises (swimming, yoga backbends) for pericardium health.",
            "Cultivate compassion and avoid emotional extremes.",
        ],
        earth: [
            "Support spleen/pancreas with warm, cooked, easy-to-digest foods.",
            "Minimise cold raw foods and refined sugars that strain the spleen.",
            "Address worry and overthinking through grounding practices (walking barefoot, gardening).",
            "Monitor blood sugar levels and maintain regular meal times.",
        ],
        metal: [
            "Prioritise respiratory health through diaphragmatic breathing exercises.",
            "Support immune function with zinc, vitamin C, and elderberry.",
            "Process grief and sadness consciously — these emotions burden the lungs.",
            "Maintain skin health with adequate hydration and omega fatty acids.",
        ],
        water: [
            "Nourish kidneys with adequate hydration, black sesame, and bone broth.",
            "Protect the lower back and bones with strength training and adequate calcium/D3.",
            "Address fear through courage-building practices — small daily challenges.",
            "Ensure adequate sleep (kidneys regenerate at night).",
        ],
    };

    recommendations.push(...(recMap[dominant] || []));

    return { insights, recommendations };
}

/** ------- Main hook ------- */
export function useFiveElementDiagnosis(history: Record<string, any> | null | undefined): DiagnosticResult {
    return useMemo(() => {
        const empty: DiagnosticResult = {
            scores: [],
            dominantElement: null,
            weakestElement: null,
            ageElement: null,
            insights: ["Fill in your medical history to receive your Five Element analysis."],
            recommendations: [],
            emotionalProfile: { positive: [], negative: [] },
            totalSignals: 0,
        };

        if (!history || Object.keys(history).length === 0) return empty;

        const tokens = flattenHistory(history);
        if (tokens.length === 0) return empty;

        const elementKeys: ElementKey[] = ["wood", "fire_yin", "fire_yang", "earth", "metal", "water"];
        const scores: ElementScore[] = elementKeys.map((key) => {
            const { score, matched } = scoreElement(tokens, key);
            const profile = FIVE_ELEMENTS[key];
            return {
                element: key,
                score,
                matchedKeywords: matched,
                affectedOrgans: matched
                    .filter((m) => [profile.yinOrgan, profile.yangOrgan].some((o) => o.toLowerCase().includes(m)))
                    .slice(0, 3),
            };
        });

        scores.sort((a, b) => b.score - a.score);

        const totalSignals = scores.reduce((acc, s) => acc + s.matchedKeywords.length, 0);
        const dominant = scores[0]?.score > 0 ? scores[0].element : null;
        const weakest = scores[scores.length - 1]?.element || null;

        const age = extractAge(history);
        const ageElement = getAgeElement(age);

        const { insights, recommendations } = generateInsights(scores, dominant, weakest, ageElement);

        const domProfile = dominant ? FIVE_ELEMENTS[dominant] : null;

        return {
            scores,
            dominantElement: dominant,
            weakestElement: weakest,
            ageElement,
            insights,
            recommendations,
            emotionalProfile: domProfile
                ? domProfile.emotions
                : { positive: [], negative: [] },
            totalSignals,
        };
    }, [history]);
}
