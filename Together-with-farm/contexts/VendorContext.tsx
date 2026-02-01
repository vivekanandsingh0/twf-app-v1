import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    customerName: string;
    items: { productName: string; quantity: number; price: number }[];
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
    logo?: any;
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

    // New: Allow creating orders from User App
    addOrder: (order: VendorOrder) => void;

    updateProfile: (updates: Partial<VendorProfile>) => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

// --- Provider ---

export function VendorProvider({ children }: { children: ReactNode }) {
    // --- Mock Data ---

    const [profile, setProfile] = useState<VendorProfile>({
        businessName: "Nature's Basket",
        ownerName: "Rajesh Kumar",
        phone: "+91 11111 11111",
        email: "rajesh@naturesbasket.com",
        address: "Plot 45, Green Valley, Patna",
        bio: "Your one-stop shop for fresh, organic, and locally sourced produce. We bring the farm directly to your table.",
        experience: "15 Years",
        farmSize: "12 Acres"
    });

    const [products, setProducts] = useState<VendorProduct[]>([
        // Vegetables
        {
            id: 'v1',
            name: 'Organic Potato',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 25,
            unit: 'kg',
            stock: 500,
            category: 'Vegetables',
            description: 'Fresh organic potatoes, perfect for daily cooking.',
            status: 'Active'
        },
        {
            id: 'v2',
            name: 'Red Onion',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 35,
            unit: 'kg',
            stock: 300,
            category: 'Vegetables',
            description: 'Pungent and flavorful red onions.',
            status: 'Active'
        },
        // Fruits
        {
            id: 'f1',
            name: 'Kashmiri Apple',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 180,
            unit: 'kg',
            stock: 100,
            category: 'Fruits',
            description: 'Sweet and crunchy apples from Kashmir.',
            status: 'Active'
        },
        {
            id: 'f2',
            name: 'Robusta Banana',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 40,
            unit: 'doz',
            stock: 50,
            category: 'Fruits',
            description: 'Ripe and energy-boosting bananas.',
            status: 'Active'
        },
        // Dairy
        {
            id: 'd1',
            name: 'Cow Milk',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 60,
            unit: 'L',
            stock: 50,
            category: 'Dairy',
            description: 'Fresh, unpasteurized cow milk.',
            status: 'Active'
        },
        {
            id: 'd2',
            name: 'Fresh Paneer',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 320,
            unit: 'kg',
            stock: 20,
            category: 'Dairy',
            description: 'Soft and creamy homemade paneer.',
            status: 'Active'
        },
        // Bakery
        {
            id: 'b1',
            name: 'Whole Wheat Bread',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 45,
            unit: 'pack',
            stock: 25,
            category: 'Bakery',
            description: 'Healthy whole wheat bread, baked fresh daily.',
            status: 'Active'
        },
        // Meat & Seafood
        {
            id: 'm1',
            name: 'Chicken Curry Cut',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 220,
            unit: 'kg',
            stock: 40,
            category: 'Meat',
            description: 'Fresh chicken, skinless, curry cut.',
            status: 'Active'
        },
        {
            id: 's1',
            name: 'Rohu Fish',
            image: require('@/assets/images/3d-model-with-veg.png'),
            price: 280,
            unit: 'kg',
            stock: 0,
            category: 'Seafood',
            description: 'Freshwater Rohu fish, cleaned and cut.',
            status: 'Out of Stock'
        }
    ]);

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

    const [transactions, setTransactions] = useState<VendorTransaction[]>([
        { id: 'TXN-101', type: 'Credit', amount: 165, date: '2025-01-27', description: 'Payout for ORD-102', status: 'Completed' }
    ]);

    // --- Stats Logic ---
    const totalSales = transactions.filter(t => t.type === 'Credit').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    // --- Actions ---

    const addProduct = (product: Omit<VendorProduct, 'id'>) => {
        const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
        setProducts(prev => [newProduct, ...prev]);
    };

    const updateProduct = (id: string, updates: Partial<VendorProduct>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const addOrder = (order: VendorOrder) => {
        setOrders(prev => [order, ...prev]);
    };

    const updateOrderStatus = (orderId: string, status: VendorOrder['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

        // Mock financial update logic
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

    const updateProfile = (updates: Partial<VendorProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
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
            addOrder,
            updateOrderStatus,
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
