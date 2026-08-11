import React, { useState, useEffect } from 'react';
import { User } from '../types';
import UserSwitcher from './UserSwitcher';
import NotificationBell from './NotificationBell';
import { UserCircleIcon } from './icons/UserCircleIcon';
import Profile from './Profile';
import ChangePassword from './ChangePassword';
import { usersService } from '../lib/db/users';

interface HeaderProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  onLogout?: () => void;
  onReturnToMarketing?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, setCurrentUser, onLogout, onReturnToMarketing }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await usersService.getAll();
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, []);

  const handleLogoClick = () => {
    // Open marketing site in new tab to maintain logged-in session
    window.open('/', '_blank');
  };

  return (
    <header className="bg-brand-primary border-b border-brand-accent p-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <img
          src="/lockwood-assets/general/logo.png"
          alt="Lockwood & Carter"
          className="h-14 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
          title="Visit Lockwood & Carter (opens in new tab)"
        />
        <span className="font-script text-3xl text-lc-gold tracking-wide hidden sm:block" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.3)' }}>
          Lockwood & Carter
        </span>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell currentUser={currentUser} />
        {currentUser.role !== 'Client' && (
          <UserSwitcher
            users={allUsers}
            selectedUser={currentUser}
            onSelectUser={setCurrentUser}
          />
        )}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-brand-accent px-3 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
          >
            <UserCircleIcon className="w-5 h-5 text-brand-gold" />
            <span className="text-sm font-medium hidden sm:inline">{currentUser.name}</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                Change Password
              </button>
              <hr className="my-2" />
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {showProfile && (
        <Profile
          userId={currentUser.id}
          userRole={currentUser.role as 'Client' | 'Admin' | 'Owner' | 'Property Advisor'}
          onClose={() => setShowProfile(false)}
          onChangePassword={() => {
            setShowProfile(false);
            setShowChangePassword(true);
          }}
        />
      )}
      {showChangePassword && (
        <ChangePassword
          userId={currentUser.id}
          email={currentUser.email}
          isForced={false}
          onSuccess={() => {
            setShowChangePassword(false);
            alert('Password changed successfully!');
          }}
          onCancel={() => setShowChangePassword(false)}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </header>
  );
};

export default Header;
