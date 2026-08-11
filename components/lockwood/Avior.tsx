
import React, { useState } from 'react';
import { ArrowLeft, Download, MapPin, Building2, Waves, Star, ShieldCheck, Sun, Users, Activity, Droplets, Layout, Globe, ArrowRight } from 'lucide-react';
import { Page } from '../../lockwood-types';
import { InvestorDeckModal } from './InvestorDeckModal';

interface AviorProps {
   onNavigate: (page: Page) => void;
}

export const Avior: React.FC<AviorProps> = ({ onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi Lockwood & Carter, I'm interested in Avior by Acube Developments on Sheikh Zayed Road. Please provide details on the different residential levels and pricing.");
    window.open(`https://wa.me/971564144401?text=${message}`, '_blank');
  };

  const handleInvestorDeckClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white font-sans text-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/lockwood-assets/projects\avior-by-acube_img1.jpg" 
            alt="Avior Twin Towers" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lc-navy/80 via-transparent to-lc-navy"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 border border-lc-gold/30 bg-black/40 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-widest mb-8 animate-fade-in">
            <span className="text-lc-gold">World's Tallest Twin Tower</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold text-white mb-6 font-serif tracking-tighter drop-shadow-2xl">
            AVIOR
          </h1>
          
          <p className="text-2xl md:text-3xl max-w-4xl mx-auto mb-12 font-light italic leading-relaxed
  text-gray-800
  bg-gray-200/60
  px-8 py-4 rounded-xl backdrop-blur-sm">
            "A Rarified Jewel Transcending Between Earth and Sky"
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={handleWhatsApp}
              className="bg-lc-gold hover:bg-lc-goldHover text-white px-12 py-5 rounded-xl font-bold transition-all shadow-2xl shadow-lc-gold/40 text-lg group"
            >
              Request Presentation <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button
              onClick={handleInvestorDeckClick}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
            >
              <Download size={24} /> Investor Deck
            </button>
          </div>
        </div>

        <div className="absolute top-32 left-4 md:left-8 z-20">
          <button
            onClick={() => onNavigate('PROJECTS')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/40 px-5 py-2.5 rounded-full backdrop-blur-sm hover:bg-black/60 text-sm font-medium"
          >
            <ArrowLeft size={18} /> Projects
          </button>
        </div>
      </section>

      {/* World Record Section */}
      <section className="py-24 bg-lc-navy text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 text-lc-gold">World's Tallest External Elevators</h2>
            <p className="text-xl text-blue-100 leading-relaxed font-light mb-12">
              Experience vertical travel like never before. Avior's panoramic external elevators offer breathtaking, unobstructed views of the Burj Khalifa, Dubai skyline, and the Arabian Gulf as you ascend above the clouds.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-4xl font-bold text-lc-gold mb-2">100+</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Amenities</p>
               </div>
               <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-4xl font-bold text-lc-gold mb-2">360°</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Skyline Views</p>
               </div>
               <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-4xl font-bold text-lc-gold mb-2">Twin</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Record Towers</p>
               </div>
               <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-4xl font-bold text-lc-gold mb-2">SZR</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400">Elite Location</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Levels of Legacy Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-lc-navy mb-4">Levels of Legacy</h2>
            <p className="text-gray-500 uppercase tracking-widest text-sm">Four Distinctive Tiers of Unparalleled Luxury</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {[
              { 
                title: "Lumina Residences", 
                desc: "Magnificently crafted residences designed to epitomize refined elegance and modern sophistication.",
                img: "/lockwood-assets/projects/avior-by-acube_6.jpg"
              },
              { 
                title: "Solara Residences", 
                desc: "Perched high above the sky, a masterclass in refined luxury enveloped among the finest materials.",
                img: "/lockwood-assets/projects/avior-by-acube_render10.jpg"
              },
              { 
                title: "The Crown Duplexes", 
                desc: "Elegantly designed residences that elevate the art of sophisticated living with exclusive private amenities.",
                img: "/lockwood-assets/projects/avior-by-acube_render7.jpg"
              },
              { 
                title: "Signature Sky Villas", 
                desc: "Double-height lounges, private terraces with exclusive pools, and manicured gardens for the ultimate connoisseur.",
                img: "/lockwood-assets/projects/avior-by-acube_render9.jpg"
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-lc-navy via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10">
                  <h3 className="text-3xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-300 font-light leading-relaxed max-w-md">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zanza The Experience */}
      <section className="relative h-[80vh] flex items-center justify-center bg-lc-navy">
        <div className="absolute inset-0 opacity-60">
           <img src="/lockwood-assets/projects\avior-tower_render8.jpg" alt="Zanza Pool" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-lc-navy/40"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
           <h2 className="text-6xl md:text-8xl font-serif text-white mb-6">ZANZA</h2>
           <p className="text-lc-gold uppercase tracking-[0.4em] font-bold text-sm mb-12">The Experience</p>
           <p className="text-2xl text-white font-light max-w-2xl mx-auto leading-relaxed italic">
             "Beyond the Clouds – 360° Views of the Iconic Landmarks of Dubai"
           </p>
           <div className="mt-12 flex justify-center gap-10">
              <div className="text-center">
                 <Waves size={40} className="text-lc-gold mx-auto mb-4" />
                 <p className="text-white text-xs uppercase font-bold">Infinity Pool</p>
              </div>
              <div className="text-center">
                 <Star size={40} className="text-lc-gold mx-auto mb-4" />
                 <p className="text-white text-xs uppercase font-bold">Burj Views</p>
              </div>
              <div className="text-center">
                 <Activity size={40} className="text-lc-gold mx-auto mb-4" />
                 <p className="text-white text-xs uppercase font-bold">Private Sky</p>
              </div>
           </div>
        </div>
      </section>

      {/* Amenities & Tiers */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-lc-navy">Exclusive Multi-Tiered Amenities</h2>
            <div className="w-20 h-1 bg-lc-gold mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "The Aetherium", type: "Family Centric", icon: <Users />, desc: "Climbing walls, snow room, pet park, and sensory room for kids." },
              { title: "The Arena", type: "Sports & Fitness", icon: <Activity />, desc: "Net cricket, Padel, Skate park, and Indoor golf simulator." },
              { title: "La Sirena", type: "Wet Area", icon: <Droplets />, desc: "Lazy river, Beach themed pool, and Hydrotherapy spa." },
              { title: "Ciel Privé", type: "Ultra-Private", icon: <Sun />, desc: "Dedicated sky amenities reserved for premium residence owners." },
              { title: "Zanza Clubhouse", type: "Social Hub", icon: <Layout />, desc: "Networking zones, business lounges, and world-class retail utopia." },
              { title: "Bespoke Services", type: "Lifestyle Management", icon: <ShieldCheck />, desc: "Event planning, travel concierge, and personal styling experts." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-lc-gold/10 rounded-2xl flex items-center justify-center text-lc-gold mb-8 group-hover:bg-lc-gold group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h4 className="text-xs font-bold text-lc-gold uppercase tracking-widest mb-2">{item.type}</h4>
                <h3 className="text-2xl font-bold text-lc-navy mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unit Types Table */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-lc-navy rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-lc-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             
             <h2 className="text-4xl font-serif font-bold mb-12 text-center">Unit Selection</h2>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                {["1 BR", "2 BR", "3 BR", "4 BR", "5 BR"].map((unit, i) => (
                  <div key={i} className="p-8 border border-white/10 rounded-2xl hover:border-lc-gold transition-colors">
                     <p className="text-3xl font-bold text-lc-gold mb-2">{unit.split(' ')[0]}</p>
                     <p className="text-[10px] uppercase tracking-widest text-gray-400">Bedroom</p>
                  </div>
                ))}
             </div>
             <p className="text-center mt-10 text-gray-400 text-sm italic">*Duplex options available for 3BR, 4BR, and 5BR residences.</p>
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                 <MapPin size={48} className="text-lc-gold mb-6" />
                 <h3 className="text-xl font-bold text-lc-navy mb-4">Prime Location</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Located on Sheikh Zayed Road – The heart of the city, Dubai's most prestigious address with direct metro access.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                 <Building2 size={48} className="text-lc-gold mb-6" />
                 <h3 className="text-xl font-bold text-lc-navy mb-4">Ultra-Luxury Living</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Exquisite high-end finishes, integrated smart home systems, and energy-efficient building solutions.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                 <Globe size={48} className="text-lc-gold mb-6" />
                 <h3 className="text-xl font-bold text-lc-navy mb-4">Strong ROI Potential</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Positioned in one of Dubai's most lucrative markets, with high demand for landmark luxury twin-tower assets.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <img src="https://altair52.com/wp-content/uploads/2025/06/lc-logo.png" alt="L&C" className="h-20 mx-auto mb-12" />
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-lc-navy mb-8">Secure Your Place Among the Stars</h2>
          <p className="text-xl text-gray-600 mb-12 font-light">
            Register your interest today for private unit allocation and pre-launch pricing at Avior.
          </p>
          <form className="bg-gray-50 p-10 rounded-[2rem] shadow-inner border border-gray-200" onSubmit={(e) => { e.preventDefault(); handleWhatsApp(); }}>
            <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                <input type="tel" placeholder="+971" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Residence Level</label>
                <select className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold text-gray-500">
                  <option>Lumina Residences</option>
                  <option>Solara Residences</option>
                  <option>The Crown Duplexes</option>
                  <option>Signature Sky Villas</option>
                </select>
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-lc-navy text-white font-bold py-5 rounded-xl text-lg hover:bg-lc-gold transition-all shadow-xl"
            >
              Submit Registration
            </button>
          </form>
        </div>
      </section>

      <InvestorDeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectName="AVIOR"
        pdfPath="/lockwood-assets/projects/avior_investor_deck_november_2025.pdf"
      />
    </div>
  );
};