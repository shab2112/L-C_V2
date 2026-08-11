import React from 'react';

export const CTA: React.FC = () => {
  return (
    <section className="py-24 bg-[#020617] border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Tile 1 */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-10 text-center shadow-xl hover:border-lc-gold/30 transition-all duration-300 group hover:-translate-y-1">
              <h3 className="text-5xl font-bold text-lc-gold mb-4 group-hover:scale-110 transition-transform duration-300">15K+</h3>
              <p className="text-slate-300 text-lg font-medium">Properties Analyzed</p>
            </div>

            {/* Tile 2 */}
             <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-10 text-center shadow-xl hover:border-lc-gold/30 transition-all duration-300 group hover:-translate-y-1">
              <h3 className="text-5xl font-bold text-lc-gold mb-4 group-hover:scale-110 transition-transform duration-300">24/7</h3>
              <p className="text-slate-300 text-lg font-medium">AI Assistant Available</p>
            </div>

            {/* Tile 3 */}
             <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-10 text-center shadow-xl hover:border-lc-gold/30 transition-all duration-300 group hover:-translate-y-1">
              <h3 className="text-5xl font-bold text-lc-gold mb-4 group-hover:scale-110 transition-transform duration-300">3x</h3>
              <p className="text-slate-300 text-lg font-medium">Faster Property Discovery</p>
            </div>

        </div>
      </div>
    </section>
  );
};