
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pharmacy, UserLocation, FilterOptions, SortOption, AppTab, Order } from './types';
import { PHARMACIES } from './data/mockData';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterSortControls from './components/FilterSortControls';
import PharmacyCard from './components/PharmacyCard';
import OrderModal from './components/OrderModal';
import { MapPinIcon, HeartIcon, ClipboardListIcon, SunIcon } from './components/icons/FeatureIcons';
import MapView from './components/MapView';

const App: React.FC = () => {
    const [pharmacies] = useState<Pharmacy[]>(PHARMACIES);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({
        openNow: false,
        onDuty: false,
        deliveryAvailable: false,
        acceptsMobileMoney: false,
    });
    const [sort, setSort] = useState<SortOption>('distance');
    const [activeTab, setActiveTab] = useState<AppTab>('all');
    
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [isOrderModalOpen, setOrderModalOpen] = useState(false);
    const [isMapModalOpen, setMapModalOpen] = useState(false);
    
    const [favorites, setFavorites] = useState<number[]>([1, 3]);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                // Fallback location (e.g., Kigali)
                setUserLocation({ lat: -1.9441, lng: 30.0619 });
            }
        );
    }, []);

    const calculateDistance = useCallback((pharmaLocation: { lat: number; lng: number; }) => {
        if (!userLocation) return Infinity;
        const R = 6371; // Radius of the earth in km
        const dLat = (pharmaLocation.lat - userLocation.lat) * (Math.PI / 180);
        const dLon = (pharmaLocation.lng - userLocation.lng) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLocation.lat * (Math.PI / 180)) * Math.cos(pharmaLocation.lat * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }, [userLocation]);

    const displayedPharmacies = useMemo(() => {
        let filtered = pharmacies;

        if (activeTab === 'onDuty') {
            filtered = filtered.filter(p => p.onDuty);
        } else if (activeTab === 'favorites') {
            filtered = filtered.filter(p => favorites.includes(p.id));
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.medicines.some(m =>
                    m.name.toLowerCase().includes(lowercasedQuery) ||
                    m.genericName.toLowerCase().includes(lowercasedQuery)
                )
            );
        }

        if (filters.openNow) filtered = filtered.filter(p => p.isOpen);
        if (filters.onDuty && activeTab !== 'onDuty') filtered = filtered.filter(p => p.onDuty);
        if (filters.deliveryAvailable) filtered = filtered.filter(p => p.deliveryAvailable);
        if (filters.acceptsMobileMoney) filtered = filtered.filter(p => p.acceptsMobileMoney);

        const getCheapestPrice = (pharmacy: Pharmacy) => {
            if (!searchQuery) return Infinity;
             const medicine = pharmacy.medicines.find(m => 
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                m.genericName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return medicine ? medicine.price : Infinity;
        };

        const sorted = [...filtered].sort((a, b) => {
            if (sort === 'distance') {
                return calculateDistance(a.location) - calculateDistance(b.location);
            }
            if (sort === 'price') {
                return getCheapestPrice(a) - getCheapestPrice(b);
            }
            if (sort === 'delivery') {
                return (a.delivery?.time || Infinity) - (b.delivery?.time || Infinity);
            }
            return 0;
        });

        return sorted;
    }, [pharmacies, searchQuery, filters, sort, activeTab, favorites, calculateDistance]);

    const handleOrder = (pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setOrderModalOpen(true);
    };
    
    const handleViewMap = (pharmacy: Pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setMapModalOpen(true);
    };

    const handleEmergency = () => {
        setActiveTab('all');
        setFilters({
            ...filters,
            openNow: true,
            onDuty: true
        });
        setSort('distance');
        setSearchQuery('');
    };
    
    const toggleFavorite = (id: number) => {
        setFavorites(prev => 
            prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
        );
    };

    const handlePlaceOrder = (order: Order) => {
        setOrderHistory(prev => [order, ...prev]);
    };

    const renderContent = () => {
        if (activeTab === 'orders') {
            return (
                <div className="p-4 md:p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h2>
                    {orderHistory.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-lg shadow">
                           <ClipboardListIcon className="mx-auto h-12 w-12 text-gray-400" />
                           <p className="mt-4 text-gray-500">You have no past orders.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orderHistory.map(order => (
                                <div key={order.transactionId} className="bg-white p-4 rounded-lg shadow">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-blue-600">{order.pharmacyName}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Transaction ID: {order.transactionId}</p>
                                    <p className="text-lg font-semibold text-gray-800 mt-2">Total: ${order.totalAmount.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }
        
        return (
            <>
              <div className="p-4 md:p-6 space-y-4">
                  <SearchBar query={searchQuery} setQuery={setSearchQuery} />
                  <FilterSortControls filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} activeTab={activeTab}/>
              </div>
              <div className="px-4 md:px-6 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedPharmacies.length > 0 ? displayedPharmacies.map(pharmacy => (
                      <PharmacyCard
                          key={pharmacy.id}
                          pharmacy={pharmacy}
                          userLocation={userLocation}
                          calculateDistance={calculateDistance}
                          onOrder={() => handleOrder(pharmacy)}
                          onViewMap={() => handleViewMap(pharmacy)}
                          isFavorite={favorites.includes(pharmacy.id)}
                          onToggleFavorite={() => toggleFavorite(pharmacy.id)}
                          searchQuery={searchQuery}
                      />
                  )) : (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-10 bg-white rounded-lg shadow">
                        <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-gray-500">No pharmacies match your criteria.</p>
                        <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                  )}
              </div>
            </>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} onEmergency={handleEmergency} />
            <main className="max-w-7xl mx-auto">
               {renderContent()}
            </main>
            {isOrderModalOpen && selectedPharmacy && (
                <OrderModal
                    pharmacy={selectedPharmacy}
                    onClose={() => setOrderModalOpen(false)}
                    onPlaceOrder={handlePlaceOrder}
                    searchQuery={searchQuery}
                />
            )}
            {isMapModalOpen && selectedPharmacy && (
                <MapView 
                    pharmacy={selectedPharmacy}
                    onClose={() => setMapModalOpen(false)}
                />
            )}
        </div>
    );
};

export default App;
