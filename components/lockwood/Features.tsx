
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Key, Mic, Map as MapIcon, BarChart3, ArrowRight } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface FeaturesProps {
  onNavigate: (page: Page) => void;
}

export const Features: React.FC<FeaturesProps> = ({ onNavigate }) => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-white relative overflow-hidden" id="features">
        
        <div className="container mx-auto px-4 relative z-10">
        
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-lc-navy mb-6">Our Agency Services</h2>
          <p className="text-gray-500 text-xl max-w-3xl mx-auto font-light">
            Unrivaled expertise in the Dubai property market, supported by data-driven intelligence for the sophisticated investor.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Card 1: Off-Plan */}
          <div className="group bg-gray-50 rounded-3xl p-10 border border-gray-100 hover:border-lc-gold/50 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl">
            <div className="w-20 h-20 rounded-2xl bg-lc-navy text-lc-gold flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Building2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-lc-navy mb-4">Off-Plan Investment Specialists</h3>
             <p className="text-gray-500 leading-relaxed mb-8">
               Gain exclusive first-access to Dubai's most anticipated launches. We secure prime units with high capital appreciation potential before they hit the open market.
             </p>
             <button 
                onClick={() => navigate('/projects#off-plan')}
                className="flex items-center gap-2 text-lc-navy font-bold hover:text-lc-gold transition-colors"
             >
                View Off-Plan <ArrowRight size={18} />
             </button>
          </div>

          {/* Card 2: Luxury Ready */}
          <div className="group bg-gray-50 rounded-3xl p-10 border border-gray-100 hover:border-lc-gold/50 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl">
             <div className="w-20 h-20 rounded-2xl bg-lc-navy text-lc-gold flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Key size={36} />
             </div>
             
             <h3 className="text-2xl font-bold text-lc-navy mb-4">Luxury Property Brokerage</h3>
             <p className="text-gray-500 leading-relaxed mb-8">
               Bespoke brokerage for move-in ready villas, penthouses, and mansions. Our team handles the entire lifecycle, from private tours to DLD transfer.
             </p>
             <button 
                onClick={() => navigate('/projects#ready')}
                className="flex items-center gap-2 text-lc-navy font-bold hover:text-lc-gold transition-colors"
             >
                View Ready Assets <ArrowRight size={18} />
             </button>
          </div>

          {/* Card 3: Intelligence */}
          <div className="group bg-gray-50 rounded-3xl p-10 border border-gray-100 hover:border-lc-gold/50 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl">
             <div className="w-20 h-20 rounded-2xl bg-lc-navy text-lc-gold flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 size={36} />
             </div>

             <h3 className="text-2xl font-bold text-lc-navy mb-4">Strategic Portfolio Intelligence</h3>
             <div className="mb-4">
                <span className="bg-lc-gold/10 text-lc-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-lc-gold/20">AI Enhanced</span>
             </div>
             <p className="text-gray-500 leading-relaxed mb-8">
               Make decisions based on real-time transaction data and ROI projections. We provide detailed market analysis to ensure your portfolio outperforms the index.
             </p>
             <button
                onClick={() => onNavigate('LOGIN')}
                className="flex items-center gap-2 text-lc-navy font-bold hover:text-lc-gold transition-colors"
             >
                Get Insights <ArrowRight size={18} />
             </button>
          </div>

        </div>

      </div>
    </section>
  );
};
