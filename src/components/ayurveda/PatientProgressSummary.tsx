import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveDiagram } from './InteractiveDiagram';
import { 
  AyurvedicCase, 
  AyurvedicVisit, 
  AyurvedicSymptom, 
  AyurvedicFormula, 
  AyurvedicDiagram 
} from '@/types/ayurveda';
import { format } from 'date-fns';
import { Activity, Calendar, ActivitySquare } from 'lucide-react';

interface PatientProgressSummaryProps {
  caseData: AyurvedicCase;
  latestVisit: AyurvedicVisit | null;
  symptoms: AyurvedicSymptom[];
  formulas: AyurvedicFormula[];
  diagrams: AyurvedicDiagram[];
}

export const PatientProgressSummary: React.FC<PatientProgressSummaryProps> = ({
  caseData,
  latestVisit,
  symptoms,
  formulas,
  diagrams
}) => {
  
  const generateElementsString = (tonify: number[], sedate: number[]) => {
    const parts = [];
    if (sedate.length > 0) parts.push(`${sedate.join(', ')} ↓`);
    if (tonify.length > 0) parts.push(`${tonify.join(', ')} ↑`);
    return parts.join(' , ');
  };

  if (!caseData || !latestVisit) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <ActivitySquare className="w-12 h-12 mb-4 opacity-50" />
          <p>No active Ayurvedic Acupressure treatments found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{caseData.title || 'Ayurvedic Treatment'}</h2>
          <p className="text-muted-foreground flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-2" />
            Started on {format(new Date(caseData.created_at), 'MMMM d, yyyy')}
          </p>
        </div>
        <Badge variant={caseData.status === 'active' ? 'default' : 'secondary'} className="capitalize text-sm">
          {caseData.status} Phase
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Symptoms Progress */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary" />
              Symptom Relief Progress
            </CardTitle>
            <CardDescription>Based on your last visit ({format(new Date(latestVisit.visit_date), 'MMM d, yyyy')})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {symptoms.length === 0 ? (
               <p className="text-sm text-muted-foreground">No symptoms tracked recently.</p>
            ) : symptoms.map((symptom, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{symptom.symptom_name}</p>
                    {symptom.duration && <p className="text-xs text-muted-foreground">Persisted for {symptom.duration}</p>}
                  </div>
                  <span className="text-sm font-bold text-primary">{symptom.relief_percentage}% Relief</span>
                </div>
                <Progress value={symptom.relief_percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Applied Formulas summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Current Protocol</CardTitle>
            <CardDescription>Acupressure points & colors applied</CardDescription>
          </CardHeader>
          <CardContent>
             {formulas.length === 0 ? (
               <p className="text-sm text-muted-foreground">No specific formulas documented for this visit.</p>
             ) : (
               <ul className="space-y-3">
                 {formulas.map((f, i) => (
                   <li key={i} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
                     <div>
                       <span className="font-medium text-sm">{f.body_part}</span>
                       {f.joint && <span className="text-sm text-muted-foreground ml-1">({f.joint})</span>}
                     </div>
                     <div className="text-right">
                       {f.elements && (f.elements.tonify.length > 0 || f.elements.sedate.length > 0) && (
                         <div className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded inline-block mb-1">
                           {generateElementsString(f.elements.tonify, f.elements.sedate)}
                         </div>
                       )}
                       {f.color_applied && (
                         <div className="text-xs font-medium" style={{ color: f.color_applied.split(' ')[0].toLowerCase() }}>
                           {f.color_applied}
                         </div>
                       )}
                     </div>
                   </li>
                 ))}
               </ul>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Visual Tracking Diagrams */}
      {diagrams.length > 0 && (
        <Card className="shadow-sm">
           <CardHeader>
            <CardTitle className="text-lg">Point Map View</CardTitle>
            <CardDescription>Visual guide of your current treatment points</CardDescription>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue={diagrams[0].diagram_type}>
                <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
                  {diagrams.map((d, i) => (
                    <TabsTrigger key={i} value={d.diagram_type} className="capitalize">
                      {d.diagram_type}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {diagrams.map((d, i) => (
                  <TabsContent key={i} value={d.diagram_type} className="pt-4">
                    <InteractiveDiagram diagram={d} onChange={() => {}} readonly={true} />
                  </TabsContent>
                ))}
             </Tabs>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
