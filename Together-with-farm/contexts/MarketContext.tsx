import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Interfaces ---

export interface MarketVendor {
    id: string;
    name: string;
    image: any;
    coverImage: any;
    bio: string;
    location: string;
    tag: string; // e.g., 'FEATURED VENDOR'
    stats: {
        experience: string;
        method: string;
        size: string;
    };
    story: string;
    quote: string;
}

export interface MarketProduct {
    id: string; // Changed to string to match backend
    vendorId: string;
    name: string;
    type: string; // Category e.g., 'Roots', 'Leafy'
    price: number;
    unit: string;
    discount?: string; // e.g. '-40%', 'BOGO'
    specialOffer?: string; // e.g. 'Limited Time Deal'
    image: any;
    description: string;
    isFavorite: boolean;
    tag?: string; // Additional tag like 'Organic'
}

export interface Article {
    id: number;
    title: string;
    category: string;
    time: string;
    image: any;
    type?: string; // 'Farming Tips', 'Agri-Tech'
    tag?: string; // 'Trending'
    content?: string; // Full content for the article reader
}

export interface MarketContextType {
    vendors: MarketVendor[];
    products: MarketProduct[];
    articles: Article[];
    addArticle: (article: Omit<Article, 'id'>) => void;
    addProduct: (product: Omit<MarketProduct, 'id'>) => void;
    toggleFavoriteProduct: (productId: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// --- Mock Data ---

const MOCK_VENDORS: MarketVendor[] = []; // (Kept empty or reduced if needed, but context didn't change vendors much)
// ... keeping existing MOCK_VENDORS for now as we are focusing on PRODUCTS

const MOCK_PRODUCTS: MarketProduct[] = []; // We will load from API

const MOCK_ARTICLES: Article[] = [
    {
        id: 1,
        title: 'How to Keep Fruits Fresh Longer',
        category: 'Storage Tips',
        time: '4 mins',
        image: require('@/assets/images/3d-model-with-veg.png'),
        type: 'Tips'
    },
    {
        id: 2,
        title: 'Top 10 Rich Nutrition Foods',
        category: 'Nutrition',
        time: '6 mins',
        image: require('@/assets/images/3d-model-with-veg.png'),
        type: 'Health'
    },
    {
        id: 3,
        title: 'Sustainable Irrigation Methods',
        category: 'Tech',
        time: '5 min read',
        image: require('@/assets/images/3d-model-with-veg.png'),
        type: 'Agri-Tech',
        tag: 'Trending'
    }
];

// --- Provider ---
import { supabase } from '@/lib/supabase';

export function MarketProvider({ children }: { children: ReactNode }) {
    // ... vendors state ...
    const [vendors] = useState<MarketVendor[]>([
        {
            id: 'vendor_1',
            name: 'Amit Kumar',
            image: require('@/assets/images/3d-model-with-veg.png'),
            coverImage: require('@/assets/images/3d-model-with-veg.png'),
            bio: 'Specialist in organic root vegetables.',
            location: 'Sikar, Rajasthan',
            tag: 'FEATURED VENDOR',
            stats: { experience: '12 Years', method: 'Organic', size: '5 Acres' },
            story: "Legacy farming.",
            quote: "Healthy living for everyone."
        },
    ]);
    const [products, setProducts] = useState<MarketProduct[]>([]);
    const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);

    // FETCH PRODUCTS FROM SUPABASE
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .gt('stock', 0); // Only show in-stock products

                if (error) throw error;

                if (data) {
                    const mappedProducts: MarketProduct[] = data.map((p: any) => ({
                        id: p.id,
                        vendorId: p.vendor_id,
                        name: p.name,
                        type: p.category || 'Vegetables',
                        price: p.price,
                        unit: p.unit || 'kg',
                        discount: undefined,
                        specialOffer: undefined,
                        // If image_url is null (from local asset upload), fallback to placeholder
                        image: p.image_url ? { uri: p.image_url } : require('@/assets/images/3d-model-with-veg.png'),
                        description: p.description || 'Fresh produce from local farmers.',
                        isFavorite: false,
                        tag: p.stock < 5 ? 'Low Stock' : 'Fresh'
                    }));
                    setProducts(mappedProducts);
                }
            } catch (e) {
                console.error("Failed to fetch products for Market", e);
            }
        };

        fetchProducts();

        // Realtime subscription for new products
        const subscription = supabase
            .channel('market:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchProducts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const addArticle = (article: Omit<Article, 'id'>) => {
        const newArticle = { ...article, id: Date.now() };
        setArticles(prev => [newArticle, ...prev]);
    };

    const addProduct = (product: Omit<MarketProduct, 'id'>) => {
        // Optimistic add (though ideally we should POST to backend if this was a vendor app)
        const newProduct = { ...product, id: `temp_${Date.now()}` };
        setProducts(prev => [newProduct, ...prev]);
    };

    const toggleFavoriteProduct = (productId: string) => {
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
        ));
    };

    return (
        <MarketContext.Provider value={{
            vendors,
            products,
            articles,
            addArticle,
            addProduct,
            toggleFavoriteProduct
        }}>
            {children}
        </MarketContext.Provider>
    );
}

export function useMarket() {
    const context = useContext(MarketContext);
    if (!context) throw new Error('useMarket must be used within MarketProvider');
    return context;
}
