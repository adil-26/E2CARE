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
  const [isDownloading, setIsDownloading] = useState(false);
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  // Download PDF logic for all trends
  const handleDownloadPdf = async () => {
    if (!chartWrapperRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(chartWrapperRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * (pdfWidth - 20)) / imgProps.width;

      let topPadding = 30; // padding for title
      let position = topPadding;
      
      pdf.setFontSize(16);
      pdf.text(`Patient Health Trends Report`, 10, 15);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} | Confidential`, 10, 22);

      // Render image starting at topPadding
      pdf.addImage(imgData, "PNG", 10, position, pdfWidth - 20, imgHeight);
      
      let heightLeft = imgHeight - (pageHeight - topPadding);

      // Paginate horizontally long images by adding new pages and shifting the image position UP
      while (heightLeft > 0) {
        position = position - pageHeight + topPadding; // Shift up 
        pdf.addPage();
        
        // Repeated Header for new pages
        pdf.setFontSize(10);
        pdf.text(`Patient Health Trends Report (Continued)`, 10, 10);
        
        pdf.addImage(imgData, "PNG", 10, position, pdfWidth - 20, imgHeight);
        heightLeft -= (pageHeight - 20); // 20 reserved for header/footer margins
      }

      pdf.save(`Health_Trends_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (availableTests.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Upload lab reports with numeric test values to see trends.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-teal-600 rounded-full" />
          <h2 className="text-lg font-bold text-slate-800 m-0">Health Trends</h2>
          <span className="text-[10px] sm:text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-md ml-2 border border-teal-100 hidden sm:inline-block">
            track, compare & gain deep insights into our body vitals
          </span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1.5 text-xs bg-white" 
          onClick={handleDownloadPdf}
          disabled={isDownloading}
        >
          <Download className="h-3.5 w-3.5" />
          {isDownloading ? "Generating PDF..." : "Download Trend Report"}
        </Button>
      </div>

      <div ref={chartWrapperRef} className="grid grid-cols-1 xl:grid-cols-2 gap-4 bg-transparent p-1">
        {availableTests.map((testName) => {
          const trendData = buildTrendData(reports, testName);
          if (trendData.length < 1) return null;

          const latest = trendData[trendData.length - 1];
          const previous = trendData.length > 1 ? trendData[trendData.length - 2] : null;

          // React imports for icons instead of direct lucide imports since they might not be included
          // We'll use simple HTML symbols or standard UI rendering
          let changeIcon = "➖";
          let changeText = "Stable";
          let changeColor = "text-slate-500";
          let changeValue = "0";

          if (previous) {
            const diff = latest.value - previous.value;
            if (diff > 0) {
              changeIcon = "↗";
              changeText = "Increased by";
              changeColor = "text-teal-600";
              changeValue = Math.abs(diff).toFixed(2);
            } else if (diff < 0) {
              changeIcon = "↘";
              changeText = "Reduced by";
              changeColor = "text-teal-600";
              changeValue = Math.abs(diff).toFixed(2);
            }
          }

          const displayRefRange =
            latest.refMin != null && latest.refMax != null
              ? `${latest.refMin} - ${latest.refMax}`
              : "0.0 - 0.0";

          const minData = Math.min(...trendData.map(d => d.value), latest.refMin ?? Infinity);
          const maxData = Math.max(...trendData.map(d => d.value), latest.refMax ?? -Infinity);
          
          let yDomain: [number | 'auto', number | 'auto'] = ['auto', 'auto'];
          if (isFinite(minData) && isFinite(maxData)) {
            const padding = (maxData - minData) * 0.2;
            yDomain = [Math.max(0, minData - padding), maxData + padding];
          }

          return (
            <div key={testName} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
              <div className="flex justify-between items-start mb-5">
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm">{testName}</h3>
                <span
                  className="rounded-full text-[10px] px-2.5 py-0.5 font-medium border"
                  style={{
                    backgroundColor: `${latest.fill}15`,
                    color: latest.fill,
                    borderColor: `${latest.fill}40`
                  }}
                >
                  {STATUS_LABELS[latest.status] || "Good"}
                </span>
              </div>

              <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-semibold mb-0.5">Normal Range</span>
                  <span className="text-[11px] sm:text-xs text-teal-600 font-medium">
                    {displayRefRange} <span className="text-slate-400 font-normal">unit</span>
                  </span>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-medium mb-0.5">Currently</span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800">
                    {latest.value} <span className="text-slate-400 font-normal">unit</span>
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 font-medium mb-0.5">{changeText}</span>
                  <div className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold ${changeColor}`}>
                    <span className="text-sm leading-none">{changeIcon}</span>
                    <span>{changeValue} <span className="font-normal text-slate-500">unit</span></span>
                  </div>
                </div>
              </div>

              <div className="h-[140px] w-full mt-4 bg-slate-50/50 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                      {latest.refMin != null && latest.refMax != null && (
                        <ReferenceArea
                          y1={latest.refMin}
                          y2={latest.refMax}
                          fill="#d1fae5"
                          fillOpacity={0.6}
                          strokeOpacity={0}
                        />
                      )}

                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9, fill: "#94a3b8" }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        domain={yDomain as any}
                        tick={{ fontSize: 9, fill: "#94a3b8" }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        dx={-10}
                      />
                      <Tooltip content={<StatusTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0f766e"
                        strokeWidth={2}
                        dot={<StatusDot />}
                        activeDot={{ r: 6, stroke: "#0f766e", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
