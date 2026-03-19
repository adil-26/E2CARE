import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MedicalReport } from "@/hooks/useMedicalReports";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, Info } from "lucide-react";
import { processReportsForComparison, ComparisonItem } from "@/utils/healthDataUtils";
import React from "react";

interface ComparisonTableProps {
  reports: MedicalReport[];
}

const statusColors: Record<string, string> = {
  normal: "text-green-600",
  high: "text-red-600",
  low: "text-blue-600",
  critical: "text-red-800 font-bold",
  unknown: "text-muted-foreground",
  finding: "text-foreground font-medium",
};

export default function ComparisonTable({ reports }: ComparisonTableProps) {
  const { sortedReports, comparisonItems, categories } = useMemo(() => 
    processReportsForComparison(reports), [reports]
  );

  if (sortedReports.length < 1) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Upload reports to see a comparison table.</p>
        </CardContent>
      </Card>
    );
  }

  const renderChangeIcon = (item: ComparisonItem) => {
    switch (item.change) {
      case "rising":
        return (
          <div className="flex items-center justify-center gap-1 text-red-600 font-medium">
            <ArrowUp className="h-3 w-3" />
            <span>{item.percentChange}%</span>
          </div>
        );
      case "dropping":
        return (
          <div className="flex items-center justify-center gap-1 text-green-600 font-medium">
            <ArrowDown className="h-3 w-3" />
            <span>{Math.abs(parseFloat(item.percentChange || "0"))}%</span>
          </div>
        );
      case "stable":
        return <span className="text-muted-foreground whitespace-nowrap">Stable</span>;
      case "initial":
        return <Badge variant="outline" className="text-[9px] border-amber-200 bg-amber-50 text-amber-700">Initial</Badge>;
      case "persistent":
        return <span className="text-muted-foreground">Persistent</span>;
      case "updated":
        return <Badge variant="outline" className="text-[9px] border-blue-200 bg-blue-50 text-blue-700">Updated</Badge>;
      case "new":
        return <Badge variant="outline" className="text-[9px] border-green-200 bg-green-50 text-green-700">New</Badge>;
      default:
        return <Minus className="h-3 w-3 mx-auto text-muted-foreground opacity-30" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-2">
        <Info className="h-4 w-4 text-primary" />
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Showing comparison across {sortedReports.length} report{sortedReports.length > 1 ? 's' : ''}. Includes numeric tests and qualitative findings.
        </p>
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="p-4 text-xs font-semibold text-foreground sticky left-0 bg-muted/50 z-10 w-[200px]">Feature / Test Name</th>
              {sortedReports.map(r => (
                <th key={r.id} className="p-4 text-xs font-semibold text-foreground text-center">
                  <div className="flex flex-col">
                    <span>{r.report_date ? new Date(r.report_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' }) : "New Report"}</span>
                    <span className="text-[10px] font-normal text-muted-foreground opacity-70 truncate max-w-[100px] mx-auto">{r.title}</span>
                  </div>
                </th>
              ))}
              <th className="p-4 text-xs font-semibold text-foreground text-center bg-primary/5">Changes</th>
              <th className="p-4 text-xs font-semibold text-foreground text-center bg-primary/10">What this means</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <React.Fragment key={category}>
                <tr className="bg-muted/20">
                  <td colSpan={sortedReports.length + 3} className="p-2 px-4 text-[10px] font-bold text-primary uppercase tracking-wider">
                    {category}
                  </td>
                </tr>
                {comparisonItems.filter(i => i.category === category).map(item => (
                  <tr key={item.name} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                    <td className="p-4 py-3 text-xs font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border/30">
                      {item.name}
                      {item.unit && <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">{item.unit}</span>}
                    </td>
                    {item.values.map((v, idx) => (
                      <td key={idx} className="p-4 py-3 text-center">
                        {v ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-[10px] sm:text-xs font-semibold max-w-[150px] line-clamp-2 ${statusColors[v.status] || 'text-foreground'}`}>
                              {v.value}
                            </span>
                            {v.status !== 'finding' && (
                              <Badge variant="outline" className={`text-[8px] py-0 h-4 ${v.status === 'normal' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                {v.status}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 text-[10px">—</span>
                        )}
                      </td>
                    ))}
                    <td className="p-4 py-3 text-center text-[10px] bg-primary/5 border-l border-primary/10">
                      {renderChangeIcon(item)}
                    </td>
                    <td className="p-4 py-3 text-[10px] leading-relaxed text-muted-foreground w-[180px] bg-primary/10 border-l border-primary/20">
                      {item.interpretation}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-600" />
          <span className="text-[10px] text-muted-foreground">Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-600" />
          <span className="text-[10px] text-muted-foreground">High/Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
          <span className="text-[10px] text-muted-foreground">Low</span>
        </div>
      </div>
    </div>
  );
}
