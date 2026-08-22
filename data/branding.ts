export type BrandTemplateId = 'journal' | 'residence' | 'briefing';

export interface BrandTemplate {
  id: BrandTemplateId;
  name: string;
  description: string;
  bestUse: string;
  background: 'parchment' | 'image' | 'midnight';
  headlineFont: 'serif' | 'sans';
  accent: 'oxblood' | 'brass';
}

export interface BrandingConfig {
  brandName: string;
  logoUrl: string;
  wordmarkUrl: string;
  monogramUrl: string;
  colors: {
    ink: string;
    midnight: string;
    midnightRaised: string;
    parchment: string;
    limestone: string;
    charcoal: string;
    white: string;
    brass: string;
    brassDark: string;
    oxblood: string;
    success: string;
    error: string;
    overlayOpacity: number;
  };
  fonts: {
    display: string;
    body: string;
  };
  ctaStyle: {
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    text: string;
  };
  disclaimer: string;
  templates: BrandTemplate[];
}

export const brandingConfig: BrandingConfig = {
  brandName: 'Lockwood & Carter Real Estate',
  logoUrl: '/lockwood-assets/general/brand/lockwood-carter-monogram-transparent.png',
  wordmarkUrl: '/lockwood-assets/general/brand/lockwood-carter-wordmark.svg',
  monogramUrl: '/lockwood-assets/general/brand/lockwood-carter-monogram-transparent.png',
  colors: {
    ink: '#101820',
    midnight: '#122238',
    midnightRaised: '#1D334E',
    parchment: '#F5F0E6',
    limestone: '#E6DED0',
    charcoal: '#292B2D',
    white: '#FFFFFF',
    brass: '#B49A68',
    brassDark: '#6F5A35',
    oxblood: '#6D2636',
    success: '#35735A',
    error: '#A84C46',
    overlayOpacity: 0.72,
  },
  fonts: {
    display: '"Libre Baskerville", Georgia, serif',
    body: 'Manrope, Arial, sans-serif',
  },
  ctaStyle: {
    backgroundColor: '#122238',
    textColor: '#FFFFFF',
    borderRadius: 2,
    text: 'Register interest',
  },
  disclaimer: 'Marketed by Lockwood & Carter Real Estate. Availability and pricing subject to developer confirmation.',
  templates: [
    {
      id: 'journal',
      name: 'The Journal',
      description: 'Parchment, serif headline, folio, fine oxblood rule, disciplined image crop.',
      bestUse: 'Insights, neighbourhoods, advisor views',
      background: 'parchment',
      headlineFont: 'serif',
      accent: 'oxblood',
    },
    {
      id: 'residence',
      name: 'The Residence',
      description: 'Full-bleed property image, minimal midnight panel, small descriptor, quiet wordmark.',
      bestUse: 'Listings, launches, films',
      background: 'image',
      headlineFont: 'serif',
      accent: 'brass',
    },
    {
      id: 'briefing',
      name: 'The Briefing',
      description: 'Midnight field, Manrope data, one brass rule, sourced project facts.',
      bestUse: 'Market findings, reports, investor education',
      background: 'midnight',
      headlineFont: 'sans',
      accent: 'brass',
    },
  ],
};
