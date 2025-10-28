
import React, { useState } from 'react';
import { Pharmacy, UserLocation } from '../types';
import { MapPin, X } from './icons';

interface MapViewProps {
    pharmacies: Pharmacy[];
    userLocation: UserLocation | null;
}

const MapView: React.FC<MapViewProps> = ({ pharmacies, userLocation }) => {
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

    const bounds = {
        minLat: Math.min(...pharmacies.map(p => p.lat), userLocation?.lat || Infinity),
        maxLat: Math.max(...pharmacies.map(p => p.lat), userLocation?.lat || -Infinity),
        minLng: Math.min(...pharmacies.map(p => p.lng), userLocation?.lng || Infinity),
        maxLng: Math.max(...pharmacies.map(p => p.lng), userLocation?.lng || -Infinity),
    };

    const latRange = bounds.maxLat - bounds.minLat;
    const lngRange = bounds.maxLng - bounds.minLng;

    const getPosition = (lat: number, lng: number) => {
        const top = ((bounds.maxLat - lat) / latRange) * 100;
        const left = ((lng - bounds.minLng) / lngRange) * 100;
        return { top: `${top}%`, left: `${left}%` };
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '70vh' }}>
            <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gray-200">
                    <img 
                      src="https://picsum.photos/seed/map/1200/800"
                      alt="Map placeholder"
                      className="w-full h-full object-cover opacity-30"
                    />
                </div>

                {userLocation && (
                    <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={getPosition(userLocation.lat, userLocation.lng)}
                    >
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" title="Your Location"></div>
                    </div>
                )}

                {pharmacies.map(pharmacy => (
                    <div
                        key={pharmacy.id}
                        className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer"
                        style={getPosition(pharmacy.lat, pharmacy.lng)}
                        onClick={() => setSelectedPharmacy(pharmacy)}
                    >
                        <MapPin size={32} className={`${pharmacy.isOpen ? 'text-primary' : 'text-red-500'} drop-shadow-lg`} />
                    </div>
                ))}

                {selectedPharmacy && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:max-w-sm bg-white p-4 rounded-lg shadow-2xl z-10 animate-fade-in-up">
                        <button onClick={() => setSelectedPharmacy(null)} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800">
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-accent">{selectedPharmacy.name}</h3>
                        <p className="text-sm text-medium-text mt-1">{selectedPharmacy.address}</p>
                        <div className="mt-2 text-sm space-y-1">
                            <p className={selectedPharmacy.isOpen ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                {selectedPharmacy.isOpen ? "Open" : "Closed"} ({selectedPharmacy.hours})
                            </p>
                            <p className="text-gray-600">{selectedPharmacy.phone}</p>
                            <p className="font-semibold">{selectedPharmacy.distance?.toFixed(1)} km away</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapView;
