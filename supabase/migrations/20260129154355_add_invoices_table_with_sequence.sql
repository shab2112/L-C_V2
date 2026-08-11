/*
  # Add Invoices Table with Sequential Numbering

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique) - Sequential format: INV-0001, INV-0002, etc.
      - `invoice_sequence` (integer, auto-increment) - Numeric sequence for invoice numbers
      - `invoice_data` (jsonb) - Full invoice JSON data
      - `client_name` (text) - For quick reference and filtering
      - `property_name` (text) - Property reference
      - `unit_number` (text) - Unit reference
      - `total_gross` (numeric) - Total invoice amount
      - `status` (text) - Invoice status: Draft, Sent, Paid, Cancelled
      - `created_by` (uuid) - User who created the invoice
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sequence
    - Create sequence for invoice numbering starting from 1

  3. Security
    - Enable RLS on `invoices` table
    - Add policies for authenticated users to manage invoices
    - Anonymous users cannot access invoices
*/

-- Create sequence for invoice numbering
CREATE SEQUENCE IF NOT EXISTS invoice_sequence_seq START WITH 1 INCREMENT BY 1;

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number text UNIQUE NOT NULL,
    invoice_sequence integer UNIQUE NOT NULL DEFAULT nextval('invoice_sequence_seq'),
    invoice_data jsonb NOT NULL,
    client_name text NOT NULL,
    property_name text,
    unit_number text,
    total_gross numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Paid', 'Cancelled')),
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all invoices
CREATE POLICY "Authenticated users can view invoices"
    ON invoices FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can create invoices
CREATE POLICY "Authenticated users can create invoices"
    ON invoices FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Authenticated users can update their own invoices
CREATE POLICY "Authenticated users can update own invoices"
    ON invoices FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Policy: Anonymous users cannot access invoices
CREATE POLICY "Anonymous users cannot access invoices"
    ON invoices FOR SELECT
    TO anon
    USING (false);

-- Function to get next invoice number
CREATE OR REPLACE FUNCTION get_next_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    next_seq integer;
    invoice_num text;
BEGIN
    next_seq := nextval('invoice_sequence_seq');
    invoice_num := 'INV-' || lpad(next_seq::text, 4, '0');
    RETURN invoice_num;
END;
$$;