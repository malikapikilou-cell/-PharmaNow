import React, { useState, useMemo } from 'react';
import { Search, DollarSign, MapPin, Clock, List, Map as MapIcon, Filter, Check } from './icons';
import { Filters, SortOption, Medicine } from '../types';

interface SearchBarProps {
    onMedicineAdd: (medicine: Medicine) => void;
    allMedicines: Medicine[];
    filters: Filters;
    setFilters: (filters: Filters) => void;
    sortBy: SortOption;
    setSortBy: (option: SortOption) => void;
    view: 'list' | 'map';
    setView: (view: 'list' | 'map') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onMedicineAdd, allMedicines, filters, setFilters, sortBy, setSortBy, view, setView }) => {
    const [query, setQuery] = useState('');

    const toggleFilter = (filter: keyof Filters) => {
        setFilters({ ...filters, [filter]: !filters[filter] });
    };

    const searchResults = useMemo(() => {
        if (!query || query.length < 2) return [];

        const lowerCaseQuery = query.toLowerCase();
        const uniqueNames = new Set<string>();
        
        const results = allMedicines.filter(med => {
            const match = (
                med.name.toLowerCase().includes(lowerCaseQuery) ||
                med.genericName.toLowerCase().includes(lowerCaseQuery) ||
                (med.brandName && med.brandName.toLowerCase().includes(lowerCaseQuery))
            );
            if (match && !uniqueNames.has(med.name)) {
                uniqueNames.add(med.name);
                return true;
            }
            return false;
        });
        
        return results.slice(0, 5); // Limit to 5 results for performance
    }, [query, allMedicines]);


    const handleSelectMedicine = (medicine: Medicine) => {
        onMedicineAdd(medicine);
        setQuery('');
    };

    const filterOptions: { key: keyof Filters, label: string }[] = [
        { key: 'openNow', label: 'Open Now' },
        { key: 'onDuty', label: 'Night Duty' },
        { key: 'delivery', label: 'Delivery' },
        { key: 'mobileMoney', label: 'Mobile Money' },
    ];

    const sortOptions: { key: SortOption, label: string, icon: React.ReactNode }[] = [
        { key: 'distance', label: 'Nearest', icon: <MapPin size={16} /> },
        { key: 'price', label: 'Lowest Price', icon: <DollarSign size={16} /> },
        { key: 'delivery', label: 'Fastest Delivery', icon: <Clock size={16} /> },
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search to add a medicine to your list..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchResults.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {searchResults.map(med => (
                            <li 
                                key={med.name} 
                                onClick={() => handleSelectMedicine(med)}
                                className="px-4 py-3 cursor-pointer hover:bg-gray-100"
                            >
                                <p className="font-semibold">{med.name}</p>
                                <p className="text-sm text-gray-500">{med.genericName} - {med.category}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    <span className="font-semibold text-sm text-medium-text shrink-0 mr-2"><Filter size={16} className="inline-block" /> Filters:</span>
                     {filterOptions.map(option => (
                        <button
                            key={option.key}
                            onClick={() => toggleFilter(option.key)}
                            className={`flex items-center shrink-0 px-3 py-1.5 text-sm rounded-full transition-colors ${
                                filters[option.key] ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {filters[option.key] && <Check size={16} className="mr-1" />}
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                     <div className="flex items-center bg-gray-100 rounded-full p-1">
                        {sortOptions.map(option => (
                            <button
                                key={option.key}
                                onClick={() => setSortBy(option.key)}
                                className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                                    sortBy === option.key ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {option.icon}
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button onClick={() => setView('list')} className={`p-2 rounded-full ${view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>
                            <List size={20} />
                        </button>
                        <button onClick={() => setView('map')} className={`p-2 rounded-full ${view === 'map' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>
                            <MapIcon size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;