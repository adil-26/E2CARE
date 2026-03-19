import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormulaBuilder } from './FormulaBuilder';
import { InteractiveDiagram } from './InteractiveDiagram';
import { 
  AyurvedicCase, 
  AyurvedicVisit, 
  AyurvedicSymptom, 
  AyurvedicFormula, 
  AyurvedicDiagram 
} from '@/types/ayurveda';
import { Plus, Trash2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AyurvedicCaseFormProps {
  patientId: string;
  doctorId: string;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export const AyurvedicCaseForm: React.FC<AyurvedicCaseFormProps> = ({
  patientId,
  doctorId,
  onSubmit,
  initialData
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [caseDetails, setCaseDetails] = useState({
    title: initialData?.title || 'New Acupressure Case',
    description: initialData?.description || ''
  });

  const [vitals, setVitals] = useState({
    sleep: '', thirst: '', urine: '', appetite: '', 
    taste: '', stool: '', emotion: '', period: ''
  });

  const [investigations, setInvestigations] = useState({
    blood_tests: [],
    usg: '',
    echo: '',
    mri: ''
  });

  const [symptoms, setSymptoms] = useState<Partial<AyurvedicSymptom>[]>([
    { symptom_name: '', duration: '', relief_percentage: 0 }
  ]);

  const [formulas, setFormulas] = useState<AyurvedicFormula[]>([]);
  
  const [diagrams, setDiagrams] = useState<AyurvedicDiagram[]>([
    { diagram_type: 'hand', markers: [] },
    { diagram_type: 'foot', markers: [] }
  ]);

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const addSymptom = () => {
    setSymptoms([...symptoms, { symptom_name: '', duration: '', relief_percentage: 0 }]);
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleSymptomChange = (index: number, field: keyof AyurvedicSymptom, value: any) => {
    const updated = [...symptoms];
    updated[index] = { ...updated[index], [field]: value };
    setSymptoms(updated);
  };

  const updateDiagram = (index: number, newDiagram: AyurvedicDiagram) => {
    const updated = [...diagrams];
    updated[index] = newDiagram;
    setDiagrams(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In a real implementation this would format the payload and call onSubmit
      await onSubmit({
        caseDetails,
        vitals,
        investigations,
        symptoms,
        formulas,
        diagrams
      });
    } catch (error) {
      console.error("Error saving case", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* 1. Basic Info & Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Functional Assessment (Vitals)</CardTitle>
          <CardDescription>Record the patient's basic physiological status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['sleep', 'thirst', 'urine', 'appetite', 'taste', 'stool', 'emotion', 'period'].map((v) => (
              <div key={v} className="space-y-1">
                <Label className="capitalize">{v}</Label>
                <Input 
                  name={v} 
                  value={(vitals as any)[v]} 
                  onChange={handleVitalChange} 
                  placeholder={`Normal, Excess, etc.`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Investigations */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Investigations</CardTitle>
          <CardDescription>Record key findings from reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Blood Test / Lab Summary</Label>
            <Textarea 
              placeholder="e.g., Hb: 11.8 (low), TSH: 7.83 (high)..." 
              value={investigations.blood_tests as any} // Simplification for MVP
              onChange={(e) => setInvestigations({...investigations, blood_tests: e.target.value as any})}
            />
          </div>
          <div className="space-y-2">
            <Label>USG / Abdomen</Label>
            <Textarea 
              value={investigations.usg}
              onChange={(e) => setInvestigations({...investigations, usg: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Echocardiography / MRI</Label>
            <Textarea 
              value={investigations.mri}
              onChange={(e) => setInvestigations({...investigations, mri: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle>Symptoms & Progress</CardTitle>
          <CardDescription>Track relief percentage over time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {symptoms.map((s, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 p-3 rounded-md border">
              <div className="flex-1 space-y-2">
                <Label>Symptom {i + 1}</Label>
                <Input 
                  value={s.symptom_name} 
                  onChange={(e) => handleSymptomChange(i, 'symptom_name', e.target.value)}
                  placeholder="e.g., Heel pain" 
                />
              </div>
              <div className="w-full sm:w-32 space-y-2">
                <Label>Duration</Label>
                <Input 
                  value={s.duration || ''} 
                  onChange={(e) => handleSymptomChange(i, 'duration', e.target.value)}
                  placeholder="e.g., 4 mos" 
                />
              </div>
              <div className="w-full sm:w-32 space-y-2">
                <Label>Relief (%)</Label>
                <Input 
                  type="number" 
                  min="0" max="100"
                  value={s.relief_percentage || 0} 
                  onChange={(e) => handleSymptomChange(i, 'relief_percentage', Number(e.target.value))}
                />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSymptom(i)} className="text-red-500 mb-0.5">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSymptom} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Symptom
          </Button>
        </CardContent>
      </Card>

      {/* 4. Formulas */}
      <FormulaBuilder formulas={formulas} onChange={setFormulas} />

      {/* 5. Diagrams */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Diagrams</CardTitle>
          <CardDescription>Place markers for applied treatments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hand">
            <TabsList className="mb-4">
              <TabsTrigger value="hand">Hand Editor</TabsTrigger>
              <TabsTrigger value="foot">Foot Editor</TabsTrigger>
            </TabsList>
            {diagrams.map((diag, i) => (
              <TabsContent key={diag.diagram_type} value={diag.diagram_type}>
                <InteractiveDiagram 
                  diagram={diag} 
                  onChange={(newDiag) => updateDiagram(i, newDiag)} 
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Case History
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
