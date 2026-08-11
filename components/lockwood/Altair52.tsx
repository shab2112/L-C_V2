
import React from 'react';
import { ArrowLeft, Download, MapPin, ShieldCheck, Wifi, Waves, Dumbbell, Coffee, Plane, Leaf, TrendingUp, Globe, Clock, Sun, Film, Mountain } from 'lucide-react';
import { Page } from '../../lockwood-types';

// Helper components for icons defined locally to avoid import clutter/issues
const Smile = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
const Flag = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>;
const Activity = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const Gamepad2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="11" x2="10" y2="11" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="15" y1="12" x2="15.01" y2="12" /><line x1="18" y1="10" x2="18.01" y2="10" /><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" /></svg>;
const Zap = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const Laptop = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="20" x2="22" y2="20" /></svg>;
const Flower = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5" /><path d="M12 7.5A4.5 4.5 0 1 0 7.5 12 4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 1 0 12 7.5" /><path d="M7.5 12A4.5 4.5 0 1 1 12 7.5 4.5 4.5 0 1 1 16.5 12 4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 1 1 7.5 12" /><path d="M16.5 12A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 1 0 7.5 12 4.5 4.5 0 1 0 12 7.5 4.5 4.5 0 1 0 16.5 12" /></svg>;
const Wine = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8" /><path d="M7 10h10" /><path d="M12 15v7" /><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" /></svg>;
const Utensils = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>;

interface Altair52Props {
   onNavigate: (page: Page) => void;
}

export const Altair52: React.FC<Altair52Props> = ({ onNavigate }) => {
   const handleWhatsApp = () => {
      const message = encodeURIComponent("Hi Mr. Muqthar, I am interested in the Altair 52 project in Dubai South. Please provide more details regarding availability and payment plans.");
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
               <img
                  src="https://altair52.com/wp-content/uploads/2025/06/Altair-52-project-image-7-scaled.jpg"
                  alt="Altair 52 Exterior"
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-b from-lc-navy/50 via-lc-navy/40 to-lc-navy/90"></div>
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
                  <span className="text-lc-gold">Enhanced Lifestyle</span>
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                  <span>Dubai South Living</span>
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                  <span>By Acube</span>
               </div>

               <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 font-serif tracking-tight">
                  ALTAIR <span className="text-lc-gold font-light">52</span>
               </h1>

               <p className="text-xl md:text-3xl text-white/90 max-w-4xl mx-auto mb-12 font-light leading-relaxed">
                  "Where sunlight meets sophistication."
               </p>

               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                     onClick={handleWhatsApp}
                     className="bg-lc-gold hover:bg-lc-goldHover text-white px-10 py-4 rounded-lg font-bold transition-all shadow-lg shadow-lc-gold/20 tracking-wide"
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

         {/* Introduction / Why Dubai South */}
         <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-lc-navy mb-4">Why Dubai South?</h2>
                  <p className="text-gray-500 max-w-2xl mx-auto">A dynamic center for innovation and limitless opportunities.</p>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                     {
                        icon: <TrendingUp size={40} />,
                        title: "Business-Friendly Zone",
                        desc: "Tax-free zones and 100% foreign ownership."
                     },
                     {
                        icon: <Leaf size={40} />,
                        title: "Green Living",
                        desc: "Eco-friendly communities like The Sustainable City."
                     },
                     {
                        icon: <Globe size={40} />,
                        title: "Thriving Growth Hub",
                        desc: "A dynamic center for innovation."
                     },
                     {
                        icon: <Plane size={40} />,
                        title: "Unmatched Connectivity",
                        desc: "Links to global travel hubs and major roads."
                     }
                  ].map((item, idx) => (
                     <div key={idx} className="bg-gray-50 p-8 rounded-2xl hover:bg-lc-navy hover:text-white group transition-all duration-300 border border-gray-100 hover:shadow-xl">
                        <div className="text-lc-gold mb-6 group-hover:text-lc-gold transition-colors">
                           {item.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                        <p className="text-sm text-gray-500 group-hover:text-gray-300 leading-relaxed">
                           {item.desc}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Connectivity Map Data */}
         <section className="py-24 bg-lc-navy text-white relative overflow-hidden">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="container mx-auto px-4 relative z-10">
               <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                     <h2 className="text-4xl font-serif font-bold mb-6 leading-tight">
                        Seamless Connectivity.<br />
                        <span className="text-lc-gold">Limitless Possibility.</span>
                     </h2>
                     <p className="text-blue-100 mb-10 text-lg font-light">
                        Altair 52 is located in one of the most connected and emerging zones in Dubai. Whether for work or leisure, everything is within reach.
                     </p>

                     <div className="space-y-6">
                        {[
                           { time: "7 MINS", dest: "Al Maktoum International Airport (World's Largest Airport)" },
                           { time: "13 MINS", dest: "Expo City Dubai (Future World Trade Center hub)" },
                           { time: "20 MINS", dest: "Palm Jebel Ali" },
                           { time: "40 MINS", dest: "Downtown Dubai" },
                           { time: "50 MINS", dest: "Abu Dhabi" },
                        ].map((item, idx) => (
                           <div key={idx} className="flex items-center gap-6 border-b border-white/10 pb-4 last:border-0">
                              <div className="w-24 flex-shrink-0 text-right">
                                 <span className="block text-2xl font-bold text-lc-gold">{item.time.split(' ')[0]}</span>
                                 <span className="text-[10px] tracking-wider uppercase text-gray-400">MINS</span>
                              </div>
                              <div className="flex-1">
                                 <p className="text-lg font-medium">{item.dest}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div className="relative h-[600px] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                     {/* Placeholder for Map Image from Brochure */}
                     <img src="https://altair52.com/wp-content/uploads/2025/06/Altair-52-project-image-7-scaled.jpg" className="w-full h-full object-cover opacity-50 mix-blend-overlay" alt="Map Background" />
                     <div className="absolute inset-0 flex items-center justify-center bg-lc-navy/80">
                        <p className="text-center px-8">
                           <MapPin size={48} className="text-lc-gold mx-auto mb-4" />
                           <span className="text-2xl font-serif">Residential District, Dubai South</span>
                           <span className="block text-sm text-gray-400 mt-2">Strategic positioning near major highways</span>
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Interiors & Highlights */}
         <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
               <div className="text-center mb-20">
                  <h2 className="text-4xl font-bold text-lc-navy mb-4">Designed to Impress, Front to Back</h2>
                  <p className="text-gray-500 uppercase tracking-widest text-sm">Premium Finishes • Uncompromising Quality</p>
               </div>

               <div className="grid md:grid-cols-3 gap-8 mb-16">
                  {[
                     {
                        title: "Entrance Lobby",
                        desc: "A grand welcome awaits in our elegantly crafted entrance lobby.",
                        img: "https://altair52.com/wp-content/uploads/2025/06/Lobby-area-view-1-996x1024.jpg"
                     },
                     {
                        title: "Boutique Living",
                        desc: "Step into sophistication — a design that sets the tone for refined living.",
                        img: "https://altair52.com/wp-content/uploads/2025/06/altair-52-1.png"
                     },
                     {
                        title: "Relaxed Interiors",
                        desc: "Enjoy privacy and comfort with interiors designed for relaxation.",
                        img: "https://altair52.com/wp-content/uploads/2025/06/Altair-52-project-image-01-1170x785.jpg"
                     }
                  ].map((item, idx) => (
                     <div key={idx} className="group cursor-pointer">
                        <div className="overflow-hidden rounded-2xl mb-6 aspect-[4/5]">
                           <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <h3 className="text-xl font-bold text-lc-navy mb-2">{item.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                     </div>
                  ))}
               </div>

               <div className="bg-gray-50 rounded-3xl p-8 md:p-16 border border-gray-100">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                     <div>
                        <h3 className="text-3xl font-bold text-lc-navy mb-6">Premium Apartments</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                           Thoughtfully designed spaces that blend comfort with contemporary luxury. Every inch reflects uncompromising quality, from flooring to fixtures.
                        </p>
                        <div className="space-y-6">
                           <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-lc-gold flex-shrink-0">
                                 <Wifi size={20} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-lc-navy">Smart Living</h4>
                                 <p className="text-sm text-gray-500">Integrated home automation systems.</p>
                              </div>
                           </div>
                           <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-lc-gold flex-shrink-0">
                                 <Sun size={20} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-lc-navy">Designer Bathrooms</h4>
                                 <p className="text-sm text-gray-500">Elevate everyday rituals with bathrooms crafted for indulgence.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="relative">
                        <div className="absolute inset-0 bg-lc-gold/20 transform rotate-3 rounded-3xl"></div>
                        <img src="https://altair52.com/wp-content/uploads/2025/06/Altair-52-project-image-3-scaled.jpg" className="relative rounded-3xl shadow-xl w-full" alt="Interior" />
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Club South (Amenities) */}
         <section className="py-24 bg-lc-navy relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>
            <div className="container mx-auto px-4 relative z-10">
               <div className="text-center mb-16">
                  <span className="text-lc-gold uppercase tracking-widest font-bold text-sm mb-2 block">Introducing</span>
                  <h2 className="text-5xl md:text-7xl font-serif text-white">CLUB SOUTH</h2>
                  <p className="text-blue-200 mt-4 max-w-2xl mx-auto">More Than Amenities — It's a Lifestyle Upgrade.</p>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                  {[
                     { icon: <Waves />, label: "Infinity Pool" },
                     { icon: <Smile />, label: "Kids Pool & Splash Pad" },
                     { icon: <Dumbbell />, label: "State-of-the-Art Gym" },
                     { icon: <Flag />, label: "Mini Golf" },
                     { icon: <Activity />, label: "Jogging Track" },
                     { icon: <Mountain />, label: "Rock Climbing Wall" },
                     { icon: <Coffee />, label: "Sunken Lounge Area" },
                     { icon: <Leaf />, label: "Yoga Deck" },
                     { icon: <Gamepad2 />, label: "Children's Play Area" },
                     { icon: <Zap />, label: "Outdoor Calisthenics" },
                     { icon: <Laptop />, label: "Working Space" },
                     { icon: <Flower />, label: "Zen Garden" },
                     { icon: <Wine />, label: "Rooftop Lounge" },
                     { icon: <Utensils />, label: "Barbecue & Cabanas" },
                     { icon: <Film />, label: "Outdoor Cinema" },
                  ].map((item, idx) => (
                     <div key={idx} className="bg-lc-navy/50 p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors h-40 border border-white/5">
                        <div className="text-lc-gold mb-4 scale-125">{item.icon}</div>
                        <span className="text-white text-xs md:text-sm font-medium uppercase tracking-wide">{item.label}</span>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Unit Configurations */}
         <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-lc-navy">Smart Convertible Units</h2>
                  <p className="text-gray-500 mt-2">Optimized layouts designed for modern living</p>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { title: "Smart Convertible Studio", size: "445 Sq. ft.", price: "From AED 650K" },
                     { title: "Smart Convertible 1BHK", size: "743 Sq. ft.", price: "From AED 950K" },
                     { title: "Smart Convertible 2 BHK", size: "1095 Sq. ft.", price: "From AED 1.4M" },
                     { title: "Smart Convertible 2.5 BHK", size: "1161 Sq. ft.", price: "From AED 1.6M" },
                  ].map((unit, idx) => (
                     <div key={idx} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all text-center group">
                        <div className="w-16 h-16 bg-lc-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-lc-gold font-bold text-xl group-hover:bg-lc-gold group-hover:text-white transition-colors">
                           {idx === 0 ? "S" : idx === 1 ? "1" : idx === 2 ? "2" : "2.5"}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{unit.title}</h3>
                        <p className="text-gray-500 text-sm mb-4">Starting size from {unit.size}</p>
                        <div className="border-t border-gray-100 pt-4 mt-4">
                           <p className="text-lc-gold font-bold">{unit.price}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Final CTA */}
         <section className="py-24 bg-white" id="register-interest">
            <div className="container mx-auto px-4 max-w-4xl text-center">
               <h2 className="text-4xl md:text-5xl font-bold text-lc-navy mb-6">Secure Your Future in Dubai South</h2>
               <p className="text-xl text-gray-500 mb-10">
                  Join the exclusive community at Altair 52. Register now for priority access to inventory and launch offers.
               </p>
               <form className="bg-gray-50 p-8 rounded-3xl shadow-inner border border-gray-200" onSubmit={(e) => { e.preventDefault(); handleWhatsApp(); }}>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                     <input type="text" placeholder="Full Name" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
                     <input type="email" placeholder="Email Address" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
                     <input type="tel" placeholder="Phone Number" className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
                     <select className="w-full px-6 py-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold text-gray-500">
                        <option>Select Unit Type</option>
                        <option>Studio</option>
                        <option>1 Bedroom</option>
                        <option>2 Bedroom</option>
                        <option>2.5 Bedroom</option>
                     </select>
                  </div>
                  <button
                     type="submit"
                     className="w-full bg-lc-gold hover:bg-lc-goldHover text-white font-bold py-5 rounded-xl text-lg transition-all shadow-lg shadow-lc-gold/20"
                  >
                     Register Interest Now
                  </button>
               </form>
            </div>
         </section>
      </div>
   );
};
