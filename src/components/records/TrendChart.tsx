import { useState, useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MedicalReport } from "@/hooks/useMedicalReports";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceLine,
} from "recharts";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  getAvailableTests,
  buildTrendData,
  getLatestTestValue
} from "@/utils/healthDataUtils";

interface TrendChartProps {
  reports: MedicalReport[];
}


function StatusDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  return <circle cx={cx} cy={cy} r={5} fill={payload?.fill || STATUS_COLORS.unknown} stroke="hsl(var(--card))" strokeWidth={2} />;
}

function StatusTooltip({ active, payload, label }: any) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-bold" style={{ color: data.fill }}>
        {data.value}
        <span className="ml-1 text-xs font-normal">({STATUS_LABELS[data.status] || data.status})</span>
      </p>
      {data.refMin != null && data.refMax != null && (
        <p className="text-[10px] text-muted-foreground mt-0.5">Ref: {data.refMin} – {data.refMax}</p>
      )}
    </div>
  );
}

// Mini sparkline for the overview cards
function MiniSparkline({ data }: { data: { value: number; fill: string }[] }) {
  if (data.length < 2) return null;
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function TrendChart({ reports }: TrendChartProps) {
  const availableTests = useMemo(() => getAvailableTests(reports), [reports]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!chartRef.current || !selectedTest) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * (pdfWidth - 20)) / imgProps.width;

      pdf.setFontSize(16);
      pdf.text(`${selectedTest} - Trend Report`, 10, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 22);

      pdf.addImage(imgData, "PNG", 10, 30, pdfWidth - 20, imgHeight);
      pdf.save(`${selectedTest}_Trend_Report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const trendData = useMemo(
    () => (selectedTest ? buildTrendData(reports, selectedTest) : []),
    [reports, selectedTest]
  );

  const latestRef = trendData.length > 0 ? trendData[trendData.length - 1] : null;

  if (availableTests.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Upload lab reports with numeric test values to see trends.</p>
        </CardContent>
      </Card>
    );
  }

  // Overview: show all tests as cards
  if (!selectedTest) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">Tap any test to see its full trend chart.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 p-1">
          {availableTests.map((test) => {
            const latest = getLatestTestValue(reports, test);
            const sparkData = buildTrendData(reports, test);
            return (
              <button
                key={test}
                onClick={() => setSelectedTest(test)}
                className="text-left rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary/50 hover:shadow-md transition-all active:scale-95"
              >
                <p className="text-[10px] text-muted-foreground truncate mb-1">{test}</p>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">{latest?.value ?? "—"}</p>
                    {latest && (
                      <span
                        className="inline-block mt-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                        style={{ backgroundColor: `${latest.fill}20`, color: latest.fill }}
                      >
                        {STATUS_LABELS[latest.status] || latest.status}
                      </span>
                    )}
                  </div>
                  <MiniSparkline data={sparkData} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Detail view for a selected test
  return (
    <div className="space-y-3">
      {/* Back + test tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedTest(null)}
          className="flex-shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          ← All Tests
        </button>
        {availableTests.map((test) => (
          <button
            key={test}
            onClick={() => setSelectedTest(test)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedTest === test
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
          >
            {test}
          </button>
        ))}
      </div>

      {/* Chart card */}
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm text-foreground">{selectedTest}</h4>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleDownloadPdf}
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
              {latestRef && (
                <div className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: latestRef.fill }} />
                  <span className="text-[10px] text-muted-foreground">{STATUS_LABELS[latestRef.status]}</span>
                </div>
              )}
            </div>
          </div>
          <div ref={chartRef} className="bg-card p-2 rounded-lg">
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
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<StatusTooltip />} />
                  {latestRef?.refMin != null && latestRef?.refMax != null && (
                    <ReferenceArea y1={latestRef.refMin} y2={latestRef.refMax} fill="#22c55e" fillOpacity={0.08} strokeOpacity={0} />
                  )}
                  {latestRef?.refMin != null && (
                    <ReferenceLine y={latestRef.refMin} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5}
                      label={{ value: "Min", position: "left", style: { fontSize: 9, fill: "#22c55e" } }} />
                  )}
                  {latestRef?.refMax != null && (
                    <ReferenceLine y={latestRef.refMax} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5}
                      label={{ value: "Max", position: "left", style: { fontSize: 9, fill: "#22c55e" } }} />
                  )}
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--muted-foreground))" strokeWidth={2}
                    strokeOpacity={0.4} dot={<StatusDot />} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data table */}
            <div className="mt-4 space-y-1">
              {trendData.map((point, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground">{point.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{point.value}</span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: `${point.fill}15`, color: point.fill }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: point.fill }} />
                      {STATUS_LABELS[point.status] || point.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
