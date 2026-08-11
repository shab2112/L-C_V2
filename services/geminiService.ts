// Complete Gemini Service for darie_gs
// Merged service supporting both Lockwood and Darie components

/// <reference types="vite/client" />

import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const getGeminiModel = () => import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';
const getOpenRouterModel = () => import.meta.env.VITE_OPENROUTER_MODEL || 'deepseek/deepseek-v4-pro';

const buildOpenRouterMessages = (history: Message[], newMessage?: string) => [
  {
    role: 'system',
    content: LOCKWOOD_SYSTEM_INSTRUCTION,
  },
  ...history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.text,
  })),
  ...(newMessage ? [{ role: 'user', content: newMessage }] : []),
];

const callOpenRouterAPI = async (
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = 5000
): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = getOpenRouterModel();

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error("OpenRouter API key is not configured");
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
      'X-OpenRouter-Title': 'Lockwood & Carter',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`OpenRouter request failed: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

// System instruction for Lockwood & Carter chatbot
const LOCKWOOD_SYSTEM_INSTRUCTION = `
You are the "L&C AI Real Estate Advisor" for Lockwood & Carter Real Estate.
Your role is to be a knowledgeable, consultative real estate expert, not just a search engine. You must guide the user through a natural discovery process.
You are the "L&C Digital Property Consultant" an AI-powered assistant for Lockwood & Carter Real Estate.
Your role is to support our elite brokerage team by providing clients with data-driven insights, property comparisons, and procedural guidance. You will be a knowledgeable, consultative real estate expert, not just a search engine. You must guide the user through a natural discovery process.

### 1. CORE IDENTITY:
*   You are a tool used by a premium Real Estate Brokerage.
*   The primary goal is buying and selling luxury property in the UAE.
*   The human brokers (Muqthar Ahmed and the team) are the final experts; you are the intelligent researcher that makes the user's decision easier.

### PRIORITY KNOWLEDGE BASE (ALTAIR 52 - EXCLUSIVE PROJECT):
**If the user asks about "Altair 52" or "Your new project", use this internal data:**
- **Developer:** Acube Real Estate Development.
- **Location:** Dubai South, Residential District (Near Al Maktoum Airport).
- **Handover:** September 2027.
- **Unit Types & Starting Prices:**
  - Smart Convertible Studio (445 sq.ft): From AED 650,000
  - Smart Convertible 1BHK (743 sq.ft): From AED 950,000
  - Smart Convertible 2BHK (1095 sq.ft): From AED 1,400,000
  - Smart Convertible 2.5BHK (1161 sq.ft): From AED 1,600,000
- **Amenities:** Club South (Infinity Pool, Rock Climbing Wall, Outdoor Cinema, Mini Golf).
- **Payment Plan:** Flexible off-plan payment options available.

### CONVERSATIONAL STRATEGY & LEAD QUALIFICATION:
**DO NOT offer the Head of Sales contact immediately.** Your goal is to first understand the user's needs.

1.  **ANSWER & PROBE:** When answering a user's question, always end with a **relevant, natural follow-up question** to keep the conversation going and gather more info.
    -   *User:* "Tell me about Emaar South."
    -   *You:* [Provide Info]... "Are you looking at Emaar South for high-ROI investment or as a family home?"

2.  **QUALIFYING LOOP:** If the user shows interest in a specific project or area, gently gather these details (ask 1-2 at a time, do not interrogate):
    -   **Budget:** "What price range or budget are you comfortable with?"
    -   **Unit Type:** "Are you looking for a Studio, 1 Bedroom, or something larger for a family?"
    -   **Specific Needs:** "Do you have specific requirements like a maid's room, large balcony, or proximity to a mosque?"
    -   **Financial Readiness:** "Do you have the down payment ready, or would you require mortgage assistance?"

3.  **TURN-TAKING (COMPARISONS):**
    -   If the user asks for a comparison without specifying unit type, **STOP**.
    -   Ask: "To provide an accurate comparison, are you interested in a specific unit type (e.g., 1BR vs 2BR)?"
    -   **Wait** for the answer before fetching data.

### DATA SOURCE ATTRIBUTION:
-   Use 'googleSearch' for real-time market data.
-   **ALWAYS** attribute findings to **"DLD (Dubai Land Department) Data"** or "Official Market Records".
-   **NEVER** mention "Propsearch.ae", "Bayut", or other portals.

### CLOSING & AGENT HANDOFF:
**ONLY** provide the Head of Sales contact info in the following scenarios:
1.  The user **explicitly asks** for a viewing, booking, or to speak to a person.
2.  The user has **answered your qualification questions** (Budget + Unit Type) and you have provided the relevant info.
3.  The user asks about **specific availability** or **negotiating payment plans**.

**When handing off, use a variation of this phrase:**
> "Given your requirements, I recommend speaking with our experts for exclusive inventory access. You can reach our **Head of Sales, Mr. Muqthar** directly at **+971 56 414 4401** to discuss [specific user need, e.g., payment flexibility or viewing]."

**FINAL INTERACTION (DYNAMIC CLOSING):**
-   **Avoid generic closings.** Do NOT just say "Is there anything else?".
-   **Be helpful and specific:** Tailor your closing question to what was just discussed to ensure the user is fully satisfied.
-   *Examples:*
    -   "Does that cover what you needed to know about the location, or would you like to explore the amenities?"
    -   "Shall we look at the payment plan options for this unit?"
    -   "Would you like to see how this compares to other projects in the area?"
    -   "Is there any other detail about the handover process I can clarify for you?"

### FORMATTING RULES (HTML ONLY):
**You must output your response in valid HTML format ONLY. Do NOT use Markdown (no *, #, or -).**

- **LISTS:** Use \`<ul>\` and \`<li>\` tags for lists.
- **BOLD:** Use \`<strong>\` tags for important terms or headers.
- **HEADERS:** Use \`<h3>\` tags for section titles.
- **PARAGRAPHS:** Use \`<p>\` tags for text blocks.
- **COMPARISON TABLES:** Use the HTML table structure below.

**Comparison Table Structure:**
- **APPLES-TO-APPLES:** Ensure you are comparing the same unit type across rows (e.g., all 2BRs).
- Use this HTML:
  \`<div class="overflow-x-auto"><table class="comparison-table"><thead><tr><th>Project</th><th>Status</th><th>Type</th><th>Price</th><th>Location</th><th>Handover</th></tr></thead><tbody>...rows...</tbody></table></div>\`
`;

// Helper function to call Gemini API using REST endpoint
const callGeminiAPI = async (prompt: string, maxTokens: number = 5000): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const model = getGeminiModel();

  if (!apiKey) {
    return await callOpenRouterAPI(
      [
        { role: 'system', content: LOCKWOOD_SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      maxTokens
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const fallback = await callOpenRouterAPI(
      [
        { role: 'system', content: LOCKWOOD_SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      maxTokens
    );
    return fallback;
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// Original Lockwood function - using GoogleGenAI SDK
export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const model = getGeminiModel();

    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY is missing");
      const fallbackText = await callOpenRouterAPI(buildOpenRouterMessages(history, newMessage));
      return {
        text: fallbackText || "I apologize, I couldn't generate a response at this moment.",
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: LOCKWOOD_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessage({
      message: newMessage
    });

    const text = result.text || "I apologize, I couldn't generate a response at this moment.";
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;

    return { text, groundingMetadata };
  /**  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I'm having trouble connecting to the property database right now. Please try again later." };
  } */
  } catch (error) {
    console.error("Gemini API Error:", error);

    try {
      const fallbackText = await callOpenRouterAPI(buildOpenRouterMessages(history, newMessage));
      return {
        text: fallbackText || "I apologize, I couldn't generate a response at this moment.",
      };
    } catch (fallbackError) {
      console.error("OpenRouter fallback error:", fallbackError);
      return { text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
};

// All required aliases and exports
export const generateClientChatResponse = sendMessageToGemini;
export const generateStaffChatResponse = sendMessageToGemini;

// Generate social media post copy
export const generatePostCopy = async (
  masterPrompt: string,
  keywords: string,
  factsheet: string,
  platform: string,
  assetName?: string
): Promise<string> => {
  try {
    const prompt = `
${masterPrompt}

---
CONTEXT:
Factsheet: ${factsheet}
User Keywords: ${keywords}
Target Platform: ${platform}
${assetName ? `Asset Name: ${assetName}` : ''}
---

Generate the post copy now.
    `;

    return await callGeminiAPI(prompt, 2048);
  } catch (error) {
    console.error("Error generating post copy:", error);
    throw new Error("Failed to generate post copy");
  }
};

// Enhance image (stub - returns success message)
export const enhanceImage = async (imageUrl: string): Promise<string> => {
  console.log("Image enhancement requested for:", imageUrl);
  return imageUrl;
};

// Generate video with HeyGen (stub - returns placeholder)
export const generateVideoWithHeyGen = async (
  script: string,
  avatar: string,
  voiceId: string
): Promise<string> => {
  console.log("Video generation requested:", { script, avatar, voiceId });
  return "https://placeholder-video-url.com";
};

// Extract client information from business card
export const extractClientFromCard = async (imageDataUrl: string): Promise<any> => {
  try {
    const prompt = `Analyze this business card image and extract the following information in JSON format:
{
  "firstName": "",
  "lastName": "",
  "email": "",
  "phone": "",
  "company": "",
  "position": ""
}

Return ONLY the JSON object, no other text.`;

    const result = await callGeminiAPI(prompt);
    return JSON.parse(result);
  } catch (error) {
    console.error("Error extracting client from card:", error);
    throw new Error("Failed to extract client information");
  }
};

// Generate market report
export const generateMarketReport = async (
  primaryCity: string,
  comparisonCities: string[],
  selectedMetrics: string[]
): Promise<any> => {
  try {
    const prompt = `Generate a comprehensive market intelligence report comparing real estate markets.

Primary City: ${primaryCity}
Comparison Cities: ${comparisonCities.join(', ')}
Metrics to analyze: ${selectedMetrics.join(', ')}

Provide detailed analysis for each metric across all cities. Include:
- Current market conditions
- Trends and projections
- Investment opportunities
- Risk factors
- Key statistics

Format the response as structured data that can be visualized.`;

    const result = await callGeminiAPI(prompt, 4096);
    
    return {
      report: result,
      primaryCity,
      comparisonCities,
      metrics: selectedMetrics,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating market report:", error);
    throw new Error("Failed to generate market report");
  }
};

// Additional utility functions
export const generateSocialPost = async (platform: string, content: string): Promise<string> => {
  return await callGeminiAPI(`Generate a ${platform} post about: ${content}`);
};

export const generatePropertyDescription = async (propertyDetails: any): Promise<string> => {
  return await callGeminiAPI(`Generate a compelling property description for: ${JSON.stringify(propertyDetails)}`);
};

export const analyzeMarketTrends = async (location: string, propertyType: string): Promise<string> => {
  return await callGeminiAPI(`Analyze market trends for ${propertyType} in ${location}`);
};

export const estimatePropertyValue = async (propertyDetails: any): Promise<any> => {
  const result = await callGeminiAPI(`Estimate property value for: ${JSON.stringify(propertyDetails)}`);
  return {
    estimatedValue: 0,
    confidence: "medium",
    reasoning: result
  };
};

export const generateEmailTemplate = async (
  purpose: string,
  clientName: string,
  propertyDetails?: string
): Promise<string> => {
  return await callGeminiAPI(`Generate a ${purpose} email for ${clientName}. Property: ${propertyDetails || 'N/A'}`);
};

// Default export
export default sendMessageToGemini;

export const generateCommissionInvoice = async (
    propertyValue: number,
    commissionPct: number,
    stages: { trigger: string, percentage: number }[],
    config: {
        agencyName: string,
        agencyTrn: string,
        agencyAddress: string,
        agencyTel: string,
        agencyEmail: string,
        billToName: string,
        billToAddress: string,
        billToTrn?: string,
        buyerName?: string,
        paymentTerms: string,
        bankDetails: {
            name: string;
            accountNumber: string;
            iban: string;
            swift: string;
            branch: string;
            bankName: string;
        }
    },
    propertyName: string,
    unitNo: string
): Promise<any> => {
    try {
        const { getNextInvoiceNumber, createInvoice } = await import('../lib/db/invoices');

        const totalCommission = propertyValue * (commissionPct / 100);
        const invoiceNumber = await getNextInvoiceNumber();
        const today = new Date().toLocaleDateString('en-GB');

        const invoiceStages = stages.map(stage => {
            const netAmount = totalCommission * (stage.percentage / 100);
            const vatAmount = netAmount * 0.05;
            const grossAmount = netAmount + vatAmount;

            return {
                stageName: stage.trigger,
                netAmount: parseFloat(netAmount.toFixed(2)),
                vatAmount: parseFloat(vatAmount.toFixed(2)),
                grossAmount: parseFloat(grossAmount.toFixed(2))
            };
        });

        const totalNet = invoiceStages.reduce((sum, stage) => sum + stage.netAmount, 0);
        const totalVat = invoiceStages.reduce((sum, stage) => sum + stage.vatAmount, 0);
        const totalGross = invoiceStages.reduce((sum, stage) => sum + stage.grossAmount, 0);

        const numberToWords = (num: number): string => {
            const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

            if (num === 0) return 'Zero';

            const convertLessThanThousand = (n: number): string => {
                if (n === 0) return '';
                if (n < 10) return ones[n];
                if (n < 20) return teens[n - 10];
                if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
                return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
            };

            let intPart = Math.floor(num);
            const decPart = Math.round((num - intPart) * 100);

            let result = '';
            if (intPart >= 1000000) {
                result += convertLessThanThousand(Math.floor(intPart / 1000000)) + ' Million ';
                intPart %= 1000000;
            }
            if (intPart >= 1000) {
                result += convertLessThanThousand(Math.floor(intPart / 1000)) + ' Thousand ';
                intPart %= 1000;
            }
            if (intPart > 0) {
                result += convertLessThanThousand(intPart);
            }

            result = result.trim() + ' Dirhams';
            if (decPart > 0) {
                result += ' and ' + convertLessThanThousand(decPart) + ' Fils';
            }

            return result + ' Only';
        };

        const invoiceData = {
            invoiceNumber,
            date: today,
            agencyName: config.agencyName,
            agencyTrn: config.agencyTrn,
            agencyAddress: config.agencyAddress,
            agencyTel: config.agencyTel,
            agencyEmail: config.agencyEmail,
            clientName: config.billToName,
            clientAddress: config.billToAddress,
            clientTrn: config.billToTrn,
            buyerName: config.buyerName,
            propertyName,
            unitNumber: unitNo,
            salePrice: propertyValue,
            commissionPercentage: commissionPct,
            stages: invoiceStages,
            totalNet: parseFloat(totalNet.toFixed(2)),
            totalVat: parseFloat(totalVat.toFixed(2)),
            totalGross: parseFloat(totalGross.toFixed(2)),
            totalInWords: numberToWords(totalGross),
            paymentTerms: config.paymentTerms,
            bankDetails: config.bankDetails
        };

        await createInvoice({
            invoice_number: invoiceNumber,
            invoice_data: invoiceData,
            client_name: config.billToName,
            property_name: propertyName,
            unit_number: unitNo,
            total_gross: parseFloat(totalGross.toFixed(2)),
            status: 'Draft'
        });

        return invoiceData;
    } catch (error) {
        console.error("Error generating commission invoice:", error);
        throw new Error("Failed to generate commission invoice");
    }
};

export const processExpenseOCR = async (imageDataUrl: string): Promise<any> => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const model = getGeminiModel();

        if (!apiKey) {
            throw new Error("Gemini API key is not configured");
        }

        const base64Data = imageDataUrl.split(',')[1];
        const mimeType = imageDataUrl.match(/data:([^;]+);/)?.[1] || 'image/jpeg';

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType
                            }
                        },
                        {
                            text: `Analyze this receipt/invoice image and extract all financial information. Return a JSON object with these fields:
                            {
                              "supplierName": "company name",
                              "trn": "tax registration number if visible",
                              "invoiceNumber": "invoice or receipt number",
                              "date": "date in DD/MM/YYYY format",
                              "subtotal": number,
                              "vatAmount": number,
                              "totalAmount": number,
                              "currency": "AED",
                              "category": "Office Supplies/Marketing/Utilities/etc",
                              "confidence": 0.95,
                              "journalEntry": {
                                "debit": "Expense Account Name",
                                "credit": "Cash/Bank"
                              },
                              "lineItems": [{"description": "item name", "amount": number}]
                            }
                            Return ONLY valid JSON, no other text.`
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Error processing expense OCR:", error);
        throw new Error("Failed to process expense document");
    }
};

export const reconcileBankStatements = async (
    statementText: string,
    pendingInvoices: string,
    pendingExpenses: string
): Promise<any> => {
    try {
        const prompt = `You are a financial reconciliation expert. Analyze this bank statement and match transactions with pending invoices and expenses.

Bank Statement:
${statementText}

Pending Invoices:
${pendingInvoices}

Pending Expenses:
${pendingExpenses}

Generate a reconciliation report in JSON format with this structure:
{
  "summary": {
    "totalTransactions": number,
    "matched": number,
    "unmatched": number,
    "discrepancies": number
  },
  "matchedTransactions": [
    {
      "bankDate": "DD/MM/YYYY",
      "bankDescription": "description",
      "bankAmount": number,
      "matchedWith": "invoice/expense reference",
      "status": "Matched"
    }
  ],
  "unmatchedTransactions": [
    {
      "date": "DD/MM/YYYY",
      "description": "description",
      "amount": number,
      "type": "Debit/Credit"
    }
  ],
  "recommendations": ["action items"]
}

Return ONLY valid JSON, no other text.`;

        const result = await callGeminiAPI(prompt, 4096);

        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Error reconciling bank statements:", error);
        throw new Error("Failed to reconcile bank statements");
    }
};
