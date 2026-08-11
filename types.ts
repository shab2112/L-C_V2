// TypeScript declarations for global libraries
declare global {
  interface Window {
    jspdf: {
      jsPDF: any;
    };
    html2canvas: (element: HTMLElement, options?: any) => Promise<any>;
  }
}

export enum UserRole {
  Owner = 'Owner',
  Admin = 'Admin',
  PropertyAdvisor = 'Property Advisor',
  Client = 'Client',
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyAdvisorId: string;
  cardDriveId?: string;
}

export interface DriveAsset {
  id:string;
  name: string;
  type: 'image' | 'video' | 'brochure' | 'factsheet';
  url: string;
  content?: string;
}

export interface DriveProject {
  id: string;
  name: string;
  developer: string;
  assets: DriveAsset[];
}

export enum SocialPlatform {
  Facebook = 'Facebook',
  LinkedIn = 'LinkedIn',
  Instagram = 'Instagram',
  YouTube = 'YouTube',
  Twitter = 'Twitter',
}

export enum PostType {
  Image = 'Image',
  Video = 'Video',
  Text = 'Text',
}

export enum PostStatus {
  Draft = 'Draft',
  PendingApproval = 'Pending Approval',
  Approved = 'Approved',
  Published = 'Published',
}



export interface ContentPost {
  id: string;
  projectId: string;
  platform: SocialPlatform;
  postType: PostType;
  status: PostStatus;
  scheduledDate: string; // ISO string
  createdBy: string; // userId
  approvedBy?: string; // userId
  postText: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface MarketReportResult {
  report: string;
  sources: any[];
  tokenCount: number;
  cost: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    sources?: any[];
    action?: 'request_location';
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
}

export enum ChatMode {
    Staff = 'staff',
    Client = 'client',
}

export enum ContractType {
  AgencyAgreement = 'Agency Agreement',
  SellerToAgent = 'Seller-to-Agent Agreement',
  BuyerToAgent = 'Buyer-to-Agent Agreement',
  AgentToAgent = 'Agent-to-Agent Referral',
  SupplierAgreement = 'Supplier Agreement',
}

export enum ContractStatus {
  Draft = 'Draft',
  Signed = 'Signed',
  Expired = 'Expired',
}

export enum Department {
  Sales = 'Sales',
  Marketing = 'Marketing',
  Procurement = 'Procurement',
  HR = 'HR',
  Agents = 'Agents',
}

export interface Contract {
  id: string;
  type: ContractType;
  partyName: string;
  startDate: string; // ISO string
  expiryDate: string; // ISO string
  status: ContractStatus;
  department: Department;
  documentUrl: string;
  createdBy: string; // userId
}

export interface Listing {
    id: string;
    clientId: string;
    title: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    imageUrl: string;
    status: 'For Sale' | 'For Rent' | 'Sold';
}

export enum PropertyType {
    Apartment = "Apartment",
    Villa = "Villa",
    Townhouse = "Townhouse",
    Penthouse = "Penthouse",
}
  

export enum ClientView {
  AI = 'ai',
  MapAssistant = 'map-assistant', // NEW
  Listings = 'listings',
  Mortgage = 'mortgage',
  Vault = 'vault',
}
  
export interface VaultDocument {
    id: string;
    clientId: string;
    name: string;
    type: 'Passport' | 'KYC' | 'SPA' | 'Title Deed' | 'Other';
    uploadDate: string; // ISO string
    url: string;
}

// --- DARIE Finance Intelligence Types ---

export interface LedgerEntry {
    id: string;
    date: string;
    description: string;
    reference: string; // Invoice No or Expense No
    category: string;
    debit: number;
    credit: number;
    balance?: number;
    status: 'Posted' | 'Reversed';
    postedBy: string;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    agencyName: string;
    agencyTrn: string;
    agencyAddress: string;
    agencyTel?: string;
    agencyEmail?: string;
    clientName: string;
    clientAddress: string;
    clientTrn?: string;
    buyerName?: string;
    propertyName: string;
    unitNumber: string;
    salePrice: number;
    commissionPercentage: number;
    stages: {
        stageName: string;
        netAmount: number;
        vatAmount: number;
        grossAmount: number;
    }[];
    totalNet: number;
    totalVat: number;
    totalGross: number;
    totalInWords: string;
    paymentTerms: string;
    bankDetails: {
        name: string;
        accountNumber: string;
        iban: string;
        swift: string;
        branch: string;
        bankName: string;
    };
}

export interface ExpenseData {
    supplierName: string;
    trn?: string;
    invoiceNumber: string;
    date: string;
    subtotal: number;
    vatAmount: number;
    totalAmount: number;
    currency: string;
    category: string;
    journalEntry: {
        debit: string;
        credit: string;
    };
    confidence: number;
    lineItems: { description: string, amount: number }[];
}

export interface BankTransaction {
    date: string;
    description: string;
    amount: number;
    type: 'Debit' | 'Credit';
    reference?: string;
}

export interface ReconciliationReport {
    summary: {
        totalTransactions: number;
        matched: number;
        suggested: number;
        unmatched: number;
    };
    matches: {
        transaction: BankTransaction;
        matchType: 'Exact' | 'Fuzzy' | 'None';
        suggestedMatch?: string; // ID or Description of Invoice/Expense
    }[];
}

declare global {
    interface Window {
      jspdf: any;
      html2canvas: any;
    }
}