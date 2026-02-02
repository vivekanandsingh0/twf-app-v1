import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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
}

// Mock Types to replace Supabase Types
interface MockSession {
    user: MockUser;
    access_token: string;
}

interface MockUser {
    id: string;
    email?: string;
    phone?: string;
}

interface UserContextType {
    session: MockSession | null;
    user: MockUser | null;
    loading: boolean;
    userData: UserData;
    setUserData: (data: Partial<UserData>) => void;
    updatePhoneNumber: (phone: string) => void;
    updateProfile: (name: string, gender: string, dob: string, phone?: string, experience?: string, farmSize?: string, bio?: string) => Promise<void>;
    sendOtp: (phone: string) => Promise<{ error: any }>;
    verifyOtp: (phone: string, token: string, userType: 'User' | 'Vendor') => Promise<{ session: MockSession | null; error: any }>;
    signOut: () => Promise<void>;
    switchUserRole: (newRole: 'User' | 'Vendor') => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<MockSession | null>(null);
    const [user, setUser] = useState<MockUser | null>(null);
    const [loading, setLoading] = useState(true);

    const [userData, setUserDataState] = useState<UserData>({
        phoneNumber: '',
        fullName: '',
        gender: 'Male',
        dob: '10 August 1999',
        userType: 'User',
    });

    useEffect(() => {
        // Init Session (Mock checking local storage or similar)
        const initializeSession = async () => {
            // For now, start logged out or check a local flag if we wanted persistence
            // Let's assume we start logged out for the user to try the flow
            setLoading(false);
        };

        initializeSession();
    }, []);

    // Context Actions
    const setUserData = (data: Partial<UserData>) => {
        setUserDataState(prev => ({ ...prev, ...data }));
    };

    const updatePhoneNumber = (phone: string) => {
        setUserDataState(prev => ({ ...prev, phoneNumber: phone }));
    };

    const updateProfile = async (name: string, gender: string, dob: string, phone?: string, experience?: string, farmSize?: string, bio?: string) => {
        // Mock Update
        setUserDataState(prev => ({
            ...prev,
            fullName: name,
            gender,
            dob,
            phoneNumber: phone || prev.phoneNumber,
            experience: experience || prev.experience,
            farmSize: farmSize || prev.farmSize,
            bio: bio || prev.bio
        }));
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    const sendOtp = async (phone: string) => {
        // Mock Send OTP
        console.log(`Sending Mock OTP to ${phone}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { error: null };
    };

    const verifyOtp = async (phone: string, token: string, userType: 'User' | 'Vendor') => {
        // Mock Verify OTP - Accept any OTP
        console.log(`Verifying Mock OTP for ${phone} with token ${token}`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Default Vendor Credential Check
        if (userType === 'Vendor' && phone.includes('1111111111') && token === '111111') {
            const mockUser: MockUser = {
                id: 'vendor_def_001',
                phone: phone
            };
            const mockSession: MockSession = {
                user: mockUser,
                access_token: 'mock_vendor_token'
            };

            setUserDataState(prev => ({
                ...prev,
                phoneNumber: phone,
                fullName: "Rajesh Kumar", // Matching VendorContext
                userType: 'Vendor',
                experience: "15 Years",
                farmSize: "12 Acres",
                bio: "Your one-stop shop for fresh, organic, and locally sourced produce."
            }));

            // Set session LAST
            setSession(mockSession);
            setUser(mockUser);

            return { session: mockSession, error: null };
        }

        if (token === '123456' || token.length > 0) {
            const mockUser: MockUser = {
                id: 'user_' + phone.replace(/\D/g, ''),
                phone: phone
            };
            const mockSession: MockSession = {
                user: mockUser,
                access_token: 'mock_token'
            };

            // SYNC WITH ADMIN BACKEND
            try {
                // Dynamically determine Host IP (Works for Emulator & Physical Devices)
                const debuggerHost = Constants.expoConfig?.hostUri;
                const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
                const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
                const API_URL = `http://${host}:3000`;

                console.log(`Syncing User with Admin Backend at: ${API_URL}/api/profiles`);

                // Add Timeout to fail fast if unreachable
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(`${API_URL}/api/profiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: mockUser.id,
                        phone_number: phone,
                        user_type: userType,
                        full_name: 'Anonymous',
                        created_at: new Date().toISOString()
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Server responded with ${response.status}: ${text}`);
                }
                console.log("Sync User Success!");
            } catch (e: any) {
                console.error("Failed to sync with local backend:", e.message || e);
            }

            setUserDataState(prev => ({
                ...prev,
                phoneNumber: phone,
                userType: userType
            }));

            setSession(mockSession);
            setUser(mockUser);

            return { session: mockSession, error: null };
        } else {
            return { session: null, error: { message: 'Invalid OTP' } };
        }
    };

    const signOut = async () => {
        setSession(null);
        setUser(null);
        // Reset user data to default state to prevents state leaks between sessions
        setUserDataState({
            phoneNumber: '',
            fullName: '', // Default or empty
            gender: 'Male',
            dob: '10 August 1999',
            userType: 'User' // Critical: Reset to default User role
        });
    };

    const switchUserRole = async (newRole: 'User' | 'Vendor') => {
        setUserDataState(prev => ({ ...prev, userType: newRole }));
        return true;
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
