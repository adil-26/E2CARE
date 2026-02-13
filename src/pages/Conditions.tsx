import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Plus, TrendingUp, Droplets, Thermometer, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConditions, CONDITION_TYPES } from "@/hooks/useConditions";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const iconMap: Record<string, any> = {
  Droplets, Activity, TrendingUp, Thermometer, Wind,
};

export default function Conditions() {
  const { conditionLogs, addLog, isLoading } = useConditions();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>(CONDITION_TYPES[0].type);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<string>(CONDITION_TYPES[0].type);
  const [newNotes, setNewNotes] = useState("");

  const selectedConfig = CONDITION_TYPES.find((c) => c.type === selectedType)!;
  const filteredLogs = conditionLogs
    .filter((l: any) => l.condition_type === selectedType)
    .slice(0, 30)
    .reverse();

  const chartData = filteredLogs.map((l: any) => ({
    date: format(new Date(l.recorded_at), "MMM dd"),
    value: Number(l.value),
  }));

  const latestValue = filteredLogs.length > 0 ? Number(filteredLogs[filteredLogs.length - 1].value) : null;

  const handleAdd = () => {
    if (!newValue) return;
    const config = CONDITION_TYPES.find((c) => c.type === newType)!;
    addLog.mutate(
      { condition_type: newType, value: Number(newValue), unit: config.unit, notes: newNotes || undefined },
      {
        onSuccess: () => {
          toast({ title: "Logged!", description: `${config.label} reading saved.` });
          setNewValue("");
          setNewNotes("");
          setDialogOpen(false);
        },
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">Chronic Conditions</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Log Reading</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Condition Reading</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Condition Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITION_TYPES.map((c) => (
                      <SelectItem key={c.type} value={c.type}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value ({CONDITION_TYPES.find((c) => c.type === newType)?.unit})</Label>
                <Input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Enter value" />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="e.g., fasting, post-meal" />
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={addLog.isPending}>
                {addLog.isPending ? "Saving..." : "Save Reading"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Condition Type Selector */}
      <div className="flex flex-wrap gap-2">
        {CONDITION_TYPES.map((c) => {
          const Icon = iconMap[c.icon] || Activity;
          const count = conditionLogs.filter((l: any) => l.condition_type === c.type).length;
          return (
            <Button
              key={c.type}
              variant={selectedType === c.type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(c.type)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {c.label}
              {count > 0 && <span className="ml-1 text-xs opacity-70">({count})</span>}
            </Button>
          );
        })}
      </div>

      {/* Current Reading */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            {selectedConfig.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {latestValue !== null ? latestValue : "—"}
            </span>
            <span className="text-sm text-muted-foreground">{selectedConfig.unit}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Normal range: {selectedConfig.normalRange} {selectedConfig.unit}</p>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      {chartData.length > 1 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Logs */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Readings</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No readings logged yet. Tap "Log Reading" to start.</p>
          ) : (
            <div className="space-y-2">
              {[...filteredLogs].reverse().slice(0, 10).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <span className="font-medium text-foreground">{Number(log.value)} {log.unit}</span>
                    {log.notes && <span className="ml-2 text-xs text-muted-foreground">— {log.notes}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.recorded_at), "MMM dd, HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
