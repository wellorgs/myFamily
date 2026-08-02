// DeepSeek-VL2 API integration for AI companion & medicine scanning
// Set VITE_DEEPSEEK_API_KEY in .env to enable real AI responses and OCR
// Falls back to mock data for development/testing

import { getMockMedicineOCR } from "./mock-data";

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";
const API_URL = "https://api.deepseek.com/chat/completions";
const USE_MOCK = !API_KEY; // Use mock data when API key missing

export interface Message {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
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
        content: userMessage,
      },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-vl2",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        system: `You are a helpful health companion for elderly users. You help with:
- Medicine reminders and explanations
- Health tracking and advice
- Appointment management
- Wellness tips
- General questions about health and lifestyle

Be friendly, clear, and encouraging. Use simple language. Keep responses concise and easy to understand.`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No response received from DeepSeek API");
    }

    return reply;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to call DeepSeek AI: ${message}`);
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

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-vl2",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract medicine information from this image. Return ONLY valid JSON with fields: name, dosage, frequency, instructions. If not a medicine label, return error.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OCR failed: ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from DeepSeek Vision API");
    }

    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || "Medicine",
        dosage: parsed.dosage || "Unknown",
        frequency: parsed.frequency || "As prescribed",
        instructions: parsed.instructions || "Follow doctor's orders",
      };
    }

    throw new Error("Could not extract medicine info from image");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Medicine OCR failed: ${message}`);
  }
}
