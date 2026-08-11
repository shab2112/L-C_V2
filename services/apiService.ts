import { Client, ContentPost, Contract, Listing, VaultDocument, LedgerEntry } from '../types';
import { mockClients } from '../data/mockData';
import { mockScheduledPosts } from '../data/driveMockData';
import { mockListings } from '../data/listingsMockData';
import { mockVaultDocuments } from '../data/vaultMockData';
import { contractsService } from '../lib/db/contracts';
import { getCurrentLedgerData, addLedgerEntry } from './excelLedgerService';

// Helper to simulate network latency
const apiDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- CLIENTS API ---
const getClientsFromStorage = (): Client[] => {
  const data = localStorage.getItem('clients');
  if (data) {
    return JSON.parse(data);
  }
  localStorage.setItem('clients', JSON.stringify(mockClients));
  return mockClients;
};

export const getClients = async (): Promise<Client[]> => {
  await apiDelay(500);
  return getClientsFromStorage();
};

export const createClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
  await apiDelay(500);
  const clients = getClientsFromStorage();
  const newClient: Client = {
    id: `client_${Date.now()}`,
    ...clientData,
  };
  const updatedClients = [newClient, ...clients];
  localStorage.setItem('clients', JSON.stringify(updatedClients));
  return newClient;
};

// --- CONTENT POSTS API ---
const getPostsFromStorage = (): ContentPost[] => {
  const data = localStorage.getItem('posts');
  if (data) {
    return JSON.parse(data);
  }
  localStorage.setItem('posts', JSON.stringify(mockScheduledPosts));
  return mockScheduledPosts;
};

export const getScheduledPosts = async (): Promise<ContentPost[]> => {
  await apiDelay(300);
  return getPostsFromStorage();
};

export const createContentPost = async (postData: Omit<ContentPost, 'id'>): Promise<ContentPost> => {
  await apiDelay(500);
  const posts = getPostsFromStorage();
  const newPost: ContentPost = {
    id: `post_${Date.now()}`,
    ...postData,
  };
  const updatedPosts = [...posts, newPost];
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
  return newPost;
};

export const updateContentPost = async (postId: string, updates: Partial<ContentPost>): Promise<ContentPost> => {
  await apiDelay(300);
  let posts = getPostsFromStorage();
  let updatedPost: ContentPost | undefined;
  const updatedPosts = posts.map(post => {
    if (post.id === postId) {
      updatedPost = { ...post, ...updates };
      return updatedPost;
    }
    return post;
  });
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
  if (!updatedPost) throw new Error("Post not found");
  return updatedPost;
};


// --- CONTRACTS API ---
const convertDbContractToContract = (dbContract: any): Contract => {
    return {
        id: dbContract.id,
        type: dbContract.type,
        partyName: dbContract.party_name,
        startDate: dbContract.start_date,
        expiryDate: dbContract.expiry_date,
        status: dbContract.status,
        department: dbContract.department,
        documentUrl: dbContract.document_url || '',
        createdBy: dbContract.created_by,
    };
};

const convertContractToDbFormat = (contract: Partial<Contract>) => {
    const dbContract: any = {};
    if (contract.type !== undefined) dbContract.type = contract.type;
    if (contract.partyName !== undefined) dbContract.party_name = contract.partyName;
    if (contract.startDate !== undefined) dbContract.start_date = contract.startDate;
    if (contract.expiryDate !== undefined) dbContract.expiry_date = contract.expiryDate;
    if (contract.status !== undefined) dbContract.status = contract.status;
    if (contract.department !== undefined) dbContract.department = contract.department;
    if (contract.documentUrl !== undefined) dbContract.document_url = contract.documentUrl;
    if (contract.createdBy !== undefined) dbContract.created_by = contract.createdBy;
    return dbContract;
};

export const getContracts = async (): Promise<Contract[]> => {
    const dbContracts = await contractsService.getAll();
    return dbContracts.map(convertDbContractToContract);
};

export const createContract = async (contractData: Omit<Contract, 'id'>): Promise<Contract> => {
    const dbContractData = convertContractToDbFormat(contractData);
    const dbContract = await contractsService.create(dbContractData);
    return convertDbContractToContract(dbContract);
};

export const updateContract = async (contractId: string, updates: Partial<Contract>): Promise<Contract> => {
    const dbUpdates = convertContractToDbFormat(updates);
    const dbContract = await contractsService.update(contractId, dbUpdates);
    return convertDbContractToContract(dbContract);
};


// --- LISTINGS API ---
const getListingsFromStorage = (): Listing[] => {
    const data = localStorage.getItem('listings');
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem('listings', JSON.stringify(mockListings));
    return mockListings;
};

export const getListingsByClientId = async (clientId: string): Promise<Listing[]> => {
    await apiDelay(600);
    const listings = getListingsFromStorage();
    return listings.filter(l => l.clientId === clientId);
};

// --- VAULT API ---
const getVaultFromStorage = (): VaultDocument[] => {
    const data = localStorage.getItem('vault');
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem('vault', JSON.stringify(mockVaultDocuments));
    return mockVaultDocuments;
};

export const getVaultDocuments = async (clientId: string): Promise<VaultDocument[]> => {
    await apiDelay(400);
    const documents = getVaultFromStorage();
    return documents.filter(doc => doc.clientId === clientId);
};

export const uploadVaultDocument = async (docData: Omit<VaultDocument, 'id'>): Promise<VaultDocument> => {
    await apiDelay(800);
    const documents = getVaultFromStorage();
    const newDocument: VaultDocument = {
      id: `doc_${Date.now()}`,
      ...docData,
    };
    const updatedDocs = [newDocument, ...documents];
    localStorage.setItem('vault', JSON.stringify(updatedDocs));
    return newDocument;
};

// --- LEDGER API (Syncing with Google Sheets) ---

/**
 * Fetches all ledger entries from the loaded Excel file
 */
export const getLedgerEntries = async (): Promise<LedgerEntry[]> => {
    // We now rely on the Excel service for persistence
    return getCurrentLedgerData();
};

/**
 * Posts a new entry to the General Ledger and adds to the Excel data
 */
export const postToLedger = async (entry: Omit<LedgerEntry, 'id' | 'status'>): Promise<LedgerEntry> => {
    const newEntry: LedgerEntry = {
        id: `ledger_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        status: 'Posted',
        ...entry,
    };

    // Add to Excel data
    addLedgerEntry(newEntry);

    return newEntry;
};
