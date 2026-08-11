import React, { useState, useEffect } from 'react';
import { Page } from '../../lockwood-types';
import { Clock, Calendar, ArrowRight, BookOpen, ArrowLeft, Share2, Linkedin, Twitter, ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: number;
  category: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  authorRole: string;
  content: string; // HTML content
}

interface BlogsProps {
  onNavigate: (page: Page) => void;
}

export const Blogs: React.FC<BlogsProps> = ({ onNavigate }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Insights');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const posts: BlogPost[] = [
    {
      id: 1,
      category: "Investment Strategy",
      date: "Oct 24, 2025",
      readTime: "8 min read",
      title: "Dubai South: The 'Aerotropolis' Effect on Capital Appreciation in Q4 2025",
      excerpt: "With Al Maktoum Airport's Phase 1 expansion nearing operational capacity, Dubai South has officially surpassed historical resistance levels. We analyze the 28% YoY appreciation and the impact of the Blue Line Metro extension.",
      image: "https://cdn.excelproperties.ae/media/blog/hero/Top_Off-Plan_Projects_for_Sale_in_Dubai_South_1.webp?width=1280&height=384&format=webp&quality=90",
      author: "Sibin Mohammad",
      authorRole: "Senior Investment Advisor",
      content: `
        <p class="lead text-xl text-gray-600 mb-8 font-light">The narrative of Dubai South has shifted from "potential" to "performance." As of October 2025, verified transaction data from the DLD indicates a paradigm shift in investor sentiment, driven primarily by the tangible progress of critical infrastructure projects.</p>
        
        <h3 class="text-2xl font-bold text-lc-navy mb-4">The Infrastructure Catalyst: Al Maktoum & The Blue Line</h3>
        <p class="mb-6">The correlation between infrastructure delivery and real estate capital appreciation is a fundamental tenet of property economics. In Dubai South, this is currently manifesting through two key drivers:</p>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-700">
          <li><strong>Al Maktoum International Airport (DWC):</strong> With Phase 1 cargo operations now fully integrated and passenger capacity expansion on track for the 2027 milestone, the surrounding Residential District has seen a surge in demand from logistics executives and aviation professionals.</li>
          <li><strong>Metro Blue Line Extension:</strong> The confirmed stations servicing the southern corridor have reduced the psychological distance to Downtown Dubai, compressing the yield gap between peripheral and core communities.</li>
        </ul>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">Market Performance Analysis (Q3 2024 vs Q3 2025)</h3>
        <p class="mb-6">Data pulled from the Dubai Land Department (DLD) reveals a stark upward trajectory. The average price per square foot (PSF) in Dubai South's Residential District has moved from AED 1,150 in late 2024 to an average of <strong>AED 1,480 in October 2025</strong>.</p>
        <div class="bg-blue-50 p-6 rounded-xl border-l-4 border-lc-gold mb-8">
          <p class="font-bold text-lc-navy">Key Insight:</p>
          <p class="text-gray-700 italic">"We are observing a 'flight to value.' While Downtown and Marina have stabilized at luxury price points, Dubai South offers a growth corridor where entry-level ticket prices still allow for significant capital upside—projected at another 12-15% over the next 12 months."</p>
        </div>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">Investment Strategy: Off-Plan vs. Secondary</h3>
        <p class="mb-6">For the savvy investor, the strategy currently favors <strong>off-plan inventory</strong> from Tier-1 developers (Emaar South, Damac Lagoons proximity, and exclusive boutique projects like Altair 52). The secondary market is suffering from a lack of supply, driving premiums up. By locking in pre-construction pricing now, investors are effectively hedging against the inevitable price hike upon the Airport's full passenger terminal opening.</p>
      `
    },
    {
      id: 2,
      category: "Legal & Visas",
      date: "Oct 18, 2025",
      readTime: "6 min read",
      title: "The UAE Golden Visa: Updated Protocols for Off-Plan Property Owners",
      excerpt: "The Federal Authority for Identity and Citizenship has streamlined the Golden Visa process for 2025. We clarify the 'AED 2 Million Equity' rule and the importance of Oqood registration for off-plan investors.",
      image: "https://img.etimg.com/thumb/width-300,height-225,imgsize-62328,resizemode-75,msid-124602994/nri/migrate/uae-golden-visa-what-are-other-benefits-of-the-uae-golden-visa-beyond-the-10-year-residency/uae-golden-visa.jpg",
      author: "Walid Al Marzooqi",
      authorRole: "Legal Consultant",
      content: `
        <p class="lead text-xl text-gray-600 mb-8 font-light">Navigating the regulatory landscape is as crucial as selecting the right asset. In 2025, the UAE Golden Visa remains the gold standard for long-term residency, but the administrative nuances regarding off-plan properties have evolved.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">The 'Equity vs. Value' Distinction</h3>
        <p class="mb-6">A common misconception persists regarding the AED 2 Million threshold. To clarify: liability does not negate eligibility, provided the <strong>equity</strong> component is satisfied.</p>
        <p class="mb-6">For a property valued at AED 2 Million (or higher):</p>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-700">
          <li><strong>Mortgaged Properties:</strong> The bank must issue a NOC (No Objection Certificate) and the investor must demonstrate payments clearing the AED 2M mark? <em>Correction:</em> As of late 2024/2025 updates, investors are eligible immediately upon down payment if the property value is AED 2M+, even if the full amount isn't paid off, provided the SPA is fully registered.</li>
          <li><strong>Off-Plan Properties:</strong> The critical document is the <strong>Oqood</strong> (Pre-title deed). Without a DLD-registered Oqood, the visa application cannot proceed. Developers are now mandated to issue this within 60 days of SPA signing.</li>
        </ul>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">Consolidation of Assets</h3>
        <p class="mb-6">Investors can consolidate multiple properties to meet the AED 2 Million requirement. However, all assets must be under the same individual's name. Joint ownership (husband and wife) is permitted, but requires an attested marriage certificate.</p>
        
        <div class="bg-gray-100 p-6 rounded-xl mb-8">
          <h4 class="font-bold text-lc-navy mb-2">Legal Advisory Note:</h4>
          <p class="text-gray-700">Ensure your Sale and Purchase Agreement (SPA) clearly reflects the purchase price. "Premium" paid to a secondary seller in a transfer does not always count towards the DLD valuation for visa purposes unless an official MoU reflects the total transaction value stamped by the Trustee Office.</p>
        </div>
      `
    },
    {
      id: 3,
      category: "Market Analysis",
      date: "Oct 10, 2025",
      readTime: "7 min read",
      title: "ROI Analysis 2025: Yield Compression in Ready Units vs. Off-Plan Spreads",
      excerpt: "Rental yields in prime areas are compressing as asset values rise. We dissect the data to determine where the 'Alpha' is—flipping off-plan contracts or holding ready assets for yield.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
      author: "Rasha Abbas",
      authorRole: "Market Analyst",
      content: `
        <p class="lead text-xl text-gray-600 mb-8 font-light">The 2025 market is characterized by a divergence in performance metrics. While rental rates continue to climb, asset prices in established communities have risen faster, leading to a natural compression of net yields.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">The Yield Compression Phenomenon</h3>
        <p class="mb-6">In 2023-2024, it was common to find 8-9% NET yields in Marina and JLT. Today, with capital values appreciating by approx. 18% over the last 12 months, entry-level prices have raised the denominator in the ROI calculation.</p>
        <p class="mb-6"><strong>Current Net Yield Benchmarks (Oct 2025):</strong></p>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-700">
          <li><strong>Downtown Dubai:</strong> 5.8% - 6.2%</li>
          <li><strong>Dubai Marina:</strong> 6.5% - 7.0%</li>
          <li><strong>JVC / Arjan:</strong> 7.5% - 8.2% (Still the yield leaders)</li>
        </ul>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">The Case for Off-Plan Capital Appreciation</h3>
        <p class="mb-6">With yields compressing, the smart money is rotating into <strong>Capital Appreciation</strong> plays. Off-plan projects launched in emerging districts (like Dubai Islands and Dubai South) are launching at price points significantly below the projected completed value.</p>
        <p class="mb-6">For example, purchasing at AED 1,300 PSF in a project with a 3-year handover plan offers a projected exit at AED 1,800+ PSF, delivering a Return on Equity (ROE) that far exceeds annual rental income, especially when leverage (payment plans) is factored in.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">Conclusion</h3>
        <p class="mb-6">If cash flow is your priority, look to secondary hubs like JVC and IMPZ where occupancy is 98%+. If wealth creation is the goal, the off-plan leverage strategy in growth corridors remains the superior instrument in the current cycle.</p>
      `
    },
    {
      id: 4,
      category: "Rental Strategy",
      date: "Sep 28, 2025",
      readTime: "5 min read",
      title: "Maximizing Short-Term Rental Yields in JVC: The 2025 Playbook",
      excerpt: "JVC continues to dominate the mid-market rental space. Learn how to leverage DTCM regulations and dynamic pricing models to achieve 9-10% NET returns on holiday homes.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop",
      author: "Muqthar Ahmed",
      authorRole: "Senior Property Advisor",
      content: `
        <p class="lead text-xl text-gray-600 mb-8 font-light">Jumeirah Village Circle (JVC) has evolved from a developing community to a mature residential hub. However, the arbitrage opportunity lies in the Short-Term Rental (Holiday Home) market, which is currently outperforming long-term leasing by 20-25%.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">Why JVC for Holiday Homes?</h3>
        <p class="mb-6">The fundamentals are undeniable. Tourists and business travelers are increasingly price-sensitive. With Downtown hotels averaging AED 1,200/night in Q4 2025, a high-spec studio in JVC at AED 450/night represents massive value. Connectivity via Hessa Street has improved, further aiding this trend.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">Optimizing for ADR (Average Daily Rate)</h3>
        <p class="mb-6">To achieve the coveted 10% NET ROI, landlords must move beyond passive management. Key strategies include:</p>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-700">
          <li><strong>Interior Design:</strong> 'Instagrammable' aesthetics are no longer optional; they are the primary conversion driver on Airbnb/Booking.com.</li>
          <li><strong>Dynamic Pricing Algorithms:</strong> Using AI-driven tools (like PriceLabs) to adjust rates daily based on Dubai's event calendar (GITEX, F1, etc.).</li>
          <li><strong>Superhost Status:</strong> Maintaining a 4.8+ rating is critical for visibility.</li>
        </ul>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">Regulatory Compliance</h3>
        <p class="mb-6">Ensure your unit is registered with the DTCM (Department of Tourism and Commerce Marketing). The fines for operating without a permit have increased in 2025. Lockwood & Carter offers fully managed services handling everything from the QR code generation to guest check-outs.</p>
      `
    },
    {
      id: 5,
      category: "Luxury Segment",
      date: "Sep 15, 2025",
      readTime: "6 min read",
      title: "Downtown Dubai & Branded Residences: Is Luxury Still Undervalued?",
      excerpt: "Despite record-breaking sales at the Baccarat and Bugatti residences, Dubai's prime PSF remains a fraction of New York or London. We explore the 'Ultra-Prime' value gap.",
      image: "https://media.cnn.com/api/v1/images/stellar/prod/240202095853-15-dubai-luxury-branded-residences-gal.jpg?c=original&q=h_618,c_fill",
      author: "Michael Chang",
      authorRole: "Luxury Specialist",
      content: `
        <p class="lead text-xl text-gray-600 mb-8 font-light">When we look at the UBS Bubble Index or Knight Frank's Wealth Report for 2025, Dubai stands out as an anomaly. It is a top-tier global city priced like a developing market.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">The Global Context: Price Per Square Foot</h3>
        <p class="mb-6">Let's look at the data for Prime Property (Top 5% of the market):</p>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-700">
          <li><strong>Monaco:</strong> $5,200 PSF</li>
          <li><strong>London (Knightsbridge):</strong> $3,500 PSF</li>
          <li><strong>New York (Manhattan):</strong> $2,800 PSF</li>
          <li><strong>Dubai (Downtown / Palm):</strong> $850 - $1,100 PSF</li>
        </ul>
        <p class="mb-6">This disparity is what attracts High Net Worth Individuals (HNWIs). You can purchase a <strong>Mercedes-Benz Place</strong> apartment or a <strong>Baccarat Residence</strong> for 1/3rd of the cost of a comparable asset in London, with superior amenities and zero property tax.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">The Rise of Branded Residences</h3>
        <p class="mb-6">2025 has been the year of the 'Brand'. Buyers are paying premiums of 25-30% for associated luxury brands because they guarantee a level of service and maintenance (Service Charges) that protects the asset's long-term value. It is not just a home; it is a collectible asset class.</p>
      `
    },
    {
      id: 6,
      category: "Commercial",
      date: "Sep 10, 2025",
      readTime: "5 min read",
      title: "The Shift in Office Demand: DIFC vs. Dubai South",
      excerpt: "With DIFC occupancy at 99%, multinational corporations are increasingly looking towards Grade A commercial spaces in Dubai South Business Park. Is this the new corporate hub?",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
      author: "Muqthar Ahmed",
      authorRole: "Senior Property Advisor",
      content: `
        <p class="lead text-xl text-gray-600 mb-8 font-light">The commercial real estate landscape in Dubai is undergoing a significant redistribution of demand. The Dubai International Financial Centre (DIFC) remains the crown jewel, but supply constraints are forcing major occupiers to look elsewhere.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">The Supply Crunch in Core Districts</h3>
        <p class="mb-6">As of Q3 2025, Grade A office vacancy in DIFC and Downtown stands at less than 1.5%. Rents have surged by 22% YoY. This squeeze is pushing logistics, tech, and aviation companies to seek large-floor-plate offices in the <strong>Dubai South Business Park</strong>.</p>
        
        <h3 class="text-2xl font-bold text-lc-navy mb-4">Why Dubai South for Commercial?</h3>
        <p class="mb-6">It's not just about spillover; it's about strategic positioning. For companies involved in global trade, being adjacent to the world's largest future airport and the Jebel Ali Port is a logistical necessity. Rents here are currently 40% lower than DIFC, offering substantial operational savings without compromising on building quality.</p>
      `
    },
    {
      id: 7,
      category: "Investment Strategy",
      date: "Sep 01, 2025",
      readTime: "8 min read",
      title: "Expo City 2026: The Strategic Masterplan Revealed",
      excerpt: "The newly unveiled Phase 2 masterplan for Expo City includes dedicated residential clusters that are poised to redefine sustainable luxury. What does this mean for early investors?",
      image: "https://tse1.mm.bing.net/th/id/OIP.bA8GL5gVawKYusZX3s-ryAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
      author: "Sibin Mohammad",
      authorRole: "Senior Investment Advisor",
      content: `
        <p class="lead text-xl text-gray-600 mb-8 font-light">Expo City Dubai is not just a legacy site; it is the blueprint for Dubai's 2040 Urban Master Plan. The Phase 2 announcement has solidified its status as a self-sustaining micro-city, often described as a 'human-centric city of the future'.</p>

        <div class="bg-blue-50 p-8 rounded-xl border-l-4 border-lc-gold mb-8 italic relative">
            <span class="absolute top-4 left-4 text-6xl text-lc-gold opacity-20 font-serif">"</span>
            <p class="text-lg text-lc-navy font-serif mb-4 relative z-10">Expo City Dubai will be a home for the future, a city that represents our ambitions, and a destination that brings the world together.</p>
            <p class="text-sm font-bold text-gray-900">— H.H. Sheikh Mohammed bin Rashid Al Maktoum, Vice President and Prime Minister of the UAE and Ruler of Dubai</p>
        </div>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">Residential Clusters: The 'Valley' Concept</h3>
        <p class="mb-6">The new residential launches focus on low-density, high-greenery living. Unlike the high-rises of Marina, Expo City is championing 'wellness living' or the '15-minute city' concept where all essential amenities are within a short walk or cycle.</p>
        <p class="mb-6">For investors, this differentiation is key. There is a scarcity of pedestrian-centric communities in Dubai. The masterplan reveals dedicated tracks for autonomous vehicles and extensive biodiversity parks, setting a new standard for sustainable luxury.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">A Hub for Global Innovation</h3>
        <p class="mb-6">Reem Al Hashimy, CEO of Expo City Dubai Authority, has emphasized that this is not just a residential zone but a "global hub for innovation." Major corporations like Siemens and Terminus have already anchored their regional headquarters here.</p>
        <p class="mb-6">"We are creating an ecosystem where businesses, residents, and tourists coexist in a net-zero environment," Al Hashimy stated during the Phase 2 reveal. This commercial stickiness ensures long-term rental demand from high-income professionals.</p>

        <h3 class="text-2xl font-bold text-lc-navy mb-4">The 5-Year Projection: Capitalizing on the 'Legacy Premium'</h3>
        <p class="mb-6">We project that properties within a 3km radius of Expo City Plaza (Al Wasl Dome) will see a "premiumization" effect similar to what occurred in Downtown around the Burj Khalifa. The 'Legacy Premium' refers to the intangible value of living within a global landmark.</p>
        <p class="mb-6">Early entry in 2025 is critical. Once the metro extension fully integrates with the new residential wings and the major commercial tenants reach full occupancy in 2026, entry prices are expected to correct upwards by 20-25%.</p>
      `
    }
  ];

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedPost(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Smooth scroll to the top of the grid (approximate position)
    const gridTop = document.getElementById('blog-grid');
    if (gridTop) {
      gridTop.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  // Filter Logic
  const filteredPosts = selectedCategory === 'All Insights' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const categories = ['All Insights', 'Investment Strategy', 'Market Analysis', 'Legal & Visas', 'Rental Strategy', 'Luxury Segment', 'Commercial'];

  if (selectedPost) {
    return (
      <div className="bg-white min-h-screen relative">
         {/* Navbar Background for visibility */}
         <div className="absolute top-0 left-0 w-full h-32 bg-lc-navy z-0"></div>

        <div className="container mx-auto px-4 max-w-4xl pt-40 pb-20 relative z-10">
           {/* --- UPDATED INDUSTRY STANDARD BUTTON --- */}
           <button 
             onClick={handleBack}
             className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:text-lc-navy hover:border-lc-navy hover:shadow-md transition-all duration-300 mb-10"
           >
             <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300 text-lc-gold" /> 
             Back to Insights
           </button>
           {/* ---------------------------------------- */}

           <div className="bg-white">
             {/* Article Header */}
             <div className="mb-10">
               <div className="flex items-center gap-4 mb-6">
                  <span className="bg-lc-navy/5 text-lc-navy px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-md">
                     {selectedPost.category}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                     <Calendar size={14} /> {selectedPost.date}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                     <Clock size={14} /> {selectedPost.readTime}
                  </span>
               </div>
               <h1 className="text-3xl md:text-5xl font-bold text-lc-navy mb-8 leading-tight">
                 {selectedPost.title}
               </h1>

               {/* Author Block */}
               <div className="flex items-center justify-between border-t border-b border-gray-100 py-6">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-lc-navy text-white flex items-center justify-center font-bold text-lg">
                        {selectedPost.author.charAt(0)}
                     </div>
                     <div>
                        <p className="font-bold text-gray-900 text-sm">{selectedPost.author}</p>
                        <p className="text-xs text-lc-gold font-medium uppercase tracking-wide">{selectedPost.authorRole}</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <button className="text-gray-400 hover:text-[#0077b5] transition-colors"><Linkedin size={20} /></button>
                     <button className="text-gray-400 hover:text-[#1da1f2] transition-colors"><Twitter size={20} /></button>
                     <button className="text-gray-400 hover:text-lc-gold transition-colors"><Share2 size={20} /></button>
                  </div>
               </div>
             </div>

             {/* Featured Image */}
             <div className="rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-auto object-cover" />
             </div>

             {/* Article Content */}
             <article 
               className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-lc-navy prose-p:text-gray-600 prose-a:text-lc-gold prose-strong:text-gray-900"
               dangerouslySetInnerHTML={{ __html: selectedPost.content }}
             />

             {/* Disclaimer */}
             <div className="mt-16 p-6 bg-gray-50 rounded-xl text-xs text-gray-500 italic border border-gray-100">
                Disclaimer: The information provided in this article is for educational purposes only and does not constitute financial advice. Real estate market trends are subject to change. Please consult with a certified Lockwood & Carter advisor before making investment decisions. Data sourced from Dubai Land Department (DLD) and internal market analysis as of October 2025.
             </div>
           </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen">
       {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-lc-navy pt-32">
        <div className="absolute inset-0 opacity-40">
           <img 
             src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop" 
             alt="Dubai Architecture" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-lc-navy via-lc-navy/80 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
           <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Real Estate Insights</h1>
           <div className="w-24 h-1 bg-lc-gold mx-auto"></div>
           <p className="text-gray-300 mt-6 max-w-2xl mx-auto text-lg">
             Expert analysis, investment guides, and market trends to help you make data-driven decisions in Dubai's dynamic property market.
           </p>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 border-b border-gray-100" id="blog-grid">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {categories.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => handleCategorySelect(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                  ? 'bg-lc-navy text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-lc-gold hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {filteredPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentPosts.map((post) => (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    {/* Image */}
                    <div className="relative h-60 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wide text-lc-navy rounded-md shadow-sm">
                        {post.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{post.readTime}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-lc-navy mb-3 leading-snug group-hover:text-lc-gold transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                              <div className="w-full h-full bg-lc-navy flex items-center justify-center text-white text-xs font-bold">
                                {post.author.charAt(0)}
                              </div>
                          </div>
                          <div>
                              <p className="text-xs font-bold text-gray-900">{post.author}</p>
                              <p className="text-[10px] text-gray-500">{post.authorRole}</p>
                          </div>
                        </div>
                        <span className="text-lc-gold group-hover:translate-x-1 transition-transform">
                          <ArrowRight size={20} />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-16">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-lc-navy hover:text-white hover:border-lc-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                          currentPage === page 
                            ? 'bg-lc-gold text-white shadow-lg' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-lc-gold hover:text-lc-gold'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-lc-navy hover:text-white hover:border-lc-navy transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No articles found in this category.</p>
              <button 
                onClick={() => handleCategorySelect('All Insights')}
                className="mt-4 text-lc-gold font-bold hover:underline"
              >
                View all articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-lc-navy relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-lc-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
         <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
            <BookOpen size={48} className="text-lc-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stay Ahead of the Market</h2>
            <p className="text-blue-100 mb-8">
              Subscribe to our weekly newsletter for exclusive investment opportunities, market reports, and regulatory updates delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <input 
                 type="email" 
                 placeholder="Enter your email address" 
                 className="flex-grow px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:border-lc-gold"
               />
               <button className="bg-lc-gold hover:bg-lc-goldHover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-lc-gold/20 whitespace-nowrap">
                  Subscribe Now
               </button>
            </div>
            <p className="text-xs text-blue-300 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
         </div>
      </section>
    </div>
  );
};