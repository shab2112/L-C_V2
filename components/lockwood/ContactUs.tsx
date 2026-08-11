
import React, { useState } from 'react';
import { Page } from '../../lockwood-types';
import { MapPin, Phone, Mail, Clock, Send, Building } from 'lucide-react';

interface ContactUsProps {
  onNavigate: (page: Page) => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ onNavigate }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for contacting Lockwood & Carter. A dedicated advisor will reach out to you shortly.');
    setFormState({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-lc-navy">
        <div className="absolute inset-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop" 
             alt="Dubai Corporate Office" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-lc-navy via-lc-navy/80 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
           <span className="text-lc-gold font-bold tracking-widest uppercase text-sm mb-4 block">Get in Touch</span>
           <h1 className="text-5xl font-bold text-white mb-6">Contact Us</h1>
           <div className="w-24 h-1 bg-lc-gold mx-auto"></div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Contact Information Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-lc-navy rounded-full flex items-center justify-center text-lc-gold mb-6">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-bold text-lc-navy mb-4">Dubai Office</h3>
                <p className="text-gray-600 leading-relaxed">
                  Empire Heights A - 16F-A-04<br />
                  Business Bay<br />
                  Dubai, UAE
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-lc-navy rounded-full flex items-center justify-center text-lc-gold mb-6">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl font-bold text-lc-navy mb-4">Direct Contact</h3>
                <div className="space-y-3">
                  <p className="flex items-center gap-3 text-gray-600">
                    <span className="font-semibold text-gray-900">Phone:</span>
                    <a href="tel:+971564144401" className="hover:text-lc-gold transition-colors">+971 564144401</a>
                  </p>
                  <p className="flex items-center gap-3 text-gray-600">
                    <span className="font-semibold text-gray-900">Email:</span>
                    <a href="mailto:info@lockwoodandcarter.com" className="hover:text-lc-gold transition-colors">info@lockwoodandcarter.com</a>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-lc-navy rounded-full flex items-center justify-center text-lc-gold mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold text-lc-navy mb-4">Office Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-lc-navy mb-4">Send us a Message</h2>
                  <p className="text-gray-500">
                    Whether you are interested in an off-plan investment, need a valuation for your property, or have general inquiries, our team is ready to assist.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formState.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lc-gold/50 focus:border-lc-gold transition-colors"
                        placeholder="John Doe"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lc-gold/50 focus:border-lc-gold transition-colors"
                        placeholder="john@example.com"
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lc-gold/50 focus:border-lc-gold transition-colors"
                        placeholder="+971..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                      <select 
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lc-gold/50 focus:border-lc-gold transition-colors"
                      >
                        <option value="">Select Inquiry Type</option>
                        <option value="Investment">Investment Consultation</option>
                        <option value="Buying">Buying Property</option>
                        <option value="Selling">List My Property</option>
                        <option value="GoldenVisa">Golden Visa Inquiry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea 
                      name="message"
                      rows={5}
                      value={formState.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lc-gold/50 focus:border-lc-gold transition-colors resize-none"
                      placeholder="How can we help you today?"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-lc-gold hover:bg-lc-goldHover text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg shadow-lc-gold/20 flex items-center justify-center gap-2"
                  >
                    <Send size={20} /> Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Map Placeholder */}
      <section className="h-[400px] bg-gray-200 w-full relative group overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1577083288073-40892c0860a4?q=80&w=2000&auto=format&fit=crop" 
          alt="Dubai Map Location" 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl text-center transform translate-y-4 group-hover:translate-y-0 transition-transform">
             <div className="w-12 h-12 bg-lc-gold rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg text-white">
                <Building size={24} />
             </div>
             <p className="font-bold text-lc-navy">Lockwood & Carter HQ</p>
             <p className="text-xs text-gray-500">Business Bay, Dubai</p>
          </div>
        </div>
      </section>
    </div>
  );
};
