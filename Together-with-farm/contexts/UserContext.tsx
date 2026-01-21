import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserData {
    phoneNumber: string;
    fullName: string;
    gender: string;
    dob: string;
    userType: 'User' | 'Vendor';
}

interface UserContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    userData: UserData;
    setUserData: (data: Partial<UserData>) => void;
    updatePhoneNumber: (phone: string) => void;
    updateProfile: (name: string, gender: string, dob: string) => void;
    sendOtp: (phone: string) => Promise<{ error: any }>;
    verifyOtp: (phone: string, token: string, userType: 'User' | 'Vendor') => Promise<{ session: Session | null; error: any }>;
    signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Legacy state for UI compatibility - eventually replace with DB Profile
    const [userData, setUserDataState] = useState<UserData>({
        phoneNumber: '',
        fullName: 'Vivekanand Singh',
        gender: 'Male',
        dob: '10 August 1999',
        userType: 'User',
    });

    useEffect(() => {
        // Check active sessions and sets the user
        const initializeSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUserDataState({
                        phoneNumber: profile.phone_number || '',
                        fullName: profile.full_name || 'User',
                        gender: profile.gender || 'Male',
                        dob: profile.dob || '',
                        userType: profile.user_type || 'User',
                    });
                }
            }
        };

        initializeSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUserDataState({
                        phoneNumber: profile.phone_number || '',
                        fullName: profile.full_name || 'User',
                        gender: profile.gender || 'Male',
                        dob: profile.dob || '',
                        userType: profile.user_type || 'User',
                    });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const setUserData = (data: Partial<UserData>) => {
        setUserDataState(prev => ({ ...prev, ...data }));
    };

    const updatePhoneNumber = (phone: string) => {
        setUserDataState(prev => ({ ...prev, phoneNumber: phone }));
    };

    const updateProfile = async (name: string, gender: string, dob: string) => {
        setUserDataState(prev => ({ ...prev, fullName: name, gender, dob }));
        if (user) {
            await supabase.from('profiles').update({
                full_name: name,
                gender,
                dob,
            }).eq('id', user.id);
        }
    };

    const sendOtp = async (phone: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            phone: phone,
        });
        return { error };
    };

    const verifyOtp = async (phone: string, token: string, userType: 'User' | 'Vendor') => {
        const { data, error } = await supabase.auth.verifyOtp({
            phone: phone,
            token: token,
            type: 'sms',
        });

        if (data.session) {
            setSession(data.session);
            setUser(data.user);

            // Check if profile exists, if not create it
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.session.user.id)
                .single();

            if (!profile) {
                const newProfile = {
                    id: data.session.user.id,
                    phone_number: phone,
                    full_name: 'New User',
                    user_type: userType,
                };

                await supabase.from('profiles').insert(newProfile);

                setUserDataState({
                    phoneNumber: phone,
                    fullName: 'New User',
                    gender: 'Male',
                    dob: '',
                    userType: userType,
                });
            } else {
                setUserDataState({
                    phoneNumber: profile.phone_number,
                    fullName: profile.full_name,
                    gender: profile.gender,
                    dob: profile.dob,
                    userType: profile.user_type,
                });
            }
        }

        return { session: data.session, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
    };

    return (
        <UserContext.Provider value={{
            session,
            user,
            loading,
            userData,
            setUserData,
            updatePhoneNumber,
            updateProfile,
            sendOtp,
            verifyOtp,
            signOut
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
}
