export interface FeaturedProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  developer: string;
  price: number;
  area: number;
  beds: string;
  baths: string;
  status: 'Off-Plan' | 'New Launch' | 'Ready' | 'Rent';
  paymentPlan: string;
  imageUrl: string;
  routePath?: string;
  completionDate?: string;
  propertyType?: string;
  investmentCase?: string;
  amenities?: string[];
  sourceLabel?: string;
  isVisible?: boolean;
  featured: boolean;
}

export interface HousingMarket {
  city: string;
  country: string;
  usdPerSqft: number;
  vsDubai: number;
  hpi1Y: number;
  hpi5Y: number;
}

export interface IntelligenceSettings {
  housingInfoText: string;
  investmentIntro: string;
}

const PROPERTIES_KEY = 'lc_featured_properties';
const HOUSING_KEY = 'lc_global_housing_markets';
const SETTINGS_KEY = 'lc_intelligence_settings';

export const defaultFeaturedProperties: FeaturedProperty[] = [
  {
    id: 'avior',
    title: 'Avior',
    description: 'Twin towers on Sheikh Zayed Road positioned around a high-amenity, ultra-luxury residential proposition.',
    location: 'Sheikh Zayed Road, Dubai',
    developer: 'Acube Developments',
    price: 0,
    area: 0,
    beds: '1-5',
    baths: 'Ask',
    status: 'Off-Plan',
    paymentPlan: 'Ask advisor',
    imageUrl: '/lockwood-assets/projects/avior-by-acube_img2.jpg',
    routePath: '/projects/avior',
    propertyType: 'Apartments',
    investmentCase: 'A central Sheikh Zayed Road address with strong end-user visibility and amenity-led positioning.',
    amenities: ['Extensive amenities', 'Central address', 'Residential towers'],
    featured: true,
  },
  {
    id: 'altair-52',
    title: 'Altair 52',
    description: 'Dubai South residences with flexible studio to 2.5-bedroom layouts and a future-growth location story.',
    location: 'Dubai South, Dubai',
    developer: 'Acube Developments',
    price: 650000,
    area: 445,
    beds: 'Studio-2.5',
    baths: 'Ask',
    status: 'New Launch',
    paymentPlan: 'Ask advisor',
    imageUrl: 'https://altair52.com/wp-content/uploads/2025/06/Altair-52-project-image-7-scaled.jpg',
    routePath: '/projects/altair-52',
    completionDate: 'September 2027',
    propertyType: 'Apartments',
    investmentCase: "A lower entry point in Dubai South with proximity to the city's long-term aviation and logistics growth corridor.",
    amenities: ['Convertible units', 'Dubai South location', 'Flexible layouts'],
    featured: true,
  },
  {
    id: 'shahrukhz',
    title: 'Shahrukhz',
    description: 'Premium offices on Sheikh Zayed Road with a 1% monthly payment-plan proposition.',
    location: 'Sheikh Zayed Road, Dubai',
    developer: 'Danube Properties',
    price: 0,
    area: 450,
    beds: 'Office',
    baths: 'Ask',
    status: 'Off-Plan',
    paymentPlan: '1% monthly',
    imageUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691b8be7d4546c251d23155e/9c236141b_3-1.jpg',
    routePath: '/projects/shahrukhz',
    completionDate: 'Q2 2029',
    propertyType: 'Commercial offices',
    investmentCase: 'A branded commercial address suited to investors looking at office demand on a recognised corridor.',
    amenities: ['Premium offices', 'Sheikh Zayed Road', 'Flexible payment plan'],
    featured: true,
  },
  {
    id: 'masaar-3',
    title: 'Masaar 3',
    description: 'Forest-living townhouses and villas in Sharjah, positioned for families seeking space, greenery, and value.',
    location: 'Suyoh, Sharjah',
    developer: 'Arada',
    price: 1800000,
    area: 0,
    beds: '2-5',
    baths: 'Ask',
    status: 'New Launch',
    paymentPlan: 'Ask advisor',
    imageUrl: 'https://masaaratsharjah.com/assets/images/banner/banner1.webp',
    routePath: '/projects/masaar-3',
    propertyType: 'Townhouses and villas',
    investmentCase: 'A lower-density community story with family-led demand and a nature-focused masterplan.',
    amenities: ['Forest community', 'Townhouses', 'Family amenities'],
    featured: true,
  },
  {
    id: 'artize-62',
    title: 'Villa Artize 62',
    description: 'Ready custom-built villa in Al Furjan with large plot scale, smart-home features, and move-in readiness.',
    location: 'Al Furjan, Dubai',
    developer: 'Private custom build',
    price: 0,
    area: 7000,
    beds: '5',
    baths: 'Ensuite',
    status: 'Ready',
    paymentPlan: 'Ready asset',
    imageUrl: '/lockwood-assets/projects/artize62-poster.jpg',
    routePath: '/projects/artize-62',
    propertyType: 'Villa',
    investmentCase: 'A completed, large-format villa with immediate usability and limited comparable custom stock.',
    amenities: ['Custom build', 'Smart home', 'Large plot'],
    featured: true,
  },
  {
    id: 'prop-001',
    title: 'Avarra by Palace',
    description: 'Branded waterfront residences in Business Bay with Palace Hotels & Resorts hospitality cues, canal views, and a construction-linked payment plan.',
    location: 'Business Bay, Dubai',
    developer: 'Emaar Properties',
    price: 2700000,
    area: 789,
    beds: '1-4',
    baths: '2-4',
    status: 'Off-Plan',
    paymentPlan: '80/20',
    imageUrl: '/offplan_images/01_Avarra_by_Palace/img_01_hero.jpg',
    routePath: '/projects/prop-001',
    completionDate: 'Q2 2031',
    propertyType: '1-4 bedroom apartments',
    investmentCase: 'Business Bay waterfront supply with Emaar execution, Palace hospitality cues, and strong central Dubai connectivity.',
    amenities: ['Infinity pool', 'Gym', 'Yoga zone', 'Kids pool', 'Co-working space'],
    sourceLabel: 'Updated from public project/developer listings reviewed August 2026',
    featured: true,
  },
  {
    id: 'prop-002',
    title: 'The Edit at D3',
    description: 'Three sculptural towers in Dubai Design District with co-working lounges, wellness facilities, and refined city living.',
    location: 'Dubai Design District',
    developer: 'Meraas Holding',
    price: 2000000,
    area: 754,
    beds: '1-5',
    baths: '2-5',
    status: 'New Launch',
    paymentPlan: '75/25',
    imageUrl: '/offplan_images/02_The_Edit_at_D3/img_01_hero.jpg',
    routePath: '/projects/prop-002',
    completionDate: 'Q1/Q2 2030',
    propertyType: '1-4 bedroom apartments and penthouses',
    investmentCase: 'A rare residential address in Dubai Design District, backed by Meraas and a waterfront creative-district location.',
    amenities: ['Sky gardens', 'Wellness club', 'Resort pools', 'Cinema', 'Co-working spaces'],
    sourceLabel: 'Updated from Meraas and public project listings reviewed August 2026',
    featured: true,
  },
  {
    id: 'prop-004',
    title: 'DAMAC Islands Phase 2',
    description: 'Island-inspired villas and townhouses in Dubailand with resort-style amenities, lagoon living, and family-scale layouts.',
    location: 'Damac Islands 2, Dubailand',
    developer: 'DAMAC Properties',
    price: 2750000,
    area: 2208,
    beds: '4-6',
    baths: '4-6',
    status: 'Off-Plan',
    paymentPlan: '20/55/25',
    imageUrl: '/offplan_images/04_DAMAC_Islands_Phase2/img_01_hero.jpg',
    routePath: '/projects/prop-004',
    completionDate: 'Q2 2030',
    propertyType: 'Townhouses and villas',
    investmentCase: 'A waterfront master-community proposition at the Al Qudra and Emirates Road junction, offering larger homes at an accessible luxury entry point.',
    amenities: ['Lagoon community', 'Water activities', 'Outdoor fitness', 'Family amenities', 'Retail and leisure'],
    sourceLabel: 'Updated from public developer portal listings reviewed August 2026',
    featured: true,
  },
  {
    id: 'prop-012',
    title: 'Enre Residence',
    description: 'Studios to two-bedroom apartments by Imtiaz in Dubai South, with smart-home features and a low entry point.',
    location: 'Dubai South, Dubai',
    developer: 'Imtiaz Developments',
    price: 673000,
    area: 348,
    beds: 'Studio-2',
    baths: '1-2',
    status: 'Off-Plan',
    paymentPlan: '20/40/40',
    imageUrl: '/offplan_images/12_Enre_Residence/img_01_hero.jpg',
    routePath: '/projects/prop-012',
    completionDate: 'Q1/Q3 2028',
    propertyType: 'Studios, 1 and 2 bedroom apartments',
    investmentCase: 'A Dubai South entry point near Expo City and the long-term Al Maktoum International Airport growth corridor.',
    amenities: ['Adult and kids pools', 'Indoor gym', 'Yoga deck', 'Jogging track', 'Rooftop open area'],
    sourceLabel: 'Updated from Bayut, Property Finder, and project listings reviewed August 2026',
    featured: true,
  },
];

export const defaultHousingMarkets: HousingMarket[] = [
  { city: 'Dubai', country: 'UAE', usdPerSqft: 520, vsDubai: 0, hpi1Y: 16.2, hpi5Y: 78.4 },
  { city: 'London', country: 'United Kingdom', usdPerSqft: 1450, vsDubai: 179, hpi1Y: 1.4, hpi5Y: 8.9 },
  { city: 'New York', country: 'United States', usdPerSqft: 1650, vsDubai: 217, hpi1Y: 3.1, hpi5Y: 21.7 },
  { city: 'Singapore', country: 'Singapore', usdPerSqft: 1920, vsDubai: 269, hpi1Y: 7.5, hpi5Y: 43.2 },
  { city: 'Hong Kong', country: 'Hong Kong', usdPerSqft: 2100, vsDubai: 304, hpi1Y: -4.6, hpi5Y: -16.8 },
  { city: 'Sydney', country: 'Australia', usdPerSqft: 1120, vsDubai: 115, hpi1Y: 6.8, hpi5Y: 31.5 },
];

export const defaultSettings: IntelligenceSettings = {
  housingInfoText: 'Q1-Q2 2026 city-level residential apartment data. Values are market averages for comparison only.',
  investmentIntro: 'Dubai combines zero income tax, population growth, infrastructure investment, and internationally competitive entry pricing.',
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('lc-property-intelligence-updated'));
}

function getMergedProperties() {
  const saved = readJson<FeaturedProperty[]>(PROPERTIES_KEY, []);
  if (!saved.length) return defaultFeaturedProperties.map(normalizeProperty);

  const merged = new Map(defaultFeaturedProperties.map(property => [property.id, property]));
  saved.forEach(property => {
    const base = merged.get(property.id);
    merged.set(property.id, { ...(base || property), ...property });
  });
  return Array.from(merged.values()).map(normalizeProperty);
}

function normalizeProperty(property: FeaturedProperty): FeaturedProperty {
  const legacyHidden = property.isVisible === undefined && property.featured === false;
  return {
    ...property,
    isVisible: property.isVisible ?? !legacyHidden,
    featured: property.featured ?? true,
  };
}

export function getFeaturedProperties() {
  return getMergedProperties().filter(property => property.isVisible !== false);
}

export function getAllFeaturedProperties() {
  return getMergedProperties();
}

export function saveFeaturedProperties(properties: FeaturedProperty[]) {
  writeJson(PROPERTIES_KEY, properties);
}

export function getPropertyById(id: string) {
  return getFeaturedProperties().find(property => property.id === id);
}

export function getHousingMarkets() {
  return readJson(HOUSING_KEY, defaultHousingMarkets);
}

export function saveHousingMarkets(markets: HousingMarket[]) {
  writeJson(HOUSING_KEY, markets);
}

export function getIntelligenceSettings() {
  return readJson(SETTINGS_KEY, defaultSettings);
}

export function saveIntelligenceSettings(settings: IntelligenceSettings) {
  writeJson(SETTINGS_KEY, settings);
}

export function formatAed(value: number) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);
}
