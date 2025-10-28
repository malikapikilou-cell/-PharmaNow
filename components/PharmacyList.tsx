import React from 'react';
import { Pharmacy, OrderItem } from '../types';
import { MapPin, Phone, Clock, Heart, CheckCircle, XCircle, ShoppingCart } from './icons';

interface PharmacyCardProps {
    pharmacy: Pharmacy;
    onOrder: (pharmacy: Pharmacy) => void;
    isFavorite: boolean;
    onToggleFavorite: (id: number) => void;
    cart: OrderItem[];
}

const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, onOrder, isFavorite, onToggleFavorite, cart }) => {
    const { name, address, phone, hours, isOpen, distance, deliveryTime, cartTotal } = pharmacy;

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 ${isOpen ? 'border-primary' : 'border-red-400'}`}>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-accent">{name}</h3>
                        <div className="flex items-center text-sm text-medium-text mt-1">
                            <MapPin size={14} className="mr-2 shrink-0" />
                            <span>{address}</span>
                        </div>
                    </div>
                    <button onClick={() => onToggleFavorite(pharmacy.id)} className="p-2 -mr-2 -mt-2">
                        <Heart size={24} className={`transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-300'}`} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-primary"/>
                        <a href={`tel:${phone}`} className="text-accent hover:underline">{phone}</a>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock size={16} className={isOpen ? "text-primary" : "text-red-500"}/>
                        <span className={isOpen ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{isOpen ? "Open" : "Closed"}</span>
                        <span className="text-gray-500 hidden md:inline">({hours})</span>
                    </div>
                     <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-primary"/>
                        <span>{distance !== undefined ? `${distance.toFixed(1)} km away` : 'N/A'}</span>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-primary"/>
                        <span>{deliveryTime} min delivery</span>
                    </div>
                </div>

                {cart.length > 0 && cartTotal !== undefined && (
                    <div className="mt-4 p-3 rounded-lg bg-green-50 border-green-200 border">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-dark-text">
                                    <CheckCircle size={16} className="inline mr-1 text-green-600" />
                                    All items on your list are available here
                                </p>
                                <span className="text-green-700 font-bold text-lg">Total: {cartTotal.toLocaleString()} RWF</span>
                            </div>
                            <button
                                onClick={() => onOrder(pharmacy)}
                                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-transform transform hover:scale-105"
                            >
                                <ShoppingCart size={18} />
                                <span className="font-semibold">Order All</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface PharmacyListProps {
    pharmacies: Pharmacy[];
    onOrder: (pharmacy: Pharmacy) => void;
    favorites: number[];
    onToggleFavorite: (id: number) => void;
    cart: OrderItem[];
}

const PharmacyList: React.FC<PharmacyListProps> = ({ pharmacies, onOrder, favorites, onToggleFavorite, cart }) => {
    return (
        <div className="space-y-4">
            {pharmacies.length > 0 ? (
                pharmacies.map(pharmacy => (
                    <PharmacyCard
                        key={pharmacy.id}
                        pharmacy={pharmacy}
                        onOrder={onOrder}
                        isFavorite={favorites.includes(pharmacy.id)}
                        onToggleFavorite={onToggleFavorite}
                        cart={cart}
                    />
                ))
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                     <ShoppingCart size={48} className="mx-auto text-gray-300" />
                    <p className="mt-4 text-lg font-semibold text-medium-text">
                        {cart.length > 0 ? "No pharmacies found with all items" : "No pharmacies found"}
                    </p>
                     <p className="text-sm text-gray-500">
                        {cart.length > 0 ? "Try removing an item from your list or adjusting filters." : "Try adjusting your search filters."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PharmacyList;