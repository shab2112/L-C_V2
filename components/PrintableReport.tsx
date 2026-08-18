
import React from 'react';
import { MarketReportResult } from '../types';
import { brandingConfig } from '../data/branding';
import MarkdownRenderer from './MarkdownRenderer';

interface PrintableReportProps {
  report: MarketReportResult;
  primaryCity: string;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ report, primaryCity }) => {
  return (
    <div style={{
      width: '595pt', // A4 width in points
      backgroundColor: 'white',
      color: '#000000', // Absolute black for maximum visibility
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: 1.6,
      margin: '0 auto',
    }}>
      <div style={{ padding: '50pt 50pt 120pt 50pt' }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '2pt solid #D4AF37', 
          paddingBottom: '20pt', 
          marginBottom: '30pt' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15pt' }}>
            <img 
              src={brandingConfig.logoUrl} 
              alt="Logo" 
              style={{ width: '60pt', height: '60pt', objectFit: 'contain' }} 
            />
            <h1 style={{ 
              color: '#000000', 
              fontSize: '22pt', 
              fontWeight: 'bold', 
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Lockwood & Carter Market Comparison Report
            </h1>
          </div>
        </header>

        {/* Report Body */}
        <main>
          <div
            className="print-markdown-override"
            style={{
              color: '#000000',
              opacity: 1,
              fontWeight: 400,
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            <MarkdownRenderer content={report.report} />
          </div>

          {/* Sources Section */}
          {report.sources && report.sources.length > 0 && (
            <section style={{ marginTop: '50pt', borderTop: '1pt solid #EEE', paddingTop: '30pt', color: '#000000',
        opacity: 1, }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#000000', opacity: 1, marginBottom: '15pt' }}>
                Vetted Data & Sources
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {report.sources.map((source, index) => (
                  source.web && (
                    <li key={index} style={{ marginBottom: '8pt', fontSize: '10pt', color: '#000000',
                  opacity: 1,}}>
                      <span style={{ color: '#D4AF37', marginRight: '8pt', fontWeight: 'bold', opacity: 1}}>•</span>
                      <a href={source.web.uri} target="_blank" rel="noopener noreferrer" style={{ color: '#000000', textDecoration: 'none', borderBottom: '1px solid #CCC', opacity: 1, }}>
                        {source.web.title || source.web.uri}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrintableReport;
