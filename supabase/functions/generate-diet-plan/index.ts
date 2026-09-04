import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const patientId = typeof body?.patient_id === "string" ? body.patient_id.trim() : "";
    const goal = typeof body?.goal === "string" ? body.goal.slice(0, 500) : "";
    if (!patientId) return json({ error: "patient_id is required" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);

    // Only the patient themself or a doctor/admin may generate a plan
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const roleList = (roles || []).map((r: any) => r.role);
    const isDoctor = roleList.includes("doctor") || roleList.includes("admin");
    if (!isDoctor && user.id !== patientId) return json({ error: "Forbidden" }, 403);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI is not configured" }, 500);

    const [profileRes, historyRes, vitalsRes, medsRes, routineRes, condRes] = await Promise.all([
      admin.from("profiles").select("full_name, date_of_birth, gender, blood_group").eq("user_id", patientId).maybeSingle(),
      admin.from("medical_history").select("*").eq("user_id", patientId).maybeSingle(),
      admin.from("vitals").select("vital_type, value, unit, status, recorded_at").eq("user_id", patientId).order("recorded_at", { ascending: false }).limit(20),
      admin.from("medications").select("name, dosage, frequency").eq("user_id", patientId).eq("is_active", true),
      admin.from("daily_routines").select("*").eq("user_id", patientId).order("routine_date", { ascending: false }).limit(7),
      admin.from("condition_logs").select("condition_type, value, unit, recorded_at").eq("user_id", patientId).order("recorded_at", { ascending: false }).limit(20),
    ]);

    const h = historyRes.data as any;
    const context = [
      "## Patient Context (this patient only)",
      `Profile: ${JSON.stringify(profileRes.data || {})}`,
      h ? `Medical conditions: ${JSON.stringify(h.medical_conditions || {})}` : "",
      h ? `Allergies: ${JSON.stringify(h.allergies || {})}` : "",
      h ? `Lifestyle: ${JSON.stringify(h.lifestyle || {})}` : "",
      h ? `Family history: ${JSON.stringify(h.family_history || {})}` : "",
      h ? `Body systems: ${JSON.stringify(h.body_systems || {})}` : "",
      `Recent vitals: ${JSON.stringify(vitalsRes.data || [])}`,
      `Active medications: ${JSON.stringify(medsRes.data || [])}`,
      `Recent daily routines: ${JSON.stringify(routineRes.data || [])}`,
      `Condition logs: ${JSON.stringify(condRes.data || [])}`,
      goal ? `Doctor's goal for this plan: ${goal}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are a clinical nutritionist assistant for an Ayurveda-informed healthcare app.
Design a realistic ONE-DAY diet plan the patient repeats daily, based STRICTLY on the provided patient context.
Never invent data about other patients. Respect allergies and medication interactions.
Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{
  "title": string,
  "goal": string,
  "calorie_target": number,
  "water_target_glasses": number,
  "meals": [{ "name": string, "time": string, "items": string[], "notes": string }],
  "guidelines": { "include": string[], "avoid": string[] },
  "ai_rationale": string
}
Use 5-6 meals (Early morning, Breakfast, Mid-morning, Lunch, Evening snack, Dinner) with local, practical foods.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context },
        ],
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) return json({ error: "AI is rate limited. Please retry shortly." }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted. Please add credits to continue." }, 402);
      return json({ error: `AI request failed: ${text.slice(0, 300)}` }, 500);
    }

    const aiJson = await aiRes.json();
    const raw: string = aiJson?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    let plan: any;
    try {
      plan = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) return json({ error: "AI returned an unreadable plan. Try again." }, 500);
      plan = JSON.parse(match[0]);
    }

    return json({ plan });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
