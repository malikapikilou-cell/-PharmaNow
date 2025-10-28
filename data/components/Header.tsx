
import React from 'react';
import { AppTab } from '../types';
import { LogoIcon } from './icons/FeatureIcons';

interface HeaderProps {
    activeTab: AppTab;
    setActiveTab: (tab: AppTab) => void;
    onEmergency: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onEmergency }) => {
    const tabs: { id: AppTab; name: string }[] = [
        { id: 'all', name: 'All Pharmacies' },
        { id: 'onDuty', name: 'On Duty' },
        { id: 'orders', name: 'My Orders' },
        { id: 'favorites', name: 'Favorites' },
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <LogoIcon className="h-8 w-8 text-blue-600"/>
                        <h1 className="text-2xl font-bold text-gray-800">PharmaNow</h1>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={onEmergency}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full flex items-center space-x-2 transition duration-150 ease-in-out"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4a1 1 0 012 0v6h-2V4zm0 8a1 1 0 012 0v2h-2v-2z" clipRule="evenodd" />
                        </svg>
                        <span className="hidden sm:inline">UrgentCare</span>
                    </button>
                </div>
            </div>
             <div className="md:hidden border-t border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex justify-around">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 text-center px-3 py-2 rounded-md text-xs font-medium ${
                                activeTab === tab.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;
