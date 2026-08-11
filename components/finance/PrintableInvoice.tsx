
import React from 'react';
import { InvoiceData } from '../../types';

interface PrintableInvoiceProps {
    data: InvoiceData;
}

const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ data }) => {
    // We assume the first stage is the primary one being invoiced as per the sample UI flow
    const currentStage = data.stages[0];
    const totalCommissionAmount = (data.salePrice * (data.commissionPercentage / 100));

    return (
        <div style={{
            width: '595pt', // A4 Width
            minHeight: '842pt', // A4 Height
            backgroundColor: 'white',
            color: '#111',
            fontFamily: 'Montserrat, sans-serif',
            padding: '30pt',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Header / Logo Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20pt', borderBottom: '2pt solid #D4AF37', paddingBottom: '10pt' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '22pt', fontWeight: 'bold', color: '#111', textTransform: 'uppercase' }}>
                        {data.agencyName}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28pt', fontWeight: 'bold', color: '#D4AF37', letterSpacing: '2pt' }}>
                        TAX INVOICE
                    </div>
                    <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#666' }}>
                        NO: {data.invoiceNumber}
                    </div>
                </div>
            </div>

            {/* Entity Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25pt' }}>
                <div style={{ fontSize: '9pt', lineHeight: 1.4, maxWidth: '240pt' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 2pt 0' }}>{data.agencyName}</p>
                    <p style={{ margin: 0 }}>TRN: <span style={{ fontWeight: 'bold' }}>{data.agencyTrn}</span></p>
                    <p style={{ margin: 0 }}>TEL: {data.agencyTel}</p>
                    <p style={{ margin: 0 }}>{data.agencyAddress}</p>
                </div>
                <div style={{ fontSize: '9pt', textAlign: 'right', maxWidth: '240pt', lineHeight: 1.4 }}>
                    <p style={{ fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', margin: '0 0 4pt 0' }}>BILL TO:</p>
                    <p style={{ fontWeight: 'bold', fontSize: '11pt', margin: '0 0 2pt 0' }}>{data.clientName}</p>
                    {data.clientTrn && <p style={{ margin: 0 }}>TRN: <span style={{ fontWeight: 'bold' }}>{data.clientTrn}</span></p>}
                    <p style={{ margin: 0 }}>{data.clientAddress}</p>
                    <p style={{ margin: '10pt 0 0 0', fontWeight: 'bold', color: '#333' }}>Date: {data.date}</p>
                </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20pt' }}>
                <thead>
                    <tr style={{ backgroundColor: '#D4AF37', color: 'white' }}>
                        <th style={{ padding: '8pt', textAlign: 'left', border: '1pt solid #D4AF37', fontSize: '9pt', width: '15%' }}>Unit No.</th>
                        <th style={{ padding: '8pt', textAlign: 'left', border: '1pt solid #D4AF37', fontSize: '9pt', width: '35%' }}>Customer Name</th>
                        <th style={{ padding: '8pt', textAlign: 'center', border: '1pt solid #D4AF37', fontSize: '9pt', width: '10%' }}>Status</th>
                        <th style={{ padding: '8pt', textAlign: 'right', border: '1pt solid #D4AF37', fontSize: '9pt', width: '20%' }}>Deal Price</th>
                        <th style={{ padding: '8pt', textAlign: 'right', border: '1pt solid #D4AF37', fontSize: '9pt', width: '20%' }}>Commission</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '15pt 8pt', border: '1pt solid #ccc', fontSize: '9pt', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 'bold' }}>{data.unitNumber}</div>
                            <div style={{ fontSize: '8pt', color: '#666', marginTop: '4pt' }}>{data.propertyName}</div>
                        </td>
                        <td style={{ padding: '15pt 8pt', border: '1pt solid #ccc', fontSize: '9pt', verticalAlign: 'top', lineHeight: 1.6 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '10pt' }}>{data.buyerName || data.clientName}</div>
                            <div style={{ marginTop: '4pt' }}>Value: AED {data.salePrice.toLocaleString()}</div>
                            <div>Commission - {data.commissionPercentage.toFixed(2)}%</div>
                            <div style={{ marginBottom: '8pt' }}>AED {totalCommissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            
                            <div style={{ borderTop: '1px dashed #ccc', paddingTop: '4pt' }}>
                                <div style={{ fontWeight: 'bold', color: '#D4AF37' }}>{currentStage.stageName}</div>
                                <div>AED {currentStage.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        </td>
                        <td style={{ padding: '15pt 8pt', border: '1pt solid #ccc', fontSize: '9pt', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'top' }}>
                            SOLD
                        </td>
                        <td style={{ padding: '15pt 8pt', border: '1pt solid #ccc', fontSize: '9pt', textAlign: 'right', verticalAlign: 'top' }}>
                            AED {data.salePrice.toLocaleString()}
                        </td>
                        <td style={{ padding: '15pt 8pt', border: '1pt solid #ccc', fontSize: '9pt', textAlign: 'right', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 'bold' }}>AED {currentStage.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div style={{ marginTop: '30pt', fontSize: '8pt', color: '#666' }}>
                                +VAT (5%)<br/>
                                <span style={{ fontWeight: 'bold', color: '#111' }}>AED {currentStage.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </td>
                    </tr>
                    <tr style={{ fontWeight: 'bold', fontSize: '11pt' }}>
                        <td colSpan={3} style={{ border: 'none' }}></td>
                        <td style={{ padding: '10pt 8pt', textAlign: 'right', border: '1pt solid #111' }}>Total</td>
                        <td style={{ padding: '10pt 8pt', textAlign: 'right', border: '1pt solid #111', backgroundColor: '#f9f9f9', fontSize: '12pt' }}>
                            AED {data.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Total In Words Bar */}
            <div style={{ border: '1.5pt solid #D4AF37', backgroundColor: '#fff', padding: '12pt', color: '#111', fontWeight: 'bold', textAlign: 'center', fontSize: '9pt', marginBottom: '25pt', textTransform: 'uppercase' }}>
                {data.totalInWords}
            </div>

            {/* Bank Details & Signature Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingBottom: '20pt' }}>
                <div style={{ fontSize: '8pt', lineHeight: 1.8 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '10pt', margin: '0 0 8pt 0', borderBottom: '1px solid #eee' }}>Bank Account Details:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '90pt 1fr', gap: '2pt' }}>
                        <span style={{ color: '#666' }}>Name:</span> <span style={{ fontWeight: 'bold' }}>{data.bankDetails.name}</span>
                        <span style={{ color: '#666' }}>Account Number:</span> <span style={{ fontWeight: 'bold' }}>{data.bankDetails.accountNumber}</span>
                        <span style={{ color: '#666' }}>IBAN:</span> <span style={{ fontWeight: 'bold' }}>{data.bankDetails.iban}</span>
                        <span style={{ color: '#666' }}>Swift Code:</span> <span style={{ fontWeight: 'bold' }}>{data.bankDetails.swift}</span>
                        <span style={{ color: '#666' }}>Bank Branch:</span> <span style={{ fontWeight: 'bold' }}>{data.bankDetails.branch}</span>
                        <span style={{ color: '#666' }}>Bank Name:</span> <span style={{ fontWeight: 'bold' }}>{data.bankDetails.bankName}</span>
                    </div>
                    <p style={{ marginTop: '15pt', fontStyle: 'italic', color: '#666' }}>{data.paymentTerms}</p>
                </div>
                
                <div style={{ textAlign: 'center', minWidth: '150pt', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    {/* Empty space left for manual official stamp/signature */}
                    <div style={{ height: '80pt' }}></div>
                    <div style={{ marginTop: '10pt', fontSize: '10pt', fontWeight: 'bold', borderTop: '1pt solid #ccc', paddingTop: '5pt' }}>
                        Authorized Signatory
                    </div>
                </div>
            </div>

            {/* Professional Footer */}
            <div style={{ borderTop: '1pt solid #eee', paddingTop: '10pt', textAlign: 'center', fontSize: '7.5pt', color: '#888' }}>
                <p style={{ margin: 0 }}>{data.agencyName} | {data.agencyAddress} | {data.agencyTel}</p>
                <p style={{ margin: '2pt 0 0 0' }}>{data.agencyEmail}</p>
            </div>
        </div>
    );
};

export default PrintableInvoice;