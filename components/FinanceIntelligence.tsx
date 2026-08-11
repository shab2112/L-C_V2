
import React, { useState } from 'react';
import { CashIcon } from './icons/CashIcon';
import { ReceiptIcon } from './icons/ReceiptIcon';
import { BankIcon } from './icons/BankIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import InvoiceGenerator from './finance/InvoiceGenerator';
import ExpenseOCR from './finance/ExpenseOCR';
import BankReconciliation from './finance/BankReconciliation';
import LedgerView from './finance/LedgerView';

type FinanceSubView = 'dashboard' | 'invoices' | 'expenses' | 'reconciliation' | 'ledger';

const FinanceIntelligence: React.FC = () => {
    const [view, setView] = useState<FinanceSubView>('dashboard');

    const renderView = () => {
        switch (view) {
            case 'invoices': return <InvoiceGenerator onBack={() => setView('dashboard')} />;
            case 'expenses': return <ExpenseOCR onBack={() => setView('dashboard')} />;
            case 'reconciliation': return <BankReconciliation onBack={() => setView('dashboard')} />;
            case 'ledger': return <LedgerView onBack={() => setView('dashboard')} />;
            default: return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <button 
                        onClick={() => setView('invoices')}
                        className="bg-brand-secondary p-6 rounded-2xl border border-brand-accent hover:border-brand-gold transition-all text-left group"
                    >
                        <div className="bg-brand-primary w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <CashIcon className="w-7 h-7 text-brand-gold" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-text mb-2">Invoice Gen</h3>
                        <p className="text-brand-light text-xs">Generate RERA & VAT compliant commission invoices.</p>
                    </button>

                    <button 
                        onClick={() => setView('expenses')}
                        className="bg-brand-secondary p-6 rounded-2xl border border-brand-accent hover:border-brand-gold transition-all text-left group"
                    >
                        <div className="bg-brand-primary w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ReceiptIcon className="w-7 h-7 text-brand-gold" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-text mb-2">Expense OCR</h3>
                        <p className="text-brand-light text-xs">AI extraction of TRN and auto-journal entries.</p>
                    </button>

                    <button 
                        onClick={() => setView('ledger')}
                        className="bg-brand-secondary p-6 rounded-2xl border border-brand-accent hover:border-brand-gold transition-all text-left group border-dashed"
                    >
                        <div className="bg-brand-primary w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <DocumentTextIcon className="w-7 h-7 text-brand-gold" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-text mb-2">General Ledger</h3>
                        <p className="text-brand-light text-xs">Review all posted journal entries and financial history.</p>
                    </button>

                    <button 
                        onClick={() => setView('reconciliation')}
                        className="bg-brand-secondary p-6 rounded-2xl border border-brand-accent hover:border-brand-gold transition-all text-left group"
                    >
                        <div className="bg-brand-primary w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BankIcon className="w-7 h-7 text-brand-gold" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-text mb-2">Bank Recon</h3>
                        <p className="text-brand-light text-xs">Match bank transactions against invoices.</p>
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CashIcon className="w-8 h-8 text-brand-gold" />
                    <div>
                        <h2 className="text-2xl font-bold text-brand-text">DARIE Finance Intelligence</h2>
                        <p className="text-brand-light text-sm">Elite Real Estate Financial Control AI</p>
                    </div>
                </div>
                {view !== 'dashboard' && (
                    <button 
                        onClick={() => setView('dashboard')}
                        className="text-brand-light hover:text-brand-text transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                        &larr; Back to Finance Hub
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {renderView()}
            </div>
        </div>
    );
};

export default FinanceIntelligence;