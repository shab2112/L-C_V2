import React, { useState } from 'react';
import { ClientView } from '../types';
import { CalculatorIcon } from './icons/CalculatorIcon';
import { BuildingIcon } from './icons/BuildingIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { MortgageIcon } from './icons/MortgageIcon';
import { VaultIcon } from './icons/VaultIcon';

const MapIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

interface ClientSidebarProps {
  currentView: ClientView;
  setCurrentView: (view: ClientView) => void;
}

const navItems = [
    { id: ClientView.MapAssistant, label: 'Map Assistant', icon: MapIcon },
    { id: ClientView.AI, label: 'Ask AI Assistant', icon: ChatBubbleIcon },
    { id: ClientView.Mortgage, label: 'Mortgage Calculator', icon: MortgageIcon },
];

const ClientSidebar: React.FC<ClientSidebarProps> = ({ currentView, setCurrentView }) => {
  const [hoveredItem, setHoveredItem] = useState<ClientView | null>(null);

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
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center justify-center p-3 rounded-lg w-full transition-all duration-200 ${
                currentView === item.id
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

export default ClientSidebar;