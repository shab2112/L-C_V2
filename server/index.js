import { createServer } from 'http';
import https from 'https';
import { readFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const RESEND_URL = 'https://api.resend.com/emails';

function loadDotEnv() {
  if (!existsSync('.env')) return;

  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+?)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

const PORT = Number(process.env.PORT || 3001);
const WHATSAPP_GRAPH_API_BASE = process.env.WHATSAPP_GRAPH_API_BASE || 'https://graph.facebook.com/v23.0';
const WHATSAPP_BUSINESS_NUMBER = normalizePhone(process.env.WHATSAPP_BUSINESS_NUMBER || '971564144401').replace(/^\+/, '');

const allowInsecureNodeTls = (process.env.NODE_ALLOW_INSECURE_TLS || 'true').toLowerCase() !== 'false';

if (allowInsecureNodeTls) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn('[crm-api] NODE TLS certificate verification is disabled for local development. Set NODE_ALLOW_INSECURE_TLS=false after fixing the local certificate chain.');
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[crm-api] Missing Supabase URL/key. CRM routes will return configuration errors.');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2_000_000) req.destroy(new Error('Request body too large'));
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function assertSupabase() {
  if (!supabase) {
    throw new Error('Supabase backend is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.');
  }
  return supabase;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function asArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function formatUuid(value) {
  const raw = String(value || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)
    ? raw
    : null;
}

function calculateLeadScore(input) {
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
}

function parseBudget(value) {
  if (typeof value === 'number') return value;
  const text = String(value || '').toLowerCase();
  const range = text.match(/(\d+(?:\.\d+)?)\s*(?:m|million)?\s*[-to]+\s*(\d+(?:\.\d+)?)\s*(m|million)?/);
  if (range) {
    return Number(range[2]) * (range[3] ? 1_000_000 : 1);
  }
  const match = text.match(/(\d+(?:\.\d+)?)\s*(m|million|k|thousand)?/);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2] || '';
  if (unit.startsWith('m')) return amount * 1_000_000;
  if (unit.startsWith('k') || unit.startsWith('thousand')) return amount * 1_000;
  return amount;
}

function createAction(type, detail, actor = 'admin') {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    actor,
    detail,
    createdAt: new Date().toISOString(),
  };
}

function createInitialTask(score, assignedTo) {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: 'Initial contact and property matching',
    type: 'Call follow-up',
    priority: score > 70 ? 'high' : 'medium',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo,
    status: 'pending',
    notes: 'Auto-created: complete profile, pre-qualify budget, and shortlist properties.',
  };
}

function leadRowToLead(row) {
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
}

function leadToRow(lead) {
  return {
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
  };
}

function toLead(input) {
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
}

async function readLeads() {
  const db = assertSupabase();
  const { data, error } = await db.from('crm_leads').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(leadRowToLead);
}

async function upsertLeads(leads) {
  if (!leads.length) return;
  const db = assertSupabase();
  const { error } = await db.from('crm_leads').upsert(leads.map(leadToRow), { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

async function deleteLead(id) {
  const db = assertSupabase();
  const { error } = await db.from('crm_leads').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

async function readDuplicateLeads() {
  const db = assertSupabase();
  const { data, error } = await db.from('crm_duplicate_leads').select('*').order('archived_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(row => row.payload).filter(Boolean);
}

async function upsertDuplicateLeads(leads) {
  if (!leads.length) return;
  const db = assertSupabase();
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
}

function findDuplicateLead(input, leads) {
  const email = normalizeEmail(input.email);
  const phones = [normalizePhone(input.phone), normalizePhone(input.alternatePhone), normalizePhone(input.whatsappNumber)].filter(Boolean);
  return leads.find(lead => {
    const leadEmails = [normalizeEmail(lead.email)].filter(Boolean);
    const leadPhones = [normalizePhone(lead.phone), normalizePhone(lead.alternatePhone), normalizePhone(lead.whatsappNumber)].filter(Boolean);
    return (email && leadEmails.includes(email)) || phones.some(phone => leadPhones.includes(phone));
  });
}

async function handleLeads(req, res, url) {
  if (req.method === 'GET') {
    const leads = url.searchParams.get('type') === 'duplicates' ? await readDuplicateLeads() : await readLeads();
    sendJson(res, 200, { success: true, data: leads });
    return;
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const existing = await readLeads();
    const inputs = Array.isArray(body.leads) ? body.leads : [body];
    const created = [];
    const duplicates = [];

    for (const input of inputs) {
      const matched = findDuplicateLead(input, existing);
      if (matched && !body.allowDuplicates) {
        const duplicate = toLead({
          ...input,
          status: 'Duplicate',
          actionLog: [...asArray(input.actionLog), createAction('duplicate', `Auto-routed to duplicate list. Matched active lead ${matched.name} (${matched.id}).`, body.actor || 'system')],
        });
        duplicate.duplicateMeta = {
          reason: 'Matching contact information',
          note: `Matched active lead ${matched.name} by email or phone.`,
          matchedLeadId: matched.id,
          movedBy: body.actor || 'system',
          movedAt: new Date().toISOString(),
          source: 'auto',
        };
        duplicates.push(duplicate);
        continue;
      }

      created.push(toLead(input));
    }

    await upsertLeads(created);
    await upsertDuplicateLeads(duplicates);
    sendJson(res, 201, { success: true, data: created, duplicates });
    return;
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    const leads = await readLeads();

    if (body.action === 'markDuplicate') {
      const lead = leads.find(item => item.id === body.id);
      if (!lead) {
        sendJson(res, 404, { success: false, error: 'Lead not found' });
        return;
      }
      const now = new Date().toISOString();
      const duplicate = {
        ...lead,
        status: 'Duplicate',
        updatedAt: now,
        duplicateMeta: {
          reason: 'Manual admin review',
          note: String(body.note || 'Marked as duplicate by admin.'),
          matchedLeadId: body.matchedLeadId || '',
          movedBy: body.actor || 'admin',
          movedAt: now,
          source: 'manual',
        },
        actionLog: [...asArray(lead.actionLog), createAction('duplicate', `Moved to duplicate list. Note: ${body.note || ''}`, body.actor || 'admin')],
      };
      await deleteLead(lead.id);
      await upsertDuplicateLeads([duplicate]);
      sendJson(res, 200, { success: true, data: duplicate });
      return;
    }

    const index = leads.findIndex(item => item.id === body.id);
    if (index === -1) {
      sendJson(res, 404, { success: false, error: 'Lead not found' });
      return;
    }

    const before = leads[index];
    const updates = { ...body };
    delete updates.id;
    const merged = {
      ...before,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status && updates.status !== before.status) {
      merged.statusHistory = [
        ...asArray(before.statusHistory),
        {
          id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          from: before.status,
          to: updates.status,
          updatedBy: body.actor || 'admin',
          timestamp: new Date().toISOString(),
        },
      ];
    }

    merged.leadScore = calculateLeadScore(merged);
    merged.temperature = merged.leadScore >= 70 ? 'hot' : merged.leadScore >= 35 ? 'warm' : 'cold';

    await upsertLeads([merged]);
    sendJson(res, 200, { success: true, data: merged });
    return;
  }

  sendJson(res, 405, { success: false, error: 'Method not allowed' });
}

function enquiryRowToEnquiry(row) {
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
}

function enquiryToRow(input) {
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
}

async function handleEnquiries(req, res) {
  const db = assertSupabase();
  if (req.method === 'GET') {
    const { data, error } = await db.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    sendJson(res, 200, { success: true, data: (data || []).map(enquiryRowToEnquiry) });
    return;
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const { data, error } = await db.from('enquiries').upsert(enquiryToRow(body), { onConflict: 'id' }).select('*').single();
    if (error) throw new Error(error.message);
    sendJson(res, 201, { success: true, data: enquiryRowToEnquiry(data) });
    return;
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    if (!body.id) {
      sendJson(res, 400, { success: false, error: 'Enquiry ID required' });
      return;
    }
    const row = enquiryToRow(body);
    const { data, error } = await db.from('enquiries').upsert(row, { onConflict: 'id' }).select('*').single();
    if (error) throw new Error(error.message);
    sendJson(res, 200, { success: true, data: enquiryRowToEnquiry(data) });
    return;
  }

  sendJson(res, 405, { success: false, error: 'Method not allowed' });
}

function postNvidia(payload) {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL || process.env.VITE_NVIDIA_MODEL || 'z-ai/glm-5.2';
  const baseUrl = (process.env.NVIDIA_BASE_URL || process.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
  const allowInsecureTls = (process.env.NVIDIA_ALLOW_INSECURE_TLS || 'true').toLowerCase() !== 'false';

  if (!apiKey) throw new Error('NVIDIA API key is not configured');

  const url = new URL(`${baseUrl}/chat/completions`);
  return new Promise((resolve, reject) => {
    const request = https.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || 443,
      path: `${url.pathname}${url.search}`,
      method: 'POST',
      rejectUnauthorized: !allowInsecureTls,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }, response => {
      let responseBody = '';
      response.on('data', chunk => {
        responseBody += chunk;
      });
      response.on('end', () => {
        let parsed = {};
        try {
          parsed = responseBody ? JSON.parse(responseBody) : {};
        } catch {
          parsed = { error: responseBody };
        }
        if ((response.statusCode || 500) >= 300) {
          reject(new Error(`NVIDIA request failed: ${response.statusCode} ${responseBody.slice(0, 300)}`));
          return;
        }
        resolve({ parsed, model });
      });
    });
    request.on('error', reject);
    request.setTimeout(45_000, () => request.destroy(new Error('NVIDIA request timed out')));
    request.write(JSON.stringify({
      model,
      messages: asArray(payload.messages),
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: Math.min(Math.max(Number(payload.max_tokens || 2048), 16), 5000),
      stream: false,
    }));
    request.end();
  });
}

async function handleDarieChat(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  const body = await readBody(req);
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    sendJson(res, 400, { error: 'Messages are required' });
    return;
  }
  const { parsed, model } = await postNvidia(body);
  sendJson(res, 200, {
    text: parsed.choices?.[0]?.message?.content || '',
    model,
  });
}

async function handleSendEmail(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const configuredFrom = process.env.EMAIL_FROM;

  if (!apiKey || !configuredFrom) {
    sendJson(res, 503, {
      success: false,
      error: 'Email provider is not configured. Set RESEND_API_KEY and EMAIL_FROM in .env.',
    });
    return;
  }

  const body = await readBody(req);
  const to = typeof body.to === 'string' ? body.to.trim() : '';
  const senderEmail = typeof body.senderEmail === 'string' ? body.senderEmail.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!isEmail(to) || !isEmail(senderEmail) || !subject || !message) {
    sendJson(res, 400, {
      success: false,
      error: 'Valid recipient, sender email, subject, and message are required.',
    });
    return;
  }

  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'lockwood-carter-crm/1.0',
    },
    body: JSON.stringify({
      from: configuredFrom,
      to,
      reply_to: senderEmail,
      subject,
      text: message,
    }),
  });

  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { message: responseText };
  }

  if (!response.ok) {
    sendJson(res, response.status, {
      success: false,
      error: data.message || data.error || 'Email send failed',
    });
    return;
  }

  sendJson(res, 200, { success: true, data });
}

async function handleSendWhatsApp(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    sendJson(res, 503, {
      success: false,
      businessNumber: WHATSAPP_BUSINESS_NUMBER,
      error: 'WhatsApp Cloud API is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env for +971564144401.',
    });
    return;
  }

  const body = await readBody(req);
  const to = normalizePhone(body.to).replace(/^\+/, '');
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!to || !message) {
    sendJson(res, 400, {
      success: false,
      error: 'Recipient WhatsApp number and message are required.',
    });
    return;
  }

  const response = await fetch(`${WHATSAPP_GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    }),
  });

  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { message: responseText };
  }

  if (!response.ok) {
    sendJson(res, response.status, {
      success: false,
      businessNumber: WHATSAPP_BUSINESS_NUMBER,
      error: data.error?.message || data.message || 'WhatsApp send failed',
    });
    return;
  }

  sendJson(res, 200, { success: true, businessNumber: WHATSAPP_BUSINESS_NUMBER, data });
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  try {
    if (url.pathname === '/api/health') {
      sendJson(res, 200, {
        success: true,
        service: 'lockwood-carter-node-api',
        supabaseConfigured: Boolean(supabase),
        usesServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        whatsAppBusinessNumber: WHATSAPP_BUSINESS_NUMBER,
        whatsAppConfigured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      });
      return;
    }

    if (url.pathname === '/api/darie-chat') {
      await handleDarieChat(req, res);
      return;
    }

    if (url.pathname === '/api/leads') {
      await handleLeads(req, res, url);
      return;
    }

    if (url.pathname === '/api/enquiries') {
      await handleEnquiries(req, res);
      return;
    }

    if (url.pathname === '/api/admin/send-email') {
      await handleSendEmail(req, res);
      return;
    }

    if (url.pathname === '/api/admin/send-whatsapp') {
      await handleSendWhatsApp(req, res);
      return;
    }

    sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown server error',
    });
  }
});

server.listen(PORT, () => {
  console.log(`[crm-api] Node API listening on http://localhost:${PORT}`);
});
