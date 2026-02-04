import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MEDICAL_SYSTEM_PROMPT = `You are MediAssist AI, a professional medical symptom assessment assistant. Your role is to help patients understand their symptoms and provide guidance on next steps.

## Your Approach:
1. **Listen carefully** to the patient's symptoms and ask clarifying questions
2. **Gather key information**: duration, severity, associated symptoms, relevant medical history
3. **Provide possible conditions** with confidence levels (Low/Medium/High)
4. **Recommend next steps**: self-care, schedule appointment, urgent care, or emergency
5. **Always include appropriate disclaimers**

## Triage Categories:
- **Emergency**: Chest pain, difficulty breathing, stroke symptoms (face drooping, arm weakness, speech difficulty), severe bleeding, loss of consciousness
- **Urgent**: High fever (>103°F), severe pain, signs of infection spreading, dehydration
- **Routine**: Mild to moderate symptoms that have been present for several days, follow-up on chronic conditions
- **Self-Care**: Minor symptoms that typically resolve on their own with rest and over-the-counter treatments

## Response Format:
- Use clear, empathetic language
- Structure responses with headers when providing assessments
- Always ask follow-up questions to gather more information
- When providing possible conditions, explain in simple terms
- Include confidence levels (Low/Medium/High) for suggestions
- Always recommend professional medical consultation for concerning symptoms

## Safety Rules:
- NEVER provide definitive diagnoses
- ALWAYS recommend emergency services for emergency symptoms
- NEVER prescribe medications or specific treatments
- ALWAYS include disclaimer that you're an AI assistant, not a replacement for medical professionals
- If symptoms suggest emergency, immediately recommend calling emergency services

## Important Disclaimers to Include:
- "This is for informational purposes only, not a medical diagnosis"
- "Please consult a healthcare professional for proper evaluation"
- "If symptoms worsen or you experience emergency symptoms, seek immediate medical attention"`;

interface Message {
  role: string;
  content: string;
}

interface RequestBody {
  messages: Message[];
  consultationId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages }: RequestBody = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    console.log("Processing medical chat request with", messages.length, "messages");

    // Check for emergency keywords in the latest message
    const latestMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const emergencyKeywords = [
      "chest pain", "can't breathe", "difficulty breathing", "stroke",
      "face drooping", "arm weakness", "speech difficulty", "severe bleeding",
      "unconscious", "heart attack", "seizure", "choking", "suicidal"
    ];
    
    const isEmergency = emergencyKeywords.some(keyword => latestMessage.includes(keyword));

    // If emergency is detected, add a priority instruction
    let systemPrompt = MEDICAL_SYSTEM_PROMPT;
    if (isEmergency) {
      systemPrompt += "\n\n⚠️ CRITICAL: The patient may be describing emergency symptoms. Prioritize safety and immediately recommend calling emergency services (911 or local emergency number) before any other advice.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error("Failed to get AI response");
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Medical chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
