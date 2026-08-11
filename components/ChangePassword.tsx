import React, { useState } from 'react';
import { Tooltip } from './Tooltip';

interface ChangePasswordProps {
  userId: string;
  email: string;
  isForced?: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  userId,
  email,
  isForced = false,
  onSuccess,
  onCancel,
  onClose
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ userId, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isForced ? 'Change Your Password' : 'Update Password'}
          </h2>
          {!isForced && (
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          {isForced
            ? 'For security, please change your temporary password'
            : 'Enter your new password below'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none text-gray-900 bg-white"
              placeholder=""
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none text-gray-900 bg-white"
              placeholder=""
              required
              minLength={8}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Tooltip content="Confirm password change" position="top" className="flex-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-gold text-brand-primary font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-400 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </Tooltip>
            {!isForced && (
              <Tooltip content="Discard changes and close" position="top" className="flex-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
              </Tooltip>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
