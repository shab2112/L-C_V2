import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Globe2, Shield, TrendingUp } from 'lucide-react';
import {
  getHousingMarkets,
  getIntelligenceSettings,
  HousingMarket,
  IntelligenceSettings,
} from '../../lib/propertyIntelligenceStore';
import { Page } from '../../lockwood-types';

interface InvestmentIntelligenceSectionProps {
  onNavigate: (page: Page) => void;
}

const highlights = [
  {
    icon: TrendingUp,
    title: '7-10% net rental yield',
    description: 'Prime areas remain competitive, while selected emerging communities can offer stronger income-led cases.',
  },
  {
    icon: Shield,
    title: 'Tax-efficient ownership',
    description: 'No personal income tax or capital gains tax on residential property under current UAE rules.',
  },
  {
    icon: Globe2,
    title: 'Global buyer access',
    description: 'Freehold zones, remote purchase pathways, and clear registration processes support overseas buyers.',
  },
  {
    icon: BarChart3,
    title: 'Population growth engine',
    description: 'Long-term housing demand is supported by Dubai population growth, infrastructure, and business migration.',
  },
];

export const InvestmentIntelligenceSection: React.FC<InvestmentIntelligenceSectionProps> = ({ onNavigate }) => {
  const [markets, setMarkets] = useState<HousingMarket[]>([]);
  const [settings, setSettings] = useState<IntelligenceSettings>(getIntelligenceSettings());
  const [metric, setMetric] = useState<'price' | 'growth'>('price');

  useEffect(() => {
    const load = () => {
      setMarkets(getHousingMarkets());
      setSettings(getIntelligenceSettings());
    };
    load();
    window.addEventListener('lc-property-intelligence-updated', load);
    return () => window.removeEventListener('lc-property-intelligence-updated', load);
  }, []);

  const sortedMarkets = useMemo(() => {
    return [...markets].sort((a, b) => metric === 'price' ? b.usdPerSqft - a.usdPerSqft : b.hpi5Y - a.hpi5Y);
  }, [markets, metric]);

  const maxValue = Math.max(...sortedMarkets.map(market => metric === 'price' ? market.usdPerSqft : market.hpi5Y), 1);

  return (
    <section className="bg-[#F5F0E6] py-24 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#6D2636]">Investment Intelligence</p>
            <h2 className="mb-6 font-serif text-4xl font-normal leading-tight text-[#122238] md:text-6xl">
              Invest with intelligence.
            </h2>
            <div className="mb-8 h-px w-24 bg-[#B49A68]" />
            <p className="mb-8 text-lg leading-relaxed text-[#292B2D]/75">
              {settings.investmentIntro}
            </p>

            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {highlights.map(item => (
                <div key={item.title} className="flex min-h-[132px] gap-4 border border-[#E6DED0] bg-white p-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-[#F5F0E6] text-[#6F5A35]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-[#122238]">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-[#292B2D]/65">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('PROJECTS')}
              className="inline-flex min-h-12 items-center gap-2 bg-[#122238] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D334E]"
            >
              Explore Investment Opportunities
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="border border-[#B49A68]/25 bg-[#101820] p-5 shadow-xl sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B49A68]">Global Housing Intelligence</p>
              <h3 className="mt-2 max-w-md font-serif text-2xl font-normal leading-snug text-[#F5F0E6]">
                Compare Dubai against global residential markets
              </h3>
              </div>
              <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMetric('price')}
                className={`min-h-11 px-4 py-2 text-xs font-semibold transition-colors ${metric === 'price' ? 'bg-[#F5F0E6] text-[#122238]' : 'border border-white/20 text-white/75 hover:border-white/40 hover:text-white'}`}
              >
                Price / sqft
              </button>
              <button
                type="button"
                onClick={() => setMetric('growth')}
                className={`min-h-11 px-4 py-2 text-xs font-semibold transition-colors ${metric === 'growth' ? 'bg-[#F5F0E6] text-[#122238]' : 'border border-white/20 text-white/75 hover:border-white/40 hover:text-white'}`}
              >
                5Y growth
              </button>
              </div>
            </div>

            <div className="space-y-4">
              {sortedMarkets.map(market => {
                const value = metric === 'price' ? market.usdPerSqft : market.hpi5Y;
                return (
                  <div key={`${market.city}-${market.country}`}>
                    <div className="mb-2 flex justify-between gap-4 text-xs text-[#F5F0E6]/80">
                      <span>{market.city}, {market.country}</span>
                      <span className="font-semibold text-[#F5F0E6]">{metric === 'price' ? `$${market.usdPerSqft.toLocaleString()}` : `${market.hpi5Y}%`}</span>
                    </div>
                    <div className="h-2.5 bg-white/10">
                      <div
                        className="h-full bg-[#B49A68]"
                        style={{ width: `${Math.max(6, (value / maxValue) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border border-[#B49A68]/25 bg-black/20 p-3 text-xs leading-relaxed text-[#F5F0E6]/70">
              {settings.housingInfoText}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
