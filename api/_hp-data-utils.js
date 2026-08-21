import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

export const HOUSE_PRICE_DATA_URL =
  process.env.HOUSE_PRICE_DATA_URL ||
  'https://diuorqykbykouqnlxcxe.supabase.co/storage/v1/object/public/house_price/hp_data.xlsx';
export const HP_BUCKET = process.env.HOUSE_PRICE_BUCKET || 'house_price';
export const HP_FILE_PATH = process.env.HOUSE_PRICE_FILE_PATH || 'hp_data.xlsx';

export const DEFAULT_HP_META = {
  periodLabel: 'Q1-Q2 2026',
  description: 'city-level residential apartment data. Values are market averages for comparison only.',
  fileName: HP_FILE_PATH,
  fileUrl: HOUSE_PRICE_DATA_URL,
  fileUpdatedAt: null,
  updatedAt: new Date(0).toISOString(),
};

export const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.end(JSON.stringify(payload));
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export const assertSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase backend is not configured.');
  }
  return supabase;
};

const parseNumericCell = value => {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  const negative = /^\(.*\)$/.test(text) || /^-/.test(text);
  const numeric = Number(text.replace(/[()$,%\s,]|pp/g, '').replace(/^\+/, ''));
  if (Number.isNaN(numeric)) return null;
  return negative ? -Math.abs(numeric) : numeric;
};

const cleanHousePriceRow = row => ({
  rank: parseNumericCell(row[0]),
  city: String(row[1] || '').trim(),
  country: String(row[2] || '').trim(),
  usdPerSqm: parseNumericCell(row[3]),
  usdPerSqft: parseNumericCell(row[4]),
  priceComparisonVsDubai: String(row[5] || '').trim(),
  hpiNominal1Y: parseNumericCell(row[6]),
  hpiNominal1YVsDubaiPp: parseNumericCell(row[7]),
  hpiInflationAdjusted1Y: parseNumericCell(row[8]),
  hpiInflationAdjusted1YVsDubaiPp: parseNumericCell(row[9]),
  hpiNominal5Y: parseNumericCell(row[10]),
  hpiNominal5YVsDubaiPp: parseNumericCell(row[11]),
  hpiInflationAdjusted5Y: parseNumericCell(row[12]),
  hpiInflationAdjusted5YVsDubaiPp: parseNumericCell(row[13]),
  hpiNominal10Y: parseNumericCell(row[14]),
  hpiNominal10YVsDubaiPp: parseNumericCell(row[15]),
  hpiInflationAdjusted10Y: parseNumericCell(row[16]),
  hpiInflationAdjusted10YVsDubaiPp: parseNumericCell(row[17]),
});

const rowToHpMeta = row => {
  const periodLabel = row?.period_label || DEFAULT_HP_META.periodLabel;
  const description = row?.description || DEFAULT_HP_META.description;
  const fileName = row?.file_name || HP_FILE_PATH;
  const fileUrl = row?.file_url || DEFAULT_HP_META.fileUrl;
  const fileUpdatedAt = row?.file_updated_at || DEFAULT_HP_META.fileUpdatedAt;
  const updatedAt = row?.updated_at || DEFAULT_HP_META.updatedAt;

  return {
    periodLabel,
    description,
    updatedAt,
    infoText: `${periodLabel} ${description}`,
    fileName,
    fileUrl,
    fileUpdatedAt,
  };
};

export const readHpDataMeta = async () => {
  if (!supabase) return { ...DEFAULT_HP_META, infoText: `${DEFAULT_HP_META.periodLabel} ${DEFAULT_HP_META.description}` };

  const { data, error } = await supabase
    .from('hp_data_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') {
      return { ...DEFAULT_HP_META, infoText: `${DEFAULT_HP_META.periodLabel} ${DEFAULT_HP_META.description}` };
    }
    throw new Error(error.message);
  }

  return rowToHpMeta(data);
};

export const upsertHpDataMeta = async meta => {
  const db = assertSupabase();
  const now = new Date().toISOString();
  const { data, error } = await db
    .from('hp_data_settings')
    .upsert({
      id: 1,
      period_label: meta.periodLabel,
      description: meta.description,
      file_name: meta.fileName || HP_FILE_PATH,
      file_url: meta.fileUrl || DEFAULT_HP_META.fileUrl,
      file_updated_at: meta.fileUpdatedAt || null,
      updated_at: now,
    }, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return rowToHpMeta(data);
};

export const getHousePriceRows = async () => {
  const meta = await readHpDataMeta();
  const sourceUrl = meta.fileUrl || HOUSE_PRICE_DATA_URL;
  const response = await fetch(sourceUrl, {
    headers: { 'User-Agent': 'lockwood-carter-market-comparison/1.0' },
  });

  if (!response.ok) {
    throw new Error(`House price dataset fetch failed: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames.includes('hpdata') ? 'hpdata' : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false })
    .slice(2)
    .map(cleanHousePriceRow)
    .filter(row => row.city);

  return {
    sourceUrl,
    sourceLastModified: response.headers.get('last-modified') || null,
    sheetName,
    rows,
    meta,
    loadedAt: Date.now(),
  };
};
