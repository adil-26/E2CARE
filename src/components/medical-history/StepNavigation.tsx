import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

interface Step {
  key: string;
  label: string;
  icon: string;
}

interface StepNavigationProps {
  steps: readonly Step[];
  currentStep: number;
  onStepChange: (index: number) => void;
  filledSteps: Record<string, Record<string, any>>;
  completionPercent: number;
}

export default function StepNavigation({
  steps,
  currentStep,
  onStepChange,
  filledSteps,
  completionPercent,
}: StepNavigationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active step on mobile
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      const offset = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [currentStep]);

  return (
    <>
      {/* Desktop vertical stepper */}
      <div className="hidden md:block">
        <div className="sticky top-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-primary">{completionPercent}%</span>
            </div>
          </div>

          <nav className="space-y-1">
            {steps.map((step, i) => {
              const filled = Object.keys(filledSteps[step.key] || {}).length > 0;
              const isActive = i === currentStep;
              const isPast = i < currentStep;

              return (
                <button
                  key={step.key}
                  onClick={() => onStepChange(i)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : filled
                      ? "text-foreground hover:bg-accent"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    {filled ? (
                      <CheckCircle2 className={cn("h-5 w-5", isActive ? "text-primary" : "text-primary/60")} />
                    ) : (
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                        isActive
                          ? "border-primary text-primary"
                          : "border-muted-foreground/30 text-muted-foreground/50"
                      )}>
                        {i + 1}
                      </div>
                    )}
                    {i < steps.length - 1 && (
                      <div className={cn(
                        "absolute left-1/2 top-full h-3 w-0.5 -translate-x-1/2",
                        filled || isPast ? "bg-primary/30" : "bg-border"
                      )} />
                    )}
                  </div>

                  <span className="text-base leading-none">{step.icon}</span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile: horizontal scrollable pill strip */}
      <div className="md:hidden space-y-2.5">
        {/* Progress bar */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-primary whitespace-nowrap">
            {completionPercent}%
          </span>
        </div>

        {/* Scrollable step pills */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {steps.map((step, i) => {
            const filled = Object.keys(filledSteps[step.key] || {}).length > 0;
            const isActive = i === currentStep;

            return (
              <button
                key={step.key}
                ref={isActive ? activeRef : undefined}
                onClick={() => onStepChange(i)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all snap-center flex-shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : filled
                    ? "bg-accent text-foreground"
                    : "bg-muted/60 text-muted-foreground"
                )}
              >
                <span className="text-sm leading-none">{step.icon}</span>
                <span>{step.label}</span>
                {filled && !isActive && (
                  <CheckCircle2 className="h-3 w-3 text-primary/70 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
