/**
 * Five Element Chart — Traditional Chinese Medicine (TCM)
 * Source: Scanned chart image provided by user (Fig. 1)
 *
 * This cluster map is used by useFiveElementDiagnosis.ts to analyse
 * the patient's medical history JSON and detect elemental imbalances.
 */

export type ElementKey = "wood" | "fire_yin" | "fire_yang" | "earth" | "metal" | "water";

export interface ElementProfile {
    name: string;
    emoji: string;
    color: string;       // Tailwind / hex for charts
    gradientFrom: string;
    gradientTo: string;
    yinOrgan: string;
    yangOrgan: string;
    season: string;
    ageRange: string;
    ageMin: number;
    ageMax: number;
    direction: string;
    bodyParts: string[];
    opening: string;     // sensory orifice
    emotions: { positive: string[]; negative: string[] };
    taste: string;
    colour: string;      // associated colour
    sound: string;
    smell: string;
    sense: string;
    bodyFluids: string;
    symptoms: string[];
    relatedEndocrines: string[];
    conditionKeywords: string[];   // mapped from medical history fields
    bodySystemKeywords: string[];  // linked body systems in app
}

export const FIVE_ELEMENTS: Record<ElementKey, ElementProfile> = {
    wood: {
        name: "Wood",
        emoji: "🌿",
        color: "#22c55e",
        gradientFrom: "#bbf7d0",
        gradientTo: "#16a34a",
        yinOrgan: "Liver",
        yangOrgan: "Gallbladder",
        season: "Spring",
        ageRange: "1–10",
        ageMin: 1,
        ageMax: 10,
        direction: "East & South-East",
        bodyParts: ["Muscles", "Ligaments", "Tendons", "Legs", "Side of body", "Groin", "Diaphragm"],
        opening: "Eyes",
        emotions: {
            positive: ["Enduring", "Patient", "Creative", "Assertive"],
            negative: ["Frustrated", "Angry", "Impatient", "Irritable"],
        },
        taste: "Sour",
        colour: "Green",
        sound: "Loud / Shouting",
        smell: "Musk / Rancid",
        sense: "Sight",
        bodyFluids: "Tears",
        symptoms: ["Flatulence", "Nail problems", "Hand tremors", "Depression", "Eye disorders", "Tendon issues", "Muscle cramps"],
        relatedEndocrines: ["Adrenals", "Thyroid"],
        conditionKeywords: [
            "liver", "hepatitis", "cirrhosis", "gallbladder", "gallstones",
            "muscle", "tendon", "ligament", "eye", "vision", "anger", "depression",
            "migraine", "hypertension",
        ],
        bodySystemKeywords: ["musculoskeletal", "eyes", "liver"],
    },

    fire_yin: {
        name: "Fire (Heart)",
        emoji: "🔥",
        color: "#ef4444",
        gradientFrom: "#fecaca",
        gradientTo: "#b91c1c",
        yinOrgan: "Heart",
        yangOrgan: "Small Intestine",
        season: "Summer",
        ageRange: "11–20",
        ageMin: 11,
        ageMax: 20,
        direction: "South",
        bodyParts: ["Circulatory system", "Arm pits", "Inner arms", "Heart", "Tongue"],
        opening: "Tongue",
        emotions: {
            positive: ["Self-confidence", "Joy", "Enthusiasm", "Clarity"],
            negative: ["Stage fright", "Excitable", "Emotional", "Anxiety", "Over-excitement"],
        },
        taste: "Bitter",
        colour: "Red",
        sound: "Laughter",
        smell: "Burnt / Scorched",
        sense: "Touch",
        bodyFluids: "Sweat",
        symptoms: ["Palpitations", "Complexion issues", "Speech problems", "Insomnia", "Heart irregularities"],
        relatedEndocrines: ["Pituitary", "Pineal"],
        conditionKeywords: [
            "heart", "cardiac", "arrhythmia", "palpitation", "hypertension",
            "cardiovascular", "small intestine", "insomnia", "anxiety", "tongue",
            "coronary", "chest pain", "myocardial",
        ],
        bodySystemKeywords: ["cardiovascular", "heart"],
    },

    fire_yang: {
        name: "Fire (Triple Warmer)",
        emoji: "🌡️",
        color: "#f97316",
        gradientFrom: "#fed7aa",
        gradientTo: "#c2410c",
        yinOrgan: "Pericardium",
        yangOrgan: "Triple Warmer / Thyroid",
        season: "Late Summer (warm)",
        ageRange: "21–30",
        ageMin: 21,
        ageMax: 30,
        direction: "South",
        bodyParts: ["Nervous system", "Chest", "Temples", "Outer arms", "Inner arms", "Third finger"],
        opening: "Tongue",
        emotions: {
            positive: ["Love", "Compassion", "Happiness"],
            negative: ["Anxiety", "Hopelessness", "Despair", "Recklessness"],
        },
        taste: "Bitter / Orange",
        colour: "Orange",
        sound: "Laughter / Giggling",
        smell: "Burnt",
        sense: "Consciousness",
        bodyFluids: "Mucus (chest)",
        symptoms: ["Hiccough", "Trembling", "Tongue issues", "Complexion", "Temperature regulation problems"],
        relatedEndocrines: ["Pituitary", "Pineal", "Thyroid"],
        conditionKeywords: [
            "thyroid", "hypothyroid", "hyperthyroid", "pericardium", "nervous system",
            "neurology", "tremor", "chest", "temperature", "circulation",
            "hormonal", "endocrine",
        ],
        bodySystemKeywords: ["neurological", "endocrine"],
    },

    earth: {
        name: "Earth",
        emoji: "🌍",
        color: "#eab308",
        gradientFrom: "#fef9c3",
        gradientTo: "#ca8a04",
        yinOrgan: "Spleen / Pancreas",
        yangOrgan: "Stomach",
        season: "Late Summer",
        ageRange: "31–40",
        ageMin: 31,
        ageMax: 40,
        direction: "Central",
        bodyParts: ["Flesh / Adipose", "Inner legs", "Face", "Groin", "Outer Ribs", "Lips"],
        opening: "Mouth",
        emotions: {
            positive: ["Encouraging", "Sympathetic", "Nurturing", "Grounded"],
            negative: ["Sceptical", "Cynical", "Doubtful", "Worrying", "Over-thinking"],
        },
        taste: "Sweet",
        colour: "Yellow",
        sound: "Singing / Melody",
        smell: "Sweet / Fragrant",
        sense: "Taste",
        bodyFluids: "Saliva",
        symptoms: ["Lip problems", "Belching", "Digestive issues", "Bloating", "Blood sugar issues", "Weight problems"],
        relatedEndocrines: ["Lymph", "Pancreas", "Adrenals"],
        conditionKeywords: [
            "stomach", "spleen", "pancreas", "diabetes", "blood sugar", "digestive",
            "gastritis", "ulcer", "gastrointestinal", "obesity", "weight", "lymph",
            "nausea", "indigestion", "irritable bowel",
        ],
        bodySystemKeywords: ["gastrointestinal", "digestive", "metabolic"],
    },

    metal: {
        name: "Metal",
        emoji: "⚙️",
        color: "#94a3b8",
        gradientFrom: "#e2e8f0",
        gradientTo: "#475569",
        yinOrgan: "Lungs",
        yangOrgan: "Large Intestine",
        season: "Autumn",
        ageRange: "41–50",
        ageMin: 41,
        ageMax: 50,
        direction: "West & North-West",
        bodyParts: ["Skin", "Body hair", "Outer arms", "Chest", "Teeth", "Thumb", "Sinuses"],
        opening: "Nose",
        emotions: {
            positive: ["Positive", "Social", "Enthusiastic", "Motivated"],
            negative: ["Coughing emotionally", "Negative", "Worried", "Depressed", "Grief", "Sadness"],
        },
        taste: "Pungent / Spicy",
        colour: "White / Brown",
        sound: "Sighing / Weeping",
        smell: "Fishy / Rotten",
        sense: "Smell",
        bodyFluids: "Mucous",
        symptoms: ["Coughing", "Body hair issues", "Skin problems", "Sinus issues", "Constipation", "Respiratory"],
        relatedEndocrines: ["Thymus"],
        conditionKeywords: [
            "lung", "asthma", "bronchitis", "pneumonia", "copd", "respiratory",
            "skin", "eczema", "psoriasis", "dermatitis", "large intestine",
            "constipation", "colon", "allergy", "sinusitis", "rhinitis",
            "immune", "thymus", "grief",
        ],
        bodySystemKeywords: ["respiratory", "skin", "immune"],
    },

    water: {
        name: "Water",
        emoji: "💧",
        color: "#3b82f6",
        gradientFrom: "#bfdbfe",
        gradientTo: "#1d4ed8",
        yinOrgan: "Kidney",
        yangOrgan: "Urinary Bladder",
        season: "Winter",
        ageRange: "51–60",
        ageMin: 51,
        ageMax: 60,
        direction: "North",
        bodyParts: ["Bones", "Head hair", "Side of foot", "Inner legs", "Chest", "Neck", "Back / Buttocks", "Back of legs"],
        opening: "Ears",
        emotions: {
            positive: ["Trust", "Courageous", "Determined", "Willpower"],
            negative: ["Selfishness", "Timidity", "Lower back pain", "Fearful", "Will-less"],
        },
        taste: "Salty / Stale",
        colour: "Black / Dark Blue",
        sound: "Moaning / Groaning",
        smell: "Urine",
        sense: "Hearing",
        bodyFluids: "Urine",
        symptoms: ["Hair loss", "Bone issues", "Hearing problems", "Lower back pain", "Urinary issues", "Fear disorders"],
        relatedEndocrines: ["Parathyroid", "Gonads / Genital Organs"],
        conditionKeywords: [
            "kidney", "renal", "bladder", "urinary", "bone", "osteoporosis",
            "arthritis", "hearing", "ear", "hair loss", "alopecia", "back pain",
            "spine", "fear", "reproductive", "adrenal fatigue",
            "infertility", "prostate", "ovarian",
        ],
        bodySystemKeywords: ["urinary", "bones", "reproductive", "ears"],
    },
};

/** All keywords → element map for fast O(1) lookup */
export function buildKeywordIndex(): Map<string, ElementKey> {
    const index = new Map<string, ElementKey>();
    for (const [key, profile] of Object.entries(FIVE_ELEMENTS) as [ElementKey, ElementProfile][]) {
        for (const kw of [...profile.conditionKeywords, ...profile.bodySystemKeywords]) {
            index.set(kw.toLowerCase(), key);
        }
    }
    return index;
}
