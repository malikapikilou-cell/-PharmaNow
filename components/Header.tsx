import React from 'react';
import { Siren, X, History, BrainCircuit } from './icons';

interface HeaderProps {
    onEmergencyClick: () => void;
    isEmergency: boolean;
    onExitEmergency: () => void;
    onHistoryClick: () => void;
    onAiSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEmergencyClick, isEmergency, onExitEmergency, onHistoryClick, onAiSearchClick }) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-2">
                         <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <h1 className="text-2xl font-bold text-accent">PharmaNow</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isEmergency && (
                            <>
                                <button
                                    onClick={onAiSearchClick}
                                    className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-full shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-transform transform hover:scale-105"
                                >
                                    <BrainCircuit size={20} />
                                    <span className="font-semibold hidden sm:block">Smart Search</span>
                                </button>
                                <button
                                    onClick={onHistoryClick}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-dark-text rounded-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-transform transform hover:scale-105"
                                >
                                    <History size={20} />
                                    <span className="font-semibold hidden sm:block">History</span>
                                </button>
                            </>
                        )}
                        {isEmergency ? (
                            <button
                                onClick={onExitEmergency}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-transform transform hover:scale-105"
                            >
                                <X size={20} />
                                <span className="font-semibold hidden sm:block">Exit Emergency</span>
                            </button>
                        ) : (
                            <button
                                onClick={onEmergencyClick}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105 animate-pulse"
                            >
                                <Siren size={20} />
                                <span className="font-semibold hidden sm:block">UrgentCare</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;