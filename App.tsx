import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Pharmacy, Medicine, SortOption, Filters, UserLocation, Order, OrderItem } from './types';
import { PHARMACIES, MEDICINES } from './data/mockData';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PharmacyList from './components/PharmacyList';
import MapView from './components/MapView';
import OrderFlow from './components/OrderFlow';
import OrderHistory from './components/OrderHistory';
import Cart from './components/Cart';
import AiSearchModal from './components/AiSearchModal';
import { ShieldAlert } from './components/icons';

type LocationStatus = 'prompting' | 'granted' | 'denied';
type ActiveView = 'main' | 'history';

const App: React.FC = () => {
    const [medicines] = useState<Medicine[]>(MEDICINES);
    const [pharmacies] = useState<Pharmacy[]>(PHARMACIES);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('prompting');
    const locationWatchId = useRef<number | null>(null);
    
    const [cart, setCart] = useState<OrderItem[]>([]);

    const [filters, setFilters] = useState<Filters>({
        openNow: false,
        onDuty: false,
        delivery: false,
        mobileMoney: false,
    });
    const [sortBy, setSortBy] = useState<SortOption>('distance');
    const [view, setView] = useState<'list' | 'map'>('list');
    const [emergencyMode, setEmergencyMode] = useState(false);

    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    
    const [activeView, setActiveView] = useState<ActiveView>('main');
    const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);

    const haversineDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            locationWatchId.current = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationStatus('granted');
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationStatus('denied');
                    setUserLocation({ lat: -1.9441, lng: 30.0619 }); // Fallback location
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setLocationStatus('denied');
            setUserLocation({ lat: -1.9441, lng: 30.0619 });
        }

        return () => {
            if (locationWatchId.current) {
                navigator.geolocation.clearWatch(locationWatchId.current);
            }
        };
    }, []);

    const filteredAndSortedPharmacies = useMemo(() => {
        let processedPharmacies = pharmacies.map(p => {
            const distance = userLocation ? haversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng) : Infinity;
            let isFulfillable = true;
            let cartTotal = 0;

            if (cart.length > 0) {
                for (const cartItem of cart) {
                    const medInStock = medicines.find(m => m.pharmacyId === p.id && m.name === cartItem.medicine.name);
                    if (!medInStock || medInStock.stock < cartItem.quantity) {
                        isFulfillable = false;
                        break;
                    }
                    cartTotal += medInStock.price * cartItem.quantity;
                }
            } else {
                isFulfillable = false; // Cannot fulfill an empty cart
            }

            return { ...p, distance, cartTotal, isFulfillable };
        });

        if (cart.length > 0) {
            processedPharmacies = processedPharmacies.filter(p => p.isFulfillable);
        }

        if (filters.openNow) processedPharmacies = processedPharmacies.filter(p => p.isOpen);
        if (filters.onDuty) processedPharmacies = processedPharmacies.filter(p => p.onDuty);
        if (filters.delivery) processedPharmacies = processedPharmacies.filter(p => p.deliveryAvailable);
        if (filters.mobileMoney) processedPharmacies = processedPharmacies.filter(p => p.acceptsMobileMoney);
        
        if (emergencyMode) {
             return pharmacies
                .map(p => ({
                    ...p,
                    distance: userLocation ? haversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng) : Infinity,
                }))
                .filter(p => p.isOpen && p.onDuty)
                .sort((a, b) => a.distance - b.distance);
        }

        switch (sortBy) {
            case 'price':
                if (cart.length > 0) {
                    processedPharmacies.sort((a, b) => (a.cartTotal || Infinity) - (b.cartTotal || Infinity));
                }
                break;
            case 'delivery':
                processedPharmacies.sort((a, b) => a.deliveryTime - b.deliveryTime);
                break;
            case 'distance':
            default:
                processedPharmacies.sort((a, b) => a.distance - b.distance);
                break;
        }

        return processedPharmacies;
    }, [pharmacies, cart, filters, sortBy, userLocation, haversineDistance, emergencyMode, medicines]);

    const handleAddToCart = (medicine: Medicine) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.medicine.name === medicine.name);
            if (existingItem) {
                return prevCart.map(item => 
                    item.medicine.name === medicine.name 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            return [...prevCart, { medicine, quantity: 1 }];
        });
    };

    const handleUpdateCartQuantity = (medicineId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCart(prevCart => prevCart.map(item => 
            item.medicine.id === medicineId ? { ...item, quantity: newQuantity } : item
        ));
    };

    const handleRemoveFromCart = (medicineName: string) => {
        setCart(prevCart => prevCart.filter(item => item.medicine.name !== medicineName));
    };

    const handleStartOrder = (pharmacy: Pharmacy) => {
        if (cart.length === 0) {
            alert("Your medicine list is empty.");
            return;
        }
        setSelectedPharmacy(pharmacy);
        setCurrentOrder({
            id: Date.now(),
            pharmacy: pharmacy,
            items: cart,
            total: pharmacy.cartTotal || 0,
            status: 'pending',
            date: new Date().toISOString(),
            rider: null,
        });
    };

    const handleOrderComplete = (order: Order) => {
        setOrderHistory(prev => [order, ...prev]);
        setCurrentOrder(null);
        setSelectedPharmacy(null);
        setCart([]); // Clear cart after successful order
    };
    
    const toggleFavorite = (pharmacyId: number) => {
        setFavorites(prev => 
            prev.includes(pharmacyId) 
            ? prev.filter(id => id !== pharmacyId)
            : [...prev, pharmacyId]
        );
    };

    const handleEmergency = () => {
        setEmergencyMode(true);
        setFilters({ openNow: true, onDuty: true, delivery: false, mobileMoney: false });
        setSortBy('distance');
        setView('list');
        setCart([]);
        setActiveView('main');
    };

    const handleExitEmergency = () => {
        setEmergencyMode(false);
         setFilters({ openNow: false, onDuty: false, delivery: false, mobileMoney: false });
    };

    if (locationStatus === 'prompting') {
        return (
            <div className="flex items-center justify-center h-screen bg-light-bg text-dark-text">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Getting your location...</p>
                </div>
            </div>
        );
    }
    
    if (currentOrder && selectedPharmacy) {
        return <OrderFlow 
            order={currentOrder}
            pharmacy={selectedPharmacy}
            userLocation={userLocation}
            onBack={() => { setCurrentOrder(null); setSelectedPharmacy(null); }}
            onOrderComplete={handleOrderComplete}
        />;
    }

    return (
        <div className="bg-light-bg min-h-screen font-sans text-dark-text">
            <Header 
                onEmergencyClick={handleEmergency} 
                isEmergency={emergencyMode} 
                onExitEmergency={handleExitEmergency}
                onHistoryClick={() => setActiveView('history')}
                onAiSearchClick={() => setIsAiSearchOpen(true)}
            />
            <main className="p-4 md:p-6 max-w-7xl mx-auto">
                {activeView === 'main' ? (
                    <>
                        {locationStatus === 'denied' && (
                            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md mb-4 flex items-center space-x-3">
                                <ShieldAlert size={24} />
                                <div>
                                    <h3 className="font-bold">Location Access Denied</h3>
                                    <p>PharmaNow works best with location access. Please enable it in your browser settings to find nearby pharmacies.</p>
                                </div>
                            </div>
                        )}

                        {!emergencyMode && (
                            <>
                                <SearchBar
                                    onMedicineAdd={handleAddToCart}
                                    allMedicines={medicines}
                                    filters={filters}
                                    setFilters={setFilters}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    view={view}
                                    setView={setView}
                                />
                                <Cart cart={cart} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveFromCart} />
                            </>
                        )}
                        {emergencyMode && (
                            <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md mb-4">
                                <h3 className="font-bold">Emergency Mode Activated</h3>
                                <p>Showing nearest 24/7 pharmacies. Call 112 for immediate assistance.</p>
                            </div>
                        )}
                        
                        {view === 'list' ? (
                            <PharmacyList
                                pharmacies={filteredAndSortedPharmacies}
                                onOrder={handleStartOrder}
                                favorites={favorites}
                                onToggleFavorite={toggleFavorite}
                                cart={cart}
                            />
                        ) : (
                            <MapView 
                                pharmacies={filteredAndSortedPharmacies} 
                                userLocation={userLocation} 
                            />
                        )}
                    </>
                ) : (
                    <OrderHistory orders={orderHistory} onBack={() => setActiveView('main')} />
                )}
            </main>
            {isAiSearchOpen && (
                <AiSearchModal
                    isOpen={isAiSearchOpen}
                    onClose={() => setIsAiSearchOpen(false)}
                    pharmacies={pharmacies}
                    medicines={medicines}
                    userLocation={userLocation}
                />
            )}
        </div>
    );
};

export default App;