
import { createClient } from '@supabase/supabase-js';

// Types mimicking your Supabase Schema
export interface Profile {
    id: string;
    full_name: string;
    phone_number: string;
    user_type: 'User' | 'Vendor';
    farm_size?: string;
    experience?: string;
    gender?: string;
    dob?: string;
    created_at: string;
}

export interface Address {
    address: string;
    city: string;
}

export interface Vendor {
    id: string; // Links to Profile ID
    business_name: string;
    rating: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    unit: string;
    stock: number;
    category: string;
    image_url: string;
    discount?: string;
    vendor_id: string;
    vendor?: Profile; // Joined
    farmers?: { name: string }; // Legacy/Secondary join
    created_at: string;
}

export interface Order {
    id: string;
    created_at: string;
    status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
    total_amount: number;
    customer_phone?: string;
    payment_method?: string;
    payment_status?: 'Paid' | 'COD';
    delivery_address?: string;
    user_id: string;
    vendor_id: string;
    customer?: Profile; // Joined
    vendor?: Profile;   // Joined
    addresses?: Address; // Joined
}

// --- MOCK DATA STORE ---
// This data mirrors what you have in the Expo App Contexts to ensure consistency visually

const MOCK_PROFILES: Profile[] = [
    { id: 'user_1', full_name: 'Vivek Singh', phone_number: '+91 98765 43210', user_type: 'User', created_at: '2025-01-10T10:00:00Z' },
    { id: 'user_2', full_name: 'Amit Sharma', phone_number: '+91 99887 76655', user_type: 'User', created_at: '2025-01-12T14:30:00Z' },
    { id: 'vendor_1', full_name: 'Rajesh Kumar', phone_number: '+91 11111 11111', user_type: 'Vendor', farm_size: '12 Acres', experience: '15 Years', created_at: '2025-01-01T09:00:00Z' },
    { id: 'vendor_2', full_name: 'Suresh Patel', phone_number: '+91 22222 22222', user_type: 'Vendor', farm_size: '5 Acres', experience: '8 Years', created_at: '2025-01-05T11:20:00Z' },
];

const MOCK_PRODUCTS: Product[] = [
    {
        id: 'prod_1', name: 'Organic Potato', price: 25, unit: 'kg', stock: 500, category: 'Vegetables',
        image_url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Potato', vendor_id: 'vendor_1',
        vendor: MOCK_PROFILES.find(p => p.id === 'vendor_1'), farmers: { name: 'Green Valley Farms' }, created_at: '2025-01-15T10:00:00Z'
    },
    {
        id: 'prod_2', name: 'Red Onion', price: 35, unit: 'kg', stock: 300, category: 'Vegetables',
        image_url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Onion', vendor_id: 'vendor_1',
        vendor: MOCK_PROFILES.find(p => p.id === 'vendor_1'), farmers: { name: 'Green Valley Farms' }, created_at: '2025-01-16T10:00:00Z'
    },
    {
        id: 'prod_3', name: 'Desi Tomato', price: 40, unit: 'kg', stock: 150, category: 'Vegetables',
        image_url: 'https://placehold.co/100x100/e2e8f0/1e293b?text=Tomato', vendor_id: 'vendor_2',
        vendor: MOCK_PROFILES.find(p => p.id === 'vendor_2'), farmers: { name: 'Patel Organics' }, created_at: '2025-01-20T10:00:00Z'
    }
];

const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-172938491',
        created_at: new Date().toISOString(),
        status: 'Pending',
        total_amount: 195,
        user_id: 'user_1',
        vendor_id: 'vendor_1',
        customer_phone: '+91 98765 43210',
        payment_method: 'PhonePe',
        payment_status: 'Paid',
        delivery_address: 'H.No 12, Patna City, Bihar',
        customer: MOCK_PROFILES.find(p => p.id === 'user_1'),
        vendor: MOCK_PROFILES.find(p => p.id === 'vendor_1'),
        addresses: { address: 'H.No 12, Patna City', city: 'Patna' }
    },
    {
        id: 'ORD-172938492',
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        status: 'Delivered',
        total_amount: 450,
        user_id: 'user_2',
        vendor_id: 'vendor_2',
        customer_phone: '+91 99887 76655',
        payment_method: 'COD',
        payment_status: 'COD', // Paid upon delivery usually, but keeping status clear
        delivery_address: 'Flat 4A, Ganga Towers, Patna',
        customer: MOCK_PROFILES.find(p => p.id === 'user_2'),
        vendor: MOCK_PROFILES.find(p => p.id === 'vendor_2'),
        addresses: { address: 'Flat 4A, Ganga Towers', city: 'Patna' }
    }
];

const MOCK_REQUESTS = [
    {
        id: 'req_1',
        vendor_id: 'vendor_1',
        requested_data: { bio: 'Updated bio text here...' },
        status: 'Pending',
        created_at: '2025-01-28T10:00:00Z',
        profiles: MOCK_PROFILES.find(p => p.id === 'vendor_1')
    }
];

// --- DB SERVICE ---
// This class replaces the direct Supabase calls. 
// When you are ready for real backend, simply swap the implementation inside methods.

import { localDb } from './local-db';

export const db = {
    orders: {
        getAll: async () => {
            const data = await localDb.orders.getAll();
            return { data, error: null };
        },
        getById: async (id: string) => {
            const data = await localDb.orders.getById(id);
            return { data, error: null };
        }
    },
    products: {
        getAll: async () => {
            const data = await localDb.products.getAll();
            return { data, error: null };
        }
    },
    vendors: {
        getAll: async () => {
            const data = await localDb.vendors.getAll();
            return { data, error: null };
        },
        getRequests: async () => {
            const data = await localDb.vendors.getRequests();
            return { data, error: null };
        }
    },
    users: {
        getAll: async () => {
            const data = await localDb.profiles.getAll();
            return { data, error: null };
        }
    },
    dashboard: {
        getStats: async () => {
            return await localDb.dashboard.getStats();
        }
    }
};
