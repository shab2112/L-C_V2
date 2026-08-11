
import React from 'react';
import { ArrowLeft, Download, MapPin, ShieldCheck, Wifi, Users, Dumbbell, Coffee, Plane, Briefcase, MonitorPlay, Globe, Clock, Sun, TrendingUp, Building } from 'lucide-react';
import { Page } from '../../lockwood-types';

// Helper components for icons
const Helipad = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>;
const Cricket = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22l4-4" /><path d="M4 20l2-2" /><path d="M20 2l-4 4" /><path d="M18 4l2 2" /><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
const Flower = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5" /><path d="M12 7.5A4.5 4.5 0 1 0 7.5 12 4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 1 0 12 7.5" /><path d="M7.5 12A4.5 4.5 0 1 1 12 7.5 4.5 4.5 0 1 1 16.5 12 4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 1 1 7.5 12" /><path d="M16.5 12A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 1 0 7.5 12 4.5 4.5 0 1 0 12 7.5 4.5 4.5 0 1 0 16.5 12" /></svg>;

interface ShahrukhzProps {
   onNavigate: (page: Page) => void;
}

export const Shahrukhz: React.FC<ShahrukhzProps> = ({ onNavigate }) => {
   const handleWhatsApp = () => {
      const message = encodeURIComponent("Hi Mr. Muqthar, I am interested in Shahrukhz by Danube. Please provide more details regarding office availability and the 1% payment plan.");
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
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2500&auto=format&fit=crop"
                  alt="Shahrukhz by Danube Exterior"
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
            </div>

            {/* Removed absolute positioning for back button to prevent overlap */}
            {/* It is now placed in the flow at the top of the content container */}
            <div className="container mx-auto px-4 relative z-10 pt-8"> {/* Added pt-8 for spacing */}
               <button
                  onClick={() => onNavigate('PROJECTS')}
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/40 text-sm font-medium mb-8"
               >
                  <ArrowLeft size={16} /> Back to Projects
               </button>

               <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 border border-lc-gold/50 bg-black/40 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-widest mb-6">
                     <span className="text-lc-gold">Danube Properties</span>
                     <span className="w-1 h-1 rounded-full bg-white"></span>
                     <span>Sheikh Zayed Road</span>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif tracking-tight leading-none">
                     SHAHRUKHZ <br />
                     <span className="text-2xl md:text-3xl font-light tracking-widest block mt-2">BY DANUBE</span>
                  </h1>

                  <h2 className="text-xl md:text-2xl text-lc-gold font-medium mb-6 uppercase tracking-wider">
                     Where Every Office Tells A Story Of Success
                  </h2>

                  <p className="text-lg text-white/80 max-w-2xl mb-10 font-light leading-relaxed">
                     Rising on the iconic Sheikh Zayed Road, this premium 55-storey office tower offers unmatched visibility and seamless access. An architectural landmark for those who lead.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
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
            </div>

            <div className="absolute top-32 right-4 md:right-8 z-20 hidden md:block">
               <div className="bg-black/60 backdrop-blur-md p-6 rounded-xl border border-lc-gold/30 text-center">
                  <p className="text-lc-gold font-bold text-3xl mb-1">1%</p>
                  <p className="text-white text-xs uppercase tracking-wider mb-4">Per Month</p>
                  <div className="w-full h-px bg-white/10 mb-4"></div>
                  <p className="text-white font-bold text-lg">70/30</p>
                  <p className="text-white/70 text-[10px] uppercase">Post Handover Plan</p>
               </div>
            </div>


         </section>

         {/* Intro / Collaboration */}
         <section className="py-24 bg-black text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lc-gold/10 rounded-full blur-[120px]"></div>
            <div className="container mx-auto px-4 relative z-10">
               <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div>
                     <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                        An Iconic Collaboration<br />
                        <span className="text-lc-gold">That Will Change The Way The World 'Works'</span>
                     </h2>
                     <p className="text-gray-400 leading-relaxed mb-8">
                        Inspired by the self-made journey of Shah Rukh Khan, Shahrukhz is a tribute to those who script their own destiny — a place for business leaders, founders, and visionaries to build more than companies, to build empires.
                     </p>
                     <div className="flex items-center gap-8">
                        <div>
                           <p className="text-4xl font-bold text-lc-gold">33</p>
                           <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Years of Trust</p>
                        </div>
                        <div className="h-12 w-px bg-white/10"></div>
                        <div>
                           <p className="text-4xl font-bold text-lc-gold">55</p>
                           <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Storey Tower</p>
                        </div>
                        <div className="h-12 w-px bg-white/10"></div>
                        <div>
                           <p className="text-4xl font-bold text-lc-gold">Q2</p>
                           <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">2029 Completion</p>
                        </div>
                     </div>
                  </div>
                  <div className="relative">
                     <img
                        src="https://static.propsearch.ae/dubai-locations/shahrukhz-by-danube_Ceedi_xl.jpg"
                        alt="Shah Rukh Khan Collaboration"
                        className="rounded-2xl border border-lc-gold/20 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                     />
                     <div className="absolute -bottom-6 -left-6 bg-lc-gold text-black p-6 rounded-xl max-w-xs">
                        <p className="font-serif italic font-bold">"The Sky is your runway & success is your destination"</p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Connectivity Map Data */}
         <section className="py-24 bg-gray-50 relative">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-lc-navy mb-4">Prime Location: Sheikh Zayed Road</h2>
                  <p className="text-gray-500 max-w-2xl mx-auto">Strategically positioned in the heart of Dubai's business corridor.</p>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { time: "0 MIN", dest: "Sheikh Zayed Road", icon: <MapPin /> },
                     { time: "3 MIN", dest: "Metro Station", icon: <Train /> },
                     { time: "5 MIN", dest: "Dubai Media City", icon: <Building /> },
                     { time: "8 MIN", dest: "Dubai Marina", icon: <Globe /> },
                     { time: "12 MIN", dest: "Dubai Mall", icon: <Briefcase /> },
                     { time: "20 MIN", dest: "DXB Airport", icon: <Plane /> },
                     { time: "30 MIN", dest: "Al Maktoum Airport", icon: <Plane /> },
                     { time: "8 MIN", dest: "Mall of Emirates", icon: <Briefcase /> },
                  ].map((item, idx) => (
                     <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border-b-4 border-lc-gold">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-lc-gold">{item.icon}</span>
                           <span className="text-2xl font-bold text-gray-900">{item.time}</span>
                        </div>
                        <p className="font-semibold text-gray-700">{item.dest}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Premium Office Types */}
         <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-lc-navy mb-4">Workspaces That Elevate</h2>
                  <p className="text-gray-500 uppercase tracking-widest text-sm">Tailored for every scale of ambition</p>
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                  {[
                     {
                        title: "STANDARD",
                        size: "450 - 600 sq.ft.",
                        features: ["Manager's Cabin", "13 - 15 Workstations", "Reception & Visitor's Zone", "Outdoor Seating"],
                        img: "https://danubeproperties.com/wp-content/uploads/2025/11/4-1.webp"
                     },
                     {
                        title: "EXECUTIVE",
                        size: "650 - 800 sq.ft.",
                        features: ["Manager's Cabin", "18 - 20 Workstations", "Meeting Room", "Restroom & Pantry"],
                        img: "https://danubeproperties.com/wp-content/uploads/2025/11/1.webp"
                     },
                     {
                        title: "PREMIUM",
                        size: "1,200 - 1,500 sq.ft.",
                        features: ["Manager's Cabin", "38 - 40 Workstations", "Meeting Room", "En-suite Restroom"],
                        img: "https://danubeproperties.com/wp-content/uploads/2025/11/5-1.webp"
                     },
                     {
                        title: "PRESTIGE",
                        size: "2,000 - 11,000 sq.ft.",
                        features: ["Full Floor Customization", "50 - 200 Workstations", "Conference Room", "Private Amenities"],
                        img: "https://danubeproperties.com/wp-content/uploads/2025/11/3-1.webp"
                     }
                  ].map((office, idx) => (
                     <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer">
                        <div className="absolute inset-0">
                           <img src={office.img} alt={office.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           <div className="absolute inset-0 bg-lc-navy/80 group-hover:bg-lc-navy/70 transition-colors"></div>
                        </div>
                        <div className="relative p-10 h-full flex flex-col justify-center text-center">
                           <h3 className="text-3xl font-serif text-lc-gold mb-2">{office.title}</h3>
                           <p className="text-white text-lg font-light mb-6">Size: {office.size}</p>
                           <div className="flex flex-wrap justify-center gap-2">
                              {office.features.map((feat, i) => (
                                 <span key={i} className="bg-white/10 text-white/90 text-xs px-3 py-1 rounded-full border border-white/10">
                                    {feat}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Amenities */}
         <section className="py-24 bg-lc-navy text-white relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="container mx-auto px-4 relative z-10">
               <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-serif mb-4">Services Designed Around You</h2>
                  <p className="text-blue-200 uppercase tracking-widest text-sm">35+ Premium Amenities • Elevating the way you work</p>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {[
                     { icon: <Helipad />, label: "Helipad (Level 56)" },
                     { icon: <Coffee />, label: "Lounge 55" },
                     { icon: <Sun />, label: "Sky Pool (Level 33)" },
                     { icon: <Dumbbell />, label: "Premium Gym" },
                     { icon: <Users />, label: "Networking Hub" },
                     { icon: <Cricket />, label: "Cricket Pitch" },
                     { icon: <TrendingUp />, label: "Padel Court" },
                     { icon: <Flower />, label: "Zen Garden" },
                     { icon: <MonitorPlay />, label: "Podcast Studio" },
                     { icon: <Globe />, label: "Shuttle to Metro" },
                     { icon: <ShieldCheck />, label: "Valet Services" },
                     { icon: <Clock />, label: "E-Scooter Station" },
                  ].map((item, idx) => (
                     <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-lc-gold/20 transition-all hover:-translate-y-1">
                        <div className="text-lc-gold mb-4 scale-125">{item.icon}</div>
                        <span className="text-xs md:text-sm font-medium">{item.label}</span>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Payment Plan */}
         <section className="py-24 bg-white">
            <div className="container mx-auto px-4 text-center">
               <h2 className="text-4xl font-bold text-lc-navy mb-12">Flexible Payment Plan</h2>
               <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-gray-500 uppercase text-xs tracking-widest mb-2">Down Payment</p>
                     <p className="text-4xl font-bold text-lc-navy">20%</p>
                     <p className="text-sm text-gray-400 mt-2">On Booking</p>
                  </div>
                  <div className="p-8 bg-lc-navy rounded-2xl border border-lc-navy shadow-xl transform scale-110">
                     <p className="text-white/70 uppercase text-xs tracking-widest mb-2">During Construction</p>
                     <p className="text-5xl font-bold text-lc-gold">1%</p>
                     <p className="text-sm text-white/70 mt-2">Monthly Installments</p>
                  </div>
                  <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                     <p className="text-gray-500 uppercase text-xs tracking-widest mb-2">Post Handover</p>
                     <p className="text-4xl font-bold text-lc-navy">30%</p>
                     <p className="text-sm text-gray-400 mt-2">Over 30 Months</p>
                  </div>
               </div>
            </div>
         </section>

         {/* Final CTA */}
         <section className="py-24 bg-gray-50" id="register-interest">
            <div className="container mx-auto px-4 max-w-4xl text-center">
               <h2 className="text-4xl md:text-5xl font-bold text-lc-navy mb-6">Own a Piece of Legacy</h2>
               <p className="text-xl text-gray-500 mb-10">
                  Register now for priority access to Shahrukhz by Danube. Secure your premium office space on Sheikh Zayed Road.
               </p>
               <form className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100" onSubmit={(e) => { e.preventDefault(); handleWhatsApp(); }}>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                     <input type="text" placeholder="Full Name" className="w-full px-6 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
                     <input type="email" placeholder="Email Address" className="w-full px-6 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
                     <input type="tel" placeholder="Phone Number" className="w-full px-6 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold" />
                     <select className="w-full px-6 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-lc-gold text-gray-500">
                        <option>Select Office Type</option>
                        <option>Standard (450+ sq.ft)</option>
                        <option>Executive (650+ sq.ft)</option>
                        <option>Premium (1,200+ sq.ft)</option>
                        <option>Prestige (2,000+ sq.ft)</option>
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

// Helper Icon for Train
const Train = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M7 15h.01" /><path d="M17 15h.01" /><path d="M2 12v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" /><path d="M15 5v5" /><path d="M9 5v5" /></svg>;
