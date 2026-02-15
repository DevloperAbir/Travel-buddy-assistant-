
import { GoogleGenAI } from "@google/genai";
import { TravelData, AssistantResponse } from "../types";

export const getTravelAssistance = async (data: TravelData): Promise<AssistantResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Get current location if possible to assist grounding
  let userLocation = { latitude: 23.8103, longitude: 90.4125 }; // Default to Dhaka
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    userLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch (err) {
    console.warn("Location permission denied, using default coordinates.");
  }

  const prompt = `
    আমি ${data.source} থেকে ${data.destination} যাচ্ছি। 
    দয়া করে আমাকে নিচের তথ্যগুলো দিন:
    ১. রাস্তায় কোনো জ্যাম আছে কি না (Traffic conditions)।
    ২. গন্তব্যের আবহাওয়া কেমন হবে (Weather forecast)।
    ৩. যদি গন্তব্যটি একটি পার্ক বা পর্যটন কেন্দ্র হয়, তবে এটি এখন খোলা আছে কি না এবং এর সময়সূচী (Opening/closing hours)।
    
    Response format: Give a detailed answer in Bengali.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: userLocation
          }
        }
      },
    });

    const text = response.text || "দুঃখিত, কোনো তথ্য পাওয়া যায়নি।";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const links = chunks
      .map((chunk: any) => {
        if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        return null;
      })
      .filter(Boolean) as Array<{ title: string; uri: string }>;

    // We use AI to structure the Bengali text naturally.
    // However, for UI display, we'll return it as parts.
    return {
      trafficInfo: text, // The full grounding output
      weatherInfo: "",   // Handled in combined text
      venueDetails: "",  // Handled in combined text
      groundingLinks: links
    };
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("তথ্যাদি সংগ্রহ করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।");
  }
};
