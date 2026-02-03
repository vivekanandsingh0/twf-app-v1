import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useUser } from './UserContext';


// --- Interfaces ---

export interface VendorProduct {
    id: string;
    name: string;
    image: any; // Using dynamic imports or URIs
    price: number;
    unit: string; // e.g., 'kg', 'bunch'
    stock: number;
    category: string;
    description: string;
    status: 'Active' | 'Draft' | 'Out of Stock';
}

export interface VendorOrder {
    id: string;
    userId: string; // Link to User
    customerId?: string; // Optional link to User
    customerName: string;
    items: { productName: string; quantity: number; price: number; image?: any }[]; // Added image
    totalAmount: number;
    discount?: number; // Added
    tax?: number;      // Added
    status: 'Pending' | 'Accepted' | 'Ready' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Picked' | 'On the Way';
    date: string;
    paymentStatus: 'Paid' | 'COD';
    customerPhone?: string; // Added to track customer contact
    paymentMethod?: string; // Added to track payment method name
    shippingFee?: number;   // Added
    deliveryAddress: string;
}

export interface VendorTransaction {
    id: string;
    type: 'Credit' | 'Debit';
    amount: number;
    date: string;
    description: string;
    status: 'Completed' | 'Processing';
}

export interface VendorProfile {
    businessName: string;
    ownerName: string;
    phone: string;
    email: string;
    address: string;
    bio: string;
    experience: string;
    farmSize: string;
    gender?: string; // Matching screenshot: Gender
    dob?: string;    // Matching screenshot: DOB
    logo?: any;
    shopStatus?: string; // Active, Inactive, Suspended, etc.
    bankDetails?: {
        accountHolderName: string;
        bankName: string;
        accountNumber: string;
        ifscCode: string;
    };
}

// --- Context Type ---

interface VendorContextType {
    // Data
    products: VendorProduct[];
    orders: VendorOrder[];
    transactions: VendorTransaction[];
    profile: VendorProfile;
    dashboardStats: {
        totalSales: number;
        totalOrders: number;
        pendingOrders: number;
        rating: number;
    };

    // Actions
    addProduct: (product: Omit<VendorProduct, 'id'>) => void;
    updateProduct: (id: string, updates: Partial<VendorProduct>) => void;
    deleteProduct: (id: string) => void;
    updateOrderStatus: (orderId: string, status: VendorOrder['status']) => void;
    addOrder: (order: VendorOrder) => void; // Exposed to Payment Screen
    toggleShopStatus: () => Promise<void>;
    updateProfile: (updates: Partial<VendorProfile>) => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

// --- Provider ---

export function VendorProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    // --- Mock Data ---

    const [profile, setProfile] = useState<VendorProfile>({
        businessName: "",
        ownerName: "",
        phone: "",
        email: "",
        address: "",
        bio: "",
        experience: "",
        farmSize: "",
        gender: "",
        dob: "",
        shopStatus: "Active"
    });

    // Fetch Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const debuggerHost = Constants.expoConfig?.hostUri;
                const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
                const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
                const API_URL = `http://${host}:3000`;

                const vendorId = user.id;

                const res = await fetch(`${API_URL}/api/profiles/${vendorId}`);
                if (res.ok) {
                    const data = await res.json();
                    // Merge fetched data into profile state
                    // Map backend fields to app fields if names differ
                    setProfile(prev => ({
                        ...prev,
                        businessName: data.businessName || data.business_name || prev.businessName,
                        ownerName: data.ownerName || data.full_name || prev.ownerName,
                        phone: data.phone || data.phone_number || prev.phone,
                        email: data.email || prev.email,
                        address: data.address || prev.address,
                        bio: data.bio || prev.bio,
                        experience: data.experience || prev.experience,
                        farmSize: data.farmSize || data.farm_size || prev.farmSize,
                        gender: data.gender || prev.gender,
                        dob: data.dob || prev.dob,
                        shopStatus: data.shop_status || 'Active',
                        bankDetails: data.bank_details ? {
                            accountHolderName: data.bank_details.account_holder_name || '',
                            bankName: data.bank_details.bank_name || '',
                            accountNumber: data.bank_details.account_number || '',
                            ifscCode: data.bank_details.ifsc_code || ''
                        } : undefined
                    }));
                }
            } catch (e) {
                console.log("Failed to fetch profile (using offline data)", e);
            }
        };
        fetchProfile();
    }, [user]);

    const toggleShopStatus = async () => {
        if (profile.shopStatus !== 'Active' && profile.shopStatus !== 'Inactive') {
            alert(`Your shop is ${profile.shopStatus}. Please contact support.`);
            return;
        }

        const newStatus = profile.shopStatus === 'Active' ? 'Inactive' : 'Active';

        // Optimistic Update
        setProfile(prev => ({ ...prev, shopStatus: newStatus }));

        try {
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
            const API_URL = `http://${host}:3000`;

            await fetch(`${API_URL}/api/profiles/${user?.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shop_status: newStatus })
            });
        } catch (e) {
            console.error("Failed to update status", e);
            // Revert? (Optional: for now let's hope it works)
        }
    };

    const [products, setProducts] = useState<VendorProduct[]>([]);

    // FETCH PRODUCTS (Real Sync)
    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) return;
            try {
                const debuggerHost = Constants.expoConfig?.hostUri;
                const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
                const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
                const API_URL = `http://${host}:3000`;

                console.log(`Fetching Products for Vendor: ${user.id}`);
                const res = await fetch(`${API_URL}/api/products?vendor_id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        image: p.image_url || require('@/assets/images/3d-model-with-veg.png'), // Fallback image
                        image_url: p.image_url,
                        price: p.price,
                        unit: p.unit,
                        stock: p.stock,
                        category: p.category,
                        description: p.description || '',
                        status: p.stock > 0 ? 'Active' : 'Out of Stock'
                    })));
                }
            } catch (e) {
                console.error("Failed to fetch products", e);
            }
        };
        fetchProducts();
    }, [user]);

    const [orders, setOrders] = useState<VendorOrder[]>([
        {
            id: 'ORD-101',
            userId: 'user_sohan_001',
            customerName: "Sohan Lal",
            items: [
                { productName: "Organic Potato", quantity: 5, price: 25 },
                { productName: "Red Onion", quantity: 2, price: 35 }
            ],
            totalAmount: 195,
            discount: 0,
            tax: 5,
            status: 'Pending',
            date: new Date().toISOString(),
            paymentStatus: 'COD',
            deliveryAddress: "H.No 12, Patna City"
        },
        {
            id: 'ORD-102',
            userId: 'user_anita_002',
            customerName: "Anita Raj",
            items: [
                { productName: "Cow Milk", quantity: 2, price: 60 },
                { productName: "Whole Wheat Bread", quantity: 1, price: 45 }
            ],
            totalAmount: 165,
            discount: 10,
            tax: 0,
            status: 'Delivered',
            date: new Date(Date.now() - 86400000).toISOString(),
            paymentStatus: 'Paid',
            deliveryAddress: "Flat 4A, Ganga Towers"
        }
    ]);

    const [transactions, setTransactions] = useState<VendorTransaction[]>([]);

    // Sync Transactions with Orders (Mock Payout Logic)
    useEffect(() => {
        // Automatically generate "Payouts" for delivered orders
        const payouts = orders
            .filter(o => o.status === 'Delivered')
            .map(o => ({
                id: `TXN-${o.id}`,
                type: 'Credit' as const,
                amount: Number(o.totalAmount || 0), // Ensure Number
                date: o.date ? o.date.split('T')[0] : new Date().toISOString().split('T')[0],
                description: `Payout for ${o.id}`,
                status: 'Completed' as const
            }))
            .filter(p => p.amount > 0); // Filter out zero/invalid amounts
        setTransactions(payouts);
    }, [orders]);

    // --- Stats Logic ---
    const totalSales = transactions.filter(t => t.type === 'Credit').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    // --- Actions ---



    // Poll Orders from Admin Backend
    useEffect(() => {
        const pollOrders = async () => {
            try {
                const debuggerHost = Constants.expoConfig?.hostUri;
                const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
                const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
                const API_URL = `http://${host}:3000`;

                // Use AbortController for safety
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const res = await fetch(`${API_URL}/api/orders`, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const allOrders = await res.json();
                    // Map backend structure to App structure if needed
                    // Backend: snake_case (customer_phone), App: camelCase (customerPhone)
                    // Ideally we should unify, but for now let's map essential status updates

                    // Helper to map DB order to App Order
                    const mappedOrders = allOrders.map((dbOrder: any) => ({
                        id: dbOrder.id,
                        userId: dbOrder.user_id,
                        customerName: dbOrder.customerName || dbOrder.customer?.full_name || 'Unknown',
                        items: dbOrder.items || [],
                        totalAmount: Number(dbOrder.total_amount || 0), // Force Number
                        status: dbOrder.status,
                        date: dbOrder.created_at,
                        paymentStatus: dbOrder.payment_status,
                        customerPhone: dbOrder.customer_phone,
                        paymentMethod: dbOrder.payment_method,
                        shippingFee: Number(dbOrder.shipping_fee || 0),
                        deliveryAddress: dbOrder.delivery_address || ''
                    }));

                    // Update state with smart merge to prevent reverting optimistic updates
                    setOrders(prevOrders => {
                        const statusRank: Record<string, number> = {
                            'Pending': 0,
                            'Accepted': 1,
                            'Preparing': 2,
                            'Ready': 3,
                            'Shipped': 4,
                            'On the Way': 4,
                            'Delivered': 5,
                            'Cancelled': 6,
                            'Returned': 6,
                            'Undelivered': 6
                        };

                        return mappedOrders.map((remoteOrder: any) => {
                            const localOrder = prevOrders.find(o => o.id === remoteOrder.id);

                            // If we have a local version, check if local is "ahead"
                            if (localOrder) {
                                const localRank = statusRank[localOrder.status] || 0;
                                const remoteRank = statusRank[remoteOrder.status] || 0;

                                // If local status is more advanced than remote (e.g. Local=Accepted(1) > Remote=Pending(0)), 
                                // keep local status. This happens when polling catches us before backend write finishes.
                                if (localRank > remoteRank) {
                                    return {
                                        ...remoteOrder,
                                        status: localOrder.status,
                                        items: localOrder.items
                                    };
                                }

                                return {
                                    ...remoteOrder,
                                    items: localOrder.items && localOrder.items.length > 0 ? localOrder.items : remoteOrder.items
                                };
                            }
                            return remoteOrder;
                        });
                    });
                }
            } catch (e) {
                // Silent fail on poll
            }
        };

        const interval = setInterval(pollOrders, 5000); // 5 seconds poll
        return () => clearInterval(interval);
    }, []);

    // --- Product Actions ---

    const addProduct = async (productData: Omit<VendorProduct, 'id'>) => {
        // Optimistic Update
        const tempId = `temp_${Date.now()}`;
        const newProduct: VendorProduct = { ...productData, id: tempId, status: productData.stock > 0 ? 'Active' : 'Out of Stock' };
        setProducts(prev => [...prev, newProduct]);

        if (!user) return;

        try {
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
            const API_URL = `http://${host}:3000`;

            const res = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...productData,
                    vendor_id: user.id
                })
            });

            if (res.ok) {
                const savedProduct = await res.json();
                // Replace temp ID with real ID
                setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: savedProduct.id } : p));
            }
        } catch (e) {
            console.error("Failed to add product to backend", e);
        }
    };

    const updateProduct = async (id: string, updates: Partial<VendorProduct>) => {
        // Optimistic
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        try {
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
            const API_URL = `http://${host}:3000`;

            await fetch(`${API_URL}/api/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (e) {
            console.error("Failed to update product", e);
        }
    };

    const deleteProduct = async (id: string) => {
        // Optimistic
        setProducts(prev => prev.filter(p => p.id !== id));

        try {
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
            const API_URL = `http://${host}:3000`;

            await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE'
            });
        } catch (e) {
            console.error("Failed to delete product", e);
        }
    };

    const addOrder = async (order: VendorOrder) => {
        // Optimistic UI
        setOrders(prev => [order, ...prev]);

        // SYNC WITH ADMIN BACKEND
        try {
            // Dynamically determine Host IP
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
            const API_URL = `http://${host}:3000`;

            console.log(`Syncing Order with Admin Backend at: ${API_URL}/api/orders`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...order,
                    customer_phone: order.customerPhone,
                    payment_method: order.paymentMethod,
                    shipping_fee: order.shippingFee,
                    payment_status: order.paymentStatus,
                    delivery_address: order.deliveryAddress,
                    vendor_id: user?.id, // Use actual Vendor ID
                    user_id: order.userId,
                    total_amount: order.totalAmount, // Ensure backend gets snake_case
                    items: order.items
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log("Sync Order Success!");
        } catch (e: any) {
            console.error("Failed to sync order with local backend:", e.message || e);
        }
    };

    const updateOrderStatus = async (orderId: string, status: VendorOrder['status']) => {
        // Optimistic Update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

        // SYNC WITH BACKEND
        try {
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
            const API_URL = `http://${host}:3000`;

            const updates: any = { status };
            if (status === 'Delivered') {
                updates.payment_status = 'Paid';
                // Optimistically update local order payment status too
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, paymentStatus: 'Paid' } : o));
            }

            const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Server responded with ${res.status}: ${errText}`);
            }
            console.log(`Order ${orderId} status synced to ${status}`);
        } catch (e: any) {
            console.error("Failed to sync order status", e);
            alert(`Failed to update order status: ${e.message}`);
            // Revert optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Pending' } : o)); // Ideally revert to previous status
        }

        // Mock financial update logic (for delivered)
        if (status === 'Delivered') {
            const order = orders.find(o => o.id === orderId);
            if (order && order.paymentStatus === 'Paid') {
                const newTxn: VendorTransaction = {
                    id: 'TXN-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
                    type: 'Credit',
                    amount: order.totalAmount,
                    date: new Date().toISOString(),
                    description: `Payout for ${order.id}`,
                    status: 'Processing'
                };
                setTransactions(prev => [newTxn, ...prev]);
            }
        }
    };

    const updateProfile = async (updates: Partial<VendorProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
        if (!user) return;

        // SYNC WITH ADMIN BACKEND
        try {
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
            const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
            const API_URL = `http://${host}:3000`;

            const vendorId = user.id;
            console.log(`Syncing Profile Update with Admin: ${API_URL}/api/profiles/${vendorId}`);

            await fetch(`${API_URL}/api/profiles/${vendorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...updates,
                    // Map critical fields to snake_case for backend compatibility
                    full_name: updates.ownerName,
                    phone_number: updates.phone,
                    business_name: updates.businessName,
                    farm_size: updates.farmSize,
                    gender: updates.gender,
                    dob: updates.dob,
                    bank_details: updates.bankDetails ? {
                        account_holder_name: updates.bankDetails.accountHolderName,
                        bank_name: updates.bankDetails.bankName,
                        account_number: updates.bankDetails.accountNumber,
                        ifsc_code: updates.bankDetails.ifscCode
                    } : undefined
                })
            });
            console.log("Profile Sync Success!");
        } catch (e: any) {
            console.error("Failed to sync profile:", e.message || e);
        }
    };

    return (
        <VendorContext.Provider value={{
            products,
            orders,
            transactions,
            profile,
            dashboardStats: { totalSales, totalOrders, pendingOrders, rating: 4.8 },
            addProduct,
            updateProduct,
            deleteProduct,
            updateOrderStatus,
            addOrder,
            toggleShopStatus,
            updateProfile
        }}>
            {children}
        </VendorContext.Provider>
    );
}

export function useVendor() {
    const context = useContext(VendorContext);
    if (!context) throw new Error('useVendor must be used within VendorProvider');
    return context;
}
