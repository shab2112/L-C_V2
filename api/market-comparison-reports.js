import { getHousePriceRows, HOUSE_PRICE_DATA_URL, sendJson } from './_hp-data-utils.js';

const asArray = value => (Array.isArray(value) ? value : value ? [value] : []);

const postNvidia = async payload => {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  const model = payload.model || process.env.NVIDIA_MODEL || process.env.VITE_NVIDIA_MODEL || 'z-ai/glm-5.2';
  const baseUrl = (process.env.NVIDIA_BASE_URL || process.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');

  if (!apiKey) throw new Error('NVIDIA API key is not configured');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: asArray(payload.messages),
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: Math.min(Math.max(Number(payload.max_tokens || 4096), 16), 5000),
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

  if (!response.ok) throw new Error(`NVIDIA request failed: ${response.status} ${text.slice(0, 300)}`);
  return { parsed, model };
};

const selectHousePriceRows = (cities, dataset) => {
  const byCity = new Map(dataset.rows.map(row => [row.city.toLowerCase(), row]));
  const matchedRows = [];
  const unavailableCities = [];

  for (const city of cities) {
    const match = byCity.get(String(city).toLowerCase());
    if (match) matchedRows.push(match);
    else unavailableCities.push(city);
  }

  return { matchedRows, unavailableCities };
};

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const primaryCity = typeof body.primaryCity === 'string' ? body.primaryCity.trim() : '';
    const comparisonCities = asArray(body.comparisonCities).map(city => String(city).trim()).filter(Boolean).slice(0, 8);
    const selectedMetrics = asArray(body.selectedMetrics).map(metric => String(metric).trim()).filter(Boolean).slice(0, 12);

    if (!primaryCity) {
      sendJson(res, 400, { success: false, error: 'Primary city is required.' });
      return;
    }

    if (!selectedMetrics.length) {
      sendJson(res, 400, { success: false, error: 'At least one metric is required.' });
      return;
    }

    const comparedCities = Array.from(new Set([primaryCity, ...comparisonCities]));
    let housePriceData = {
      sourceUrl: HOUSE_PRICE_DATA_URL,
      sourceLastModified: null,
      sheetName: null,
      matchedRows: [],
      unavailableCities: comparedCities,
      loadedAt: null,
      error: null,
    };

    try {
      const dataset = await getHousePriceRows();
      const selected = selectHousePriceRows(comparedCities, dataset);
      housePriceData = {
        sourceUrl: dataset.sourceUrl,
        sourceLastModified: dataset.sourceLastModified,
        sheetName: dataset.sheetName,
        matchedRows: selected.matchedRows,
        unavailableCities: selected.unavailableCities,
        loadedAt: new Date(dataset.loadedAt).toISOString(),
        error: null,
      };
    } catch (error) {
      housePriceData.error = error instanceof Error ? error.message : 'House price dataset unavailable';
    }

    const messages = [
      {
        role: 'system',
        content: [
          'You are the Lockwood & Carter Market Comparison Reports engine.',
          'Create analytical real estate investment comparison reports for advisers and clients.',
          'Use supplied vetted house-price rows as authoritative for house-price and HPI fields.',
          'Do not invent exact live figures where source-grounded confidence is not available.',
          'All comparison data must be presented in markdown tables.',
          'Do not mention the AI model, provider, prompt, tokens, or generation mechanics.',
          'Use clear markdown sections, concise tables, and action-oriented recommendations.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          'Generate a market comparison report.',
          `Primary city: ${primaryCity}`,
          `Comparison cities: ${comparisonCities.length ? comparisonCities.join(', ') : 'None selected'}`,
          `Metrics: ${selectedMetrics.join(', ')}`,
          '',
          'VETTED HOUSE-PRICE DATA SOURCE:',
          `Source: ${housePriceData.sourceUrl}`,
          `Sheet: ${housePriceData.sheetName || 'Unavailable'}`,
          `Source last modified: ${housePriceData.sourceLastModified || 'Not provided by storage'}`,
          `Dataset cache loaded: ${housePriceData.loadedAt || 'Unavailable'}`,
          `Rows available for selected cities: ${housePriceData.matchedRows.map(row => row.city).join(', ') || 'None'}`,
          `Rows unavailable for selected cities: ${housePriceData.unavailableCities.join(', ') || 'None'}`,
          housePriceData.error ? `Dataset warning: ${housePriceData.error}` : '',
          '',
          'VETTED HOUSE-PRICE ROWS JSON:',
          JSON.stringify(housePriceData.matchedRows, null, 2),
          '',
          'Use this structure: executive summary, market snapshot, vetted data supplement, metric-by-metric comparison, scoring matrix, investor suitability, risk matrix, ranked investment view, and client-facing advisory note.',
        ].filter(Boolean).join('\n'),
      },
    ];

    const { parsed, model } = await postNvidia({ messages, max_tokens: 4096 });
    const report = parsed.choices?.[0]?.message?.content || '';

    sendJson(res, 200, {
      success: true,
      report,
      sources: [{ web: { title: 'L&C vetted quarterly house-price dataset', uri: HOUSE_PRICE_DATA_URL } }],
      tokenCount: Number(parsed.usage?.total_tokens || 0),
      cost: 0,
      model,
      primaryCity,
      comparisonCities,
      metrics: selectedMetrics,
      generatedAt: new Date().toISOString(),
      housePriceData,
    });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Market comparison report request failed',
    });
  }
}
