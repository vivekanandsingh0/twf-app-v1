import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Address {
    id: number;
    type: string;
    icon: string;
    address: string;
    city: string;
    pincode?: string;
    landmark?: string;
}

const INITIAL_ADDRESSES: Address[] = [
    {
        id: 1,
        type: 'Home',
        icon: 'home-outline',
        address: 'Kankarbagh Colony, Near Hanuman Nagar, road no.1',
        city: 'left, Near Nalanda',
        pincode: '800020',
        landmark: 'Near City Mall',
    },
    {
        id: 2,
        type: 'Office',
        icon: 'briefcase-outline',
        address: 'Kankarbagh Colony, Near Hanuman Nagar, road no.1',
        city: 'left, Near Nalanda',
        pincode: '800001',
        landmark: 'Opposite Bank',
    },
    {
        id: 3,
        type: 'Coffee Shop',
        icon: 'cafe-outline',
        address: 'Kankarbagh Colony, Near Hanuman Nagar, road no.1',
        city: 'left, Near Nalanda',
        pincode: '800015',
        landmark: 'Near Park',
    },
];

interface AddressContextType {
    addresses: Address[];
    selectedAddress: Address;
    setAddresses: (addresses: Address[]) => void;
    setSelectedAddress: (address: Address) => void;
    addAddress: (address: Address) => void;
    updateAddress: (id: number, address: Partial<Address>) => void;
    deleteAddress: (id: number) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
    const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
    const [selectedAddress, setSelectedAddress] = useState<Address>(INITIAL_ADDRESSES[0]);

    const addAddress = (address: Address) => {
        setAddresses([...addresses, address]);
    };

    const updateAddress = (id: number, updatedData: Partial<Address>) => {
        setAddresses(addresses.map(addr =>
            addr.id === id ? { ...addr, ...updatedData } : addr
        ));
    };

    const deleteAddress = (id: number) => {
        setAddresses(addresses.filter(addr => addr.id !== id));
        // If deleted address was selected, select the first one
        if (selectedAddress.id === id && addresses.length > 1) {
            setSelectedAddress(addresses.find(addr => addr.id !== id) || addresses[0]);
        }
    };

    return (
        <AddressContext.Provider value={{
            addresses,
            selectedAddress,
            setAddresses,
            setSelectedAddress,
            addAddress,
            updateAddress,
            deleteAddress,
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
