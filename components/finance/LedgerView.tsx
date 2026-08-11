
import React, { useState, useEffect, useRef } from 'react';
import { getLedgerEntries } from '../../services/apiService';
import { LedgerEntry } from '../../types';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { DownloadIcon } from '../icons/DownloadIcon';
import { loadLedgerFromExcel, saveLedgerToExcel, isExcelLoaded, getCurrentFilename } from '../../services/excelLedgerService';

interface LedgerViewProps {
    onBack: () => void;
}

const LedgerView: React.FC<LedgerViewProps> = () => {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExcelLoadedState, setIsExcelLoadedState] = useState(isExcelLoaded());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const loadedEntries = await loadLedgerFromExcel(file);
            // Sort and set entries (handle empty dates)
            const sorted = [...loadedEntries].sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA; // Descending order, empty dates at end
            });
            setEntries(sorted);
            setIsExcelLoadedState(true);
        } catch (error) {
            console.error('Error loading Excel:', error);
            alert(`Error loading Excel file: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveExcel = async () => {
        if (!isExcelLoadedState) return;

        try {
            await saveLedgerToExcel();
            alert('Excel file exported successfully!');
        } catch (error) {
            console.error('Error saving Excel:', error);
            alert(`Error saving Excel file: ${error.message}`);
        }
    };

    useEffect(() => {
        const fetchEntries = async () => {
            setIsLoading(true);
            try {
                const data = await getLedgerEntries();
                // Sort by date descending (newest first, handle empty dates)
                const sorted = [...data].sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return dateB - dateA; // Descending order, empty dates at end
                });
                setEntries(sorted);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEntries();
    }, []);

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="bg-brand-secondary p-6 rounded-2xl border border-brand-accent shadow-lg flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-6 h-6 text-brand-gold" />
                        <div>
                            <h3 className="text-lg font-bold text-brand-text leading-none">General Ledger</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Local Excel {isExcelLoadedState ? 'Loaded' : 'Not Loaded'}</span>
                                </div>
                                <span className="text-[10px] text-brand-light uppercase tracking-widest font-bold ml-2">Verified by Gemini</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleLoadExcel}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
                        >
                            <UploadIcon className="w-4 h-4" />
                            Load Excel
                        </button>
                        <button
                            onClick={handleSaveExcel}
                            disabled={!isExcelLoadedState}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Export Excel
                        </button>
                        <div className="text-xs text-brand-light bg-brand-primary px-3 py-1.5 rounded-lg border border-brand-accent font-semibold tracking-wide">
                            {entries.length} Records {isExcelLoadedState && `(${getCurrentFilename()})`}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-full text-brand-light space-y-4 py-12">
                            <div className="relative">
                                <div className="w-12 h-12 border-4 border-brand-accent border-t-brand-gold rounded-full animate-spin"></div>
                                <SparklesIcon className="absolute inset-0 m-auto w-4 h-4 text-brand-gold animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-brand-text">Loading Ledger</p>
                                <p className="text-xs opacity-50">Loading Excel data...</p>
                            </div>
                        </div>
                    ) : entries.length > 0 ? (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="text-brand-light border-b border-brand-accent uppercase text-[10px] tracking-widest">
                                    <th className="py-4 px-2 font-bold">Date</th>
                                    <th className="py-4 px-2 font-bold">Description</th>
                                    <th className="py-4 px-2 font-bold">Ref</th>
                                    <th className="py-4 px-2 font-bold">Category</th>
                                    <th className="py-4 px-2 font-bold text-right">Debit (AED)</th>
                                    <th className="py-4 px-2 font-bold text-right">Credit (AED)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-accent/20">
                                {entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-brand-accent/10 transition-colors animate-in fade-in duration-300">
                                        <td className="py-4 px-2 text-brand-light font-medium">
                                            {entry.date ? new Date(entry.date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-4 px-2 font-semibold text-brand-text">{entry.description}</td>
                                        <td className="py-4 px-2 text-brand-gold font-mono text-[11px]">{entry.reference}</td>
                                        <td className="py-4 px-2">
                                            <span className="bg-brand-primary px-2 py-0.5 rounded text-[10px] text-brand-light border border-brand-accent font-bold">
                                                {entry.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-right text-brand-text font-semibold">
                                            {entry.debit > 0 ? entry.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                        <td className="py-4 px-2 text-right text-brand-gold font-bold">
                                            {entry.credit > 0 ? entry.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-brand-light space-y-4">
                            <div className="bg-brand-primary p-6 rounded-full border border-brand-accent opacity-20">
                                <DocumentTextIcon className="w-16 h-16" />
                            </div>
                            <p className="font-semibold tracking-wide">No ledger data loaded.</p>
                            <p className="text-xs max-w-xs text-center opacity-60">Load an Excel file to view your general ledger entries.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LedgerView;