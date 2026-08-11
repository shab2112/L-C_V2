import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon } from './icons/HomeIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CashIcon } from './icons/CashIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ContractIcon } from './icons/ContractIcon';
import { User, UserRole } from '../types';

const MapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

interface SidebarProps {
  currentUser: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const isStaff = currentUser.role !== UserRole.Client;

  const staffNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { id: 'darie-assistant', label: 'Darie Assistant', icon: MapIcon, path: '/dashboard/darie-assistant' },
    { id: 'content-studio', label: 'Content Studio', icon: DocumentTextIcon, path: '/dashboard/content-studio' },
    { id: 'market-intelligence', label: 'Market Intelligence', icon: ChartBarIcon, path: '/dashboard/market-intelligence' },
    { id: 'finance-intelligence', label: 'Finance Intelligence', icon: CashIcon, path: '/dashboard/finance-intelligence', roles: [UserRole.Owner, UserRole.Admin] },
    { id: 'clients', label: 'Client Registry', icon: UsersIcon, path: '/dashboard/clients' },
    { id: 'contracts', label: 'Contracts', icon: ContractIcon, path: '/dashboard/contracts', roles: [UserRole.Owner, UserRole.Admin] },
    { id: 'master-prompts', label: 'Master Prompts', icon: BookmarkIcon, path: '/dashboard/master-prompts', roles: [UserRole.Owner, UserRole.Admin] },
  ];

  const navItems = isStaff
    ? staffNavItems.filter(item => !item.roles || item.roles.includes(currentUser.role))
    : [];

  return (
    <aside className="bg-brand-primary w-20 flex-shrink-0 flex flex-col items-center border-r border-brand-accent">
      <nav className="p-4 space-y-3 mt-4 w-full">
        {navItems.map(item => (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={() => navigate(item.path)}
              className={`flex items-center justify-center p-3 rounded-lg w-full transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-brand-gold text-white shadow-lg'
                  : 'text-brand-light hover:bg-brand-accent hover:text-brand-text'
              }`}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </button>
            {hoveredItem === item.id && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm font-medium">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;