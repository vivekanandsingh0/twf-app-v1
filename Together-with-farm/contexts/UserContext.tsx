import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
        fullName: 'Vivekanand Singh',
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

        if (token === '123456' || token.length > 0) { // Simple validation
            const mockUser: MockUser = {
                id: 'mock_user_id_' + Date.now(),
                phone: phone
            };
            const mockSession: MockSession = {
                user: mockUser,
                access_token: 'mock_token'
            };

            setUserDataState(prev => ({
                ...prev,
                phoneNumber: phone,
                userType: userType
            }));

            // Set session LAST to ensure data is ready before consumers react to session=true
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
            fullName: 'Vivekanand Singh', // Default or empty
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
