import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, FileText, Plus, Save, Star, Upload } from 'lucide-react';
import {
  FeaturedProperty,
  formatAed,
  getAllFeaturedProperties,
  getIntelligenceSettings,
  saveFeaturedProperties,
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
const labelClass = 'mb-2 block text-sm font-semibold text-gray-700';

type HpDataMeta = {
  periodLabel: string;
  description: string;
  updatedAt?: string;
  infoText?: string;
  fileName?: string;
  fileUrl?: string;
  fileUpdatedAt?: string | null;
};

const defaultHpMeta: HpDataMeta = {
  periodLabel: 'Q1-Q2 2026',
  description: 'city-level residential apartment data. Values are market averages for comparison only.',
  fileName: 'hp_data.xlsx',
  fileUrl: '',
  fileUpdatedAt: null,
};

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.readAsDataURL(file);
  });

const PropertyIntelligencePage: React.FC = () => {
  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [investmentIntro, setInvestmentIntro] = useState('');
  const [draft, setDraft] = useState<FeaturedProperty>({ ...emptyProperty });
  const [message, setMessage] = useState('');
  const [hpMeta, setHpMeta] = useState<HpDataMeta>(defaultHpMeta);
  const [hpMetaDraft, setHpMetaDraft] = useState({
    periodLabel: defaultHpMeta.periodLabel,
    description: defaultHpMeta.description,
  });
  const [hpUploadFile, setHpUploadFile] = useState<File | null>(null);
  const [hpDataStatus, setHpDataStatus] = useState('');
  const [hpDataError, setHpDataError] = useState('');
  const [hpDataLoading, setHpDataLoading] = useState(false);

  useEffect(() => {
    setProperties(getAllFeaturedProperties());
    const settings = getIntelligenceSettings();
    setInvestmentIntro(settings.investmentIntro);
    fetchHpDataMeta();
  }, []);

  const fetchHpDataMeta = async () => {
    setHpDataError('');
    try {
      const response = await fetch('/api/admin/hp-data');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch HP data settings.');
      setHpMeta(data.data);
      setHpMetaDraft({
        periodLabel: data.data.periodLabel,
        description: data.data.description,
      });
    } catch (error) {
      setHpDataError(error instanceof Error ? error.message : 'Failed to fetch HP data settings.');
    }
  };

  const saveHpDataMeta = async () => {
    setHpDataStatus('');
    setHpDataError('');
    try {
      const response = await fetch('/api/admin/hp-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hpMetaDraft),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to update HP data settings.');
      setHpMeta(data.data);
      setHpDataStatus('HP data metadata updated.');
    } catch (error) {
      setHpDataError(error instanceof Error ? error.message : 'Failed to update HP data settings.');
    }
  };

  const uploadHpDataFile = async () => {
    if (!hpUploadFile) {
      setHpDataError('Choose an .xlsx file first.');
      return;
    }

    setHpDataLoading(true);
    setHpDataStatus('');
    setHpDataError('');
    try {
      const contentBase64 = await readFileAsBase64(hpUploadFile);
      const response = await fetch('/api/admin/hp-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: hpUploadFile.name,
          contentBase64,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to upload HP data spreadsheet.');
      setHpMeta(data.data);
      setHpMetaDraft({
        periodLabel: data.data.periodLabel,
        description: data.data.description,
      });
      setHpUploadFile(null);
      setHpDataStatus('HP data spreadsheet uploaded. Refresh the homepage to verify the updated globe data.');
    } catch (error) {
      setHpDataError(error instanceof Error ? error.message : 'Failed to upload HP data spreadsheet.');
    } finally {
      setHpDataLoading(false);
    }
  };

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

  const saveIntelligence = () => {
    saveIntelligenceSettings({ ...getIntelligenceSettings(), investmentIntro });
    setMessage('Investment intro saved.');
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
            <div>
              <h2 className="text-xl font-bold text-brand-primary">Investment Intelligence Copy</h2>
              <p className="mt-1 text-sm text-gray-600">
                This controls the short investment paragraph on the homepage. Housing market data is managed from the quarterly HP dataset below.
              </p>
            </div>
            <button onClick={saveIntelligence} className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-white hover:bg-brand-secondary">
              <Save className="h-4 w-4" />
              Save Copy
            </button>
          </div>
          <div>
            <label className={labelClass}>Homepage investment intro</label>
            <textarea className={inputClass} rows={4} value={investmentIntro} onChange={e => setInvestmentIntro(e.target.value)} />
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Quarterly Dataset</p>
              <h2 className="mt-1 text-xl font-bold text-brand-primary">Housing Price Data</h2>
              <p className="mt-1 max-w-3xl text-sm text-gray-600">
                Replace the Supabase Storage workbook used by the homepage globe and market comparison reports.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchHpDataMeta}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-bold text-brand-primary hover:border-brand-gold hover:text-brand-secondary"
            >
              Refresh Metadata
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-gold text-white">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-primary">Upload latest HP workbook</h3>
                  <p className="text-sm text-gray-600">Select the quarterly .xlsx file. It will replace `house_price/hp_data.xlsx`.</p>
                </div>
              </div>

              <input
                type="file"
                accept=".xlsx"
                onChange={event => setHpUploadFile(event.target.files?.[0] || null)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
              />
              <button
                type="button"
                onClick={uploadHpDataFile}
                disabled={!hpUploadFile || hpDataLoading}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-primary px-5 py-2 text-sm font-bold text-white hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {hpDataLoading ? 'Uploading...' : 'Upload HP Data'}
              </button>

              <div className="mt-5 space-y-2 rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-600">
                <p><span className="font-bold text-brand-primary">Current file:</span> {hpMeta.fileName || 'hp_data.xlsx'}</p>
                <p><span className="font-bold text-brand-primary">Last uploaded:</span> {hpMeta.fileUpdatedAt ? new Date(hpMeta.fileUpdatedAt).toLocaleString('en-AE') : 'Not recorded'}</p>
                {hpMeta.fileUrl && (
                  <p className="break-all"><span className="font-bold text-brand-primary">Storage URL:</span> {hpMeta.fileUrl}</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-gold text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-primary">Dataset metadata</h3>
                  <p className="text-sm text-gray-600">This records the period and note for the active quarterly dataset.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Period label</label>
                  <input
                    className={inputClass}
                    value={hpMetaDraft.periodLabel}
                    onChange={event => setHpMetaDraft({ ...hpMetaDraft, periodLabel: event.target.value })}
                    placeholder="Q1-Q2 2026"
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    className={inputClass}
                    rows={4}
                    value={hpMetaDraft.description}
                    onChange={event => setHpMetaDraft({ ...hpMetaDraft, description: event.target.value })}
                  />
                </div>
                <div className="rounded-md border border-brand-gold/30 bg-white p-3 text-sm text-gray-700">
                  <span className="font-bold text-brand-primary">Preview: </span>
                  {hpMetaDraft.periodLabel} {hpMetaDraft.description}
                </div>
                <button
                  type="button"
                  onClick={saveHpDataMeta}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-gold px-5 py-2 text-sm font-bold text-white hover:bg-brand-secondary"
                >
                  <Save className="h-4 w-4" />
                  Save Metadata
                </button>
              </div>
            </div>
          </div>

          {hpDataStatus && (
            <div className="mt-5 flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              <CheckCircle className="h-4 w-4" />
              {hpDataStatus}
            </div>
          )}
          {hpDataError && (
            <div className="mt-5 flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertCircle className="h-4 w-4" />
              {hpDataError}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PropertyIntelligencePage;
