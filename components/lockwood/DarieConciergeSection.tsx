import React from 'react';
import { ArrowRight, MessageCircle, Shield, Zap } from 'lucide-react';

export const DarieConciergeSection: React.FC = () => {
  const openDarie = () => {
    window.dispatchEvent(new Event('lc-open-darie-chat'));
  };

  return (
    <section className="bg-white py-24 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#6D2636]">AI-Powered Support</p>
            <h2 className="mb-6 font-serif text-4xl font-normal leading-tight text-[#122238] md:text-6xl">
              Have a question? <span className="text-[#6F5A35]">Ask DARIE.</span>
            </h2>
            <div className="mb-8 h-px w-24 bg-[#B49A68]" />

            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-[#292B2D]/75">
              Our digital property concierge is available 24/7 to help you explore Dubai communities, compare investment opportunities, and connect with a senior advisor when you are ready.
            </p>

            <div className="mb-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-[#F5F0E6] text-[#6F5A35]">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#122238]">Instant Answers</h4>
                  <p className="text-sm leading-relaxed text-[#292B2D]/65">Get immediate responses about Dubai areas, prices, and investment trends.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-[#F5F0E6] text-[#6F5A35]">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#122238]">Private & Secure</h4>
                  <p className="text-sm leading-relaxed text-[#292B2D]/65">Your conversation is confidential and handled with care.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[2px] border border-[#E6DED0] bg-[#F5F0E6] text-[#6F5A35]">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#122238]">Human Handoff</h4>
                  <p className="text-sm leading-relaxed text-[#292B2D]/65">When you are ready, DARIE connects you with a Lockwood & Carter property advisor.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openDarie}
              className="inline-flex min-h-12 items-center gap-2 rounded-[2px] bg-[#122238] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D334E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49A68]"
            >
              Ask DARIE
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="border border-[#B49A68]/25 bg-[#101820] p-5 shadow-xl sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[2px] bg-[#F5F0E6]">
                <img
                  src="/lockwood-assets/general/brand/lockwood-carter-monogram-transparent.png"
                  alt=""
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">DARIE</p>
                <p className="text-xs text-white/60">Property Concierge</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-xs text-white/60">Online</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="max-w-[82%] rounded-[4px] bg-white/10 p-4">
                <p className="text-sm leading-relaxed text-white/90">
                  Welcome to Lockwood & Carter. I am DARIE, your property concierge. I can help you explore Dubai properties, compare investments, and connect you with our senior advisors.
                </p>
              </div>
              <div className="max-w-[82%] rounded-[4px] bg-white/10 p-4">
                <p className="text-sm leading-relaxed text-white/90">
                  Are you looking for a home to live in, or are you exploring a property investment?
                </p>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[82%] rounded-[4px] bg-[#B49A68] p-4">
                  <p className="text-sm leading-relaxed text-[#101820]">
                    I am looking for an investment property in Dubai Marina.
                  </p>
                </div>
              </div>
              <div className="max-w-[82%] rounded-[4px] bg-white/10 p-4">
                <p className="text-sm leading-relaxed text-white/90">
                  Excellent choice. Dubai Marina offers strong rental demand and an established waterfront lifestyle. What budget range would you like to work with?
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openDarie}
              className="mt-6 flex w-full items-center gap-2 rounded-[2px] border border-white/10 bg-white/10 px-4 py-3 text-left text-sm text-white/55 transition-colors hover:border-[#B49A68]/70 hover:text-white"
            >
              <span className="flex-1">Ask about Dubai properties...</span>
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[2px] bg-[#F5F0E6] text-[#122238]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
