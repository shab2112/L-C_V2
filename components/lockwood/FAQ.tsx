
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Page } from '../../lockwood-types';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Can a foreigner buy property in Dubai?",
    answer: "Yes. Foreign nationals (non-UAE / non-GCC) can own freehold property in designated areas of Dubai."
  },
  {
    question: "What does freehold mean?",
    answer: "You fully own the property and the land it sits on, and you can: sell it, lease it, pass it on to heirs."
  },
  {
    question: "What is leasehold?",
    answer: "You own the right to use the property for a fixed term (typically 99 years), but do not own the land."
  },
  {
    question: "What are designated freehold areas?",
    answer: "These are locations approved by the Government where foreigners can own property. Examples include Downtown Dubai, Dubai Marina & JBR, Palm Jumeirah, JLT, Business Bay."
  },
  {
    question: "Can I buy property remotely without visiting Dubai?",
    answer: "Yes. You can sign documents digitally and complete the transaction using: Power of Attorney, Remote transfer at a trustee office."
  },
  {
    question: "What documents do I need to buy property in Dubai?",
    answer: "For individuals: Passport copy, Contact information. For companies: Company licence/incorporation documents, Authorized signatory documents."
  },
  {
    question: "Do I need a UAE residency visa to buy property?",
    answer: "No. You do not need a residency visa to purchase property. However, owning property may qualify you for a residency visa depending on the property value and payment completion."
  },
  {
    question: "Does property ownership qualify me for a UAE residency visa?",
    answer: "Yes, if property value meets the visa threshold (AED 750,000+). In some cases AED 2 million for longer visa validity (Golden Visa eligibility varies)."
  },
  {
    question: "Are installment plans (payment plans) available?",
    answer: "Yes — most off-plan projects offer structured payment plans such as 60/40, 80/20, or 1% monthly plans."
  },
  {
    question: "What is an escrow account?",
    answer: "For off-plan projects, your payments go into a DLD-approved escrow account — not directly to the developer. This ensures your money is only used to build that specific project."
  },
  {
    question: "How do I check if a project is registered and safe to buy?",
    answer: "You can verify via: DLD REST App, Ask for the project escrow account number, Confirm developer registration with RERA."
  },
  {
    question: "What fees do I pay when buying property?",
    answer: "Approximate costs: DLD registration fee ~4% of purchase price; Administration/Trustee office fee ~AED 4,000–5,000; Oqood registration for off-plan units ~AED 3,000 (varies)."
  },
  {
    question: "Can I get a mortgage as an international investor?",
    answer: "Yes, some banks offer financing to non-residents. Usually banks require minimum income proof and a down payment of 20–50% (depending on status)."
  },
  {
    question: "What are service charges and who pays them?",
    answer: "Service/maintenance fees are paid annually for upkeep of the building and common areas. Rates depend on project, amenities and location."
  },
  {
    question: "What is a Jointly Owned Property (JOP)?",
    answer: "It's a property (like an apartment building or community) where you own your individual unit and the common areas are shared by all owners."
  },
  {
    question: "Can I rent out my property on Airbnb?",
    answer: "Yes — Dubai allows short-term holiday rentals. A permit from Dubai Tourism (DTMC) is required."
  },
  {
    question: "What is the typical ROI (rental yield) in Dubai?",
    answer: "Dubai offers one of the highest rental yields globally: 6–10% net annual rental return (depending on location and property type)."
  },
  {
    question: "How is the market regulated?",
    answer: "Dubai real estate is regulated by: Dubai Land Department (DLD) and Real Estate Regulatory Agency (RERA). All developers, escrow accounts and brokers are registered under these authorities."
  },
  {
    question: "What happens if the developer delays the project?",
    answer: "RERA monitors construction progression. You may file a complaint via the Real Estate Court, or seek arbitration (depending on contract terms)."
  },
  {
    question: "What happens after I finish paying the full amount?",
    answer: "You will receive the Title Deed (completed property) or Oqood registration (off-plan property)."
  },
  {
    question: "Who issues the Title Deed?",
    answer: "The Dubai Land Department (DLD) issues title deeds electronically and they can be verified via the DLD REST mobile app."
  },
  {
    question: "Can I resell the property before it is completed (off-plan resale)?",
    answer: "Yes — subject to developer approval and project progress percentage (varies by project)."
  }
];

interface FAQProps {
  onNavigate: (page: Page) => void;
}

export const FAQ: React.FC<FAQProps> = ({ onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-24 bg-[#020617]" id="faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-lg">Everything you need to know about buying property in Dubai as a foreign investor</p>
        </div>

        {/* Search */}
        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-[#0f172a] border border-white/10 rounded-xl leading-5 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-lc-gold/50 focus:border-lc-gold transition-all shadow-sm"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-[#0f172a] border border-white/5 rounded-xl overflow-hidden shadow-sm hover:border-white/10 transition-colors"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-semibold text-white pr-8">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-lc-gold flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-lc-gold flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
          {filteredFAQs.length === 0 && (
             <div className="text-center py-10 text-gray-500">
                No matching questions found.
             </div>
          )}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-16 bg-[#0f172a] border border-white/5 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden group hover:border-lc-gold/20 transition-all">
             <div className="absolute top-0 right-0 w-64 h-64 bg-lc-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-lc-gold/10 transition-colors"></div>
             
             <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                   Our expert team is here to help you navigate the Dubai real estate market. Get personalized answers to your specific questions.
                </p>
                <button 
                  onClick={() => onNavigate('CONTACT_US')} 
                  className="inline-block bg-lc-gold hover:bg-lc-goldHover text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-lc-gold/20"
                >
                   Contact Support
                </button>
             </div>
        </div>

      </div>
    </section>
  );
};
