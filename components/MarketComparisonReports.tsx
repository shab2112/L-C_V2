import React, { useState, useCallback, useEffect } from 'react';
import { fetchMarketComparisonCities, generateMarketReport } from '../services/geminiService';
import { HousePriceDataRow, MarketReportResult } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import InfographicReport from './InfographicReport';

const HOUSE_PRICE_CITIES_FALLBACK = [
  'Amsterdam', 'Andorra', 'Athens', 'Bangkok', 'Beijing', 'Belgrade', 'Berlin',
  'Bratislava', 'Brussels', 'Budapest', 'Copenhagen', 'Doha', 'Dubai', 'Dublin',
  'Helsinki', 'Hong Kong', 'Lisbon', 'Ljubljana', 'London', 'Luxembourg City',
  'Macau', 'Madrid', 'Manila', 'Milan', 'Montevideo', 'Moscow', 'Mumbai',
  'New York', 'Oslo', 'Paris', 'Prague', 'Puerto Rico', 'Reykjavik', 'Riga',
  'Seoul', 'Singapore', 'Stockholm', 'Taipei City', 'Tallinn', 'Tokyo',
  'Toronto', 'Vienna', 'Vilnius', 'Warsaw', 'Zagreb', 'Zurich',
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

const formatUsd = (value?: number | null) =>
  typeof value === 'number' ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A';

const formatPercent = (value?: number | null) =>
  typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A';

const stripMarkdown = (value: string) =>
  value
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
    .replace(/[\u201c\u201d\u201e\u201f]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u0080|\u0081|\u0082|\u0083|\u0084|\u0085|\u0086|\u0087|\u0088|\u0089|\u008a|\u008b|\u008c|\u008d|\u008e|\u008f|\u0090|\u0091|\u0092|\u0093|\u0094|\u0095|\u0096|\u0097|\u0098|\u0099|\u009a|\u009b|\u009c|\u009d|\u009e|\u009f/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*]\s+/, '')
    .trim();

const parseMarkdownTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => stripMarkdown(cell.replace(/<br\s*\/?>/gi, ' / ').trim()));

const isMarkdownTableDivider = (line: string) => {
  const cells = parseMarkdownTableRow(line);
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, '')));
};

const loadImageDataUrl = (src: string) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Unable to create image canvas.'));
        return;
      }
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });

const MarketComparisonReports: React.FC = () => {
  const [availableCities, setAvailableCities] = useState<string[]>(HOUSE_PRICE_CITIES_FALLBACK);
  const [primaryCity, setPrimaryCity] = useState<string>('Dubai');
  const [comparisonCities, setComparisonCities] = useState<string[]>(['London', 'New York', 'Singapore']);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['Pricing', 'Investment Returns', 'Market Activity']);
  const [result, setResult] = useState<MarketReportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchMarketComparisonCities()
      .then(cities => {
        if (!isMounted || !cities.length) return;
        setAvailableCities(cities);
        setPrimaryCity(current => cities.includes(current) ? current : cities[0]);
        setComparisonCities(current => {
          const valid = current.filter(city => cities.includes(city));
          return valid.length ? valid : cities.filter(city => city !== 'Dubai').slice(0, 3);
        });
      })
      .catch(err => {
        console.warn('Unable to load house-price city list; using bundled fallback.', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  
  const handleComparisonCityChange = (city: string) => {
    if (city === primaryCity) return;
    setComparisonCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const handlePrimaryCityChange = (city: string) => {
    setPrimaryCity(city);
    setComparisonCities(prev => prev.filter(comparisonCity => comparisonCity !== city));
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
      const validComparisonCities = comparisonCities.filter(city => city !== primaryCity && availableCities.includes(city));
      const reportResult = await generateMarketReport(primaryCity, validComparisonCities, selectedMetrics);
      setResult(reportResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [primaryCity, comparisonCities, selectedMetrics, availableCities]);

  const handleGeneratePdf = async () => {
    if (!result) return;
    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = window.jspdf;
      const watermarkLogo = await loadImageDataUrl('/lockwood-assets/general/brand/lockwood-carter-final-logo-transparent.png');
      const headerLogo = await loadImageDataUrl('/lockwood-assets/general/brand/lockwood-carter-monogram-transparent.png');
      const generationDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 46;
      const topY = 98;
      const bottomY = pageHeight - 82;
      let page = 1;
      let y = topY;

      const addWatermark = () => {
        const watermarkWidth = 265;
        const watermarkHeight = 265;
        const x = (pageWidth - watermarkWidth) / 2;
        const watermarkY = (pageHeight - watermarkHeight) / 2 - 8;
        const graphicsState = new pdf.GState({ opacity: 0.055 });
        pdf.setGState(graphicsState);
        pdf.addImage(watermarkLogo, 'PNG', x, watermarkY, watermarkWidth, watermarkHeight);
        pdf.setGState(new pdf.GState({ opacity: 1 }));
      };

      const header = () => {
        pdf.addImage(headerLogo, 'PNG', marginX, 17, 46, 46);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(18, 34, 56);
        pdf.text('Market Comparison Report', pageWidth - marginX, 38, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(95, 95, 95);
        pdf.text(`Generated on ${generationDate}`, pageWidth - marginX, 52, { align: 'right' });
        pdf.setDrawColor(180, 150, 92);
        pdf.setLineWidth(0.7);
        pdf.line(marginX, 76, pageWidth - marginX, 76);
      };

      const decoratePage = () => {
        addWatermark();
        header();
        pdf.setDrawColor(180, 150, 92);
        pdf.setLineWidth(0.8);
        pdf.line(marginX, pageHeight - 58, pageWidth - marginX, pageHeight - 58);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(95, 95, 95);
        pdf.text('Report generated by LOCKWOOD & CARTER Market Comparison Reports', marginX, pageHeight - 40);
        pdf.text(`Page ${page}`, pageWidth - marginX, pageHeight - 40, { align: 'right' });
        pdf.setFontSize(6.8);
        pdf.text('(c) 2026 Lockwood & Carter. This market comparison report is for informational purposes only.', marginX, pageHeight - 24);
      };

      const addPage = () => {
        decoratePage();
        pdf.addPage();
        page += 1;
        y = topY;
      };

      const writeWrapped = (body: string, options: { size?: number; style?: 'normal' | 'bold'; color?: [number, number, number]; indent?: number; gapAfter?: number; lineHeight?: number } = {}) => {
        const size = options.size || 10;
        const lineHeight = options.lineHeight || size * 1.45;
        const indent = options.indent || 0;
        pdf.setFont('helvetica', options.style || 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(...(options.color || [20, 34, 56]));
        const lines = pdf.splitTextToSize(body, pageWidth - marginX * 2 - indent);
        for (const line of lines) {
          if (y + lineHeight > bottomY) addPage();
          pdf.text(line, marginX + indent, y);
          y += lineHeight;
        }
        y += options.gapAfter ?? 5;
      };

      const drawMarkdownTable = (tableLines: string[]) => {
        const rows = tableLines
          .filter(line => !isMarkdownTableDivider(line))
          .map(parseMarkdownTableRow)
          .filter(row => row.some(cell => cell));

        if (rows.length < 2) return;

        const columnCount = Math.max(...rows.map(row => row.length));
        const normalizedRows = rows.map(row => {
          const normalized = [...row];
          while (normalized.length < columnCount) normalized.push('');
          return normalized;
        });
        const [headers, ...bodyRows] = normalizedRows;
        const tableWidth = pageWidth - marginX * 2;
        const columnWidth = tableWidth / columnCount;
        const cellPaddingX = 5;
        const cellPaddingY = 5;
        const headerFontSize = columnCount > 5 ? 6.2 : 7;
        const bodyFontSize = columnCount > 5 ? 6.1 : 6.8;
        const minRowHeight = 20;
        const maxBodyLines = 6;

        const drawRow = (cells: string[], isHeader: boolean) => {
          pdf.setFont('helvetica', isHeader ? 'bold' : 'normal');
          pdf.setFontSize(isHeader ? headerFontSize : bodyFontSize);
          const lineHeight = (isHeader ? headerFontSize : bodyFontSize) * 1.25;
          const wrappedCells = cells.map(cell => {
            const lines = pdf.splitTextToSize(cell || '-', columnWidth - cellPaddingX * 2);
            return isHeader ? lines.slice(0, 4) : lines.slice(0, maxBodyLines);
          });
          const rowHeight = Math.max(
            minRowHeight,
            ...wrappedCells.map(lines => lines.length * lineHeight + cellPaddingY * 2)
          );

          if (y + rowHeight > bottomY) addPage();

          const rowTop = y;
          cells.forEach((_, index) => {
            const x = marginX + index * columnWidth;
            if (isHeader) {
              pdf.setFillColor(18, 34, 56);
              pdf.setTextColor(255, 255, 255);
            } else {
              pdf.setFillColor(255, 255, 255);
              pdf.setTextColor(20, 34, 56);
            }
            pdf.setDrawColor(210, 196, 166);
            pdf.setLineWidth(0.45);
            pdf.rect(x, rowTop, columnWidth, rowHeight, 'FD');
            pdf.text(wrappedCells[index], x + cellPaddingX, rowTop + cellPaddingY + lineHeight * 0.78);
          });

          y += rowHeight;
        };

        if (y + 26 > bottomY) addPage();
        y += 4;
        drawRow(headers, true);
        bodyRows.forEach(row => drawRow(row, false));
        y += 9;
      };

      header();
      addWatermark();

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(18, 34, 56);
      pdf.text('Lockwood & Carter Market Comparison Report', marginX, y);
      y += 25;
      writeWrapped(`Primary city: ${result.primaryCity || primaryCity}`, { size: 10, style: 'bold', gapAfter: 1 });
      writeWrapped(`Compared with: ${(result.comparisonCities || comparisonCities).join(', ') || 'None'}`, { size: 9.5, gapAfter: 1 });
      writeWrapped(`Generated: ${generationDate}`, { size: 9.5, gapAfter: 8 });
      if (result.housePriceData?.sourceUrl) {
        writeWrapped('House price source: L&C vetted quarterly house-price dataset', { size: 8.5, color: [80, 80, 80], gapAfter: 10 });
      }

      const reportLines = result.report.split('\n');
      for (let index = 0; index < reportLines.length; index += 1) {
        const line = reportLines[index].trim();
        if (!line) {
          y += 5;
          continue;
        }
        if (/^-{3,}$/.test(line)) {
          y += 3;
          continue;
        }
        if (line.startsWith('|')) {
          const tableLines: string[] = [];
          while (index < reportLines.length && reportLines[index].trim().startsWith('|')) {
            tableLines.push(reportLines[index].trim());
            index += 1;
          }
          index -= 1;
          drawMarkdownTable(tableLines);
          continue;
        }
        if (line.startsWith('# ')) {
          writeWrapped(stripMarkdown(line.replace(/^#\s+/, '')), { size: 15, style: 'bold', color: [111, 38, 54], gapAfter: 8 });
        } else if (line.startsWith('## ')) {
          y += 4;
          writeWrapped(stripMarkdown(line.replace(/^##\s+/, '')), { size: 12.5, style: 'bold', color: [18, 34, 56], gapAfter: 6 });
        } else if (line.startsWith('### ')) {
          writeWrapped(stripMarkdown(line.replace(/^###\s+/, '')), { size: 11, style: 'bold', color: [18, 34, 56], gapAfter: 4 });
        } else if (line.startsWith('#### ')) {
          writeWrapped(stripMarkdown(line.replace(/^####\s+/, '')), { size: 10, style: 'bold', color: [111, 38, 54], gapAfter: 4 });
        } else if (/^[-*]\s+/.test(line)) {
          writeWrapped(`- ${stripMarkdown(line)}`, { size: 9.2, indent: 10, gapAfter: 2 });
        } else {
          writeWrapped(stripMarkdown(line), { size: 9.5, gapAfter: 4 });
        }
      }

      decoratePage();
      pdf.save(`Market-Comparison-Report-${primaryCity.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      setError('Failed to generate PDF. A technical error occurred.');
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const dataRows: HousePriceDataRow[] = result?.housePriceData?.matchedRows || [];

  return (
    <>
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2">
        <ChartBarIcon className="w-6 h-6 text-brand-gold" />
        <h2 className="text-xl font-bold text-brand-text">Market Comparison Reports</h2>
      </div>

      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md">{error}</div>}

      <div className="flex flex-shrink-0 flex-col gap-3 rounded-lg bg-brand-secondary p-3 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primary-city" className="block text-sm font-medium text-brand-light mb-1.5">
              1. Select Primary City
            </label>
            <select
              id="primary-city"
              value={primaryCity}
              onChange={(e) => handlePrimaryCityChange(e.target.value)}
              className="w-full bg-brand-primary border border-brand-accent rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition text-brand-text"
            >
              {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-light mb-1.5">
              2. Select Comparison Cities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 px-3 py-2 bg-brand-primary rounded-md border border-brand-accent max-h-[74px] overflow-y-auto">
              {availableCities.filter(c => c !== primaryCity).map(city => (
                <label key={city} className="flex items-center gap-2 text-xs text-brand-text cursor-pointer">
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
          <label className="block text-sm font-medium text-brand-light mb-1.5">
            3. Choose Metrics for Report
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {METRIC_CATEGORIES.map(metric => (
              <button
                key={metric.id}
                onClick={() => handleMetricChange(metric.id)}
                className={`min-h-9 px-3 py-2 rounded-md border text-xs font-bold transition-all ${
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
          className="w-full sm:w-auto self-start bg-brand-gold text-brand-primary font-bold py-2 px-5 rounded-md flex items-center justify-center gap-2 text-sm hover:bg-yellow-400 transition-colors disabled:bg-brand-accent disabled:cursor-not-allowed"
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
         <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl bg-brand-secondary p-5 text-brand-light shadow-lg">
            <div className="w-9 h-9 border-4 border-t-transparent border-brand-gold rounded-full animate-spin"></div>
            <p className="mt-3 text-base">Analyzing global market data...</p>
            <p className="text-sm">Preparing the comparison report with the latest available validated inputs.</p>
         </div>
      )}

      {result && (
          <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-brand-secondary p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-3 flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-brand-accent pb-3">
              <div className="flex items-center gap-4">
                {dataRows.length ? (
                  <div className="flex items-center gap-2 text-xs text-brand-light bg-brand-primary px-3 py-1.5 rounded-full border border-brand-accent">
                    <span>{dataRows.length} vetted city rows applied</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-brand-light bg-brand-primary px-3 py-1.5 rounded-full border border-brand-accent">
                    <span>Adviser verification required for unavailable city data</span>
                  </div>
                )}
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

            <div className="mb-3 flex-shrink-0 rounded-lg border border-brand-accent bg-brand-primary/60 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-gold">Vetted Data Snapshot</h3>
                  <p className="mt-1 text-xs text-brand-light">
                    Source: L&C quarterly house-price dataset
                    {result.housePriceData?.sourceLastModified ? ` · Updated ${new Date(result.housePriceData.sourceLastModified).toLocaleDateString()}` : ''}
                  </p>
                </div>
                {result.housePriceData?.unavailableCities?.length ? (
                  <p className="text-xs text-amber-100">
                    Not in vetted dataset: {result.housePriceData.unavailableCities.join(', ')}
                  </p>
                ) : null}
              </div>
              {dataRows.length ? (
                <div className="max-h-36 overflow-auto rounded border border-brand-accent">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead className="sticky top-0 bg-brand-secondary text-brand-light">
                      <tr>
                        <th className="px-3 py-2">City</th>
                        <th className="px-3 py-2">Country</th>
                        <th className="px-3 py-2">USD/sqm</th>
                        <th className="px-3 py-2">USD/sqft</th>
                        <th className="px-3 py-2">HPI Nominal 1Y</th>
                        <th className="px-3 py-2">HPI Real 1Y</th>
                        <th className="px-3 py-2">HPI Real 5Y</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataRows.map(row => (
                        <tr key={row.city} className="border-t border-brand-accent text-brand-text">
                          <td className="px-3 py-2 font-semibold">{row.city}</td>
                          <td className="px-3 py-2 text-brand-light">{row.country}</td>
                          <td className="px-3 py-2">{formatUsd(row.usdPerSqm)}</td>
                          <td className="px-3 py-2">{formatUsd(row.usdPerSqft)}</td>
                          <td className="px-3 py-2">{formatPercent(row.hpiNominal1Y)}</td>
                          <td className="px-3 py-2">{formatPercent(row.hpiInflationAdjusted1Y)}</td>
                          <td className="px-3 py-2">{formatPercent(row.hpiInflationAdjusted5Y)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-brand-light">
                  No matching city rows were found in the vetted house-price dataset. The generated analysis should be adviser-verified before client presentation.
                </p>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-brand-accent bg-brand-primary p-4">
                <div className="mb-3 flex flex-shrink-0 items-center gap-2">
                   <SparklesIcon className="w-5 h-5 text-brand-gold" />
                   <h3 className="text-sm font-bold text-brand-gold uppercase tracking-widest">Intelligence Report</h3>
                </div>
                <div className="custom-markdown-content min-h-0 flex-1 overflow-y-auto pr-2 pb-8 custom-scrollbar">
                    <InfographicReport content={result.report} />
                </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MarketComparisonReports;
