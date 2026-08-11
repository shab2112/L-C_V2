import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MapPin, Bed, Bath, Ruler, Building2, Trees, Key, Briefcase, Home, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface ProjectsProps {
  onNavigate: (page: Page) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ onNavigate }) => {
  const offPlanScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (offPlanScrollRef.current) {
      const { scrollLeft, clientWidth } = offPlanScrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      offPlanScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (offPlanScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = offPlanScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    // Explicitly scroll to top on mount to ensure user sees the header
    window.scrollTo(0, 0);

    // Check if there is a hash in the URL (e.g., #off-plan) and scroll to it
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Small delay to ensure the component is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }

    // Set up scroll event listener
    const scrollContainer = offPlanScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container mx-auto px-4 pt-10"> {/* Added pt-10 here for extra spacing */}

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-lc-navy mb-4">Exclusive Developments</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties across Dubai, categorized for your investment needs.
          </p>
        </div>

        {/* Off Plan Section */}
        <section id="off-plan" className="mb-24 scroll-mt-32">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-lc-gold/10 text-lc-gold rounded-lg">
                <Building2 size={24} />
              </div>
              <h2 className="text-3xl font-bold text-lc-navy">Off Plan Properties</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-lg transition-all ${
                  canScrollLeft
                    ? 'bg-lc-navy text-white hover:bg-lc-dark'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-lg transition-all ${
                  canScrollRight
                    ? 'bg-lc-navy text-white hover:bg-lc-dark'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div
            ref={offPlanScrollRef}
            className="flex gap-8 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
          >
            {/* Avior Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 min-w-[350px] md:min-w-[400px] snap-start flex-shrink-0"
              onClick={() => onNavigate('AVIOR')}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/lockwood-assets/projects\avior-by-acube_img2.jpg"
                  alt="Avior Twin Towers"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-lc-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  World Record
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">Avior</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin size={14} className="mr-1" /> Sheikh Zayed Road
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Type</p>
                    <p className="text-xl font-bold text-lc-navy">Twin Towers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Amenities</p>
                    <p className="text-sm font-bold text-lc-navy">100+</p>
                  </div>
                </div>

                <div className="flex justify-between border-t border-b border-gray-100 py-4 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <Bed size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">1 - 5 BR</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Building2 size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">Tallest Elevators</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Zap size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">Ultra Luxury</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate('AVIOR'); }}
                  className="w-full bg-lc-navy text-white py-3 rounded-lg font-medium hover:bg-lc-dark transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  View Project <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Altair 52 Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 min-w-[350px] md:min-w-[400px] snap-start flex-shrink-0"
              onClick={() => onNavigate('ALTAIR_52')}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src="https://altair52.com/wp-content/uploads/2025/06/Altair-52-project-image-7-scaled.jpg"
                  alt="Altair 52"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-lc-gold text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  New Launch
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">Altair 52</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin size={14} className="mr-1" /> Dubai South
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Starting From</p>
                    <p className="text-xl font-bold text-lc-navy">AED 650,000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Handover</p>
                    <p className="text-sm font-bold text-lc-navy">September 2027</p>
                  </div>
                </div>

                <div className="flex justify-between border-t border-b border-gray-100 py-4 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <Bed size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">Studio - 2.5BR</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Bath size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">Luxury Fit</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Ruler size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">445 - 1161 Sq.ft</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate('ALTAIR_52'); }}
                  className="w-full bg-lc-navy text-white py-3 rounded-lg font-medium hover:bg-lc-dark transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  View Project <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Shahrukhz by Danube Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 min-w-[350px] md:min-w-[400px] snap-start flex-shrink-0"
              onClick={() => onNavigate('SHAHRUKHZ')}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691b8be7d4546c251d23155e/9c236141b_3-1.jpg"
                  alt="Shahrukhz by Danube"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-black text-lc-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-lc-gold/30">
                  Premium Offices
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">Shahrukhz</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin size={14} className="mr-1" /> Sheikh Zayed Road
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payment Plan</p>
                    <p className="text-xl font-bold text-lc-navy">1% Monthly</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Handover</p>
                    <p className="text-sm font-bold text-lc-navy">Q2 2029</p>
                  </div>
                </div>

                <div className="flex justify-between border-t border-b border-gray-100 py-4 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <Briefcase size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">Office Spaces</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Building2 size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">55 Storeys</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Ruler size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">450 - 11K Sq.ft</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate('SHAHRUKHZ'); }}
                  className="w-full bg-lc-navy text-white py-3 rounded-lg font-medium hover:bg-lc-dark transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  View Project <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Masaar 3 Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 min-w-[350px] md:min-w-[400px] snap-start flex-shrink-0"
              onClick={() => onNavigate('MASAAR_3')}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src="https://masaaratsharjah.com/assets/images/banner/banner1.webp"
                  alt="Masaar 3 by Arada"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#50765D] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  New Phase
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">Masaar 3</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin size={14} className="mr-1" /> Sharjah (Suyoh)
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Starting From</p>
                    <p className="text-xl font-bold text-lc-navy">AED 1.8M</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</p>
                    <p className="text-sm font-bold text-lc-navy">Phase 1</p>
                  </div>
                </div>

                <div className="flex justify-between border-t border-b border-gray-100 py-4 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <Home size={18} className="text-[#50765D]" />
                    <span className="text-xs text-gray-600">Townhouses</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Trees size={18} className="text-[#50765D]" />
                    <span className="text-xs text-gray-600">Forest Living</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Bed size={18} className="text-[#50765D]" />
                    <span className="text-xs text-gray-600">2 - 5 Beds</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate('MASAAR_3'); }}
                  className="w-full bg-lc-navy text-white py-3 rounded-lg font-medium hover:bg-lc-dark transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  View Project <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Ready Properties Section */}
        <section id="ready" className="mb-24 scroll-mt-32">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Key size={24} />
            </div>
            <h2 className="text-3xl font-bold text-lc-navy">Ready Properties</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Artize 62 Card - Added */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100"
              onClick={() => onNavigate('ARTIZE_62')}>
              <div className="relative h-64 overflow-hidden">
                <img
                  src="/lockwood-assets/projects\artize62-poster.jpg"
                  alt="Villa Artize 62"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                  Ready To Move
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">Villa Artize 62</h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin size={14} className="mr-1" /> Al Furjan
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Plot Size</p>
                    <p className="text-xl font-bold text-lc-navy">6,578 Sq.ft</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">BUA</p>
                    <p className="text-sm font-bold text-lc-navy">7,000 Sq.ft</p>
                  </div>
                </div>

                <div className="flex justify-between border-t border-b border-gray-100 py-4 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <Bed size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">5 Ensuite BR</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Briefcase size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">Custom Build</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Zap size={18} className="text-lc-gold" />
                    <span className="text-xs text-gray-600">Smart Home</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate('ARTIZE_62'); }}
                  className="w-full bg-lc-navy text-white py-3 rounded-lg font-medium hover:bg-lc-dark transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  View Property <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Land & Plots Section */}
        <section id="plots" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <Trees size={24} />
            </div>
            <h2 className="text-3xl font-bold text-lc-navy">Land & Plots</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm col-span-full text-center py-20">
              <p className="text-gray-500 italic">Strategic land plots for mixed-use development available in JVC and Dubai Hills Estate.</p>
              <button className="mt-6 text-lc-gold font-bold hover:underline">View Plot Map</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};