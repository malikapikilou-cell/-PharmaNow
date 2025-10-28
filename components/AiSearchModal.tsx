import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Pharmacy, Medicine, UserLocation } from '../types';
import { X, Search, BrainCircuit, CheckCircle, XCircle } from './icons';

interface AiSearchResult {
  medicine_name: string;
  category: string;
  availability: {
    pharmacy: string;
    distance: string;
    status: string;
  }[];
  suggestions: string[];
}

interface AiSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    pharmacies: Pharmacy[];
    medicines: Medicine[];
    userLocation: UserLocation | null;
}

const AiSearchModal: React.FC<AiSearchModalProps> = ({ isOpen, onClose, pharmacies, medicines, userLocation }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AiSearchResult | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSearch = async () => {
        if (!query) {
            setError("Please enter a medicine name to search.");
            return;
        }
         if (!userLocation) {
            setError("Location access is required for Smart Search. Please enable it in your browser settings.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    medicine_name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    availability: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                pharmacy: { type: Type.STRING },
                                distance: { type: Type.STRING },
                                status: { type: Type.STRING },
                            },
                            required: ['pharmacy', 'distance', 'status'],
                        },
                    },
                    suggestions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
                required: ['medicine_name', 'category', 'availability', 'suggestions'],
            };
            
            const systemInstruction = `You are an intelligent pharmacy assistant AI for the "PharmaNow" app. Your goal is to understand a user's request for a medicine, even with typos, abbreviations, or brand/generic names. You will check for its availability in a provided list of pharmacies and their inventories.

You must perform the following steps:
1. Analyze the User Query to identify the intended medicine. Correct any typos or misspellings.
2. Determine the medicine's standard name and its category (e.g., Pain Relief, Antibiotic, etc.).
3. Use the provided User Location and Pharmacies Data to calculate the approximate distance to each pharmacy.
4. Consult the Medicine Inventory Data to check which pharmacies have the identified medicine in stock. The 'stock' property indicates the quantity available. A stock of 0 means 'Out of stock'.
5. If the medicine is not found or is out of stock everywhere, analyze the inventory for 2-3 suitable alternatives (e.g., different brand, same generic name, or different medicine in the same category) that are in stock at nearby pharmacies.
6. If no relevant medicines can be found in the inventory at all, your suggestions should be empty, the medicine_name should be the user's query, and the availability should be empty.

You MUST ALWAYS respond in a structured JSON format, adhering strictly to the provided schema. Do not include any extra text, explanations, or markdown formatting in your response. The response must be a raw JSON object.`;

            const pharmaciesData = pharmacies.map(({ id, name, lat, lng }) => ({ id, name, lat, lng }));
            const medicinesData = medicines.map(({ name, genericName, brandName, category, pharmacyId, stock }) => ({ name, genericName, brandName, category, pharmacyId, stock }));

            const prompt = `Analyze this query: "${query}" using the provided context.
            Context:
            User Location: ${JSON.stringify(userLocation)}
            Pharmacies Data: ${JSON.stringify(pharmaciesData)}
            Medicine Inventory Data: ${JSON.stringify(medicinesData)}
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                },
            });
            
            setResult(JSON.parse(response.text));

        } catch (e) {
            console.error("AI Search Error:", e);
            setError("Sorry, the AI search failed. This could be due to a network issue or an invalid API key. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold text-accent flex items-center"><BrainCircuit size={28} className="mr-3"/> Smart Search</h2>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </div>
                
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="e.g., pracetamol for headache, advil 200mg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <button onClick={handleSearch} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-secondary disabled:bg-gray-400">
                        <Search size={20} />
                    </button>
                </div>

                <div className="min-h-[20rem] max-h-[60vh] overflow-y-auto pr-2">
                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center h-full pt-10">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-medium-text font-semibold">AI is thinking...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
                            <h3 className="font-bold">Error</h3>
                            <p>{error}</p>
                        </div>
                    ) : result ? (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <h3 className="text-xl font-bold">{result.medicine_name}</h3>
                                <p className="text-sm text-medium-text bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">{result.category}</p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold mb-2 text-dark-text">Availability</h4>
                                {result.availability.length > 0 ? (
                                    <ul className="space-y-2">
                                        {result.availability.map((item, index) => (
                                            <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                                <div>
                                                    <p className="font-semibold">{item.pharmacy}</p>
                                                    <p className="text-sm text-medium-text">{item.distance} away</p>
                                                </div>
                                                <span className={`flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${item.status.toLowerCase() === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                     {item.status.toLowerCase() === 'available' ? <CheckCircle size={12} className="mr-1"/> : <XCircle size={12} className="mr-1"/>}
                                                    {item.status}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-medium-text italic">Not found in nearby pharmacies.</p>
                                )}
                            </div>

                             {result.suggestions.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-dark-text">Suggestions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.suggestions.map((sugg, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{sugg}</span>
                                        ))}
                                    </div>
                                </div>
                             )}

                             {result.availability.length === 0 && result.suggestions.length > 0 && (
                                <p className="text-sm text-center p-2 bg-yellow-50 rounded-md">No pharmacies nearby currently have this medicine. Try these similar ones.</p>
                             )}
                        </div>
                    ) : (
                        <div className="text-center pt-10 text-gray-400">
                             <BrainCircuit size={48} className="mx-auto" />
                            <p className="mt-4 font-semibold">Search for any medicine.</p>
                            <p className="text-sm">The AI will handle typos, brand names, and find what you need.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiSearchModal;
