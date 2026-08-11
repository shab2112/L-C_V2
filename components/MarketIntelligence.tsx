import React, { useState, useCallback, useRef, useEffect } from 'react';
// FIX: The geminiService file is no longer empty, so this import will work.
import { generateMarketReport } from '../services/geminiService';
import { MarketReportResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { TokenIcon } from './icons/TokenIcon';
import { CashIcon } from './icons/CashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import InfographicReport from './InfographicReport';
import PrintableReport from './PrintableReport';

const CITIES = [
  'Abu Dhabi', 'Bangalore', 'Chennai', 'Delhi', 'Dubai', 'Hyderabad', 'London', 
  'Los Angeles', 'Mumbai', 'New York', 'Paris', 'Shanghai', 'Singapore', 'Sydney', 'Tokyo'
];

const METRIC_CATEGORIES = [
  { id: 'Pricing', name: 'Pricing' },
  { id: 'Investment Returns', name: 'Investment Returns' },
  { id: 'Market Activity', name: 'Market Activity' },
  { id: 'Supply & Development', name: 'Supply & Development' },
  { id: 'Economic Factors', name: 'Economic Factors' },
  { id: 'Livability & Infrastructure', name: 'Livability & Infrastructure' },
  { id: 'Regulatory & Ownership', name: 'Regulatory & Ownership' },
  { id: 'Currency Stability & Exchange Rate', name: 'Currency Stability & Exchange Rate' },
];

const MarketIntelligence: React.FC = () => {
  const [primaryCity, setPrimaryCity] = useState<string>(CITIES[4]);
  const [comparisonCities, setComparisonCities] = useState<string[]>(['London', 'New York', 'Singapore']);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Pricing', 'Investment Returns', 'Market Activity']);
  const [result, setResult] = useState<MarketReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPrintable, setShowPrintable] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const handleComparisonCityChange = (city: string) => {
    setComparisonCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const handleMetricChange = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  const handleGenerate = useCallback(async () => {
    if (!primaryCity) {
      setError('Please select a primary city.');
      return;
    }
    if (selectedMetrics.length === 0) {
      setError('Please select at least one metric to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const reportResult = await generateMarketReport(primaryCity, comparisonCities, selectedMetrics);
      setResult(reportResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [primaryCity, comparisonCities, selectedMetrics]);

  const handleGeneratePdf = () => {
    if (!result) return;
    setIsGeneratingPdf(true);
    setShowPrintable(true);
  };

  useEffect(() => {
    if (showPrintable && printRef.current) {
      const { jsPDF } = window.jspdf;
      const element = printRef.current;
      const generationDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      window.html2canvas(element, { 
        scale: 3, 
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        onclone: (clonedDoc: Document) => {
            const el = clonedDoc.getElementById('printable-report-container');
            if (el) el.style.display = 'block';
        }
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'pt', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const lineHeight = 21.85; 
        const marginTop = 85; // Luxurious gutter on subsequent pages
        const maxContentArea = pdfHeight - marginTop - 110; 
        const effectiveContentHeight = Math.floor(maxContentArea / lineHeight) * lineHeight;
        const marginBottom = pdfHeight - marginTop - effectiveContentHeight;
    
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / pdfWidth;
        const scaledTotalHeight = imgHeight / ratio;
        
        const totalPages = Math.ceil(scaledTotalHeight / effectiveContentHeight);

        const applyGuttersAndBranding = (page: number, total: number) => {
            // WIPE TOP (Header safe zone)
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pdfWidth, marginTop, 'F');
            
            // WIPE BOTTOM (Footer safe zone)
            pdf.rect(0, pdfHeight - marginBottom, pdfWidth, marginBottom, 'F');
            
            // Footer Branding
            pdf.setDrawColor(212, 175, 55); // Brand Gold
            pdf.setLineWidth(1.5);
            pdf.line(40, pdfHeight - 75, pdfWidth - 40, pdfHeight - 75);

            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            
            pdf.text('Report generated by LOCKWOOD & CARTER Intelligence', 40, pdfHeight - 50);
            pdf.text(`Page ${page} of ${total}`, pdfWidth / 2, pdfHeight - 50, { align: 'center' });
            pdf.text(`Generated on ${generationDate}`, pdfWidth - 40, pdfHeight - 50, { align: 'right' });
            
            pdf.setFontSize(7);
            pdf.setTextColor(160, 160, 160);
            pdf.text('© 2026 Lockwood & Carter. This market intelligence report is for informational purposes only.', pdfWidth / 2, pdfHeight - 35, { align: 'center' });
        };

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) pdf.addPage();
            
            // Offset logic to prevent text slicing
            const yOffset = marginTop - (i * effectiveContentHeight);
            
            pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfWidth, scaledTotalHeight);
            
            applyGuttersAndBranding(i + 1, totalPages);
        }

        pdf.save(`Market-Intelligence-Report-${primaryCity.replace(/\s+/g, '-')}.pdf`);
        setShowPrintable(false);
        setIsGeneratingPdf(false);
      }).catch(err => {
        setError("Failed to generate PDF. A technical error occurred.");
        console.error("PDF Generation Error:", err);
        setShowPrintable(false);
        setIsGeneratingPdf(false);
      });
    }
  }, [showPrintable, primaryCity, result]);

  return (
    <>
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ChartBarIcon className="w-8 h-8 text-brand-gold" />
        <h2 className="text-2xl font-bold text-brand-text">Market Intelligence Engine</h2>
      </div>

      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md">{error}</div>}

      <div className="bg-brand-secondary p-6 rounded-xl shadow-lg flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="primary-city" className="block font-medium text-brand-light mb-2">
              1. Select Primary City
            </label>
            <select
              id="primary-city"
              value={primaryCity}
              onChange={(e) => setPrimaryCity(e.target.value)}
              className="w-full bg-brand-primary border border-brand-accent rounded-md p-3 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition text-brand-text"
            >
              {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium text-brand-light mb-2">
              2. Select Comparison Cities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-brand-primary rounded-md border border-brand-accent max-h-32 overflow-y-auto">
              {CITIES.filter(c => c !== primaryCity).map(city => (
                <label key={city} className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comparisonCities.includes(city)}
                    onChange={() => handleComparisonCityChange(city)}
                    className="form-checkbox bg-brand-primary border-brand-accent text-brand-gold focus:ring-brand-gold"
                  />
                  {city}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block font-medium text-brand-light mb-2">
            3. Choose Metrics for Report
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {METRIC_CATEGORIES.map(metric => (
              <button
                key={metric.id}
                onClick={() => handleMetricChange(metric.id)}
                className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${
                  selectedMetrics.includes(metric.id)
                    ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                    : 'bg-brand-primary border-brand-accent text-brand-light hover:border-brand-light'
                }`}
              >
                {metric.name}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto self-start bg-brand-gold text-brand-primary font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors disabled:bg-brand-accent disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-t-transparent border-brand-primary rounded-full animate-spin"></div>
              Analyzing Global Data...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Generate Intelligence Report
            </>
          )}
        </button>
      </div>

      {isLoading && (
         <div className="flex-1 bg-brand-secondary p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-brand-light">
            <div className="w-12 h-12 border-4 border-t-transparent border-brand-gold rounded-full animate-spin"></div>
            <p className="mt-4 text-lg">Analyzing global market data...</p>
            <p className="text-sm">This may take a moment.</p>
         </div>
      )}

      {result && (
          <div className="bg-brand-secondary p-6 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-brand-accent pb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-brand-light bg-brand-primary px-3 py-1.5 rounded-full border border-brand-accent">
                   <TokenIcon className="w-3.5 h-3.5 text-brand-gold" />
                   <span>~{Math.round(result.tokenCount || 0)} tokens</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-light bg-brand-primary px-3 py-1.5 rounded-full border border-brand-accent">
                   <CashIcon className="w-3.5 h-3.5 text-brand-gold" />
                   <span>Cost: FREE (Flash)</span>
                </div>
              </div>
              <button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="bg-brand-primary text-brand-text border border-brand-gold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-gold hover:text-brand-primary transition-all font-bold"
              >
                {isGeneratingPdf ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                ) : (
                  <DownloadIcon className="w-4 h-4" />
                )}
                Download PDF Report
              </button>
            </div>

            <div className="bg-brand-primary p-6 rounded-xl border border-brand-accent overflow-hidden">
                <div className="mb-4 flex items-center gap-2">
                   <SparklesIcon className="w-5 h-5 text-brand-gold" />
                   <h3 className="text-sm font-bold text-brand-gold uppercase tracking-widest">Intelligence Report</h3>
                </div>
                <div className="custom-markdown-content overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    <InfographicReport content={result.report} />
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden container for PDF generation */}
      {showPrintable && result && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '595pt' }}>
          <div ref={printRef} id="printable-report-container">
            <PrintableReport report={result} primaryCity={primaryCity} />
          </div>
        </div>
      )}
    </>
  );
};

export default MarketIntelligence;