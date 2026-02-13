import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import BodySystemENT from "./body-systems/BodySystemENT";
import BodySystemEyes from "./body-systems/BodySystemEyes";
import BodySystemCardio from "./body-systems/BodySystemCardio";
import BodySystemGI from "./body-systems/BodySystemGI";
import BodySystemUrinary from "./body-systems/BodySystemUrinary";
import BodySystemSkin from "./body-systems/BodySystemSkin";
import BodySystemNeuro from "./body-systems/BodySystemNeuro";
import BodySystemMusculo from "./body-systems/BodySystemMusculo";

interface StepBodySystemsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const systems = [
  { key: "ent", label: "ENT & Teeth", icon: "👂" },
  { key: "eyes", label: "Eyes", icon: "👁️" },
  { key: "cardio", label: "Heart & Lungs", icon: "❤️" },
  { key: "gi", label: "Digestive", icon: "🫁" },
  { key: "urinary", label: "Urinary", icon: "🧪" },
  { key: "skin", label: "Skin & Hair", icon: "🧴" },
  { key: "neuro", label: "Nervous System", icon: "🧠" },
  { key: "musculo", label: "Bones & Joints", icon: "🦴" },
] as const;

export default function StepBodySystems({ data, onChange }: StepBodySystemsProps) {
  const [activeTab, setActiveTab] = useState("ent");
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      const offset = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [activeTab]);

  const updateSystem = (systemKey: string, systemData: Record<string, any>) => {
    onChange({ ...data, [systemKey]: systemData });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Provide detailed information about each body system. Tap a system to begin.
      </p>

      {/* System tabs - horizontal scrollable strip */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {systems.map((sys) => {
          const filled = Object.keys(data[sys.key] || {}).length > 0;
          const isActive = activeTab === sys.key;
          return (
            <button
              key={sys.key}
              ref={isActive ? activeRef : undefined}
              onClick={() => setActiveTab(sys.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-all whitespace-nowrap snap-center flex-shrink-0",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : filled
                  ? "border-border bg-accent/50 text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent active:scale-95"
              )}
            >
              <span className="text-sm">{sys.icon}</span>
              <span>{sys.label}</span>
              {filled && !isActive && <span className="text-primary text-[10px]">✓</span>}
            </button>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="ent" className="mt-0">
          <BodySystemENT data={data.ent || {}} onChange={(d) => updateSystem("ent", d)} />
        </TabsContent>
        <TabsContent value="eyes" className="mt-0">
          <BodySystemEyes data={data.eyes || {}} onChange={(d) => updateSystem("eyes", d)} />
        </TabsContent>
        <TabsContent value="cardio" className="mt-0">
          <BodySystemCardio data={data.cardio || {}} onChange={(d) => updateSystem("cardio", d)} />
        </TabsContent>
        <TabsContent value="gi" className="mt-0">
          <BodySystemGI data={data.gi || {}} onChange={(d) => updateSystem("gi", d)} />
        </TabsContent>
        <TabsContent value="urinary" className="mt-0">
          <BodySystemUrinary data={data.urinary || {}} onChange={(d) => updateSystem("urinary", d)} />
        </TabsContent>
        <TabsContent value="skin" className="mt-0">
          <BodySystemSkin data={data.skin || {}} onChange={(d) => updateSystem("skin", d)} />
        </TabsContent>
        <TabsContent value="neuro" className="mt-0">
          <BodySystemNeuro data={data.neuro || {}} onChange={(d) => updateSystem("neuro", d)} />
        </TabsContent>
        <TabsContent value="musculo" className="mt-0">
          <BodySystemMusculo data={data.musculo || {}} onChange={(d) => updateSystem("musculo", d)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
