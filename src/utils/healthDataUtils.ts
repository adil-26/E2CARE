import { MedicalReport } from "@/hooks/useMedicalReports";

export interface TestValue {
  value: string;
  status: string;
}

export interface ComparisonItem {
  name: string;
  category: string;
  unit: string;
  type: 'test' | 'finding';
  values: (TestValue | null)[];
  change: string; // "rising", "dropping", "stable", "new", "updated", "persistent", "initial"
  percentChange?: string;
  interpretation: string;
  reference_range?: string;
}

export function processReportsForComparison(reports: MedicalReport[]) {
  // 1. Get all completed reports with data, sorted by date (ASC)
  const sortedReports = [...reports]
    .filter(r => r.status === "completed" && r.extracted_data)
    .sort((a, b) => {
      const da = a.report_date || a.created_at;
      const db = b.report_date || b.created_at;
      return new Date(da).getTime() - new Date(db).getTime();
    });

  if (sortedReports.length < 1) return { sortedReports: [], comparisonItems: [], categories: [] };

  // 2. Extract unique tests and findings inventory
  const itemsMap: Record<string, { category: string; unit: string; type: 'test' | 'finding'; reference_range?: string }> = {};
  
  sortedReports.forEach(r => {
    // Extract numeric tests
    const results = r.extracted_data?.test_results || [];
    results.forEach((t: any) => {
      if (!itemsMap[t.test_name]) {
        itemsMap[t.test_name] = {
          category: t.category || "General",
          unit: t.unit || "",
          type: 'test',
          reference_range: t.reference_range || ""
        };
      } else if (!itemsMap[t.test_name].reference_range && t.reference_range) {
        // use the most recent reference range if first one was missing
        itemsMap[t.test_name].reference_range = t.reference_range;
      }
    });

    // Extract qualitative findings
    const findings = r.extracted_data?.findings || [];
    findings.forEach((f: string) => {
      const colonIndex = f.indexOf(':');
      const key = colonIndex > 0 ? f.substring(0, colonIndex).trim() : f.trim();
      
      if (!itemsMap[key]) {
        itemsMap[key] = {
          category: "Findings",
          unit: "",
          type: 'finding'
        };
      }
    });
  });

  // 3. Create items with values and interpretations
  const comparisonItems: ComparisonItem[] = Object.entries(itemsMap).map(([name, info]) => {
    // Get values for each report
    const values = sortedReports.map(r => {
      if (info.type === 'test') {
        const results = r.extracted_data?.test_results || [];
        const match = results.find((t: any) => t.test_name === name);
        return match ? { value: match.value, status: match.status } : null;
      } else {
        const findings = r.extracted_data?.findings || [];
        const match = findings.find((f: string) => f.startsWith(name) || f.includes(name));
        if (!match) return null;
        
        const colonIndex = match.indexOf(':');
        const val = colonIndex > 0 ? match.substring(colonIndex + 1).trim() : match.trim();
        return { value: val, status: 'finding' };
      }
    });

    // Calculate change and interpretation
    let change = "initial";
    let percentChange = undefined;
    let interpretation = "No previous data for comparison.";
    
    if (info.type === 'test') {
      const validResults = values.filter(v => v && v.value && !isNaN(parseFloat(v.value)));
      const lastTwo = validResults.slice(-2);
      
      if (lastTwo.length === 2) {
        const v1 = parseFloat(lastTwo[0]!.value);
        const v2 = parseFloat(lastTwo[1]!.value);
        const s2 = lastTwo[1]!.status;
        const diff = v2 - v1;
        const percent = v1 !== 0 ? ((diff / v1) * 100).toFixed(1) : "0";
        percentChange = percent;
        
        if (diff > 0) {
          change = "rising";
          interpretation = s2 === 'normal' ? "Value increased but remains in normal range." : "Level is rising; monitor this closely with your doctor.";
        } else if (diff < 0) {
          change = "dropping";
          interpretation = s2 === 'normal' ? "Level decreased towards a healthier range." : "Value is dropping; check if this matches treatment goals.";
        } else {
          change = "stable";
          interpretation = s2 === 'normal' ? "Maintaining a healthy, stable level." : "Value is stable but remains outside normal limits.";
        }
      } else if (lastTwo.length === 1) {
        change = "initial";
        interpretation = "Baseline established. We will track changes from here.";
      }
    } else {
      const validFindings = values.filter(v => v);
      const lastTwo = validFindings.slice(-2);
      if (lastTwo.length === 2) {
        if (lastTwo[0]!.value === lastTwo[1]!.value) {
          change = "persistent";
          interpretation = "No change in this observation since the last report.";
        } else {
          change = "updated";
          interpretation = "Condition or observation has evolved. See details.";
        }
      } else if (lastTwo.length === 1) {
        change = "new";
        interpretation = "New observation noted in the latest procedure.";
      }
    }

    return {
      name,
      category: info.category,
      unit: info.unit,
      type: info.type,
      values,
      change,
      percentChange,
      interpretation,
      reference_range: (info as any).reference_range
    };
  });

  // 4. Get unique categories
  const categories = Array.from(new Set(comparisonItems.map(i => i.category)));

  return { sortedReports, comparisonItems, categories };
}

export const STATUS_COLORS: Record<string, string> = {
  normal: "#22c55e",
  high: "#ef4444",
  low: "#ef4444",
  critical: "#dc2626",
  unknown: "#94a3b8",
};

export const STATUS_LABELS: Record<string, string> = {
  normal: "Normal", high: "High", low: "Low", critical: "Critical", unknown: "Unknown",
};

export function getAvailableTests(reports: MedicalReport[]): string[] {
  const testNames = new Set<string>();
  reports.forEach((r) => {
    const results = r.extracted_data?.test_results || [];
    results.forEach((t: any) => {
      if (t.test_name && t.value && !isNaN(parseFloat(t.value))) {
        testNames.add(t.test_name);
      }
    });
  });
  return Array.from(testNames).sort();
}

export function buildTrendData(reports: MedicalReport[], testName: string) {
  const dataPoints: { date: string; value: number; refMin?: number; refMax?: number; status: string; fill: string }[] = [];
  const sorted = [...reports].sort((a, b) => {
    const da = a.report_date || a.created_at;
    const db = b.report_date || b.created_at;
    return new Date(da).getTime() - new Date(db).getTime();
  });

  sorted.forEach((r) => {
    const results = r.extracted_data?.test_results || [];
    const match = results.find((t: any) => t.test_name === testName);
    if (match && !isNaN(parseFloat(match.value))) {
      const date = r.report_date || r.created_at.split("T")[0];
      let refMin: number | undefined;
      let refMax: number | undefined;
      if (match.reference_range) {
        const rangeMatch = match.reference_range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
        if (rangeMatch) { refMin = parseFloat(rangeMatch[1]); refMax = parseFloat(rangeMatch[2]); }
      }
      const status = match.status || "unknown";
      dataPoints.push({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
        value: parseFloat(match.value),
        refMin, refMax, status,
        fill: STATUS_COLORS[status] || STATUS_COLORS.unknown,
      });
    }
  });
  return dataPoints;
}

export function getLatestTestValue(reports: MedicalReport[], testName: string) {
  const data = buildTrendData(reports, testName);
  return data.length > 0 ? data[data.length - 1] : null;
}
