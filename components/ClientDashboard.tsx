import React, { useState } from 'react';
import { User, ClientView } from '../types';
import MyListings from './MyListings';
import ClientSidebar from './ClientSidebar';
import MortgageCalculator from './MortgageCalculator';
import MyVault from './MyVault';
import ClientAIView from './ClientAIView';
import DarieAssistant from '../DarieAssistant';
import { AlertCircle } from 'lucide-react';

const ClientDashboard: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [currentView, setCurrentView] = useState<ClientView>(ClientView.AI);

    const renderContent = () => {
        switch (currentView) {
            case ClientView.Listings:
                return <MyListings currentUser={currentUser} />;
            case ClientView.AI:
                return <ClientAIView currentUser={currentUser} />;
            case ClientView.MapAssistant:
                return <DarieAssistant onClose={() => setCurrentView(ClientView.AI)} />;
            case ClientView.Mortgage:
                return <MortgageCalculator />;
            case ClientView.Vault:
                return <MyVault currentUser={currentUser} />;
            default:
                return <ClientAIView currentUser={currentUser} />;
        }
    };

    const notificationText = "Please note that our database is currently being updated. As a result, specific project-related queries—such as amenities and detailed project information—will temporarily be unavailable through DARIE. We appreciate your patience during this process. Once the update is complete, all registered users will receive an automated notification.";

    return (
        <div className="flex flex-1 overflow-hidden flex-col">
            {/* Scrolling Notification Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white py-2 overflow-hidden shadow-md relative">
                <div className="flex animate-marquee">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 whitespace-nowrap px-8">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span className="text-sm font-medium">
                                {notificationText}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <ClientSidebar currentView={currentView} setCurrentView={setCurrentView} />
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default ClientDashboard;