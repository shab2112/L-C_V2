import { createServer } from 'http';
import https from 'https';
import { readFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const RESEND_URL = 'https://api.resend.com/emails';
const HOUSE_PRICE_DATA_URL = process.env.HOUSE_PRICE_DATA_URL || 'https://diuorqykbykouqnlxcxe.supabase.co/storage/v1/object/public/house_price/hp_data.xlsx';
const HP_BUCKET = process.env.HOUSE_PRICE_BUCKET || 'house_price';
const HP_FILE_PATH = process.env.HOUSE_PRICE_FILE_PATH || 'hp_data.xlsx';
const DEFAULT_HP_META = {
  periodLabel: 'Q1-Q2 2026',
  description: 'city-level residential apartment data. Values are market averages for comparison only.',
  fileName: HP_FILE_PATH,
  fileUrl: HOUSE_PRICE_DATA_URL,
  fileUpdatedAt: null,
  updatedAt: new Date(0).toISOString(),
};

const OFFICIAL_REAL_ESTATE_SOURCES = {
  Amsterdam: [
    { name: 'Kadaster Netherlands property register', url: 'https://www.kadaster.nl/', use: 'registered property transactions and ownership data' },
    { name: 'Statistics Netherlands (CBS)', url: 'https://www.cbs.nl/', use: 'official housing and price statistics' },
  ],
  Andorra: [
    { name: 'Govern d\'Andorra Department of Statistics', url: 'https://www.estadistica.ad/', use: 'official national housing and construction statistics' },
  ],
  Athens: [
    { name: 'Bank of Greece residential property price indices', url: 'https://www.bankofgreece.gr/', use: 'official residential property price indices' },
    { name: 'Hellenic Statistical Authority (ELSTAT)', url: 'https://www.statistics.gr/', use: 'official construction, housing and macroeconomic statistics' },
  ],
  Bangkok: [
    { name: 'Bank of Thailand property indicators', url: 'https://www.bot.or.th/', use: 'official property and macro-financial indicators' },
    { name: 'Real Estate Information Center, Government Housing Bank', url: 'https://www.reic.or.th/', use: 'official Thai housing-market information' },
  ],
  Beijing: [
    { name: 'National Bureau of Statistics of China', url: 'https://www.stats.gov.cn/', use: 'official housing price indices for major cities' },
  ],
  Belgrade: [
    { name: 'Republic Geodetic Authority of Serbia', url: 'https://www.rgz.gov.rs/', use: 'official real estate register and market reports' },
  ],
  Berlin: [
    { name: 'Destatis Germany house price statistics', url: 'https://www.destatis.de/', use: 'official German house price index' },
    { name: 'Berlin Committee of Valuation Experts', url: 'https://www.berlin.de/gutachterausschuss/', use: 'official Berlin land and property market reports' },
  ],
  Bratislava: [
    { name: 'National Bank of Slovakia residential property prices', url: 'https://www.nbs.sk/', use: 'official Slovak residential property price statistics' },
    { name: 'Statistical Office of the Slovak Republic', url: 'https://slovak.statistics.sk/', use: 'official demographic and construction statistics' },
  ],
  Brussels: [
    { name: 'Statbel Belgium property prices', url: 'https://statbel.fgov.be/', use: 'official Belgian property price statistics' },
  ],
  Budapest: [
    { name: 'Hungarian Central Statistical Office', url: 'https://www.ksh.hu/', use: 'official housing price and housing-market statistics' },
    { name: 'Magyar Nemzeti Bank house price index', url: 'https://www.mnb.hu/', use: 'official Hungarian house price index' },
  ],
  Copenhagen: [
    { name: 'Statistics Denmark property sales', url: 'https://www.dst.dk/', use: 'official property sales and price statistics' },
  ],
  Doha: [
    { name: 'Qatar Ministry of Justice real estate registration', url: 'https://www.moj.gov.qa/', use: 'official real estate transaction and registration data' },
    { name: 'Planning and Statistics Authority Qatar', url: 'https://www.psa.gov.qa/', use: 'official economic and population statistics' },
  ],
  Dubai: [
    { name: 'Dubai Land Department real estate transactions', url: 'https://dubailand.gov.ae/en/eservices/real-estate-transaction/', use: 'official DLD transaction data' },
    { name: 'Dubai Pulse DLD transactions open data', url: 'https://www.dubaipulse.gov.ae/data/dld-transactions/dld_transactions-open', use: 'official DLD open transaction dataset' },
  ],
  Dublin: [
    { name: 'Central Statistics Office Ireland residential property price index', url: 'https://www.cso.ie/', use: 'official residential property price index' },
    { name: 'Property Services Regulatory Authority Property Price Register', url: 'https://www.propertypriceregister.ie/', use: 'official property sale-price register' },
  ],
  Helsinki: [
    { name: 'Statistics Finland dwelling prices', url: 'https://stat.fi/', use: 'official dwelling price statistics' },
  ],
  'Hong Kong': [
    { name: 'Rating and Valuation Department Hong Kong property market statistics', url: 'https://www.rvd.gov.hk/', use: 'official private domestic price and rent indices' },
  ],
  Lisbon: [
    { name: 'Statistics Portugal (INE) house price index', url: 'https://www.ine.pt/', use: 'official Portuguese house price index and housing statistics' },
  ],
  Ljubljana: [
    { name: 'Surveying and Mapping Authority of Slovenia', url: 'https://www.gov.si/en/state-authorities/bodies-within-ministries/surveying-and-mapping-authority/', use: 'official real estate market and transaction data' },
    { name: 'Statistical Office of the Republic of Slovenia', url: 'https://www.stat.si/', use: 'official housing and price statistics' },
  ],
  London: [
    { name: 'UK House Price Index, HM Land Registry', url: 'https://www.gov.uk/government/collections/uk-house-price-index-reports', use: 'official UK HPI reports and data downloads' },
  ],
  'Luxembourg City': [
    { name: 'STATEC Luxembourg housing statistics', url: 'https://statistiques.public.lu/', use: 'official Luxembourg housing statistics' },
    { name: 'Observatoire de l\'Habitat Luxembourg', url: 'https://logement.public.lu/', use: 'official housing observatory market data' },
  ],
  Macau: [
    { name: 'Statistics and Census Service Macau', url: 'https://www.dsec.gov.mo/', use: 'official residential transaction and price statistics' },
  ],
  Madrid: [
    { name: 'INE Spain house price index', url: 'https://www.ine.es/', use: 'official Spanish house price index' },
    { name: 'MITMA housing statistics Spain', url: 'https://www.mitma.gob.es/', use: 'official appraisal and housing-market statistics' },
  ],
  Manila: [
    { name: 'Bangko Sentral ng Pilipinas residential real estate price index', url: 'https://www.bsp.gov.ph/', use: 'official residential real estate price index' },
    { name: 'Philippine Statistics Authority', url: 'https://psa.gov.ph/', use: 'official national statistics' },
  ],
  Milan: [
    { name: 'Agenzia delle Entrate OMI property market observatory', url: 'https://www.agenziaentrate.gov.it/', use: 'official Italian property market quotations and transactions' },
    { name: 'ISTAT housing prices', url: 'https://www.istat.it/', use: 'official Italian house price index' },
  ],
  Montevideo: [
    { name: 'Instituto Nacional de Estadistica Uruguay', url: 'https://www.ine.gub.uy/', use: 'official national housing and price statistics' },
    { name: 'Direccion Nacional de Catastro Uruguay', url: 'https://www.gub.uy/direccion-nacional-catastro/', use: 'official cadastral and property records' },
  ],
  Moscow: [
    { name: 'Rosreestr Russian real estate register', url: 'https://rosreestr.gov.ru/', use: 'official property registration and cadastral information' },
    { name: 'Rosstat housing statistics', url: 'https://rosstat.gov.ru/', use: 'official Russian housing and price statistics' },
  ],
  Mumbai: [
    { name: 'Reserve Bank of India House Price Index', url: 'https://www.rbi.org.in/', use: 'official Indian house price index' },
    { name: 'National Housing Bank RESIDEX', url: 'https://nhb.org.in/', use: 'official Indian residential price index' },
  ],
  'New York': [
    { name: 'New York City Department of Finance rolling sales data', url: 'https://www.nyc.gov/site/finance/property/property-rolling-sales-data.page', use: 'official NYC property sales data' },
    { name: 'Federal Housing Finance Agency House Price Index', url: 'https://www.fhfa.gov/data/hpi', use: 'official US house price index' },
  ],
  Oslo: [
    { name: 'Statistics Norway housing prices', url: 'https://www.ssb.no/', use: 'official Norwegian house price statistics' },
    { name: 'Kartverket land register', url: 'https://www.kartverket.no/', use: 'official Norwegian land and property register' },
  ],
  Paris: [
    { name: 'INSEE housing price indices', url: 'https://www.insee.fr/', use: 'official French housing price indices' },
    { name: 'Notaires de France property statistics', url: 'https://www.notaires.fr/', use: 'official notarial property transaction statistics' },
  ],
  Prague: [
    { name: 'Czech Statistical Office house price statistics', url: 'https://www.czso.cz/', use: 'official Czech house price statistics' },
    { name: 'Czech National Bank residential property prices', url: 'https://www.cnb.cz/', use: 'official residential property price indicators' },
  ],
  'Puerto Rico': [
    { name: 'Federal Housing Finance Agency House Price Index', url: 'https://www.fhfa.gov/data/hpi', use: 'official US house price index including Puerto Rico series where available' },
    { name: 'Puerto Rico Planning Board', url: 'https://jp.pr.gov/', use: 'official Puerto Rico planning and economic data' },
  ],
  Reykjavik: [
    { name: 'Registers Iceland property register', url: 'https://www.skra.is/', use: 'official Iceland property transaction and register data' },
    { name: 'Statistics Iceland housing prices', url: 'https://www.statice.is/', use: 'official Iceland housing price statistics' },
  ],
  Riga: [
    { name: 'Central Statistical Bureau of Latvia', url: 'https://stat.gov.lv/', use: 'official Latvian housing and price statistics' },
    { name: 'State Land Service Latvia', url: 'https://www.vzd.gov.lv/', use: 'official cadastral and real estate market data' },
  ],
  Seoul: [
    { name: 'Korea Real Estate Board', url: 'https://www.reb.or.kr/', use: 'official Korean real estate price and transaction statistics' },
    { name: 'Bank of Korea economic statistics', url: 'https://www.bok.or.kr/', use: 'official macroeconomic and financial statistics' },
  ],
  Singapore: [
    { name: 'Urban Redevelopment Authority property data', url: 'https://www.ura.gov.sg/property-data/', use: 'official private residential price, rental, vacancy, supply and stock data' },
    { name: 'data.gov.sg URA private residential property price index', url: 'https://data.gov.sg/', use: 'official Singapore open-data copy of URA residential price indices' },
  ],
  Stockholm: [
    { name: 'Statistics Sweden real estate prices', url: 'https://www.scb.se/', use: 'official Swedish real estate price statistics' },
    { name: 'Lantmateriet property register', url: 'https://www.lantmateriet.se/', use: 'official Swedish land and property register' },
  ],
  'Taipei City': [
    { name: 'Taiwan Ministry of the Interior real estate transaction prices', url: 'https://lvr.land.moi.gov.tw/', use: 'official actual-price registration data' },
    { name: 'Taipei City Department of Land Administration', url: 'https://land.gov.taipei/', use: 'official Taipei land and real estate data' },
  ],
  Tallinn: [
    { name: 'Estonian Land Board transaction database', url: 'https://www.maaamet.ee/', use: 'official Estonian land and transaction data' },
    { name: 'Statistics Estonia housing statistics', url: 'https://www.stat.ee/', use: 'official housing and price statistics' },
  ],
  Tokyo: [
    { name: 'MLIT Japan real estate price index', url: 'https://www.mlit.go.jp/', use: 'official Japanese real estate price index' },
  ],
  Toronto: [
    { name: 'Statistics Canada new housing price index', url: 'https://www.statcan.gc.ca/', use: 'official Canadian housing price statistics' },
    { name: 'Canada Mortgage and Housing Corporation', url: 'https://www.cmhc-schl.gc.ca/', use: 'official housing-market and supply data' },
  ],
  Vienna: [
    { name: 'Statistics Austria house price index', url: 'https://www.statistik.at/', use: 'official Austrian house price index' },
  ],
  Vilnius: [
    { name: 'State Enterprise Centre of Registers Lithuania', url: 'https://www.registrucentras.lt/', use: 'official Lithuanian real estate transaction and register data' },
    { name: 'Statistics Lithuania', url: 'https://osp.stat.gov.lt/', use: 'official housing and price statistics' },
  ],
  Warsaw: [
    { name: 'Narodowy Bank Polski residential real estate prices', url: 'https://www.nbp.pl/', use: 'official Polish residential real estate price database' },
    { name: 'Statistics Poland', url: 'https://stat.gov.pl/', use: 'official housing and construction statistics' },
  ],
  Zagreb: [
    { name: 'Croatian Bureau of Statistics', url: 'https://dzs.gov.hr/', use: 'official Croatian housing and price statistics' },
    { name: 'eNekretnine Croatia', url: 'https://nekretnine.mgipu.hr/', use: 'official Croatian real estate transaction system' },
  ],
  Zurich: [
    { name: 'Swiss Federal Statistical Office residential property price index', url: 'https://www.bfs.admin.ch/', use: 'official Swiss residential property price index' },
    { name: 'Statistical Office of the Canton of Zurich', url: 'https://www.zh.ch/', use: 'official Zurich cantonal statistics' },
  ],
};

const OFFICIAL_FALLBACK_SOURCES = [
  { name: 'BIS residential property price statistics', url: 'https://www.bis.org/statistics/pp.htm', use: 'official international residential property price statistics fallback' },
  { name: 'OECD analytical house price indicators', url: 'https://www.oecd.org/en/data/indicators/housing-prices.html', use: 'official cross-country housing price indicator fallback' },
  { name: 'Eurostat housing price statistics', url: 'https://ec.europa.eu/eurostat/web/housing-price-statistics/information-data', use: 'official European house price and sales fallback where applicable' },
];

function loadDotEnv() {
  if (!existsSync('.env')) return;

  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+?)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

const PORT = Number(process.env.PORT || 3001);
const WHATSAPP_GRAPH_API_BASE = process.env.WHATSAPP_GRAPH_API_BASE || 'https://graph.facebook.com/v23.0';
const WHATSAPP_BUSINESS_NUMBER = normalizePhone(process.env.WHATSAPP_BUSINESS_NUMBER || '971585871869').replace(/^\+/, '');
let housePriceCache = null;

const allowInsecureNodeTls = (process.env.NODE_ALLOW_INSECURE_TLS || 'true').toLowerCase() !== 'false';

if (allowInsecureNodeTls) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.warn('[crm-api] NODE TLS certificate verification is disabled for local development. Set NODE_ALLOW_INSECURE_TLS=false after fixing the local certificate chain.');
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[crm-api] Missing Supabase URL/key. CRM routes will return configuration errors.');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25_000_000) req.destroy(new Error('Request body too large'));
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function assertSupabase() {
  if (!supabase) {
    throw new Error('Supabase backend is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.');
  }
  return supabase;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function asArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function formatUuid(value) {
  const raw = String(value || '').trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)
    ? raw
    : null;
}

function calculateLeadScore(input) {
  let score = 0;
  if (input.email && String(input.email).includes('@')) score += 15;
  if (input.phone && String(input.phone).trim().length > 5) score += 20;
  if (input.budgetMin || input.budgetMax || input.budget) score += 15;
  if (asArray(input.propertyTypeInterest).length || input.propertyType) score += 10;
  if (asArray(input.preferredLocations).length || input.area) score += 10;
  if (input.financingMethod && input.financingMethod !== 'unknown') score += 15;
  if (input.mortgagePreApproval) score += 15;
  if (input.availabilityRequested || input.validationCallConsent) score += 10;
  return Math.min(score, 100);
}

function parseBudget(value) {
  if (typeof value === 'number') return value;
  const text = String(value || '').toLowerCase();
  const range = text.match(/(\d+(?:\.\d+)?)\s*(?:m|million)?\s*[-to]+\s*(\d+(?:\.\d+)?)\s*(m|million)?/);
  if (range) {
    return Number(range[2]) * (range[3] ? 1_000_000 : 1);
  }
  const match = text.match(/(\d+(?:\.\d+)?)\s*(m|million|k|thousand)?/);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2] || '';
  if (unit.startsWith('m')) return amount * 1_000_000;
  if (unit.startsWith('k') || unit.startsWith('thousand')) return amount * 1_000;
  return amount;
}

function parseNumericCell(value) {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value).trim();
  const negative = /^\(.*\)$/.test(text) || /^-/.test(text);
  const numeric = Number(text.replace(/[()$,%\s,]|pp/g, '').replace(/^\+/, ''));
  if (Number.isNaN(numeric)) return null;
  return negative ? -Math.abs(numeric) : numeric;
}

function cleanHousePriceRow(row) {
  return {
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
  };
}

function rowToHpMeta(row) {
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
}

async function readHpDataMeta() {
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
}

async function upsertHpDataMeta(meta) {
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
}

async function getHousePriceRows() {
  const now = Date.now();
  if (housePriceCache && now - housePriceCache.loadedAt < 15 * 60 * 1000) {
    return housePriceCache;
  }

  const meta = await readHpDataMeta();
  const sourceUrl = meta.fileUrl || HOUSE_PRICE_DATA_URL;
  const response = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'lockwood-carter-market-comparison/1.0',
    },
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

  housePriceCache = {
    loadedAt: now,
    sourceUrl,
    sourceLastModified: response.headers.get('last-modified') || null,
    sheetName,
    rows,
    meta,
  };

  return housePriceCache;
}

function selectHousePriceRows(cities, dataset) {
  const byCity = new Map(dataset.rows.map(row => [row.city.toLowerCase(), row]));
  const matchedRows = [];
  const unavailableCities = [];

  for (const city of cities) {
    const match = byCity.get(String(city).toLowerCase());
    if (match) {
      matchedRows.push(match);
    } else {
      unavailableCities.push(city);
    }
  }

  return { matchedRows, unavailableCities };
}

function getOfficialRealEstateSources(cities) {
  return cities.map(city => ({
    city,
    primarySources: OFFICIAL_REAL_ESTATE_SOURCES[city] || [],
    fallbackSources: OFFICIAL_FALLBACK_SOURCES,
    coverageNote: OFFICIAL_REAL_ESTATE_SOURCES[city]
      ? 'Use primary sources first. Use fallback official institutional sources only when city-specific official data does not cover the metric.'
      : 'No city-specific official source is configured. Use fallback official institutional sources and mark city-specific adviser verification as required.',
  }));
}

async function handleMarketComparisonReportCities(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

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
}

async function handleHousePriceData(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  const dataset = await getHousePriceRows();
  sendJson(res, 200, {
    success: true,
    rows: dataset.rows,
    sourceUrl: dataset.sourceUrl,
    sourceLastModified: dataset.sourceLastModified,
    sheetName: dataset.sheetName,
    loadedAt: new Date(dataset.loadedAt).toISOString(),
  });
}

async function handleAdminHpData(req, res) {
  if (req.method === 'GET') {
    const meta = await readHpDataMeta();
    sendJson(res, 200, { success: true, data: meta });
    return;
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    const periodLabel = String(body.periodLabel || '').trim();
    const description = String(body.description || '').trim();

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
    const body = await readBody(req);
    const fileName = String(body.fileName || '').trim();
    const contentBase64 = String(body.contentBase64 || '').trim();

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

    housePriceCache = null;
    sendJson(res, 200, { success: true, data: meta });
    return;
  }

  sendJson(res, 405, { success: false, error: 'Method not allowed' });
}

function createAction(type, detail, actor = 'admin') {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    actor,
    detail,
    createdAt: new Date().toISOString(),
  };
}

function createInitialTask(score, assignedTo) {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: 'Initial contact and property matching',
    type: 'Call follow-up',
    priority: score > 70 ? 'high' : 'medium',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo,
    status: 'pending',
    notes: 'Auto-created: complete profile, pre-qualify budget, and shortlist properties.',
  };
}

function leadRowToLead(row) {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  return {
    ...payload,
    id: row.id,
    sourceSubmissionId: row.source_submission_id || payload.sourceSubmissionId,
    name: row.name || payload.name || 'Unnamed Lead',
    firstName: row.first_name || payload.firstName || '',
    lastName: row.last_name || payload.lastName || '',
    email: row.email || payload.email || '',
    phone: row.phone || payload.phone || '',
    alternatePhone: row.alternate_phone || payload.alternatePhone || '',
    whatsappNumber: row.whatsapp_number || payload.whatsappNumber || '',
    preferredChannel: row.preferred_channel || payload.preferredChannel || 'email',
    preferredLanguage: row.preferred_language || payload.preferredLanguage || 'English',
    preferredContactTime: row.preferred_contact_time || payload.preferredContactTime || 'Anytime',
    nationality: row.nationality || payload.nationality || '',
    country: row.country || payload.country || '',
    city: row.city || payload.city || '',
    residenceStatus: row.residence_status || payload.residenceStatus || 'Non-Resident',
    clientType: row.client_type || payload.clientType || 'buyer',
    propertyTypeInterest: Array.isArray(row.property_type_interest) ? row.property_type_interest : asArray(payload.propertyTypeInterest),
    preferredLocations: Array.isArray(row.preferred_locations) ? row.preferred_locations : asArray(payload.preferredLocations),
    bedroomsPreference: Array.isArray(row.bedrooms_preference) ? row.bedrooms_preference : asArray(payload.bedroomsPreference),
    budgetMin: Number(row.budget_min || payload.budgetMin || 0),
    budgetMax: Number(row.budget_max || payload.budgetMax || 0),
    financingMethod: row.financing_method || payload.financingMethod || 'unknown',
    mortgagePreApproval: Boolean(row.mortgage_pre_approval || payload.mortgagePreApproval),
    purchaseTimeframe: row.purchase_timeframe || payload.purchaseTimeframe || '3 months',
    leadSource: row.lead_source || payload.leadSource || 'website',
    sourceCampaign: row.source_campaign || payload.sourceCampaign || '',
    leadScore: Number(row.lead_score || payload.leadScore || 0),
    temperature: row.temperature || payload.temperature || 'cold',
    status: row.status || payload.status || 'New',
    assignedTo: row.assigned_to || payload.assignedTo || 'admin',
    lastActivityDate: row.last_activity_date || payload.lastActivityDate || row.updated_at,
    nextFollowUpDate: row.next_follow_up_date || payload.nextFollowUpDate || '',
    createdAt: row.created_at || payload.createdAt,
    updatedAt: row.updated_at || payload.updatedAt,
    notes: row.notes || payload.notes || '',
    description: row.description || payload.description || '',
    actionLog: Array.isArray(row.action_log) ? row.action_log : asArray(payload.actionLog),
    propertyInterests: Array.isArray(row.property_interests) ? row.property_interests : asArray(payload.propertyInterests),
    opportunities: Array.isArray(row.opportunities) ? row.opportunities : asArray(payload.opportunities),
    tasks: Array.isArray(row.tasks) ? row.tasks : asArray(payload.tasks),
    deals: Array.isArray(row.deals) ? row.deals : asArray(payload.deals),
    communications: Array.isArray(row.communications) ? row.communications : asArray(payload.communications),
    attachments: Array.isArray(row.attachments) ? row.attachments : asArray(payload.attachments),
    viewings: Array.isArray(row.viewings) ? row.viewings : asArray(payload.viewings),
    offers: Array.isArray(row.offers) ? row.offers : asArray(payload.offers),
    statusHistory: Array.isArray(row.status_history) ? row.status_history : asArray(payload.statusHistory),
    chatProfile: row.chat_profile || payload.chatProfile || null,
    chatTranscript: row.chat_transcript || payload.chatTranscript || '',
    tracking: row.tracking || payload.tracking || null,
    validationCallConsent: Boolean(row.validation_call_consent || payload.validationCallConsent),
    validationCallConsentAt: row.validation_call_consent_at || payload.validationCallConsentAt || '',
    availabilityRequested: Boolean(row.availability_requested || payload.availabilityRequested),
    projectInterest: row.project_interest || payload.projectInterest || payload.chatProfile?.projectInterest || '',
    newsletterSubscribed: Boolean(row.newsletter_subscribed || payload.newsletterSubscribed),
    newsletterSubscribedAt: row.newsletter_subscribed_at || payload.newsletterSubscribedAt || '',
    lostReason: row.lost_reason || payload.lostReason || '',
    winDetails: row.win_details || payload.winDetails || null,
  };
}

function leadToRow(lead) {
  return {
    id: lead.id,
    source_submission_id: formatUuid(lead.sourceSubmissionId),
    name: lead.name,
    first_name: lead.firstName || null,
    last_name: lead.lastName || null,
    email: lead.email,
    phone: lead.phone || null,
    alternate_phone: lead.alternatePhone || null,
    whatsapp_number: lead.whatsappNumber || null,
    preferred_channel: lead.preferredChannel || null,
    preferred_language: lead.preferredLanguage || null,
    preferred_contact_time: lead.preferredContactTime || null,
    nationality: lead.nationality || null,
    country: lead.country || null,
    city: lead.city || null,
    residence_status: lead.residenceStatus || null,
    client_type: lead.clientType || null,
    property_type_interest: asArray(lead.propertyTypeInterest),
    preferred_locations: asArray(lead.preferredLocations),
    bedrooms_preference: asArray(lead.bedroomsPreference),
    budget_min: Number(lead.budgetMin || 0),
    budget_max: Number(lead.budgetMax || 0),
    financing_method: lead.financingMethod || null,
    mortgage_pre_approval: Boolean(lead.mortgagePreApproval),
    purchase_timeframe: lead.purchaseTimeframe || null,
    lead_source: lead.leadSource || 'website',
    source_campaign: lead.sourceCampaign || null,
    lead_score: Number(lead.leadScore || 0),
    temperature: lead.temperature || null,
    status: lead.status || 'New',
    assigned_to: lead.assignedTo || null,
    last_activity_date: lead.lastActivityDate || null,
    next_follow_up_date: lead.nextFollowUpDate || null,
    notes: lead.notes || null,
    description: lead.description || null,
    action_log: asArray(lead.actionLog),
    property_interests: asArray(lead.propertyInterests),
    opportunities: asArray(lead.opportunities),
    tasks: asArray(lead.tasks),
    deals: asArray(lead.deals),
    communications: asArray(lead.communications),
    attachments: asArray(lead.attachments),
    viewings: asArray(lead.viewings),
    offers: asArray(lead.offers),
    status_history: asArray(lead.statusHistory),
    chat_profile: lead.chatProfile || null,
    chat_transcript: lead.chatTranscript || null,
    tracking: lead.tracking || null,
    validation_call_consent: Boolean(lead.validationCallConsent),
    validation_call_consent_at: lead.validationCallConsentAt || null,
    availability_requested: Boolean(lead.availabilityRequested),
    project_interest: lead.projectInterest || null,
    newsletter_subscribed: Boolean(lead.newsletterSubscribed),
    newsletter_subscribed_at: lead.newsletterSubscribedAt || null,
    lost_reason: lead.lostReason || null,
    win_details: lead.winDetails || null,
    payload: lead,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

function toLead(input) {
  const now = new Date().toISOString();
  const name = String(input.name || `${input.firstName || ''} ${input.lastName || ''}`.trim() || 'Unnamed Lead').trim();
  const email = String(input.email || '').trim();
  if (!email) throw new Error('Lead email is required');

  const budgetMax = Number(input.budgetMax || 0) || parseBudget(input.budget);
  const score = typeof input.leadScore === 'number' ? input.leadScore : calculateLeadScore({ ...input, budgetMax });
  const assignedTo = input.assignedTo || 'admin';
  const createdAt = input.createdAt || now;
  const updatedAt = input.updatedAt || now;
  const status = input.status || 'New';

  return {
    id: input.id || randomUUID(),
    sourceSubmissionId: input.sourceSubmissionId,
    name,
    firstName: input.firstName || name.split(' ')[0] || '',
    lastName: input.lastName || name.split(' ').slice(1).join(' ') || '',
    email,
    phone: input.phone ? String(input.phone).trim() : '',
    alternatePhone: input.alternatePhone || '',
    whatsappNumber: input.whatsappNumber || '',
    preferredChannel: input.preferredChannel || 'email',
    preferredLanguage: input.preferredLanguage || 'English',
    preferredContactTime: input.preferredContactTime || 'Anytime',
    nationality: input.nationality || '',
    country: input.country || '',
    city: input.city || '',
    residenceStatus: input.residenceStatus || 'Non-Resident',
    clientType: input.clientType || 'buyer',
    propertyTypeInterest: asArray(input.propertyTypeInterest || input.propertyType || input.interest),
    preferredLocations: asArray(input.preferredLocations || input.area),
    bedroomsPreference: asArray(input.bedroomsPreference),
    budgetMin: Number(input.budgetMin || 0),
    budgetMax,
    budget: input.budget || '',
    financingMethod: input.financingMethod || 'unknown',
    mortgagePreApproval: Boolean(input.mortgagePreApproval),
    purchaseTimeframe: input.purchaseTimeframe || '3 months',
    leadSource: input.leadSource || input.source || 'website',
    sourceCampaign: input.sourceCampaign || input.type || '',
    leadScore: score,
    temperature: input.temperature || (score >= 70 ? 'hot' : score >= 35 ? 'warm' : 'cold'),
    status,
    assignedTo,
    lastActivityDate: input.lastActivityDate || now,
    nextFollowUpDate: input.nextFollowUpDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt,
    updatedAt,
    notes: input.notes || '',
    description: input.description || input.preference || input.message || '',
    actionLog: asArray(input.actionLog),
    propertyInterests: asArray(input.propertyInterests || input.propertyTitle),
    opportunities: asArray(input.opportunities),
    tasks: asArray(input.tasks).length ? asArray(input.tasks) : [createInitialTask(score, assignedTo)],
    deals: asArray(input.deals),
    communications: asArray(input.communications),
    attachments: asArray(input.attachments),
    viewings: asArray(input.viewings),
    offers: asArray(input.offers),
    statusHistory: asArray(input.statusHistory).length ? asArray(input.statusHistory) : [{
      id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      from: '',
      to: status,
      updatedBy: 'system',
      timestamp: createdAt,
    }],
    chatProfile: input.chatProfile || null,
    chatTranscript: input.chatTranscript || '',
    tracking: input.tracking || null,
    validationCallConsent: Boolean(input.validationCallConsent || input.chatProfile?.contactConsent),
    validationCallConsentAt: input.validationCallConsentAt || input.chatProfile?.contactConsentAt || '',
    availabilityRequested: Boolean(input.availabilityRequested || input.chatProfile?.availabilityRequested),
    projectInterest: input.projectInterest || input.chatProfile?.projectInterest || '',
    newsletterSubscribed: Boolean(input.newsletterSubscribed || input.chatProfile?.newsletterSubscribed),
    newsletterSubscribedAt: input.newsletterSubscribedAt || input.chatProfile?.newsletterSubscribedAt || '',
    lostReason: input.lostReason || '',
    winDetails: input.winDetails || null,
  };
}

async function readLeads() {
  const db = assertSupabase();
  const { data, error } = await db.from('crm_leads').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(leadRowToLead);
}

async function upsertLeads(leads) {
  if (!leads.length) return;
  const db = assertSupabase();
  const { error } = await db.from('crm_leads').upsert(leads.map(leadToRow), { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

async function deleteLead(id) {
  const db = assertSupabase();
  const { error } = await db.from('crm_leads').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

async function readDuplicateLeads() {
  const db = assertSupabase();
  const { data, error } = await db.from('crm_duplicate_leads').select('*').order('archived_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(row => row.payload).filter(Boolean);
}

async function upsertDuplicateLeads(leads) {
  if (!leads.length) return;
  const db = assertSupabase();
  const rows = leads.map(lead => ({
    id: lead.id,
    original_id: lead.duplicateMeta?.matchedLeadId || lead.id,
    source_type: lead.duplicateMeta?.source || 'manual',
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    duplicate_reason: lead.duplicateMeta?.reason || null,
    admin_note: lead.duplicateMeta?.note || null,
    payload: lead,
    archived_at: lead.duplicateMeta?.movedAt || new Date().toISOString(),
    archived_by: lead.duplicateMeta?.movedBy || 'admin',
  }));
  const { error } = await assertSupabase().from('crm_duplicate_leads').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

function findDuplicateLead(input, leads) {
  const email = normalizeEmail(input.email);
  const phones = [normalizePhone(input.phone), normalizePhone(input.alternatePhone), normalizePhone(input.whatsappNumber)].filter(Boolean);
  return leads.find(lead => {
    const leadEmails = [normalizeEmail(lead.email)].filter(Boolean);
    const leadPhones = [normalizePhone(lead.phone), normalizePhone(lead.alternatePhone), normalizePhone(lead.whatsappNumber)].filter(Boolean);
    return (email && leadEmails.includes(email)) || phones.some(phone => leadPhones.includes(phone));
  });
}

async function handleLeads(req, res, url) {
  if (req.method === 'GET') {
    const leads = url.searchParams.get('type') === 'duplicates' ? await readDuplicateLeads() : await readLeads();
    sendJson(res, 200, { success: true, data: leads });
    return;
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
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
    const body = await readBody(req);
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
}

function enquiryRowToEnquiry(row) {
  const payload = row.payload && typeof row.payload === 'object' ? row.payload : {};
  return {
    ...payload,
    id: row.id,
    type: row.type || payload.type || '',
    firstName: row.first_name || payload.firstName || '',
    lastName: row.last_name || payload.lastName || '',
    name: row.name || payload.name || '',
    email: row.email || payload.email || '',
    phone: row.phone || payload.phone || '',
    interest: row.interest || payload.interest || '',
    budget: row.budget || payload.budget || '',
    area: row.area || payload.area || '',
    propertyId: row.property_id || payload.propertyId || '',
    propertyTitle: row.property_title || payload.propertyTitle || '',
    message: row.message || payload.message || '',
    source: row.source || payload.source || 'website',
    status: row.status || payload.status || 'new',
    assignedTo: row.assigned_to || payload.assignedTo || '',
    actionLog: Array.isArray(row.action_log) ? row.action_log : asArray(payload.actionLog),
    chatProfile: row.chat_profile || payload.chatProfile || null,
    chatTranscript: row.chat_transcript || payload.chatTranscript || '',
    tracking: row.tracking || payload.tracking || null,
    newsletterSubscribed: Boolean(row.newsletter_subscribed || payload.newsletterSubscribed),
    newsletterSubscribedAt: row.newsletter_subscribed_at || payload.newsletterSubscribedAt || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function enquiryToRow(input) {
  const now = new Date().toISOString();
  const id = formatUuid(input.id) || randomUUID();
  return {
    id,
    type: input.type || null,
    first_name: input.firstName || null,
    last_name: input.lastName || null,
    name: input.name || `${input.firstName || ''} ${input.lastName || ''}`.trim() || null,
    email: input.email || null,
    phone: input.phone || null,
    interest: input.interest || null,
    budget: input.budget || null,
    area: input.area || null,
    property_id: input.propertyId || null,
    property_title: input.propertyTitle || null,
    message: input.message || null,
    source: input.source || 'website',
    status: input.status || 'new',
    assigned_to: input.assignedTo || null,
    action_log: asArray(input.actionLog),
    chat_profile: input.chatProfile || null,
    chat_transcript: input.chatTranscript || null,
    tracking: input.tracking || null,
    newsletter_subscribed: Boolean(input.newsletterSubscribed),
    newsletter_subscribed_at: input.newsletterSubscribedAt || null,
    payload: { ...input, id },
    created_at: input.createdAt || now,
    updated_at: now,
  };
}

async function handleEnquiries(req, res) {
  const db = assertSupabase();
  if (req.method === 'GET') {
    const { data, error } = await db.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    sendJson(res, 200, { success: true, data: (data || []).map(enquiryRowToEnquiry) });
    return;
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const { data, error } = await db.from('enquiries').upsert(enquiryToRow(body), { onConflict: 'id' }).select('*').single();
    if (error) throw new Error(error.message);
    sendJson(res, 201, { success: true, data: enquiryRowToEnquiry(data) });
    return;
  }

  if (req.method === 'PUT') {
    const body = await readBody(req);
    if (!body.id) {
      sendJson(res, 400, { success: false, error: 'Enquiry ID required' });
      return;
    }
    const row = enquiryToRow(body);
    const { data, error } = await db.from('enquiries').upsert(row, { onConflict: 'id' }).select('*').single();
    if (error) throw new Error(error.message);
    sendJson(res, 200, { success: true, data: enquiryRowToEnquiry(data) });
    return;
  }

  sendJson(res, 405, { success: false, error: 'Method not allowed' });
}

function postNvidia(payload) {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  const model = payload.model || process.env.NVIDIA_MODEL || process.env.VITE_NVIDIA_MODEL || 'z-ai/glm-5.2';
  const baseUrl = (process.env.NVIDIA_BASE_URL || process.env.VITE_NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
  const allowInsecureTls = (process.env.NVIDIA_ALLOW_INSECURE_TLS || 'true').toLowerCase() !== 'false';

  if (!apiKey) throw new Error('NVIDIA API key is not configured');

  const url = new URL(`${baseUrl}/chat/completions`);
  return new Promise((resolve, reject) => {
    const request = https.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || 443,
      path: `${url.pathname}${url.search}`,
      method: 'POST',
      rejectUnauthorized: !allowInsecureTls,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }, response => {
      let responseBody = '';
      response.on('data', chunk => {
        responseBody += chunk;
      });
      response.on('end', () => {
        let parsed = {};
        try {
          parsed = responseBody ? JSON.parse(responseBody) : {};
        } catch {
          parsed = { error: responseBody };
        }
        if ((response.statusCode || 500) >= 300) {
          reject(new Error(`NVIDIA request failed: ${response.statusCode} ${responseBody.slice(0, 300)}`));
          return;
        }
        resolve({ parsed, model });
      });
    });
    request.on('error', reject);
    request.setTimeout(120_000, () => request.destroy(new Error('NVIDIA request timed out')));
    request.write(JSON.stringify({
      model,
      messages: asArray(payload.messages),
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: Math.min(Math.max(Number(payload.max_tokens || 2048), 16), 5000),
      stream: false,
    }));
    request.end();
  });
}

function extractNvidiaImage(parsed) {
  const candidates = [
    parsed?.image,
    parsed?.images?.[0],
    parsed?.data?.[0]?.b64_json,
    parsed?.data?.[0]?.url,
    parsed?.artifacts?.[0]?.base64,
    parsed?.artifacts?.[0]?.url,
    parsed?.output?.[0]?.b64_json,
    parsed?.output?.[0]?.url,
  ].filter(Boolean);

  const value = candidates.find(item => typeof item === 'string');
  if (!value) return null;
  if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) return value;
  return `data:image/png;base64,${value}`;
}

function extractImageFromProviderResponse(parsed) {
  const candidates = [
    parsed?.image,
    parsed?.url,
    parsed?.image_url,
    parsed?.images?.[0],
    parsed?.data?.[0]?.b64_json,
    parsed?.data?.[0]?.url,
    parsed?.artifacts?.[0]?.base64,
    parsed?.artifacts?.[0]?.url,
    parsed?.output?.[0]?.b64_json,
    parsed?.output?.[0]?.url,
  ].filter(Boolean);

  const value = candidates.find(item => typeof item === 'string');
  if (!value) return null;
  if (value.startsWith('data:image/') || value.startsWith('http://') || value.startsWith('https://')) return value;
  return `data:image/png;base64,${value}`;
}

function stripDataUrl(value) {
  return String(value || '').replace(/^data:[^;]+;base64,/, '');
}

async function imageInputToDataUrl(image) {
  if (image.startsWith('data:image/')) return image;
  if (!/^https?:\/\//i.test(image)) return image;

  const response = await fetch(image);
  if (!response.ok) {
    throw new Error(`Unable to fetch source image: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Source URL is not an image (${contentType}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:${contentType};base64,${base64}`;
}

async function fetchImageProviderJsonOrImage(url, headers, payload, timeoutMs = 120_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const buffer = Buffer.from(await response.arrayBuffer());

    if (!response.ok) {
      throw new Error(`${response.status} ${buffer.toString('utf8').slice(0, 500)}`);
    }

    if (contentType.startsWith('image/')) {
      return {
        imageUrl: `data:${contentType};base64,${buffer.toString('base64')}`,
        raw: null,
      };
    }

    const text = buffer.toString('utf8');
    let parsed = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Provider returned non-image, non-JSON response: ${text.slice(0, 300)}`);
    }

    const imageUrl = extractImageFromProviderResponse(parsed);
    if (!imageUrl) {
      throw new Error(`Provider response did not include an image output: ${text.slice(0, 300)}`);
    }

    return { imageUrl, raw: parsed };
  } finally {
    clearTimeout(timeout);
  }
}

async function postHuggingFaceImageEdit({ image, prompt }) {
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.HUGGING_FACE_API_KEY;
  const model = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.2-klein-base-9B';

  if (!token) throw new Error('Hugging Face token is not configured. Add HF_TOKEN to .env.');

  const imagePayload = await imageInputToDataUrl(image);
  const payload = {
    inputs: stripDataUrl(imagePayload),
    parameters: {
      prompt,
      guidance_scale: Number(process.env.HF_IMAGE_GUIDANCE_SCALE || 3.5),
      num_inference_steps: Number(process.env.HF_IMAGE_STEPS || 28),
      negative_prompt: 'text, logos, watermarks, badges, signage, people, vehicles, unrealistic objects, distorted architecture, low quality, blurry',
      target_size: {
        width: 1024,
        height: 1024,
      },
    },
  };

  const encodedModel = model.split('/').map(encodeURIComponent).join('/');
  const endpoints = [
    process.env.HF_IMAGE_ENDPOINT,
    `https://router.huggingface.co/fal-ai/models/${encodedModel}`,
    `https://router.huggingface.co/hf-inference/models/${encodedModel}`,
    `https://api-inference.huggingface.co/models/${encodedModel}`,
  ].filter(Boolean);

  const errors = [];
  for (const endpoint of endpoints) {
    try {
      const result = await fetchImageProviderJsonOrImage(endpoint, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }, payload);

      return {
        ...result,
        endpoint,
        model,
      };
    } catch (error) {
      errors.push(`${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Hugging Face image request failed. ${errors.join(' | ')}`);
}

async function postNvidiaImageEdit({ image, prompt, aspectRatio = '1:1' }) {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
  const endpoint = process.env.NVIDIA_IMAGE_ENDPOINT || 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b';
  const model = process.env.NVIDIA_IMAGE_MODEL || 'black-forest-labs/flux.2-klein-4b';

  if (!apiKey) throw new Error('NVIDIA API key is not configured');
  const imagePayload = await imageInputToDataUrl(image);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      image: imagePayload,
      aspect_ratio: aspectRatio,
      width: 1024,
      height: 1024,
      samples: 1,
      steps: 30,
      cfg_scale: 3.5,
    }),
  });

  const responseText = await response.text();
  let parsed = {};
  try {
    parsed = responseText ? JSON.parse(responseText) : {};
  } catch {
    parsed = { error: responseText };
  }

  if (!response.ok) {
    throw new Error(`NVIDIA image request failed: ${response.status} ${responseText.slice(0, 500)}`);
  }

  const imageUrl = extractNvidiaImage(parsed);
  if (!imageUrl) {
    throw new Error('NVIDIA image response did not include an image output.');
  }

  return {
    imageUrl,
    raw: parsed,
    endpoint,
    model,
  };
}

function buildContentStudioImagePrompt(input) {
  const projectName = String(input.projectName || 'the selected property').trim();
  const developer = String(input.developer || '').trim();
  const keywords = String(input.keywords || '').trim();
  const templateName = String(input.templateName || 'Lockwood & Carter brand template').trim();

  return [
    `Enhance this real estate project image for a premium Lockwood & Carter social media campaign.`,
    `Project: ${projectName}.`,
    developer ? `Developer: ${developer}.` : '',
    keywords ? `Creative focus: ${keywords}.` : '',
    `The final image will sit under the "${templateName}" brand layout, so keep the scene clean with usable negative space.`,
    'Keep the architecture, property type, layout, skyline, and materials accurate.',
    'Improve lighting, contrast, sharpness, colour balance, and editorial luxury feel.',
    'Do not add any text, logos, badges, watermarks, people, vehicles, signage, flags, impossible views, or unrealistic objects.',
    'Do not alter the building design or misrepresent the development.',
    'Output a clean square background image suitable for a deterministic branded overlay.',
  ].filter(Boolean).join('\n');
}

async function handleContentStudioEnhanceImage(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  const body = await readBody(req);
  const image = typeof body.image === 'string' ? body.image.trim() : '';
  const keywords = typeof body.keywords === 'string' ? body.keywords.trim() : '';

  if (!image) {
    sendJson(res, 400, { success: false, error: 'Image is required.' });
    return;
  }

  if (!keywords) {
    sendJson(res, 400, { success: false, error: 'Keywords are required for image enhancement.' });
    return;
  }

  const prompt = buildContentStudioImagePrompt(body);

  try {
    const providerPreference = (process.env.CONTENT_STUDIO_IMAGE_PROVIDER || 'huggingface').toLowerCase();
    let result;
    let provider = 'huggingface';

    if (providerPreference === 'nvidia') {
      provider = 'nvidia';
      result = await postNvidiaImageEdit({
        image,
        prompt,
        aspectRatio: body.aspectRatio || '1:1',
      });
    } else {
      try {
        result = await postHuggingFaceImageEdit({ image, prompt });
      } catch (huggingFaceError) {
        if (providerPreference === 'huggingface-only') throw huggingFaceError;
        console.warn('[content-studio] Hugging Face image enhancement failed, falling back to NVIDIA:', huggingFaceError instanceof Error ? huggingFaceError.message : huggingFaceError);
        provider = 'nvidia';
        result = await postNvidiaImageEdit({
          image,
          prompt,
          aspectRatio: body.aspectRatio || '1:1',
        });
      }
    }

    sendJson(res, 200, {
      success: true,
      imageUrl: result.imageUrl,
      prompt,
      provider,
      model: result.model,
      endpoint: result.endpoint,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image enhancement failed.';
    console.warn('[content-studio] Image enhancement failed:', message);
    sendJson(res, 502, {
      success: false,
      error: message,
      fallbackImageUrl: image,
      fallbackReason: message.includes('predefined') || message.includes('example_id')
        ? 'The NVIDIA hosted preview endpoint may not accept arbitrary uploaded images. The original image can still be used for template rendering.'
        : 'The original image can still be used for template rendering.',
    });
  }
}

async function handleDarieChat(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  const body = await readBody(req);
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    sendJson(res, 400, { error: 'Messages are required' });
    return;
  }
  const { parsed, model } = await postNvidia(body);
  sendJson(res, 200, {
    text: parsed.choices?.[0]?.message?.content || '',
    model,
  });
}

async function handleMarketComparisonReports(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  const body = await readBody(req);
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
  const officialSourceRegistry = getOfficialRealEstateSources(comparedCities);
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
        'The report is for advisers and clients evaluating which city currently offers stronger real estate investment fundamentals.',
        'Be analytical, practical, and explicit about uncertainty. Do not invent exact live figures where you do not have source-grounded confidence.',
        'Keep the richer advisory report structure: executive summary, market snapshot, quantitative comparison, metric-by-metric analysis, scoring matrix, investor suitability, risk matrix, ranked investment view, and client-facing advisory note.',
        'All comparison data must be presented in markdown tables. Do not present comparative numbers or scoring as prose-only paragraphs.',
        'Use the supplied vetted house-price rows as authoritative only for relevant house-price and HPI fields for any selected city that appears in the dataset.',
        'When using the priceComparisonVsDubai field, label it as "Dataset Price vs Dubai". Do not describe it as a USD/sqft premium or discount unless you calculate that delta directly from usdPerSqft values and clearly label it as a calculated USD/sqft difference.',
        'If your broader market knowledge conflicts with the vetted house-price rows, replace the older house-price or HPI figure with the vetted dataset figure and briefly note that the L&C vetted quarterly dataset is being used for that metric.',
        'Do not let the vetted house-price data overpower the report. Use it to complement pricing, entry-cost, momentum, and HPI sections where available; use broader analysis for liquidity, regulations, taxes, yields, supply, currency, and risk where vetted HP data does not cover the metric.',
        'Use the supplied official real estate source registry as the authenticity checklist for each selected city. Prefer government land departments, cadastral bodies, real estate regulators, central banks, and national statistics offices before private portals or media commentary.',
        'If a metric is not covered by the vetted house-price data or the configured official source registry, do not invent a current figure. Use directional wording and mark "Adviser verification required" in the relevant table cell.',
        'Do not mention the AI model, model provider, prompt, tokens, or generation mechanics anywhere in the report.',
        'Avoid overly absolute investment labels like "Strong Buy" or "Avoid" unless the data clearly supports them. Prefer measured advisory labels such as "Most attractive", "Selective entry", "Monitor", or "Lower risk-adjusted appeal".',
        'Use clear markdown sections, concise tables, and action-oriented recommendations.',
        'Include: executive summary, market snapshot, vetted data supplement, metric-by-metric comparison tables, scoring matrix, investor suitability table, risk matrix, ranked investment view, and next-step advisory notes.',
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
        'OFFICIAL REAL ESTATE SOURCE REGISTRY FOR SELECTED CITIES:',
        JSON.stringify(officialSourceRegistry, null, 2),
        '',
        'For each selected metric, compare the primary city against the comparison cities.',
        'Use this exact report structure:',
        '1. Executive Summary - concise paragraphs plus a one-row conclusion table.',
        '2. Market Snapshot - table comparing each city across price level, momentum, liquidity, regulatory/tax friction, and investor fit.',
        '3. Vetted House-Price Data Supplement - table using only selected cities available in the L&C vetted dataset, plus a short coverage note for unavailable cities. Include a compact Official Source Coverage table listing each city, primary official source names, and what should be verified there.',
        '4. Metric-by-Metric Comparison - for every selected metric, include a table with one row per city and columns for evidence, interpretation, and adviser verification needed.',
        '5. Scoring Matrix - table with 1-5 scores for entry price, 1Y real momentum, 5Y real growth, relative affordability vs Dubai, liquidity/regulatory risk, and client suitability. Explain that scores are advisory, not raw source data.',
        '6. Investor Suitability - table by investor profile such as yield-focused, capital-growth, safe-haven, lifestyle, and foreign non-resident buyer.',
        '7. Risk Matrix - table covering market, liquidity, currency, tax/regulatory, supply, and exit risks.',
        '8. Ranked Investment View - table ranking the cities with rationale and caveats.',
        '9. Client-Facing Advisory Note - concise recommendation that an adviser can share.',
        'End with a short source note naming the L&C vetted quarterly house-price dataset and the official source registry where used.',
      ].filter(Boolean).join('\n'),
    },
  ];

  const { parsed, model } = await postNvidia({ messages, max_tokens: 4096 });
  const report = parsed.choices?.[0]?.message?.content || '';
  const tokenCount = Number(parsed.usage?.total_tokens || 0);

  sendJson(res, 200, {
    success: true,
    report,
    officialSourceRegistry,
    sources: [
      {
        web: {
          title: 'L&C vetted quarterly house-price dataset',
          uri: HOUSE_PRICE_DATA_URL,
        },
      },
      ...officialSourceRegistry.flatMap(entry =>
        entry.primarySources.map(source => ({
          web: {
            title: `${entry.city}: ${source.name}`,
            uri: source.url,
          },
        }))
      ),
    ],
    tokenCount,
    cost: 0,
    model,
    primaryCity,
    comparisonCities,
    metrics: selectedMetrics,
    generatedAt: new Date().toISOString(),
    housePriceData,
  });
}

async function handleSendEmail(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const configuredFrom = process.env.EMAIL_FROM;

  if (!apiKey || !configuredFrom) {
    sendJson(res, 503, {
      success: false,
      error: 'Email provider is not configured. Set RESEND_API_KEY and EMAIL_FROM in .env.',
    });
    return;
  }

  const body = await readBody(req);
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
}

async function handleSendWhatsApp(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { success: false, error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    sendJson(res, 503, {
      success: false,
      businessNumber: WHATSAPP_BUSINESS_NUMBER,
      error: 'WhatsApp Cloud API is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env for +971585871869.',
    });
    return;
  }

  const body = await readBody(req);
  const to = normalizePhone(body.to).replace(/^\+/, '');
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!to || !message) {
    sendJson(res, 400, {
      success: false,
      error: 'Recipient WhatsApp number and message are required.',
    });
    return;
  }

  const response = await fetch(`${WHATSAPP_GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
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
      businessNumber: WHATSAPP_BUSINESS_NUMBER,
      error: data.error?.message || data.message || 'WhatsApp send failed',
    });
    return;
  }

  sendJson(res, 200, { success: true, businessNumber: WHATSAPP_BUSINESS_NUMBER, data });
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  try {
    if (url.pathname === '/api/health') {
      sendJson(res, 200, {
        success: true,
        service: 'lockwood-carter-node-api',
        supabaseConfigured: Boolean(supabase),
        usesServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        whatsAppBusinessNumber: WHATSAPP_BUSINESS_NUMBER,
        whatsAppConfigured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      });
      return;
    }

    if (url.pathname === '/api/darie-chat') {
      await handleDarieChat(req, res);
      return;
    }

    if (url.pathname === '/api/market-comparison-reports/cities') {
      await handleMarketComparisonReportCities(req, res);
      return;
    }

    if (url.pathname === '/api/house-price-data') {
      await handleHousePriceData(req, res);
      return;
    }

    if (url.pathname === '/api/admin/hp-data') {
      await handleAdminHpData(req, res);
      return;
    }

    if (url.pathname === '/api/market-comparison-reports') {
      await handleMarketComparisonReports(req, res);
      return;
    }

    if (url.pathname === '/api/content-studio/enhance-image') {
      await handleContentStudioEnhanceImage(req, res);
      return;
    }

    if (url.pathname === '/api/leads') {
      await handleLeads(req, res, url);
      return;
    }

    if (url.pathname === '/api/enquiries') {
      await handleEnquiries(req, res);
      return;
    }

    if (url.pathname === '/api/admin/send-email') {
      await handleSendEmail(req, res);
      return;
    }

    if (url.pathname === '/api/admin/send-whatsapp') {
      await handleSendWhatsApp(req, res);
      return;
    }

    sendJson(res, 404, { success: false, error: 'Route not found' });
  } catch (error) {
    sendJson(res, 500, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown server error',
    });
  }
});

server.listen(PORT, () => {
  console.log(`[crm-api] Node API listening on http://localhost:${PORT}`);
});
