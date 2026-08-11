import { LedgerEntry } from '../types';

/**
 * DARIE Finance Intelligence: Google Sheets API v4 Integration
 * Connects to actual Google Sheets using OAuth 2.0 authentication
 */

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || '17zfeuRyqt6NKtrNuWwSToQgB_cFnbc802d9uC-lmubQ';
const SHEET_NAME = 'General_Ledger';
const API_KEY = import.meta.env.VITE_GOOGLE_OAUTH_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

interface GoogleAuthResponse {
    access_token: string;
    expires_in: number;
}

let accessToken: string | null = null;
let tokenClient: any = null;

/**
 * Initialize Google Identity Services
 */
const initializeGoogleAuth = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (tokenClient) {
            resolve();
            return;
        }

        // Load Google Identity Services library
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
            if (typeof (window as any).google !== 'undefined') {
                tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: (response: GoogleAuthResponse) => {
                        if (response.access_token) {
                            accessToken = response.access_token;
                            localStorage.setItem('google_sheets_token', response.access_token);
                            localStorage.setItem('google_sheets_token_expiry', String(Date.now() + response.expires_in * 1000));
                        }
                    },
                });
                resolve();
            } else {
                reject(new Error('Google Identity Services not loaded'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
    });
};

/**
 * Request access token with user consent
 */
const requestAccessToken = async (): Promise<string> => {
    // Check if we have a valid cached token
    const cachedToken = localStorage.getItem('google_sheets_token');
    const tokenExpiry = localStorage.getItem('google_sheets_token_expiry');

    if (cachedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        accessToken = cachedToken;
        return cachedToken;
    }

    // Initialize auth if not already done
    await initializeGoogleAuth();

    // Request new token
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            reject(new Error('Token client not initialized'));
            return;
        }

        const originalCallback = tokenClient.callback;
        tokenClient.callback = (response: GoogleAuthResponse) => {
            if (response.error) {
                reject(new Error(response.error));
                return;
            }
            if (originalCallback) originalCallback(response);
            resolve(response.access_token);
        };

        tokenClient.requestAccessToken({ prompt: 'consent' });
    });
};

/**
 * Get or refresh access token
 */
const getAccessToken = async (): Promise<string> => {
    if (!accessToken) {
        accessToken = await requestAccessToken();
    }
    return accessToken;
};

/**
 * Initialize Google Sheet with headers if it doesn't exist
 */
const ensureSheetHeaders = async (token: string): Promise<void> => {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:J1`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        // If no data, create headers
        if (!data.values || data.values.length === 0) {
            const headers = [['ID', 'Date', 'Description', 'Reference', 'Category', 'Debit', 'Credit', 'Balance', 'Status', 'Posted By']];

            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:J1?valueInputOption=RAW`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: headers,
                }),
            });
        }
    } catch (error) {
        console.error('Error ensuring sheet headers:', error);
    }
};

/**
 * Fetches all rows from the Google Sheet and maps them to LedgerEntry objects
 */
export const fetchLedgerFromSheet = async (): Promise<LedgerEntry[]> => {
    try {
        console.log(`[Google Sheets] Fetching range ${SHEET_NAME}!A2:J from Spreadsheet ${SPREADSHEET_ID}...`);

        const token = await getAccessToken();
        await ensureSheetHeaders(token);

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:J`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            return [];
        }

        // Map sheet rows to LedgerEntry objects
        return data.values.map((row: any[]) => ({
            id: row[0] || '',
            date: row[1] || '',
            description: row[2] || '',
            reference: row[3] || '',
            category: row[4] || '',
            debit: parseFloat(row[5]) || 0,
            credit: parseFloat(row[6]) || 0,
            balance: parseFloat(row[7]) || undefined,
            status: (row[8] || 'Posted') as 'Posted' | 'Reversed',
            postedBy: row[9] || '',
        }));
    } catch (error) {
        console.error('[Google Sheets] Error fetching ledger:', error);
        // Fallback to localStorage if API fails
        const localData = localStorage.getItem(`gsheet_${SPREADSHEET_ID}`);
        if (localData) {
            try {
                return JSON.parse(localData);
            } catch {
                return [];
            }
        }
        throw error;
    }
};

/**
 * Appends a new entry as a row in the Google Sheet
 */
export const appendLedgerToSheet = async (entry: LedgerEntry): Promise<void> => {
    try {
        console.log(`[Google Sheets] Appending new row to ${SHEET_NAME}...`, entry);

        const token = await getAccessToken();
        await ensureSheetHeaders(token);

        const values = [[
            entry.id,
            entry.date,
            entry.description,
            entry.reference,
            entry.category,
            entry.debit,
            entry.credit,
            entry.balance || '',
            entry.status,
            entry.postedBy,
        ]];

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:J:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to append data: ${response.statusText}`);
        }

        console.log(`[Google Sheets] Successfully synchronized record: ${entry.id}`);

        // Update local backup
        const currentData = await fetchLedgerFromSheet();
        localStorage.setItem(`gsheet_${SPREADSHEET_ID}`, JSON.stringify(currentData));
    } catch (error) {
        console.error('[Google Sheets] Error appending entry:', error);
        // Fallback to localStorage
        const currentData = localStorage.getItem(`gsheet_${SPREADSHEET_ID}`);
        const entries = currentData ? JSON.parse(currentData) : [];
        entries.unshift(entry);
        localStorage.setItem(`gsheet_${SPREADSHEET_ID}`, JSON.stringify(entries));
        throw error;
    }
};

/**
 * Synchronizes local state with the Sheet (Full overwrite - used for bulk updates/reversals)
 */
export const syncLedgerToSheet = async (entries: LedgerEntry[]): Promise<void> => {
    try {
        console.log(`[Google Sheets] Synchronizing ${entries.length} records to ${SHEET_NAME}...`);

        const token = await getAccessToken();
        await ensureSheetHeaders(token);

        // Clear existing data (except headers)
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:J:clear`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Prepare all rows
        const values = entries.map(entry => [
            entry.id,
            entry.date,
            entry.description,
            entry.reference,
            entry.category,
            entry.debit,
            entry.credit,
            entry.balance || '',
            entry.status,
            entry.postedBy,
        ]);

        // Write all data at once
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:J?valueInputOption=RAW`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to sync data: ${response.statusText}`);
        }

        console.log(`[Google Sheets] Successfully synchronized ${entries.length} records`);

        // Update local backup
        localStorage.setItem(`gsheet_${SPREADSHEET_ID}`, JSON.stringify(entries));
    } catch (error) {
        console.error('[Google Sheets] Error syncing ledger:', error);
        // Fallback to localStorage
        localStorage.setItem(`gsheet_${SPREADSHEET_ID}`, JSON.stringify(entries));
        throw error;
    }
};

/**
 * Revoke Google Sheets access and clear stored tokens
 */
export const revokeGoogleSheetsAccess = (): void => {
    if (accessToken) {
        (window as any).google?.accounts?.oauth2?.revoke(accessToken);
        accessToken = null;
    }
    localStorage.removeItem('google_sheets_token');
    localStorage.removeItem('google_sheets_token_expiry');
    console.log('[Google Sheets] Access revoked');
};