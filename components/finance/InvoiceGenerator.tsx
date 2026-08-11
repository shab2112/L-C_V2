
import React, { useState, useRef, useEffect } from 'react';
import { generateCommissionInvoice } from '../../services/geminiService';
import { postToLedger } from '../../services/apiService';
import { InvoiceData } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { CashIcon } from '../icons/CashIcon';
import { CheckIcon } from '../icons/CheckIcon';
import PrintableInvoice from './PrintableInvoice';

interface InvoiceGeneratorProps {
    onBack: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = () => {
    // Persistent Configurations (Settings)
    const [agencyName, setAgencyName] = useState('AIN GLOBAL REAL ESTATE L.L.C.');
    const [agencyTrn, setAgencyTrn] = useState('104242688000003');
    const [agencyAddress, setAgencyAddress] = useState('Al Muteena, P.O.Box 91390, Dubai, UAE');
    const [agencyTel, setAgencyTel] = useState('+971 55 3423631');
    const [agencyEmail, setAgencyEmail] = useState('info@ainglobal.ae');
    const [paymentTerms, setPaymentTerms] = useState('Make all cheques payable to Ain Global Real Estate LLC..');

    // Bank Details Config (From Sample)
    const [bankName, setBankName] = useState('Mashreq Bank PSC');
    const [bankBranch, setBankBranch] = useState('Mashreq NEO');
    const [bankAccName, setBankAccName] = useState('Ain Global Real Estate L.L.C.');
    const [bankAccNum, setBankAccNum] = useState('019101215775');
    const [bankIban, setBankIban] = useState('AE180 33000 0019 101215 775');
    const [bankSwift, setBankSwift] = useState('BOMLAEAD');

    // Deal Specifics
    const [marketType, setMarketType] = useState<'Off-plan' | 'Secondary'>('Off-plan');
    const [propertyValue, setPropertyValue] = useState(1187828);
    const [commissionPct, setCommissionPct] = useState(5); // Total 5%
    
    // Billing Recipient
    const [recipientName, setRecipientName] = useState('ELLINGTON PROPERTIES DEVELOPMENT L.L.C');
    const [recipientTrn, setRecipientTrn] = useState('100486421900003');
    const [recipientAddress, setRecipientAddress] = useState('Burlington Tower 16th Floor, Al Abraj Street, Business Bay, Dubai, 117500, Dubai, UAE');
    
    // Secondary Party (Ref)
    const [buyerName, setBuyerName] = useState('ROHITH PRAKASH THAIKKAT');

    const [propertyName, setPropertyName] = useState('WINDSOR HOUSE II - TOWER A');
    const [unitNo, setUnitNo] = useState('A-317');
    const [stages, setStages] = useState([
        { trigger: 'Commission Due Now', percentage: 50 } // 50% of the 5% = 2.5%
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [hasPosted, setHasPosted] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setHasPosted(false);
        try {
            const config = {
                agencyName,
                agencyTrn,
                agencyAddress,
                agencyTel,
                agencyEmail,
                billToName: recipientName,
                billToAddress: recipientAddress,
                billToTrn: marketType === 'Off-plan' ? recipientTrn : undefined,
                buyerName: marketType === 'Off-plan' ? buyerName : undefined,
                paymentTerms,
                bankDetails: {
                    name: bankAccName,
                    accountNumber: bankAccNum,
                    iban: bankIban,
                    swift: bankSwift,
                    branch: bankBranch,
                    bankName: bankName
                }
            };
            const data = await generateCommissionInvoice(propertyValue, commissionPct, stages, config, propertyName, unitNo);
            setInvoice(data);
        } catch (error) {
            console.error(error);
            alert("Failed to generate invoice.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostToLedger = async () => {
        if (!invoice) return;
        setIsPosting(true);
        try {
            await postToLedger({
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                description: `Commission Revenue - ${invoice.propertyName} - ${invoice.unitNumber}`,
                reference: invoice.invoiceNumber,
                category: 'Revenue',
                debit: 0,
                credit: invoice.totalGross,
                postedBy: 'System AI'
            });
            setHasPosted(true);
        } catch (error) {
            console.error(error);
            alert("Failed to post to ledger.");
        } finally {
            setIsPosting(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!printableRef.current || !invoice) return;
        setIsGeneratingPdf(true);
        
        try {
            const element = printableRef.current;
            const canvas = await window.html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                windowWidth: 800,
                windowHeight: element.scrollHeight
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Tax-Invoice-${invoice.invoiceNumber}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="bg-brand-secondary p-6 rounded-2xl border border-brand-accent space-y-4 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-brand-text">Invoice Parameters</h3>
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`text-xs px-3 py-1 rounded border transition-all ${showSettings ? 'bg-brand-gold text-brand-primary border-brand-gold' : 'text-brand-light border-brand-accent hover:border-brand-light'}`}
                    >
                        {showSettings ? 'Hide Config' : 'Setup Agency & Bank'}
                    </button>
                </div>

                {showSettings && (
                    <div className="bg-brand-primary p-4 rounded-xl border border-brand-accent space-y-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-widest border-b border-brand-accent pb-1">Agency Details</h4>
                            <div>
                                <label className="block text-[10px] text-brand-light mb-1 uppercase">Agency Name</label>
                                <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} className="w-full bg-brand-secondary border-brand-accent rounded-lg text-brand-text p-2 text-xs" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-brand-light mb-1 uppercase">Agency TRN</label>
                                    <input type="text" value={agencyTrn} onChange={e => setAgencyTrn(e.target.value)} className="w-full bg-brand-secondary border-brand-accent rounded-lg text-brand-text p-2 text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-brand-light mb-1 uppercase">Tel</label>
                                    <input type="text" value={agencyTel} onChange={e => setAgencyTel(e.target.value)} className="w-full bg-brand-secondary border-brand-accent rounded-lg text-brand-text p-2 text-xs" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-widest border-b border-brand-accent pb-1">Bank Details</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] text-brand-light mb-1 uppercase">Bank Name</label>
                                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full bg-brand-secondary border-brand-accent rounded-lg text-brand-text p-2 text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-brand-light mb-1 uppercase">Acc Number</label>
                                    <input type="text" value={bankAccNum} onChange={e => setBankAccNum(e.target.value)} className="w-full bg-brand-secondary border-brand-accent rounded-lg text-brand-text p-2 text-xs" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-brand-light mb-1 uppercase">IBAN</label>
                                <input type="text" value={bankIban} onChange={e => setBankIban(e.target.value)} className="w-full bg-brand-secondary border-brand-accent rounded-lg text-brand-text p-2 text-xs" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex bg-brand-primary p-1 rounded-lg border border-brand-accent w-full">
                    <button 
                        onClick={() => { setMarketType('Off-plan'); setRecipientName('ELLINGTON PROPERTIES DEVELOPMENT L.L.C'); setRecipientTrn('100486421900003'); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${marketType === 'Off-plan' ? 'bg-brand-gold text-brand-primary' : 'text-brand-light hover:text-brand-text'}`}
                    >
                        Off-plan Deal
                    </button>
                    <button 
                        onClick={() => { setMarketType('Secondary'); setRecipientName('ROHITH PRAKASH THAIKKAT'); setRecipientTrn(''); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${marketType === 'Secondary' ? 'bg-brand-gold text-brand-primary' : 'text-brand-light hover:text-brand-text'}`}
                    >
                        Secondary Market
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-xs text-brand-light mb-1 uppercase tracking-tighter">Property Value (AED)</label>
                        <input type="number" value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} className="w-full bg-brand-primary border-brand-accent rounded-lg text-brand-text p-2 focus:ring-brand-gold" />
                    </div>
                    <div>
                        <label className="block text-xs text-brand-light mb-1 uppercase tracking-tighter">Total Commission %</label>
                        <input type="number" value={commissionPct} onChange={e => setCommissionPct(Number(e.target.value))} className="w-full bg-brand-primary border-brand-accent rounded-lg text-brand-text p-2 focus:ring-brand-gold" />
                    </div>
                </div>

                <div className="space-y-4 bg-brand-primary/30 p-4 rounded-xl border border-brand-accent/50">
                    <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Recipient Details</h4>
                    <div>
                        <label className="block text-xs text-brand-light mb-1">
                            {marketType === 'Off-plan' ? 'Developer Name (Billed To)' : 'Buyer Name (Billed To)'}
                        </label>
                        <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="w-full bg-brand-primary border-brand-accent rounded-lg text-brand-text p-2 focus:ring-brand-gold" />
                    </div>
                    
                    {marketType === 'Off-plan' && (
                        <div>
                            <label className="block text-xs text-brand-light mb-1">Customer Name (Client Ref)</label>
                            <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full bg-brand-primary border-brand-accent rounded-lg text-brand-text p-2 focus:ring-brand-gold" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-xs text-brand-light mb-1">Project/Community</label>
                        <input type="text" value={propertyName} onChange={e => setPropertyName(e.target.value)} className="w-full bg-brand-primary border-brand-accent rounded-lg text-brand-text p-2 focus:ring-brand-gold" />
                    </div>
                    <div>
                        <label className="block text-xs text-brand-light mb-1">Unit No</label>
                        <input type="text" value={unitNo} onChange={e => setUnitNo(e.target.value)} className="w-full bg-brand-primary border-brand-accent rounded-lg text-brand-text p-2 focus:ring-brand-gold" />
                    </div>
                </div>

                <div className="mt-6 border-t border-brand-accent pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-brand-light uppercase text-[10px] tracking-widest">Commission Due Now Split</h4>
                        <div className="text-[10px] text-brand-gold font-bold">
                            Total Comm: AED {(propertyValue * (commissionPct / 100)).toLocaleString()}
                        </div>
                    </div>
                    {stages.map((s, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                            <div className="flex-1">
                                <label className="block text-[9px] text-brand-light mb-1 uppercase">Invoicing Milestone</label>
                                <input type="text" value={s.trigger} onChange={e => {
                                    const newStages = [...stages];
                                    newStages[i].trigger = e.target.value;
                                    setStages(newStages);
                                }} className="w-full bg-brand-primary border-brand-accent rounded-lg text-brand-text p-2 text-sm focus:ring-brand-gold" />
                            </div>
                            <div className="w-32">
                                <label className="block text-[9px] text-brand-light mb-1 uppercase">% of Total Commission</label>
                                <div className="flex items-center gap-1 bg-brand-primary border border-brand-accent rounded-lg px-2">
                                    <input type="number" value={s.percentage} onChange={e => {
                                        const newStages = [...stages];
                                        newStages[i].percentage = Number(e.target.value);
                                        setStages(newStages);
                                    }} className="w-full bg-transparent border-none text-brand-text p-2 text-sm focus:ring-0 text-right" />
                                    <span className="text-brand-light text-xs">%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full !mt-8 bg-brand-gold text-brand-primary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:bg-brand-accent transition-all shadow-lg active:scale-95"
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-brand-primary rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                    Generate RERA & FTA Compliant Invoice
                </button>
            </div>

            <div className="bg-brand-primary rounded-2xl border border-brand-accent overflow-hidden flex flex-col shadow-2xl relative">
                {invoice ? (
                    <>
                        <div className="flex-1 p-8 space-y-6 text-brand-text overflow-y-auto">
                            <div className="flex justify-between items-start border-b border-brand-accent pb-6">
                                <div className="flex items-start gap-3">
                                    <div className="bg-brand-gold/10 p-2 rounded-lg">
                                        <SparklesIcon className="w-8 h-8 text-brand-gold" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold uppercase tracking-widest text-brand-text leading-tight">{invoice.agencyName}</h4>
                                        <p className="text-[10px] text-brand-light uppercase tracking-tighter font-semibold mt-1">TRN: {invoice.agencyTrn}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-brand-gold font-bold text-lg tracking-widest leading-none">TAX INVOICE</p>
                                    <p className="text-xs text-brand-light mt-2">No: {invoice.invoiceNumber}</p>
                                    <p className="text-xs text-brand-light">Date: {invoice.date}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 text-sm">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-brand-gold text-[10px] font-bold uppercase mb-1 tracking-widest">BILL TO:</p>
                                        <p className="font-bold text-brand-text text-base leading-none mb-1">{invoice.clientName}</p>
                                        {invoice.clientTrn && <p className="text-brand-light/70 text-[10px] font-semibold">TRN: {invoice.clientTrn}</p>}
                                    </div>
                                    {invoice.buyerName && (
                                        <div className="border-t border-brand-accent/30 pt-2">
                                            <p className="text-brand-gold text-[9px] font-bold uppercase mb-1 tracking-tighter">CLIENT REF:</p>
                                            <p className="text-xs text-brand-text font-bold">{invoice.buyerName}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-brand-gold text-[10px] font-bold uppercase mb-1 tracking-widest">PROPERTY DETAILS:</p>
                                    <div className="space-y-1">
                                        <p className="text-brand-text font-bold text-sm leading-tight">{invoice.propertyName}</p>
                                        <p className="text-brand-light text-xs">Unit: <span className="font-bold text-brand-text">{invoice.unitNumber}</span></p>
                                        <p className="text-brand-text text-xs">Value: <span className="font-bold">AED {invoice.salePrice.toLocaleString()}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 border border-brand-accent rounded-xl overflow-hidden bg-brand-secondary/10">
                                <table className="w-full text-sm">
                                    <thead className="bg-brand-accent/30 border-b border-brand-accent">
                                        <tr className="text-brand-gold">
                                            <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-widest">Description</th>
                                            <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-widest">Net (AED)</th>
                                            <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-widest">VAT (5%)</th>
                                            <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-widest">Gross (AED)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-accent/30">
                                        {invoice.stages.map((s, i) => (
                                            <tr key={i} className="hover:bg-brand-accent/10 transition-colors">
                                                <td className="px-4 py-4 font-semibold text-brand-text leading-tight">{s.stageName}</td>
                                                <td className="px-4 py-4 text-right text-brand-light font-medium">{s.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="px-4 py-4 text-right text-brand-light font-medium">{s.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="px-4 py-4 text-right font-bold text-brand-gold">{s.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end mt-4">
                                <div className="w-full max-w-xs space-y-1 text-right">
                                    <div className="text-xl font-bold text-brand-gold">
                                        TOTAL AED {invoice.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-[9px] uppercase font-bold text-brand-light tracking-tighter opacity-60">
                                        {invoice.totalInWords}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hidden Printable Invoice */}
                        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                            <div ref={printableRef}>
                                <PrintableInvoice data={invoice} />
                            </div>
                        </div>

                        <div className="p-4 bg-brand-secondary border-t border-brand-accent flex justify-end gap-3">
                            <button 
                                onClick={handlePostToLedger}
                                disabled={isPosting || hasPosted}
                                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold ${
                                    hasPosted 
                                    ? 'bg-green-500/20 text-green-400 cursor-default' 
                                    : 'bg-brand-accent text-brand-text hover:bg-brand-light hover:text-brand-primary'
                                }`}
                            >
                                {isPosting ? <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : hasPosted ? <CheckIcon className="w-4 h-4" /> : null}
                                {hasPosted ? 'Posted to Ledger' : 'Post to Ledger'}
                            </button>
                            <button 
                                onClick={handleDownloadPdf}
                                disabled={isGeneratingPdf}
                                className="bg-brand-gold text-brand-primary px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-yellow-400 transition-all font-bold shadow-lg disabled:opacity-50"
                            >
                                {isGeneratingPdf ? <div className="w-4 h-4 border-2 border-t-transparent border-brand-primary rounded-full animate-spin"></div> : <DownloadIcon className="w-4 h-4" />}
                                Download PDF
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-brand-light">
                        <CashIcon className="w-16 h-16 mb-4 opacity-10 animate-pulse" />
                        <h4 className="text-lg font-bold text-brand-text opacity-50 uppercase tracking-widest">Tax Invoice Preview</h4>
                        <p className="max-w-xs mx-auto text-sm mt-2">Configure deal details and recipient data to generate a professional, audit-ready Tax Invoice.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceGenerator;