import * as XLSX from 'xlsx';
import {
  assertSupabase,
  DEFAULT_HP_META,
  HP_BUCKET,
  HP_FILE_PATH,
  readHpDataMeta,
  sendJson,
  upsertHpDataMeta,
} from '../_hp-data-utils.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (req.method === 'GET') {
      const meta = await readHpDataMeta();
      sendJson(res, 200, { success: true, data: meta });
      return;
    }

    if (req.method === 'PUT') {
      const periodLabel = String(req.body?.periodLabel || '').trim();
      const description = String(req.body?.description || '').trim();

      if (!periodLabel || !description) {
        sendJson(res, 400, { success: false, error: 'Period label and description are required' });
        return;
      }

      const current = await readHpDataMeta();
      const meta = await upsertHpDataMeta({
        periodLabel,
        description,
        fileName: current.fileName || HP_FILE_PATH,
        fileUrl: current.fileUrl || DEFAULT_HP_META.fileUrl,
        fileUpdatedAt: current.fileUpdatedAt,
      });

      sendJson(res, 200, { success: true, data: meta });
      return;
    }

    if (req.method === 'POST') {
      const fileName = String(req.body?.fileName || '').trim();
      const contentBase64 = String(req.body?.contentBase64 || '').trim();

      if (!fileName.toLowerCase().endsWith('.xlsx')) {
        sendJson(res, 400, { success: false, error: 'Please upload an .xlsx file' });
        return;
      }

      if (!contentBase64) {
        sendJson(res, 400, { success: false, error: 'Excel file content is required' });
        return;
      }

      const bytes = Buffer.from(contentBase64, 'base64');
      if (!bytes.length) {
        sendJson(res, 400, { success: false, error: 'Excel file content is empty' });
        return;
      }

      try {
        const workbook = XLSX.read(bytes, { type: 'buffer' });
        if (!workbook.SheetNames.length) throw new Error('Workbook has no sheets');
      } catch {
        sendJson(res, 400, { success: false, error: 'Uploaded file could not be read as a valid .xlsx workbook' });
        return;
      }

      const db = assertSupabase();
      const { error: uploadError } = await db.storage
        .from(HP_BUCKET)
        .upload(HP_FILE_PATH, bytes, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          upsert: true,
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = db.storage
        .from(HP_BUCKET)
        .getPublicUrl(HP_FILE_PATH);

      const current = await readHpDataMeta();
      const meta = await upsertHpDataMeta({
        periodLabel: current.periodLabel,
        description: current.description,
        fileName: HP_FILE_PATH,
        fileUrl: publicUrlData.publicUrl || current.fileUrl || DEFAULT_HP_META.fileUrl,
        fileUpdatedAt: new Date().toISOString(),
      });

      sendJson(res, 200, { success: true, data: meta });
      return;
    }

    sendJson(res, 405, { success: false, error: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'HP data request failed',
    });
  }
}
