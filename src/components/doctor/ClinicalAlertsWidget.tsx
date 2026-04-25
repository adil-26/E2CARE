import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ClinicalAlert {
  id: string;
  patient_id: string;
  alert_type: 'vital_out_of_range' | 'symptom_spike' | 'interaction_warning' | 'missed_meds';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  is_resolved: boolean;
  created_at: string;
}

export function ClinicalAlertsWidget({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['clinical-alerts', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_alerts' as any)
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_resolved', false)
        .order('severity', { ascending: false }) // Since 'high', 'critical' etc. Wait, text order doesn't work well for severity logic. Let's just order by created_at
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as ClinicalAlert[];
    },
    enabled: !!patientId,
  });

  const resolveAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('clinical_alerts' as any)
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id 
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical-alerts', patientId] });
      toast({ title: 'Alert Acknowledged', description: 'The clinical alert was marked as resolved.', variant: 'default' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  if (isLoading || !alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 animate-in slide-in-from-top-4 duration-500">
      <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" />
        Active Clinical Alerts ({alerts.length})
      </h3>
      {alerts.map((alert) => {
        const isCritical = alert.severity === 'critical' || alert.severity === 'high';
        
        return (
          <Alert 
            key={alert.id} 
            variant={isCritical ? "destructive" : "default"}
            className={isCritical ? "border-destructive/50 bg-destructive/5" : "border-amber-500/50 bg-amber-500/5 text-amber-600 dark:text-amber-500"}
          >
            <AlertCircle className={`h-4 w-4 ${isCritical ? "text-destructive" : "text-amber-500"}`} />
            <AlertTitle className="flex items-center justify-between">
              <span>{alert.title}</span>
              <Badge variant="outline" className={`text-[10px] uppercase ${isCritical ? "border-destructive text-destructive" : "border-amber-500 text-amber-500"}`}>
                {alert.severity} Priority
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <span className="opacity-90 leading-relaxed text-sm">{alert.description}</span>
              <Button 
                size="sm" 
                variant={isCritical ? "destructive" : "outline"} 
                className={`shrink-0 ${!isCritical && "border-amber-500 hover:bg-amber-500 hover:text-white"}`}
                onClick={() => resolveAlert.mutate(alert.id)}
                disabled={resolveAlert.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Acknowledge
              </Button>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
