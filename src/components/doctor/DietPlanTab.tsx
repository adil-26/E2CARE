import { useState } from "react";
import { motion } from "framer-motion";
import { useDietPlans, generateAiDietPlan, type DietMeal, type DietPlan } from "@/hooks/useDietPlans";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Apple, Sparkles, Loader2, Plus, Trash2, Save, CheckCircle2,
  AlertTriangle, Droplets, Flame, Clock, Pencil, X,
} from "lucide-react";

const emptyMeal = (): DietMeal => ({ name: "", time: "", items: [""], notes: "" });

interface Props {
  patientId: string;
}

export default function DietPlanTab({ patientId }: Props) {
  const { plans, isLoading, savePlan, deletePlan, setStatus } = useDietPlans(patientId);
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [generating, setGenerating] = useState(false);

  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [calories, setCalories] = useState<string>("");
  const [water, setWater] = useState<string>("8");
  const [meals, setMeals] = useState<DietMeal[]>([emptyMeal()]);
  const [include, setInclude] = useState<string[]>([""]);
  const [avoid, setAvoid] = useState<string[]>([""]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  const resetForm = () => {
    setEditId(undefined);
    setTitle("");
    setGoal("");
    setCalories("");
    setWater("8");
    setMeals([emptyMeal()]);
    setInclude([""]);
    setAvoid([""]);
    setAiGenerated(false);
    setAiRationale(null);
  };

  const startNew = () => {
    resetForm();
    setEditing(true);
  };

  const startEdit = (plan: DietPlan) => {
    setEditId(plan.id);
    setTitle(plan.title);
    setGoal(plan.goal || "");
    setCalories(plan.calorie_target ? String(plan.calorie_target) : "");
    setWater(String(plan.water_target_glasses ?? 8));
    setMeals(plan.meals.length ? plan.meals : [emptyMeal()]);
    setInclude(plan.guidelines.include.length ? plan.guidelines.include : [""]);
    setAvoid(plan.guidelines.avoid.length ? plan.guidelines.avoid : [""]);
    setAiGenerated(plan.ai_generated);
    setAiRationale(plan.ai_rationale);
    setEditing(true);
  };

  const runAi = async () => {
    setGenerating(true);
    try {
      const plan = await generateAiDietPlan(patientId, goal);
      setTitle(plan.title || "AI Daily Diet Plan");
      setGoal(plan.goal || goal);
      setCalories(plan.calorie_target ? String(plan.calorie_target) : "");
      setWater(String(plan.water_target_glasses || 8));
      setMeals(
        (plan.meals || []).map((m) => ({
          name: m.name || "",
          time: m.time || "",
          items: Array.isArray(m.items) && m.items.length ? m.items : [""],
          notes: m.notes || "",
        })),
      );
      setInclude(plan.guidelines?.include?.length ? plan.guidelines.include : [""]);
      setAvoid(plan.guidelines?.avoid?.length ? plan.guidelines.avoid : [""]);
      setAiGenerated(true);
      setAiRationale(plan.ai_rationale || null);
      setEditing(true);
      toast({ title: "AI draft ready", description: "Review and edit before publishing to the patient." });
    } catch (e: any) {
      toast({ title: "AI could not generate a plan", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const updateMeal = (i: number, patch: Partial<DietMeal>) =>
    setMeals((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  const updateItem = (mealIdx: number, itemIdx: number, value: string) =>
    setMeals((prev) =>
      prev.map((m, idx) =>
        idx === mealIdx ? { ...m, items: m.items.map((it, j) => (j === itemIdx ? value : it)) } : m,
      ),
    );

  const handleSave = () => {
    if (!title.trim()) {
      toast({ title: "Add a plan title", variant: "destructive" });
      return;
    }
    const cleanMeals = meals
      .map((m) => ({ ...m, items: m.items.map((i) => i.trim()).filter(Boolean) }))
      .filter((m) => m.name.trim() && m.items.length);
    if (!cleanMeals.length) {
      toast({ title: "Add at least one meal with food items", variant: "destructive" });
      return;
    }
    savePlan.mutate(
      {
        id: editId,
        patient_id: patientId,
        title: title.trim(),
        goal: goal.trim(),
        meals: cleanMeals,
        guidelines: {
          include: include.map((i) => i.trim()).filter(Boolean),
          avoid: avoid.map((i) => i.trim()).filter(Boolean),
        },
        water_target_glasses: Number(water) || 8,
        calorie_target: calories ? Number(calories) : null,
        ai_generated: aiGenerated,
        ai_rationale: aiRationale,
      },
      {
        onSuccess: () => {
          setEditing(false);
          resetForm();
        },
      },
    );
  };

  const listEditor = (
    values: string[],
    setter: (v: string[]) => void,
    placeholder: string,
    tone: "include" | "avoid",
  ) => (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={v}
            placeholder={placeholder}
            onChange={(e) => setter(values.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setter(values.filter((_, j) => j !== i).length ? values.filter((_, j) => j !== i) : [""])}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => setter([...values, ""])} className="w-full">
        <Plus className="mr-1 h-3 w-3" /> Add {tone === "include" ? "food to include" : "food to avoid"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <Apple className="h-4 w-4 text-primary" /> Daily Diet Plan
          </h3>
          <p className="text-sm text-muted-foreground">
            Build the patient's everyday meal schedule — it appears instantly in their app.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={runAi} disabled={generating}>
            {generating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
            AI draft from history
          </Button>
          {!editing && (
            <Button size="sm" onClick={startNew}>
              <Plus className="mr-1 h-4 w-4" /> New plan
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{editId ? "Edit diet plan" : "New diet plan"}</CardTitle>
                <CardDescription>
                  {aiGenerated ? "AI draft — review clinically before publishing." : "Manual plan"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setEditing(false); resetForm(); }}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Plan title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diabetes-friendly daily diet" />
                </div>
                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Stabilise blood sugar, reduce acidity" />
                </div>
                <div className="space-y-2">
                  <Label>Daily calorie target</Label>
                  <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="1800" />
                </div>
                <div className="space-y-2">
                  <Label>Water target (glasses/day)</Label>
                  <Input type="number" value={water} onChange={(e) => setWater(e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Meals through the day</Label>
                {meals.map((meal, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        className="flex-1"
                        value={meal.name}
                        placeholder="Meal name (e.g. Breakfast)"
                        onChange={(e) => updateMeal(i, { name: e.target.value })}
                      />
                      <Input
                        className="w-32"
                        value={meal.time}
                        placeholder="08:00 AM"
                        onChange={(e) => updateMeal(i, { time: e.target.value })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMeals(meals.length > 1 ? meals.filter((_, j) => j !== i) : [emptyMeal()])}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    {meal.items.map((item, j) => (
                      <div key={j} className="flex gap-2">
                        <Input
                          value={item}
                          placeholder="e.g. 2 idli + sambar"
                          onChange={(e) => updateItem(i, j, e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateMeal(i, {
                              items: meal.items.length > 1 ? meal.items.filter((_, k) => k !== j) : [""],
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateMeal(i, { items: [...meal.items, ""] })}>
                        <Plus className="mr-1 h-3 w-3" /> Add food item
                      </Button>
                    </div>
                    <Textarea
                      value={meal.notes || ""}
                      placeholder="Notes for this meal (optional)"
                      onChange={(e) => updateMeal(i, { notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setMeals([...meals, emptyMeal()])} className="w-full">
                  <Plus className="mr-1 h-3 w-3" /> Add meal
                </Button>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Foods to include
                  </Label>
                  {listEditor(include, setInclude, "e.g. Warm water with lemon", "include")}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-3 w-3" /> Foods to avoid
                  </Label>
                  {listEditor(avoid, setAvoid, "e.g. Deep-fried snacks", "avoid")}
                </div>
              </div>

              {aiRationale && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">AI rationale: </span>
                  {aiRationale}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => { setEditing(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleSave} disabled={savePlan.isPending}>
                  {savePlan.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {editId ? "Update plan" : "Publish to patient"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Loading diet plans…</p>
      ) : plans.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No diet plan created for this patient yet.</p>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{plan.title}</CardTitle>
                    <CardDescription>{plan.goal}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.ai_generated && (
                      <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> AI</Badge>
                    )}
                    <Badge variant={plan.status === "active" ? "default" : "outline"}>{plan.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(plan)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePlan.mutate(plan.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {plan.calorie_target && (
                    <span className="flex items-center gap-1"><Flame className="h-3 w-3" /> {plan.calorie_target} kcal/day</span>
                  )}
                  <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {plan.water_target_glasses} glasses</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {plan.meals.map((meal, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">
                        {meal.name} {meal.time && <span className="text-muted-foreground">· {meal.time}</span>}
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-sm text-muted-foreground">
                        {meal.items.map((it, j) => <li key={j}>{it}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                {plan.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => setStatus.mutate({ id: plan.id, status: "archived" })}>
                    Archive plan
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setStatus.mutate({ id: plan.id, status: "active" })}>
                    Re-activate
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
