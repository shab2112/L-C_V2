
import React, { useState, useRef } from 'react';
import { processExpenseOCR } from '../../services/geminiService';
import { postToLedger } from '../../services/apiService';
import { ExpenseData } from '../../types';
import { UploadIcon } from '../icons/UploadIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { ReceiptIcon } from '../icons/ReceiptIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';

interface ExpenseOCRProps {
    onBack: () => void;
}

const ExpenseOCR: React.FC<ExpenseOCRProps> = () => {
    const [image, setImage] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [hasPosted, setHasPosted] = useState(false);
    const [data, setData] = useState<ExpenseData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileType(file.type);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setData(null);
                setHasPosted(false);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProcess = async () => {
        if (!image) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await processExpenseOCR(image);
            if (!result || typeof result !== 'object') {
                throw new Error("The AI returned an invalid response. Please try with a clearer image.");
            }
            setData(result);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostToLedger = async () => {
        if (!data) return;
        setIsPosting(true);
        try {
            // Ensure date is in YYYY-MM-DD format
            const formatDate = (dateStr: string | undefined): string => {
                if (!dateStr) return new Date().toISOString().split('T')[0];
                try {
                    return new Date(dateStr).toISOString().split('T')[0];
                } catch {
                    return new Date().toISOString().split('T')[0];
                }
            };

            await postToLedger({
                date: formatDate(data.date),
                description: `${data.category || 'Expense'} - ${data.supplierName || 'Unknown Supplier'}`,
                reference: data.invoiceNumber || 'EXT-EXP',
                category: data.category || 'Expenses',
                debit: data.totalAmount || 0,
                credit: 0,
                postedBy: 'System AI'
            });
            setHasPosted(true);
        } catch (err) {
            console.error(err);
            alert("Failed to post to ledger.");
        } finally {
            setIsPosting(false);
        }
    };

    const isPdf = fileType === 'application/pdf';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="flex flex-col gap-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-brand-secondary border-2 border-dashed border-brand-accent rounded-2xl flex flex-col items-center justify-center p-12 cursor-pointer hover:border-brand-gold transition-all relative overflow-hidden"
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*,application/pdf" 
                    />
                    {image ? (
                        isPdf ? (
                            <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                                <DocumentTextIcon className="w-24 h-24 text-brand-gold mb-4" />
                                <p className="text-brand-text font-bold">PDF Document Selected</p>
                                <p className="text-brand-light text-xs mt-2 italic">Ready for AI processing</p>
                            </div>
                        ) : (
                            <img src={image} className="absolute inset-0 w-full h-full object-contain animate-in fade-in duration-500" alt="Bill Preview" />
                        )
                    ) : (
                        <>
                            <UploadIcon className="w-12 h-12 text-brand-light mb-4" />
                            <p className="text-brand-text font-bold">Upload Invoice/Receipt</p>
                            <p className="text-brand-light text-sm">PNG, JPG, PDF</p>
                        </>
                    )}
                </div>
                
                {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</p>}

                <button 
                    onClick={handleProcess}
                    disabled={!image || isLoading}
                    className="bg-brand-gold text-brand-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:bg-brand-accent transition-all"
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-brand-primary rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                    Analyze with Finance AI
                </button>
            </div>

            <div className="bg-brand-secondary rounded-2xl border border-brand-accent overflow-hidden flex flex-col">
                {data ? (
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center border-b border-brand-accent pb-4">
                            <h3 className="font-bold text-brand-text">Extraction Results</h3>
                            <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckIcon className="w-3 h-3" />
                                {Math.round((data.confidence || 0) * 100)}% Confidence
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-brand-primary p-3 rounded-lg">
                                <p className="text-xs text-brand-light mb-1">Supplier</p>
                                <p className="font-bold text-brand-text truncate">{data.supplierName || '---'}</p>
                            </div>
                            <div className="bg-brand-primary p-3 rounded-lg">
                                <p className="text-xs text-brand-light mb-1">Date</p>
                                <p className="font-bold text-brand-text">{data.date || '---'}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-brand-light uppercase mb-2">Financial Summary</h4>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-light">Subtotal</span>
                                    <span>{data.currency} {(data.subtotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-light">VAT Amount</span>
                                    <span>{data.currency} {(data.vatAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-brand-text border-t border-brand-accent pt-2">
                                    <span>Total</span>
                                    <span className="text-brand-gold">{data.currency} {(data.totalAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {data.journalEntry && (
                            <div className="bg-brand-primary p-4 rounded-xl border border-brand-accent">
                                <h4 className="text-xs font-bold text-brand-gold uppercase mb-3">Journal Entry Preview</h4>
                                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                                    <div className="space-y-1">
                                        <p className="text-brand-light uppercase">Debit (Increase Asset/Exp):</p>
                                        <p className="text-brand-text font-bold truncate">{data.journalEntry.debit || '---'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-brand-light uppercase">Credit (Increase Liab/Rev):</p>
                                        <p className="text-brand-text font-bold truncate">{data.journalEntry.credit || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <button 
                            onClick={handlePostToLedger}
                            disabled={isPosting || hasPosted}
                            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                hasPosted 
                                ? 'bg-green-500/20 text-green-400 cursor-default' 
                                : 'bg-brand-gold text-brand-primary hover:bg-yellow-400 shadow-lg'
                            }`}
                        >
                            {isPosting ? <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : hasPosted ? <CheckIcon className="w-5 h-5" /> : null}
                            {hasPosted ? 'Posted Successfully' : 'Post to Ledger'}
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-brand-light">
                        <ReceiptIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold text-brand-text mb-1">Awaiting AI Analysis</p>
                        <p className="text-xs max-w-[200px] mx-auto">Upload and process a document to see the intelligent extraction results here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseOCR;