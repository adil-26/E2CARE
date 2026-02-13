import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Fetch all user medical data in parallel
    const [
      profileRes,
      vitalsRes,
      medsRes,
      historyRes,
      reportsRes,
      routineRes,
    ] = await Promise.all([
      adminClient.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      adminClient.from("vitals").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(20),
      adminClient.from("medications").select("*").eq("user_id", user.id).eq("is_active", true),
      adminClient.from("medical_history").select("*").eq("user_id", user.id).maybeSingle(),
      adminClient.from("medical_reports").select("id, title, report_type, report_date, ai_summary, extracted_data, status").eq("user_id", user.id).eq("status", "completed").order("report_date", { ascending: false }).limit(10),
      adminClient.from("daily_routines").select("*").eq("user_id", user.id).order("routine_date", { ascending: false }).limit(7),
    ]);

    // Build medical context
    const profile = profileRes.data;
    const vitals = vitalsRes.data || [];
    const medications = medsRes.data || [];
    const history = historyRes.data;
    const reports = reportsRes.data || [];
    const routines = routineRes.data || [];

    let medicalContext = "## Patient Medical Context\n\n";

    // Profile
    if (profile) {
      medicalContext += `### Profile\n`;
      if (profile.full_name) medicalContext += `- Name: ${profile.full_name}\n`;
      if (profile.date_of_birth) medicalContext += `- Date of Birth: ${profile.date_of_birth}\n`;
      if (profile.gender) medicalContext += `- Gender: ${profile.gender}\n`;
      if (profile.blood_group) medicalContext += `- Blood Group: ${profile.blood_group}\n`;
      medicalContext += "\n";
    }

    // Recent vitals
    if (vitals.length > 0) {
      medicalContext += `### Recent Vitals (latest readings)\n`;
      const latestByType = new Map<string, any>();
      vitals.forEach((v: any) => {
        if (!latestByType.has(v.vital_type)) {
          latestByType.set(v.vital_type, v);
        }
      });
      latestByType.forEach((v) => {
        medicalContext += `- ${v.vital_type}: ${v.value} ${v.unit} (${v.status}) — ${v.recorded_at}\n`;
      });
      medicalContext += "\n";
    }

    // Active medications
    if (medications.length > 0) {
      medicalContext += `### Active Medications\n`;
      medications.forEach((m: any) => {
        medicalContext += `- ${m.name} ${m.dosage}, ${m.frequency}`;
        if (m.prescribed_by) medicalContext += ` (prescribed by: ${m.prescribed_by})`;
        medicalContext += "\n";
      });
      medicalContext += "\n";
    }

    // Medical history
    if (history) {
      medicalContext += `### Medical History\n`;
      if (history.medical_conditions && Object.keys(history.medical_conditions).length > 0) {
        medicalContext += `- Medical Conditions: ${JSON.stringify(history.medical_conditions)}\n`;
      }
      if (history.allergies && Object.keys(history.allergies).length > 0) {
        medicalContext += `- Allergies: ${JSON.stringify(history.allergies)}\n`;
      }
      if (history.surgeries && Object.keys(history.surgeries).length > 0) {
        medicalContext += `- Surgeries: ${JSON.stringify(history.surgeries)}\n`;
      }
      if (history.family_history && Object.keys(history.family_history).length > 0) {
        medicalContext += `- Family History: ${JSON.stringify(history.family_history)}\n`;
      }
      if (history.lifestyle && Object.keys(history.lifestyle).length > 0) {
        medicalContext += `- Lifestyle: ${JSON.stringify(history.lifestyle)}\n`;
      }
      if (history.childhood_illnesses && Object.keys(history.childhood_illnesses).length > 0) {
        medicalContext += `- Childhood Illnesses: ${JSON.stringify(history.childhood_illnesses)}\n`;
      }
      if (history.body_systems && Object.keys(history.body_systems).length > 0) {
        medicalContext += `- Body Systems Review: ${JSON.stringify(history.body_systems)}\n`;
      }
      if (history.gender_health && Object.keys(history.gender_health).length > 0) {
        medicalContext += `- Gender-Specific Health: ${JSON.stringify(history.gender_health)}\n`;
      }
      if (history.birth_history && Object.keys(history.birth_history).length > 0) {
        medicalContext += `- Birth History: ${JSON.stringify(history.birth_history)}\n`;
      }
      medicalContext += "\n";
    }

    // Recent reports
    if (reports.length > 0) {
      medicalContext += `### Recent Medical Reports\n`;
      reports.forEach((r: any) => {
        medicalContext += `- **${r.title}** (${r.report_type}, ${r.report_date || "no date"})\n`;
        if (r.ai_summary) medicalContext += `  Summary: ${r.ai_summary}\n`;
        if (r.extracted_data?.test_results) {
          const abnormal = r.extracted_data.test_results.filter(
            (t: any) => t.status !== "normal" && t.status !== "unknown"
          );
          if (abnormal.length > 0) {
            medicalContext += `  Abnormal results: ${abnormal.map((t: any) => `${t.test_name}: ${t.value} ${t.unit || ""} (${t.status})`).join("; ")}\n`;
          }
        }
      });
      medicalContext += "\n";
    }

    // Daily routines
    if (routines.length > 0) {
      medicalContext += `### Recent Daily Routines (last 7 days)\n`;
      routines.forEach((r: any) => {
        medicalContext += `- ${r.routine_date}: Sleep ${r.sleep_hours}h, Steps ${r.steps}, Exercise ${r.exercise_minutes}min, Water ${r.water_glasses} glasses`;
        if (r.calories_consumed) medicalContext += `, Calories ${r.calories_consumed}`;
        medicalContext += "\n";
      });
      medicalContext += "\n";
    }

    console.log("Medical context length:", medicalContext.length);

    const systemPrompt = `You are an AI Health Assistant for a personal health app. You have access to the patient's complete medical data provided below. Use this data to give personalized, evidence-based health guidance.

RULES:
- Always be empathetic, clear, and helpful.
- Reference the patient's actual data when answering questions (e.g., "Based on your recent blood pressure reading of 130/85...").
- Provide actionable advice for lifestyle, diet, and exercise.
- Flag concerning trends or abnormal values proactively.
- If asked about medications, reference their current prescriptions.
- Always recommend consulting their doctor for serious concerns.
- Never diagnose conditions — suggest possibilities and recommend professional evaluation.
- Use markdown formatting: bold for emphasis, bullet points for lists, headers for sections.
- Keep responses concise but thorough.
- If the patient's data is empty for a section, acknowledge it and suggest they fill it in.

${medicalContext}`;

    // Stream response from Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("health-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
