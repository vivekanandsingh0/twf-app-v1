import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FavouritesContextType {
    favourites: Set<number>;
    toggleFavourite: (id: number) => void;
    isFavourite: (id: number) => boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function FavouritesProvider({ children }: { children: ReactNode }) {
    const [favourites, setFavourites] = useState<Set<number>>(new Set());

    const toggleFavourite = (id: number) => {
        setFavourites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const isFavourite = (id: number) => favourites.has(id);

    return (
        <FavouritesContext.Provider value={{ favourites, toggleFavourite, isFavourite }}>
            {children}
        </FavouritesContext.Provider>
    );
}

export function useFavourites() {
    const context = useContext(FavouritesContext);
    if (!context) {
        throw new Error('useFavourites must be used within FavouritesProvider');
    }
    return context;
}
