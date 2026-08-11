
import React from 'react';
import { Star, Award, Users, Sparkles } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface AboutProps {
  onNavigate?: (page: Page) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <section className="py-20 bg-[#0a192f]" id="about">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Lockwood & Carter</h2>
            <h3 className="text-3xl font-bold text-lc-gold mb-6">Real Estate</h3>
            
            <p className="text-slate-300 mb-8 leading-relaxed">
              Premier real estate consultancy in Dubai, combining decades of market expertise with cutting-edge AI technology to revolutionize property discovery.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                 <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-lc-gold"><Star size={20}/></div>
                 <div>
                   <h4 className="font-bold text-white text-sm">Award winning</h4>
                   <p className="text-xs text-slate-400">Expertise</p>
                 </div>
              </div>
              <div className="flex items-start gap-3">
                 <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-lc-gold"><Users size={20}/></div>
                 <div>
                   <h4 className="font-bold text-white text-sm">1000+ Happy</h4>
                   <p className="text-xs text-slate-400">Clients</p>
                 </div>
              </div>
               <div className="flex items-start gap-3">
                 <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-lc-gold"><Award size={20}/></div>
                 <div>
                   <h4 className="font-bold text-white text-sm">60+ Developer</h4>
                   <p className="text-xs text-slate-400">Partnerships</p>
                 </div>
              </div>
               <div className="flex items-start gap-3">
                 <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-lc-gold"><Sparkles size={20}/></div>
                 <div>
                   <h4 className="font-bold text-white text-sm">AI Powered</h4>
                   <p className="text-xs text-slate-400">Innovation</p>
                 </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate?.('ABOUT_US')}
              className="bg-lc-gold hover:bg-lc-goldHover text-white px-8 py-3 rounded-lg font-bold transition-all"
            >
              Learn More About Us
            </button>
          </div>

          <div className="relative">
             <img 
               src="/lockwood-assets/general/pexels-ahmetcotur-31817155_optimized_5000.jpg" 
               alt="Luxury Interior" 
               className="rounded-3xl shadow-2xl object-cover h-[400px] w-full border border-white/10"
             />
             <div className="absolute -bottom-6 -left-6 bg-[#112240] p-6 rounded-xl shadow-xl max-w-xs hidden md:block border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-lc-navy border border-white/10 rounded-full flex items-center justify-center text-lc-gold font-bold text-xl">
                    98%
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Client Satisfaction</p>
                    <p className="text-xs text-slate-400">Based on recent feedback</p>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};
