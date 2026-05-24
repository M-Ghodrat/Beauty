import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";
import { APP_NAME, SERVICES, LOCATION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are the AI Beauty Assistant for ${APP_NAME}, a boutique beauty spa located in ${LOCATION}.
Your goal is to handle customer inquiries 24/7 with a professional, warm, and sophisticated tone.

Key Information:
- Services: ${JSON.stringify(SERVICES)}
- Location: ${LOCATION}
- Booking: Users can book appointments online directly on this website.
- Inquiries: For complex questions, suggest they use the contact form.

Guidelines:
1. Be helpful and expert in beauty/skincare advice.
2. If a user asks about pricing or duration, refer to the SERVICES list.
3. Keep responses concise and elegant.
4. If asked about appointments, guide them to the "Book Now" section of the page.
5. Do not hallucinate services we don't offer.
`;

export async function getChatResponse(history: ChatMessage[]): Promise<string> {
  try {
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that. How else can I help you today?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm experiencing a slight technical glitch. Feel free to browse our services or contact us directly!";
  }
}
