import React from 'react';
import { ArrowRight, Quote } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface AboutUsPageProps {
  onNavigate: (page: Page) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onNavigate }) => {

  const handleServiceClick = (hash: string) => {
    window.location.hash = hash;
    onNavigate('PROJECTS');
    window.scrollTo(0, 0); // Reset scroll, the Projects component will handle the hash scroll
  };

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-lc-navy">
        <div className="absolute inset-0 opacity-50">
           <img 
             src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop" 
             alt="Dubai Skyline" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-lc-navy via-lc-navy/80 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
           <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">About Us</h1>
           <div className="w-24 h-1 bg-lc-gold mx-auto"></div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-lc-navy leading-relaxed">
              Lockwood & Carter Real Estate is dedicated to providing you the living that fits your requirements
            </h2>
          </div>

          {/* Changed from grid layout to single column layout */}
          <div className="max-w-4xl mx-auto space-y-8 text-gray-600 leading-relaxed text-sm md:text-base">
            <p className="font-semibold text-lc-navy">
                We are a reputable company specializing in the sale of properties sourced from top-tier developers and trusted sellers in Dubai. With a dedicated team experienced in handling both residential and commercial real estate, our key strength lies in our ability to offer high-quality properties and excellent customer service.
            </p>
            <ul className="space-y-4 list-disc pl-4 marker:text-lc-gold">
              <li>We are a team of seasoned advisors with extensive experience in Real Estate, Finance, and Business Acumen.</li>
              <li>With comprehensive knowledge of all the prominent developers in the UAE (Emaar, Damac, Nakheel) and their products, we are capable to match your requirements and offer the best set of property choices at any time.</li>
              <li>We are well aware of investor hotspots and through our data-driven approach we have insights on future investor hotspots too – updating ourselves with our latest AI tools.</li>
              <li>We offer real estate experts from various cultural backgrounds to interact with clients in their native language, ensuring seamless transactions.</li>
              <li>We recognize a crucial need in the real estate sector to provide specialized services tailored to international buyers. We have established affiliations with key business service providers to support our clients with business setup, Golden Visa applications, and mortgage assistance.</li>
                <li>Our aim is to standout in the industry by adopting the best practices and ensuring transparency. We achieve this by establishing clear and comprehensible processes throughout all aspects of the real estate business.</li>
              </ul>
              <p className="p-6 bg-blue-50 border-l-4 border-lc-gold italic text-gray-700 rounded-r-lg">
                Unlike many other real estate agencies which can tire you in a handful of known property developers, <span className="font-bold text-lc-navy">Lockwood & Carter Real Estate</span> offers a limitless array of choice to confidently consider and invest in your property. Our property advisors spend considerable amount of time in market research and our offerings are always based on data driven insights.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-lc-navy mb-2">Services</h2>
            <p className="text-gray-400 text-sm mb-12">Comprehensive real estate solutions for investors and homeowners</p>
  
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Off Plan Properties", hash: "off-plan", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop" },
                { title: "Ready Properties", hash: "ready", img: "https://cdn.dxbproperties.ae/media/blog/ready_to_move_in.webp" },
                { title: "Commercial Properties", hash: "commercial", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop" },
                { title: "Land & Plots", hash: "plots", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop" }
              ].map((service, index) => (
                <div 
                  key={index} 
                  className="group relative h-80 rounded-xl overflow-hidden cursor-pointer shadow-lg transform transition-all duration-300 hover:-translate-y-2"
                  onClick={() => handleServiceClick(service.hash)}
                >
                  <img 
                    src={service.img} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <p className="text-xs text-lc-gold uppercase font-bold mb-1">Explore</p>
                    <div className="flex justify-between items-end">
                      <h3 className="text-2xl font-bold text-white leading-tight max-w-[80%]">{service.title}</h3>
                      <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white group-hover:bg-lc-gold group-hover:border-lc-gold transition-all">
                         <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Testimonials - Real Scenarios for Social Proof */}
        <section className="py-24 bg-blue-50/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-lc-navy">Client Success Stories</h2>
              <p className="text-gray-400 text-sm mt-2">Trusted by international investors</p>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  name: "James Anderson", 
                  role: "Investor from UK", 
                  quote: "Lockwood & Carter helped me navigate the Golden Visa process seamlessly. I purchased a unit in Downtown and the AI ROI projections were spot on.",
                  img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" 
                },
                { 
                  name: "Sarah Lin", 
                  role: "Expat Resident", 
                  quote: "I was looking for a family home in Dubai Hills. Their AI assistant narrowed down 50 options to the perfect 3 within minutes. Highly recommended.",
                  img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" 
                },
                { 
                  name: "Mohammed Al-Fayed", 
                  role: "Commercial Investor", 
                  quote: "Their expertise in off-plan commercial plots in Dubai South is unmatched. They provided data-driven insights that other agencies simply didn't have.",
                  img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop"
                }
              ].map((person, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
                  <div className="mb-6 flex justify-center text-lc-gold/30">
                    <Quote size={40} className="fill-current" />
                  </div>
                  <p className="text-gray-600 text-sm italic leading-relaxed mb-8">
                    "{person.quote}"
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <img src={person.img} alt={person.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100" />
                    <div className="text-left">
                      <h4 className="font-bold text-lc-navy text-sm">{person.name}</h4>
                      <p className="text-xs text-gray-500">{person.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  };
