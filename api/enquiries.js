import {
  assertSupabase,
  enquiryRowToEnquiry,
  enquiryToRow,
  getBody,
  sendJson,
} from './_crm-utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    const db = assertSupabase();

    if (req.method === 'GET') {
      const { data, error } = await db.from('enquiries').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      sendJson(res, 200, { success: true, data: (data || []).map(enquiryRowToEnquiry) });
      return;
    }

    if (req.method === 'POST') {
      const body = getBody(req);
      const { data, error } = await db.from('enquiries').upsert(enquiryToRow(body), { onConflict: 'id' }).select('*').single();
      if (error) throw new Error(error.message);
      sendJson(res, 201, { success: true, data: enquiryRowToEnquiry(data) });
      return;
    }

    if (req.method === 'PUT') {
      const body = getBody(req);
      if (!body.id) {
        sendJson(res, 400, { success: false, error: 'Enquiry ID required' });
        return;
      }
      const { data, error } = await db.from('enquiries').upsert(enquiryToRow(body), { onConflict: 'id' }).select('*').single();
      if (error) throw new Error(error.message);
      sendJson(res, 200, { success: true, data: enquiryRowToEnquiry(data) });
      return;
    }

    sendJson(res, 405, { success: false, error: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Enquiries request failed',
    });
  }
}
