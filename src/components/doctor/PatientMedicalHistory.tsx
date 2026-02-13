import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart, AlertTriangle, Scissors, Users, Baby, Brain,
  Dumbbell, Stethoscope, Eye, Ear, Bone, Droplets
} from "lucide-react";

interface PatientMedicalHistoryProps {
  medicalHistory: any;
}

function Section({ title, icon: Icon, children, color = "text-primary" }: {
  title: string;
  icon: any;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}

function DataRow({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === "" || value === false) return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right max-w-[60%]">{display}</span>
    </div>
  );
}

function TagList({ items, variant = "secondary" }: { items: string[]; variant?: "secondary" | "destructive" | "outline" }) {
  if (!items || items.length === 0) return <p className="text-muted-foreground text-xs">None reported</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant={variant} className="text-xs">{item}</Badge>
      ))}
    </div>
  );
}

function renderObjectData(data: any): React.ReactNode {
  if (!data || typeof data !== "object") return <p className="text-xs text-muted-foreground">No data recorded</p>;

  const entries = Object.entries(data).filter(
    ([_, v]) => v !== null && v !== undefined && v !== "" && v !== false && !(Array.isArray(v) && v.length === 0)
  );

  if (entries.length === 0) return <p className="text-xs text-muted-foreground">No data recorded</p>;

  return (
    <div className="space-y-0.5">
      {entries.map(([key, value]) => {
        const label = key
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase());

        if (Array.isArray(value)) {
          return (
            <div key={key} className="py-1">
              <span className="text-muted-foreground text-xs">{label}:</span>
              <div className="mt-1">
                <TagList items={value.map(String)} />
              </div>
            </div>
          );
        }

        if (typeof value === "object" && value !== null) {
          return (
            <div key={key} className="py-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
              <div className="pl-3 border-l-2 border-border">
                {renderObjectData(value)}
              </div>
            </div>
          );
        }

        return <DataRow key={key} label={label} value={value} />;
      })}
    </div>
  );
}

export default function PatientMedicalHistory({ medicalHistory }: PatientMedicalHistoryProps) {
  if (!medicalHistory) {
    return (
      <div className="py-8 text-center">
        <Brain className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Patient has not filled in their medical history yet</p>
      </div>
    );
  }

  const sections = [
    { key: "medical_conditions", title: "Medical Conditions", icon: Heart, color: "text-destructive", data: medicalHistory.medical_conditions },
    { key: "allergies", title: "Allergies", icon: AlertTriangle, color: "text-warning", data: medicalHistory.allergies },
    { key: "surgeries", title: "Surgeries & Procedures", icon: Scissors, color: "text-secondary", data: medicalHistory.surgeries },
    { key: "family_history", title: "Family History", icon: Users, color: "text-info", data: medicalHistory.family_history },
    { key: "childhood_illnesses", title: "Childhood Illnesses", icon: Baby, color: "text-primary", data: medicalHistory.childhood_illnesses },
    { key: "birth_history", title: "Birth History", icon: Baby, color: "text-accent-foreground", data: medicalHistory.birth_history },
    { key: "body_systems", title: "Body Systems Review", icon: Stethoscope, color: "text-secondary", data: medicalHistory.body_systems },
    { key: "gender_health", title: "Gender-Specific Health", icon: Heart, color: "text-primary", data: medicalHistory.gender_health },
    { key: "lifestyle", title: "Lifestyle", icon: Dumbbell, color: "text-info", data: medicalHistory.lifestyle },
  ];

  const filledSections = sections.filter((s) => {
    if (!s.data || typeof s.data !== "object") return false;
    const entries = Object.entries(s.data).filter(
      ([_, v]) => v !== null && v !== undefined && v !== "" && v !== false && !(Array.isArray(v) && v.length === 0)
    );
    return entries.length > 0;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filledSections.length} of {sections.length} sections completed
        </p>
        <Badge variant={medicalHistory.is_complete ? "default" : "secondary"}>
          {medicalHistory.is_complete ? "Complete" : "In Progress"}
        </Badge>
      </div>

      {filledSections.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">No medical history data has been filled in yet</p>
        </div>
      ) : (
        filledSections.map((section) => (
          <Section key={section.key} title={section.title} icon={section.icon} color={section.color}>
            {renderObjectData(section.data)}
          </Section>
        ))
      )}
    </div>
  );
}