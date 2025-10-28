import React from 'react';
import { Order } from '../types';
import { ChevronLeft, Package, Calendar, Tag, ShoppingCart, History } from './icons';

interface OrderHistoryProps {
    orders: Order[];
    onBack: () => void;
}

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const getStatusChip = (status: Order['status']) => {
        switch (status) {
            case 'delivered':
                return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Delivered</span>;
            case 'pending':
                return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
             case 'confirmed':
             case 'prepared':
             case 'delivery':
                return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">In Progress</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>;
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border-l-4 border-accent">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-accent">{order.pharmacy.name}</h3>
                        <p className="text-sm text-medium-text">Order ID: #{order.id}</p>
                    </div>
                    {getStatusChip(order.status)}
                </div>

                <div className="mt-4 space-y-2 text-sm text-dark-text">
                    <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-primary" />
                        <span>{new Date(order.date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-start">
                        <Package size={14} className="mr-2 text-primary mt-1" />
                        <div>
                            {order.items.map(item => (
                                <p key={item.medicine.id}>{item.medicine.name} <span className="text-medium-text">x{item.quantity}</span></p>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Tag size={14} className="mr-2 text-primary" />
                        <span className="font-semibold">{order.total.toLocaleString()} RWF</span>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                     <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition-transform transform hover:scale-105 text-sm font-semibold">
                        <ShoppingCart size={16} />
                        <span>Reorder</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onBack }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-accent ml-2">Order History</h2>
            </div>
            
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <History size={48} className="mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-dark-text">No Order History</h3>
                    <p className="mt-1 text-medium-text">Your past orders will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
