import { getHousePriceRows, sendJson } from '../_hp-data-utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const dataset = await getHousePriceRows();
    const cities = [...new Set(dataset.rows.map(row => row.city).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    sendJson(res, 200, {
      success: true,
      cities,
      sourceUrl: dataset.sourceUrl,
      sourceLastModified: dataset.sourceLastModified,
      sheetName: dataset.sheetName,
      loadedAt: new Date(dataset.loadedAt).toISOString(),
    });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Market comparison cities request failed',
    });
  }
}
