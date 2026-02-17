import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ItineraryItem, Activity } from '../types';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_EUR_TO_GBP = 0.85; // Fallback conversion rate

export const suggestActivities = async (location: string): Promise<Partial<Activity>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 unique, fun holiday activities for a group of friends in ${location}. Include estimated cost in EUR.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              costEUR: { type: Type.NUMBER, description: "Estimated cost per person in Euros" },
            },
            required: ["title", "description", "costEUR"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
};

export const generateItinerary = async (location: string, days: number): Promise<Partial<ItineraryItem>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a detailed ${days}-day itinerary for a trip to ${location}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.INTEGER },
              time: { type: Type.STRING },
              activity: { type: Type.STRING },
              location: { type: Type.STRING },
              costEUR: { type: Type.NUMBER },
            },
            required: ["day", "time", "activity", "location", "costEUR"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (error) {
    console.error("Gemini Itinerary Error:", error);
    return [];
  }
};

export const convertCurrency = (amountEUR: number): number => {
  return amountEUR * MOCK_EUR_TO_GBP;
};