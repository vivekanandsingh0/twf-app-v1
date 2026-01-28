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
const INITIAL_ADDRESSES: Address[] = [
    {
        id: '1',
        type: 'Home',
        icon: 'home-outline',
        address: '123, Green Str.',
        city: 'Patna',
        pincode: '800001'
    },
    {
        id: '2',
        type: 'Work',
        icon: 'briefcase-outline',
        address: 'Tech Park, Sector 5',
        city: 'Patna',
        pincode: '800013'
    }
];

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
            // setAddresses([]); 
            // setSelectedAddress(null);
        }
    }, [user]);

    const fetchAddresses = async () => {
        // Mock Fetch
        setLoading(true);
        // Simulate delay
        setTimeout(() => {
            // In a real mock, we might load from somewhere else, but INITIAL_ADDRESSES is fine
            if (addresses.length === 0) setAddresses(INITIAL_ADDRESSES);
            if (!selectedAddress && addresses.length > 0) setSelectedAddress(addresses[0]);
            setLoading(false);
        }, 500);
    };

    const addAddress = async (addressData: Omit<Address, 'id'>) => {
        // Mock Add
        try {
            const newAddress: Address = {
                ...addressData,
                id: Date.now().toString(),
                icon: getIconForType(addressData.type)
            };
            setAddresses(prev => [newAddress, ...prev]);

            // If this is the first address, select it
            if (addresses.length === 0) {
                setSelectedAddress(newAddress);
            }
        } catch (error: any) {
            console.error('Error adding address:', error);
            Alert.alert('Error', 'Failed to save address: ' + error.message);
        }
    };

    const updateAddress = async (id: string, updatedData: Partial<Address>) => {
        // Mock Update
        try {
            setAddresses(prev => prev.map(addr =>
                addr.id === id ? { ...addr, ...updatedData, icon: updatedData.type ? getIconForType(updatedData.type) : addr.icon } : addr
            ));

            // If updating currently selected address, update it too
            if (selectedAddress?.id === id) {
                setSelectedAddress(prev => prev ? { ...prev, ...updatedData, icon: updatedData.type ? getIconForType(updatedData.type) : prev.icon } : null);
            }

        } catch (error: any) {
            console.error('Error updating address:', error);
            Alert.alert('Error', 'Failed to update address');
        }
    };

    const deleteAddress = async (id: string) => {
        // Mock Delete
        try {
            const newAddresses = addresses.filter(addr => addr.id !== id);
            setAddresses(newAddresses);

            // If deleted address was selected, select the first one
            if (selectedAddress?.id === id) {
                setSelectedAddress(newAddresses.length > 0 ? newAddresses[0] : null);
            }
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
