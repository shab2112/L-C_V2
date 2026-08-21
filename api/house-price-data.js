import { getHousePriceRows, sendJson } from './_hp-data-utils.js';

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
    sendJson(res, 200, {
      success: true,
      rows: dataset.rows,
      sourceUrl: dataset.sourceUrl,
      sourceLastModified: dataset.sourceLastModified,
      sheetName: dataset.sheetName,
      loadedAt: new Date(dataset.loadedAt).toISOString(),
    });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'House price data request failed',
    });
  }
}
