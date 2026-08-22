const RESEND_URL = 'https://api.resend.com/emails';

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.end(JSON.stringify(payload));
};

const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const configuredFrom = process.env.EMAIL_FROM;

    if (!apiKey || !configuredFrom) {
      sendJson(res, 503, {
        success: false,
        error: 'Email provider is not configured. Set RESEND_API_KEY and EMAIL_FROM in Vercel environment variables.',
      });
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
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
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Email send request failed',
    });
  }
}
