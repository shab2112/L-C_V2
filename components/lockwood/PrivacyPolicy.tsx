
import React from 'react';
import { Page } from '../../lockwood-types';
import { Shield, Lock, FileText, Server, Users } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (page: Page) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white min-h-screen text-gray-800">
       <div className="bg-gray-50 border-b border-gray-200 pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
             <h1 className="text-4xl md:text-5xl font-bold text-lc-navy mb-4">Privacy Policy</h1>
             <p className="text-gray-500 max-w-2xl mx-auto">
                Transparency and trust are the foundations of our relationship with you. Learn how Lockwood & Carter collects, uses, and protects your data.
             </p>
          </div>
       </div>

       <div className="container mx-auto px-4 py-16 max-w-4xl">
          
          <div className="prose prose-lg prose-blue max-w-none">
             <div className="mb-12">
                <p>
                  At <strong>Lockwood & Carter Real Estate</strong> ("we", "us", or "our"), we are committed to safeguarding the privacy and security of our clients and website visitors. This Privacy Policy outlines our practices regarding the collection, utilization, and protection of your personal information when you access our digital platforms or engage our services in Dubai, UAE.
                </p>
                <p>
                  By utilizing our website and services, you consent to the data practices described in this statement, which aligns with the regulations set forth by the UAE Data Protection Law and relevant Dubai Land Department (DLD) protocols.
                </p>
             </div>

             <div className="space-y-12">
                
                {/* Section 1 */}
                <div className="flex gap-6">
                   <div className="hidden md:block w-12 h-12 bg-blue-50 text-lc-navy rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-lc-navy mb-4">1. Information We Collect</h3>
                      <p className="mb-4">To provide accurate real estate consultancy and AI-driven insights, we may collect the following categories of information:</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                         <li><strong>Personal Identification:</strong> Name, email address, phone number, and nationality (required for DLD compliance).</li>
                         <li><strong>Property Preferences:</strong> Budget, location interests, and unit specifications provided through our forms or AI chat interface.</li>
                         <li><strong>Technical Data:</strong> IP address, browser type, device information, and interaction logs to improve website performance and security.</li>
                      </ul>
                   </div>
                </div>

                {/* Section 2 */}
                <div className="flex gap-6">
                   <div className="hidden md:block w-12 h-12 bg-blue-50 text-lc-navy rounded-full flex items-center justify-center flex-shrink-0">
                      <Server size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-lc-navy mb-4">2. Utilization of Information</h3>
                      <p className="mb-4">Your data allows us to tailor our services to your specific investment needs. We process your information to:</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                         <li>Personalize your property search experience using our AI algorithms.</li>
                         <li>Facilitate transactions, including arranging viewings and drafting sale agreements (MOU/Form F).</li>
                         <li>Communicate market updates, regulatory changes (e.g., Golden Visa rules), and exclusive project launches.</li>
                         <li>Comply with legal obligations required by the Real Estate Regulatory Agency (RERA).</li>
                      </ul>
                   </div>
                </div>

                {/* Section 3 */}
                <div className="flex gap-6">
                   <div className="hidden md:block w-12 h-12 bg-blue-50 text-lc-navy rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-lc-navy mb-4">3. Data Sharing and Third Parties</h3>
                      <p className="mb-4">We do not sell your personal data to third parties. However, to facilitate your real estate journey, we may share necessary details with trusted partners:</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                         <li><strong>Property Developers:</strong> When you register interest for a specific off-plan project (e.g., Emaar, Acube), your contact details may be shared to schedule viewings or secure inventory.</li>
                         <li><strong>Government Authorities:</strong> We may disclose information to the DLD or other regulatory bodies if required by law for property registration or compliance.</li>
                         <li><strong>Service Providers:</strong> IT support and CRM platform providers who assist in our daily operations, bound by strict confidentiality agreements.</li>
                      </ul>
                   </div>
                </div>

                {/* Section 4 */}
                <div className="flex gap-6">
                   <div className="hidden md:block w-12 h-12 bg-blue-50 text-lc-navy rounded-full flex items-center justify-center flex-shrink-0">
                      <Lock size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-lc-navy mb-4">4. Security Measures</h3>
                      <p className="text-gray-600 mb-4">
                         We employ industry-standard encryption protocols (SSL) and secure server environments to protect your personal information from unauthorized access, alteration, or disclosure. While we strive to use commercially acceptable means to protect your data, no method of transmission over the internet is 100% secure.
                      </p>
                   </div>
                </div>

                {/* Section 5 */}
                <div className="flex gap-6">
                   <div className="hidden md:block w-12 h-12 bg-blue-50 text-lc-navy rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-lc-navy mb-4">5. Your Rights</h3>
                      <p className="mb-4">As a user, you retain specific rights regarding your personal data:</p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                         <li><strong>Access:</strong> You may request a copy of the personal data we hold about you.</li>
                         <li><strong>Correction:</strong> You may request corrections to any inaccurate or incomplete data.</li>
                         <li><strong>Deletion:</strong> You may request the deletion of your data from our systems, subject to legal retention requirements for completed real estate transactions.</li>
                         <li><strong>Opt-Out:</strong> You may unsubscribe from our marketing communications at any time by clicking the "Unsubscribe" link in our emails or contacting us directly.</li>
                      </ul>
                   </div>
                </div>

             </div>

             <div className="mt-16 pt-10 border-t border-gray-200">
                <h3 className="text-xl font-bold text-lc-navy mb-4">Contact Us Regarding Privacy</h3>
                <p className="text-gray-600 mb-4">
                   If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact our Data Protection Officer at:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg inline-block">
                   <p className="font-bold text-lc-navy">Lockwood & Carter Real Estate</p>
                   <p className="text-gray-600">Email: <a href="mailto:info@lockwoodandcarter.com" className="text-lc-gold hover:underline">info@lockwoodandcarter.com</a></p>
                   <p className="text-gray-600">Address: Level 45, Burj Al Arab Tower, Dubai, UAE</p>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};
