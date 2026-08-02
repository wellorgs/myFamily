// Gemini API integration for AI companion
// Set VITE_GEMINI_API_KEY in .env to enable real AI responses
// Falls back to mock data for development/testing

import { getMockMedicineOCR } from "./mock-data";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL = "gemini-1.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const USE_MOCK = !API_KEY; // Use mock data when API key missing

export interface Message {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: "I understand. Here's some helpful information for your health journey.",
  medicine: "Based on your medications, remember to take them at the same time each day for better effectiveness.",
  appointment: "Don't forget your upcoming appointments. Would you like me to set a reminder?",
  health: "Great job on tracking your health! Consistency is key to wellness.",
};

export async function callGeminiAI(
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  if (USE_MOCK) {
    return getMockResponse(userMessage);
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

function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("medicine") || lower.includes("medication")) {
    return MOCK_RESPONSES.medicine;
  }
  if (lower.includes("appointment") || lower.includes("doctor")) {
    return MOCK_RESPONSES.appointment;
  }
  if (lower.includes("health") || lower.includes("track")) {
    return MOCK_RESPONSES.health;
  }
  return MOCK_RESPONSES.default;
}

export async function getMedicineOCR(imageBase64: string) {
  if (USE_MOCK) {
    return getMockMedicineOCR();
  }
  // Real implementation would call Gemini Vision API
  throw new Error("Gemini API key required for real OCR");
}
