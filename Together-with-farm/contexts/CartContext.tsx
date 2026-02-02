import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartContextType {
    quantities: Record<string, number>;
    updateQuantity: (id: string, delta: number) => void;
    getItemQuantity: (id: string) => number;
    totalCartItems: number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const updateQuantity = (id: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const getItemQuantity = (id: string) => quantities[id] || 0;

    const totalCartItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

    const clearCart = () => setQuantities({});

    return (
        <CartContext.Provider value={{ quantities, updateQuantity, getItemQuantity, totalCartItems, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
