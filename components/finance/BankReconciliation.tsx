
import React, { useState } from 'react';
import { reconcileBankStatements } from '../../services/geminiService';
import { ReconciliationReport } from '../../types';
import { BankIcon } from '../icons/BankIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { CheckIcon } from '../icons/CheckIcon';

interface BankReconciliationProps {
    onBack: () => void;
}

const BankReconciliation: React.FC<BankReconciliationProps> = () => {
    const [statementText, setStatementText] = useState(`
Date, Description, Amount, Type
01/10/2023, DEPOSIT FROM EMAAR PROPERTIES, 125000.00, Credit
05/10/2023, OFFICE RENT PAYMENT, 45000.00, Debit
10/10/2023, J. SMITH COMMISSION PAYMENT, 25000.00, Credit
15/10/2023, FACEBOOK ADS, 1200.00, Debit
    `);

    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<ReconciliationReport | null>(null);

    const handleReconcile = async () => {
        setIsLoading(true);
        try {
            // Mock pending data for context
            const pendingInvoices = "INV-1001: John Smith 25000.00, INV-1002: Emaar 125000.00";
            const pendingExpenses = "EXP-405: Facebook 1200.00, EXP-406: Office Rent 45000.00";
            
            const result = await reconcileBankStatements(statementText, pendingInvoices, pendingExpenses);
            setReport(result);
        } catch (error) {
            console.error(error);
            alert("Reconciliation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="bg-brand-secondary p-6 rounded-2xl border border-brand-accent flex flex-col gap-4">
                <h3 className="text-lg font-bold text-brand-text mb-2">Statement Data Input</h3>
                <p className="text-xs text-brand-light mb-2">Paste CSV data or upload a bank statement PDF/Image.</p>
                <textarea 
                    value={statementText}
                    onChange={e => setStatementText(e.target.value)}
                    className="flex-1 bg-brand-primary border-brand-accent rounded-xl text-brand-text p-4 font-mono text-xs resize-none"
                    placeholder="Date, Description, Amount..."
                />
                <button 
                    onClick={handleReconcile}
                    disabled={isLoading}
                    className="bg-brand-gold text-brand-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:bg-brand-accent transition-all"
                >
                    {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-brand-primary rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                    Start AI Matching
                </button>
            </div>

            <div className="bg-brand-secondary rounded-2xl border border-brand-accent overflow-hidden flex flex-col">
                {report ? (
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-brand-primary p-3 rounded-lg text-center">
                                <p className="text-[10px] text-brand-light uppercase">Total</p>
                                <p className="text-lg font-bold">{report.summary.totalTransactions}</p>
                            </div>
                            <div className="bg-green-500/10 p-3 rounded-lg text-center">
                                <p className="text-[10px] text-green-400 uppercase">Matched</p>
                                <p className="text-lg font-bold text-green-400">{report.summary.matched}</p>
                            </div>
                            <div className="bg-yellow-500/10 p-3 rounded-lg text-center">
                                <p className="text-[10px] text-yellow-400 uppercase">Suggested</p>
                                <p className="text-lg font-bold text-yellow-400">{report.summary.suggested}</p>
                            </div>
                            <div className="bg-red-500/10 p-3 rounded-lg text-center">
                                <p className="text-[10px] text-red-400 uppercase">Unmatched</p>
                                <p className="text-lg font-bold text-red-400">{report.summary.unmatched}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-brand-light uppercase">Transaction Matching Matrix</h4>
                            {report.matches.map((m, i) => (
                                <div key={i} className="bg-brand-primary p-4 rounded-xl border border-brand-accent flex justify-between items-center group hover:border-brand-gold transition-all">
                                    <div className="space-y-1">
                                        <p className="text-xs text-brand-light">{m.transaction.date}</p>
                                        <p className="font-bold text-brand-text text-sm">{m.transaction.description}</p>
                                        <p className={`text-xs font-bold ${m.transaction.type === 'Credit' ? 'text-green-400' : 'text-red-400'}`}>
                                            {m.transaction.type === 'Credit' ? '+' : '-'} AED {m.transaction.amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            m.matchType === 'Exact' ? 'bg-green-500 text-white' : 
                                            m.matchType === 'Fuzzy' ? 'bg-yellow-500 text-black' : 
                                            'bg-brand-accent text-brand-light'
                                        }`}>
                                            {m.matchType} Match
                                        </span>
                                        {m.suggestedMatch && (
                                            <p className="text-xs text-brand-gold underline cursor-pointer">{m.suggestedMatch}</p>
                                        )}
                                        {m.matchType === 'None' && (
                                            <button className="text-[10px] text-brand-light bg-brand-accent px-2 py-1 rounded hover:text-brand-text">Manual Match</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full bg-brand-gold text-brand-primary font-bold py-3 rounded-xl hover:bg-yellow-400 transition-all mt-4">
                            Finalize Reconciliation
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-brand-light">
                        <BankIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p>Paste bank statement data to begin the intelligent reconciliation process.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankReconciliation;