import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDg4JK90DyByU7N6p7_2-fcBdAyNBu0Zuo";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateXAIExplanation(patientData, recommendedHospital) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a safe vitals summary
    const vitalsStr = JSON.stringify({
      score: patientData?.score,
      needs_icu: patientData?.icuNeeded || patientData?.needs_icu,
      needs_ventilator: patientData?.ventilatorNeeded || patientData?.needs_ventilator,
      ...patientData // Includes other nested info
    });

    const prompt = `You are an expert emergency medical AI. Explain why this patient was routed to this specific hospital. Use a highly medical and professional tone. Keep it concise.

PATIENT INFO:
${vitalsStr}

RECOMMENDED HOSPITAL:
Name: ${recommendedHospital.name}
Distance: ${recommendedHospital.distance}km
ETA: ${recommendedHospital.eta} min
ICU Beds Available: ${recommendedHospital.icuAvailable}
Ventilators Available: ${recommendedHospital.ventilatorAvailable}
Hospital Load: ${recommendedHospital.load}%

TASK:
Return ONLY a JSON object with this exact structure. Do not use markdown blocks like \`\`\`json.
{
  "summary": "1-2 sentences summarizing the optimal choice due to specific matched capabilities.",
  "reasons": [
    "Short specific medical reason 1",
    "Short logistical reason 2",
    "Short resource match reason 3"
  ]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    return JSON.parse(text);
  } catch(e) {
    console.error("Gemini API Error:", e);
    return null;
  }
}
