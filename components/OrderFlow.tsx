import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Order, Pharmacy, Rider, UserLocation } from '../types';
import { ChevronLeft, Plus, Minus, CreditCard, Download, Share2, CheckCircle, Backspace, Home, Truck, User } from './icons';

interface OrderFlowProps {
    order: Order;
    pharmacy: Pharmacy;
    userLocation: UserLocation | null;
    onBack: () => void;
    onOrderComplete: (order: Order) => void;
}

type OrderStep = 'confirm' | 'delivery' | 'payment' | 'tracking' | 'receipt';

// PIN Entry Screen Component
const PinEntryScreen: React.FC<{
    total: number;
    paymentMethod: string;
    pin: string;
    setPin: (pin: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    isPaying: boolean;
    error: string;
}> = ({ total, paymentMethod, pin, setPin, onConfirm, onCancel, isPaying, error }) => {
    
    const handleKeyPress = (key: string) => {
        if (pin.length < 5) {
            setPin(pin + key);
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
                <h3 className="text-center font-bold text-lg text-accent">Enter PIN</h3>
                <p className="text-center text-sm text-medium-text mb-2">to pay with {paymentMethod}</p>
                <p className="text-center text-3xl font-bold my-4">{total.toLocaleString()} RWF</p>

                <div className="flex justify-center items-center space-x-2 my-4">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < pin.length ? 'bg-accent' : 'bg-gray-200'}`}></div>
                    ))}
                </div>

                {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}
                
                <div className="grid grid-cols-3 gap-2">
                    {numpadKeys.map((key) => (
                        <button 
                            key={key}
                            onClick={() => key === 'backspace' ? handleDelete() : (key ? handleKeyPress(key) : null)}
                            disabled={!key || isPaying}
                            className="h-16 rounded-full text-2xl font-semibold focus:outline-none transition-colors enabled:hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center"
                        >
                            {key === 'backspace' ? <Backspace size={24} /> : key}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={onConfirm}
                    disabled={isPaying}
                    className="w-full mt-4 bg-primary text-white font-bold py-3 rounded-lg hover:bg-secondary transition disabled:bg-primary/70 flex items-center justify-center"
                >
                    {isPaying ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        'Confirm Payment'
                    )}
                </button>
                <button onClick={onCancel} disabled={isPaying} className="w-full mt-2 text-center text-medium-text py-2">Cancel</button>
            </div>
        </div>
    );
};


const OrderFlow: React.FC<OrderFlowProps> = ({ order, pharmacy, userLocation, onBack, onOrderComplete }) => {
    const [currentStep, setCurrentStep] = useState<OrderStep>('confirm');
    const [currentOrder, setCurrentOrder] = useState<Order>({...order, userLocation});
    const [selectedRider, setSelectedRider] = useState<Rider | null>(pharmacy.riders[0] || null);
    const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Visa' | 'Mastercard'>('Mobile Money');
    const [trackingStatus, setTrackingStatus] = useState<Order['status']>('confirmed');
    
    // New states for PIN entry
    const [showPinEntry, setShowPinEntry] = useState(false);
    const [pin, setPin] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    const updateQuantity = (medicineId: number, delta: number) => {
        const newItems = currentOrder.items.map(item =>
            item.medicine.id === medicineId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        );
        const newTotal = newItems.reduce((acc, item) => acc + item.medicine.price * item.quantity, 0);
        setCurrentOrder({ ...currentOrder, items: newItems, total: newTotal });
    };

    const handleConfirmOrder = () => {
        if (pharmacy.deliveryAvailable) {
            setCurrentStep('delivery');
        } else {
            setCurrentStep('payment');
        }
    };
    
    const handleSelectRider = (rider: Rider) => {
        setSelectedRider(rider);
        setCurrentOrder({...currentOrder, rider});
        setCurrentStep('payment');
    };

    const handleInitiatePayment = () => {
        setPin('');
        setPaymentError('');
        setShowPinEntry(true);
    };

    const handleConfirmPayment = () => {
        if (pin.length !== 5) {
            setPaymentError('PIN must be 5 digits');
            return;
        }
        setIsPaying(true);
        setPaymentError('');

        // Simulate payment processing
        setTimeout(() => {
            setIsPaying(false);
            setShowPinEntry(false);
            const finalOrder = { ...currentOrder, paymentMethod, transactionId: `TXN${Date.now()}` };
            setCurrentOrder(finalOrder);
            setTrackingStatus('confirmed');
            setCurrentStep('tracking');
        }, 2000);
    };

    const trackingCallback = useCallback(() => {
        const statuses: Order['status'][] = ['prepared', 'delivery', 'delivered'];
        let currentIndex = 0;
        
        const interval = setInterval(() => {
            if (currentIndex < statuses.length) {
                setTrackingStatus(statuses[currentIndex]);
                if (statuses[currentIndex] === 'delivered') {
                    const finalOrder = { ...currentOrder, status: 'delivered', paymentMethod, transactionId: currentOrder.transactionId || `TXN${Date.now()}` };
                    setCurrentOrder(finalOrder);
                    onOrderComplete(finalOrder);
                    setTimeout(() => setCurrentStep('receipt'), 1000);
                }
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 5000); // 5 seconds per step

        return () => clearInterval(interval);
    }, [currentOrder, onOrderComplete, paymentMethod]);


    useEffect(() => {
        if (currentStep === 'tracking') {
            const cleanup = trackingCallback();
            return cleanup;
        }
    }, [currentStep, trackingCallback]);
    

    const renderStep = () => {
        switch (currentStep) {
            case 'confirm': return <ConfirmStep order={currentOrder} onUpdateQuantity={updateQuantity} onNext={handleConfirmOrder} />;
            case 'delivery': return <DeliveryStep pharmacy={pharmacy} onSelectRider={handleSelectRider} />;
            case 'payment': return <PaymentStep order={currentOrder} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} onPay={handleInitiatePayment} />;
            case 'tracking': return <TrackingStep status={trackingStatus} order={currentOrder} />;
            case 'receipt': return <ReceiptStep order={currentOrder} />;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6 bg-light-bg min-h-screen">
            {showPinEntry && (
                <PinEntryScreen
                    total={currentOrder.total}
                    paymentMethod={paymentMethod}
                    pin={pin}
                    setPin={setPin}
                    onConfirm={handleConfirmPayment}
                    onCancel={() => setShowPinEntry(false)}
                    isPaying={isPaying}
                    error={paymentError}
                />
            )}
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-accent ml-2 capitalize">{currentStep === 'delivery' ? 'Select Rider' : currentStep}</h2>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {renderStep()}
            </div>
        </div>
    );
};

// Sub-components for each step
const ConfirmStep: React.FC<{ order: Order, onUpdateQuantity: (id: number, delta: number) => void, onNext: () => void }> = ({ order, onUpdateQuantity, onNext }) => (
    <div>
        <h3 className="text-xl font-semibold mb-4">Confirm Your Items</h3>
        <div className="space-y-4">
            {order.items.map(item => (
                <div key={item.medicine.id} className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{item.medicine.name}</p>
                        <p className="text-sm text-medium-text">{item.medicine.price.toLocaleString()} RWF</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => onUpdateQuantity(item.medicine.id, -1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><Minus size={16} /></button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.medicine.id, 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><Plus size={16} /></button>
                    </div>
                </div>
            ))}
        </div>
        <hr className="my-6" />
        <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span>{order.total.toLocaleString()} RWF</span>
        </div>
        <button onClick={onNext} className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-lg hover:bg-secondary transition">
            Proceed
        </button>
    </div>
);

const DeliveryStep: React.FC<{ pharmacy: Pharmacy, onSelectRider: (rider: Rider) => void }> = ({ pharmacy, onSelectRider }) => (
    <div>
        <h3 className="text-xl font-semibold mb-4">Select a Rider</h3>
        <div className="space-y-3">
            {pharmacy.riders.map(rider => (
                <button key={rider.id} onClick={() => onSelectRider(rider)} className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 hover:border-primary transition">
                    <p className="font-semibold">{rider.name}</p>
                    <p className="text-sm text-medium-text">{rider.phone} | {rider.workingHours}</p>
                </button>
            ))}
        </div>
    </div>
);

const PaymentStep: React.FC<{ order: Order; paymentMethod: string; setPaymentMethod: (m: 'Mobile Money' | 'Visa' | 'Mastercard') => void; onPay: () => void; }> = ({ order, paymentMethod, setPaymentMethod, onPay }) => (
    <div>
        <h3 className="text-xl font-semibold mb-4">Payment</h3>
        <p className="text-center text-3xl font-bold my-6">{order.total.toLocaleString()} RWF</p>
        <div className="space-y-3">
            {(['Mobile Money', 'Visa', 'Mastercard'] as const).map(method => (
                <button key={method} onClick={() => setPaymentMethod(method)} className={`w-full flex items-center p-4 border rounded-lg transition-all ${paymentMethod === method ? 'border-primary bg-green-50 ring-2 ring-primary' : 'hover:bg-gray-50'}`}>
                    <CreditCard size={20} className="mr-3"/> {method}
                </button>
            ))}
        </div>
        <button onClick={onPay} className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-lg hover:bg-secondary transition">
            Pay Now
        </button>
    </div>
);

const TrackingStep: React.FC<{ status: Order['status']; order: Order }> = ({ status, order }) => {
    const statuses: { id: Order['status'], label: string }[] = [
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'prepared', label: 'Preparing' },
        { id: 'delivery', label: 'Out for Delivery' },
        { id: 'delivered', label: 'Delivered' },
    ];
    const currentIndex = statuses.findIndex(s => s.id === status);
    const progressPercentage = (currentIndex / (statuses.length - 1)) * 100;

    const riderProgress = useMemo(() => {
        switch (status) {
            case 'confirmed': return 0;
            case 'prepared': return 5; // Rider is at pharmacy
            case 'delivery': return 50; // Rider is halfway
            case 'delivered': return 100; // Rider is at user
            default: return 0;
        }
    }, [status]);
    
    return (
        <div>
            <h3 className="text-xl font-semibold text-center mb-8">Order Status</h3>
            <div className="flex justify-between items-start w-full relative">
                 <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 transform -translate-y-1/2 -z-10">
                     <div className="h-1 bg-primary transition-all duration-1000" style={{width: `${progressPercentage}%`}}></div>
                 </div>
                 {statuses.map((s, index) => (
                    <div key={s.id} className="flex flex-col items-center z-10 text-center w-20">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${index <= currentIndex ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                           <CheckCircle size={24}/>
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${index <= currentIndex ? 'text-primary' : 'text-gray-500'}`}>{s.label}</p>
                    </div>
                ))}
            </div>
             <p className="text-center mt-8 text-medium-text animate-pulse">Your order is {status === 'delivery' ? 'on the way' : `being ${status}`}...</p>
            
            {/* Delivery Map Simulation */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg h-48 relative overflow-hidden">
                <div className="absolute top-1/2 left-8 right-8 h-0.5 border-t-2 border-dashed border-gray-400"></div>
                
                {/* Pharmacy */}
                <div className="absolute top-1/2 left-8 -translate-y-1/2 text-center">
                    <div className="bg-white p-2 rounded-full shadow-md">
                        <Home size={24} className="text-accent" />
                    </div>
                    <span className="text-xs font-semibold">Pharmacy</span>
                </div>

                {/* User */}
                {order.userLocation && (
                    <div className="absolute top-1/2 right-8 -translate-y-1/2 text-center">
                        <div className="bg-white p-2 rounded-full shadow-md">
                            <User size={24} className="text-blue-500" />
                        </div>
                        <span className="text-xs font-semibold">You</span>
                    </div>
                )}
                
                {/* Rider */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
                    style={{ left: `calc(${riderProgress}% - 16px)`}}
                >
                     <div className="bg-primary p-2 rounded-full shadow-lg">
                        <Truck size={20} className="text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReceiptStep: React.FC<{ order: Order }> = ({ order }) => (
    <div className="animate-fade-in">
        <div className="text-center mb-6">
            <CheckCircle size={64} className="mx-auto text-primary" />
            <h3 className="text-2xl font-bold mt-4">Payment Successful!</h3>
            <p className="text-medium-text">Your order has been delivered.</p>
        </div>
        <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
            <div className="flex justify-between py-1 border-b">
                <span className="text-medium-text">Pharmacy:</span>
                <span className="font-semibold">{order.pharmacy.name}</span>
            </div>
             <div className="flex justify-between py-1 border-b">
                <span className="text-medium-text">Items:</span>
                <span className="font-semibold text-right">{order.items.map(i => `${i.medicine.name} (x${i.quantity})`).join(', ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
                <span className="text-medium-text">Payment Method:</span>
                <span className="font-semibold">{order.paymentMethod}</span>
            </div>
             <div className="flex justify-between py-1 border-b">
                <span className="text-medium-text">Date:</span>
                <span className="font-semibold">{new Date(order.date).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
                <span className="text-medium-text">Transaction ID:</span>
                <span className="font-semibold">{order.transactionId}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg">
                <span className="text-medium-text font-bold">Total Paid:</span>
                <span className="font-bold text-accent">{order.total.toLocaleString()} RWF</span>
            </div>
        </div>
        <div className="flex space-x-4 mt-6">
            <button className="flex-1 flex items-center justify-center space-x-2 bg-accent text-white py-3 rounded-lg hover:opacity-90 transition">
                <Download size={20} /><span>Download PDF</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-lg hover:opacity-90 transition">
                <Share2 size={20} /><span>Share</span>
            </button>
        </div>
    </div>
);


export default OrderFlow;