// Gemini API integration for AI companion
// Set VITE_GEMINI_API_KEY in .env to enable real AI responses

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL = "gemini-1.5-flash";
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
    throw new Error(
      "Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file."
    );
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
      const errorData = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("No response received from Gemini API");
    }

    return reply;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to call Gemini AI: ${message}`);
  }
}
