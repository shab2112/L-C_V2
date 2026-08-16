import React from 'react';

export const CTA: React.FC = () => {
  return (
    <section className="border-t border-[#B49A68]/20 bg-[#122238] py-24 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B49A68] mb-4">Market briefing</p>
          <h2 className="max-w-3xl font-serif text-3xl font-normal leading-tight text-white md:text-5xl">Clearer decisions, grounded in Dubai market context.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[#F5F0E6]/70">
            Practical intelligence for comparing price, yield, location, and holding strategy before you commit.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl gap-px bg-[#B49A68]/30 md:grid-cols-3">
            
            {/* Tile 1 */}
            <div className="bg-[#122238] p-8 text-left lg:p-10">
              <h3 className="mb-4 text-5xl font-bold text-[#F5F0E6]">15K+</h3>
              <p className="text-lg font-medium text-white/80">Properties analysed</p>
            </div>

            {/* Tile 2 */}
             <div className="bg-[#122238] p-8 text-left lg:p-10">
              <h3 className="mb-4 text-5xl font-bold text-[#F5F0E6]">24/7</h3>
              <p className="text-lg font-medium text-white/80">Discovery support available</p>
            </div>

            {/* Tile 3 */}
             <div className="bg-[#122238] p-8 text-left lg:p-10">
              <h3 className="mb-4 text-5xl font-bold text-[#F5F0E6]">3x</h3>
              <p className="text-lg font-medium text-white/80">Faster property discovery</p>
            </div>

        </div>
      </div>
    </section>
  );
};
