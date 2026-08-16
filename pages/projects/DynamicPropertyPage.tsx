import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, CreditCard, MapPin, Ruler } from 'lucide-react';
import { Navbar } from '../../components/lockwood/Navbar';
import { Footer } from '../../components/lockwood/Footer';
import { getPropertyById, FeaturedProperty, formatAed } from '../../lib/propertyIntelligenceStore';
import { Page } from '../../lockwood-types';

const DynamicPropertyPage: React.FC = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<FeaturedProperty | null>(null);

  useEffect(() => {
    if (propertyId) {
      setProperty(getPropertyById(propertyId) || null);
    }
  }, [propertyId]);

  const handleNavigation = (page: Page) => {
    switch (page) {
      case 'LOGIN':
        navigate('/auth/login');
        break;
      case 'REGISTER':
        navigate('/auth/signup');
        break;
      case 'PROJECTS':
        navigate('/projects');
        break;
      case 'ABOUT_US':
        navigate('/about');
        break;
      case 'BLOGS':
        navigate('/blogs');
        break;
      case 'CONTACT_US':
        navigate('/contact');
        break;
      case 'PRIVACY_POLICY':
        navigate('/privacy');
        break;
      case 'HOME':
        navigate('/');
        break;
      default:
        navigate('/projects');
    }
  };

  if (!property) {
    return (
      <>
        <Navbar onNavigate={handleNavigation} currentPage="PROJECTS" />
        <main className="min-h-screen bg-[#F5F0E6] px-6 py-40 text-center text-[#122238]">
          <h1 className="font-serif text-4xl font-normal">Property not found</h1>
          <button className="mt-8 border border-[#122238] px-6 py-3 text-sm font-semibold" onClick={() => navigate('/projects')}>
            Back to properties
          </button>
        </main>
        <Footer onNavigate={handleNavigation} />
      </>
    );
  }

  return (
    <>
      <Navbar onNavigate={handleNavigation} currentPage="PROJECTS" />
      <main className="bg-[#F5F0E6] text-[#122238]">
        <section className="relative min-h-[78vh] overflow-hidden pt-32">
          <img src={property.imageUrl} alt={property.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,24,32,0.82)_0%,rgba(16,24,32,0.56)_42%,rgba(16,24,32,0.08)_100%),linear-gradient(180deg,rgba(16,24,32,0)_0%,rgba(16,24,32,0.55)_100%)]" />
          <div className="container relative z-10 mx-auto flex min-h-[calc(78vh-8rem)] items-end px-4 pb-16">
            <div className="max-w-3xl text-white">
              <button onClick={() => navigate('/projects')} className="mb-8 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to all properties
              </button>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#B49A68]">{property.status}</p>
              <h1 className="font-serif text-5xl font-normal leading-tight md:text-7xl">{property.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">{property.description}</p>
            </div>
          </div>
        </section>

        <section className="border-b border-[#E6DED0] bg-white py-8">
          <div className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-5">
            {[
              { icon: MapPin, label: 'Location', value: property.location },
              { icon: Building2, label: 'Developer', value: property.developer },
              { icon: CreditCard, label: 'From', value: property.price ? formatAed(property.price) : 'Ask advisor' },
              { icon: Calendar, label: 'Handover', value: property.completionDate || 'Ask advisor' },
              { icon: Ruler, label: 'Type', value: property.propertyType || `${property.beds} beds` },
            ].map(item => (
              <div key={item.label} className="border-l border-[#E6DED0] pl-4">
                <item.icon className="mb-3 h-5 w-5 text-[#6F5A35]" />
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#292B2D]/50">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#122238]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto grid grid-cols-1 gap-12 px-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#6D2636]">Project story</p>
              <h2 className="mb-6 font-serif text-4xl font-normal leading-tight text-[#122238]">A considered opportunity in {property.location.split(',')[0]}.</h2>
              <p className="text-lg leading-relaxed text-[#292B2D]/75">{property.investmentCase || property.description}</p>
              {property.sourceLabel && (
                <p className="mt-6 border-l border-[#B49A68] pl-4 text-sm leading-relaxed text-[#292B2D]/60">
                  {property.sourceLabel}. Pricing, payment plans and availability should be reconfirmed before reservation.
                </p>
              )}
            </div>

            <div className="bg-white p-8">
              <h3 className="mb-6 font-serif text-2xl font-normal text-[#122238]">Key points</h3>
              <div className="space-y-4">
                {(property.amenities || ['Advisor review', 'Availability check', 'Payment-plan discussion']).map(item => (
                  <div key={item} className="border-b border-[#E6DED0] pb-4 text-[#292B2D]/75">
                    {item}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="mt-8 w-full bg-[#122238] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D334E]"
              >
                Consult an Advisor
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer onNavigate={handleNavigation} />
    </>
  );
};

export default DynamicPropertyPage;
