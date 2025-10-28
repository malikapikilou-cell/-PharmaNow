export interface Pharmacy {
    id: number;
    name: string;
    address: string;
    phone: string;
    isOpen: boolean;
    onDuty: boolean;
    hours: string;
    lat: number;
    lng: number;
    deliveryAvailable: boolean;
    deliveryTime: number; // in minutes
    deliveryCost: number;
    acceptsMobileMoney: boolean;
    lastUpdated: string;
    riders: Rider[];
    isAvailable?: boolean;
    price?: number;
    stock?: number;
    distance?: number;
    cartTotal?: number;
    isFulfillable?: boolean;
}

export interface Medicine {
    id: number;
    pharmacyId: number;
    name: string;
    genericName: string;
    brandName?: string;
    category: string;
    price: number;
    stock: number;
}

export interface Rider {
    id: number;
    name: string;
    phone: string;
    workingHours: string;
}

export interface Filters {
    openNow: boolean;
    onDuty: boolean;
    delivery: boolean;
    mobileMoney: boolean;
}

export type SortOption = 'price' | 'distance' | 'delivery';

export interface UserLocation {
    lat: number;
    lng: number;
}

export interface OrderItem {
    medicine: Medicine;
    quantity: number;
}

export interface Order {
    id: number;
    pharmacy: Pharmacy;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'prepared' | 'delivery' | 'delivered';
    date: string;
    rider: Rider | null;
    paymentMethod?: 'Mobile Money' | 'Visa' | 'Mastercard';
    transactionId?: string;
    userLocation?: UserLocation | null;
}