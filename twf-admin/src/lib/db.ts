
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

import { supabase } from './supabase';

export const db = {
    orders: {
        getAll: async () => {
            // Use RPC to bypass RLS (admin needs to see ALL orders)
            const { data, error } = await supabase.rpc('admin_get_all_orders');
            return { data: data || [], error };
        },
        getById: async (id: string) => {
            // Fetch all orders via RPC, then find the one we need
            const { data, error } = await supabase.rpc('admin_get_all_orders');
            if (error) return { data: null, error };
            const order = (data || []).find((o: any) => o.id === id);
            return { data: order || null, error: null };
        }
    },
    products: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*, vendor:profiles!vendor_id(*)');
            return { data, error };
        }
    },
    vendors: {
        getAll: async () => {
            // Vendors are profiles with user_type = 'Vendor'
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'Vendor');
            return { data, error };
        },
        getRequests: async () => {
            // Assuming a 'vendor_requests' table or similar logic
            // For now, let's just return empty or mock if table doesn't exist yet
            // But let's try to fetch if you have a requests table
            // If not, we might need to create it. For now, returning [] to prevent crash if table missing
            // Or better, let's assume 'vendor_onboarding' or similar
            return { data: [], error: null };
        }
    },
    users: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');
            return { data, error };
        }
    },
    dashboard: {
        getStats: async () => {
            // Calculate stats from real data
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'User');
            const { count: vendorCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'Vendor');
            const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

            // For total revenue, we need to sum. Supabase doesn't have direct sum aggregation in JS client easily without RPC
            // So fetching orders total_amount
            const { data: orders } = await supabase.rpc('admin_get_all_orders');
            const totalRevenue = orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0;
            const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

            return {
                products: productsCount || 0,
                farmers: vendorCount || 0,
                users: userCount || 0,
                totalUsers: userCount || 0,
                totalVendors: vendorCount || 0,
                totalOrders: orderCount || 0,
                totalRevenue: totalRevenue
            };
        }
    },
    tickets: {
        getAll: async (userId?: string) => {
            let query = supabase.from('tickets').select('*');
            if (userId) {
                query = query.eq('user_id', userId);
            }
            const { data, error } = await query.order('updated_at', { ascending: false });
            return { data, error };
        },
        getById: async (id: string) => {
            const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single();
            return { data, error };
        }
    },
    settings: {
        get: async (key: string) => {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', key)
                .single();
            return { data, error };
        },
        set: async (key: string, value: string) => {
            const { data, error } = await supabase
                .from('app_settings')
                .upsert({ key, value })
                .select()
                .single();
            return { data, error };
        }
    },
    coupons: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('coupons')
                .select('*, specific_product_id(*)');
            return { data, error };
        }
    }
};

