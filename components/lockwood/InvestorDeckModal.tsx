import React, { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';

interface InvestorDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  pdfPath: string;
}

export const InvestorDeckModal: React.FC<InvestorDeckModalProps> = ({
  isOpen,
  onClose,
  projectName,
  pdfPath,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/investor-deck-download`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          project_name: projectName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      const link = document.createElement('a');
      link.href = pdfPath;
      link.download = `${projectName}-Investor-Deck.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setEmail('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-lc-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download size={32} className="text-lc-gold" />
          </div>
          <h2 className="text-2xl font-bold text-lc-navy mb-2">Download Investor Deck</h2>
          <p className="text-gray-600 text-sm">
            Enter your email to receive the {projectName} investor presentation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lc-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-lc-navy text-white py-3 rounded-lg font-bold hover:bg-lc-dark transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download size={20} />
                Download Now
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By downloading, you agree to receive updates about {projectName}
          </p>
        </form>
      </div>
    </div>
  );
};
