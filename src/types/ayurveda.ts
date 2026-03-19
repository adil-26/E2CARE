export type AyurvedicCaseStatus = 'active' | 'completed' | 'archived';

export interface AyurvedicCase {
  id: string;
  patient_id: string;
  doctor_id: string;
  created_at: string;
  status: AyurvedicCaseStatus;
  title?: string;
  description?: string;
}

export interface AyurvedicVitals {
  sleep?: string;
  thirst?: string;
  urine?: string;
  appetite?: string;
  taste?: string;
  stool?: string;
  emotion?: string;
  period?: string;
}

export interface BloodTestResult {
  name: string;
  value: number | string;
  trend?: 'high' | 'low' | 'normal';
}

export interface AyurvedicInvestigations {
  blood_tests?: BloodTestResult[];
  usg?: string;
  echo?: string;
  mri?: string;
  other?: string;
}

export interface AyurvedicVisit {
  id: string;
  case_id: string;
  visit_date: string;
  vitals?: AyurvedicVitals;
  investigations?: AyurvedicInvestigations;
  treatment_notes?: string;
  created_at: string;
}

export interface AyurvedicSymptom {
  id?: string;
  case_id: string;
  visit_id?: string;
  symptom_name: string;
  duration?: string;
  relief_percentage: number;
  notes?: string;
}

export interface AyurvedicFormulaElements {
  tonify: number[];
  sedate: number[];
}

export interface AyurvedicFormula {
  id?: string;
  visit_id?: string;
  body_part: string; // e.g., "Toe No. 0"
  joint?: string;    // e.g., "V jt."
  elements?: AyurvedicFormulaElements;
  color_applied?: string; // e.g., "Black colour"
}

export interface DiagramMarker {
  id: string;
  x: number;
  y: number;
  color: string;
  label?: string;
}

export interface AyurvedicDiagram {
  id?: string;
  visit_id?: string;
  diagram_type: 'hand' | 'foot' | 'body' | 'custom';
  image_url?: string;
  markers?: DiagramMarker[];
}
