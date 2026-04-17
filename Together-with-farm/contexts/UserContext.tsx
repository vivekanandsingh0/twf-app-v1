
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { usePostHog } from 'posthog-react-native';

import { VendorOrder } from './VendorContext'; // Import generic Order type

// Helper Interface
interface UserData {
    phoneNumber: string;
    fullName: string;
    gender: string;
    dob: string;
    userType: 'User' | 'Vendor';
    vendorApproved?: boolean;
    experience?: string;
    farmSize?: string;
    bio?: string;
    profileImage?: string; // Base64 or URL
}

interface UserContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    userData: UserData;
    orders: VendorOrder[]; // Added orders for the user
    refreshOrders: () => Promise<void>; // Added manual refresh
    setUserData: (data: Partial<UserData>) => void;
    updatePhoneNumber: (phone: string) => void;
    updateProfile: (name: string, gender: string, dob: string, phone?: string, experience?: string, farmSize?: string, bio?: string, profileImage?: string) => Promise<void>;
    sendOtp: (phone: string) => Promise<{ error: any }>;
    verifyOtp: (phone: string, token: string, userType: 'User' | 'Vendor') => Promise<{ session: Session | null; error: any }>;
    signOut: () => Promise<void>;
    switchUserRole: (newRole: 'User' | 'Vendor') => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const proxyUrl = (url?: any) => {
    if (typeof url === 'string') {
        return url.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev');
    }
    if (url && typeof url === 'object' && typeof url.uri === 'string') {
        return { ...url, uri: url.uri.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev') };
    }
    return url;
};

export function UserProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<VendorOrder[]>([]); // User orders
    const posthog = usePostHog();

    const [userData, setUserDataState] = useState<UserData>({
        phoneNumber: '',
        fullName: '',
        gender: '',
        dob: '',
        userType: 'User',
        vendorApproved: false,
        profileImage: ''
    });

    const refreshOrders = async () => {
        if (!session?.user) return;
        const userId = session.user.id;

        console.log('🔄 [UserContext] Manually refreshing orders...');
        const { data: userOrders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (userOrders) {
            const mappedOrders = userOrders.map((dbOrder: any) => ({
                id: dbOrder.id,
                userId: dbOrder.user_id,
                vendorId: dbOrder.vendor_id,
                customerId: dbOrder.user_id,
                customerName: 'Me',
                items: (dbOrder.items || []).map((item: any) => ({ ...item, image: proxyUrl(item.image) })),
                totalAmount: Number(dbOrder.total_amount || 0),
                status: dbOrder.status,
                date: dbOrder.created_at,
                paymentStatus: dbOrder.payment_status,
                customerPhone: dbOrder.customer_phone,
                paymentMethod: dbOrder.payment_method,
                shippingFee: Number(dbOrder.shipping_fee || 0),
                deliveryAddress: dbOrder.delivery_address || '',
                deliveryPartnerName: dbOrder.delivery_partner_name || undefined,
                deliveryPartnerPhone: dbOrder.delivery_partner_phone || undefined,
                deliveryPartnerPhoto: proxyUrl(dbOrder.delivery_partner_photo) || undefined,
            }));
            setOrders(mappedOrders);
        }
    };

    // 1. Initialize Session & Auth Listener
    useEffect(() => {
        let mounted = true;

        const initializeSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.warn("Supabase Session Warning:", error.message);
                    if (error.message.includes("Refresh Token") || error.message.includes("Invalid token")) {
                        // The storage token is corrupted or invalid. Wipe it locally.
                        console.log("Cleaning up invalid session storage...");
                        await supabase.auth.signOut({ scope: 'local' });
                    }
                }

                if (mounted) {
                    console.log("UserContext: Session retrieved", { hasSession: !!session });
                    setSession(session);
                    setUser(session?.user ?? null);
                    if (!session?.user) {
                        setLoading(false); // ONLY set false if not logged in. If logged in, loadUserResources will turn it false.
                    }
                }
            } catch (error: any) {
                console.error("Session init error caught:", error);
                
                // If the error happens inside getSession itself (which it can for refresh token issues)
                if (error?.message?.includes("Refresh Token")) {
                    console.log("Forcing cleanup after caught refresh error");
                    await supabase.auth.signOut({ scope: 'local' });
                }
                
                if (mounted) setLoading(false);
            }
        };

        initializeSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                if (!session) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // 2. Fetch User Data & Orders + Realtime Subscription (Depends on Session)
    useEffect(() => {
        if (!session?.user) {
            // Clear user data on logout
            setUserDataState({
                phoneNumber: '',
                fullName: '',
                gender: '',
                dob: '',
                userType: 'User',
                vendorApproved: false,
                profileImage: ''
            });
            setOrders([]);
            setLoading(false); // Force loading state OFF when no session user exists, fixing infinite loading bug
            return;
        }

        let mounted = true;
        let orderSubscription: any = null;
        const userId = session.user.id;

        const loadUserResources = async () => {
            try {
                // A. Fetch Profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
                if (mounted && profile) {
                    setUserDataState(prev => ({
                        ...prev,
                        phoneNumber: session.user.phone || '',
                        fullName: profile.full_name || '',
                        gender: profile.gender || '',
                        dob: profile.dob || '',
                        userType: profile.user_type || 'User',
                        vendorApproved: profile.vendor_approved === true,
                        experience: profile.experience,
                        farmSize: profile.farm_size,
                        bio: profile.bio,
                        profileImage: proxyUrl(profile.profile_image)
                    }));
                    
                    if (posthog && userId) {
                        posthog.identify(userId, {
                            user_type: profile.user_type || 'User',
                            vendor_approved: profile.vendor_approved === true
                        });
                    }
                }

                const fetchOrders = async () => {
                    const { data: userOrders } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false });

                    if (mounted && userOrders) {
                        const mappedOrders = userOrders.map((dbOrder: any) => ({
                            id: dbOrder.id,
                            userId: dbOrder.user_id,
                            vendorId: dbOrder.vendor_id,
                            customerId: dbOrder.user_id,
                            customerName: 'Me',
                            items: (dbOrder.items || []).map((item: any) => ({ ...item, image: proxyUrl(item.image) })),
                            totalAmount: Number(dbOrder.total_amount || 0),
                            status: dbOrder.status,
                            date: dbOrder.created_at,
                            paymentStatus: dbOrder.payment_status,
                            customerPhone: dbOrder.customer_phone,
                            paymentMethod: dbOrder.payment_method,
                            shippingFee: Number(dbOrder.shipping_fee || 0),
                            deliveryAddress: dbOrder.delivery_address || '',
                            deliveryPartnerName: dbOrder.delivery_partner_name || undefined,
                            deliveryPartnerPhone: dbOrder.delivery_partner_phone || undefined,
                            deliveryPartnerPhoto: proxyUrl(dbOrder.delivery_partner_photo) || undefined,
                        }));
                        setOrders(mappedOrders);
                    }
                };

                await fetchOrders();

                // C. Subscribe to Order Changes
                console.log(`🔔 [UserContext] Subscribing to orders for user: ${userId}`);
                orderSubscription = supabase
                    .channel(`public:orders:${userId}`)
                    .on('postgres_changes',
                        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
                        (payload) => {
                            console.log('🔔 [UserContext] Order update received:', payload.eventType);
                            fetchOrders(); // Re-fetch on any change
                        }
                    )
                    .subscribe((status) => {
                        console.log(`🔔 [UserContext] Subscription status for ${userId}:`, status);
                    });

            } catch (err) {
                console.error("Error loading user resources:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // If userData is already populated (e.g. from verifyOtp), we might want to skip fetching?
        // But verifyOtp sets userData, it doesn't prevent this effect from running.
        // It's safer to re-fetch to be sure.
        loadUserResources();

        return () => {
            mounted = false;
            if (orderSubscription) supabase.removeChannel(orderSubscription);
        };
    }, [session?.user?.id]);

    // Context Actions
    const setUserData = (data: Partial<UserData>) => {
        setUserDataState(prev => ({ ...prev, ...data }));
    };

    const updatePhoneNumber = (phone: string) => {
        setUserDataState(prev => ({ ...prev, phoneNumber: phone }));
    };

    const updateProfile = async (name: string, gender: string, dob: string, phone?: string, experience?: string, farmSize?: string, bio?: string, profileImage?: string) => {
        setUserDataState(prev => ({
            ...prev,
            fullName: name,
            gender,
            dob,
            phoneNumber: phone || prev.phoneNumber,
            experience: experience || prev.experience,
            farmSize: farmSize || prev.farmSize,
            bio: bio || prev.bio,
            profileImage: profileImage || prev.profileImage
        }));

        if (!user) return;

        try {
            const updates = {
                id: user.id,
                full_name: name,
                gender,
                dob,
                phone_number: phone || userData.phoneNumber,
                experience,
                farm_size: farmSize,
                bio,
                profile_image: profileImage,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            console.log("Profile Sync Success!");
        } catch (e: any) {
            console.error("Failed to sync user profile:", e.message || e);
        }
    };

    const sendOtp = async (phone: string) => {
        console.log(`Sending OTP to ${phone} via Supabase`);
        console.log(`📱 [OTP Debug] Phone format: ${phone}, Length: ${phone.length}`);

        try {
            const result = await supabase.auth.signInWithOtp({ phone });

            console.log('📱 [OTP Debug] Full Supabase response:', JSON.stringify(result, null, 2));
            console.log('📱 [OTP Debug] Data:', JSON.stringify(result.data, null, 2));
            console.log('📱 [OTP Debug] Error:', result.error ? JSON.stringify(result.error, null, 2) : 'NONE');

            if (result.error) {
                console.error("❌ Send OTP Error:", result.error.message);
                console.error("❌ Error status:", result.error.status);
                console.error("❌ Error name:", result.error.name);
            } else {
                console.log('✅ [OTP Debug] OTP request accepted by Supabase - SMS should be sent via Twilio');
            }

            return { error: result.error };
        } catch (e: any) {
            console.error('❌ [OTP Debug] Exception caught:', e.message);
            console.error('❌ [OTP Debug] Full exception:', JSON.stringify(e, null, 2));
            return { error: e };
        }
    };

    const verifyOtp = async (phone: string, token: string, userType: 'User' | 'Vendor') => {
        console.log(`Verifying OTP for ${phone}`);
        const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });

        if (error) {
            console.error("Verify OTP Error:", error.message);
            return { session: null, error };
        }

        if (data.session && data.user) {
            setSession(data.session);
            setUser(data.user);

            // Check for existing profile to avoid overwriting name
            let existingName = 'Anonymous';
            let isExistingVendor = false;
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('full_name, vendor_approved')
                .eq('id', data.user.id)
                .single();

            if (existingProfile && existingProfile.full_name) {
                existingName = existingProfile.full_name;
                isExistingVendor = existingProfile.vendor_approved === true;
            }

            const finalName = existingName !== 'Anonymous' ? existingName : (userData.fullName || 'Anonymous');
            // New vendor accounts start unapproved. Existing approved vendors keep their status.
            const vendorApprovedValue = userType === 'Vendor' ? isExistingVendor : true;

            const updates = {
                id: data.user.id,
                phone_number: phone,
                user_type: userType,
                full_name: finalName,
                vendor_approved: vendorApprovedValue,
                updated_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase.from('profiles').upsert(updates);
            if (profileError) console.error("Profile Create Error:", profileError.message);

            setUserDataState(prev => ({
                ...prev,
                phoneNumber: phone,
                userType: userType,
                fullName: finalName,
                vendorApproved: vendorApprovedValue
            }));

            return { session: data.session, error: null };
        }

        return { session: null, error: { message: "No session returned" } };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setUserDataState({
            phoneNumber: '',
            fullName: '',
            gender: '',
            dob: '',
            userType: 'User',
            vendorApproved: false
        });
    };

    const switchUserRole = async (newRole: 'User' | 'Vendor') => {
        if (!user) return false;

        try {
            setUserDataState(prev => ({ ...prev, userType: newRole }));
            const { error } = await supabase.from('profiles').update({ user_type: newRole }).eq('id', user.id);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error("Role Switch Failed:", e);
            return false;
        }
    };

    return (
        <UserContext.Provider value={{
            session, user, loading, userData,
            orders, // Added orders
            refreshOrders, // Added
            setUserData, updatePhoneNumber, updateProfile,
            sendOtp, verifyOtp, signOut, switchUserRole
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
}
