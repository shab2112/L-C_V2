// AI service for DARIE and admin generation features.
// Export names are kept for compatibility with existing imports.

/// <reference types="vite/client" />

import { FeaturedProperty, formatAed, getFeaturedProperties } from '../lib/propertyIntelligenceStore';

interface Message {
  role: 'user' | 'model';
  text: string;
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
type DarieIntent = 'research' | 'active' | null;
type DariePurpose = 'investment' | 'home' | 'both' | null;

type DarieLeadProfile = {
  intent: DarieIntent;
  purpose: DariePurpose;
  budget: string | null;
  area: string | null;
  areaDescriptor: string | null;
  propertyType: string | null;
  bedrooms: string | null;
  bathrooms: string | null;
  familyNeeds: string | null;
  specialRequirements: string | null;
  timeline: string | null;
  financing: string | null;
  residency: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  contactMethod: string | null;
  contactConsent: boolean;
  projectInterest: string | null;
  availabilityRequested: boolean;
  newsletterInterest: boolean;
  lastTopic: string | null;
};

const getGeminiVisionModel = () => import.meta.env.VITE_GEMINI_VISION_MODEL || import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp';
const getOpenRouterModel = () => import.meta.env.VITE_OPENROUTER_MODEL || 'deepseek/deepseek-v4-pro';

const buildVisiblePropertyContext = () => {
  let properties: FeaturedProperty[] = [];
  try {
    properties = getFeaturedProperties();
  } catch {
    properties = [];
  }

  if (!properties.length) {
    return [
      'VISIBLE LOCKWOOD & CARTER LISTINGS:',
      '- No admin-visible listings are currently available in the public property intelligence module.',
      '- Do not promote, recommend, or quote details for hidden projects. If asked about a hidden or unavailable project, explain that it is not on the current public shortlist and offer to compare visible alternatives.',
    ].join('\n');
  }

  return [
    'VISIBLE LOCKWOOD & CARTER LISTINGS:',
    ...properties.slice(0, 12).map(property => {
      const price = property.price ? ` from ${formatAed(property.price)}` : ' price on request';
      const completion = property.completionDate ? ` Handover/completion: ${property.completionDate}.` : '';
      const amenities = property.amenities?.length ? ` Key amenities: ${property.amenities.slice(0, 4).join(', ')}.` : '';
      return `- ${property.title}: ${property.status}, ${property.propertyType || 'property'} in ${property.location} by ${property.developer}${price}. ${property.description}${completion}${amenities}`;
    }),
    '',
    'PROJECT VISIBILITY RULE:',
    '- Only promote or recommend the visible listings above.',
    '- If a project is hidden in admin or absent from this list, do not promote it, quote its pricing, or call it exclusive.',
    '- If the visitor asks about a hidden/absent project, say it is not currently on the public shortlist and offer visible alternatives from the list above.',
  ].join('\n');
};

const detectVisibleProjectTitle = (text: string) => {
  let properties: FeaturedProperty[] = [];
  try {
    properties = getFeaturedProperties();
  } catch {
    properties = [];
  }

  const lower = text.toLowerCase();
  return properties.find(property => lower.includes(property.title.toLowerCase()))?.title || null;
};

const createEmptyDarieProfile = (): DarieLeadProfile => ({
  intent: null,
  purpose: null,
  budget: null,
  area: null,
  areaDescriptor: null,
  propertyType: null,
  bedrooms: null,
  bathrooms: null,
  familyNeeds: null,
  specialRequirements: null,
  timeline: null,
  financing: null,
  residency: null,
  name: null,
  phone: null,
  email: null,
  contactMethod: null,
  contactConsent: false,
  projectInterest: null,
  availabilityRequested: false,
  newsletterInterest: false,
  lastTopic: null,
});

const toTitleCase = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const extractNameFromText = (text: string) => {
  const withoutEmail = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ');
  const patterns = [
    /\b(?:my name is|name is|i am|i'm|this is|call me)\s+([a-z][a-z.'-]+(?:\s+[a-z][a-z.'-]+){0,3})/i,
    /^\s*([a-z][a-z.'-]+(?:\s+[a-z][a-z.'-]+){1,3})\s+(?:email|e-?mail|emaid|mail|id|phone|number|whatsapp)\b/i,
  ];
  const blocked = /\b(looking|interested|invest|investment|buy|purchase|email|phone|whatsapp|property|apartment|villa|townhouse|yes|ok|okay)\b/i;

  for (const pattern of patterns) {
    const match = withoutEmail.match(pattern);
    const candidate = match?.[1]?.trim().replace(/[.,;:!?]+$/, '');
    if (candidate && !blocked.test(candidate) && candidate.length >= 2) return toTitleCase(candidate);
  }

  return null;
};

const detectArea = (lower: string) => {
  const areas: Record<string, string[]> = {
    'Downtown Dubai': ['downtown', 'burj khalifa', 'dubai mall', 'opera district'],
    'Dubai Marina': ['dubai marina', 'marina', 'jbr', 'jumeirah beach residence'],
    'Palm Jumeirah': ['palm jumeirah', 'palm', 'crescent', 'frond'],
    'Business Bay': ['business bay', 'canal'],
    'Dubai Hills Estate': ['dubai hills', 'dubai hills estate', 'golf course'],
    'Dubai Creek Harbour': ['creek harbour', 'creek harbor', 'dubai creek'],
    JVC: ['jvc', 'jumeirah village circle'],
    'Dubai South': ['dubai south', 'expo city', 'al maktoum', 'dwc'],
    'Arabian Ranches': ['arabian ranches', 'ranches'],
    'Tilal Al Ghaf': ['tilal al ghaf', 'tilal', 'al ghaf'],
  };

  return Object.entries(areas).find(([, keywords]) => keywords.some(keyword => lower.includes(keyword)))?.[0] || null;
};

const analyzeDarieProfile = (history: Message[], newMessage?: string) => {
  const profile = createEmptyDarieProfile();
  let leadScore = 0;
  const userTexts = [
    ...history.filter(message => message.role === 'user').map(message => message.text),
    ...(newMessage ? [newMessage] : []),
  ];

  for (const text of userTexts) {
    const lower = text.toLowerCase();

    if (/\b(just exploring|just looking|learning|research|not ready|no rush|browsing|understand|information)\b/.test(lower)) {
      profile.intent = 'research';
      profile.newsletterInterest = true;
      profile.lastTopic = 'research';
    }
    if (/\b(buy|purchase|invest|investment|roi|yield|rental|return|availability|viewing|book|speak|advisor|agent|broker)\b/.test(lower)) {
      profile.intent = 'active';
      leadScore += 10;
    }
    if (/\b(invest|investment|roi|yield|rental|return|capital appreciation|portfolio)\b/.test(lower)) {
      profile.purpose = 'investment';
      profile.lastTopic = 'investment';
    } else if (/\b(home|live|family|relocat|move in|kids|children|school)\b/.test(lower)) {
      profile.purpose = 'home';
      profile.lastTopic = 'home';
    } else if (/\b(both|live and invest|invest and live|hybrid)\b/.test(lower)) {
      profile.purpose = 'both';
      profile.lastTopic = 'both';
    }

    const area = detectArea(lower);
    if (area) {
      profile.area = area;
      profile.areaDescriptor = null;
      leadScore += 10;
    } else if (!profile.areaDescriptor) {
      if (/\b(beach|beachfront|waterfront|sea view|coastal)\b/.test(lower)) profile.areaDescriptor = 'beachfront';
      if (/\b(golf|fairway|green community)\b/.test(lower)) profile.areaDescriptor = 'golf course';
      if (/\b(family|schools|parks|quiet|suburban|community)\b/.test(lower)) profile.areaDescriptor = 'family community';
      if (/\b(nightlife|urban|walkable|metro|vibrant|restaurants)\b/.test(lower)) profile.areaDescriptor = 'urban vibrant';
      if (/\b(private|exclusive|luxury|prestige|quiet)\b/.test(lower)) profile.areaDescriptor = 'luxury quiet';
    }

    const budgetMatch = text.match(/(?:aed|budget|around|up to|invest|spend)?\s*(\d+(?:[.,]\d+)?)\s*(m|million|k|thousand)?/i);
    if (budgetMatch && !profile.budget) {
      const amount = Number(budgetMatch[1].replace(',', '.'));
      const unit = (budgetMatch[2] || '').toLowerCase();
      if (unit.startsWith('m') || amount >= 1) {
        profile.budget = unit.startsWith('k') ? `AED ${amount}K` : `AED ${amount}M`;
        leadScore += 15;
      }
    }

    if (/\b(apartment|flat|condo)\b/.test(lower)) profile.propertyType = 'Apartment';
    if (/\b(villa|mansion)\b/.test(lower)) profile.propertyType = 'Villa';
    if (/\b(townhouse|town home)\b/.test(lower)) profile.propertyType = 'Townhouse';
    if (/\b(penthouse)\b/.test(lower)) profile.propertyType = 'Penthouse';
    if (/\b(studio)\b/.test(lower)) profile.propertyType = 'Studio';

    const bedroomMatch = lower.match(/\b(\d+)\s*(bed|beds|bedroom|bedrooms|br)\b/);
    if (bedroomMatch) profile.bedrooms = `${bedroomMatch[1]} bedrooms`;
    const bathroomMatch = lower.match(/\b(\d+)\s*(bath|baths|bathroom|bathrooms)\b/);
    if (bathroomMatch) profile.bathrooms = `${bathroomMatch[1]} bathrooms`;

    if (/\b(school|children|kids|maid|nanny|parents|park|commute|metro|pets?)\b/.test(lower)) {
      profile.familyNeeds = 'family, commute, or lifestyle requirements mentioned';
    }
    if (/\b(wheelchair|accessib|elderly|older parents|ground floor|lift|elevator|determination)\b/.test(lower)) {
      profile.specialRequirements = 'accessibility or mobility consideration';
    }
    if (/\b(now|asap|this month|next month|ready|urgent)\b/.test(lower)) profile.timeline = '0-3 months';
    else if (/\b(few months|3 months|6 months|this year)\b/.test(lower)) profile.timeline = '3-6 months';
    else if (/\b(next year|later|future|not ready|no rush|research)\b/.test(lower)) profile.timeline = 'researching';

    if (/\b(cash|self funded|own funds)\b/.test(lower)) profile.financing = 'cash';
    if (/\b(mortgage|loan|finance|bank|pre.?approval|down payment)\b/.test(lower)) profile.financing = 'mortgage';
    if (/\b(uae resident|emirates id|live in dubai|based in dubai)\b/.test(lower)) profile.residency = 'UAE resident';
    if (/\b(overseas|non resident|non-resident|abroad|outside uae|international)\b/.test(lower)) profile.residency = 'overseas buyer';

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) profile.email = emailMatch[0];
    const name = extractNameFromText(text);
    if (name) profile.name = name;
    const phoneMatch = text.match(/\+?[\d\s-]{8,}/);
    if (phoneMatch) profile.phone = phoneMatch[0].trim();
    if (/\b(whatsapp|wa)\b/.test(lower)) profile.contactMethod = 'WhatsApp';
    if (/\b(phone|call)\b/.test(lower)) profile.contactMethod = 'Phone';
    if (/\b(email|mail)\b/.test(lower)) profile.contactMethod = 'Email';
    if (/\b(yes|ok|okay|please|go ahead|connect me|call me|contact me|book a call|schedule)\b/.test(lower)) {
      profile.contactConsent = true;
    }

    if (/\b(availability|available|unit|inventory|exact price|current price|viewing|book|schedule|payment plan)\b/.test(lower)) {
      profile.availabilityRequested = true;
      profile.lastTopic = 'handoff-required';
      leadScore += 20;
    }

    const visibleProjectTitle = detectVisibleProjectTitle(text);
    if (visibleProjectTitle) {
      profile.projectInterest = visibleProjectTitle;
      leadScore += 15;
    }
  }

  if (profile.email) leadScore += 15;
  if (profile.phone) leadScore += 20;
  if (profile.propertyType) leadScore += 8;
  if (profile.timeline && profile.timeline !== 'researching') leadScore += 10;
  if (profile.financing) leadScore += 8;
  if (profile.intent === 'research' && !profile.purpose && !profile.availabilityRequested) {
    leadScore = Math.min(leadScore, 25);
  }

  return { profile, leadScore: Math.min(leadScore, 100) };
};

const getMissingQualificationFields = (profile: DarieLeadProfile) => {
  if (profile.intent === 'research' && !profile.purpose && !profile.availabilityRequested) return [];

  return [
    !profile.purpose ? 'purpose' : null,
    !profile.budget ? 'budget' : null,
    !profile.area && !profile.areaDescriptor ? 'area/lifestyle' : null,
    !profile.propertyType ? 'property type' : null,
    profile.purpose === 'home' && !profile.bedrooms ? 'bedrooms' : null,
    profile.purpose === 'home' && !profile.familyNeeds ? 'family needs' : null,
    !profile.timeline ? 'timeline' : null,
    !profile.financing ? 'financing' : null,
    !profile.residency ? 'residency' : null,
  ].filter(Boolean) as string[];
};

const getNextQuestion = (profile: DarieLeadProfile) => {
  if (profile.availabilityRequested || profile.projectInterest || profile.contactConsent) {
    if (!profile.contactConsent) return 'To verify live availability or exact pricing, are you comfortable receiving a quick validation call from Lockwood & Carter?';
    if (!profile.name) return 'Can I take your full name for the adviser handoff?';
    if (!profile.phone) return 'What phone or WhatsApp number should the adviser use?';
    if (!profile.email) return 'What email should we use for the shortlist and updates?';
    if (!profile.contactMethod) return 'Would you prefer WhatsApp, phone call, or email for follow-up?';
    return 'All handoff details are captured. Confirm that a senior Lockwood & Carter adviser should follow up.';
  }

  const missing = getMissingQualificationFields(profile)[0];
  switch (missing) {
    case 'purpose':
      return 'Are you looking for an investment, a home to live in, or both?';
    case 'budget':
      return 'What budget range are you comfortable with?';
    case 'area/lifestyle':
      return 'Do you already have an area in mind, or should I shortlist communities based on your lifestyle and budget?';
    case 'property type':
      return 'Would you prefer an apartment, townhouse, villa, or are you open to comparing options?';
    case 'bedrooms':
      return 'How many bedrooms would be comfortable?';
    case 'family needs':
      return 'Are schools, commute, parks, maid room, or accessibility important for this move?';
    case 'timeline':
      return 'What is your timeline: ready now, within a few months, or still researching?';
    case 'financing':
      return 'Would this be a cash purchase, or would you need mortgage guidance?';
    case 'residency':
      return 'Are you currently based in the UAE, or buying from overseas?';
    default:
      return profile.intent === 'research'
        ? 'Would you like a concise market brief, or are you ready to discuss buying options?'
        : 'Which detail would help you narrow the shortlist next?';
  }
};

const buildDarieConversationContext = (history: Message[], newMessage?: string) => {
  const { profile, leadScore } = analyzeDarieProfile(history, newMessage);
  const nextQuestion = getNextQuestion(profile);
  const stage = profile.availabilityRequested || profile.projectInterest || profile.contactConsent
    ? 'handoff'
    : profile.intent === 'research' && !profile.purpose
      ? 'research'
      : 'qualifying';

  const lines = [
    `DARIE CONCIERGE CONTEXT: [Stage: ${stage}] [Lead score: ${leadScore}/100]`,
    'Visitor profile inferred from transcript:',
    profile.intent ? `- Intent: ${profile.intent}` : '',
    profile.purpose ? `- Purpose: ${profile.purpose}` : '',
    profile.budget ? `- Budget: ${profile.budget}` : '',
    profile.area || profile.areaDescriptor ? `- Area/lifestyle: ${profile.area || profile.areaDescriptor}` : '',
    profile.propertyType ? `- Property type: ${profile.propertyType}` : '',
    profile.bedrooms ? `- Bedrooms: ${profile.bedrooms}` : '',
    profile.familyNeeds ? `- Family needs: ${profile.familyNeeds}` : '',
    profile.timeline ? `- Timeline: ${profile.timeline}` : '',
    profile.financing ? `- Financing: ${profile.financing}` : '',
    profile.residency ? `- Residency: ${profile.residency}` : '',
    profile.projectInterest ? `- Project interest: ${profile.projectInterest}` : '',
    profile.availabilityRequested ? '- Live availability/current pricing requested: yes' : '',
    profile.email ? '- Email captured: yes' : '',
    profile.phone ? '- Phone captured: yes' : '',
    profile.contactMethod ? `- Preferred contact: ${profile.contactMethod}` : '',
    '',
    stage === 'research'
      ? 'RESEARCH MODE: Do not ask buyer qualification questions unless the visitor shows buying intent. Educate, explain market context, and offer a Lockwood & Carter Dubai Property Brief as a soft nurture step.'
      : 'QUALIFICATION MODE: Move the visitor forward one step at a time. Do not ask for a detail already captured.',
    stage === 'handoff'
      ? 'HANDOFF MODE: Do not invent live availability, exact current pricing, developer inventory, or unverified amenities/distances. Collect consent and missing contact details for a senior adviser.'
      : '',
    `Required next question: ${nextQuestion}`,
    'Answer the user first, then end with the required next question or a natural close paraphrase. Ask only one question.',
  ];

  return lines.filter(Boolean).join('\n');
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const buildChatTranscript = (messages: Message[]) =>
  messages
    .map(message => `${message.role === 'model' ? 'DARIE' : 'Visitor'}: ${stripHtml(message.text)}`)
    .join('\n\n');

const splitName = (name: string | null) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
};

export const buildDarieEnquiryPayload = (messages: Message[]) => {
  const { profile, leadScore } = analyzeDarieProfile(messages);
  const shouldCapture = Boolean(
    profile.email &&
    (
      profile.contactConsent ||
      profile.newsletterInterest ||
      profile.availabilityRequested ||
      profile.projectInterest ||
      leadScore >= 35
    )
  );

  if (!shouldCapture) return null;

  const name = profile.name || profile.email?.split('@')[0] || 'DARIE website visitor';
  const { firstName, lastName } = splitName(profile.name);
  const transcript = buildChatTranscript(messages);

  return {
    type: 'darie-chat',
    firstName,
    lastName,
    name,
    email: profile.email,
    phone: profile.phone || '',
    interest: profile.projectInterest || profile.propertyType || profile.purpose || 'DARIE property consultation',
    budget: profile.budget || '',
    area: profile.area || profile.areaDescriptor || '',
    propertyTitle: profile.projectInterest || '',
    message: `DARIE chat-qualified enquiry. Lead score: ${leadScore}/100.${profile.newsletterInterest ? ' Visitor requested or accepted the Dubai Property Brief.' : ''}`,
    source: 'darie-chat',
    status: 'new',
    chatProfile: {
      ...profile,
      leadScore,
      capturedAt: new Date().toISOString(),
    },
    chatTranscript: transcript,
    tracking: {
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    },
    newsletterSubscribed: Boolean(profile.newsletterInterest || profile.email),
    newsletterSubscribedAt: profile.newsletterInterest || profile.email ? new Date().toISOString() : '',
    actionLog: [
      {
        id: `darie-${Date.now()}`,
        type: 'darie-chat-capture',
        detail: 'Captured from homepage DARIE chat.',
        actor: 'DARIE',
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

const buildChatMessages = (history: Message[], newMessage?: string): ChatMessage[] => [
  {
    role: 'system',
    content: `${LOCKWOOD_SYSTEM_INSTRUCTION}\n\n${buildVisiblePropertyContext()}\n\n${buildDarieConversationContext(history, newMessage)}`,
  },
  ...history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.text,
  })),
  ...(newMessage ? [{ role: 'user', content: newMessage }] : []),
];

const callNvidiaAPI = async (
  messages: ChatMessage[],
  maxTokens: number = 5000
): Promise<string> => {
  const response = await fetch('/api/darie-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`DARIE request failed: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
  }

  const data = await response.json();
  return data.text || data.choices?.[0]?.message?.content || "";
};

const callOpenRouterAPI = async (
  messages: ChatMessage[],
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

### CONVERSATIONAL STRATEGY & LEAD QUALIFICATION:
**DO NOT offer the Head of Sales contact immediately.** Your goal is to first understand the user's needs.

1.  **CONCIERGE BEHAVIOR:** You are a senior property concierge. Be warm, intuitive, concise, and consultative. Do not sound like a robot or a pushy salesperson.
    - Read the user's intent, not just keywords.
    - If the visitor is vague or uncertain, acknowledge it and guide them gently.
    - Ask only one question at a time.
    - Never ask a question that has already been answered in the conversation context.
    - Never repeat the exact same question twice; rephrase or move forward.

2.  **INTENT FIRST:** At the start, understand whether the visitor is:
    - Exploring and learning about Dubai property ownership.
    - Actively checking buying possibilities.
    - Looking for a specific project, viewing, live availability, or adviser contact.

3.  **RESEARCH MODE:** If the visitor is just exploring, do not ask buyer qualification questions such as budget, financing, or timeline unless they show buying intent. Provide useful education about Dubai ownership, Golden Visa basics, mortgage basics, buying process, areas, and market context. Offer the Lockwood & Carter Dubai Property Brief as a soft nurture step and ask for name/email only if they want it.

4.  **ANSWER & PROBE:** When answering a user's question, end with a **relevant, natural follow-up question** that moves the conversation forward.
    -   *User:* "Tell me about Emaar South."
    -   *You:* [Provide Info]... "Are you looking at Emaar South for high-ROI investment or as a family home?"

5.  **QUALIFYING LOOP:** If the visitor is actively buying or investing, qualify in this order where relevant:
    - Purpose: investment, home, or both.
    - Budget.
    - Area or lifestyle preference.
    - Property type and bedroom requirement.
    - Family needs, commute, schools, maid room, accessibility, or other special requirements.
    - Timeline.
    - Financing: cash, mortgage, down payment readiness.
    - Residency: UAE resident or overseas buyer.

6.  **TURN-TAKING (COMPARISONS):**
    -   If the user asks for a comparison without specifying unit type, **STOP**.
    -   Ask: "To provide an accurate comparison, are you interested in a specific unit type (e.g., 1BR vs 2BR)?"
    -   **Wait** for the answer before fetching data.

7.  **FOLLOW SYSTEM CONTEXT:** If the system context includes "Required next question", your final sentence must ask that question or a close natural paraphrase. Do not add a second question.

### DATA SOURCE ATTRIBUTION:
-   You do not have live web search in this chat unless the application provides retrieved context.
-   Do not claim live availability, exact current pricing, or current transaction confirmation without provided context.
-   If discussing market context, use careful wording such as "based on available market context" and recommend advisor verification for live details.
-   **NEVER** mention "Propsearch.ae", "Bayut", or other portals unless the user explicitly asks about a public source.

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

// Helper function used by admin generation features. NVIDIA GLM-5.2 is the primary text model.
const callGeminiAPI = async (prompt: string, maxTokens: number = 5000): Promise<string> => {
  try {
    return await callNvidiaAPI(
      [
        { role: 'system', content: LOCKWOOD_SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      maxTokens
    );
  } catch (error) {
    console.warn("NVIDIA text generation failed, trying OpenRouter fallback:", error);
    return await callOpenRouterAPI(
      [
        { role: 'system', content: LOCKWOOD_SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      maxTokens
    );
  }
};

// Original Lockwood export name retained; implementation now uses NVIDIA GLM-5.2.
export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    const text = await callNvidiaAPI(buildChatMessages(history, newMessage));
    return {
      text: text || "I apologize, I couldn't generate a response at this moment.",
    };
  } catch (error) {
    console.error("NVIDIA GLM API Error:", error);

    try {
      const fallbackText = await callOpenRouterAPI(buildChatMessages(history, newMessage));
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
export const sendMessageToDarie = sendMessageToGemini;

// Generate social media post copy
export const generatePostCopy = async (
  masterPrompt: string,
  keywords: string,
  factsheet: string,
  platform: string,
  assetName?: string
): Promise<string> => {
  const getFact = (label: string) => {
    const match = factsheet.match(new RegExp(`${label}:\\s*([^\\n]+)`, 'i'));
    return match?.[1]?.trim() || '';
  };

  const fallbackCaption = () => {
    const project = getFact('Project') || 'this selected property';
    const developer = getFact('Developer');
    const location = getFact('Location');
    const propertyType = getFact('Property Type');
    const price = getFact('Starting Price');
    const paymentPlan = getFact('Payment Plan');
    const completion = getFact('Completion / Handover');
    const amenities = getFact('Amenities');

    return [
      `${project}${developer ? ` by ${developer}` : ''}${location ? ` in ${location}` : ''}.`,
      propertyType || amenities
        ? [propertyType, amenities].filter(Boolean).join(' | ')
        : '',
      [price && price !== 'Ask advisor' ? `Starting from ${price.replace(/^AED\s*/i, 'AED ')}` : '', paymentPlan ? `Payment plan: ${paymentPlan}` : '', completion ? `Handover: ${completion}` : '']
        .filter(Boolean)
        .join(' | '),
      keywords ? `Focus: ${keywords}.` : '',
      `For a considered view on suitability, pricing and availability, speak with Lockwood & Carter.`,
    ].filter(Boolean).join('\n\n');
  };

  try {
    const prompt = `
Create one polished ${platform} caption for a Lockwood & Carter real estate social post.

Brand voice:
- Premium, measured, advisory, British English.
- Clear and conversion-aware without hype.
- Do not invent availability, exclusivity, prices, payment plans, or dates beyond the factsheet.
- End with a soft enquiry call-to-action.

Project facts:
${factsheet}

Creative focus:
${keywords}

${assetName ? `Selected visual asset: ${assetName}` : ''}

Return only the caption text. Keep it concise and ready to edit.
    `;

    const response = await fetch('/api/darie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: 'You are a senior social media copywriter for Lockwood & Carter Real Estate.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 700,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.error || `Copy generation failed with status ${response.status}`);
    }

    return data.text || fallbackCaption();
  } catch (error) {
    console.error("Error generating post copy:", error);
    return fallbackCaption();
  }
};

export const enhanceImage = async (
  imageUrl: string,
  keywords: string,
  context?: {
    projectName?: string;
    developer?: string;
    templateName?: string;
  }
): Promise<string> => {
  const response = await fetch('/api/content-studio/enhance-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageUrl,
      keywords,
      projectName: context?.projectName,
      developer: context?.developer,
      templateName: context?.templateName,
      aspectRatio: '1:1',
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    const details = [data.fallbackReason, data.error].filter(Boolean).join(' ');
    throw new Error(details || 'Failed to enhance image.');
  }

  return data.imageUrl;
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
    const response = await fetch('/api/market-comparison-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primaryCity, comparisonCities, selectedMetrics }),
    });

    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Market Comparison Reports API returned a non-JSON response (${response.status}).`);
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Market Comparison Reports API failed with status ${response.status}.`);
    }

    return data;
  } catch (error) {
    console.error("Error generating market report:", error);
    throw error instanceof Error ? error : new Error("Failed to generate market report");
  }
};

export const fetchMarketComparisonCities = async (): Promise<string[]> => {
  const response = await fetch('/api/market-comparison-reports/cities');
  const text = await response.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Market Comparison cities API returned a non-JSON response (${response.status}).`);
  }

  if (!response.ok || !data.success || !Array.isArray(data.cities)) {
    throw new Error(data.error || `Market Comparison cities API failed with status ${response.status}.`);
  }

  return data.cities.filter((city: unknown): city is string => typeof city === 'string' && city.trim().length > 0);
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
        const model = getGeminiVisionModel();

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
