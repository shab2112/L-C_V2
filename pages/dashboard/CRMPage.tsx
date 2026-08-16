import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Download,
  FileText,
  Filter,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { User } from '../../types';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  preferredChannel?: string;
  clientType?: string;
  propertyTypeInterest?: string[];
  preferredLocations?: string[];
  bedroomsPreference?: string[];
  budgetMin?: number;
  budgetMax?: number;
  budget?: string;
  financingMethod?: string;
  mortgagePreApproval?: boolean;
  purchaseTimeframe?: string;
  leadSource?: string;
  sourceCampaign?: string;
  leadScore?: number;
  temperature?: 'cold' | 'warm' | 'hot';
  status: string;
  assignedTo?: string;
  lastActivityDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  description?: string;
  actionLog?: any[];
  attachments?: any[];
  viewings?: any[];
  offers?: any[];
  statusHistory?: any[];
  tasks?: any[];
  deals?: any[];
  communications?: any[];
  chatProfile?: any;
  chatTranscript?: string;
  validationCallConsent?: boolean;
  availabilityRequested?: boolean;
  projectInterest?: string;
  newsletterSubscribed?: boolean;
  duplicateMeta?: any;
  createdAt?: string;
  updatedAt?: string;
};

type Enquiry = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  interest?: string;
  budget?: string;
  area?: string;
  propertyTitle?: string;
  message?: string;
  source?: string;
  status?: string;
  chatProfile?: any;
  chatTranscript?: string;
  newsletterSubscribed?: boolean;
  createdAt?: string;
};

type CRMPageProps = {
  currentUser?: User | null;
};

const DEFAULT_SENDER_EMAIL = 'info@lockwoodandcarter.com';
const SENDER_EMAIL_STORAGE_KEY = 'lc_admin_sender_email';
const DEFAULT_WHATSAPP_BUSINESS_NUMBER = (import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || '+971564144401').trim();
const statuses = [
  'New',
  'Attempted Contact',
  'Contacted',
  'Qualified',
  'Unqualified',
  'Interested',
  'Viewing Scheduled',
  'Viewing Completed',
  'Negotiation',
  'Offer Made',
  'Booking Pending',
  'Booked',
  'Closed Won',
  'Closed Lost',
];
const clientTypes = ['buyer', 'tenant', 'seller', 'investor'];
const detailTabs = ['tasks', 'deals', 'communications', 'attachments', 'viewings', 'timeline'] as const;

const emptyLead = {
  name: '',
  email: '',
  phone: '',
  clientType: 'buyer',
  propertyTypeInterest: '',
  preferredLocations: '',
  budgetMax: '',
  financingMethod: 'unknown',
  purchaseTimeframe: '3 months',
  leadSource: 'website',
  notes: '',
};

const formatCurrency = (value?: number) => {
  if (!value) return 'Not set';
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M`;
  return `AED ${value.toLocaleString()}`;
};

const tempClass = (temperature?: string) => {
  if (temperature === 'hot') return 'bg-red-500/15 text-red-200 border-red-400/30';
  if (temperature === 'warm') return 'bg-amber-400/15 text-amber-100 border-amber-300/30';
  return 'bg-sky-400/15 text-sky-100 border-sky-300/30';
};

const statusClass = (status?: string) => {
  if (status === 'Closed Won') return 'bg-emerald-500/15 text-emerald-100 border-emerald-300/30';
  if (status === 'Closed Lost') return 'bg-red-500/15 text-red-100 border-red-300/30';
  if (status === 'Qualified') return 'bg-blue-500/15 text-blue-100 border-blue-300/30';
  return 'bg-white/10 text-white/80 border-white/15';
};

const readApiJson = async (response: Response, label: string) => {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`${label} returned an empty response. Start the Node API with npm.cmd run server and refresh this page.`);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`${label} returned a non-JSON response (${response.status}). Check that the Node API is running on port 3001.`);
  }

  if (!response.ok) {
    throw new Error(data.error || `${label} failed with status ${response.status}`);
  }

  return data;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const downloadCsv = (filename: string, rows: Record<string, any>[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const CRMPage: React.FC<CRMPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'enquiries' | 'duplicates' | 'deals' | 'reports' | 'import'>('overview');
  const [detailTab, setDetailTab] = useState<typeof detailTabs[number]>('tasks');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [duplicates, setDuplicates] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [temperatureFilter, setTemperatureFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [clientTypeFilter, setClientTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'score' | 'budget' | 'lastActivity'>('newest');
  const [analyticsRange, setAnalyticsRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [bulkAssignOwner, setBulkAssignOwner] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [leadDraft, setLeadDraft] = useState(emptyLead);
  const [bulkText, setBulkText] = useState('');
  const [senderEmail, setSenderEmail] = useState(DEFAULT_SENDER_EMAIL);
  const [emailDraft, setEmailDraft] = useState<{ leadId: string; to: string; subject: string; message: string } | null>(null);
  const [emailLoadingId, setEmailLoadingId] = useState<string | null>(null);
  const [whatsAppLoadingId, setWhatsAppLoadingId] = useState<string | null>(null);

  const selectedLead = useMemo(() => leads.find(lead => lead.id === selectedLeadId) || leads[0], [leads, selectedLeadId]);

  const filteredLeads = useMemo(() => {
    const term = search.toLowerCase();
    return leads.filter(lead => {
      const matchesSearch = !term || [
        lead.name,
        lead.email,
        lead.phone,
        lead.projectInterest,
        lead.preferredLocations?.join(' '),
        lead.propertyTypeInterest?.join(' '),
      ].filter(Boolean).join(' ').toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.leadSource === sourceFilter;
      const matchesTemperature = temperatureFilter === 'all' || lead.temperature === temperatureFilter;
      const matchesOwner = ownerFilter === 'all' || (lead.assignedTo || 'admin') === ownerFilter;
      const matchesClientType = clientTypeFilter === 'all' || lead.clientType === clientTypeFilter;
      const matchesDate = (() => {
        if (analyticsRange === 'all') return true;
        const createdAt = new Date(lead.createdAt || 0).getTime();
        if (!Number.isFinite(createdAt)) return false;
        const ageDays = (Date.now() - createdAt) / 86_400_000;
        if (analyticsRange === 'today') return ageDays <= 1;
        if (analyticsRange === 'week') return ageDays <= 7;
        return ageDays <= 30;
      })();
      return matchesSearch && matchesStatus && matchesSource && matchesTemperature && matchesOwner && matchesClientType && matchesDate;
    }).sort((a, b) => {
      if (sortBy === 'score') return Number(b.leadScore || 0) - Number(a.leadScore || 0);
      if (sortBy === 'budget') return Number(b.budgetMax || 0) - Number(a.budgetMax || 0);
      if (sortBy === 'lastActivity') {
        return new Date(b.lastActivityDate || b.updatedAt || b.createdAt || 0).getTime() - new Date(a.lastActivityDate || a.updatedAt || a.createdAt || 0).getTime();
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [analyticsRange, clientTypeFilter, leads, ownerFilter, search, sortBy, sourceFilter, statusFilter, temperatureFilter]);

  const sources = useMemo(() => Array.from(new Set(leads.map(lead => lead.leadSource || 'website'))), [leads]);
  const owners = useMemo(() => Array.from(new Set(['admin', currentUser?.name || '', ...leads.map(lead => lead.assignedTo || 'admin')].filter(Boolean))), [currentUser?.name, leads]);
  const allDeals = useMemo(() => leads.flatMap(lead => (lead.deals || []).map(deal => ({ ...deal, leadId: lead.id, leadName: lead.name, leadStatus: lead.status }))), [leads]);

  const analytics = useMemo(() => {
    const active = filteredLeads.filter(lead => !['Closed Won', 'Closed Lost', 'Duplicate'].includes(lead.status));
    const hot = filteredLeads.filter(lead => lead.temperature === 'hot' || (lead.leadScore || 0) >= 70);
    const chatQualified = filteredLeads.filter(lead => lead.leadSource === 'chat' || lead.chatProfile || lead.chatTranscript);
    const wonValue = filteredLeads
      .filter(lead => lead.status === 'Closed Won')
      .reduce((sum, lead) => sum + Number(lead.budgetMax || 0), 0);
    const viewings = filteredLeads.filter(lead => lead.status === 'Viewing Scheduled' || (lead.viewings || []).some(viewing => viewing.status === 'scheduled'));
    const offers = filteredLeads.filter(lead => lead.status === 'Offer Made' || (lead.offers || []).length);
    const pipelineValue = filteredLeads.reduce((sum, lead) => sum + (lead.deals || []).reduce((dealSum, deal) => dealSum + Number(deal.expectedValue || deal.value || 0), 0), 0);
    const stale = filteredLeads.filter(lead => {
      if (['Closed Won', 'Closed Lost'].includes(lead.status)) return false;
      const last = new Date(lead.lastActivityDate || lead.updatedAt || lead.createdAt || 0).getTime();
      return Number.isFinite(last) && (Date.now() - last) / 86_400_000 >= 7;
    });

    return {
      total: filteredLeads.length,
      active: active.length,
      hot: hot.length,
      qualified: filteredLeads.filter(lead => lead.status === 'Qualified' || Number(lead.leadScore || 0) >= 60).length,
      chatQualified: chatQualified.length,
      duplicates: duplicates.length,
      enquiries: enquiries.length,
      wonValue,
      viewings: viewings.length,
      offers: offers.length,
      pipelineValue,
      stale: stale.length,
      conversionRate: filteredLeads.length ? Math.round((filteredLeads.filter(lead => lead.status === 'Closed Won').length / filteredLeads.length) * 100) : 0,
    };
  }, [duplicates.length, enquiries.length, filteredLeads]);

  const loadCRM = async () => {
    setLoading(true);
    setError('');
    try {
      const [leadsRes, enquiriesRes, duplicatesRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/enquiries'),
        fetch('/api/leads?type=duplicates'),
      ]);
      const [leadsData, enquiriesData, duplicatesData] = await Promise.all([
        readApiJson(leadsRes, 'Leads API'),
        readApiJson(enquiriesRes, 'Enquiries API'),
        readApiJson(duplicatesRes, 'Duplicate leads API'),
      ]);
      if (!leadsData.success) throw new Error(leadsData.error || 'Failed to load leads');
      if (!enquiriesData.success) throw new Error(enquiriesData.error || 'Failed to load enquiries');
      if (!duplicatesData.success) throw new Error(duplicatesData.error || 'Failed to load duplicate leads');
      setLeads(leadsData.data || []);
      setEnquiries(enquiriesData.data || []);
      setDuplicates(duplicatesData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCRM();
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(SENDER_EMAIL_STORAGE_KEY);
    if (stored && isValidEmail(stored)) {
      setSenderEmail(stored);
    } else {
      window.localStorage.setItem(SENDER_EMAIL_STORAGE_KEY, DEFAULT_SENDER_EMAIL);
    }
  }, []);

  const createLead = async (input: any) => {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await readApiJson(response, 'Create lead API');
    if (!data.success) throw new Error(data.error || 'Failed to create lead');
    await loadCRM();
    return data;
  };

  const updateLead = async (updates: Partial<Lead> & { id: string; actor?: string }) => {
    const response = await fetch('/api/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, actor: currentUser?.name || 'admin' }),
    });
    const data = await readApiJson(response, 'Update lead API');
    if (!data.success) throw new Error(data.error || 'Failed to update lead');
    await loadCRM();
  };

  const createAction = (type: string, detail: string) => ({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    actor: currentUser?.name || 'admin',
    detail,
    createdAt: new Date().toISOString(),
  });

  const handleCreateLead = async () => {
    setError('');
    try {
      await createLead({
        name: leadDraft.name,
        email: leadDraft.email,
        phone: leadDraft.phone,
        clientType: leadDraft.clientType,
        propertyTypeInterest: leadDraft.propertyTypeInterest.split(',').map(item => item.trim()).filter(Boolean),
        preferredLocations: leadDraft.preferredLocations.split(',').map(item => item.trim()).filter(Boolean),
        budgetMax: Number(leadDraft.budgetMax || 0),
        financingMethod: leadDraft.financingMethod,
        purchaseTimeframe: leadDraft.purchaseTimeframe,
        leadSource: leadDraft.leadSource,
        notes: leadDraft.notes,
        assignedTo: currentUser?.name || 'admin',
      });
      setLeadDraft(emptyLead);
      setActiveTab('leads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    }
  };

  const convertEnquiry = async (enquiry: Enquiry) => {
    setError('');
    try {
      await createLead({
        sourceSubmissionId: enquiry.id,
        name: enquiry.name || `${enquiry.firstName || ''} ${enquiry.lastName || ''}`.trim() || 'Website visitor',
        email: enquiry.email,
        phone: enquiry.phone,
        interest: enquiry.interest,
        budget: enquiry.budget,
        area: enquiry.area,
        propertyTitle: enquiry.propertyTitle,
        description: enquiry.message || enquiry.propertyTitle || '',
        leadSource: enquiry.source || 'website',
        sourceCampaign: enquiry.type || '',
        chatProfile: enquiry.chatProfile,
        chatTranscript: enquiry.chatTranscript,
        newsletterSubscribed: enquiry.newsletterSubscribed,
        assignedTo: currentUser?.name || 'admin',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert enquiry');
    }
  };

  const markDuplicate = async (lead: Lead) => {
    const note = window.prompt('Admin duplicate note');
    if (!note) return;
    setError('');
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'markDuplicate',
          id: lead.id,
          note,
          actor: currentUser?.name || 'admin',
        }),
      });
      const data = await readApiJson(response, 'Duplicate lead API');
      if (!data.success) throw new Error(data.error || 'Failed to mark duplicate');
      await loadCRM();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark duplicate');
    }
  };

  const parseBulk = () => bulkText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [name, email, phone, interest, budget, area, notes] = parseCsvLine(line);
      return { name, email, phone, propertyTypeInterest: interest ? [interest] : [], budget, preferredLocations: area ? [area] : [], notes, leadSource: 'bulk-import' };
    })
    .filter(row => row.name && row.email);

  const importBulk = async () => {
    const leadsToCreate = parseBulk();
    if (!leadsToCreate.length) {
      setError('Add rows as name,email,phone,interest,budget,area,notes');
      return;
    }
    setError('');
    try {
      await createLead({ leads: leadsToCreate, actor: currentUser?.name || 'admin' });
      setBulkText('');
      setActiveTab('leads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import leads');
    }
  };

  const importCsvFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setBulkText(text);
    const rows = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .filter(line => {
        const [first, second] = parseCsvLine(line).map(item => item.toLowerCase());
        return !(first === 'name' && second === 'email');
      })
      .map(line => {
        const [name, email, phone, interest, budget, area, notes] = parseCsvLine(line);
        return { name, email, phone, propertyTypeInterest: interest ? [interest] : [], budget, preferredLocations: area ? [area] : [], notes, leadSource: 'csv-import' };
      })
      .filter(row => row.name && row.email);

    if (!rows.length) {
      setError('CSV must contain rows as name,email,phone,interest,budget,area,notes');
      return;
    }

    setError('');
    try {
      await createLead({ leads: rows, actor: currentUser?.name || 'admin' });
      setBulkText('');
      setActiveTab('leads');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import CSV');
    }
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleAllFiltered = () => {
    const ids = filteredLeads.map(lead => lead.id);
    setSelectedLeadIds(prev => ids.every(id => prev.includes(id)) ? prev.filter(id => !ids.includes(id)) : Array.from(new Set([...prev, ...ids])));
  };

  const bulkUpdateSelected = async () => {
    const selected = leads.filter(lead => selectedLeadIds.includes(lead.id));
    if (!selected.length) {
      setError('Select at least one lead first.');
      return;
    }
    if (!bulkAssignOwner && !bulkStatus) {
      setError('Choose an owner or status for the bulk update.');
      return;
    }
    setError('');
    try {
      for (const lead of selected) {
        await updateLead({
          id: lead.id,
          assignedTo: bulkAssignOwner || lead.assignedTo,
          status: bulkStatus || lead.status,
          lastActivityDate: new Date().toISOString(),
          actionLog: [
            ...(lead.actionLog || []),
            createAction('bulk-update', `Bulk updated${bulkAssignOwner ? ` owner to ${bulkAssignOwner}` : ''}${bulkStatus ? ` status to ${bulkStatus}` : ''}.`),
          ],
        });
      }
      setSelectedLeadIds([]);
      setBulkAssignOwner('');
      setBulkStatus('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update selected leads');
    }
  };

  const addCommunication = async (lead: Lead, channel: string) => {
    const detail = window.prompt(`Log ${channel} note`);
    if (!detail) return;
    await updateLead({
      id: lead.id,
      lastActivityDate: new Date().toISOString(),
      communications: [
        ...(lead.communications || []),
        {
          id: `comm-${Date.now()}`,
          channel,
          subject: `${channel} follow-up`,
          detail,
          actor: currentUser?.name || 'admin',
          timestamp: new Date().toISOString(),
        },
      ],
      actionLog: [...(lead.actionLog || []), createAction(channel, detail)],
    });
  };

  const addTask = async (lead: Lead) => {
    const title = window.prompt('Task title');
    if (!title) return;
    const dueDate = window.prompt('Due date (YYYY-MM-DD)', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]) || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const priority = (window.prompt('Priority: low, medium, high', (lead.leadScore || 0) >= 70 ? 'high' : 'medium') || 'medium').toLowerCase();
    await updateLead({
      id: lead.id,
      tasks: [
        ...(lead.tasks || []),
        {
          id: `task-${Date.now()}`,
          title,
          type: 'Follow-up',
          priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
          dueDate,
          assignedTo: lead.assignedTo || currentUser?.name || 'admin',
          status: 'pending',
        },
      ],
      actionLog: [...(lead.actionLog || []), createAction('task', `Task added: ${title}`)],
    });
  };

  const toggleTaskStatus = async (lead: Lead, taskId: string) => {
    const tasks = (lead.tasks || []).map(task => task.id === taskId ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task);
    await updateLead({
      id: lead.id,
      tasks,
      lastActivityDate: new Date().toISOString(),
      actionLog: [...(lead.actionLog || []), createAction('task', `Task status updated: ${taskId}`)],
    });
  };

  const deleteTask = async (lead: Lead, taskId: string) => {
    await updateLead({
      id: lead.id,
      tasks: (lead.tasks || []).filter(task => task.id !== taskId),
      actionLog: [...(lead.actionLog || []), createAction('task', `Task deleted: ${taskId}`)],
    });
  };

  const addDeal = async (lead: Lead) => {
    const name = window.prompt('Deal name', `${lead.name} opportunity`);
    if (!name) return;
    const value = Number(window.prompt('Expected value AED', String(lead.budgetMax || 0)) || 0);
    const commission = Number(window.prompt('Expected commission AED', String(Math.round(value * 0.02))) || 0);
    const stage = window.prompt('Deal stage', 'New Opportunity') || 'New Opportunity';
    const deal = {
      id: `deal-${Date.now()}`,
      name,
      dealType: lead.clientType || 'primary',
      expectedValue: value,
      expectedCommission: commission,
      stage,
      probability: stage === 'Closed Won' ? 100 : 50,
      closeDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0],
      notes: '',
    };
    await updateLead({
      id: lead.id,
      deals: [...(lead.deals || []), deal],
      actionLog: [...(lead.actionLog || []), createAction('deal', `Deal created: ${name}`)],
    });
  };

  const updateDealStage = async (lead: Lead, dealId: string, stage: string) => {
    await updateLead({
      id: lead.id,
      status: stage === 'Closed Won' ? 'Closed Won' : stage === 'Closed Lost' ? 'Closed Lost' : lead.status,
      deals: (lead.deals || []).map(deal => deal.id === dealId ? { ...deal, stage, probability: stage === 'Closed Won' ? 100 : deal.probability || 50 } : deal),
      lastActivityDate: new Date().toISOString(),
      actionLog: [...(lead.actionLog || []), createAction('deal', `Deal ${dealId} moved to ${stage}`)],
    });
  };

  const addAttachment = async (lead: Lead) => {
    const name = window.prompt('Document name');
    if (!name) return;
    const fileUrl = window.prompt('Document URL');
    if (!fileUrl) return;
    const attachment = {
      id: `att-${Date.now()}`,
      name,
      fileType: window.prompt('Document type', 'Brochure') || 'Brochure',
      fileUrl,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.name || 'admin',
    };
    await updateLead({
      id: lead.id,
      attachments: [...(lead.attachments || []), attachment],
      actionLog: [...(lead.actionLog || []), createAction('attachment', `Document added: ${name}`)],
    });
  };

  const deleteAttachment = async (lead: Lead, attachmentId: string) => {
    await updateLead({
      id: lead.id,
      attachments: (lead.attachments || []).filter(item => item.id !== attachmentId),
      actionLog: [...(lead.actionLog || []), createAction('attachment', `Document deleted: ${attachmentId}`)],
    });
  };

  const scheduleViewing = async (lead: Lead) => {
    const propertyTitle = window.prompt('Property/project title', lead.projectInterest || '');
    if (!propertyTitle) return;
    const dateTime = window.prompt('Viewing date/time', new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16));
    if (!dateTime) return;
    const viewing = {
      id: `view-${Date.now()}`,
      propertyTitle,
      dateTime,
      status: 'scheduled',
      assignedTo: lead.assignedTo || currentUser?.name || 'admin',
    };
    await updateLead({
      id: lead.id,
      status: lead.status === 'New' || lead.status === 'Contacted' ? 'Viewing Scheduled' : lead.status,
      viewings: [...(lead.viewings || []), viewing],
      lastActivityDate: new Date().toISOString(),
      actionLog: [...(lead.actionLog || []), createAction('viewing', `Viewing scheduled for ${propertyTitle}`)],
    });
  };

  const updateSenderEmail = () => {
    const entered = window.prompt('Sender email for this admin profile:', senderEmail || DEFAULT_SENDER_EMAIL);
    const nextEmail = entered?.trim() || '';
    if (!nextEmail) return;
    if (!isValidEmail(nextEmail)) {
      setError('Enter a valid sender email address.');
      return;
    }

    window.localStorage.setItem(SENDER_EMAIL_STORAGE_KEY, nextEmail);
    setSenderEmail(nextEmail);
  };

  const buildLeadResponse = (lead: Lead) => {
    const project = lead.projectInterest ? ` for ${lead.projectInterest}` : '';
    const areas = lead.preferredLocations?.length ? ` in ${lead.preferredLocations.join(', ')}` : '';
    const budget = lead.budgetMax ? ` Your budget indication of ${formatCurrency(lead.budgetMax)} is noted.` : '';
    return `Hello ${lead.name}, this is Lockwood & Carter Real Estate. Thank you for your Dubai property enquiry${project}${areas}.${budget} A senior advisor will review suitable options and share the next steps shortly.`;
  };

  const openLeadEmail = (lead: Lead) => {
    setEmailDraft({
      leadId: lead.id,
      to: lead.email,
      subject: 'Your Dubai property enquiry | Lockwood & Carter',
      message: buildLeadResponse(lead),
    });
  };

  const sendEmailDraft = async () => {
    if (!emailDraft) return;
    if (!isValidEmail(senderEmail)) {
      setError('A valid sender email is required before sending email.');
      return;
    }

    setEmailLoadingId(emailDraft.leadId);
    setError('');
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailDraft.to,
          senderEmail,
          subject: emailDraft.subject,
          message: emailDraft.message,
        }),
      });
      const data = await readApiJson(response, 'Send email API');
      if (!data.success) throw new Error(data.error || 'Failed to send email');

      const lead = leads.find(item => item.id === emailDraft.leadId);
      if (lead) {
        await updateLead({
          id: lead.id,
          status: lead.status === 'New' ? 'Contacted' : lead.status,
          lastActivityDate: new Date().toISOString(),
          communications: [
            ...(lead.communications || []),
            {
              id: `comm-${Date.now()}`,
              channel: 'email',
              subject: emailDraft.subject,
              detail: emailDraft.message,
              actor: currentUser?.name || 'admin',
              senderEmail,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }
      setEmailDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setEmailLoadingId(null);
    }
  };

  const sendWhatsAppMessage = async (lead: Lead) => {
    const to = lead.whatsappNumber || lead.phone || '';
    if (!to) {
      setError('This lead does not have a WhatsApp or phone number.');
      return;
    }

    setWhatsAppLoadingId(lead.id);
    setError('');
    try {
      const message = buildLeadResponse(lead);
      const response = await fetch('/api/admin/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message }),
      });
      const data = await readApiJson(response, 'WhatsApp API');
      if (!data.success) throw new Error(data.error || 'Failed to send WhatsApp message');

      await updateLead({
        id: lead.id,
        status: lead.status === 'New' ? 'Contacted' : lead.status,
        lastActivityDate: new Date().toISOString(),
        communications: [
          ...(lead.communications || []),
          {
            id: `comm-${Date.now()}`,
            channel: 'whatsapp',
            subject: 'WhatsApp follow-up',
            detail: message,
            actor: currentUser?.name || 'admin',
            senderNumber: DEFAULT_WHATSAPP_BUSINESS_NUMBER,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send WhatsApp message');
    } finally {
      setWhatsAppLoadingId(null);
    }
  };

  const selectedTimeline = useMemo(() => {
    if (!selectedLead) return [];
    return [
      ...(selectedLead.actionLog || []).map(item => ({
        id: item.id,
        timestamp: item.createdAt || item.timestamp || selectedLead.updatedAt || selectedLead.createdAt,
        title: item.type || 'Action',
        detail: item.detail || '',
      })),
      ...(selectedLead.communications || []).map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        title: `${item.channel || 'Communication'}: ${item.subject || 'Follow-up'}`,
        detail: item.detail || '',
      })),
      ...(selectedLead.tasks || []).map(item => ({
        id: item.id,
        timestamp: item.createdAt || item.dueDate,
        title: `Task: ${item.title}`,
        detail: `${item.status || 'pending'} · due ${item.dueDate || 'not set'}`,
      })),
      ...(selectedLead.deals || []).map(item => ({
        id: item.id,
        timestamp: item.createdAt || item.closeDate,
        title: `Deal: ${item.name}`,
        detail: `${item.stage || 'New Opportunity'} · ${formatCurrency(item.expectedValue || item.value)}`,
      })),
      ...(selectedLead.viewings || []).map(item => ({
        id: item.id,
        timestamp: item.dateTime,
        title: `Viewing: ${item.propertyTitle}`,
        detail: item.status || 'scheduled',
      })),
    ].filter(item => item.id).sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }, [selectedLead]);

  const exportLeads = () => downloadCsv('lockwood-carter-crm-leads.csv', filteredLeads.map(lead => ({
    Name: lead.name,
    Email: lead.email,
    Phone: lead.phone || '',
    Status: lead.status,
    Score: lead.leadScore || 0,
    Temperature: lead.temperature || '',
    Source: lead.leadSource || '',
    Budget: formatCurrency(lead.budgetMax),
    Areas: lead.preferredLocations?.join('; ') || '',
    Project: lead.projectInterest || '',
    NextFollowUp: lead.nextFollowUpDate || '',
  })));

  const exportReport = () => downloadCsv('lockwood-carter-crm-report.csv', [
    {
      TotalLeads: analytics.total,
      ActivePipeline: analytics.active,
      Qualified: analytics.qualified,
      HotLeads: analytics.hot,
      Viewings: analytics.viewings,
      Offers: analytics.offers,
      PipelineValue: analytics.pipelineValue,
      ClosedWonValue: analytics.wonValue,
      ConversionRate: `${analytics.conversionRate}%`,
      StaleLeads: analytics.stale,
      Enquiries: analytics.enquiries,
      Duplicates: analytics.duplicates,
      ExportedAt: new Date().toISOString(),
    },
  ]);

  return (
    <div className="h-full overflow-y-auto bg-brand-primary p-6 text-brand-text">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Intelligence</h1>
          <p className="mt-2 max-w-3xl text-sm text-brand-light">
            Manage chat-qualified buyers, website enquiries, duplicate routing, follow-up tasks, and lead-stage movement from the Supabase-backed Node API.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadCRM} className="inline-flex items-center gap-2 rounded-lg border border-brand-accent px-4 py-2 text-sm text-brand-light hover:bg-brand-accent">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button onClick={exportLeads} className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-goldHover">
            <Download size={16} /> Export Leads
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-brand-accent bg-brand-secondary px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-brand-light">
          <Mail className="h-4 w-4 text-brand-gold" />
          <span>Sender email profile:</span>
          <span className="font-semibold text-brand-text">{senderEmail}</span>
        </div>
        <button
          type="button"
          onClick={updateSenderEmail}
          className="w-fit rounded-lg border border-brand-accent px-3 py-1.5 text-xs font-semibold text-brand-light transition-colors hover:bg-brand-accent hover:text-white"
        >
          Change Sender Email
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Leads', analytics.total, Users],
          ['Active Pipeline', analytics.active, CheckCircle2],
          ['Hot Leads', analytics.hot, AlertTriangle],
          ['Chat Qualified', analytics.chatQualified, Mail],
          ['Viewings', analytics.viewings, Calendar],
          ['Offers', analytics.offers, Briefcase],
          ['Pipeline Value', formatCurrency(analytics.pipelineValue), BarChart3],
          ['Stale Leads', analytics.stale, Clock],
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="rounded-xl border border-brand-accent bg-brand-secondary p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-light">{String(label)}</p>
              {typeof Icon !== 'number' && <Icon className="h-5 w-5 text-brand-gold" />}
            </div>
            <p className="mt-3 text-3xl font-bold">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2 border-b border-brand-accent">
        {[
          ['overview', 'Overview'],
          ['leads', 'Leads Registry'],
          ['enquiries', `Enquiries (${analytics.enquiries})`],
          ['duplicates', `Duplicates (${analytics.duplicates})`],
          ['deals', `Deals (${allDeals.length})`],
          ['reports', 'Reports'],
          ['import', 'Import / Create'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === id ? 'border-brand-gold text-white' : 'border-transparent text-brand-light hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-brand-accent bg-brand-secondary p-8 text-brand-light">Loading CRM data...</div>
      ) : null}

      {!loading && activeTab === 'overview' && (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
            <h2 className="mb-4 text-xl font-bold">Pipeline Signals</h2>
            <div className="space-y-4">
              {statuses.map(status => {
                const count = leads.filter(lead => lead.status === status).length;
                const pct = analytics.total ? Math.round((count / analytics.total) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-brand-light">{status}</span>
                      <span>{count} leads</span>
                    </div>
                    <div className="h-2 rounded-full bg-brand-primary">
                      <div className="h-2 rounded-full bg-brand-gold" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
            <h2 className="mb-4 text-xl font-bold">Operational Watchlist</h2>
            <div className="space-y-3">
              {leads
                .filter(lead => (lead.leadScore || 0) >= 70 || lead.availabilityRequested)
                .slice(0, 6)
                .map(lead => (
                  <button key={lead.id} onClick={() => { setSelectedLeadId(lead.id); setActiveTab('leads'); }} className="w-full rounded-lg border border-brand-accent bg-brand-primary/70 p-3 text-left hover:bg-brand-primary">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{lead.name}</p>
                      <span className={`rounded border px-2 py-0.5 text-[10px] uppercase ${tempClass(lead.temperature)}`}>{lead.temperature || 'cold'}</span>
                    </div>
                    <p className="mt-1 text-xs text-brand-light">{lead.projectInterest || lead.preferredLocations?.join(', ') || 'No project captured'} · Score {lead.leadScore || 0}</p>
                  </button>
                ))}
              {!leads.length && <p className="text-sm text-brand-light">No leads in Supabase yet.</p>}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'leads' && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-xl border border-brand-accent bg-brand-secondary">
            <div className="grid gap-3 border-b border-brand-accent p-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-light" />
                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search leads..." className="w-full rounded-lg border border-brand-accent bg-brand-primary py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-gold" />
              </div>
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                <option value="all">All statuses</option>
                {statuses.map(status => <option key={status}>{status}</option>)}
              </select>
              <select value={sourceFilter} onChange={event => setSourceFilter(event.target.value)} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                <option value="all">All sources</option>
                {sources.map(source => <option key={source}>{source}</option>)}
              </select>
              <select value={temperatureFilter} onChange={event => setTemperatureFilter(event.target.value)} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                <option value="all">All temperatures</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
              <select value={ownerFilter} onChange={event => setOwnerFilter(event.target.value)} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                <option value="all">All owners</option>
                {owners.map(owner => <option key={owner}>{owner}</option>)}
              </select>
              <select value={clientTypeFilter} onChange={event => setClientTypeFilter(event.target.value)} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                <option value="all">All client types</option>
                {clientTypes.map(type => <option key={type}>{type}</option>)}
              </select>
              <select value={sortBy} onChange={event => setSortBy(event.target.value as any)} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                <option value="newest">Newest first</option>
                <option value="score">Highest score</option>
                <option value="budget">Highest budget</option>
                <option value="lastActivity">Last activity</option>
              </select>
              <select value={analyticsRange} onChange={event => setAnalyticsRange(event.target.value as any)} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 border-b border-brand-accent p-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2 text-sm text-brand-light">
                <Filter size={16} />
                <span>{filteredLeads.length} shown</span>
                <span>·</span>
                <span>{selectedLeadIds.length} selected</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
                <input value={bulkAssignOwner} onChange={event => setBulkAssignOwner(event.target.value)} placeholder="Bulk owner" className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm outline-none focus:border-brand-gold" />
                <select value={bulkStatus} onChange={event => setBulkStatus(event.target.value)} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                  <option value="">Bulk status</option>
                  {statuses.map(status => <option key={status}>{status}</option>)}
                </select>
                <button onClick={bulkUpdateSelected} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-goldHover">
                  <CheckSquare size={16} /> Apply
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-brand-primary text-xs uppercase tracking-wider text-brand-light">
                  <tr>
                    <th className="p-4">
                      <input type="checkbox" checked={filteredLeads.length > 0 && filteredLeads.every(lead => selectedLeadIds.includes(lead.id))} onChange={toggleAllFiltered} />
                    </th>
                    <th className="p-4">Lead</th>
                    <th className="p-4">Requirement</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-t border-brand-accent align-top">
                      <td className="p-4">
                        <input type="checkbox" checked={selectedLeadIds.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} />
                      </td>
                      <td className="p-4">
                        <button onClick={() => setSelectedLeadId(lead.id)} className="text-left font-semibold hover:text-brand-gold">{lead.name}</button>
                        <p className="mt-1 text-xs text-brand-light">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-brand-light">{lead.phone}</p>}
                      </td>
                      <td className="p-4 text-brand-light">
                        <p>{lead.propertyTypeInterest?.join(', ') || 'Any property'} · {lead.preferredLocations?.join(', ') || 'Area open'}</p>
                        <p className="mt-1">{formatCurrency(lead.budgetMax)} · {lead.purchaseTimeframe || 'Timeline open'}</p>
                        {lead.projectInterest && <p className="mt-1 text-brand-gold">{lead.projectInterest}</p>}
                      </td>
                      <td className="p-4 text-brand-light">{lead.assignedTo || 'admin'}</td>
                      <td className="p-4">
                        <span className={`rounded border px-2 py-1 text-xs font-bold uppercase ${tempClass(lead.temperature)}`}>{lead.leadScore || 0} · {lead.temperature || 'cold'}</span>
                      </td>
                      <td className="p-4">
                        <select value={lead.status} onChange={event => updateLead({ id: lead.id, status: event.target.value })} className={`rounded border px-2 py-1 text-xs ${statusClass(lead.status)} bg-brand-primary`}>
                          {statuses.map(status => <option key={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => addCommunication(lead, 'call')} className="rounded bg-brand-primary p-2 text-brand-light hover:text-white" title="Log call"><Phone size={14} /></button>
                          <button onClick={() => sendWhatsAppMessage(lead)} disabled={whatsAppLoadingId === lead.id} className="rounded bg-brand-primary p-2 text-brand-light hover:text-white disabled:opacity-50" title="Send WhatsApp"><MessageSquare size={14} /></button>
                          <button onClick={() => openLeadEmail(lead)} disabled={emailLoadingId === lead.id} className="rounded bg-brand-primary p-2 text-brand-light hover:text-white disabled:opacity-50" title="Send email"><Mail size={14} /></button>
                          <button onClick={() => addTask(lead)} className="rounded bg-brand-primary p-2 text-brand-light hover:text-white" title="Add task"><Plus size={14} /></button>
                          <button onClick={() => addDeal(lead)} className="rounded bg-brand-primary p-2 text-brand-light hover:text-white" title="Create deal"><Briefcase size={14} /></button>
                          <button onClick={() => scheduleViewing(lead)} className="rounded bg-brand-primary p-2 text-brand-light hover:text-white" title="Schedule viewing"><Calendar size={14} /></button>
                          <button onClick={() => addAttachment(lead)} className="rounded bg-brand-primary p-2 text-brand-light hover:text-white" title="Add attachment"><Paperclip size={14} /></button>
                          <button onClick={() => markDuplicate(lead)} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-100 hover:bg-red-500/20">Duplicate</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
            {selectedLead ? (
              <>
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-brand-light">Selected Lead</p>
                  <h2 className="mt-1 text-2xl font-bold">{selectedLead.name}</h2>
                  <p className="mt-1 text-sm text-brand-light">Score {selectedLead.leadScore || 0} · {selectedLead.status}</p>
                </div>
                <div className="space-y-4 text-sm">
                  <Info label="Email" value={selectedLead.email} />
                  <Info label="Phone" value={selectedLead.phone || 'Not captured'} />
                  <Info label="Preferred contact" value={selectedLead.preferredChannel || 'Email'} />
                  <Info label="Budget" value={formatCurrency(selectedLead.budgetMax)} />
                  <Info label="Financing" value={selectedLead.financingMethod || 'Unknown'} />
                  <Info label="Validation consent" value={selectedLead.validationCallConsent ? 'Accepted' : 'Not captured'} />
                  <Info label="Availability request" value={selectedLead.availabilityRequested ? 'Yes' : 'No'} />
                  <Info label="Notes" value={selectedLead.notes || selectedLead.description || 'No notes'} />
                </div>
                {selectedLead.chatTranscript && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-light">DARIE Transcript</p>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-brand-accent bg-brand-primary p-3 text-xs text-brand-light">{selectedLead.chatTranscript}</pre>
                  </div>
                )}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-light">Tasks</p>
                  <div className="space-y-2">
                    {(selectedLead.tasks || []).slice(0, 4).map(task => (
                      <div key={task.id} className="rounded-lg bg-brand-primary p-3 text-xs">
                        <p className="font-semibold">{task.title}</p>
                        <p className="mt-1 text-brand-light">{task.dueDate} · {task.priority}</p>
                      </div>
                    ))}
                    {!(selectedLead.tasks || []).length && <p className="text-xs text-brand-light">No tasks yet.</p>}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 border-b border-brand-accent">
                  {detailTabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`border-b-2 px-2 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${detailTab === tab ? 'border-brand-gold text-white' : 'border-transparent text-brand-light hover:text-white'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="mt-4 max-h-[420px] overflow-auto pr-1">
                  {detailTab === 'tasks' && (
                    <div className="space-y-2">
                      <button onClick={() => addTask(selectedLead)} className="mb-2 rounded bg-brand-gold px-3 py-1.5 text-xs font-semibold text-white">Add Task</button>
                      {(selectedLead.tasks || []).map(task => (
                        <div key={task.id} className="rounded-lg bg-brand-primary p-3 text-xs">
                          <div className="flex items-start justify-between gap-3">
                            <label className="flex items-start gap-2">
                              <input type="checkbox" checked={task.status === 'completed'} onChange={() => toggleTaskStatus(selectedLead, task.id)} />
                              <span className={task.status === 'completed' ? 'line-through text-brand-light' : 'font-semibold'}>{task.title}</span>
                            </label>
                            <button onClick={() => deleteTask(selectedLead, task.id)} className="text-red-200 hover:text-red-100"><Trash2 size={14} /></button>
                          </div>
                          <p className="mt-1 text-brand-light">{task.dueDate || 'No due date'} · {task.priority || 'medium'} · {task.assignedTo || 'admin'}</p>
                        </div>
                      ))}
                      {!(selectedLead.tasks || []).length && <p className="text-xs text-brand-light">No tasks yet.</p>}
                    </div>
                  )}
                  {detailTab === 'deals' && (
                    <div className="space-y-2">
                      <button onClick={() => addDeal(selectedLead)} className="mb-2 rounded bg-brand-gold px-3 py-1.5 text-xs font-semibold text-white">Create Deal</button>
                      {(selectedLead.deals || []).map(deal => (
                        <div key={deal.id} className="rounded-lg bg-brand-primary p-3 text-xs">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{deal.name}</p>
                              <p className="mt-1 text-brand-light">{formatCurrency(deal.expectedValue || deal.value)} · commission {formatCurrency(deal.expectedCommission)}</p>
                            </div>
                            <select value={deal.stage || 'New Opportunity'} onChange={event => updateDealStage(selectedLead, deal.id, event.target.value)} className="rounded border border-brand-accent bg-brand-secondary px-2 py-1 text-xs">
                              {['New Opportunity', 'Property Matched', 'Viewing Scheduled', 'Viewing Completed', 'Negotiation', 'Offer Submitted', 'Booking Pending', 'Booking Confirmed', 'Closed Won', 'Closed Lost'].map(stage => <option key={stage}>{stage}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                      {!(selectedLead.deals || []).length && <p className="text-xs text-brand-light">No deals yet.</p>}
                    </div>
                  )}
                  {detailTab === 'communications' && (
                    <div className="space-y-2">
                      <div className="mb-2 flex gap-2">
                        <button onClick={() => addCommunication(selectedLead, 'call')} className="rounded bg-brand-primary px-3 py-1.5 text-xs text-brand-light hover:text-white">Log Call</button>
                        <button onClick={() => sendWhatsAppMessage(selectedLead)} disabled={whatsAppLoadingId === selectedLead.id} className="rounded bg-brand-primary px-3 py-1.5 text-xs text-brand-light hover:text-white disabled:opacity-50">WhatsApp</button>
                        <button onClick={() => openLeadEmail(selectedLead)} className="rounded bg-brand-primary px-3 py-1.5 text-xs text-brand-light hover:text-white">Email</button>
                      </div>
                      {(selectedLead.communications || []).map(comm => (
                        <div key={comm.id} className="rounded-lg bg-brand-primary p-3 text-xs">
                          <p className="font-semibold">{comm.channel} · {comm.subject}</p>
                          <p className="mt-1 text-brand-light">{new Date(comm.timestamp || Date.now()).toLocaleString()}</p>
                          {comm.detail && <pre className="mt-2 max-h-32 whitespace-pre-wrap rounded border border-brand-accent p-2 text-brand-light">{comm.detail}</pre>}
                        </div>
                      ))}
                      {selectedLead.chatTranscript && <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-brand-accent bg-brand-primary p-3 text-xs text-brand-light">{selectedLead.chatTranscript}</pre>}
                      {!(selectedLead.communications || []).length && !selectedLead.chatTranscript && <p className="text-xs text-brand-light">No communications yet.</p>}
                    </div>
                  )}
                  {detailTab === 'attachments' && (
                    <div className="space-y-2">
                      <button onClick={() => addAttachment(selectedLead)} className="mb-2 rounded bg-brand-gold px-3 py-1.5 text-xs font-semibold text-white">Add Document</button>
                      {(selectedLead.attachments || []).map(doc => (
                        <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg bg-brand-primary p-3 text-xs">
                          <div>
                            <p className="font-semibold">{doc.name}</p>
                            <p className="text-brand-light">{doc.fileType || 'Document'} · {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:text-white">Open</a>
                            <button onClick={() => deleteAttachment(selectedLead, doc.id)} className="text-red-200 hover:text-red-100"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                      {!(selectedLead.attachments || []).length && <p className="text-xs text-brand-light">No attachments yet.</p>}
                    </div>
                  )}
                  {detailTab === 'viewings' && (
                    <div className="space-y-2">
                      <button onClick={() => scheduleViewing(selectedLead)} className="mb-2 rounded bg-brand-gold px-3 py-1.5 text-xs font-semibold text-white">Schedule Viewing</button>
                      {(selectedLead.viewings || []).map(viewing => (
                        <div key={viewing.id} className="rounded-lg bg-brand-primary p-3 text-xs">
                          <p className="font-semibold">{viewing.propertyTitle}</p>
                          <p className="mt-1 text-brand-light">{new Date(viewing.dateTime).toLocaleString()} · {viewing.status}</p>
                        </div>
                      ))}
                      {!(selectedLead.viewings || []).length && <p className="text-xs text-brand-light">No viewings scheduled.</p>}
                    </div>
                  )}
                  {detailTab === 'timeline' && (
                    <div className="space-y-3 border-l border-brand-accent pl-4">
                      {selectedTimeline.map(item => (
                        <div key={item.id} className="relative text-xs">
                          <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand-gold" />
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-brand-light">{new Date(item.timestamp || Date.now()).toLocaleString()}</p>
                          {item.detail && <p className="mt-1 text-brand-light">{item.detail}</p>}
                        </div>
                      ))}
                      {!selectedTimeline.length && <p className="text-xs text-brand-light">No timeline activity yet.</p>}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-brand-light">Select a lead to view details.</p>
            )}
          </aside>
        </div>
      )}

      {!loading && activeTab === 'enquiries' && (
        <div className="grid gap-4">
          {enquiries.map(enquiry => (
            <div key={enquiry.id} className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-bold">{enquiry.name || `${enquiry.firstName || ''} ${enquiry.lastName || ''}`.trim() || 'Website visitor'}</h3>
                  <p className="mt-1 text-sm text-brand-light">{enquiry.email || 'No email'} · {enquiry.phone || 'No phone'}</p>
                  <p className="mt-2 text-sm text-brand-light">{enquiry.propertyTitle || enquiry.interest || 'General enquiry'} · {enquiry.budget || 'Budget not stated'}</p>
                  {enquiry.message && <p className="mt-3 text-sm text-brand-light">{enquiry.message}</p>}
                </div>
                <button onClick={() => convertEnquiry(enquiry)} disabled={!enquiry.email} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  <CheckCircle2 size={16} /> Convert to Lead
                </button>
              </div>
            </div>
          ))}
          {!enquiries.length && <div className="rounded-xl border border-brand-accent bg-brand-secondary p-8 text-brand-light">No enquiries in Supabase yet.</div>}
        </div>
      )}

      {!loading && activeTab === 'duplicates' && (
        <div className="grid gap-4">
          {duplicates.map(lead => (
            <div key={lead.id} className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
              <h3 className="font-bold">{lead.name}</h3>
              <p className="mt-1 text-sm text-brand-light">{lead.email} · {lead.phone || 'No phone'}</p>
              <p className="mt-2 text-sm text-red-100">{lead.duplicateMeta?.note || 'Duplicate archived.'}</p>
            </div>
          ))}
          {!duplicates.length && <div className="rounded-xl border border-brand-accent bg-brand-secondary p-8 text-brand-light">No duplicate leads archived.</div>}
        </div>
      )}

      {!loading && activeTab === 'deals' && (
        <div className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Deal Pipeline</h2>
              <p className="mt-1 text-sm text-brand-light">Linked opportunities across all CRM leads.</p>
            </div>
            <p className="text-sm text-brand-light">Total pipeline: <span className="font-semibold text-brand-text">{formatCurrency(analytics.pipelineValue)}</span></p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-brand-primary text-xs uppercase tracking-wider text-brand-light">
                <tr>
                  <th className="p-4">Deal</th>
                  <th className="p-4">Lead</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Commission</th>
                </tr>
              </thead>
              <tbody>
                {allDeals.map(deal => {
                  const lead = leads.find(item => item.id === deal.leadId);
                  return (
                    <tr key={deal.id} className="border-t border-brand-accent">
                      <td className="p-4 font-semibold">{deal.name}</td>
                      <td className="p-4 text-brand-light">
                        <button onClick={() => { setSelectedLeadId(deal.leadId); setActiveTab('leads'); setDetailTab('deals'); }} className="hover:text-brand-gold">{deal.leadName}</button>
                      </td>
                      <td className="p-4">
                        {lead ? (
                          <select value={deal.stage || 'New Opportunity'} onChange={event => updateDealStage(lead, deal.id, event.target.value)} className="rounded border border-brand-accent bg-brand-primary px-2 py-1 text-xs">
                            {['New Opportunity', 'Property Matched', 'Viewing Scheduled', 'Viewing Completed', 'Negotiation', 'Offer Submitted', 'Booking Pending', 'Booking Confirmed', 'Closed Won', 'Closed Lost'].map(stage => <option key={stage}>{stage}</option>)}
                          </select>
                        ) : deal.stage}
                      </td>
                      <td className="p-4 text-brand-light">{formatCurrency(deal.expectedValue || deal.value)}</td>
                      <td className="p-4 text-brand-light">{formatCurrency(deal.expectedCommission)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!allDeals.length && <p className="mt-4 text-sm text-brand-light">No deals have been created yet.</p>}
        </div>
      )}

      {!loading && activeTab === 'reports' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
            <h2 className="mb-4 text-xl font-bold">CRM Performance Report</h2>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Filtered leads" value={String(analytics.total)} />
              <Info label="Qualified" value={String(analytics.qualified)} />
              <Info label="Viewings" value={String(analytics.viewings)} />
              <Info label="Offers" value={String(analytics.offers)} />
              <Info label="Conversion rate" value={`${analytics.conversionRate}%`} />
              <Info label="Pipeline value" value={formatCurrency(analytics.pipelineValue)} />
              <Info label="Closed won value" value={formatCurrency(analytics.wonValue)} />
              <Info label="Stale leads" value={String(analytics.stale)} />
            </div>
            <button onClick={exportReport} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-goldHover">
              <Download size={16} /> Export Report CSV
            </button>
          </div>
          <div className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
            <h2 className="mb-4 text-xl font-bold">Source Breakdown</h2>
            <div className="space-y-3">
              {sources.map(source => {
                const count = filteredLeads.filter(lead => (lead.leadSource || 'website') === source).length;
                const pct = analytics.total ? Math.round((count / analytics.total) * 100) : 0;
                return (
                  <div key={source}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-brand-light">{source}</span>
                      <span>{count} · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-brand-primary">
                      <div className="h-2 rounded-full bg-brand-gold" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'import' && (
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
            <h2 className="mb-4 text-xl font-bold">Create Lead</h2>
            <div className="grid gap-3">
              {[
                ['name', 'Name'],
                ['email', 'Email'],
                ['phone', 'Phone'],
                ['propertyTypeInterest', 'Property interest, comma separated'],
                ['preferredLocations', 'Preferred locations, comma separated'],
                ['budgetMax', 'Budget max AED'],
                ['notes', 'Notes'],
              ].map(([key, label]) => (
                <input key={key} value={(leadDraft as any)[key]} onChange={event => setLeadDraft(prev => ({ ...prev, [key]: event.target.value }))} placeholder={label} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm outline-none focus:border-brand-gold" />
              ))}
              <select value={leadDraft.financingMethod} onChange={event => setLeadDraft(prev => ({ ...prev, financingMethod: event.target.value }))} className="rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm">
                <option value="unknown">Financing unknown</option>
                <option value="cash">Cash</option>
                <option value="mortgage">Mortgage</option>
              </select>
              <button onClick={handleCreateLead} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-3 text-sm font-semibold text-white hover:bg-brand-goldHover">
                <Plus size={16} /> Create Lead
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-brand-accent bg-brand-secondary p-5">
            <h2 className="mb-2 text-xl font-bold">Bulk Import</h2>
            <p className="mb-4 text-sm text-brand-light">One row per lead: name,email,phone,interest,budget,area,notes</p>
            <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-brand-accent bg-brand-primary px-4 py-3 text-sm text-brand-light hover:border-brand-gold hover:text-white">
              <Upload size={16} />
              Upload CSV file
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={event => importCsvFile(event.target.files?.[0])} />
            </label>
            <textarea value={bulkText} onChange={event => setBulkText(event.target.value)} rows={12} className="w-full rounded-lg border border-brand-accent bg-brand-primary p-3 text-sm outline-none focus:border-brand-gold" />
            <button onClick={importBulk} className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-3 text-sm font-semibold text-white hover:bg-brand-goldHover">
              <Upload size={16} /> Import Leads
            </button>
          </div>
        </div>
      )}

      {emailDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-brand-accent bg-brand-secondary p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Review email</p>
                <h2 className="mt-1 text-xl font-bold">Send client follow-up</h2>
                <p className="mt-1 text-sm text-brand-light">From profile: {senderEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailDraft(null)}
                className="rounded-lg border border-brand-accent px-3 py-1.5 text-sm text-brand-light hover:bg-brand-accent hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-light">
                To
                <input
                  value={emailDraft.to}
                  onChange={event => setEmailDraft(prev => prev ? { ...prev, to: event.target.value } : prev)}
                  className="mt-1 w-full rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm font-normal normal-case tracking-normal text-brand-text outline-none focus:border-brand-gold"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-light">
                Subject
                <input
                  value={emailDraft.subject}
                  onChange={event => setEmailDraft(prev => prev ? { ...prev, subject: event.target.value } : prev)}
                  className="mt-1 w-full rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm font-normal normal-case tracking-normal text-brand-text outline-none focus:border-brand-gold"
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-light">
                Message
                <textarea
                  value={emailDraft.message}
                  onChange={event => setEmailDraft(prev => prev ? { ...prev, message: event.target.value } : prev)}
                  rows={8}
                  className="mt-1 w-full rounded-lg border border-brand-accent bg-brand-primary px-3 py-2 text-sm font-normal normal-case tracking-normal text-brand-text outline-none focus:border-brand-gold"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEmailDraft(null)}
                className="rounded-lg border border-brand-accent px-4 py-2 text-sm text-brand-light hover:bg-brand-accent hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={sendEmailDraft}
                disabled={emailLoadingId === emailDraft.leadId}
                className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-goldHover disabled:opacity-50"
              >
                {emailLoadingId === emailDraft.leadId ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg border border-brand-accent bg-brand-primary p-3">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-light">{label}</p>
    <p className="mt-1 text-sm">{value}</p>
  </div>
);

export default CRMPage;
