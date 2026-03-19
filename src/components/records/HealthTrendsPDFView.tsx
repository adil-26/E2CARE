import React, { useMemo } from "react";
import { MedicalReport } from "@/hooks/useMedicalReports";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceArea, ReferenceLine,
} from "recharts";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  getAvailableTests,
  buildTrendData,
} from "@/utils/healthDataUtils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HealthTrendsPDFViewProps {
  reports: MedicalReport[];
}

function StatusDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  return <circle cx={cx} cy={cy} r={4} fill={payload?.fill || STATUS_COLORS.unknown} stroke="#ffffff" strokeWidth={1.5} />;
}

export default function HealthTrendsPDFView({ reports }: HealthTrendsPDFViewProps) {
  const availableTests = useMemo(() => getAvailableTests(reports), [reports]);

  if (availableTests.length === 0) {
    return null;
  }

  return (
    <div
      id="pdf-health-trends"
      className="bg-[#fafafa] p-6 w-[1000px] min-h-[500px]"
      style={{
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-teal-600 rounded-full" />
        <h2 className="text-xl font-bold text-slate-800 m-0">Health Trends</h2>
        <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-md ml-2 border border-teal-100">
          track, compare & gain deep insights into our body vitals
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "1rem",
        }}
      >
        {availableTests.map((testName) => {
          const trendData = buildTrendData(reports, testName);
          if (trendData.length < 1) return null;

          const latest = trendData[trendData.length - 1];
          const previous = trendData.length > 1 ? trendData[trendData.length - 2] : null;

          let changeIcon = <Minus className="h-4 w-4 text-slate-400" />;
          let changeText = "Stable";
          let changeColor = "text-slate-500";
          let changeValue = "0";

          if (previous) {
            const diff = latest.value - previous.value;
            if (diff > 0) {
              changeIcon = <TrendingUp className="h-4 w-4 text-teal-600" />;
              changeText = "Increased by";
              changeColor = "text-teal-600";
              changeValue = Math.abs(diff).toFixed(2);
            } else if (diff < 0) {
              changeIcon = <TrendingDown className="h-4 w-4 text-teal-600" />;
              changeText = "Reduced by";
              changeColor = "text-teal-600";
              changeValue = Math.abs(diff).toFixed(2);
            }
          }

          // Format ranges for display
          const displayRefRange =
            latest.refMin != null && latest.refMax != null
              ? `${latest.refMin} - ${latest.refMax}`
              : "0.0 - 0.0";

          // Calculate a small padding for Y-axis domain to make charts look good
          const minData = Math.min(...trendData.map(d => d.value), latest.refMin ?? Infinity);
          const maxData = Math.max(...trendData.map(d => d.value), latest.refMax ?? -Infinity);
          
          let yDomain: [number | 'auto', number | 'auto'] = ['auto', 'auto'];
          if (isFinite(minData) && isFinite(maxData)) {
            const padding = (maxData - minData) * 0.2;
            yDomain = [Math.max(0, minData - padding), maxData + padding];
          }

          return (
            <div key={testName} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative break-inside-avoid">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-800 text-sm mb-4">{testName}</h3>
                <Badge
                  className="rounded-full text-[10px] px-2.5 py-0.5 border-0 font-medium"
                  style={{
                    backgroundColor: `${latest.fill}15`,
                    color: latest.fill,
                  }}
                  variant="outline"
                >
                  {STATUS_LABELS[latest.status] || "Good"}
                </Badge>
              </div>

              <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium font-semibold mb-0.5">Normal Range</span>
                  <span className="text-[11px] text-teal-600 font-medium">
                    {displayRefRange} <span className="text-slate-400 font-normal">unit</span>
                  </span>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-medium mb-0.5">Currently</span>
                  <span className="text-[11px] font-bold text-slate-800">
                    {latest.value} <span className="text-slate-400 font-normal">unit</span>
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 font-medium mb-0.5">{changeText}</span>
                  <div className={`flex items-center gap-1 text-[11px] font-bold ${changeColor}`}>
                    {changeIcon}
                    <span>{changeValue} <span className="font-normal">unit</span></span>
                  </div>
                </div>
              </div>

              <div className="h-[120px] w-full mt-4 bg-[#fcfcfc] rounded-lg relative overflow-hidden flex items-center justify-center">
                  <LineChart width={440} height={120} data={trendData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                     {/* Safe Reference Area Background */}
                     {latest.refMin != null && latest.refMax != null && (
                      <ReferenceArea
                        y1={latest.refMin}
                        y2={latest.refMax}
                        fill="#d1fae5" // Light green background for normal range
                        fillOpacity={0.6}
                        strokeOpacity={0}
                      />
                    )}

                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      domain={yDomain as any}
                      tick={{ fontSize: 9, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                      dx={-10}
                    />
                    
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0f766e" // Teal line color
                      strokeWidth={1.5}
                      dot={<StatusDot />}
                      isAnimationActive={false} // Disable animation for PDF capture
                    />
                  </LineChart>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
