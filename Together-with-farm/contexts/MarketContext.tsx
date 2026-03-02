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
    discountValue?: number; // numeric discount percentage from DB
    specialOffer?: string; // e.g. 'Limited Time Deal'
    image: any;
    images: string[];
    description: string;
    isFavorite: boolean;
    tag?: string; // Additional tag like 'Organic'
    highlights?: { title: string; value: string }[];
    order_type?: 'instant' | 'pre-order';
    preorder_duration?: number;
}

export interface Article {
    id: string;
    title: string;
    category: string;
    time: string;
    image: any;
    image_url?: string;
    type?: string;
    tag?: string;
    content?: string;
    section_id?: string | null;
}

export interface FeedSection {
    id: string;
    name: string;
    description?: string | null;
    display_order: number;
    is_active: boolean;
}

export interface Category {
    id: string;
    name: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// Define type for fetched market sections
export interface MarketSection {
    id: string;
    name: string;
    display_order: number;
    is_active: boolean;
    products: MarketProduct[];
}

export interface MarketContextType {
    vendors: MarketVendor[];
    products: MarketProduct[];
    articles: Article[];
    feedSections: FeedSection[];
    marketSections: MarketSection[]; // ADDED
    categories: Category[]; // ADDED
    addArticle: (article: Omit<Article, 'id'>) => void;
    addProduct: (product: Omit<MarketProduct, 'id'>) => void;
    toggleFavoriteProduct: (productId: string) => void;
    refreshMarketData: () => Promise<void>; // ADDED
}

// --- Mock Data ---

const MOCK_VENDORS: MarketVendor[] = []; // (Kept empty or reduced if needed, but context didn't change vendors much)
// ... keeping existing MOCK_VENDORS for now as we are focusing on PRODUCTS

const MOCK_PRODUCTS: MarketProduct[] = []; // We will load from API

const FALLBACK_ARTICLES: Article[] = [
    {
        id: 'mock-1',
        title: 'How to Keep Fruits Fresh Longer',
        category: 'Storage Tips',
        time: '4 mins',
        image: require('@/assets/images/3d-model-with-veg.png'),
        type: 'Tips'
    },
    {
        id: 'mock-2',
        title: 'Top 10 Rich Nutrition Foods',
        category: 'Nutrition',
        time: '6 mins',
        image: require('@/assets/images/3d-model-with-veg.png'),
        type: 'Health'
    },
    {
        id: 'mock-3',
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
    const [vendors, setVendors] = useState<MarketVendor[]>([]);
    const [products, setProducts] = useState<MarketProduct[]>([]);
    const [articles, setArticles] = useState<Article[]>(FALLBACK_ARTICLES);
    const [feedSections, setFeedSections] = useState<FeedSection[]>([]);
    const [marketSections, setMarketSections] = useState<MarketSection[]>([]); // ADDED state
    const [categories, setCategories] = useState<Category[]>([]); // ADDED state

    const fetchMarketData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [{ data: vData }, { data: sData }] = await Promise.all([
                supabase.from('profiles').select('*').eq('user_type', 'Vendor'),
                supabase.from('vendor_spotlights').select('vendor_id').eq('is_active', true).lte('start_date', today).gte('end_date', today)
            ]);

            const activeSpotlightVendorIds = sData ? sData.map(s => s.vendor_id) : [];

            if (vData) {
                const mappedVendors: MarketVendor[] = vData.map((v: any) => {
                    const vendorImage = v.profile_image || v.avatar_url
                        ? { uri: v.profile_image || v.avatar_url }
                        : require('@/assets/images/3d-model-with-veg.png');
                    const isSpotlight = activeSpotlightVendorIds.includes(v.id);
                    return {
                        id: v.id,
                        name: v.business_name || v.full_name || 'Vendor',
                        image: vendorImage,
                        coverImage: vendorImage,
                        bio: v.bio || '',
                        location: v.address || 'India',
                        tag: isSpotlight ? 'FEATURED VENDOR' : (v.shop_status === 'Active' ? 'VENDOR' : ''),
                        stats: { experience: v.experience || 'N/A', method: 'Organic', size: v.farm_size || 'N/A' },
                        story: v.bio || '',
                        quote: "Fresh from farm to your table."
                    };
                });
                setVendors(mappedVendors);
            }

            // 2. Fetch Products
            const { data: pData } = await supabase.from('products').select('*').gt('stock', 0);
            let mappedProducts: MarketProduct[] = [];
            if (pData) {
                mappedProducts = pData.map((p: any) => {
                    let productImages = p.images || [];
                    if (typeof productImages === 'string') {
                        try { productImages = JSON.parse(productImages); } catch (e) { productImages = []; }
                    }
                    if (!Array.isArray(productImages)) productImages = [];
                    if (productImages.length === 0 && p.image_url) productImages.push(p.image_url);

                    const baseImgUri = productImages.length > 0 ? productImages[0].replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev') : null;
                    const primaryImage = baseImgUri ? { uri: baseImgUri } : require('@/assets/images/3d-model-with-veg.png');

                    return {
                        id: p.id, vendorId: p.vendor_id, name: p.name, type: p.category || 'Vegetables', price: p.price,
                        unit: p.unit || 'kg', discount: p.discount > 0 ? `-${p.discount}%` : undefined, discountValue: p.discount || 0,
                        image: primaryImage, images: productImages.map((i: string) => i.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev')),
                        description: p.description || '', isFavorite: false, tag: p.stock < 5 ? 'Low Stock' : 'Fresh',
                        highlights: p.highlights || [], order_type: p.order_type || 'instant', preorder_duration: p.preorder_duration || 0,
                    };
                });
                setProducts(mappedProducts);
            }

            // 3. Fetch Market Sections & Mappings
            const { data: sectionsData } = await supabase.from('market_sections').select('*').eq('is_active', true).order('display_order');
            const { data: mappingsData } = await supabase.from('market_section_products').select('*');

            if (sectionsData) {
                const finalSections: MarketSection[] = sectionsData.map(sec => {
                    const matchedProductIds = (mappingsData || []).filter(m => m.section_id === sec.id).map(m => m.product_id);
                    const matchedProducts = mappedProducts.filter(p => matchedProductIds.includes(p.id));
                    return { ...sec, products: matchedProducts };
                });
                setMarketSections(finalSections);
            }

            // 4. Fetch Categories
            const { data: catData } = await supabase.from('categories').select('*').eq('is_active', true).order('display_order');
            if (catData) setCategories(catData);

        } catch (e) {
            console.error("Failed to fetch market data:", e);
        };
    };

    // Keep subscriptions exactly as is underneath
    useEffect(() => {
        fetchMarketData();

        // Realtime subscription for vendor updates
        const vendorSubscription = supabase
            .channel('market:vendors')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchMarketData)
            .subscribe();

        return () => {
            supabase.removeChannel(vendorSubscription);
        };
    }, []);

    // FETCH PRODUCTS FROM SUPABASE
    useEffect(() => {
        // Realtime subscription for new products
        const subscription = supabase
            .channel('market:products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchMarketData)
            .subscribe();

        // Realtime subscription for market sections
        const sectionsSubscription = supabase
            .channel('market:sections')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'market_sections' }, fetchMarketData)
            .subscribe();

        // Realtime subscription for market section products mapping
        const mappingSubscription = supabase
            .channel('market:section_products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'market_section_products' }, fetchMarketData)
            .subscribe();

        // Realtime subscription for categories
        const categoriesSubscription = supabase
            .channel('market:categories')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchMarketData)
            .subscribe();

        // Realtime subscription for vendor spotlights
        const spotlightsSubscription = supabase
            .channel('market:spotlights')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_spotlights' }, fetchMarketData)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
            supabase.removeChannel(sectionsSubscription);
            supabase.removeChannel(mappingSubscription);
            supabase.removeChannel(categoriesSubscription);
            supabase.removeChannel(spotlightsSubscription);
        };
    }, []);

    // FETCH ARTICLES FROM SUPABASE
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    const mapped: Article[] = data.map((a: any) => ({
                        id: a.id,
                        title: a.title,
                        category: a.category,
                        time: a.time,
                        image: a.image_url ? { uri: a.image_url.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev') } : require('@/assets/images/3d-model-with-veg.png'),
                        image_url: a.image_url ? a.image_url.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev') : undefined,
                        type: a.type,
                        tag: a.tag,
                        content: a.content,
                        section_id: a.section_id ?? null,   // ← was missing!
                    }));
                    setArticles(mapped);
                }
                // If no articles in DB, fallback articles remain
            } catch (e) {
                console.error('Failed to fetch articles', e);
                // Keep fallback articles on error
            }
        };

        fetchArticles();

        // Realtime: refresh when admin publishes/unpublishes
        const articleSub = supabase
            .channel('market:articles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
                fetchArticles();
            })
            .subscribe();

        return () => { supabase.removeChannel(articleSub); };
    }, []);

    const addArticle = (article: Omit<Article, 'id'>) => {
        const newArticle = { ...article, id: `local_${Date.now()}` };
        setArticles(prev => [newArticle, ...prev]);
    };

    // FETCH FEED SECTIONS FROM SUPABASE
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const { data, error } = await supabase
                    .from('feed_sections')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });
                if (!error && data) setFeedSections(data as FeedSection[]);
            } catch (e) {
                console.error('Failed to fetch feed sections', e);
            }
        };

        fetchSections();

        const sectionSub = supabase
            .channel('market:feed_sections')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_sections' }, () => {
                fetchSections();
            })
            .subscribe();

        return () => { supabase.removeChannel(sectionSub); };
    }, []);

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
            feedSections,
            marketSections,
            categories,
            addArticle,
            addProduct,
            toggleFavoriteProduct,
            refreshMarketData: fetchMarketData
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
