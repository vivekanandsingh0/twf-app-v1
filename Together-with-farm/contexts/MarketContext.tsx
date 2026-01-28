import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    id: number;
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
    toggleFavoriteProduct: (productId: number) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// --- Mock Data ---

const MOCK_VENDORS: MarketVendor[] = [
    {
        id: 'vendor_1', // Matches our "logged in" vendor mockup logic ideally
        name: 'Amit Kumar', // Matches VendorContext profile
        image: require('@/assets/images/3d-model-with-veg.png'),
        coverImage: require('@/assets/images/3d-model-with-veg.png'),
        bio: 'Specialist in organic root vegetables with over 12 years of experience.',
        location: 'Sikar, Rajasthan',
        tag: 'FEATURED VENDOR',
        stats: { experience: '12 Years', method: 'Organic', size: '5 Acres' },
        story: "For Amit, farming isn't just a profession; it's a legacy. Growing up in the fertile plains, he learned the secret language of the soil early on.",
        quote: "My mission is simple: healthy living for everyone."
    },
    {
        id: 'vendor_2',
        name: 'Sita Devi',
        image: require('@/assets/images/3d-model-with-veg.png'),
        coverImage: require('@/assets/images/3d-model-with-veg.png'),
        bio: 'Pioneer in hydroponic leafy greens, ensuring fresh and pesticide-free produce.',
        location: 'Patna, Bihar',
        tag: 'TOP RATED',
        stats: { experience: '8 Years', method: 'Hydroponic', size: '2 Acres' },
        story: "Sita started with a small rooftop garden and now manages a state-of-the-art hydroponic facility.",
        quote: "Innovation is the key to sustainable agriculture."
    },
    {
        id: 'vendor_def_001', // Default Vendor ID
        name: 'Rajesh Kumar',
        image: require('@/assets/images/3d-model-with-veg.png'),
        coverImage: require('@/assets/images/3d-model-with-veg.png'),
        bio: 'Your one-stop shop for fresh, organic, and locally sourced produce.',
        location: 'Patna, Bihar',
        tag: 'NEW ARRIVAL',
        stats: { experience: '15 Years', method: 'Traditional', size: '12 Acres' },
        story: "Rajesh brings fresh produce directly from his farm to your table.",
        quote: "Quality you can trust."
    }
];

const MOCK_PRODUCTS: MarketProduct[] = [
    // Vendor 1 Products (Matches VendorContext)
    {
        id: 101,
        vendorId: 'vendor_1',
        name: 'Organic Red Carrots',
        type: 'Roots',
        price: 60, // Vendor context had 60
        unit: 'kg',
        discount: '-10%',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Fresh red carrots directly from the farm.',
        isFavorite: true,
        tag: 'Organic'
    },
    {
        id: 102,
        vendorId: 'vendor_1',
        name: 'Fresh Spinach',
        type: 'Leafy',
        price: 40,
        unit: 'bunch',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Green leafy spinach rich in iron.',
        isFavorite: false,
        tag: 'Fresh'
    },
    {
        id: 103,
        vendorId: 'vendor_1',
        name: 'Desi Tomatoes',
        type: 'Fruit Veg',
        price: 30,
        unit: 'kg',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Tangy and juicy local tomatoes.',
        isFavorite: false,
        tag: 'Local'
    },
    // Vendor 2 Products
    {
        id: 201,
        vendorId: 'vendor_2',
        name: 'Sweet Potatoes',
        type: 'Roots',
        price: 45,
        unit: 'kg',
        discount: '-40%',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Nutritious sweet potatoes, perfect for baking.',
        isFavorite: true,
        tag: 'Organic'
    },
    {
        id: 202,
        vendorId: 'vendor_2',
        name: 'Broccoli Fresh',
        type: 'Hydroponic',
        price: 80,
        unit: 'kg',
        discount: '-30%',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Crisp and green broccoli, grown hydroponically.',
        isFavorite: false,
        tag: 'Premium'
    },
    // Deals
    {
        id: 301,
        vendorId: 'vendor_1',
        name: 'Veggie Saver Pack',
        type: 'Combo',
        price: 250,
        unit: 'pack',
        discount: 'BOGO',
        specialOffer: 'Limited Time Deal',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'A value pack of essential vegetables.',
        isFavorite: false,
        tag: 'Combo'
    },
    // Fruits
    {
        id: 401,
        vendorId: 'vendor_1',
        name: 'Fresh Bananas',
        type: 'Fruit',
        price: 40,
        unit: 'doz',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Sweet and ripe bananas.',
        isFavorite: false,
        tag: 'Seasonal'
    },
    {
        id: 402,
        vendorId: 'vendor_2',
        name: 'Red Apples',
        type: 'Fruit',
        price: 120,
        unit: 'kg',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Crisp and juicy red apples.',
        isFavorite: true,
        tag: 'Bestsellers'
    },
    // Dairy
    {
        id: 501,
        vendorId: 'vendor_1',
        name: 'Fresh Milk',
        type: 'Dairy',
        price: 60,
        unit: 'L',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Pure cow milk, unpasteurized.',
        isFavorite: false,
        tag: 'Daily'
    },
    {
        id: 502,
        vendorId: 'vendor_1',
        name: 'Farm Eggs',
        type: 'Dairy',
        price: 180,
        unit: 'tray',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Free range brown eggs.',
        isFavorite: false,
        tag: 'Eggs'
    },
    // Bakery
    {
        id: 601,
        vendorId: 'vendor_2',
        name: 'Sourdough Bread',
        type: 'Bakery',
        price: 150,
        unit: 'loaf',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Freshly baked sourdough bread.',
        isFavorite: true,
        tag: 'Bread'
    },
    // Meats
    {
        id: 701,
        vendorId: 'vendor_1',
        name: 'Chicken Breast',
        type: 'Meat',
        price: 300,
        unit: 'kg',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Boneless chicken breast.',
        isFavorite: false,
        tag: 'Poultry'
    },
    // Seafood
    {
        id: 801,
        vendorId: 'vendor_2',
        name: 'Rohu Fish',
        type: 'Seafood',
        price: 250,
        unit: 'kg',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Fresh river fish.',
        isFavorite: false,
        tag: 'Fish'
    },
    // Default Vendor Initial Products (Matching VendorContext)
    {
        id: 901,
        vendorId: 'vendor_def_001',
        name: 'Organic Potato',
        type: 'Vegetables',
        price: 25,
        unit: 'kg',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Fresh organic potatoes.',
        isFavorite: false,
        tag: 'Vegetables'
    },
    {
        id: 902,
        vendorId: 'vendor_def_001',
        name: 'Red Onion',
        type: 'Vegetables',
        price: 35,
        unit: 'kg',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Pungent and flavorful red onions.',
        isFavorite: false,
        tag: 'Vegetables'
    },
    {
        id: 903,
        vendorId: 'vendor_def_001',
        name: 'Kashmiri Apple',
        type: 'Fruits',
        price: 180,
        unit: 'kg',
        image: require('@/assets/images/3d-model-with-veg.png'),
        description: 'Sweet and crunchy apples.',
        isFavorite: false,
        tag: 'Fruits'
    }
];

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

export function MarketProvider({ children }: { children: ReactNode }) {
    const [vendors] = useState<MarketVendor[]>(MOCK_VENDORS);
    const [products, setProducts] = useState<MarketProduct[]>(MOCK_PRODUCTS);
    const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);

    const addArticle = (article: Omit<Article, 'id'>) => {
        const newArticle = { ...article, id: Date.now() };
        setArticles(prev => [newArticle, ...prev]);
    };

    const addProduct = (product: Omit<MarketProduct, 'id'>) => {
        const newProduct = { ...product, id: Date.now() };
        setProducts(prev => [newProduct, ...prev]);
    };


    const toggleFavoriteProduct = (productId: number) => {
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
