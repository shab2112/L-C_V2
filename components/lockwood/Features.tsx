
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
    <section className="relative overflow-hidden bg-[#F5F0E6] py-24 sm:py-28" id="features">
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-14 max-w-3xl lg:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#6D2636]">Advisory services</p>
          <h2 className="mb-6 font-serif text-4xl font-normal leading-tight text-[#122238] md:text-6xl">Our Agency Services</h2>
          <p className="max-w-2xl text-lg font-normal leading-relaxed text-[#292B2D]/75 md:text-xl">
            Unrivaled expertise in the Dubai property market, supported by data-driven intelligence for the sophisticated investor.
          </p>
          <div className="mt-8 h-px w-24 bg-[#B49A68]" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Off-Plan */}
          <div className="group flex min-h-[360px] flex-col border border-[#E6DED0] bg-white p-8 shadow-sm transition-colors duration-300 hover:border-[#B49A68]/70 lg:p-10">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[2px] bg-[#122238] text-[#B49A68]">
                <Building2 size={28} />
            </div>
            <h3 className="mb-4 font-serif text-2xl font-normal leading-snug text-[#122238]">Off-Plan Investment Specialists</h3>
             <p className="mb-8 text-[#292B2D]/70 leading-relaxed">
               Gain exclusive first-access to Dubai's most anticipated launches. We secure prime units with high capital appreciation potential before they hit the open market.
             </p>
             <button 
                onClick={() => navigate('/projects#off-plan')}
                className="mt-auto flex min-h-11 items-center gap-2 text-[#122238] font-bold transition-colors hover:text-[#6D2636]"
             >
                View Off-Plan <ArrowRight size={18} />
             </button>
          </div>

          {/* Card 2: Luxury Ready */}
          <div className="group flex min-h-[360px] flex-col border border-[#E6DED0] bg-white p-8 shadow-sm transition-colors duration-300 hover:border-[#B49A68]/70 lg:p-10">
             <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[2px] bg-[#122238] text-[#B49A68]">
                <Key size={28} />
             </div>
             
             <h3 className="mb-4 font-serif text-2xl font-normal leading-snug text-[#122238]">Luxury Property Brokerage</h3>
             <p className="mb-8 text-[#292B2D]/70 leading-relaxed">
               Bespoke brokerage for move-in ready villas, penthouses, and mansions. Our team handles the entire lifecycle, from private tours to DLD transfer.
             </p>
             <button 
                onClick={() => navigate('/projects#ready')}
                className="mt-auto flex min-h-11 items-center gap-2 text-[#122238] font-bold transition-colors hover:text-[#6D2636]"
             >
                View Ready Assets <ArrowRight size={18} />
             </button>
          </div>

          {/* Card 3: Intelligence */}
          <div className="group flex min-h-[360px] flex-col border border-[#E6DED0] bg-white p-8 shadow-sm transition-colors duration-300 hover:border-[#B49A68]/70 lg:p-10">
             <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-[2px] bg-[#122238] text-[#B49A68]">
                <BarChart3 size={28} />
             </div>

             <h3 className="mb-4 font-serif text-2xl font-normal leading-snug text-[#122238]">Strategic Portfolio Intelligence</h3>
             <div className="mb-4">
                <span className="text-[#6F5A35] text-[10px] font-bold uppercase tracking-widest border-l border-[#B49A68] pl-3">Advisor tools</span>
             </div>
             <p className="mb-8 text-[#292B2D]/70 leading-relaxed">
               Make decisions based on real-time transaction data and ROI projections. We provide detailed market analysis to ensure your portfolio outperforms the index.
             </p>
             <button
                onClick={() => onNavigate('LOGIN')}
                className="mt-auto flex min-h-11 items-center gap-2 text-[#122238] font-bold transition-colors hover:text-[#6D2636]"
             >
                Get Insights <ArrowRight size={18} />
             </button>
          </div>

        </div>

      </div>
    </section>
  );
};
