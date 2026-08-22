import {
  asArray,
  calculateLeadScore,
  createAction,
  deleteLead,
  findDuplicateLead,
  getBody,
  readDuplicateLeads,
  readLeads,
  sendJson,
  toLead,
  upsertDuplicateLeads,
  upsertLeads,
} from './_crm-utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    const url = new URL(req.url || '/api/leads', 'https://lockwoodandcarter.com');

    if (req.method === 'GET') {
      const leads = url.searchParams.get('type') === 'duplicates' ? await readDuplicateLeads() : await readLeads();
      sendJson(res, 200, { success: true, data: leads });
      return;
    }

    if (req.method === 'POST') {
      const body = getBody(req);
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
      const body = getBody(req);
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
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Leads request failed',
    });
  }
}
