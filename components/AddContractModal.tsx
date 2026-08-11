
import React, { useState, useEffect } from 'react';
import { Contract, User, ContractStatus, ContractType, UserRole, Department } from '../types';
import { createContract, updateContract } from '../services/apiService';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  currentUser: User;
  contract?: Contract | null;
}

const AddContractModal: React.FC<AddContractModalProps> = ({ isOpen, onClose, onSave, currentUser, contract }) => {
  const [type, setType] = useState<ContractType>(ContractType.AgencyAgreement);
  const [partyName, setPartyName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<ContractStatus>(ContractStatus.Draft);
  const [department, setDepartment] = useState<Department>(Department.Sales);
  const [documentUrl, setDocumentUrl] = useState('');
  const [createdBy, setCreatedBy] = useState<string>(currentUser.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!contract;
  const isAdminOrOwner = currentUser.role === UserRole.Admin || currentUser.role === UserRole.Owner;


  useEffect(() => {
    if (contract) {
        setType(contract.type);
        setPartyName(contract.partyName);
        setStartDate(new Date(contract.startDate).toISOString().split('T')[0]);
        setExpiryDate(new Date(contract.expiryDate).toISOString().split('T')[0]);
        setStatus(contract.status);
        setDepartment(contract.department);
        setDocumentUrl(contract.documentUrl);
        setCreatedBy(contract.createdBy);
    } else {
        resetForm();
    }
  }, [contract, currentUser.id]);
  
  const resetForm = () => {
    setType(ContractType.AgencyAgreement);
    setPartyName('');
    setStartDate('');
    setExpiryDate('');
    setStatus(ContractStatus.Draft);
    setDepartment(Department.Sales);
    setDocumentUrl('');
    setCreatedBy(currentUser.id);
    setError(null);
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !startDate || !expiryDate || !documentUrl) {
      setError('All fields are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const contractData = {
      type,
      partyName,
      startDate: new Date(startDate).toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      status,
      department,
      documentUrl,
      createdBy,
    };

    try {
      if (isEditing && contract) {
        await updateContract(contract.id, contractData);
      } else {
        await createContract(contractData);
      }
      onSave();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process contract.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-secondary rounded-2xl shadow-xl w-full max-w-lg">
        <header className="p-4 border-b border-brand-accent flex justify-between items-center">
          <h2 className="text-xl font-bold text-brand-text">
            {isEditing ? 'Edit Contract' : 'Create New Contract'}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-brand-accent transition-colors">
            <XIcon className="w-6 h-6 text-brand-light" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm">{error}</div>}
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-brand-light mb-1">
              Contract Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as ContractType)}
              className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 focus:ring-2 focus:ring-brand-gold text-brand-text"
            >
              {Object.values(ContractType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="partyName" className="block text-sm font-medium text-brand-light mb-1">
              Developer/Client Legal Name
            </label>
            <input
              type="text"
              id="partyName"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g., Emaar Properties PJSC"
              className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 focus:ring-2 focus:ring-brand-gold text-brand-text"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-brand-light mb-1">Date Signed</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 focus:ring-2 focus:ring-brand-gold text-brand-text"/>
            </div>
            <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-brand-light mb-1">Date Expiry</label>
                <input type="date" id="expiryDate" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 focus:ring-2 focus:ring-brand-gold text-brand-text"/>
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-brand-light mb-1">Status</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value as ContractStatus)} className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 focus:ring-2 focus:ring-brand-gold text-brand-text">
                 {Object.values(ContractStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-brand-light mb-1">Department</label>
            <select id="department" value={department} onChange={e => setDepartment(e.target.value as Department)} className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 focus:ring-2 focus:ring-brand-gold text-brand-text">
                 {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="documentUrl" className="block text-sm font-medium text-brand-light mb-1">Google Drive Link</label>
            <input type="url" id="documentUrl" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} placeholder="https://docs.google.com/..." className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 focus:ring-2 focus:ring-brand-gold text-brand-text"/>
          </div>

          <footer className="pt-4 flex justify-end items-center gap-3">
            <button type="button" onClick={handleClose} className="bg-brand-accent text-brand-text font-semibold py-2 px-4 rounded-lg hover:bg-brand-light hover:text-brand-primary transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-brand-gold text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 disabled:bg-brand-accent disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Contract' : 'Save Contract')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddContractModal;