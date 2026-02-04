import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';
import { Alert } from 'react-native';

export interface Address {
    id: string;
    type: string;
    icon: string;
    address: string;
    city: string;
    pincode?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
}

// Keep initial addresses empty as we will fetch from DB
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
    return `http://${host}:3000`;
};

// Keep initial addresses empty as we will fetch from DB
const INITIAL_ADDRESSES: Address[] = [];

interface AddressContextType {
    addresses: Address[];
    selectedAddress: Address | null;
    loading: boolean;
    setAddresses: (addresses: Address[]) => void;
    setSelectedAddress: (address: Address) => void;
    addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
    updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    refreshAddresses: () => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
    const { user } = useUser();
    const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch addresses when user is available
    useEffect(() => {
        if (user) {
            fetchAddresses();
        } else {
            // Keep mock addresses even if logged out for demo purposes, or reset
            setAddresses([]);
            setSelectedAddress(null);
        }
    }, [user]);

    const fetchAddresses = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const API_URL = getApiUrl();
            const res = await fetch(`${API_URL}/api/profiles/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.addresses && Array.isArray(data.addresses)) {
                    setAddresses(data.addresses);
                    if (!selectedAddress && data.addresses.length > 0) {
                        setSelectedAddress(data.addresses[0]);
                    }
                } else {
                    setAddresses([]);
                }
            }
        } catch (e) {
            console.error("Failed to fetch addresses:", e);
        } finally {
            setLoading(false);
        }
    };

    const syncAddressesToBackend = async (newAddresses: Address[]) => {
        if (!user) return;
        try {
            const API_URL = getApiUrl();
            await fetch(`${API_URL}/api/profiles/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addresses: newAddresses
                })
            });
        } catch (e) {
            console.error("Failed to sync addresses:", e);
        }
    };

    const addAddress = async (addressData: Omit<Address, 'id'>) => {
        try {
            const newAddress: Address = {
                ...addressData,
                id: Date.now().toString(),
                icon: getIconForType(addressData.type)
            };
            const updatedAddresses = [newAddress, ...addresses];
            setAddresses(updatedAddresses);

            // If this is the first address, select it
            if (addresses.length === 0) {
                setSelectedAddress(newAddress);
            }

            await syncAddressesToBackend(updatedAddresses);
        } catch (error: any) {
            console.error('Error adding address:', error);
            Alert.alert('Error', 'Failed to save address: ' + error.message);
        }
    };

    const updateAddress = async (id: string, updatedData: Partial<Address>) => {
        try {
            const updatedAddresses = addresses.map(addr =>
                addr.id === id ? { ...addr, ...updatedData, icon: updatedData.type ? getIconForType(updatedData.type) : addr.icon } : addr
            );
            setAddresses(updatedAddresses);

            // If updating currently selected address, update it too
            if (selectedAddress?.id === id) {
                setSelectedAddress(prev => prev ? { ...prev, ...updatedData, icon: updatedData.type ? getIconForType(updatedData.type) : prev.icon } : null);
            }

            await syncAddressesToBackend(updatedAddresses);
        } catch (error: any) {
            console.error('Error updating address:', error);
            Alert.alert('Error', 'Failed to update address');
        }
    };

    const deleteAddress = async (id: string) => {
        try {
            const newAddresses = addresses.filter(addr => addr.id !== id);
            setAddresses(newAddresses);

            // If deleted address was selected, select the first one
            if (selectedAddress?.id === id) {
                setSelectedAddress(newAddresses.length > 0 ? newAddresses[0] : null);
            }

            await syncAddressesToBackend(newAddresses);
        } catch (error: any) {
            console.error('Error deleting address:', error);
            Alert.alert('Error', 'Failed to delete address');
        }
    };

    const getIconForType = (type: string): string => {
        if (!type) return 'location-outline';
        const lowerType = type.toLowerCase();
        if (lowerType.includes('home')) return 'home-outline';
        if (lowerType.includes('office') || lowerType.includes('work')) return 'briefcase-outline';
        if (lowerType.includes('cafe') || lowerType.includes('coffee')) return 'cafe-outline';
        return 'location-outline';
    };

    return (
        <AddressContext.Provider value={{
            addresses,
            selectedAddress,
            loading,
            setAddresses,
            setSelectedAddress,
            addAddress,
            updateAddress,
            deleteAddress,
            refreshAddresses: fetchAddresses,
        }}>
            {children}
        </AddressContext.Provider>
    );
}

export function useAddresses() {
    const context = useContext(AddressContext);
    if (!context) {
        throw new Error('useAddresses must be used within AddressProvider');
    }
    return context;
}
