
import React from 'react';
import { ArrowLeft, Download, MapPin, Trees, Wifi, Droplets, Dumbbell, Coffee, Bike, Home, Layout, Sun, ShieldCheck, Ruler, BedDouble } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface Masaar3Props {
   onNavigate: (page: Page) => void;
}

export const Masaar3: React.FC<Masaar3Props> = ({ onNavigate }) => {
   const handleWhatsApp = () => {
      const message = encodeURIComponent("Hi Mr. Muqthar, I am interested in Masaar 3 (Phase 1) by Arada. Please provide details on availability and payment plans.");
      window.open(`https://wa.me/971564144401?text=${message}`, '_blank');
   };

   // Scroll to top on mount
   React.useEffect(() => {
      window.scrollTo(0, 0);
   }, []);

   const scrollToRegister = () => {
      const element = document.getElementById('register-interest');
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
      }
   };

   return (
      <div className="bg-white font-sans text-gray-900">
         {/* Project Hero */}
         <section className="relative min-h-[85vh] flex flex-col justify-center pt-32 overflow-hidden">
            <div className="absolute inset-0">
               {/* Nature/Forest Themed Background */}
               <img
                  src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=2500&auto=format&fit=crop"
                  alt="Masaar 3 Greenery"
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-b from-[#233329]/80 via-black/40 to-black/80"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center pt-8">
               <div className="flex justify-start mb-8">
                  <button
                     onClick={() => onNavigate('PROJECTS')}
                     className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/40 text-sm font-medium"
                  >
                     <ArrowLeft size={16} /> Back to Projects
                  </button>
               </div>

               <div className="inline-flex items-center gap-2 border border-white/30 bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-widest mb-6">
                  <span className="text-[#8FB39A]">Arada Developer</span>
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                  <span>Sharjah</span>
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                  <span>Phase 1</span>
               </div>

               <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 font-serif tracking-tight">
                  MASAAR <span className="text-[#8FB39A] font-light">3</span>
               </h1>

               <p className="text-xl md:text-3xl text-white/90 max-w-4xl mx-auto mb-12 font-light leading-relaxed">
                  "Mastering the Art of Forest Living."
               </p>

               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                     onClick={handleWhatsApp}
                     className="bg-[#50765D] hover:bg-[#3E5C48] text-white px-10 py-4 rounded-lg font-bold transition-all shadow-lg shadow-[#50765D]/20 tracking-wide"
                  >
                     Register Interest
                  </button>
                  <button
                     onClick={scrollToRegister}
                     className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-3 group"
                  >
                     <Download size={20} className="group-hover:translate-y-1 transition-transform" /> Download Brochure
                  </button>
               </div>
            </div>


         </section>

         {/* Intro / Masterplan Concept */}
         <section className="py-24 bg-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4F7F5] rounded-full -translate-y-1/2 translate-x-1/2"></div>

            <div className="container mx-auto px-4">
               <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="relative">
                     <div className="absolute -inset-4 bg-[#E3ECE6]/50 rounded-3xl transform -rotate-2"></div>
                     <img
                        src="https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop"
                        alt="Masaar Townhouse"
                        className="relative rounded-2xl shadow-2xl w-full object-cover"
                     />
                     <div className="absolute bottom-6 left-6 bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#50765D] max-w-xs">
                        <p className="font-bold text-gray-900 mb-1">50,000 Trees</p>
                        <p className="text-sm text-gray-500">A dedicated Green Spine connecting every home to nature.</p>
                     </div>
                  </div>

                  <div>
                     <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        A Sanctuary in<br />
                        <span className="text-[#50765D]">The Woods</span>
                     </h2>
                     <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                        Masaar 3 (Phase 1) introduces a lifestyle where modern architecture blends seamlessly with lush landscapes. Designed by Arada, this community focuses on active, healthy living with a massive "Green Spine" running through its core.
                     </p>

                     <div className="space-y-4">
                        {[
                           { title: "Forested Community", desc: "Seven gated districts connected by a looped woodland." },
                           { title: "Smart Homes", desc: "Every unit comes with standard smart home features." },
                           { title: "Active Lifestyle", desc: "Cycling tracks, jogging paths, and sports courts at your doorstep." }
                        ].map((item, idx) => (
                           <div key={idx} className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#E3ECE6] flex items-center justify-center text-[#50765D] flex-shrink-0 mt-1">
                                 <ShieldCheck size={20} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-900">{item.title}</h4>
                                 <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Amenities Grid */}
         <section className="py-24 bg-[#233329] text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

            <div className="container mx-auto px-4 relative z-10">
               <div className="text-center mb-16">
                  <span className="text-[#8FB39A] uppercase tracking-widest font-bold text-sm mb-2 block">Community Features</span>
                  <h2 className="text-4xl md:text-5xl font-serif">Designed for Wellness</h2>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                     { icon: <Trees size={40} />, label: "Green Spine Park" },
                     { icon: <Bike size={40} />, label: "5km Cycling Track" },
                     { icon: <Dumbbell size={40} />, label: "Football & Tennis" },
                     { icon: <Droplets size={40} />, label: "Swimming Pools" },
                     { icon: <Wifi size={40} />, label: "Smart Home Tech" },
                     { icon: <Coffee size={40} />, label: "Community Center" },
                     { icon: <Layout size={40} />, label: "Skate Park" },
                     { icon: <Sun size={40} />, label: "Family Zones" },
                  ].map((item, idx) => (
                     <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-[#50765D]/20 transition-all hover:-translate-y-2">
                        <div className="text-[#8FB39A] mb-4">{item.icon}</div>
                        <span className="text-lg font-medium">{item.label}</span>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Unit Types from Brochure */}
         <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Modern Townhouses & Villas</h2>
                  <p className="text-gray-500">Phase 1 Master Plan Configuration</p>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* 2BR Townhouse */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100">
                     <div className="h-64 overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop" alt="2BR Townhouse" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 bg-[#50765D] text-white text-xs font-bold px-3 py-1 rounded-full">Middle Unit</div>
                     </div>
                     <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">2 BR Townhouse</h3>
                        <p className="text-gray-500 text-sm mb-6">Perfect starter home for young families.</p>

                        <div className="bg-[#F4F7F5] p-4 rounded-xl mb-6">
                           <div className="flex items-center gap-2 mb-2 text-[#233329] font-bold">
                              <Ruler size={18} />
                              <span>Total Area: ~1,883 Sq. Ft.</span>
                           </div>
                           <p className="text-xs text-gray-500">Including balcony and covered parking.</p>
                        </div>

                        <ul className="space-y-3 mb-6">
                           <li className="flex items-start gap-3 text-sm text-gray-600">
                              <span className="mt-1 w-1.5 h-1.5 bg-[#50765D] rounded-full flex-shrink-0"></span>
                              <span>Ground Floor: Living/Dining + Kitchen + Maid's Room</span>
                           </li>
                           <li className="flex items-start gap-3 text-sm text-gray-600">
                              <span className="mt-1 w-1.5 h-1.5 bg-[#50765D] rounded-full flex-shrink-0"></span>
                              <span>First Floor: 2 Ensuite Bedrooms + Family Hall</span>
                           </li>
                        </ul>
                     </div>
                  </div>

                  {/* 3BR Townhouse */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border-2 border-[#50765D]/20">
                     <div className="h-64 overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" alt="3BR Townhouse" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 bg-[#50765D] text-white text-xs font-bold px-3 py-1 rounded-full">Best Seller</div>
                     </div>
                     <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">3 BR Townhouse</h3>
                        <p className="text-gray-500 text-sm mb-6">Available in Middle & Corner configurations.</p>

                        <div className="bg-[#F4F7F5] p-4 rounded-xl mb-6">
                           <div className="flex items-center gap-2 mb-2 text-[#233329] font-bold">
                              <Ruler size={18} />
                              <span>Total Area: ~2,230 Sq. Ft.</span>
                           </div>
                           <p className="text-xs text-gray-500">Expansive layout with direct park access.</p>
                        </div>

                        <ul className="space-y-3 mb-6">
                           <li className="flex items-start gap-3 text-sm text-gray-600">
                              <span className="mt-1 w-1.5 h-1.5 bg-[#50765D] rounded-full flex-shrink-0"></span>
                              <span>Closed Kitchen + Laundry/Store Room</span>
                           </li>
                           <li className="flex items-start gap-3 text-sm text-gray-600">
                              <span className="mt-1 w-1.5 h-1.5 bg-[#50765D] rounded-full flex-shrink-0"></span>
                              <span>Master Suite with Walk-in Closet & Balcony</span>
                           </li>
                        </ul>
                     </div>
                  </div>

                  {/* 4BR Townhouse/Villa */}
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100">
                     <div className="h-64 overflow-hidden relative">
                        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop" alt="4BR Villa" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">Corner / End</div>
                     </div>
                     <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">4 BR Townhouse</h3>
                        <p className="text-gray-500 text-sm mb-6">Luxury corner units with extra plot size.</p>

                        <div className="bg-[#F4F7F5] p-4 rounded-xl mb-6">
                           <div className="flex items-center gap-2 mb-2 text-[#233329] font-bold">
                              <Ruler size={18} />
                              <span>Total Area: ~2,600 Sq. Ft.</span>
                           </div>
                           <p className="text-xs text-gray-500">Includes spacious garden & majlis area.</p>
                        </div>

                        <ul className="space-y-3 mb-6">
                           <li className="flex items-start gap-3 text-sm text-gray-600">
                              <span className="mt-1 w-1.5 h-1.5 bg-[#50765D] rounded-full flex-shrink-0"></span>
                              <span>Ground Floor Guest Bedroom + Ensuite</span>
                           </li>
                           <li className="flex items-start gap-3 text-sm text-gray-600">
                              <span className="mt-1 w-1.5 h-1.5 bg-[#50765D] rounded-full flex-shrink-0"></span>
                              <span>3 Bedrooms Upstairs + Large Family Living</span>
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>

               {/* Villas specific note */}
               <div className="mt-12 bg-[#F4F7F5] rounded-2xl p-8 text-center max-w-4xl mx-auto border border-[#E3ECE6]">
                  <h3 className="text-xl font-bold text-[#2D4234] mb-2">Also Available: Signature Villas</h3>
                  <p className="text-[#3E5C48] mb-6">Limited collection of 4BR & 5BR Standalone Villas (Type 1 & Type 2) featuring private pools and premium finishes.</p>
                  <button onClick={handleWhatsApp} className="text-[#50765D] font-bold hover:underline flex items-center justify-center gap-2">
                     Inquire for Villa Availability <ArrowLeft className="rotate-180" size={16} />
                  </button>
               </div>
            </div>
         </section>

         {/* Map/Location Placeholder */}
         <section className="h-[400px] relative">
            <img src="https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?q=80&w=2000&auto=format&fit=crop" alt="Location Map" className="w-full h-full object-cover grayscale opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40">
               <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
                  <MapPin size={40} className="text-[#50765D] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Suyoh District, Sharjah</h3>
                  <p className="text-gray-600 mb-4">Strategically located with easy access to Emirates Road (E611).</p>
                  <div className="flex justify-center gap-4 text-sm font-semibold text-gray-800">
                     <span>15 Mins to Airport</span>
                     <span>•</span>
                     <span>20 Mins to Dubai</span>
                  </div>
               </div>
            </div>
         </section>

         {/* Final CTA */}
         <section className="py-24 bg-white" id="register-interest">
            <div className="container mx-auto px-4 max-w-4xl text-center">
               <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Live in the Heart of Nature</h2>
               <p className="text-xl text-gray-500 mb-10">
                  Secure your home in Masaar 3. Limited inventory available for Phase 1.
               </p>
               <form className="bg-gray-50 p-8 rounded-3xl shadow-inner border border-gray-200" onSubmit={(e) => { e.preventDefault(); handleWhatsApp(); }}>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                     <input type="text" placeholder="Full Name" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#50765D]" />
                     <input type="email" placeholder="Email Address" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#50765D]" />
                     <input type="tel" placeholder="Phone Number" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#50765D]" />
                     <select className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#50765D] text-gray-500">
                        <option>Select Property Type</option>
                        <option>2 BR Townhouse</option>
                        <option>3 BR Townhouse</option>
                        <option>4 BR Townhouse</option>
                        <option>4 BR Villa</option>
                        <option>5 BR Villa</option>
                     </select>
                  </div>
                  <button
                     type="submit"
                     className="w-full bg-[#50765D] hover:bg-[#3E5C48] text-white font-bold py-5 rounded-xl text-lg transition-all shadow-lg shadow-[#50765D]/20"
                  >
                     Request Availability
                  </button>
               </form>
            </div>
         </section>
      </div>
   );
};
