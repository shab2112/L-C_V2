import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Plus, Save, Star } from 'lucide-react';
import {
  FeaturedProperty,
  formatAed,
  getAllFeaturedProperties,
  getHousingMarkets,
  getIntelligenceSettings,
  HousingMarket,
  saveFeaturedProperties,
  saveHousingMarkets,
  saveIntelligenceSettings,
} from '../../lib/propertyIntelligenceStore';

const emptyProperty: FeaturedProperty = {
  id: '',
  title: '',
  description: '',
  location: '',
  developer: '',
  price: 0,
  area: 0,
  beds: '',
  baths: '',
  status: 'Off-Plan',
  paymentPlan: '',
  imageUrl: '',
  routePath: '',
  completionDate: '',
  propertyType: '',
  investmentCase: '',
  amenities: [],
  sourceLabel: '',
  isVisible: true,
  featured: true,
};

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold';

const PropertyIntelligencePage: React.FC = () => {
  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [markets, setMarkets] = useState<HousingMarket[]>([]);
  const [housingInfoText, setHousingInfoText] = useState('');
  const [investmentIntro, setInvestmentIntro] = useState('');
  const [draft, setDraft] = useState<FeaturedProperty>({ ...emptyProperty });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setProperties(getAllFeaturedProperties());
    setMarkets(getHousingMarkets());
    const settings = getIntelligenceSettings();
    setHousingInfoText(settings.housingInfoText);
    setInvestmentIntro(settings.investmentIntro);
  }, []);

  const persistProperties = (next: FeaturedProperty[]) => {
    setProperties(next);
    saveFeaturedProperties(next);
    setMessage('Property data saved.');
  };

  const addProperty = (event: React.FormEvent) => {
    event.preventDefault();
    const id = draft.id.trim() || `prop-${Date.now()}`;
    const routePath = draft.routePath?.trim() || `/projects/${id}`;
    const nextProperty = {
      ...draft,
      id,
      routePath,
      price: Number(draft.price),
      area: Number(draft.area),
      amenities: (draft.amenities || []).filter(Boolean),
      isVisible: true,
      featured: true,
    };
    persistProperties([nextProperty, ...properties.filter(property => property.id !== id)]);
    setDraft({ ...emptyProperty });
  };

  const togglePropertyVisibility = (id: string) => {
    const target = properties.find(property => property.id === id);
    const visibleFeaturedCount = properties.filter(property => property.isVisible !== false && property.featured !== false).length;

    if (target?.isVisible !== false && target?.featured !== false && visibleFeaturedCount <= 3) {
      setMessage('At least 3 visible featured properties are required. Feature another visible property before hiding this one.');
      return;
    }

    const next = properties.map(property => (
      property.id === id ? { ...property, isVisible: property.isVisible === false } : property
    ));
    const changed = next.find(property => property.id === id);
    persistProperties(next);
    setMessage(changed?.isVisible === false ? 'Listing hidden from the public site.' : 'Listing is visible on the public site.');
  };

  const togglePropertyFeatured = (id: string) => {
    const target = properties.find(property => property.id === id);
    const visibleFeaturedCount = properties.filter(property => property.isVisible !== false && property.featured !== false).length;

    if (target?.isVisible !== false && target?.featured !== false && visibleFeaturedCount <= 3) {
      setMessage('At least 3 visible featured properties are required.');
      return;
    }

    const next = properties.map(property => (
      property.id === id ? { ...property, featured: property.featured === false } : property
    ));
    const changed = next.find(property => property.id === id);
    persistProperties(next);
    setMessage(changed?.featured === false ? 'Property removed from featured listings.' : 'Property added to featured listings.');
  };

  const updateMarket = (index: number, key: keyof HousingMarket, value: string) => {
    const next = markets.map((market, i) => {
      if (i !== index) return market;
      const numericKeys: Array<keyof HousingMarket> = ['usdPerSqft', 'vsDubai', 'hpi1Y', 'hpi5Y'];
      return {
        ...market,
        [key]: numericKeys.includes(key) ? Number(value) : value,
      };
    });
    setMarkets(next);
  };

  const saveIntelligence = () => {
    saveHousingMarkets(markets);
    saveIntelligenceSettings({ housingInfoText, investmentIntro });
    setMessage('Investment intelligence data saved.');
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-brand-primary">Property & Investment Intelligence</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Manage homepage featured properties, uploaded project records, and the market intelligence data shown on the public site.
          </p>
          {message && <p className="mt-3 text-sm font-semibold text-green-700">{message}</p>}
        </header>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-brand-primary">Upload / Add Project</h2>
          <form onSubmit={addProperty} className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <input className={inputClass} placeholder="Project title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} required />
            <input className={inputClass} placeholder="Location" value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} required />
            <input className={inputClass} placeholder="Developer" value={draft.developer} onChange={e => setDraft({ ...draft, developer: e.target.value })} required />
            <select className={inputClass} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as FeaturedProperty['status'] })}>
              <option>Off-Plan</option>
              <option>New Launch</option>
              <option>Ready</option>
              <option>Rent</option>
            </select>
            <input className={inputClass} type="number" placeholder="Price AED" value={draft.price || ''} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} required />
            <input className={inputClass} type="number" placeholder="Area sqft" value={draft.area || ''} onChange={e => setDraft({ ...draft, area: Number(e.target.value) })} required />
            <input className={inputClass} placeholder="Beds e.g. 1-3" value={draft.beds} onChange={e => setDraft({ ...draft, beds: e.target.value })} />
            <input className={inputClass} placeholder="Baths e.g. 2-4" value={draft.baths} onChange={e => setDraft({ ...draft, baths: e.target.value })} />
            <input className={`${inputClass} lg:col-span-2`} placeholder="Image URL or /public path" value={draft.imageUrl} onChange={e => setDraft({ ...draft, imageUrl: e.target.value })} required />
            <input className={inputClass} placeholder="Payment plan" value={draft.paymentPlan} onChange={e => setDraft({ ...draft, paymentPlan: e.target.value })} />
            <input className={inputClass} placeholder="Completion date e.g. Q2 2030" value={draft.completionDate || ''} onChange={e => setDraft({ ...draft, completionDate: e.target.value })} />
            <input className={inputClass} placeholder="Property type" value={draft.propertyType || ''} onChange={e => setDraft({ ...draft, propertyType: e.target.value })} />
            <input className={inputClass} placeholder="Landing route e.g. /projects/project-name" value={draft.routePath || ''} onChange={e => setDraft({ ...draft, routePath: e.target.value })} />
            <input
              className={`${inputClass} lg:col-span-2`}
              placeholder="Amenities, comma separated"
              value={(draft.amenities || []).join(', ')}
              onChange={e => setDraft({ ...draft, amenities: e.target.value.split(',').map(item => item.trim()).filter(Boolean) })}
            />
            <input className={`${inputClass} lg:col-span-2`} placeholder="Source note" value={draft.sourceLabel || ''} onChange={e => setDraft({ ...draft, sourceLabel: e.target.value })} />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-secondary">
              <Plus className="h-4 w-4" />
              Add Project
            </button>
            <textarea className={`${inputClass} lg:col-span-4`} placeholder="Short description" rows={3} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
            <textarea className={`${inputClass} lg:col-span-4`} placeholder="Investment case for the landing page" rows={3} value={draft.investmentCase || ''} onChange={e => setDraft({ ...draft, investmentCase: e.target.value })} />
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-brand-primary">Featured Properties</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3">Property</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Featured</th>
                  <th>Price</th>
                  <th>Route</th>
                  <th>Image</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map(property => (
                  <tr key={property.id} className={property.isVisible === false ? 'bg-gray-50 opacity-70' : ''}>
                    <td className="py-4">
                      <p className="font-semibold text-brand-primary">{property.title}</p>
                      <p className="text-xs text-gray-500">{property.developer}</p>
                    </td>
                    <td>{property.location}</td>
                    <td>{property.status}</td>
                    <td>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${property.isVisible === false ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {property.isVisible === false ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${property.featured === false ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'}`}>
                        {property.featured === false ? 'No' : 'Featured'}
                      </span>
                    </td>
                    <td>{formatAed(property.price)}</td>
                    <td className="max-w-[180px] truncate text-xs text-gray-500">{property.routePath || `/projects/${property.id}`}</td>
                    <td className="max-w-[220px] truncate text-xs text-gray-500">{property.imageUrl}</td>
                    <td className="text-right">
                      <div className="inline-flex flex-wrap justify-end gap-3">
                      <button
                        onClick={() => togglePropertyVisibility(property.id)}
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${property.isVisible === false ? 'text-green-700 hover:text-green-900' : 'text-amber-700 hover:text-amber-900'}`}
                      >
                        {property.isVisible === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        {property.isVisible === false ? 'Show' : 'Hide'}
                      </button>
                      <button
                        onClick={() => togglePropertyFeatured(property.id)}
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${property.featured === false ? 'text-brand-primary hover:text-brand-secondary' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        <Star className={`h-4 w-4 ${property.featured === false ? '' : 'fill-current'}`} />
                        {property.featured === false ? 'Feature' : 'Unfeature'}
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-brand-primary">Investment & Global Housing Intelligence</h2>
            <button onClick={saveIntelligence} className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-secondary">
              <Save className="h-4 w-4" />
              Save Intelligence
            </button>
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <textarea className={inputClass} rows={4} value={investmentIntro} onChange={e => setInvestmentIntro(e.target.value)} />
            <textarea className={inputClass} rows={4} value={housingInfoText} onChange={e => setHousingInfoText(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {markets.map((market, index) => (
              <div key={`${market.city}-${index}`} className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 md:grid-cols-6">
                <input className={inputClass} value={market.city} onChange={e => updateMarket(index, 'city', e.target.value)} />
                <input className={inputClass} value={market.country} onChange={e => updateMarket(index, 'country', e.target.value)} />
                <input className={inputClass} type="number" value={market.usdPerSqft} onChange={e => updateMarket(index, 'usdPerSqft', e.target.value)} />
                <input className={inputClass} type="number" value={market.vsDubai} onChange={e => updateMarket(index, 'vsDubai', e.target.value)} />
                <input className={inputClass} type="number" value={market.hpi1Y} onChange={e => updateMarket(index, 'hpi1Y', e.target.value)} />
                <input className={inputClass} type="number" value={market.hpi5Y} onChange={e => updateMarket(index, 'hpi5Y', e.target.value)} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertyIntelligencePage;
