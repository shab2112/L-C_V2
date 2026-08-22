import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.end(JSON.stringify(payload));
};

export const asArray = value => (Array.isArray(value) ? value : value ? [value] : []);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export const assertSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase backend is not configured.');
  }
  return supabase;
};

export const getBody = req => {
  if (!req.body) return {};
  if (typeof req.body === 'string') return req.body.trim() ? JSON.parse(req.body) : {};
  return req.body;
};

const normalizeEmail = value => String(value || '').trim().toLowerCase();
const normalizePhone = value => String(value || '').replace(/[^\d+]/g, '').trim();

const formatUuid = value => {
  const raw = String(value || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)
    ? raw
    : null;
};

const parseBudget = value => {
  if (typeof value === 'number') return value;
  const text = String(value || '').toLowerCase();
  const range = text.match(/(\d+(?:\.\d+)?)\s*(?:m|million)?\s*[-to]+\s*(\d+(?:\.\d+)?)\s*(m|million)?/);
  if (range) return Number(range[2]) * (range[3] ? 1000000 : 1);
  const match = text.match(/(\d+(?:\.\d+)?)\s*(m|million|k|thousand)?/);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2] || '';
  if (unit.startsWith('m')) return amount * 1000000;
  if (unit.startsWith('k') || unit.startsWith('thousand')) return amount * 1000;
  return amount;
};

export const calculateLeadScore = input => {
  let score = 0;
  if (input.email && String(input.email).includes('@')) score += 15;
  if (input.phone && String(input.phone).trim().length > 5) score += 20;
  if (input.budgetMin || input.budgetMax || input.budget) score += 15;
  if (asArray(input.propertyTypeInterest).length || input.propertyType) score += 10;
  if (asArray(input.preferredLocations).length || input.area) score += 10;
  if (input.financingMethod && input.financingMethod !== 'unknown') score += 15;
  if (input.mortgagePreApproval) score += 15;
  if (input.availabilityRequested || input.validationCallConsent) score += 10;
  return Math.min(score, 100);
};

export const createAction = (type, detail, actor = 'admin') => ({
  id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  actor,
  detail,
  createdAt: new Date().toISOString(),
});

const createInitialTask = (score, assignedTo) => ({
  id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: 'Initial contact and property matching',
  type: 'Call follow-up',
  priority: score > 70 ? 'high' : 'medium',
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  assignedTo,
  status: 'pending',
  notes: 'Auto-created: complete profile, pre-qualify budget, and shortlist properties.',
});

export const leadRowToLead = row => {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  return {
    ...payload,
    id: row.id,
    sourceSubmissionId: row.source_submission_id || payload.sourceSubmissionId,
    name: row.name || payload.name || 'Unnamed Lead',
    firstName: row.first_name || payload.firstName || '',
    lastName: row.last_name || payload.lastName || '',
    email: row.email || payload.email || '',
    phone: row.phone || payload.phone || '',
    alternatePhone: row.alternate_phone || payload.alternatePhone || '',
    whatsappNumber: row.whatsapp_number || payload.whatsappNumber || '',
    preferredChannel: row.preferred_channel || payload.preferredChannel || 'email',
    preferredLanguage: row.preferred_language || payload.preferredLanguage || 'English',
    preferredContactTime: row.preferred_contact_time || payload.preferredContactTime || 'Anytime',
    nationality: row.nationality || payload.nationality || '',
    country: row.country || payload.country || '',
    city: row.city || payload.city || '',
    residenceStatus: row.residence_status || payload.residenceStatus || 'Non-Resident',
    clientType: row.client_type || payload.clientType || 'buyer',
    propertyTypeInterest: Array.isArray(row.property_type_interest) ? row.property_type_interest : asArray(payload.propertyTypeInterest),
    preferredLocations: Array.isArray(row.preferred_locations) ? row.preferred_locations : asArray(payload.preferredLocations),
    bedroomsPreference: Array.isArray(row.bedrooms_preference) ? row.bedrooms_preference : asArray(payload.bedroomsPreference),
    budgetMin: Number(row.budget_min || payload.budgetMin || 0),
    budgetMax: Number(row.budget_max || payload.budgetMax || 0),
    financingMethod: row.financing_method || payload.financingMethod || 'unknown',
    mortgagePreApproval: Boolean(row.mortgage_pre_approval || payload.mortgagePreApproval),
    purchaseTimeframe: row.purchase_timeframe || payload.purchaseTimeframe || '3 months',
    leadSource: row.lead_source || payload.leadSource || 'website',
    sourceCampaign: row.source_campaign || payload.sourceCampaign || '',
    leadScore: Number(row.lead_score || payload.leadScore || 0),
    temperature: row.temperature || payload.temperature || 'cold',
    status: row.status || payload.status || 'New',
    assignedTo: row.assigned_to || payload.assignedTo || 'admin',
    lastActivityDate: row.last_activity_date || payload.lastActivityDate || row.updated_at,
    nextFollowUpDate: row.next_follow_up_date || payload.nextFollowUpDate || '',
    createdAt: row.created_at || payload.createdAt,
    updatedAt: row.updated_at || payload.updatedAt,
    notes: row.notes || payload.notes || '',
    description: row.description || payload.description || '',
    actionLog: Array.isArray(row.action_log) ? row.action_log : asArray(payload.actionLog),
    propertyInterests: Array.isArray(row.property_interests) ? row.property_interests : asArray(payload.propertyInterests),
    opportunities: Array.isArray(row.opportunities) ? row.opportunities : asArray(payload.opportunities),
    tasks: Array.isArray(row.tasks) ? row.tasks : asArray(payload.tasks),
    deals: Array.isArray(row.deals) ? row.deals : asArray(payload.deals),
    communications: Array.isArray(row.communications) ? row.communications : asArray(payload.communications),
    attachments: Array.isArray(row.attachments) ? row.attachments : asArray(payload.attachments),
    viewings: Array.isArray(row.viewings) ? row.viewings : asArray(payload.viewings),
    offers: Array.isArray(row.offers) ? row.offers : asArray(payload.offers),
    statusHistory: Array.isArray(row.status_history) ? row.status_history : asArray(payload.statusHistory),
    chatProfile: row.chat_profile || payload.chatProfile || null,
    chatTranscript: row.chat_transcript || payload.chatTranscript || '',
    tracking: row.tracking || payload.tracking || null,
    validationCallConsent: Boolean(row.validation_call_consent || payload.validationCallConsent),
    validationCallConsentAt: row.validation_call_consent_at || payload.validationCallConsentAt || '',
    availabilityRequested: Boolean(row.availability_requested || payload.availabilityRequested),
    projectInterest: row.project_interest || payload.projectInterest || payload.chatProfile?.projectInterest || '',
    newsletterSubscribed: Boolean(row.newsletter_subscribed || payload.newsletterSubscribed),
    newsletterSubscribedAt: row.newsletter_subscribed_at || payload.newsletterSubscribedAt || '',
    lostReason: row.lost_reason || payload.lostReason || '',
    winDetails: row.win_details || payload.winDetails || null,
  };
};

export const toLead = input => {
  const now = new Date().toISOString();
  const name = String(input.name || `${input.firstName || ''} ${input.lastName || ''}`.trim() || 'Unnamed Lead').trim();
  const email = String(input.email || '').trim();
  if (!email) throw new Error('Lead email is required');

  const budgetMax = Number(input.budgetMax || 0) || parseBudget(input.budget);
  const score = typeof input.leadScore === 'number' ? input.leadScore : calculateLeadScore({ ...input, budgetMax });
  const assignedTo = input.assignedTo || 'admin';
  const createdAt = input.createdAt || now;
  const updatedAt = input.updatedAt || now;
  const status = input.status || 'New';

  return {
    id: input.id || randomUUID(),
    sourceSubmissionId: input.sourceSubmissionId,
    name,
    firstName: input.firstName || name.split(' ')[0] || '',
    lastName: input.lastName || name.split(' ').slice(1).join(' ') || '',
    email,
    phone: input.phone ? String(input.phone).trim() : '',
    alternatePhone: input.alternatePhone || '',
    whatsappNumber: input.whatsappNumber || '',
    preferredChannel: input.preferredChannel || 'email',
    preferredLanguage: input.preferredLanguage || 'English',
    preferredContactTime: input.preferredContactTime || 'Anytime',
    nationality: input.nationality || '',
    country: input.country || '',
    city: input.city || '',
    residenceStatus: input.residenceStatus || 'Non-Resident',
    clientType: input.clientType || 'buyer',
    propertyTypeInterest: asArray(input.propertyTypeInterest || input.propertyType || input.interest),
    preferredLocations: asArray(input.preferredLocations || input.area),
    bedroomsPreference: asArray(input.bedroomsPreference),
    budgetMin: Number(input.budgetMin || 0),
    budgetMax,
    budget: input.budget || '',
    financingMethod: input.financingMethod || 'unknown',
    mortgagePreApproval: Boolean(input.mortgagePreApproval),
    purchaseTimeframe: input.purchaseTimeframe || '3 months',
    leadSource: input.leadSource || input.source || 'website',
    sourceCampaign: input.sourceCampaign || input.type || '',
    leadScore: score,
    temperature: input.temperature || (score >= 70 ? 'hot' : score >= 35 ? 'warm' : 'cold'),
    status,
    assignedTo,
    lastActivityDate: input.lastActivityDate || now,
    nextFollowUpDate: input.nextFollowUpDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt,
    updatedAt,
    notes: input.notes || '',
    description: input.description || input.preference || input.message || '',
    actionLog: asArray(input.actionLog),
    propertyInterests: asArray(input.propertyInterests || input.propertyTitle),
    opportunities: asArray(input.opportunities),
    tasks: asArray(input.tasks).length ? asArray(input.tasks) : [createInitialTask(score, assignedTo)],
    deals: asArray(input.deals),
    communications: asArray(input.communications),
    attachments: asArray(input.attachments),
    viewings: asArray(input.viewings),
    offers: asArray(input.offers),
    statusHistory: asArray(input.statusHistory).length ? asArray(input.statusHistory) : [{
      id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      from: '',
      to: status,
      updatedBy: 'system',
      timestamp: createdAt,
    }],
    chatProfile: input.chatProfile || null,
    chatTranscript: input.chatTranscript || '',
    tracking: input.tracking || null,
    validationCallConsent: Boolean(input.validationCallConsent || input.chatProfile?.contactConsent),
    validationCallConsentAt: input.validationCallConsentAt || input.chatProfile?.contactConsentAt || '',
    availabilityRequested: Boolean(input.availabilityRequested || input.chatProfile?.availabilityRequested),
    projectInterest: input.projectInterest || input.chatProfile?.projectInterest || '',
    newsletterSubscribed: Boolean(input.newsletterSubscribed || input.chatProfile?.newsletterSubscribed),
    newsletterSubscribedAt: input.newsletterSubscribedAt || input.chatProfile?.newsletterSubscribedAt || '',
    lostReason: input.lostReason || '',
    winDetails: input.winDetails || null,
  };
};

export const leadToRow = lead => ({
  id: lead.id,
  source_submission_id: formatUuid(lead.sourceSubmissionId),
  name: lead.name,
  first_name: lead.firstName || null,
  last_name: lead.lastName || null,
  email: lead.email,
  phone: lead.phone || null,
  alternate_phone: lead.alternatePhone || null,
  whatsapp_number: lead.whatsappNumber || null,
  preferred_channel: lead.preferredChannel || null,
  preferred_language: lead.preferredLanguage || null,
  preferred_contact_time: lead.preferredContactTime || null,
  nationality: lead.nationality || null,
  country: lead.country || null,
  city: lead.city || null,
  residence_status: lead.residenceStatus || null,
  client_type: lead.clientType || null,
  property_type_interest: asArray(lead.propertyTypeInterest),
  preferred_locations: asArray(lead.preferredLocations),
  bedrooms_preference: asArray(lead.bedroomsPreference),
  budget_min: Number(lead.budgetMin || 0),
  budget_max: Number(lead.budgetMax || 0),
  financing_method: lead.financingMethod || null,
  mortgage_pre_approval: Boolean(lead.mortgagePreApproval),
  purchase_timeframe: lead.purchaseTimeframe || null,
  lead_source: lead.leadSource || 'website',
  source_campaign: lead.sourceCampaign || null,
  lead_score: Number(lead.leadScore || 0),
  temperature: lead.temperature || null,
  status: lead.status || 'New',
  assigned_to: lead.assignedTo || null,
  last_activity_date: lead.lastActivityDate || null,
  next_follow_up_date: lead.nextFollowUpDate || null,
  notes: lead.notes || null,
  description: lead.description || null,
  action_log: asArray(lead.actionLog),
  property_interests: asArray(lead.propertyInterests),
  opportunities: asArray(lead.opportunities),
  tasks: asArray(lead.tasks),
  deals: asArray(lead.deals),
  communications: asArray(lead.communications),
  attachments: asArray(lead.attachments),
  viewings: asArray(lead.viewings),
  offers: asArray(lead.offers),
  status_history: asArray(lead.statusHistory),
  chat_profile: lead.chatProfile || null,
  chat_transcript: lead.chatTranscript || null,
  tracking: lead.tracking || null,
  validation_call_consent: Boolean(lead.validationCallConsent),
  validation_call_consent_at: lead.validationCallConsentAt || null,
  availability_requested: Boolean(lead.availabilityRequested),
  project_interest: lead.projectInterest || null,
  newsletter_subscribed: Boolean(lead.newsletterSubscribed),
  newsletter_subscribed_at: lead.newsletterSubscribedAt || null,
  lost_reason: lead.lostReason || null,
  win_details: lead.winDetails || null,
  payload: lead,
  created_at: lead.createdAt,
  updated_at: lead.updatedAt,
});

export const readLeads = async () => {
  const { data, error } = await assertSupabase().from('crm_leads').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(leadRowToLead);
};

export const upsertLeads = async leads => {
  if (!leads.length) return;
  const { error } = await assertSupabase().from('crm_leads').upsert(leads.map(leadToRow), { onConflict: 'id' });
  if (error) throw new Error(error.message);
};

export const deleteLead = async id => {
  const { error } = await assertSupabase().from('crm_leads').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const readDuplicateLeads = async () => {
  const { data, error } = await assertSupabase().from('crm_duplicate_leads').select('*').order('archived_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(row => row.payload).filter(Boolean);
};

export const upsertDuplicateLeads = async leads => {
  if (!leads.length) return;
  const rows = leads.map(lead => ({
    id: lead.id,
    original_id: lead.duplicateMeta?.matchedLeadId || lead.id,
    source_type: lead.duplicateMeta?.source || 'manual',
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    duplicate_reason: lead.duplicateMeta?.reason || null,
    admin_note: lead.duplicateMeta?.note || null,
    payload: lead,
    archived_at: lead.duplicateMeta?.movedAt || new Date().toISOString(),
    archived_by: lead.duplicateMeta?.movedBy || 'admin',
  }));
  const { error } = await assertSupabase().from('crm_duplicate_leads').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(error.message);
};

export const findDuplicateLead = (input, leads) => {
  const email = normalizeEmail(input.email);
  const phones = [normalizePhone(input.phone), normalizePhone(input.alternatePhone), normalizePhone(input.whatsappNumber)].filter(Boolean);
  return leads.find(lead => {
    const leadEmails = [normalizeEmail(lead.email)].filter(Boolean);
    const leadPhones = [normalizePhone(lead.phone), normalizePhone(lead.alternatePhone), normalizePhone(lead.whatsappNumber)].filter(Boolean);
    return (email && leadEmails.includes(email)) || phones.some(phone => leadPhones.includes(phone));
  });
};

export const enquiryRowToEnquiry = row => {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  return {
    ...payload,
    id: row.id,
    type: row.type || payload.type || '',
    firstName: row.first_name || payload.firstName || '',
    lastName: row.last_name || payload.lastName || '',
    name: row.name || payload.name || '',
    email: row.email || payload.email || '',
    phone: row.phone || payload.phone || '',
    interest: row.interest || payload.interest || '',
    budget: row.budget || payload.budget || '',
    area: row.area || payload.area || '',
    propertyId: row.property_id || payload.propertyId || '',
    propertyTitle: row.property_title || payload.propertyTitle || '',
    message: row.message || payload.message || '',
    source: row.source || payload.source || 'website',
    status: row.status || payload.status || 'new',
    assignedTo: row.assigned_to || payload.assignedTo || '',
    actionLog: Array.isArray(row.action_log) ? row.action_log : asArray(payload.actionLog),
    chatProfile: row.chat_profile || payload.chatProfile || null,
    chatTranscript: row.chat_transcript || payload.chatTranscript || '',
    tracking: row.tracking || payload.tracking || null,
    newsletterSubscribed: Boolean(row.newsletter_subscribed || payload.newsletterSubscribed),
    newsletterSubscribedAt: row.newsletter_subscribed_at || payload.newsletterSubscribedAt || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const enquiryToRow = input => {
  const now = new Date().toISOString();
  const id = formatUuid(input.id) || randomUUID();
  return {
    id,
    type: input.type || null,
    first_name: input.firstName || null,
    last_name: input.lastName || null,
    name: input.name || `${input.firstName || ''} ${input.lastName || ''}`.trim() || null,
    email: input.email || null,
    phone: input.phone || null,
    interest: input.interest || null,
    budget: input.budget || null,
    area: input.area || null,
    property_id: input.propertyId || null,
    property_title: input.propertyTitle || null,
    message: input.message || null,
    source: input.source || 'website',
    status: input.status || 'new',
    assigned_to: input.assignedTo || null,
    action_log: asArray(input.actionLog),
    chat_profile: input.chatProfile || null,
    chat_transcript: input.chatTranscript || null,
    tracking: input.tracking || null,
    newsletter_subscribed: Boolean(input.newsletterSubscribed),
    newsletter_subscribed_at: input.newsletterSubscribedAt || null,
    payload: { ...input, id },
    created_at: input.createdAt || now,
    updated_at: now,
  };
};
