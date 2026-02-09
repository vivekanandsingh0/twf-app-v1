
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Helper Interface
interface UserData {
    phoneNumber: string;
    fullName: string;
    gender: string;
    dob: string;
    userType: 'User' | 'Vendor';
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
    setUserData: (data: Partial<UserData>) => void;
    updatePhoneNumber: (phone: string) => void;
    updateProfile: (name: string, gender: string, dob: string, phone?: string, experience?: string, farmSize?: string, bio?: string, profileImage?: string) => Promise<void>;
    sendOtp: (phone: string) => Promise<{ error: any }>;
    verifyOtp: (phone: string, token: string, userType: 'User' | 'Vendor') => Promise<{ session: Session | null; error: any }>;
    signOut: () => Promise<void>;
    switchUserRole: (newRole: 'User' | 'Vendor') => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [userData, setUserDataState] = useState<UserData>({
        phoneNumber: '',
        fullName: '',
        gender: 'Male',
        dob: '10 August 1999',
        userType: 'User',
        profileImage: ''
    });

    useEffect(() => {
        let mounted = true;

        // Init Supabase Session
        const initializeSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (mounted) {
                    console.log("UserContext: Session retrieved", { hasSession: !!session });
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        // Fetch existing profile
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();

                        if (mounted && profile) {
                            setUserDataState(prev => ({
                                ...prev,
                                phoneNumber: session.user.phone || '',
                                fullName: profile.full_name || '',
                                gender: profile.gender || 'Male',
                                dob: profile.dob || '',
                                userType: profile.user_type || 'User',
                                experience: profile.experience,
                                farmSize: profile.farm_size,
                                bio: profile.bio,
                                profileImage: profile.profile_image
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Session init error:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (mounted && profile) {
                        setUserDataState(prev => ({
                            ...prev,
                            phoneNumber: session.user.phone || '',
                            fullName: profile.full_name || '',
                            gender: profile.gender || 'Male',
                            dob: profile.dob || '',
                            userType: profile.user_type || 'User',
                            experience: profile.experience,
                            farmSize: profile.farm_size,
                            bio: profile.bio,
                            profileImage: profile.profile_image
                        }));
                    }
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

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
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) {
            console.error("Send OTP Error:", error.message);
            // Alert is shown in UI, but log here for debugging
        }
        return { error };
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

            // Sync/Create Profile immediately
            const updates = {
                id: data.user.id,
                phone_number: phone,
                user_type: userType,
                full_name: userData.fullName || 'Anonymous',
                updated_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase.from('profiles').upsert(updates);
            if (profileError) console.error("Profile Create Error:", profileError.message);

            setUserDataState(prev => ({
                ...prev,
                phoneNumber: phone,
                userType: userType
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
            gender: 'Male',
            dob: '10 August 1999',
            userType: 'User'
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
