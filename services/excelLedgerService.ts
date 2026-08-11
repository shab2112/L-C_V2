import * as XLSX from 'xlsx';
import { LedgerEntry } from '../types';

/**
 * Excel Ledger Service for DARIE Finance Intelligence
 * Handles local Excel file I/O for general ledger data
 */

// In-memory storage for loaded ledger data
let currentLedgerData: LedgerEntry[] = [];

// File name for export (used when saving back to Excel)
let currentExcelFilename: string = 'General_Ledger.xlsx';

/**
 * Validates if the Excel file has the required structure
 */
const validateExcelStructure = (sheetData: any[][]): boolean => {
    if (!sheetData || sheetData.length === 0) return false;

    const headers = sheetData[0];
    const expectedHeaders = ['ID', 'Date', 'Description', 'Reference', 'Category', 'Debit', 'Credit', 'Status', 'PostedBy'];

    return expectedHeaders.every((expected, index) =>
        headers[index] && headers[index].toString().trim().toLowerCase() === expected.toLowerCase()
    );
};

/**
 * Loads ledger data from an Excel file
 */
export const loadLedgerFromExcel = async (file: File): Promise<LedgerEntry[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });

                // Use the first sheet or specifically 'Sheet1'
                const sheetName = workbook.SheetNames[0] || 'Sheet1';
                const worksheet = workbook.Sheets[sheetName];

                if (!worksheet) {
                    throw new Error('No worksheet found in Excel file');
                }

                // Get the range of the worksheet
                const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:I1');
                const rows: any[][] = [];

                // Extract data row by row, column by column
                for (let row = range.s.r; row <= range.e.r; row++) {
                    const rowData: any[] = [];
                    for (let col = range.s.c; col <= range.e.c; col++) {
                        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                        const cell = worksheet[cellAddress];
                        if (cell) {
                            // Get the cell value, preferring formatted value over raw
                            let cellValue = cell.w !== undefined ? cell.w : cell.v;
                            // If it's a date object, convert it
                            if (cell.t === 'd' && cell.v instanceof Date) {
                                cellValue = cell.v;
                            }
                            rowData.push(cellValue !== undefined ? cellValue : '');
                        } else {
                            rowData.push('');
                        }
                    }
                    rows.push(rowData);
                }

                console.log('Extracted sheet data (first 3 rows):', rows.slice(0, 3));

                if (!validateExcelStructure(rows)) {
                    throw new Error('Invalid Excel structure. Expected headers: ID, Date, Description, Reference, Category, Debit, Credit, Status, PostedBy');
                }

                // Helper function to parse dates robustly
                const parseDate = (dateValue: any): string => {
                    console.log('Parsing date value:', dateValue, 'Type:', typeof dateValue, 'Instance Date:', dateValue instanceof Date);
                    if (!dateValue) {
                        console.log('Empty date value, returning empty string');
                        return '';
                    }

                    try {
                        // Handle different Excel date formats
                        let date: Date;

                        if (typeof dateValue === 'number') {
                            // Excel serial date - check if it's likely an Excel date serial number
                            if (dateValue > 0 && dateValue < 100000) { // Reasonable date range
                                // Use Excel date serial conversion: January 1, 1900 is serial 1, but Excel incorrectly treats 1900 as leap year
                                date = XLSX.SSF.parse_date_code(dateValue);
                                if (isNaN(date.getTime())) {
                                    // Try alternative conversion for dates after 1900
                                    date = new Date((dateValue - 25569) * 86400 * 1000);
                                }
                            } else {
                                return '';
                            }
                        } else if (dateValue instanceof Date) {
                            // Already a Date object
                            date = dateValue;
                        } else if (typeof dateValue === 'string') {
                            // Clean up the string first
                            const cleanValue = dateValue.trim();

                            // Check if it's already in YYYY-MM-DD format
                            if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
                                const testDate = new Date(cleanValue + 'T00:00:00.000Z');
                                if (!isNaN(testDate.getTime())) {
                                    return cleanValue;
                                }
                            }

                            // Try parsing various formats
                            const formats = [
                                cleanValue,
                                // Common Excel formats - prioritize DD/MM/YYYY for UAE region
                                cleanValue.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, (match, d, m, y) => `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`), // DD/MM/YYYY -> YYYY-MM-DD
                                cleanValue.replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/, '$3-$2-$1'), // DD.MM.YYYY -> YYYY-MM-DD
                                cleanValue.replace(/(\d{2})-(\d{2})-(\d{4})/, '20$3-$2-$1'), // DD-MM-YY -> YYYY-MM-DD (assuming 20xx)
                                cleanValue.replace(/(\d{4})\/(\d{1,2})\/(\d{1,2})/, '$1-$2-$3'), // YYYY/MM/DD -> YYYY-MM-DD
                            ];

                            for (const format of formats) {
                                const testDate = new Date(format);
                                if (!isNaN(testDate.getTime()) && testDate.getFullYear() >= 1900 && testDate.getFullYear() <= 2100) {
                                    // Validate year is reasonable
                                    return testDate.toISOString().split('T')[0];
                                }
                            }

                            // Try to parse as locale-specific date string
                            const testDate = new Date(cleanValue);
                            if (!isNaN(testDate.getTime()) && testDate.getFullYear() >= 1900 && testDate.getFullYear() <= 2100) {
                                return testDate.toISOString().split('T')[0];
                            }

                            return '';
                        } else {
                            return '';
                        }

                        // Validate the final date
                        if (isNaN(date.getTime())) return '';
                        if (date.getFullYear() < 1900 || date.getFullYear() > 2100) return ''; // Reasonable year range

                        return date.toISOString().split('T')[0];
                    } catch (error) {
                        console.warn('Could not parse date:', dateValue, error);
                        return '';
                    }
                };

                // Skip header row, map to LedgerEntry
                const entries: LedgerEntry[] = rows.slice(1).map((row: any[]) => ({
                    id: row[0] || '',
                    date: parseDate(row[1]), // Use robust date parsing
                    description: row[2] || '',
                    reference: row[3] || '',
                    category: row[4] || '',
                    debit: parseFloat(row[5]) || 0,
                    credit: parseFloat(row[6]) || 0,
                    status: (row[7] === 'Reversed' ? 'Reversed' : 'Posted') as 'Posted' | 'Reversed',
                    postedBy: row[8] || '',
                }));

                currentLedgerData = entries;
                currentExcelFilename = file.name;

                // Save to localStorage for persistence
                localStorage.setItem('excel_ledger_data', JSON.stringify(entries));
                localStorage.setItem('excel_filename', file.name);

                resolve(entries);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read Excel file'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Saves current ledger data to Excel file and triggers download
 */
export const saveLedgerToExcel = async (): Promise<void> => {
    try {
        // Prepare data with headers
        const headers = ['ID', 'Date', 'Description', 'Reference', 'Category', 'Debit', 'Credit', 'Status', 'PostedBy'];
        const data = currentLedgerData.map(entry => [
            entry.id,
            entry.date,
            entry.description,
            entry.reference,
            entry.category,
            entry.debit,
            entry.credit,
            entry.status,
            entry.postedBy,
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Generate file and trigger download
        XLSX.writeFile(workbook, currentExcelFilename);
    } catch (error) {
        console.error('Error saving Excel file:', error);
        throw error;
    }
};

/**
 * Gets current ledger data (loads from localStorage if available)
 */
export const getCurrentLedgerData = (): LedgerEntry[] => {
    if (currentLedgerData.length === 0) {
        // Try to load from localStorage
        const savedData = localStorage.getItem('excel_ledger_data');
        if (savedData) {
            try {
                currentLedgerData = JSON.parse(savedData);
                currentExcelFilename = localStorage.getItem('excel_filename') || 'General_Ledger.xlsx';
            } catch (error) {
                console.error('Error loading saved ledger data:', error);
                currentLedgerData = [];
            }
        }
    }
    return currentLedgerData;
};

/**
 * Adds a new entry to the current ledger data
 */
export const addLedgerEntry = (entry: LedgerEntry): void => {
    currentLedgerData.unshift(entry); // Add to beginning for chronological order
    localStorage.setItem('excel_ledger_data', JSON.stringify(currentLedgerData));
};

/**
 * Checks if Excel data is loaded
 */
export const isExcelLoaded = (): boolean => {
    return currentLedgerData.length > 0;
};

/**
 * Gets current Excel filename
 */
export const getCurrentFilename = (): string => {
    return currentExcelFilename;
};

/**
 * Clears current ledger data
 */
export const clearLedgerData = (): void => {
    currentLedgerData = [];
    currentExcelFilename = 'General_Ledger.xlsx';
    localStorage.removeItem('excel_ledger_data');
    localStorage.removeItem('excel_filename');
};
