import React from 'react';
import { OrderItem } from '../types';
import { Plus, Minus, Trash2, ShoppingCart } from './icons';

interface CartProps {
    cart: OrderItem[];
    onUpdateQuantity: (medicineId: number, newQuantity: number) => void;
    onRemoveItem: (medicineName: string) => void;
}

const Cart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onRemoveItem }) => {
    if (cart.length === 0) {
        return null;
    }

    const subtotal = cart.reduce((acc, item) => {
         // Find a representative price, as it varies by pharmacy. This is an estimate.
        return acc + item.medicine.price * item.quantity;
    }, 0);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 animate-fade-in">
            <h2 className="text-xl font-bold text-accent mb-4 flex items-center"><ShoppingCart size={20} className="mr-2"/> Your Medicine List</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                    <div key={item.medicine.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <div>
                            <p className="font-semibold text-dark-text">{item.medicine.name}</p>
                            <p className="text-sm text-medium-text">
                               ~{item.medicine.price.toLocaleString()} RWF
                                <span className="text-xs"> ({item.medicine.genericName})</span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <button 
                                onClick={() => onUpdateQuantity(item.medicine.id, item.quantity - 1)} 
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                                aria-label={`Decrease quantity of ${item.medicine.name}`}
                            >
                                <Minus size={16} />
                            </button>
                            <span className="font-bold w-6 text-center" aria-live="polite">{item.quantity}</span>
                            <button 
                                onClick={() => onUpdateQuantity(item.medicine.id, item.quantity + 1)} 
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                                aria-label={`Increase quantity of ${item.medicine.name}`}
                            >
                                <Plus size={16} />
                            </button>
                            <button onClick={() => onRemoveItem(item.medicine.name)} className="p-1 text-red-500 hover:text-red-700" aria-label={`Remove ${item.medicine.name} from list`}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-right font-bold mt-4 text-dark-text">
                Estimated Subtotal: {subtotal.toLocaleString()} RWF
            </p>
            <p className="text-right text-xs text-medium-text">Final price depends on the selected pharmacy.</p>
        </div>
    );
};

export default Cart;
