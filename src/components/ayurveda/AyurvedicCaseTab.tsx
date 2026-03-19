import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, ArrowLeft } from 'lucide-react';
import { AyurvedicCaseForm } from './AyurvedicCaseForm';

interface AyurvedicCaseTabProps {
  patientId: string;
  doctorId: string; // Typically we'd get this from auth context, but passing it for now
}

export const AyurvedicCaseTab: React.FC<AyurvedicCaseTabProps> = ({ patientId, doctorId }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  // In a real app, this would be fetched from Supabase using useQuery
  const [cases, setCases] = useState<any[]>([]);

  const handleCreateCase = async (data: any) => {
    console.log("Saving new case data:", data);
    // Real implementation would insert into Supabase here
    setCases([{ id: Math.random().toString(), created_at: new Date().toISOString(), ...data }, ...cases]);
    setView('list');
  };

  if (view === 'create') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setView('list')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cases
        </Button>
        <AyurvedicCaseForm 
          patientId={patientId} 
          doctorId={doctorId} 
          onSubmit={handleCreateCase} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Ayurvedic Acupressure Cases</h3>
        <Button onClick={() => setView('create')}>
          <Plus className="w-4 h-4 mr-2" /> New Case
        </Button>
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p>No Ayurvedic cases found for this patient.</p>
            <Button variant="link" onClick={() => setView('create')} className="mt-2">
              Start new Acupressure Case
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cases.map((c, i) => (
            <Card key={i} className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-base">{c.caseDetails?.title || 'Case History'}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <CardDescription>
                  {c.symptoms?.length || 0} symptom(s) tracked. {c.formulas?.length || 0} formula(s) applied.
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
