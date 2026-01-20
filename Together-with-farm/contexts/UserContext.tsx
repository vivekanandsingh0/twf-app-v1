import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserData {
    phoneNumber: string;
    fullName: string;
    gender: string;
    dob: string;
    userType: 'User' | 'Vendor';
}

interface UserContextType {
    userData: UserData;
    setUserData: (data: Partial<UserData>) => void;
    updatePhoneNumber: (phone: string) => void;
    updateProfile: (name: string, gender: string, dob: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [userData, setUserDataState] = useState<UserData>({
        phoneNumber: '',
        fullName: 'Vivekanand Singh',
        gender: 'Male',
        dob: '10 August 1999',
        userType: 'User',
    });

    const setUserData = (data: Partial<UserData>) => {
        setUserDataState(prev => ({ ...prev, ...data }));
    };

    const updatePhoneNumber = (phone: string) => {
        setUserDataState(prev => ({ ...prev, phoneNumber: phone }));
    };

    const updateProfile = (name: string, gender: string, dob: string) => {
        setUserDataState(prev => ({ ...prev, fullName: name, gender, dob }));
    };

    return (
        <UserContext.Provider value={{ userData, setUserData, updatePhoneNumber, updateProfile }}>
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
