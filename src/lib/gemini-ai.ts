// Gemini API integration for AI companion
// Set VITE_GEMINI_API_KEY in .env to enable real AI responses

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL = "gemini-2.0-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface Message {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function callGeminiAI(
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  if (!API_KEY) {
    return mockReply(userMessage);
  }

  try {
    const messages = [
      ...conversationHistory,
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
        systemInstruction: {
          parts: [
            {
              text: `You are a helpful health companion for elderly users. You help with:
- Medicine reminders and explanations
- Health tracking and advice
- Appointment management
- Wellness tips
- General questions about health and lifestyle

Be friendly, clear, and encouraging. Use simple language. Keep responses concise and easy to understand.`,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.statusText);
      return mockReply(userMessage);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || mockReply(userMessage);
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return mockReply(userMessage);
  }
}

function mockReply(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes("weather"))
    return "It's 28°C and sunny. A light shawl for the evening should be plenty.";
  if (lower.includes("medicine"))
    return "Today: Metformin 500mg after breakfast, Amlodipine 5mg morning, Atorvastatin 10mg after dinner.";
  if (lower.includes("call"))
    return "Calling Priya now…";
  if (lower.includes("music"))
    return "Playing your relaxing playlist.";
  if (lower.includes("appointment"))
    return "You have Dr. Sharma at 4:00 PM at Apollo Clinic.";
  if (lower.includes("eat"))
    return "A dal, one roti, and vegetables. Skip sugary drinks — try lemon water.";
  return "I've noted that. Anything else I can help with?";
}
