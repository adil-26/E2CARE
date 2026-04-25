import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Clock, Pill, TrendingDown, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface MedicineLog {
  id: string;
  medication_name: string;
  scheduled_time: string;
  taken_at: string | null;
  status: 'taken' | 'skipped' | 'missed';
  notes: string | null;
  created_at: string;
}

export function MedicineAdherenceDashboard({ patientId }: { patientId: string }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['medicine-logs', patientId],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data, error } = await supabase
        .from('medicine_logs' as any)
        .select('*')
        .eq('patient_id', patientId)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as MedicineLog[];
    },
    enabled: !!patientId,
  });

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-xl"></div>;
  }

  const totalLogs = logs?.length || 0;
  const takenLogs = logs?.filter(l => l.status === 'taken').length || 0;
  const missedLogs = logs?.filter(l => l.status === 'missed' || l.status === 'skipped') || [];
  
  // If no logs exist, show a placeholder
  if (totalLogs === 0) {
    return (
      <Card className="border-dashed shadow-none bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Pill className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No Adherence Data Yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
            We haven't received any daily routine logs from this patient. Once they start logging their medications, adherence trends will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const complianceScore = Math.round((takenLogs / totalLogs) * 100);
  let scoreColor = "text-green-500";
  let progressColor = "bg-green-500";
  if (complianceScore < 80) { scoreColor = "text-yellow-500"; progressColor = "bg-yellow-500"; }
  if (complianceScore < 50) { scoreColor = "text-destructive"; progressColor = "bg-destructive"; }

  const recentMissed = missedLogs.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Score Card */}
        <Card className="md:col-span-2 shadow-sm border-primary/10 bg-gradient-to-br from-white to-primary/5 dark:from-zinc-950 dark:to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              30-Day Compliance Score
            </CardTitle>
            <CardDescription>Based on {totalLogs} scheduled medication events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 mb-4">
              <span className={`text-5xl font-display font-bold ${scoreColor}`}>
                {complianceScore}%
              </span>
              <div className="pb-1 text-sm text-muted-foreground flex items-center gap-1">
                {complianceScore >= 80 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                {complianceScore >= 80 ? 'Excellent adherence' : complianceScore >= 50 ? 'Needs attention' : 'Critical failure risk'}
              </div>
            </div>
            <Progress value={complianceScore} className={`h-3 ${progressColor}`} />
            
            <div className="mt-6 flex gap-6 text-sm">
              <div>
                <span className="text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">Taken On Time</span>
                <span className="font-semibold">{takenLogs} doses</span>
              </div>
              <div>
                <span className="text-muted-foreground uppercase tracking-wider text-[10px] block mb-1">Missed/Skipped</span>
                <span className="font-semibold text-destructive">{totalLogs - takenLogs} doses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missed Warning Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              Recent Misses
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {recentMissed.length > 0 ? (
              <ul className="space-y-3">
                {recentMissed.map(log => (
                   <li key={log.id} className="text-sm flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0">
                     <span className="font-medium">{log.medication_name}</span>
                     <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {format(new Date(log.created_at), "MMM d, h:mm a")}</span>
                        <Badge variant="outline" className="text-[10px] text-destructive border-destructive/20 bg-destructive/5 capitalize">{log.status}</Badge>
                     </div>
                   </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center pt-4 opacity-70">
                 <CheckCircle2 className="w-8 h-8 text-green-500 mb-2"/>
                 <p className="text-xs text-center">No missed medications recently.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
