
export interface Medicine {
    id: number;
    name: string;
    genericName: string;
    stock: number;
    price: number;
    lastUpdated: string;
}

export interface Rider {
    id: number;
    name: string;
    phone: string;
    workingHours: string;
    status: 'available' | 'busy';
}

export interface Pharmacy {
    id: number;
    name: string;
    address: string;
    phone: string;
    isOpen: boolean;
    onDuty: boolean;
    hours: string;
    onCallHours?: string;
    location: { lat: number; lng: number };
    medicines: Medicine[];
    deliveryAvailable: boolean;
    delivery?: {
        cost: number;
        time: number; // in minutes
        riders: Rider[];
    };
    acceptsMobileMoney: boolean;
}

export interface UserLocation {
    lat: number;
    lng: number;
}

export interface FilterOptions {
    openNow: boolean;
    onDuty: boolean;
    deliveryAvailable: boolean;
    acceptsMobileMoney: boolean;
}

export type SortOption = 'distance' | 'price' | 'delivery';

export type AppTab = 'all' | 'onDuty' | 'orders' | 'favorites';

export type PaymentMethod = 'Mobile Money' | 'Visa' | 'Mastercard';

export type OrderStatus = 'confirmed' | 'prepared' | 'out for delivery' | 'delivered';

export interface CartItem {
    medicine: Medicine;
    quantity: number;
}

export interface Order {
    id: string;
    pharmacyName: string;
    items: CartItem[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
    date: string;
    transactionId: string;
    status: OrderStatus;
    deliveryInfo?: {
        rider: Rider;
        cost: number;
        estimatedTime: number;
    };
}
