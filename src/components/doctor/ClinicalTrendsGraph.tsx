import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';

interface Vital {
  vital_type: string;
  value: string;
  recorded_at: string;
}

interface Medication {
  name: string;
  start_date: string;
  end_date: string | null;
}

export function ClinicalTrendsGraph({ vitals, medications }: { vitals: Vital[], medications: Medication[] }) {
  // Pre-process data
  const data = useMemo(() => {
    if (!vitals || vitals.length === 0) return [];
    
    // Group vitals by date to see changes over time
    const grouped = vitals.reduce((acc: any, vital) => {
      const dateStr = vital.recorded_at.split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { date: dateStr };
      
      const val = parseFloat(vital.value);
      if (!isNaN(val)) {
        acc[dateStr][vital.vital_type.toLowerCase()] = val;
      }
      return acc;
    }, {});

    // Sort chronologically
    return Object.values(grouped).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [vitals]);

  if (data.length === 0) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Not enough vital records to generate a clinical trend.
        </CardContent>
      </Card>
    );
  }

  // Only plot keys that actually exist in the data (e.g. weight, blood_pressure (hard to chart as single line), heart_rate, sugar)
  // Let's filter out non-numeric complex vitals like blood_pressure (120/80)
  // We assume BP is recorded as systolic/diastolic or separate objects. Wait, in E2care vitals, it's generic string. But we parseFloat'd it above. So "120/80" becomes 120.

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Clinical Trend Overlays</CardTitle>
        <CardDescription>Correlation between vitals trajectory and medication interventions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => format(parseISO(val), 'MMM dd')} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={10}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                labelFormatter={(val) => format(parseISO(val), 'MMMM dd, yyyy')}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              
              <Line type="monotone" dataKey="blood_sugar" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Blood Sugar" connectNulls />
              <Line type="monotone" dataKey="blood_pressure" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Blood Pressure (Systolic)" connectNulls />
              <Line type="monotone" dataKey="heart_rate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Heart Rate" connectNulls />
              <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Weight" connectNulls />
              
              {/* Medication Overlay Events */}
              {medications.map((med, idx) => {
                 if (!med.start_date) return null;
                 const start = med.start_date.split('T')[0];
                 // we only plot if start date is valid date
                 if (!isValid(parseISO(start))) return null;
                 
                 return (
                   <ReferenceLine 
                     key={idx} 
                     x={start} 
                     stroke="#8b5cf6" 
                     strokeDasharray="4 4"
                     label={{ position: 'insideTopLeft', value: `Started: ${med.name}`, fill: '#8b5cf6', fontSize: 10, offset: 15 }} 
                   />
                 )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
