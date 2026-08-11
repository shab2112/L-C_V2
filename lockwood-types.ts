
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingMetadata?: any;
}

export interface PropertyHighlight {
  id: string;
  title: string;
  price: string;
  location: string;
  specs: string;
}

export enum ChatState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export type Page = 'HOME' | 'PROJECTS' | 'ALTAIR_52' | 'SHAHRUKHZ' | 'MASAAR_3' | 'ARTIZE_62' | 'AVIOR' | 'ABOUT_US' | 'REGISTER' | 'LOGIN' | 'BLOGS' | 'CONTACT_US' | 'PRIVACY_POLICY';
