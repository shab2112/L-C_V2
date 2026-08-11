import { supabase } from '../supabaseClient';

export interface InvoiceRecord {
  id?: string;
  invoice_number?: string;
  invoice_sequence?: number;
  invoice_data: any;
  client_name: string;
  property_name?: string;
  unit_number?: string;
  total_gross: number;
  status?: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
  created_by?: string;
}

export async function getNextInvoiceNumber(): Promise<string> {
  const { data, error } = await supabase.rpc('get_next_invoice_number');

  if (error) {
    console.error('Error getting next invoice number:', error);
    throw new Error('Failed to get next invoice number');
  }

  return data as string;
}

export async function createInvoice(invoice: InvoiceRecord): Promise<any> {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }

  return data;
}

export async function getInvoiceByNumber(invoiceNumber: string): Promise<any> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .maybeSingle();

  if (error) {
    console.error('Error fetching invoice:', error);
    throw new Error('Failed to fetch invoice');
  }

  return data;
}

export async function getAllInvoices(): Promise<any[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    throw new Error('Failed to fetch invoices');
  }

  return data || [];
}

export async function updateInvoiceStatus(
  invoiceNumber: string,
  status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled'
): Promise<any> {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('invoice_number', invoiceNumber)
    .select()
    .single();

  if (error) {
    console.error('Error updating invoice status:', error);
    throw new Error('Failed to update invoice status');
  }

  return data;
}
