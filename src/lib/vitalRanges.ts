export type VitalStatus = "normal" | "attention" | "critical";

interface RangeRule {
  /** Returns status for a raw value string, or null if unparseable */
  classify: (value: string) => VitalStatus | null;
  /** Human readable healthy range */
  normalRange: string;
  /** Numeric extraction for trend comparison */
  numeric: (value: string) => number | null;
}

const num = (v: string) => {
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
};

const band = (n: number, bands: [number, number, VitalStatus][], fallback: VitalStatus): VitalStatus => {
  for (const [min, max, status] of bands) {
    if (n >= min && n <= max) return status;
  }
  return fallback;
};

export const vitalRanges: Record<string, RangeRule> = {
  blood_pressure: {
    normalRange: "90/60 – 120/80 mmHg",
    numeric: (v) => {
      const m = v.match(/^(\d+)\s*\/\s*(\d+)$/);
      return m ? Number(m[1]) : null;
    },
    classify: (v) => {
      const m = v.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!m) return null;
      const sys = Number(m[1]);
      const dia = Number(m[2]);
      if (sys >= 180 || dia >= 120 || sys < 80 || dia < 50) return "critical";
      if (sys >= 140 || dia >= 90 || sys < 90 || dia < 60) return "attention";
      if (sys >= 130 || dia >= 85) return "attention";
      return "normal";
    },
  },
  heart_rate: {
    normalRange: "60 – 100 bpm",
    numeric: num,
    classify: (v) => {
      const n = num(v);
      if (n === null) return null;
      return band(n, [
        [60, 100, "normal"],
        [50, 59, "attention"],
        [101, 120, "attention"],
      ], "critical");
    },
  },
  blood_sugar: {
    normalRange: "70 – 140 mg/dL",
    numeric: num,
    classify: (v) => {
      const n = num(v);
      if (n === null) return null;
      return band(n, [
        [70, 140, "normal"],
        [54, 69, "attention"],
        [141, 200, "attention"],
      ], "critical");
    },
  },
  bmi: {
    normalRange: "18.5 – 24.9 kg/m²",
    numeric: num,
    classify: (v) => {
      const n = num(v);
      if (n === null) return null;
      return band(n, [
        [18.5, 24.9, "normal"],
        [25, 29.9, "attention"],
        [16, 18.49, "attention"],
      ], "critical");
    },
  },
  spo2: {
    normalRange: "95 – 100 %",
    numeric: num,
    classify: (v) => {
      const n = num(v);
      if (n === null) return null;
      return band(n, [
        [95, 100, "normal"],
        [91, 94, "attention"],
      ], "critical");
    },
  },
  temperature: {
    normalRange: "97.0 – 99.0 °F",
    numeric: num,
    classify: (v) => {
      const n = num(v);
      if (n === null) return null;
      return band(n, [
        [97, 99, "normal"],
        [99.1, 100.3, "attention"],
        [95.5, 96.9, "attention"],
      ], "critical");
    },
  },
};

/** Medically classify a reading. Falls back to the manually stored status. */
export function classifyVital(
  vitalType: string,
  value: string,
  fallback: VitalStatus = "normal"
): VitalStatus {
  const rule = vitalRanges[vitalType];
  if (!rule || !value || value === "—") return fallback;
  return rule.classify(value) ?? fallback;
}

export function vitalNormalRange(vitalType: string): string | null {
  return vitalRanges[vitalType]?.normalRange ?? null;
}

export type Trend = "up" | "down" | "flat" | null;

export function vitalTrend(vitalType: string, current: string, previous?: string): Trend {
  const rule = vitalRanges[vitalType];
  if (!rule || !previous) return null;
  const a = rule.numeric(current);
  const b = rule.numeric(previous);
  if (a === null || b === null) return null;
  if (Math.abs(a - b) < 0.0001) return "flat";
  return a > b ? "up" : "down";
}

const weight: Record<VitalStatus, number> = { normal: 100, attention: 55, critical: 15 };

/** Honest 0-100 health score from medically classified readings. */
export function computeHealthScore(
  readings: { vital_type: string; value: string; status?: string }[]
): number {
  if (readings.length === 0) return 0;
  const total = readings.reduce((sum, r) => {
    const status = classifyVital(r.vital_type, r.value, (r.status as VitalStatus) ?? "normal");
    return sum + weight[status];
  }, 0);
  const avg = total / readings.length;
  // Any critical reading caps the score — you cannot be "excellent" with a critical vital
  const hasCritical = readings.some(
    (r) => classifyVital(r.vital_type, r.value, (r.status as VitalStatus) ?? "normal") === "critical"
  );
  const hasAttention = readings.some(
    (r) => classifyVital(r.vital_type, r.value, (r.status as VitalStatus) ?? "normal") === "attention"
  );
  let score = avg;
  if (hasCritical) score = Math.min(score, 45);
  else if (hasAttention) score = Math.min(score, 79);
  // Incomplete data shouldn't read as a perfect bill of health
  const coverage = Math.min(readings.length / 6, 1);
  score = score * (0.7 + 0.3 * coverage);
  return Math.round(Math.max(0, Math.min(100, score)));
}
