export type DataType = 'price' | 'index';
export type PriceUnit = 'sqm' | 'sqft';
export type IndexType = 'nominal' | 'inflAdj';
export type TimePeriod = '1Y' | '5Y' | '10Y';

export interface HousingData {
  city: string;
  country: string;
  usdPerSqm: number | null;
  usdPerSqft: number | null;
  vsDubaiPrice: number | null;
  hpiNominal1Y: number | null;
  hpiNominal1YVsDubaiPp: number | null;
  hpiInflAdj1Y: number | null;
  hpiInflAdj1YVsDubaiPp: number | null;
  hpiNominal5Y: number | null;
  hpiNominal5YVsDubaiPp: number | null;
  hpiInflAdj5Y: number | null;
  hpiInflAdj5YVsDubaiPp: number | null;
  hpiNominal10Y: number | null;
  hpiNominal10YVsDubaiPp: number | null;
  hpiInflAdj10Y: number | null;
  hpiInflAdj10YVsDubaiPp: number | null;
  latitude?: number;
  longitude?: number;
}

interface HousePriceApiRow {
  city?: string;
  country?: string;
  usdPerSqm?: number | null;
  usdPerSqft?: number | null;
  priceComparisonVsDubai?: string | number | null;
  hpiNominal1Y?: number | null;
  hpiNominal1YVsDubaiPp?: number | null;
  hpiInflationAdjusted1Y?: number | null;
  hpiInflationAdjusted1YVsDubaiPp?: number | null;
  hpiNominal5Y?: number | null;
  hpiNominal5YVsDubaiPp?: number | null;
  hpiInflationAdjusted5Y?: number | null;
  hpiInflationAdjusted5YVsDubaiPp?: number | null;
  hpiNominal10Y?: number | null;
  hpiNominal10YVsDubaiPp?: number | null;
  hpiInflationAdjusted10Y?: number | null;
  hpiInflationAdjusted10YVsDubaiPp?: number | null;
}

const HOUSE_PRICE_DATA_URL =
  'https://diuorqykbykouqnlxcxe.supabase.co/storage/v1/object/public/house_price/hp_data.xlsx';

export const cityCoordinates: Record<string, [number, number]> = {
  Amsterdam: [52.3676, 4.9041],
  Andorra: [42.5063, 1.5218],
  Athens: [37.9838, 23.7275],
  Bangkok: [13.7563, 100.5018],
  Beijing: [39.9042, 116.4074],
  Belgrade: [44.8176, 20.4631],
  Berlin: [52.52, 13.405],
  Bratislava: [48.1486, 17.1077],
  Brussels: [50.8503, 4.3517],
  Budapest: [47.4979, 19.0402],
  'Buenos Aires': [-34.6037, -58.3816],
  Cairo: [30.0444, 31.2357],
  'Cape Town': [-33.9249, 18.4241],
  Copenhagen: [55.6761, 12.5683],
  Doha: [25.2854, 51.531],
  Dubai: [25.2048, 55.2708],
  Dublin: [53.3498, -6.2603],
  Helsinki: [60.1695, 24.9354],
  'Hong Kong': [22.3193, 114.1694],
  Istanbul: [41.0082, 28.9784],
  Jakarta: [-6.2088, 106.8456],
  Johannesburg: [-26.2041, 28.0473],
  Lagos: [6.5244, 3.3792],
  Lisbon: [38.7223, -9.1393],
  Ljubljana: [46.0569, 14.5058],
  London: [51.5074, -0.1278],
  'Los Angeles': [34.0522, -118.2437],
  'Luxembourg City': [49.6116, 6.1319],
  Macau: [22.1987, 113.5439],
  Madrid: [40.4168, -3.7038],
  Manila: [14.5995, 120.9842],
  Melbourne: [-37.8136, 144.9631],
  'Mexico City': [19.4326, -99.1332],
  Milan: [45.4642, 9.19],
  Montevideo: [-34.9011, -56.1645],
  Moscow: [55.7558, 37.6173],
  Mumbai: [19.076, 72.8777],
  Nairobi: [-1.2921, 36.8219],
  'New York': [40.7128, -74.006],
  Oslo: [59.9139, 10.7522],
  Paris: [48.8566, 2.3522],
  Prague: [50.0755, 14.4378],
  'Puerto Rico': [18.2208, -66.5901],
  Reykjavik: [64.1466, -21.9426],
  Riga: [56.9496, 24.1052],
  Rome: [41.9028, 12.4964],
  'Sao Paulo': [-23.5558, -46.6396],
  Seoul: [37.5665, 126.978],
  Shanghai: [31.2304, 121.4737],
  Singapore: [1.3521, 103.8198],
  Stockholm: [59.3293, 18.0686],
  Sydney: [-33.8688, 151.2093],
  'Taipei City': [25.033, 121.5654],
  Tallinn: [59.437, 24.7536],
  Tokyo: [35.6762, 139.6503],
  Toronto: [43.6532, -79.3832],
  Vancouver: [49.2827, -123.1207],
  Vienna: [48.2082, 16.3738],
  Vilnius: [54.6872, 25.2798],
  Warsaw: [52.2297, 21.0122],
  Zagreb: [45.815, 15.9819],
  Zurich: [47.3769, 8.5417],
};

const parseComparison = (value: string | number | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const numeric = Number(String(value || '').replace(/[+,%\s]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

const parseNumericCell = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = String(value).trim();
  const negative = /^\(.*\)$/.test(text) || /^-/.test(text);
  const numeric = Number(text.replace(/[()$,%\s,]|pp/g, '').replace(/^\+/, ''));
  if (Number.isNaN(numeric)) return null;
  return negative ? -Math.abs(numeric) : numeric;
};

const asNumber = (value: unknown) => parseNumericCell(value);

const cleanSheetRow = (row: unknown[]): HousePriceApiRow => ({
  city: String(row[1] || '').trim(),
  country: String(row[2] || '').trim(),
  usdPerSqm: parseNumericCell(row[3]),
  usdPerSqft: parseNumericCell(row[4]),
  priceComparisonVsDubai: row[5] as string | number | null | undefined,
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

const mapApiRow = (row: HousePriceApiRow): HousingData | null => {
  const city = String(row.city || '').trim();
  if (!city) return null;
  const coords = cityCoordinates[city];

  return {
    city,
    country: String(row.country || '').trim(),
    usdPerSqm: asNumber(row.usdPerSqm),
    usdPerSqft: asNumber(row.usdPerSqft),
    vsDubaiPrice: city === 'Dubai' ? 0 : parseComparison(row.priceComparisonVsDubai),
    hpiNominal1Y: asNumber(row.hpiNominal1Y),
    hpiNominal1YVsDubaiPp: asNumber(row.hpiNominal1YVsDubaiPp),
    hpiInflAdj1Y: asNumber(row.hpiInflationAdjusted1Y),
    hpiInflAdj1YVsDubaiPp: asNumber(row.hpiInflationAdjusted1YVsDubaiPp),
    hpiNominal5Y: asNumber(row.hpiNominal5Y),
    hpiNominal5YVsDubaiPp: asNumber(row.hpiNominal5YVsDubaiPp),
    hpiInflAdj5Y: asNumber(row.hpiInflationAdjusted5Y),
    hpiInflAdj5YVsDubaiPp: asNumber(row.hpiInflationAdjusted5YVsDubaiPp),
    hpiNominal10Y: asNumber(row.hpiNominal10Y),
    hpiNominal10YVsDubaiPp: asNumber(row.hpiNominal10YVsDubaiPp),
    hpiInflAdj10Y: asNumber(row.hpiInflationAdjusted10Y),
    hpiInflAdj10YVsDubaiPp: asNumber(row.hpiInflationAdjusted10YVsDubaiPp),
    latitude: coords?.[0],
    longitude: coords?.[1],
  };
};

const normalizeRows = (rows: HousePriceApiRow[]) =>
  rows
    .map(row => mapApiRow(row))
    .filter((row: HousingData | null): row is HousingData => Boolean(row && row.latitude !== undefined && row.longitude !== undefined));

async function loadHousingDataFromApi() {
  const response = await fetch('/api/house-price-data', { cache: 'no-store' });
  if (!response.ok) throw new Error(`House price data API failed with status ${response.status}`);
  const result = await response.json();
  if (!result?.success || !Array.isArray(result.rows)) throw new Error('House price data API returned an invalid response');
  return normalizeRows(result.rows);
}

async function loadHousingDataFromStorage() {
  const response = await fetch(`${HOUSE_PRICE_DATA_URL}?v=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`House price storage fetch failed with status ${response.status}`);

  const XLSX = await import('xlsx');
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('House price workbook has no sheets');

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });
  const dataRows = rows
    .slice(2)
    .filter(row => Array.isArray(row) && String(row[1] || '').trim())
    .map(row => cleanSheetRow(row));

  return normalizeRows(dataRows);
}

export async function loadHousingData(): Promise<HousingData[]> {
  try {
    const apiRows = await loadHousingDataFromApi();
    if (apiRows.length > 6) return apiRows;
  } catch {
    // The homepage can still use the public Supabase storage object when the local API has not been restarted.
  }

  return loadHousingDataFromStorage();
}

export function getDisplayValue(
  data: HousingData,
  dataType: DataType,
  priceUnit: PriceUnit,
  indexType: IndexType,
  timePeriod: TimePeriod,
) {
  if (dataType === 'price') {
    return {
      value: priceUnit === 'sqm' ? data.usdPerSqm : data.usdPerSqft,
      comparison: data.vsDubaiPrice,
      label: priceUnit === 'sqm' ? 'USD/sqm' : 'USD/sqft',
    };
  }

  const valueKey = `hpi${indexType === 'nominal' ? 'Nominal' : 'InflAdj'}${timePeriod}` as keyof HousingData;
  const comparisonKey = `${valueKey}VsDubaiPp` as keyof HousingData;

  return {
    value: data[valueKey] as number | null,
    comparison: data[comparisonKey] as number | null,
    label: `HPI ${indexType === 'nominal' ? 'Nominal' : 'Infl-Adj'} ${timePeriod}`,
  };
}

export function formatHousingValue(value: number | null, dataType: DataType, label: string) {
  if (value === null || !Number.isFinite(value)) return 'Data unavailable';
  if (dataType === 'price') return `$${Math.round(value).toLocaleString()} ${label}`;
  return `${value.toFixed(1)}% ${label}`;
}

export function formatDubaiComparison(value: number | null, dataType: DataType) {
  if (value === null || !Number.isFinite(value)) return 'vs Dubai unavailable';
  if (Math.abs(value) < 0.05) return 'same as Dubai';
  const unit = dataType === 'price' ? '%' : 'pp';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}${unit} vs Dubai`;
}
