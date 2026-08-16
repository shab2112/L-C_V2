
import React from 'react';
import { Star, Award, Users, Sparkles } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface AboutProps {
  onNavigate?: (page: Page) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <section className="bg-white py-24 sm:py-28" id="about">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D2636] mb-4">The advisory difference</p>
            <h2 className="mb-6 font-serif text-4xl font-normal leading-tight text-[#122238] md:text-6xl">Lockwood & Carter Real Estate</h2>
            
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-[#292B2D]/75">
              Premier real estate consultancy in Dubai, combining decades of market expertise with cutting-edge AI technology to revolutionize property discovery.
            </p>

            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex min-h-20 items-start gap-3 border border-[#E6DED0] bg-[#F5F0E6] p-4">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-white text-[#6F5A35]"><Star size={20}/></div>
                 <div>
                   <h4 className="text-sm font-bold text-[#122238]">Award winning</h4>
                   <p className="text-xs text-[#292B2D]/60">Expertise</p>
                 </div>
              </div>
              <div className="flex min-h-20 items-start gap-3 border border-[#E6DED0] bg-[#F5F0E6] p-4">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-white text-[#6F5A35]"><Users size={20}/></div>
                 <div>
                   <h4 className="text-sm font-bold text-[#122238]">1000+ Happy</h4>
                   <p className="text-xs text-[#292B2D]/60">Clients</p>
                 </div>
              </div>
               <div className="flex min-h-20 items-start gap-3 border border-[#E6DED0] bg-[#F5F0E6] p-4">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-white text-[#6F5A35]"><Award size={20}/></div>
                 <div>
                   <h4 className="text-sm font-bold text-[#122238]">60+ Developer</h4>
                   <p className="text-xs text-[#292B2D]/60">Partnerships</p>
                 </div>
              </div>
               <div className="flex min-h-20 items-start gap-3 border border-[#E6DED0] bg-[#F5F0E6] p-4">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-white text-[#6F5A35]"><Sparkles size={20}/></div>
                 <div>
                   <h4 className="text-sm font-bold text-[#122238]">Advisor tools</h4>
                   <p className="text-xs text-[#292B2D]/60">Supported by data</p>
                 </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate?.('ABOUT_US')}
              className="inline-flex min-h-12 items-center rounded-[2px] bg-[#122238] px-8 py-3 font-bold text-white transition-colors hover:bg-[#1D334E]"
            >
              Learn More About Us
            </button>
          </div>

          <div className="relative">
             <img 
               src="/lockwood-assets/general/pexels-ahmetcotur-31817155_optimized_5000.jpg" 
               alt="Luxury Interior" 
               className="h-[360px] w-full rounded-[4px] border border-[#E6DED0] object-cover shadow-xl sm:h-[460px] lg:h-[560px]"
             />
             <div className="mt-4 border border-[#E6DED0] bg-[#F5F0E6] p-5 shadow-xl md:absolute md:-bottom-6 md:-left-6 md:mt-0 md:max-w-xs md:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-[#122238] text-xl font-bold text-[#F5F0E6]">
                    98%
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#122238]">Client Satisfaction</p>
                    <p className="text-xs text-[#292B2D]/60">Based on recent feedback</p>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};
