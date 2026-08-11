
import React from 'react';
import { ArrowLeft, Download, MapPin, Wifi, Droplets, Car, Home, Layout, Zap, MonitorPlay, ChevronDown, CheckCircle2, Ruler } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface Artize62Props {
   onNavigate: (page: Page) => void;
}

export const Artize62: React.FC<Artize62Props> = ({ onNavigate }) => {
   const handleWhatsApp = () => {
      const message = encodeURIComponent("Hi, I am interested in viewing Villa Artize 62 in Al Furjan. Please schedule a private tour.");
      window.open(`https://wa.me/971564144401?text=${message}`, '_blank');
   };

   // Scroll to top on mount to ensure correct view
   React.useEffect(() => {
      window.scrollTo(0, 0);
   }, []);

   const scrollToDetails = () => {
      const element = document.getElementById('property-details');
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
      }
   };

   // Custom Icon Helpers
   const Elevator = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /><path d="M12 7v10" /><path d="M8 10l-2 2 2 2" /><path d="M16 10l2 2-2 2" /></svg>
   );

   return (
      <div className="bg-white font-sans text-gray-900">
         {/* Hero Video Section */}
         <section className="relative min-h-screen flex flex-col justify-center pt-32 overflow-hidden">
            <div className="absolute inset-0">
               <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-105"
                  poster="/assets/projects/artize62-poster6.jpg"
               >
                  <source src="/lockwood-assets/projects/artize62.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
               </video>
               {/* Cinematic Gradient: Darker vignette, clear center for video */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center pt-8">
               <div className="flex justify-start mb-8">
                  <button
                     onClick={() => onNavigate('PROJECTS')}
                     className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-full backdrop-blur-md text-sm font-medium hover:scale-105 group"
                  >
                     <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
                  </button>
               </div>

               <div className="inline-flex items-center gap-3 border border-white/20 bg-white/5 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold uppercase tracking-widest mb-10 shadow-lg cursor-default hover:bg-white/10 transition-colors">
                  <span className="text-lc-gold drop-shadow-sm">Ready To Move</span>
                  <span className="w-1 h-1 rounded-full bg-white/50"></span>
                  <span>Al Furjan</span>
                  <span className="w-1 h-1 rounded-full bg-white/50"></span>
                  <span className="text-gray-300">Brand New Custom Build</span>
               </div>

               <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 font-serif tracking-tight drop-shadow-2xl">
                  VILLA ARTIZE <span className="text-lc-gold font-light italic">62</span>
               </h1>

               <p className="text-xl md:text-3xl text-white/90 max-w-4xl mx-auto mb-14 font-light leading-relaxed drop-shadow-lg">
                  A Masterpiece of Modern Living.<br className="hidden md:block" />
                  <span className="italic text-gray-300">7,000 Sq.ft of Italian Marble & German Engineering.</span>
               </p>

               <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button
                     onClick={handleWhatsApp}
                     className="bg-gradient-to-r from-lc-gold to-yellow-600 hover:to-yellow-500 text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl shadow-lc-gold/20 tracking-wide flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                     Book Private Viewing
                  </button>
                  <button
                     onClick={scrollToDetails}
                     className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-3 hover:border-white/50"
                  >
                     Explore Features <ChevronDown size={20} className="animate-bounce mt-1" />
                  </button>
               </div>
            </div>

            {/* Brand Watermark Overlay */}
            <div className="absolute bottom-8 right-8 z-20 opacity-90 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl hidden md:block">
               <div className="flex items-center gap-3">
                  <img
                     src="/lockwood-assets/general/logo.png"
                     alt="Lockwood & Carter"
                     className="h-14 w-auto object-contain brightness-0 invert opacity-90"
                  />
                  <span className="font-script text-3xl text-white/90 tracking-wide" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                     Lockwood & Carter
                  </span>
               </div>
               <p className="text-[9px] text-lc-gold text-center mt-2 tracking-[0.2em] uppercase font-bold">Exclusive Listing</p>
            </div>


         </section>

         {/* Quick Specs */}
         <section className="bg-lc-navy py-10 border-b border-white/10" id="property-details">
            <div className="container mx-auto px-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                  <div>
                     <p className="text-lc-gold text-sm uppercase tracking-widest mb-1">Built Up Area</p>
                     <p className="text-3xl font-bold text-white">7,000 <span className="text-lg font-normal text-gray-400">Sq.ft</span></p>
                  </div>
                  <div>
                     <p className="text-lc-gold text-sm uppercase tracking-widest mb-1">Plot Size</p>
                     <p className="text-3xl font-bold text-white">6,578 <span className="text-lg font-normal text-gray-400">Sq.ft</span></p>
                  </div>
                  <div>
                     <p className="text-lc-gold text-sm uppercase tracking-widest mb-1">Configuration</p>
                     <p className="text-3xl font-bold text-white">5 BR <span className="text-lg font-normal text-gray-400">+ Maid + Driver</span></p>
                  </div>
                  <div>
                     <p className="text-lc-gold text-sm uppercase tracking-widest mb-1">Location</p>
                     <p className="text-3xl font-bold text-white">Al Furjan</p>
                  </div>
               </div>
            </div>
         </section>

         {/* Introduction */}
         <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
               <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                     <h2 className="text-4xl md:text-5xl font-serif font-bold text-lc-navy leading-tight">
                        Uncompromising Luxury<br />
                        <span className="text-lc-gold">In Every Detail</span>
                     </h2>
                     <p className="text-gray-600 leading-relaxed text-lg">
                        Villa Artize 62 represents the pinnacle of custom villa development in Dubai. Every inch of this 7,000 Sq.ft mansion has been curated with European precision, featuring Italian Marble cladding, German smart home automation, and Villeroy & Boch fittings.
                     </p>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-gray-100 rounded-lg text-lc-gold"><Layout size={24} /></div>
                           <div>
                              <h4 className="font-bold text-gray-900">Double Height</h4>
                              <p className="text-sm text-gray-500">Grand living area ceilings</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-gray-100 rounded-lg text-lc-gold"><Droplets size={24} /></div>
                           <div>
                              <h4 className="font-bold text-gray-900">Overflow Pool</h4>
                              <p className="text-sm text-gray-500">With waterfall feature</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-gray-100 rounded-lg text-lc-gold"><Elevator /></div>
                           <div>
                              <h4 className="font-bold text-gray-900">Private Elevator</h4>
                              <p className="text-sm text-gray-500">Serving all floors</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-gray-100 rounded-lg text-lc-gold"><Wifi size={24} /></div>
                           <div>
                              <h4 className="font-bold text-gray-900">Zennio Automation</h4>
                              <p className="text-sm text-gray-500">Full smart home control</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
                     <img
                        src="/lockwood-assets/projects\artize62-poster8.jpg"
                        alt="Villa Exterior"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     />
                     <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-6 rounded-xl border-l-4 border-lc-gold max-w-xs shadow-lg">
                        <p className="font-serif italic text-lc-navy">"Stunning Villa with 5 Luxurious Ensuite Bedrooms and attached terraces."</p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Detailed Features List */}
         <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-lc-navy mb-4">Premium Specifications</h2>
                  <div className="w-24 h-1 bg-lc-gold mx-auto"></div>
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                  {/* Ground Floor */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                     <h3 className="text-xl font-bold text-lc-navy mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-lc-gold text-white flex items-center justify-center text-sm">GF</span> Ground Floor
                     </h3>
                     <ul className="space-y-4">
                        {['Spacious Double Height Living Area', 'Private Elevator', '2 Fully Furnished Kitchens (Show + Grease)', 'Formal Dining Area', 'Guest Bedroom Ensuite', 'Powder Room (Tiara Artize Basins)'].map((item, i) => (
                           <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                              <CheckCircle2 size={16} className="text-lc-gold mt-0.5 flex-shrink-0" />
                              {item}
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* First Floor */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                     <h3 className="text-xl font-bold text-lc-navy mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-lc-gold text-white flex items-center justify-center text-sm">1F</span> First Floor
                     </h3>
                     <ul className="space-y-4">
                        {['Family Room with Landscape View', 'Master Bedroom with Walk-in Wardrobe', 'Freestanding Bathtub & Rain Shower', '3 Additional Ensuite Bedrooms', 'Built-in Closets', 'Smart Climate Control'].map((item, i) => (
                           <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                              <CheckCircle2 size={16} className="text-lc-gold mt-0.5 flex-shrink-0" />
                              {item}
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* Exterior & Tech */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                     <h3 className="text-xl font-bold text-lc-navy mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-lc-gold text-white flex items-center justify-center text-sm">EXT</span> Exterior & Tech
                     </h3>
                     <ul className="space-y-4">
                        {['Private Pool with Waterfalls', 'Outdoor Shower Area', 'Barbeque Area', 'Automated Curtain System', 'Indoor/Outdoor Surround Sound', '2 Car Automatic Garage'].map((item, i) => (
                           <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                              <CheckCircle2 size={16} className="text-lc-gold mt-0.5 flex-shrink-0" />
                              {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </section>

         {/* Gallery Grid */}
         <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
               <h2 className="text-3xl font-bold text-lc-navy mb-12 text-center">Gallery</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[800px] md:h-[600px]">
                  {/* Large Item */}
                  <div className="md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden relative group">
                     <img src="/lockwood-assets/projects\artize62-poster6.jpg" alt="Living Room" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                     <div className="absolute bottom-4 left-4 text-white font-bold bg-black/50 px-3 py-1 rounded-md backdrop-blur-md">Grand Living Area</div>
                  </div>

                  {/* Side Items */}
                  <div className="rounded-2xl overflow-hidden relative group">
                     <img src="/lockwood-assets/projects\artize62-poster10.jpg" alt="Pool" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     <div className="absolute bottom-4 left-4 text-white font-bold bg-black/50 px-3 py-1 rounded-md backdrop-blur-md">Swimming Pool</div>
                  </div>
                  <div className="rounded-2xl overflow-hidden relative group">
                     <img src="/lockwood-assets/projects\artize62-poster3.jpg" alt="Kitchen" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     <div className="absolute bottom-4 left-4 text-white font-bold bg-black/50 px-3 py-1 rounded-md backdrop-blur-md">German Kitchen</div>
                  </div>
               </div>
            </div>
         </section>

         {/* Location Map Placeholder */}
         <section className="h-[400px] relative bg-gray-200">
            <img src="/lockwood-assets/projects\artize62-poster.jpg" alt="Location Map" className="w-full h-full object-cover grayscale opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center bg-lc-navy/30">
               <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
                  <MapPin size={40} className="text-lc-gold mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-lc-navy mb-2">Jabal Ali First, Al Furjan</h3>
                  <p className="text-gray-600 mb-4">Prime location with easy access to Sheikh Zayed Road and Metro.</p>
                  <button onClick={handleWhatsApp} className="text-lc-gold font-bold hover:underline">Get Directions</button>
               </div>
            </div>
         </section>

         {/* Final CTA */}
         <section className="py-24 bg-lc-navy text-white text-center">
            <div className="container mx-auto px-4 max-w-3xl">
               <h2 className="text-4xl font-serif font-bold mb-6">Experience Villa Artize 62</h2>
               <p className="text-blue-200 mb-10 text-lg">
                  This property is ready for immediate handover. Arrange a viewing today to appreciate the quality of finishings firsthand.
               </p>
               <button
                  onClick={handleWhatsApp}
                  className="bg-lc-gold hover:bg-lc-goldHover text-white px-12 py-5 rounded-xl font-bold text-lg transition-all shadow-lg shadow-lc-gold/20"
               >
                  Schedule Viewing
               </button>
            </div>
         </section>
      </div>
   );
};
