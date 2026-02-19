import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reportId, imageBase64, reportType, fileType } = await req.json();
    console.log(`Analyzing report ${reportId} for user ${user.id}, type: ${reportType}, fileType: ${fileType}`);

    if (!reportId || !imageBase64) {
      return new Response(JSON.stringify({ error: "reportId and imageBase64 are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status to processing
    await supabase
      .from("medical_reports")
      .update({ status: "processing" })
      .eq("id", reportId)
      .eq("user_id", user.id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system prompt based on report type
    const systemPrompts: Record<string, string> = {
      lab: `You are a medical report OCR and analysis expert. Extract ALL test results from this lab/blood test report image. Return a JSON object with tool calling.
For each test found, extract: test_name, value (numeric if possible), unit, reference_range (as string), status (normal/high/low/critical).
Also provide a plain-language summary of the key findings, abnormalities, and what they may indicate.`,
      imaging: `You are a medical imaging report analyst. Extract key findings from this imaging report (X-ray, MRI, CT, Ultrasound). Return structured findings.
Extract: modality, body_part, findings (array of observations), impression, recommendations.
Also provide a plain-language summary.`,
      prescription: `You are a prescription reader. Extract all medications from this prescription image.
For each medication extract: name, dosage, frequency, duration, route, instructions.
Also provide a summary of the prescription.`,
      discharge: `You are a medical document analyst. Extract key information from this hospital discharge summary.
Extract: admission_date, discharge_date, diagnosis, procedures_performed, medications_at_discharge, follow_up_instructions.
Also provide a plain-language summary.`,
    };

    const systemPrompt = systemPrompts[reportType] || systemPrompts.lab;

    // Call Lovable AI with the image
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${fileType || "image/jpeg"};base64,${imageBase64}` },
              },
              {
                type: "text",
                text: `Analyze this ${reportType} medical report image. Extract all data and provide a comprehensive summary.`,
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_report_data",
              description: "Extract structured data from the medical report",
              parameters: {
                type: "object",
                properties: {
                  report_title: {
                    type: "string",
                    description: "Title or type of the report",
                  },
                  report_date: {
                    type: "string",
                    description: "Date of the report in YYYY-MM-DD format if visible",
                  },
                  patient_name: {
                    type: "string",
                    description: "Patient name if visible",
                  },
                  lab_name: {
                    type: "string",
                    description: "Lab or hospital name if visible",
                  },
                  test_results: {
                    type: "array",
                    description: "Array of individual test results",
                    items: {
                      type: "object",
                      properties: {
                        test_name: { type: "string" },
                        value: { type: "string" },
                        unit: { type: "string" },
                        reference_range: { type: "string" },
                        status: {
                          type: "string",
                          enum: ["normal", "high", "low", "critical", "unknown"],
                        },
                        category: {
                          type: "string",
                          description: "Category like CBC, Lipid Panel, Thyroid, Liver, Kidney, etc.",
                        },
                      },
                      required: ["test_name", "value", "status"],
                    },
                  },
                  medications: {
                    type: "array",
                    description: "Medications found in the report",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        dosage: { type: "string" },
                        frequency: { type: "string" },
                        duration: { type: "string" },
                        instructions: { type: "string" },
                      },
                      required: ["name"],
                    },
                  },
                  findings: {
                    type: "array",
                    description: "Key findings or observations",
                    items: { type: "string" },
                  },
                  summary: {
                    type: "string",
                    description: "Plain-language summary of the report findings, abnormalities, and recommendations",
                  },
                },
                required: ["report_title", "summary"],
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "extract_report_data" },
        },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`AI gateway error [${aiResponse.status}]:`, errText);

      if (aiResponse.status === 429) {
        await supabase
          .from("medical_reports")
          .update({ status: "failed" })
          .eq("id", reportId);
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        await supabase
          .from("medical_reports")
          .update({ status: "failed" })
          .eq("id", reportId);
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received:", JSON.stringify(aiData).substring(0, 500));

    // Extract structured data from tool call
    let extractedData: any = {};
    let aiSummary = "";

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        extractedData = JSON.parse(toolCall.function.arguments);
        aiSummary = extractedData.summary || "";
      } catch (parseErr) {
        console.error("Failed to parse tool call arguments:", parseErr);
        // Fallback: use the message content
        aiSummary = aiData.choices?.[0]?.message?.content || "Analysis completed but structured extraction failed.";
      }
    } else {
      // No tool call, use content directly
      aiSummary = aiData.choices?.[0]?.message?.content || "Analysis completed.";
    }

    // Update the report with extracted data
    const updatePayload: any = {
      status: "completed",
      extracted_data: extractedData,
      ai_summary: aiSummary,
    };

    // If AI found a report date, update it
    if (extractedData.report_date) {
      updatePayload.report_date = extractedData.report_date;
    }

    // If AI found a better title, update it
    if (extractedData.report_title && extractedData.report_title !== "Unknown") {
      updatePayload.title = extractedData.report_title;
    }

    const { error: updateError } = await supabase
      .from("medical_reports")
      .update(updatePayload)
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update report:", updateError);
      throw updateError;
    }

    console.log(`Report ${reportId} analyzed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        extracted_data: extractedData,
        summary: aiSummary,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("analyze-report error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
