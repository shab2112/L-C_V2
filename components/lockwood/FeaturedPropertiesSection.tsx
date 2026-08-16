import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bath, Bed, Building2, MapPin, Maximize } from 'lucide-react';
import { FeaturedProperty, formatAed, getFeaturedProperties } from '../../lib/propertyIntelligenceStore';
import { Page } from '../../lockwood-types';

interface FeaturedPropertiesSectionProps {
  onNavigate: (page: Page) => void;
}

const tabs = [
  { id: 'off-plan', label: 'Off-Plan', statuses: ['Off-Plan', 'New Launch'] },
  { id: 'ready', label: 'Buy Ready', statuses: ['Ready'] },
  { id: 'rent', label: 'Rent Luxury', statuses: ['Rent'] },
];

export const FeaturedPropertiesSection: React.FC<FeaturedPropertiesSectionProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [activeTab, setActiveTab] = useState('off-plan');

  useEffect(() => {
    const load = () => setProperties(getFeaturedProperties());
    load();
    window.addEventListener('lc-property-intelligence-updated', load);
    return () => window.removeEventListener('lc-property-intelligence-updated', load);
  }, []);

  const visibleProperties = useMemo(() => {
    const activeStatuses = tabs.find(tab => tab.id === activeTab)?.statuses || [];
    return properties
      .filter(property => property.featured && activeStatuses.includes(property.status))
      .slice(0, 4);
  }, [activeTab, properties]);

  return (
    <section className="bg-white py-24 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#6D2636]">Featured Properties</p>
            <h2 className="font-serif text-4xl font-normal leading-tight text-[#122238] md:text-6xl">
              Curated listings.
            </h2>
            <div className="mt-8 h-px w-24 bg-[#B49A68]" />
          </div>
          <div className="inline-flex w-full max-w-full overflow-x-auto border border-[#E6DED0] bg-[#F5F0E6] p-1 sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-11 flex-1 whitespace-nowrap px-5 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${
                  activeTab === tab.id
                    ? 'bg-[#122238] text-white'
                    : 'text-[#292B2D]/70 hover:text-[#122238]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleProperties.map(property => {
            const pricePerSqft = property.price && property.area ? `${Math.round(property.price / property.area).toLocaleString()} AED / sqft` : 'Pricing on request';
            return (
            <article
              key={property.id}
              className="group flex h-full cursor-pointer flex-col overflow-hidden border border-[#E6DED0] bg-[#F5F0E6] transition-colors hover:border-[#B49A68]/70"
              onClick={() => navigate(property.routePath || `/projects/${property.id}`)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101820]/75 to-transparent p-5">
                  <p className="text-lg font-semibold text-white">{property.price ? formatAed(property.price) : 'Ask advisor'}</p>
                  <p className="text-sm text-white/75">{pricePerSqft}</p>
                </div>
                <span className="absolute left-4 top-4 bg-[#F5F0E6] px-3 py-1.5 text-xs font-semibold text-[#122238]">
                  {property.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 font-serif text-xl font-normal text-[#122238]">{property.title}</h3>
                <div className="mb-4 flex min-h-10 items-start gap-1 text-sm text-[#292B2D]/65">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-3 text-sm text-[#292B2D]/75">
                  <span className="inline-flex items-center gap-1"><Bed className="h-4 w-4" />{property.beds}</span>
                  <span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" />{property.baths}</span>
                  <span className="inline-flex items-center gap-1"><Maximize className="h-4 w-4" />{property.area ? `${property.area} sqft` : 'Ask'}</span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#E6DED0] pt-4 text-sm">
                  <span className="inline-flex items-center gap-1 text-[#292B2D]/65">
                    <Building2 className="h-4 w-4" />
                    {property.developer}
                  </span>
                  <span className="font-semibold text-[#6F5A35]">{property.paymentPlan}</span>
                </div>
              </div>
            </article>
          );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => onNavigate('PROJECTS')}
            className="inline-flex items-center gap-2 border border-[#122238] px-6 py-3 text-sm font-semibold text-[#122238] transition-colors hover:bg-[#122238] hover:text-white"
          >
            View All Properties
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
