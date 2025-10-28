
import { Pharmacy } from '../types';

export const PHARMACIES: Pharmacy[] = [
    {
        id: 1,
        name: 'Kipharma Pharmacy',
        address: 'KN 5 Rd, Kigali',
        phone: '+250 788 304 902',
        isOpen: true,
        onDuty: true,
        hours: '24 Hours',
        onCallHours: '24/7',
        location: { lat: -1.9482, lng: 30.0612 },
        medicines: [
            { id: 101, name: 'Paracetamol 500mg', genericName: 'acetaminophen', stock: 150, price: 1.50, lastUpdated: '10 mins ago' },
            { id: 102, name: 'Amoxicillin 250mg', genericName: 'amoxicillin', stock: 80, price: 5.00, lastUpdated: '1 hour ago' },
            { id: 103, name: 'Cetirizine 10mg', genericName: 'cetirizine', stock: 120, price: 3.20, lastUpdated: '30 mins ago' },
        ],
        deliveryAvailable: true,
        delivery: {
            cost: 2.50,
            time: 30,
            riders: [
                { id: 1, name: 'John Doe', phone: '0788123456', workingHours: '8am - 8pm', status: 'available' },
                { id: 2, name: 'Jane Smith', phone: '0788654321', workingHours: '9am - 5pm', status: 'busy' },
            ]
        },
        acceptsMobileMoney: true,
    },
    {
        id: 2,
        name: 'Pharmacie Conseil',
        address: 'KG 17 Ave, Kigali',
        phone: '+250 788 305 423',
        isOpen: true,
        onDuty: false,
        hours: '8am - 10pm',
        location: { lat: -1.959, lng: 30.088 },
        medicines: [
            { id: 101, name: 'Paracetamol 500mg', genericName: 'acetaminophen', stock: 200, price: 1.45, lastUpdated: '5 mins ago' },
            { id: 201, name: 'Ibuprofen 200mg', genericName: 'ibuprofen', stock: 90, price: 2.50, lastUpdated: '2 hours ago' },
            { id: 103, name: 'Cetirizine 10mg', genericName: 'cetirizine', stock: 0, price: 3.25, lastUpdated: '1 day ago' },
        ],
        deliveryAvailable: false,
        acceptsMobileMoney: true,
    },
    {
        id: 3,
        name: 'MediHealth Pharmacy',
        address: 'CHIC Building, Kigali',
        phone: '+250 783 555 888',
        isOpen: false,
        onDuty: false,
        hours: '9am - 8pm',
        location: { lat: -1.944, lng: 30.059 },
        medicines: [
            { id: 101, name: 'Paracetamol 500mg', genericName: 'acetaminophen', stock: 50, price: 1.60, lastUpdated: '45 mins ago' },
            { id: 301, name: 'Loratadine 10mg', genericName: 'loratadine', stock: 70, price: 4.00, lastUpdated: '3 hours ago' },
        ],
        deliveryAvailable: true,
        delivery: {
            cost: 3.00,
            time: 45,
            riders: [
                { id: 3, name: 'Peter Jones', phone: '0788999888', workingHours: '10am - 7pm', status: 'available' },
            ]
        },
        acceptsMobileMoney: false,
    },
    {
        id: 4,
        name: 'Prima Pharmacy',
        address: 'KG 622 St, Kigali',
        phone: '+250 781 111 222',
        isOpen: true,
        onDuty: true,
        hours: '24 Hours',
        onCallHours: '24/7',
        location: { lat: -1.936, lng: 30.091 },
        medicines: [
            { id: 102, name: 'Amoxicillin 250mg', genericName: 'amoxicillin', stock: 40, price: 5.10, lastUpdated: '15 mins ago' },
            { id: 201, name: 'Ibuprofen 200mg', genericName: 'ibuprofen', stock: 110, price: 2.40, lastUpdated: '10 mins ago' },
        ],
        deliveryAvailable: true,
        delivery: {
            cost: 2.00,
            time: 25,
            riders: [
                { id: 4, name: 'Alice Williams', phone: '0788333444', workingHours: '24/7', status: 'available' },
            ]
        },
        acceptsMobileMoney: true,
    },
];
