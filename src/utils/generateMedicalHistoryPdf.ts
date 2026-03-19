import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { generateClinicalNarrative } from "./clinicalNarrative";

const COLORS = {
  primary: [37, 99, 235] as [number, number, number],
  primaryLight: [239, 246, 255] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  successBg: [240, 253, 244] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  dangerBg: [254, 242, 242] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  warningBg: [254, 252, 232] as [number, number, number],
  dark: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  teal: [20, 184, 166] as [number, number, number],
  tealBg: [240, 253, 250] as [number, number, number],
  purple: [139, 92, 246] as [number, number, number],
  purpleBg: [245, 243, 255] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  orangeBg: [255, 247, 237] as [number, number, number],
  rose: [244, 63, 94] as [number, number, number],
  roseBg: [255, 241, 242] as [number, number, number],
};

interface MedicalHistoryForPdf {
  birth_history: Record<string, any>;
  childhood_illnesses: Record<string, any>;
  medical_conditions: Record<string, any>;
  family_history: Record<string, any>;
  gender_health: Record<string, any>;
  surgeries: Record<string, any>;
  allergies: Record<string, any>;
  body_systems: Record<string, any>;
  lifestyle: Record<string, any>;
  is_complete: boolean;
  
  // New Enhanced Sections
  analysis?: {
    scores: { element: string; score: number; matchedKeywords: string[] }[];
    dominantElement: string | null;
    insights: string[];
    recommendations: string[];
  };
  assessment?: {
    totalScore: number;
    categoryScores: Record<string, number>;
  };
  clinical?: {
    vitals: any[];
    medications: any[];
  };
  acupressure?: {
    caseData: any;
    latestVisit: any;
    symptoms: any[];
    formulas: any[];
  };
}

const STEPS = [
  { key: "birth_history", label: "Birth History", icon: ">", color: COLORS.primary, bgColor: COLORS.primaryLight },
  { key: "childhood_illnesses", label: "Childhood Illnesses", icon: ">", color: COLORS.teal, bgColor: COLORS.tealBg },
  { key: "medical_conditions", label: "Medical Conditions", icon: ">", color: COLORS.danger, bgColor: COLORS.dangerBg },
  { key: "family_history", label: "Family History", icon: ">", color: COLORS.purple, bgColor: COLORS.purpleBg },
  { key: "gender_health", label: "Gender Health", icon: ">", color: COLORS.rose, bgColor: COLORS.roseBg },
  { key: "surgeries", label: "Surgeries", icon: ">", color: COLORS.orange, bgColor: COLORS.orangeBg },
  { key: "allergies", label: "Allergies", icon: ">", color: COLORS.warning, bgColor: COLORS.warningBg },
  { key: "body_systems", label: "Body Systems", icon: ">", color: COLORS.danger, bgColor: COLORS.dangerBg },
  { key: "lifestyle", label: "Lifestyle", icon: ">", color: COLORS.success, bgColor: COLORS.successBg },
  { key: "analysis", label: "Elemental Analysis", icon: ">", color: COLORS.purple, bgColor: COLORS.purpleBg },
  { key: "clinical", label: "Clinical Dashboard", icon: ">", color: COLORS.primary, bgColor: COLORS.primaryLight },
  { key: "acupressure", label: "Treatment Progress", icon: ">", color: COLORS.teal, bgColor: COLORS.tealBg },
];

const GLOBAL_MARGIN = 15;

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: any): string {
  if (value === null || value === undefined || value === "") return "-";
  
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value.map(v => typeof v === 'object' ? formatValue(v) : String(v)).join(", ");
  }
  
  if (typeof value === "boolean") return value ? "Yes" : "No";
  
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([_, v]) => v !== null && v !== "" && v !== undefined);
    if (entries.length === 0) return "-";
    
    return entries.map(([k, v]) => {
      const label = k.length < 4 ? k.toUpperCase() : k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      let displayVal = "";
      
      if (typeof v === 'object' && v !== null) {
        displayVal = Object.entries(v)
          .filter(([_, subV]) => subV !== null && subV !== "")
          .map(([subK, subV]) => `${subK}: ${subV}`)
          .join(", ");
        if (!displayVal) displayVal = "-";
      } else {
        displayVal = String(v);
      }
      
      return `${label}: ${displayVal}`;
    }).join(" | ");
  }
  
  return String(value).replace(/_/g, " ");
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(15, pageH - 15, pageW - 15, pageH - 15);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text("Generated by My Health Compass | Confidential Medical Document", 15, pageH - 10);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageW - 15, pageH - 10, { align: "right" });
  doc.text(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), pageW / 2, pageH - 10, { align: "center" });
}

function checkPageBreak(doc: jsPDF, y: number, needed: number = 30): number {
  if (y + needed > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    return 20;
  }
  return y;
}

function addSectionHeader(doc: jsPDF, y: number, step: typeof STEPS[number], pageW: number): number {
  // NOTE: This helper is legacy/backup. Main loop now handles headers directly.
  // We keep it just in case individual renderers call it, but we style it cleanly.
  y = checkPageBreak(doc, y, 20);

  const margin = 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text(`  ${step.icon}  ${step.label}`, margin, y + 5);

  doc.setDrawColor(...COLORS.primaryLight);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 7, pageW - margin, y + 7);

  return y + 12;
}

function addKeyValueTable(doc: jsPDF, y: number, data: [string, string][]): number {
  if (data.length === 0) return y;

  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    head: [["Field", "Value"]],
    body: data,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: { top: 2, bottom: 2, left: 4, right: 4 },
      textColor: COLORS.dark,
      lineColor: COLORS.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: COLORS.bg,
      textColor: COLORS.muted,
      fontStyle: "bold",
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold", textColor: COLORS.muted },
      1: { cellWidth: "auto" },
    },
  });
  return (doc as any).lastAutoTable.finalY + 6;
}

function addChipList(doc: jsPDF, y: number, label: string, items: string[], color: [number, number, number], bgColor: [number, number, number]): number {
  if (items.length === 0) return y;
  const margin = 15;
  const contentW = doc.internal.pageSize.getWidth() - margin * 2;

  y = checkPageBreak(doc, y, 18);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(label, margin + 2, y);
  y += 5;

  // Draw chips
  let x = margin + 2;
  const chipH = 6;
  const chipPadding = 3;
  const maxX = margin + contentW - 2;

  items.forEach((item) => {
    const textW = doc.getTextWidth(item) + chipPadding * 2;
    if (x + textW > maxX) {
      x = margin + 2;
      y += chipH + 2;
      y = checkPageBreak(doc, y, chipH + 4);
    }
    doc.setFillColor(...bgColor);
    doc.roundedRect(x, y - 3.5, textW, chipH, 1.5, 1.5, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...color);
    doc.text(item, x + chipPadding, y + 0.5);
    x += textW + 2;
  });

  return y + chipH + 4;
}

// === Section Renderers ===

function renderClinicalNarrativeSection(doc: jsPDF, y: number, history: MedicalHistoryForPdf, pageW: number): number {
  const sentences = generateClinicalNarrative(history);
  if (sentences.length === 0) return y;

  const margin = GLOBAL_MARGIN;
  const contentW = pageW - margin * 2;

  y = checkPageBreak(doc, y, 20);
  
  doc.setFillColor(...COLORS.primaryLight);
  doc.roundedRect(margin, y, contentW, sentences.length * 5 + 10, 2, 2, "F");
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Clinical Narrative & Executive Summary", margin + 4, y + 6);
  
  y += 12;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.dark);
  
  sentences.forEach((sentence) => {
    const lines = doc.splitTextToSize(`- ${sentence}`, contentW - 8);
    doc.text(lines, margin + 6, y);
    y += lines.length * 4;
    y = checkPageBreak(doc, y, 10);
  });

  return y + 5;
}

function renderClinicalAlerts(doc: jsPDF, y: number, history: MedicalHistoryForPdf, pageW: number): number {
  const contentW = pageW - GLOBAL_MARGIN * 2;
  
  const activeConditions = (history.medical_conditions?.conditions || []).filter(
    (c: any) => c.status?.toLowerCase() === "active" || c.status?.toLowerCase() === "chronic"
  );
  const severeAllergies = (history.allergies?.drug_allergies || []).length > 0;
  
  if (activeConditions.length === 0 && !severeAllergies) return y;

  y = checkPageBreak(doc, y, 30);
  
  // Alert Box Container
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(252, 165, 165); // red-300
  doc.roundedRect(GLOBAL_MARGIN, y, contentW, activeConditions.length * 6 + 15, 2, 2, "FD");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28); // red-700
  doc.text("Clinical Overview: Active Concerns", GLOBAL_MARGIN + 5, y + 6);
  
  y += 12;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  
  activeConditions.forEach((c: any) => {
    doc.text(`- ${c.name} (${c.severity || 'Moderate'}) - ${c.status}`, GLOBAL_MARGIN + 8, y);
    y += 5;
  });
  
  if (severeAllergies) {
    doc.setFont("helvetica", "bold");
    doc.text(`- DRUG ALLERGIES REPORTED`, GLOBAL_MARGIN + 8, y);
    y += 5;
  }
  
  return y + 5;
}

function renderBirthHistory(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[0];
  y = addSectionHeader(doc, y, step, pageW);

  const skipKeys = ["notes"];
  const rows: [string, string][] = Object.entries(data)
    .filter(([k]) => !skipKeys.includes(k))
    .map(([k, v]) => [formatKey(k), formatValue(v)]);

  y = addKeyValueTable(doc, y, rows);

  if (data.notes) {
    y = checkPageBreak(doc, y, 15);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(`Notes: ${data.notes}`, pageW - 40);
    doc.text(lines, 19, y);
    y += lines.length * 3.5 + 4;
  }
  return y;
}

function renderChildhoodIllnesses(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[1];
  y = addSectionHeader(doc, y, step, pageW);

  if (data.illnesses?.length) {
    y = addChipList(doc, y, "Illnesses", data.illnesses, COLORS.danger, COLORS.dangerBg);
  }
  if (data.other_illnesses) {
    y = checkPageBreak(doc, y, 8);
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.dark);
    doc.text(`Other: ${data.other_illnesses}`, 19, y);
    y += 6;
  }
  if (data.vaccines?.length) {
    y = addChipList(doc, y, "Vaccinations Received", data.vaccines, COLORS.success, COLORS.successBg);
  }
  if (data.developmental_notes) {
    y = checkPageBreak(doc, y, 12);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(`Developmental Notes: ${data.developmental_notes}`, pageW - 40);
    doc.text(lines, 19, y);
    y += lines.length * 3.5 + 4;
  }
  return y;
}
function renderMedicalConditions(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[2];
  y = addSectionHeader(doc, y, step, pageW);

  const conditions: any[] = data.conditions || [];
  if (conditions.length === 0) {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text("No conditions recorded", 19, y);
    return y + 8;
  }

  // Draw conditions as "Cards" or enhanced rows
  conditions.forEach((c) => {
    y = checkPageBreak(doc, y, 25);
    
    const isHighRisk = c.status?.toLowerCase() === "active" || c.status?.toLowerCase() === "chronic";
    const statusColor = isHighRisk ? COLORS.danger : COLORS.success;
    const statusBg = isHighRisk ? COLORS.dangerBg : COLORS.successBg;

    // Condition Header line
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(c.name || "Unnamed Condition", 19, y);
    
    // Status Badge
    const statusText = (c.status || "Unknown").toUpperCase();
    const badgeW = doc.getTextWidth(statusText) + 4;
    doc.setFillColor(...statusBg);
    doc.roundedRect(pageW - GLOBAL_MARGIN - badgeW, y - 4, badgeW, 5, 1, 1, "F");
    doc.setFontSize(6.5);
    doc.setTextColor(...statusColor);
    doc.text(statusText, pageW - GLOBAL_MARGIN - badgeW/2, y - 0.5, { align: "center" });

    y += 5;
    
    // Details
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    
    let details = [];
    if (c.severity) details.push(`Severity: ${c.severity}`);
    if (c.diagnosed_year) details.push(`Since: ${c.diagnosed_year}`);
    if (c.doctor) details.push(`Doctor: ${c.doctor}`);
    
    doc.text(details.join("  |  "), 19, y);
    y += 4.5;
    
    if (c.treatment) {
      doc.setTextColor(...COLORS.dark);
      doc.text(`Treatment: ${c.treatment}`, 19, y);
      y += 4.5;
    }
    
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.1);
    doc.line(19, y, pageW - GLOBAL_MARGIN, y);
    y += 6;
  });
  if (data.notes) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(`Notes: ${data.notes}`, pageW - 40);
    doc.text(lines, 19, y);
    y += lines.length * 3.5 + 4;
  }
  return y;
}

function renderFamilyHistory(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[3];
  y = addSectionHeader(doc, y, step, pageW);

  const condByRelative: Record<string, string[]> = data.conditions_by_relative || {};
  const relatives = Object.entries(condByRelative).filter(([, v]) => v.length > 0);

  if (relatives.length > 0) {
    const tableBody = relatives.map(([rel, conds]) => [rel, conds.join(", ")]);

    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      head: [["Relative", "Conditions"]],
      body: tableBody,
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
        textColor: COLORS.dark,
        lineColor: COLORS.border,
        lineWidth: 0.2,
      },
      headStyles: { fillColor: COLORS.purpleBg, textColor: COLORS.purple, fontStyle: "bold", fontSize: 7 },
      columnStyles: { 0: { cellWidth: 50, fontStyle: "bold" } },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // Additional fields
  const extraRows: [string, string][] = [];
  if (data.father_age) extraRows.push(["Father's Age", data.father_age]);
  if (data.mother_age) extraRows.push(["Mother's Age", data.mother_age]);
  if (data.consanguinity) extraRows.push(["Consanguinity", formatValue(data.consanguinity)]);
  if (data.cause_of_death) extraRows.push(["Cause of Death", data.cause_of_death]);

  if (extraRows.length > 0) {
    y = addKeyValueTable(doc, y, extraRows);
  }
  return y;
}

function renderGenderHealth(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[4];
  y = addSectionHeader(doc, y, step, pageW);

  const skipKeys = ["notes", "gyn_conditions"];
  const rows: [string, string][] = Object.entries(data)
    .filter(([k]) => !skipKeys.includes(k))
    .map(([k, v]) => [formatKey(k), formatValue(v)]);

  if (rows.length > 0) {
    y = addKeyValueTable(doc, y, rows);
  }

  if (data.gyn_conditions?.length) {
    y = addChipList(doc, y, "Gynecological Conditions", data.gyn_conditions, COLORS.rose, COLORS.roseBg);
  }

  if (data.notes) {
    y = checkPageBreak(doc, y, 12);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(`Notes: ${data.notes}`, pageW - 40);
    doc.text(lines, 19, y);
    y += lines.length * 3.5 + 4;
  }
  return y;
}

function renderSurgeries(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[5];
  y = addSectionHeader(doc, y, step, pageW);

  const surgeries: any[] = data.surgeries || [];
  if (surgeries.length > 0) {
    const body = surgeries.map((s) => [
      s.name || "-", s.year || "-", s.hospital || "-", s.reason || "-", s.complications || "None",
    ]);
    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      head: [["Surgery", "Year", "Hospital", "Reason", "Complications"]],
      body,
      theme: "plain",
      styles: { fontSize: 7.5, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }, textColor: COLORS.dark, lineColor: COLORS.border, lineWidth: 0.2 },
      headStyles: { fillColor: COLORS.orangeBg, textColor: COLORS.orange, fontStyle: "bold", fontSize: 7 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  const hosps: any[] = data.hospitalizations || [];
  if (hosps.length > 0) {
    y = checkPageBreak(doc, y, 15);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text("Hospitalizations", 17, y);
    y += 4;

    const body = hosps.map((h) => [h.reason || "-", h.year || "-", h.duration || "-", h.hospital || "-"]);
    autoTable(doc, {
      startY: y,
      margin: { left: 15, right: 15 },
      head: [["Reason", "Year", "Duration", "Hospital"]],
      body,
      theme: "plain",
      styles: { fontSize: 7.5, cellPadding: { top: 2, bottom: 2, left: 3, right: 3 }, textColor: COLORS.dark, lineColor: COLORS.border, lineWidth: 0.2 },
      headStyles: { fillColor: COLORS.bg, textColor: COLORS.muted, fontStyle: "bold", fontSize: 7 },
    });
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  if (surgeries.length === 0 && hosps.length === 0) {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text("No surgeries or hospitalizations recorded", 19, y);
    y += 8;
  }

  if (data.notes) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(`Notes: ${data.notes}`, pageW - 40);
    doc.text(lines, 19, y);
    y += lines.length * 3.5 + 4;
  }
  return y;
}

function renderAllergies(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[6];
  y = addSectionHeader(doc, y, step, pageW);

  if (data.drug_allergies?.length) {
    y = addChipList(doc, y, "Drug Allergies", data.drug_allergies, COLORS.danger, COLORS.dangerBg);
  }
  if (data.other_drug_allergies) {
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.dark);
    doc.text(`Other Drug Allergies: ${data.other_drug_allergies}`, 19, y);
    y += 6;
  }
  if (data.food_allergies?.length) {
    y = addChipList(doc, y, "Food Allergies", data.food_allergies, COLORS.orange, COLORS.orangeBg);
  }
  if (data.environmental_allergies?.length) {
    y = addChipList(doc, y, "Environmental Allergies", data.environmental_allergies, COLORS.teal, COLORS.tealBg);
  }

  const extraRows: [string, string][] = [];
  if (data.worst_reaction) extraRows.push(["Worst Reaction", formatValue(data.worst_reaction)]);
  if (data.epipen) extraRows.push(["Carries EpiPen", formatValue(data.epipen)]);
  if (extraRows.length > 0) {
    y = addKeyValueTable(doc, y, extraRows);
  }

  if (data.notes) {
    y = checkPageBreak(doc, y, 12);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(`Notes: ${data.notes}`, pageW - 40);
    doc.text(lines, 19, y);
    y += lines.length * 3.5 + 4;
  }
  return y;
}

function renderBodySystems(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[7];
  y = addSectionHeader(doc, y, step, pageW);

  const systemLabels: Record<string, string> = {
    ent: "ENT, Oral & Dental",
    eyes: "Eyes",
    cardio: "Heart & Lungs",
    gi: "Digestive",
    urinary: "Urinary",
    skin: "Skin & Hair",
    neuro: "Nervous System",
    musculo: "Bones & Joints",
  };

  const filledSystems = Object.entries(data).filter(
    ([k, v]) => typeof v === "object" && v !== null && Object.keys(v).length > 0
  );

  if (filledSystems.length === 0) {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text("No body system data recorded", 19, y);
    return y + 8;
  }

  filledSystems.forEach(([sysKey, sysData]) => {
    y = checkPageBreak(doc, y, 20);

    // Sub-header for each body system
    const label = systemLabels[sysKey] || formatKey(sysKey);
    doc.setFillColor(...COLORS.bg);
    doc.roundedRect(17, y - 1, pageW - 34, 6.5, 1, 1, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(label, 20, y + 3.5);
    y += 9;

    const skipKeys = ["notes", "teeth_data", "stool_color", "urine_color"];
    const entries = Object.entries(sysData as Record<string, any>)
      .filter(([k, v]) => !skipKeys.includes(k) && v !== "" && v !== null && v !== undefined && v !== false && !(Array.isArray(v) && v.length === 0));

    if (entries.length > 0) {
      // Use chips for boolean flags and arrays of strings (conditions)
      const flagEntries = entries.filter(([_, v]) => typeof v === "boolean" && v === true);
      const arrayEntries = entries.filter(([_, v]) => Array.isArray(v) && v.length > 0 && typeof v[0] === 'string');
      const descriptiveEntries = entries.filter(([_, v]) => 
        (typeof v !== "boolean" && !Array.isArray(v)) || 
        (typeof v === "boolean" && v === false)
      );

      const allChips = [
        ...flagEntries.map(([k]) => formatKey(k)),
        ...arrayEntries.flatMap(([_, v]) => v as string[])
      ];

      if (allChips.length > 0) {
        y = addChipList(doc, y, "Symptoms & Findings", allChips, COLORS.primary, COLORS.primaryLight);
      }

      if (descriptiveEntries.length > 0) {
        const rows: [string, string][] = descriptiveEntries.map(([k, v]) => [formatKey(k), formatValue(v)]);
        y = addKeyValueTable(doc, y, rows);
      }
    }

    if ((sysData as any).notes) {
      y = checkPageBreak(doc, y, 10);
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...COLORS.muted);
      const lines = doc.splitTextToSize(`Notes: ${(sysData as any).notes}`, pageW - 44);
      doc.text(lines, 21, y);
      y += lines.length * 3.5 + 3;
    }
  });

  return y;
}

function renderFiveElementAnalysis(doc: jsPDF, y: number, analysis: any, pageW: number): number {
  if (!analysis) return y;
  const step = STEPS.find(s => s.key === "analysis")!;
  y = addSectionHeader(doc, y, step, pageW);
  const margin = GLOBAL_MARGIN;
  const contentW = pageW - margin * 2;

  // Render bars for each element
  const scores = analysis.scores || [];
  scores.forEach((s: any) => {
    y = checkPageBreak(doc, y, 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(s.element.replace("_", " ").toUpperCase(), margin, y + 4);
    
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin + 40, y + 1.5, contentW - 60, 4, 1, 1, "F");
    
    const fillW = Math.max(((contentW - 60) * s.score) / 100, 2);
    doc.setFillColor(...(s.score > 60 ? COLORS.primary : COLORS.muted));
    doc.roundedRect(margin + 40, y + 1.5, fillW, 4, 1, 1, "F");
    
    doc.text(`${s.score}%`, margin + contentW - 15, y + 4, { align: "right" });
    
    if (s.matchedKeywords && s.matchedKeywords.length > 0) {
      doc.setFontSize(6);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...COLORS.muted);
      doc.text(`Keywords: ${s.matchedKeywords.slice(0, 5).join(", ")}`, margin + 40, y + 8);
      y += 10;
    } else {
      y += 7;
    }
  });

  if (analysis.insights && analysis.insights.length > 0) {
    y = checkPageBreak(doc, y, 20);
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("Clinical Insights", margin, y);
    y += 5;
    
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    analysis.insights.forEach((insight: string) => {
      const lines = doc.splitTextToSize(`- ${insight}`, contentW - 5);
      doc.text(lines, margin + 2, y);
      y += lines.length * 4;
      y = checkPageBreak(doc, y, 10);
    });
  }

  return y + 5;
}

function renderClinicalDashboard(doc: jsPDF, y: number, clinical: any, pageW: number): number {
  if (!clinical) return y;
  const step = STEPS.find(s => s.key === "clinical")!;
  y = addSectionHeader(doc, y, step, pageW);
  const margin = GLOBAL_MARGIN;

  if (clinical.vitals && clinical.vitals.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Vital Signs", margin + 2, y + 2);
    y += 5;

    const body = clinical.vitals.map((v: any) => [
      v.vital_type.replace(/_/g, " ").toUpperCase(),
      `${v.value} ${v.unit || ""}`,
      new Date(v.recorded_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      v.status || "Normal"
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Vital", "Value", "Date", "Status"]],
      body,
      theme: "striped",
      styles: { fontSize: 7.5, cellPadding: 2 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (clinical.medications && clinical.medications.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Current Medications", margin + 2, y + 2);
    y += 5;

    const body = clinical.medications.map((m: any) => [
      m.name,
      m.dosage,
      m.frequency,
      m.notes || "-"
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Medicine", "Dosage", "Freq", "Notes"]],
      body,
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 2 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  return y;
}

function renderAcupressureProtocol(doc: jsPDF, y: number, acupressure: any, pageW: number): number {
  if (!acupressure) return y;
  const step = STEPS.find(s => s.key === "acupressure")!;
  y = addSectionHeader(doc, y, step, pageW);
  const margin = GLOBAL_MARGIN;
  const contentW = pageW - margin * 2;

  if (acupressure.symptoms && acupressure.symptoms.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Symptom Progress", margin + 2, y + 2);
    y += 6;

    acupressure.symptoms.forEach((s: any) => {
      y = checkPageBreak(doc, y, 8);
      doc.setFontSize(8);
      doc.text(`${s.symptom_name}: ${s.relief_percentage}% relief`, margin + 5, y);
      y += 5;
    });
    y += 4;
  }

  if (acupressure.formulas && acupressure.formulas.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Treatment Points", margin + 2, y + 2);
    y += 5;

    const body = acupressure.formulas.map((f: any) => [
      f.body_part,
      f.joint || "-",
      f.elements ? `S: ${f.elements.sedate.join(",")} | T: ${f.elements.tonify.join(",")}` : "-",
      f.color_applied || "-"
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Part", "Joint", "Elements", "Color"]],
      body,
      theme: "plain",
      styles: { fontSize: 7, cellPadding: 2, lineColor: COLORS.border, lineWidth: 0.1 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  return y;
}

function renderLifestyle(doc: jsPDF, y: number, data: Record<string, any>, pageW: number): number {
  const step = STEPS[8];
  y = addSectionHeader(doc, y, step, pageW);

  const skipKeys = ["notes"];
  const rows: [string, string][] = Object.entries(data)
    .filter(([k, v]) => !skipKeys.includes(k) && v !== "" && v !== null && v !== undefined)
    .map(([k, v]) => [formatKey(k), formatValue(v)]);

  if (rows.length > 0) {
    y = addKeyValueTable(doc, y, rows);
  }

  if (data.notes) {
    y = checkPageBreak(doc, y, 12);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(`Notes: ${data.notes}`, pageW - 40);
    doc.text(lines, 19, y);
    y += lines.length * 3.5 + 4;
  }
  return y;
}

// ─── Main Export ───

export async function generateMedicalHistoryPdf(
  history: MedicalHistoryForPdf,
  patientName?: string
) {
  try {
    const doc = new jsPDF("p", "mm", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentW = pageW - margin * 2;

    // Load logo
    const logoUrl = "/logo.png";
    let logoData: string | null = null;
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      logoData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("Failed to load logo", error);
    }

    // ─── Cover Header ───
    // Modern Header Background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, 0, pageW, 55, "F");

    // Top Accent
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageW, 3, "F");

    // Logo
    if (logoData) {
      doc.addImage(logoData, "PNG", margin, 15, 12, 12);
    }

    // App Branding
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("My Health Compass", logoData ? margin + 16 : margin, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text("Comprehensive Medical History Record", logoData ? margin + 16 : margin, 25);

    // Divider
    doc.setDrawColor(...COLORS.border);
    doc.line(margin, 55, pageW - margin, 55);

    // Patient Info (Right Aligned)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(patientName || "Patient Record", pageW - margin, 22, { align: "right" });

    // Stats on right
    const filledCount = STEPS.filter(
      (s) => Object.keys((history as any)[s.key] || {}).length > 0
    ).length;
    const completion = Math.round((filledCount / STEPS.length) * 100);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.success);
    doc.text(`${completion}% Completed`, pageW - margin, 32, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, pageW - margin, 38, { align: "right" });
    doc.text(`Status: ${history.is_complete ? "Finalized" : "Draft / In Progress"}`, pageW - margin, 43, { align: "right" });

    // ─── Start Content ───
    let y = 65;

    // ─── Progress bar ───
    doc.setDrawColor(...COLORS.border);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, y, contentW, 6, 3, 3, "FD");

    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y, Math.max(contentW * (completion / 100), 6), 6, 3, 3, "F");
    y += 18;

    // ─── Table of Contents ───
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text("Table of Contents", margin, y);
    y += 6;

    STEPS.forEach((step, i) => {
      const filled = Object.keys((history as any)[step.key] || {}).length > 0;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const textColor = filled ? COLORS.dark : COLORS.muted;
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`${step.icon}  ${i + 1}. ${step.label}`, margin + 4, y);
      const statusColor = filled ? COLORS.success : COLORS.muted;
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(filled ? "Recorded" : "Empty", pageW - margin, y, { align: "right" });
      y += 5.5;
    });

    y += 10;

    // ─── Clinical Overview ───
    y = renderClinicalAlerts(doc, y, history, pageW);
    y += 5;

    // ─── Executive Summary ───
    y = renderClinicalNarrativeSection(doc, y, history, pageW);
    y += 5;

    // === Render each section ===
    const renderers: Record<string, (doc: jsPDF, y: number, data: any, pageW: number) => number> = {
      birth_history: renderBirthHistory,
      childhood_illnesses: renderChildhoodIllnesses,
      medical_conditions: renderMedicalConditions,
      family_history: renderFamilyHistory,
      gender_health: renderGenderHealth,
      surgeries: renderSurgeries,
      allergies: renderAllergies,
      body_systems: renderBodySystems,
      lifestyle: renderLifestyle,
      analysis: renderFiveElementAnalysis,
      clinical: renderClinicalDashboard,
      acupressure: renderAcupressureProtocol,
    };

    STEPS.forEach((step) => {
      const sectionData = (history as any)[step.key];
      if (!sectionData || (typeof sectionData === 'object' && Object.keys(sectionData).length === 0)) return;
      y = renderers[step.key](doc, y, sectionData, pageW);
      y += 2;
    });

    // ─── Footers ───
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addFooter(doc, p, totalPages);
    }

    doc.save(`Medical_History_${(patientName || "Patient").replace(/\s+/g, "_")}.pdf`);
  } catch (err: any) {
    console.error("PDF Generation Error (Medical History):", err);
    alert(`Failed to generate PDF. Error: ${err.message}`);
  }
}
