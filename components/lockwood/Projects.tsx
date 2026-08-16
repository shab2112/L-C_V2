import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bath, Bed, Building2, CreditCard, MapPin, Maximize } from 'lucide-react';
import { Page } from '../../lockwood-types';
import { FeaturedProperty, formatAed, getFeaturedProperties } from '../../lib/propertyIntelligenceStore';

interface ProjectsProps {
  onNavigate: (page: Page) => void;
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'Off-Plan', label: 'Off-Plan' },
  { id: 'New Launch', label: 'New Launch' },
  { id: 'Ready', label: 'Ready' },
  { id: 'Rent', label: 'Rent' },
];

export const Projects: React.FC<ProjectsProps> = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const load = () => setProperties(getFeaturedProperties());
    load();
    window.addEventListener('lc-property-intelligence-updated', load);
    return () => window.removeEventListener('lc-property-intelligence-updated', load);
  }, []);

  const visibleProperties = useMemo(() => {
    if (activeFilter === 'all') return properties;
    return properties.filter(property => property.status === activeFilter);
  }, [activeFilter, properties]);

  const openProperty = (property: FeaturedProperty) => {
    navigate(property.routePath || `/projects/${property.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] pt-36 pb-24">
      <div className="container mx-auto px-4">
        <header className="mb-14 max-w-4xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#6D2636]">All Properties</p>
          <h1 className="font-serif text-5xl font-normal leading-tight text-[#122238] md:text-7xl">
            Selected Dubai opportunities.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#292B2D]/70">
            A live catalogue managed from Property Intelligence, combining current Lockwood & Carter projects with newly uploaded opportunities.
          </p>
        </header>

        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`border px-4 py-2 text-sm font-semibold transition-colors ${
                activeFilter === filter.id
                  ? 'border-[#122238] bg-[#122238] text-white'
                  : 'border-[#E6DED0] bg-white text-[#292B2D]/75 hover:border-[#B49A68] hover:text-[#122238]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleProperties.map(property => (
            <article key={property.id} className="group overflow-hidden border border-[#E6DED0] bg-white">
              <button type="button" onClick={() => openProperty(property)} className="block w-full text-left">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101820]/75 to-transparent p-5">
                    <p className="text-xl font-semibold text-white">{property.price ? formatAed(property.price) : 'Ask advisor'}</p>
                    <p className="text-sm text-white/75">{property.location}</p>
                  </div>
                  <span className="absolute left-4 top-4 bg-[#F5F0E6] px-3 py-1.5 text-xs font-semibold text-[#122238]">
                    {property.status}
                  </span>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl font-normal text-[#122238]">{property.title}</h2>
                      <p className="mt-1 text-sm text-[#292B2D]/60">{property.developer}</p>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 text-[#6F5A35] transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-[#292B2D]/70">{property.description}</p>
                  <div className="grid grid-cols-2 gap-3 border-y border-[#E6DED0] py-4 text-sm text-[#292B2D]/75 sm:grid-cols-4">
                    <span className="inline-flex items-center gap-1"><Bed className="h-4 w-4" />{property.beds}</span>
                    <span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" />{property.baths}</span>
                    <span className="inline-flex items-center gap-1"><Maximize className="h-4 w-4" />{property.area ? `${property.area} sqft` : 'Ask'}</span>
                    <span className="inline-flex items-center gap-1"><CreditCard className="h-4 w-4" />{property.paymentPlan}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-[#292B2D]/65">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{property.location}</span>
                    <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{property.propertyType || 'Property'}</span>
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
