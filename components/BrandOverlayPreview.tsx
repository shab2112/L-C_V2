import React from 'react';
import { SocialPlatform } from '../types';
import { BrandTemplateId, brandingConfig } from '../data/branding';
import { FacebookIcon } from './icons/FacebookIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { InstagramIcon } from './icons/InstagramIcon';

interface BrandOverlayPreviewProps {
  imageSrc: string;
  projectName: string;
  developer?: string;
  platform: SocialPlatform;
  templateId?: BrandTemplateId;
  ctaUrl?: string;
}

const platformIcons = {
  [SocialPlatform.Facebook]: FacebookIcon,
  [SocialPlatform.LinkedIn]: LinkedInIcon,
  [SocialPlatform.Instagram]: InstagramIcon,
};

const getTemplate = (templateId: BrandTemplateId = 'residence') =>
  brandingConfig.templates.find(template => template.id === templateId) || brandingConfig.templates[1];

const BrandOverlayPreview: React.FC<BrandOverlayPreviewProps> = ({
  imageSrc,
  projectName,
  developer,
  platform,
  templateId = 'residence',
  ctaUrl,
}) => {
  const template = getTemplate(templateId);
  const PlatformIcon = platformIcons[platform] || FacebookIcon;
  const colors = brandingConfig.colors;
  const accentColor = template.accent === 'oxblood' ? colors.oxblood : colors.brass;
  const headlineFont = template.headlineFont === 'serif' ? brandingConfig.fonts.display : brandingConfig.fonts.body;

  const frameStyle: React.CSSProperties = {
    fontFamily: brandingConfig.fonts.body,
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: template.background === 'midnight' ? colors.midnight : colors.parchment,
    color: template.background === 'midnight' ? colors.white : colors.charcoal,
    borderRadius: 4,
    overflow: 'hidden',
    border: `1px solid ${colors.limestone}`,
  };

  if (template.id === 'journal') {
    return (
      <div style={frameStyle}>
        <div style={{ padding: 24, display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100%', gap: 18 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img src={brandingConfig.wordmarkUrl} alt={brandingConfig.brandName} style={{ width: 154, height: 'auto' }} />
            <span style={{ color: colors.oxblood, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              {platform}
            </span>
          </header>
          <main style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: 18 }}>
            <div style={{ overflow: 'hidden', border: `1px solid ${colors.limestone}` }}>
              <img src={imageSrc} alt={`${projectName} preview`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ width: 72, height: 2, background: colors.oxblood, marginBottom: 14 }} />
              <p style={{ margin: '0 0 8px', color: colors.brassDark, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                {developer || 'Selected property'}
              </p>
              <h3 style={{ margin: 0, fontFamily: headlineFont, color: colors.midnight, fontSize: 28, lineHeight: 1.08, fontWeight: 400 }}>
                {projectName}
              </h3>
            </div>
          </main>
          <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: colors.charcoal }}>
            <span>{brandingConfig.disclaimer}</span>
            <PlatformIcon style={{ width: 20, height: 20, color: colors.oxblood }} />
          </footer>
        </div>
      </div>
    );
  }

  if (template.id === 'briefing') {
    return (
      <div style={frameStyle}>
        <div style={{ padding: 24, display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100%', gap: 20 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img src={brandingConfig.wordmarkUrl} alt={brandingConfig.brandName} style={{ width: 160, height: 'auto', filter: 'brightness(0) invert(1)' }} />
            <PlatformIcon style={{ width: 22, height: 22, color: colors.brass }} />
          </header>
          <main style={{ display: 'grid', alignContent: 'center', gap: 18 }}>
            <div style={{ width: 88, height: 2, background: colors.brass }} />
            <p style={{ margin: 0, color: colors.limestone, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              {developer || 'Project briefing'}
            </p>
            <h3 style={{ margin: 0, fontFamily: headlineFont, color: colors.white, fontSize: 34, lineHeight: 1.08, fontWeight: 700 }}>
              {projectName}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['Developer', 'Project', 'Platform', 'Status'].map((label, index) => (
                <div key={label} style={{ borderTop: `1px solid ${colors.brass}`, paddingTop: 10 }}>
                  <p style={{ margin: '0 0 4px', color: colors.limestone, fontSize: 10, textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ margin: 0, color: colors.white, fontSize: 13, fontWeight: 700 }}>
                    {[developer || 'Ask advisor', projectName, platform, 'Draft'][index]}
                  </p>
                </div>
              ))}
            </div>
          </main>
          <footer style={{ fontSize: 10, color: colors.limestone }}>{brandingConfig.disclaimer}</footer>
        </div>
      </div>
    );
  }

  return (
    <div style={frameStyle}>
      <img src={imageSrc} alt={`${projectName} preview`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(16, 24, 32, ${colors.overlayOpacity}) 0%, rgba(16, 24, 32, 0.18) 58%, rgba(16, 24, 32, 0.08) 100%)` }} />
      <div style={{ position: 'absolute', inset: 0, padding: 24, display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 18 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <img src={brandingConfig.monogramUrl} alt={brandingConfig.brandName} style={{ width: 54, height: 54, objectFit: 'contain', background: colors.parchment, padding: 5 }} />
          <PlatformIcon style={{ width: 22, height: 22, color: colors.white }} />
        </header>
          <main style={{ alignSelf: 'end', background: colors.midnight, color: colors.white, padding: 18, borderLeft: `3px solid ${accentColor}` }}>
          <p style={{ margin: '0 0 8px', color: colors.limestone, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
            {developer || 'Selected property'}
          </p>
          <h3 style={{ margin: 0, fontFamily: headlineFont, fontSize: 30, lineHeight: 1.06, fontWeight: 400 }}>
            {projectName}
          </h3>
          <button type="button" style={{ marginTop: 14, background: colors.parchment, color: colors.midnight, border: 0, borderRadius: brandingConfig.ctaStyle.borderRadius, padding: '9px 14px', fontSize: 12, fontWeight: 700 }}>
            {brandingConfig.ctaStyle.text}
          </button>
          {ctaUrl && (
            <p style={{ margin: '10px 0 0', color: colors.limestone, fontSize: 10 }}>
              {ctaUrl}
            </p>
          )}
        </main>
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: colors.white, fontSize: 10 }}>
          <span>{brandingConfig.disclaimer}</span>
          <img src={brandingConfig.wordmarkUrl} alt="" style={{ width: 112, height: 'auto', filter: 'brightness(0) invert(1)' }} />
        </footer>
      </div>
    </div>
  );
};

export default BrandOverlayPreview;
