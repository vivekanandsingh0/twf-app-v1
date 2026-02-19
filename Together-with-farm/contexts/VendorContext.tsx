import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text, Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';
import * as FileSystem from 'expo-file-system/legacy';

// Helper to upload image
const uploadImageToSupabase = async (uri: string, userId: string) => {
    try {
        console.log('📤 [Upload] Starting image upload:', uri.substring(0, 50) + '...');

        // Check if it's already a Supabase URL (starts with https:// and contains supabase.co)
        if (uri.startsWith('https://') && uri.includes('supabase.co')) {
            console.log('⏭️  [Upload] Image already on Supabase, skipping upload:', uri);
            return uri; // Already uploaded to Supabase
        }

        // For file:// or blob: URIs, we need to upload
        console.log('☁️  [Upload] Processing image upload...');

        let body: Blob | ArrayBuffer;
        let contentType: string;
        let fileExt: string;

        // On Android/iOS, use expo-file-system to read file:// URIs as Base64 to ArrayBuffer
        if (uri.startsWith('file://')) {
            console.log('☁️  [Upload] Reading file as Base64...');
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64', // Use string "base64" for legacy compatibility
            });

            // Decode Base64 to ArrayBuffer manually (avoiding fetch data URI issues)
            console.log('☁️  [Upload] Converting Base64 to ArrayBuffer...');
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            body = bytes.buffer;

            // Guess mime type from extension
            fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
            contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';
        } else {
            // For web or blob: URIs, use fetch directly
            console.log('☁️  [Upload] Fetching blob directly...');
            const response = await fetch(uri);
            const blob = await response.blob();
            body = blob;
            fileExt = blob.type.split('/')[1] || 'jpg';
            contentType = blob.type;
        }

        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log(`☁️  [Upload] Uploading to Supabase Storage: ${filePath} (Type: ${contentType})`);

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, body, {
                contentType: contentType,
                upsert: false
            });

        if (uploadError) {
            console.error("❌ [Upload] Upload Error detail:", uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        console.log('✅ [Upload] Image uploaded successfully:', publicUrl);
        return publicUrl;

    } catch (e) {
        console.error("❌ [Upload] Failed to upload image:", e);
        return null; // Return null on failure
    }
};


// --- Interfaces ---

export interface VendorProduct {
    id: string;
    name: string;
    image: any; // Primary image (first in array or fallback)
    images: string[]; // All images
    price: number;
    unit: string; // e.g., 'kg', 'bunch'
    stock: number;
    category: string;
    description: string;
    highlights?: { title: string; value: string }[];
    status: 'Active' | 'Draft' | 'Out of Stock';
    image_url?: string; // For backend compatibility
}

export interface VendorOrder {
    id: string;
    userId: string; // Link to User
    vendorId?: string; // Added to link to Vendor
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
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    receiverName?: string;
    receiverPhone?: string;
    // Delivery partner assigned at dispatch
    deliveryPartnerName?: string;
    deliveryPartnerPhone?: string;
    deliveryPartnerPhoto?: string;
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
    profileImage?: string; // Base64 or URL
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
    addProduct: (product: Omit<VendorProduct, 'id'>) => Promise<boolean>;
    updateProduct: (id: string, updates: Partial<VendorProduct>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: VendorOrder['status'], partner?: { name: string; phone: string; photo_url: string | null }) => void;
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
        shopStatus: "Active",
        profileImage: ""
    });


    // --- Data fetching with Supabase ---

    // Fetch Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(prev => ({
                        ...prev,
                        businessName: data.business_name || prev.businessName,
                        ownerName: data.full_name || prev.ownerName,
                        phone: data.phone_number || prev.phone,
                        email: data.email || prev.email,
                        address: data.address || prev.address,
                        bio: data.bio || prev.bio,
                        experience: data.experience || prev.experience,
                        farmSize: data.farm_size || prev.farmSize,
                        gender: data.gender || prev.gender,
                        dob: data.dob || prev.dob,
                        shopStatus: data.shop_status || 'Active',
                        profileImage: data.profile_image || prev.profileImage,
                        // Assuming bank_details is a JSON column or separate table. 
                        // If JSON column:
                        bankDetails: data.bank_details ? {
                            accountHolderName: data.bank_details.account_holder_name || '',
                            bankName: data.bank_details.bank_name || '',
                            accountNumber: data.bank_details.account_number || '',
                            ifscCode: data.bank_details.ifsc_code || ''
                        } : undefined
                    }));
                }
            } catch (e) {
                console.log("Failed to fetch profile", e);
            }
        };
        fetchProfile();
    }, [user]);

    const toggleShopStatus = async () => {
        const newStatus = profile.shopStatus === 'Active' ? 'Inactive' : 'Active';
        // Optimistic Update
        setProfile(prev => ({ ...prev, shopStatus: newStatus }));

        try {
            if (!user) return;
            const { error } = await supabase
                .from('profiles')
                .update({ shop_status: newStatus })
                .eq('id', user.id);

            if (error) throw error;
        } catch (e) {
            console.error("Failed to update status", e);
            // Revert on error if needed
        }
    };

    const [products, setProducts] = useState<VendorProduct[]>([]);


    // FETCH PRODUCTS (Real Sync)
    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('vendor_id', user.id);

                if (data) {
                    setProducts(data.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        image: p.images && p.images.length > 0 ? { uri: p.images[0] } : (p.image_url ? { uri: p.image_url } : require('@/assets/images/3d-model-with-veg.png')),
                        image_url: p.image_url,
                        images: p.images || (p.image_url ? [p.image_url] : []),
                        price: p.price,
                        unit: p.unit,
                        stock: p.stock,
                        category: p.category,
                        description: p.description || '',
                        highlights: p.highlights || [], // Fetch highlights
                        status: p.stock > 0 ? 'Active' : 'Out of Stock'
                    })));
                }
            } catch (e) {
                console.error("Failed to fetch products", e);
            }
        };
        fetchProducts();
    }, [user]);

    const [orders, setOrders] = useState<VendorOrder[]>([]);
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

    // FETCH ORDERS
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                // Fetch orders for this vendor
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, customer:profiles!user_id(*)')
                    .eq('vendor_id', user.id)
                    .order('created_at', { ascending: false });

                if (data) {
                    const mappedOrders = data.map((dbOrder: any) => ({
                        id: dbOrder.id,
                        userId: dbOrder.user_id,
                        customerId: dbOrder.user_id,
                        customerName: dbOrder.customer_name || dbOrder.customer?.full_name || 'Unknown',
                        items: dbOrder.items || [],
                        totalAmount: Number(dbOrder.total_amount || 0),
                        status: dbOrder.status,
                        date: dbOrder.created_at,
                        paymentStatus: dbOrder.payment_status,
                        customerPhone: dbOrder.customer_phone,
                        paymentMethod: dbOrder.payment_method,
                        shippingFee: Number(dbOrder.shipping_fee || 0),
                        deliveryAddress: dbOrder.delivery_address || '',
                        deliveryLatitude: dbOrder.delivery_latitude ? Number(dbOrder.delivery_latitude) : undefined,
                        deliveryLongitude: dbOrder.delivery_longitude ? Number(dbOrder.delivery_longitude) : undefined,
                        receiverName: dbOrder.receiver_name,
                        receiverPhone: dbOrder.receiver_phone,
                        deliveryPartnerName: dbOrder.delivery_partner_name || undefined,
                        deliveryPartnerPhone: dbOrder.delivery_partner_phone || undefined,
                        deliveryPartnerPhoto: dbOrder.delivery_partner_photo || undefined,
                    }));
                    setOrders(mappedOrders);
                }
            } catch (e) {
                console.error("Failed to fetch orders", e);
            }
        };

        fetchOrders();

        // Supabase Realtime Subscription for Orders
        const subscription = supabase
            .channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${user?.id}` }, payload => {
                fetchOrders(); // Simply refetch on any change for simplicity or handle merged updates
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);



    // --- Product Actions ---

    const addProduct = async (productData: Omit<VendorProduct, 'id'>): Promise<boolean> => {
        if (!user) return false;

        // 1. Create a temporary Optimistic Product
        const tempId = `temp-${Date.now()}`;
        const newOptimisticProduct: VendorProduct = {
            id: tempId,
            ...productData,
            // Ensure standard format for UI
            image: productData.images && productData.images.length > 0
                ? { uri: productData.images[0] }
                : (typeof productData.image === 'string' ? { uri: productData.image } : productData.image),
            status: productData.stock > 0 ? 'Active' : 'Out of Stock'
        };

        // 2. Update Local State Immediately
        setProducts(prev => [newOptimisticProduct, ...prev]);

        // 3. Background Sync to DB
        (async () => {
            try {
                console.log('🚀 [VendorContext] Starting product save...', {
                    name: productData.name,
                    category: productData.category,
                    stock: productData.stock,
                    hasImages: productData.images?.length || 0
                });

                // Upload Images First
                let finalImages: string[] = [];
                if (productData.images && productData.images.length > 0) {
                    console.log('📸 [VendorContext] Uploading images...', productData.images.length);
                    const uploadPromises = productData.images.map(img => uploadImageToSupabase(img, user.id));
                    const results = await Promise.all(uploadPromises);
                    finalImages = results.filter(url => url !== null) as string[];
                    console.log('✅ [VendorContext] Images uploaded:', finalImages.length, 'successful');
                }

                // Fallback for single image property
                let imageUrlToSave = typeof productData.image === 'string' ? productData.image : null;
                // If the primary image was also a file://, it should be in finalImages[0] now if images structure is consistent
                if (finalImages.length > 0) {
                    imageUrlToSave = finalImages[0];
                }

                const insertData = {
                    name: productData.name,
                    price: productData.price,
                    unit: productData.unit,
                    stock: productData.stock,
                    category: productData.category,
                    description: productData.description,
                    image_url: imageUrlToSave,
                    images: finalImages,
                    highlights: productData.highlights,
                    vendor_id: user.id
                };

                console.log('💾 [VendorContext] Attempting database insert...');
                console.log('📋 [VendorContext] Insert data:', JSON.stringify(insertData, null, 2));
                console.log('🔐 [VendorContext] User from context:', user.id);

                try {
                    // Test if Supabase is responding at all
                    console.log('🧪 [VendorContext] Testing Supabase connection...');
                    const testResult = await supabase.from('products').select('count').limit(1);
                    console.log('✅ [VendorContext] Supabase connection test:', testResult.error ? 'FAILED' : 'SUCCESS');
                    if (testResult.error) {
                        console.error('❌ [VendorContext] Connection test error:', testResult.error);
                    }

                    console.log('⏳ [VendorContext] Starting insert...');
                    const insertResult = await supabase
                        .from('products')
                        .insert(insertData)
                        .select()
                        .single();

                    console.log('✅ [VendorContext] Insert completed');

                    const { data, error } = insertResult;

                    if (error) {
                        console.error('❌ [VendorContext] Database insert error:', error);
                        console.error('❌ [VendorContext] Error code:', error.code);
                        console.error('❌ [VendorContext] Error message:', error.message);
                        console.error('❌ [VendorContext] Error details:', JSON.stringify(error, null, 2));
                        console.error('❌ [VendorContext] Error hint:', error.hint);
                        throw error;
                    }

                    console.log('✅ [VendorContext] Product saved successfully!', data);

                    if (data) {
                        // 4. Success: Replace Temp ID with Real ID AND Real Image URLs
                        setProducts(prev => prev.map(p => p.id === tempId ? {
                            ...p,
                            id: data.id,
                            images: finalImages,
                            image: finalImages.length > 0 ? { uri: finalImages[0] } : p.image,
                        } : p));
                    }
                } catch (insertError: any) {
                    console.error('❌ [VendorContext] Insert operation failed:', insertError);
                    console.error('❌ [VendorContext] Insert error type:', typeof insertError);
                    console.error('❌ [VendorContext] Insert error name:', insertError?.name);
                    console.error('❌ [VendorContext] Insert error message:', insertError?.message);
                    throw insertError;
                }
            } catch (e: any) {
                console.error("❌ [VendorContext] Failed to add product in background", e);
                console.error("❌ [VendorContext] Error name:", e.name);
                console.error("❌ [VendorContext] Error message:", e.message);
                console.error("❌ [VendorContext] Full error:", JSON.stringify(e, null, 2));
                // 5. Error: Rollback (Remove the temp product)
                setProducts(prev => prev.filter(p => p.id !== tempId));

                if (Platform.OS === 'web') {
                    alert(`Failed to save product: ${e.message || 'Unknown error'}`);
                } else {
                    Alert.alert("Save Failed", `Could not save product to database. It has been removed. Error: ${e.message || JSON.stringify(e)}`);
                }
            }
        })();

        return true; // Return immediately
    };

    const updateProduct = async (id: string, updates: Partial<VendorProduct>) => {
        // Optimistic UI update
        // We update local state immediately. If upload happens, we'll update again with URLs.
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

        try {
            const dbUpdates: any = { ...updates };

            // 1. Handle Images Array Upload
            if (updates.images && updates.images.length > 0) {
                // Upload any local file:// URIs
                const uploadPromises = updates.images.map(img => uploadImageToSupabase(img, user?.id || 'anonymous'));
                const results = await Promise.all(uploadPromises);
                const finalImages = results.filter(url => url !== null) as string[];

                dbUpdates.images = finalImages;

                // Sync primary image_url for backward compatibility
                if (finalImages.length > 0) {
                    dbUpdates.image_url = finalImages[0];
                }
            }

            // 2. Handle Single Image Upload (if updated separately)
            if (updates.image && typeof updates.image === 'string' && updates.image.startsWith('file://')) {
                const url = await uploadImageToSupabase(updates.image, user?.id || 'anonymous');
                if (url) dbUpdates.image_url = url;
            }

            // Cleanup fields not in DB
            delete dbUpdates.image;
            delete dbUpdates.status;

            const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);

            if (error) throw error;

            // 3. Update Local State with Remote URLs (to prevent re-upload on next edit)
            if (dbUpdates.images || dbUpdates.image_url) {
                setProducts(prev => prev.map(p => p.id === id ? {
                    ...p,
                    images: dbUpdates.images || p.images,
                    image_url: dbUpdates.image_url || p.image_url,
                    image: (dbUpdates.images && dbUpdates.images.length > 0)
                        ? { uri: dbUpdates.images[0] }
                        : (dbUpdates.image_url ? { uri: dbUpdates.image_url } : p.image)
                } : p));
            }

        } catch (e) {
            console.error("Failed to update product", e);
            // Optional: Show alert or rollback
        }
    };

    const deleteProduct = async (id: string) => {
        console.log("🗑️  [VendorContext] Deleting product with ID:", id);
        // Optimistic update
        const previousProducts = products;
        setProducts(prev => prev.filter(p => p.id !== id));
        console.log("✅ [VendorContext] Optimistic delete - removed from UI");

        try {
            console.log("💾 [VendorContext] Attempting database delete...");
            const { error } = await supabase.from('products').delete().eq('id', id);

            if (error) {
                console.error("❌ [VendorContext] Supabase delete error:", error);
                setProducts(previousProducts); // Rollback
                throw error;
            }
            console.log("✅ [VendorContext] Product deleted successfully from database");
        } catch (e) {
            console.error("❌ [VendorContext] Failed to delete product:", e);
            setProducts(previousProducts); // Rollback
            throw e; // Re-throw to let UI know
        }
    };

    const addOrder = async (order: VendorOrder) => {
        console.log("🛒 [VendorContext] Adding new order...", order);

        // Optimistic Update (Optional, mainly for the user immediately)
        setOrders(prev => [order, ...prev]);

        try {
            const insertData = {
                user_id: order.userId,
                vendor_id: order.vendorId,
                items: order.items,
                total_amount: order.totalAmount,
                status: 'Pending',
                payment_status: order.paymentStatus,
                payment_method: order.paymentMethod,
                customer_phone: order.customerPhone,
                shipping_fee: order.shippingFee,
                delivery_address: order.deliveryAddress,
                delivery_latitude: order.deliveryLatitude ?? null,
                delivery_longitude: order.deliveryLongitude ?? null,
                customer_name: order.customerName,
                receiver_name: order.receiverName,
                receiver_phone: order.receiverPhone,
            };

            console.log("💾 [VendorContext] Inserting order into DB:", JSON.stringify(insertData, null, 2));

            const { data, error } = await supabase
                .from('orders')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error("❌ [VendorContext] Failed to insert order:", error);
                throw error;
            }

            console.log("✅ [VendorContext] Order placed successfully:", data);

            // Update the optimistic order with the real DB ID
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, id: data.id } : o));

        } catch (e) {
            console.error("❌ [VendorContext] Exception in addOrder:", e);
            throw e; // Re-throw so caller knows it failed
        }
    };

    const updateOrderStatus = async (
        orderId: string,
        status: VendorOrder['status'],
        partner?: { name: string; phone: string; photo_url: string | null }
    ) => {
        // Optimistic local update
        setOrders(prev => prev.map(o => o.id === orderId ? {
            ...o,
            status,
            ...(partner ? {
                deliveryPartnerName: partner.name,
                deliveryPartnerPhone: partner.phone,
                deliveryPartnerPhoto: partner.photo_url ?? undefined,
            } : {})
        } : o));

        try {
            const updates: any = { status };
            if (status === 'Delivered') updates.payment_status = 'Paid';

            // Persist delivery partner when dispatching
            if (status === 'Shipped' && partner) {
                updates.delivery_partner_name = partner.name;
                updates.delivery_partner_phone = partner.phone;
                updates.delivery_partner_photo = partner.photo_url ?? null;
            }

            await supabase.from('orders').update(updates).eq('id', orderId);
        } catch (e) {
            console.error("Failed to update order status", e);
        }
    };

    const updateProfile = async (updates: Partial<VendorProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
        if (!user) return;

        try {
            const dbUpdates = {
                full_name: updates.ownerName,
                phone_number: updates.phone,
                business_name: updates.businessName,
                farm_size: updates.farmSize,
                gender: updates.gender,
                dob: updates.dob,
                profile_image: updates.profileImage,
                experience: updates.experience,
                bio: updates.bio,
                address: updates.address,
                // Mapping bank details logic if needed
            };

            await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
        } catch (e) {
            console.error("Failed to sync profile:", e);
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
