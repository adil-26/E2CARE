import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MedicalReport } from "@/hooks/useMedicalReports";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceLine, Scatter, ScatterChart, ZAxis,
} from "recharts";

interface TrendChartProps {
  reports: MedicalReport[];
}

const STATUS_COLORS: Record<string, string> = {
  normal: "#22c55e",   // green-500
  high: "#ef4444",     // red-500
  low: "#ef4444",      // red-500
  critical: "#dc2626", // red-600
  unknown: "#94a3b8",  // slate-400
};

const STATUS_LABELS: Record<string, string> = {
  normal: "Normal",
  high: "High",
  low: "Low",
  critical: "Critical",
  unknown: "Unknown",
};

// Collect all unique test names across all reports
function getAvailableTests(reports: MedicalReport[]): string[] {
  const testNames = new Set<string>();
  reports.forEach((r) => {
    const results = r.extracted_data?.test_results || [];
    results.forEach((t: any) => {
      if (t.test_name && t.value && !isNaN(parseFloat(t.value))) {
        testNames.add(t.test_name);
      }
    });
  });
  return Array.from(testNames).sort();
}

// Build trend data for a specific test
function buildTrendData(reports: MedicalReport[], testName: string) {
  const dataPoints: { date: string; value: number; refMin?: number; refMax?: number; status: string; fill: string }[] = [];

  const sorted = [...reports].sort((a, b) => {
    const da = a.report_date || a.created_at;
    const db = b.report_date || b.created_at;
    return new Date(da).getTime() - new Date(db).getTime();
  });

  sorted.forEach((r) => {
    const results = r.extracted_data?.test_results || [];
    const match = results.find((t: any) => t.test_name === testName);
    if (match && !isNaN(parseFloat(match.value))) {
      const date = r.report_date || r.created_at.split("T")[0];

      let refMin: number | undefined;
      let refMax: number | undefined;
      if (match.reference_range) {
        const rangeMatch = match.reference_range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
        if (rangeMatch) {
          refMin = parseFloat(rangeMatch[1]);
          refMax = parseFloat(rangeMatch[2]);
        }
      }

      const status = match.status || "unknown";

      dataPoints.push({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
        value: parseFloat(match.value),
        refMin,
        refMax,
        status,
        fill: STATUS_COLORS[status] || STATUS_COLORS.unknown,
      });
    }
  });

  return dataPoints;
}

// Custom dot renderer that colors by status
function StatusDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  const color = payload?.fill || STATUS_COLORS.unknown;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={color}
      stroke="hsl(var(--card))"
      strokeWidth={2.5}
    />
  );
}

// Custom tooltip
function StatusTooltip({ active, payload, label }: any) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-bold" style={{ color: data.fill }}>
        {data.value}
        <span className="ml-1 text-xs font-normal">
          ({STATUS_LABELS[data.status] || data.status})
        </span>
      </p>
      {data.refMin != null && data.refMax != null && (
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Ref: {data.refMin} – {data.refMax}
        </p>
      )}
    </div>
  );
}

export default function TrendChart({ reports }: TrendChartProps) {
  const availableTests = useMemo(() => getAvailableTests(reports), [reports]);
  const [selectedTest, setSelectedTest] = useState(availableTests[0] || "");

  const trendData = useMemo(
    () => (selectedTest ? buildTrendData(reports, selectedTest) : []),
    [reports, selectedTest]
  );

  const latestRef = trendData.length > 0 ? trendData[trendData.length - 1] : null;

  // Determine which statuses are present for legend
  const presentStatuses = useMemo(() => {
    const statuses = new Set<string>();
    trendData.forEach((d) => statuses.add(d.status));
    return Array.from(statuses);
  }, [trendData]);

  if (availableTests.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Upload lab reports with numeric test values to see trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Test selector */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <Label className="text-xs mb-2 block">Select a test to track</Label>
          <Select value={selectedTest} onValueChange={setSelectedTest}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a test..." />
            </SelectTrigger>
            <SelectContent>
              {availableTests.map((test) => (
                <SelectItem key={test} value={test}>
                  {test}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Chart */}
      {trendData.length > 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm text-foreground">{selectedTest}</h4>
              {/* Status legend */}
              <div className="flex items-center gap-3">
                {presentStatuses.map((s) => (
                  <div key={s} className="flex items-center gap-1">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[s] || STATUS_COLORS.unknown }}
                    />
                    <span className="text-[10px] text-muted-foreground">{STATUS_LABELS[s] || s}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mb-4">
              {trendData.length} data point{trendData.length > 1 ? "s" : ""}
              {latestRef?.refMin != null && latestRef?.refMax != null && (
                <> · Reference: {latestRef.refMin}–{latestRef.refMax}</>
              )}
            </p>

            <div className="h-52 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<StatusTooltip />} />

                  {/* Green reference range band */}
                  {latestRef?.refMin != null && latestRef?.refMax != null && (
                    <ReferenceArea
                      y1={latestRef.refMin}
                      y2={latestRef.refMax}
                      fill="#22c55e"
                      fillOpacity={0.08}
                      strokeOpacity={0}
                    />
                  )}

                  {/* Reference lines */}
                  {latestRef?.refMin != null && (
                    <ReferenceLine
                      y={latestRef.refMin}
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                      label={{
                        value: "Min",
                        position: "left",
                        style: { fontSize: 9, fill: "#22c55e" },
                      }}
                    />
                  )}
                  {latestRef?.refMax != null && (
                    <ReferenceLine
                      y={latestRef.refMax}
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                      label={{
                        value: "Max",
                        position: "left",
                        style: { fontSize: 9, fill: "#22c55e" },
                      }}
                    />
                  )}

                  {/* Line colored by segment status */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeOpacity={0.4}
                    dot={<StatusDot />}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data table with status colors */}
            <div className="mt-4 space-y-1">
              {trendData.map((point, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground">{point.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{point.value}</span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${point.fill}15`,
                        color: point.fill,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: point.fill }}
                      />
                      {STATUS_LABELS[point.status] || point.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {trendData.length === 0 && selectedTest && (
        <Card className="shadow-sm">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No numeric data found for "{selectedTest}".</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
