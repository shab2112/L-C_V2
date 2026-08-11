/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const API_KEY = process.env.API_KEY as string;

/**
 * Calls the Gemini API with the googleSearch tool to get a grounded response.
 * @param prompt The user's text prompt.
 * @returns The model's text response.
 */
export async function fetchSearchGroundedResponse(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('Missing required environment variable: API_KEY');
  }

  try {
    const ai = new GoogleGenAI({apiKey: API_KEY});
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        }
    });
    
    return response.text;
  } catch (error) {
    console.error(`Error calling Google Search grounding: ${error}`);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
