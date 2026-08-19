import React, { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, Globe2, Shield, TrendingUp } from 'lucide-react';
import {
  getHousingMarkets,
  getIntelligenceSettings,
  HousingMarket,
} from '../../lib/propertyIntelligenceStore';
import { DataType, IndexType, PriceUnit, TimePeriod } from '../../lib/housingData';
import { Page } from '../../lockwood-types';
import GlobalHousingGlobe from './GlobalHousingGlobe';

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
  const [investmentIntro, setInvestmentIntro] = useState(getIntelligenceSettings().investmentIntro);
  const [housingInfoText, setHousingInfoText] = useState(getIntelligenceSettings().housingInfoText);
  const [dataType, setDataType] = useState<DataType>('price');
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('sqft');
  const [indexType, setIndexType] = useState<IndexType>('nominal');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1Y');

  useEffect(() => {
    const load = () => {
      setMarkets(getHousingMarkets());
      setInvestmentIntro(getIntelligenceSettings().investmentIntro);
    };
    load();
    window.addEventListener('lc-property-intelligence-updated', load);
    return () => window.removeEventListener('lc-property-intelligence-updated', load);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/hp-data', { cache: 'no-store' })
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('HP metadata unavailable'))))
      .then(data => {
        if (!active || !data?.success || !data.data?.infoText) return;
        setHousingInfoText(data.data.infoText);
      })
      .catch(() => {
        if (active) setHousingInfoText(getIntelligenceSettings().housingInfoText);
      });

    return () => {
      active = false;
    };
  }, []);

  const primaryControlClass = (isActive: boolean) =>
    `inline-flex min-h-12 w-full items-center justify-between gap-3 border px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
      isActive
        ? 'border-[#F5F0E6] bg-[#F5F0E6] text-[#122238]'
        : 'border-[#B49A68]/45 bg-[#122238] text-[#F5F0E6] hover:border-[#F5F0E6]/70 hover:bg-[#162840]'
    }`;

  const optionControlClass = (isActive: boolean) =>
    `min-h-10 border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
      isActive
        ? 'border-[#B49A68] bg-[#B49A68] text-[#122238]'
        : 'border-white/15 bg-black/20 text-[#F5F0E6]/75 hover:border-[#B49A68]/60 hover:text-[#F5F0E6]'
    }`;

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
              {investmentIntro}
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
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B49A68]">Global Housing Intelligence</p>
              <h3 className="mt-2 max-w-md font-serif text-2xl font-normal leading-snug text-[#F5F0E6]">
                Compare Dubai against global residential markets
              </h3>
              </div>
            </div>

            <div className="mb-5 space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDataType('price')}
                className={primaryControlClass(dataType === 'price')}
              >
                <span>Housing Price</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDataType('index')}
                className={primaryControlClass(dataType === 'index')}
              >
                <span>Housing Price Index</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              </div>

              {dataType === 'price' && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPriceUnit('sqm')} className={optionControlClass(priceUnit === 'sqm')}>
                    Price per sqm
                  </button>
                  <button type="button" onClick={() => setPriceUnit('sqft')} className={optionControlClass(priceUnit === 'sqft')}>
                    Price per sqft
                  </button>
                </div>
              )}

              {dataType === 'index' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setIndexType('nominal')} className={optionControlClass(indexType === 'nominal')}>
                      Nominal
                    </button>
                    <button type="button" onClick={() => setIndexType('inflAdj')} className={optionControlClass(indexType === 'inflAdj')}>
                      Inflation Adjusted
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['1Y', '5Y', '10Y'] as TimePeriod[]).map(period => (
                      <button key={period} type="button" onClick={() => setTimePeriod(period)} className={optionControlClass(timePeriod === period)}>
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <GlobalHousingGlobe
              fallbackMarkets={markets}
              dataType={dataType}
              priceUnit={priceUnit}
              indexType={indexType}
              timePeriod={timePeriod}
            />

            <div className="mt-5 border border-[#B49A68]/25 bg-black/20 p-3 text-xs leading-relaxed text-[#F5F0E6]/70">
              {housingInfoText}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
