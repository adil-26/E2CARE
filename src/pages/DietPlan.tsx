import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMyDietPlans, type DietPlan as DietPlanType } from "@/hooks/useDietPlans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Apple, ArrowLeft, CheckCircle2, AlertTriangle, Droplets, Flame, Sparkles, UtensilsCrossed,
} from "lucide-react";

function PlanCard({ plan }: { plan: DietPlanType }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Apple className="h-5 w-5 text-primary" /> {plan.title}
            </CardTitle>
            {plan.goal && <CardDescription className="mt-1">{plan.goal}</CardDescription>}
          </div>
          <div className="flex gap-2">
            {plan.ai_generated && (
              <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> AI assisted</Badge>
            )}
            <Badge variant={plan.status === "active" ? "default" : "outline"}>{plan.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="flex flex-wrap gap-3">
          {plan.calorie_target && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
              <Flame className="h-4 w-4 text-orange-500" /> {plan.calorie_target} kcal / day
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <Droplets className="h-4 w-4 text-blue-500" /> {plan.water_target_glasses} glasses of water
          </div>
        </div>

        <div className="space-y-3">
          {plan.meals.map((meal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative rounded-xl border p-4 pl-5"
            >
              <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary/60" />
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-medium">
                  <UtensilsCrossed className="h-4 w-4 text-primary" /> {meal.name}
                </p>
                {meal.time && <span className="text-sm text-muted-foreground">{meal.time}</span>}
              </div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {meal.items.map((item, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="text-primary">•</span> {item}
                  </li>
                ))}
              </ul>
              {meal.notes && <p className="mt-2 text-xs italic text-muted-foreground">{meal.notes}</p>}
            </motion.div>
          ))}
        </div>

        {(plan.guidelines.include.length > 0 || plan.guidelines.avoid.length > 0) && (
          <>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              {plan.guidelines.include.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Include
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {plan.guidelines.include.map((it, i) => <li key={i}>• {it}</li>)}
                  </ul>
                </div>
              )}
              {plan.guidelines.avoid.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1 text-sm font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4" /> Avoid
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {plan.guidelines.avoid.map((it, i) => <li key={i}>• {it}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {plan.ai_rationale && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Why this plan: </span>{plan.ai_rationale}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DietPlan() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading } = useMyDietPlans();

  const active = plans.filter((p) => p.status === "active");
  const past = plans.filter((p) => p.status !== "active");

  return (
    <div className="container max-w-3xl space-y-6 py-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">My Daily Diet</h1>
        <p className="text-muted-foreground">
          The everyday meal plan prescribed by your doctor, tailored to your medical history.
        </p>
      </header>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading your diet plan…</p>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Apple className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No diet plan yet</p>
            <p className="text-sm text-muted-foreground">
              Your doctor will publish a daily diet plan here after your consultation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {active.map((p) => <PlanCard key={p.id} plan={p} />)}
          {past.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground">Previous plans</h2>
              {past.map((p) => <PlanCard key={p.id} plan={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
