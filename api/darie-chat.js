const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.end(JSON.stringify(payload));
};

const asArray = value => (Array.isArray(value) ? value : []);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const messages = asArray(body.messages);

    if (!messages.length) {
      sendJson(res, 400, { error: 'Messages are required' });
      return;
    }

    const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
    const model = body.model || process.env.NVIDIA_MODEL || process.env.VITE_NVIDIA_MODEL || 'z-ai/glm-5.2';
    const baseUrl = (process.env.NVIDIA_BASE_URL || process.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');

    if (!apiKey) {
      sendJson(res, 500, { error: 'NVIDIA API key is not configured' });
      return;
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: Math.min(Math.max(Number(body.max_tokens || 2048), 16), 5000),
        stream: false,
      }),
    });

    const text = await response.text();
    let parsed = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { error: text };
    }

    if (!response.ok) {
      sendJson(res, response.status, {
        error: `NVIDIA request failed: ${response.status}`,
        detail: typeof parsed.error === 'string' ? parsed.error : parsed.error?.message || text.slice(0, 300),
      });
      return;
    }

    sendJson(res, 200, {
      text: parsed.choices?.[0]?.message?.content || '',
      model,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'DARIE request failed',
    });
  }
}
