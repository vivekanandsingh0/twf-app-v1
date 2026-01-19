import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFavourites } from '@/contexts/FavouritesContext';

const { width } = Dimensions.get('window');

// --- Mock Data ---

const CATEGORIES = [
    {
        id: 'fruits',
        name: 'Fruits',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop', // Fruits
    },
    {
        id: 'vegetables',
        name: 'Veggies',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2568&auto=format&fit=crop', // Veggies
    },
    {
        id: 'meats',
        name: 'Meats',
        image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=2670&auto=format&fit=crop', // Meat
    },
    {
        id: 'seafood',
        name: 'Seafood',
        image: 'https://images.unsplash.com/photo-1615141982880-19ed7e6642f3?q=80&w=2564&auto=format&fit=crop', // Seafood
    },
    {
        id: 'dairy',
        name: 'Dairy & Eggs',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=2574&auto=format&fit=crop', // Dairy
    },
    {
        id: 'bakery',
        name: 'Bakery',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2672&auto=format&fit=crop', // Bakery
    },
];

const PRODUCTS = [
    {
        id: 1,
        categoryId: 'vegetables',
        title: 'Sweet Potatoes',
        price: 1.79,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?q=80&w=2574&auto=format&fit=crop', // Sweet potato
        discount: 40,
        tag: 'Organic',
        isFavorite: true,
    },
    {
        id: 2,
        categoryId: 'vegetables',
        title: 'Corn',
        price: 5.49,
        unit: 'each',
        image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2670&auto=format&fit=crop', // Corn
        discount: 30,
        tag: 'Fresh',
        isFavorite: false,
    },
    {
        id: 3,
        categoryId: 'vegetables',
        title: 'Parsley',
        price: 4.29,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=2630&auto=format&fit=crop', // Parsley
        discount: 30,
        tag: 'Organic',
        isFavorite: false,
    },
    {
        id: 11,
        categoryId: 'vegetables',
        title: 'Tomatoes',
        price: 2.99,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2574&auto=format&fit=crop',
        discount: 10,
        tag: 'Fresh',
        isFavorite: true,
    },
    {
        id: 4,
        categoryId: 'fruits',
        title: 'Bananas',
        price: 0.99,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=2574&auto=format&fit=crop',
        discount: 0,
        tag: 'Fresh',
        isFavorite: true,
    },
    {
        id: 5,
        categoryId: 'fruits',
        title: 'Red Apples',
        price: 2.99,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=2674&auto=format&fit=crop',
        discount: 10,
        tag: 'Local',
        isFavorite: false,
    },
    {
        id: 12,
        categoryId: 'fruits',
        title: 'Strawberries',
        price: 4.99,
        unit: 'box',
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=2670&auto=format&fit=crop',
        discount: 15,
        tag: 'Sweet',
        isFavorite: true,
    },
    {
        id: 13,
        categoryId: 'fruits',
        title: 'Watermelon',
        price: 5.99,
        unit: 'each',
        image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?q=80&w=2670&auto=format&fit=crop',
        discount: 20,
        tag: 'Seasonal',
        isFavorite: false,
    },
    {
        id: 6,
        categoryId: 'meats',
        title: 'Chicken Breast',
        price: 6.99,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=2574&auto=format&fit=crop',
        discount: 0,
        tag: 'Fresh',
        isFavorite: false,
    },
    {
        id: 14,
        categoryId: 'meats',
        title: 'Ground Beef',
        price: 5.49,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1613454320434-eca721df222a?q=80&w=2670&auto=format&fit=crop',
        discount: 10,
        tag: 'Organic',
        isFavorite: false,
    },
    {
        id: 7,
        categoryId: 'seafood',
        title: 'Salmon Fillet',
        price: 12.99,
        unit: 'each',
        image: 'https://images.unsplash.com/photo-1601314167099-232775b3d6fd?q=80&w=2672&auto=format&fit=crop', // Corrected Salmon image
        discount: 5,
        tag: 'Wild Caught',
        isFavorite: true,
    },
    {
        id: 15,
        categoryId: 'seafood',
        title: 'Shrimp',
        price: 14.99,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=2670&auto=format&fit=crop',
        discount: 0,
        tag: 'Frozen',
        isFavorite: false,
    },
    {
        id: 8,
        categoryId: 'dairy',
        title: 'Whole Milk',
        price: 3.49,
        unit: 'gal',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=2565&auto=format&fit=crop',
        discount: 0,
        tag: 'Fresh',
        isFavorite: false,
    },
    {
        id: 16,
        categoryId: 'dairy',
        title: 'Organic Eggs',
        price: 4.99,
        unit: 'doz',
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=2670&auto=format&fit=crop',
        discount: 0,
        tag: 'Free Range',
        isFavorite: true,
    },
    {
        id: 9,
        categoryId: 'bakery',
        title: 'Sourdough Bread',
        price: 5.99,
        unit: 'loaf',
        image: 'https://images.unsplash.com/photo-1585476644321-b9762181d164?q=80&w=2670&auto=format&fit=crop',
        discount: 0,
        tag: 'Fresh Baked',
        isFavorite: false,
    },
    {
        id: 17,
        categoryId: 'bakery',
        title: 'Croissants',
        price: 3.99,
        unit: '4pk',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=2526&auto=format&fit=crop',
        discount: 0,
        tag: 'Butter',
        isFavorite: true,
    },
];

export default function CategoryScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { toggleFavourite, isFavourite } = useFavourites();
    const [selectedCategoryId, setSelectedCategoryId] = useState('vegetables');
    const [searchQuery, setSearchQuery] = useState('');
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    const totalCartItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

    const updateQuantity = (id: number, delta: number) => {
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

    const getItemQuantity = (id: number) => quantities[id] || 0;

    const activeCategoryProducts = PRODUCTS.filter(
        p => p.categoryId === selectedCategoryId && p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCategoryItem = (item: typeof CATEGORIES[0]) => {
        const isActive = selectedCategoryId === item.id;
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.categoryItemSidebar, isActive && styles.activeCategorySidebar]}
                onPress={() => setSelectedCategoryId(item.id)}
                activeOpacity={0.8}
            >
                <View style={[styles.categoryIconContainer, isActive && styles.activeCategoryIconContainer]}>
                    <Image source={{ uri: item.image }} style={styles.categoryImage} contentFit="cover" />
                </View>
                <Text style={[styles.categorySidebarText, isActive && styles.activeCategorySidebarText]}>
                    {item.name}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
        );
    };

    const renderProductItem = ({ item }: { item: typeof PRODUCTS[0] }) => {
        const qty = getItemQuantity(item.id);

        return (
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.9}
            >
                <View style={styles.productImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.productImage} contentFit="cover" />
                    {item.discount > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{item.discount}%</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            toggleFavourite(item.id);
                        }}
                    >
                        <Ionicons
                            name={isFavourite(item.id) ? "heart" : "heart-outline"}
                            size={18}
                            color={isFavourite(item.id) ? "#FF4B4B" : "#1A1A1A"}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.productInfo}>
                    <Text style={styles.tagText}>{item.tag}</Text>
                    <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>

                    <View style={styles.priceRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={styles.priceText}>${item.price}</Text>
                            <Text style={styles.unitText}>/{item.unit}</Text>
                        </View>

                        {qty === 0 ? (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => updateQuantity(item.id, 1)}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.qtyControl}>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item.id, -1)}
                                >
                                    <Ionicons name="remove" size={14} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{qty}</Text>
                                <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() => updateQuantity(item.id, 1)}
                                >
                                    <Ionicons name="add" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Categories</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="options-outline" size={24} color="#1A1A1A" />
                    <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search veggies"
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Main Content Split View */}
            <View style={styles.mainContent}>
                {/* Left Sidebar */}
                <View style={styles.sidebarContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.sidebarContent}
                    >
                        {CATEGORIES.map(renderCategoryItem)}
                    </ScrollView>
                </View>

                {/* Right Product Grid */}
                <View style={styles.gridContainer}>
                    <FlatList
                        data={activeCategoryProducts}
                        renderItem={renderProductItem}
                        keyExtractor={item => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                        contentContainerStyle={styles.gridContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No products found.</Text>
                            </View>
                        )}
                        // Add extra padding at bottom for floating cart
                        ListFooterComponent={<View style={{ height: 80 }} />}
                    />
                </View>
            </View>

            {/* Floating Cart Popup */}
            {totalCartItems > 0 && (
                <View style={styles.cartPopupContainer}>
                    <TouchableOpacity style={styles.cartPopup} activeOpacity={0.9}>
                        <View style={styles.cartImages}>
                            {/* Show thumbnails of up to 2 random items */}
                            <Image source={{ uri: PRODUCTS[0].image }} style={[styles.tinyThumb, { left: 0, zIndex: 3 }]} />
                            <Image source={{ uri: PRODUCTS[1].image }} style={[styles.tinyThumb, { left: 15, zIndex: 2 }]} />
                            <View style={[styles.tinyThumb, styles.moreThumb, { left: 30, zIndex: 1 }]}>
                                <Text style={styles.moreText}>..</Text>
                            </View>
                        </View>
                        <Text style={styles.viewCartText}>View Cart</Text>
                        <View style={styles.cartBadgeCount}>
                            <Text style={styles.cartCountText}>{totalCartItems}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#1F5E2E',
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: '#1A1A1A',
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
    },
    // Sidebar Styles
    sidebarContainer: {
        width: 90,
        backgroundColor: '#F7F7F7',
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    sidebarContent: {
        paddingTop: 0,
        paddingBottom: 20,
    },
    categoryItemSidebar: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        position: 'relative',
    },
    activeCategorySidebar: {
        backgroundColor: '#fff',
    },
    categoryIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#fff',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        elevation: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeCategoryIconContainer: {
        borderColor: '#fff',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categorySidebarText: {
        fontSize: 11,
        fontFamily: 'DMSans_500Medium',
        color: '#333',
        textAlign: 'center',
    },
    activeCategorySidebarText: {
        color: '#1A1A1A',
        fontFamily: 'DMSans_700Bold',
    },
    activeIndicator: {
        position: 'absolute',
        right: 0,
        top: 25,
        bottom: 25,
        width: 4,
        backgroundColor: '#1F5E2E',
        borderRadius: 2,
        height: 50,
    },

    // Grid Styles
    gridContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    gridContent: {
        padding: 16,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    productImageContainer: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productInfo: {
        paddingHorizontal: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#666',
        fontFamily: 'DMSans_400Regular',
        marginBottom: 2,
    },
    productTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    priceText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    unitText: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
    },
    addButton: {
        backgroundColor: '#1F5E2E',
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F5E2E',
        borderRadius: 8,
        height: 32,
        paddingHorizontal: 4,
        gap: 6,
    },
    qtyBtn: {
        width: 20,
        height: 32, // Full height of control
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
        fontSize: 14,
        marginHorizontal: 2,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
    },

    // Cart Popup Styles (from MarketScreen)
    cartPopupContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    cartPopup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 12,
        boxShadow: '0px 4px 15px rgba(31, 94, 46, 0.4)',
        elevation: 8,
        minWidth: 160,
    },
    cartImages: {
        width: 50,
        height: 30,
        position: 'relative',
        marginRight: 8,
    },
    tinyThumb: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#1F5E2E',
        position: 'absolute',
        top: 0,
        backgroundColor: '#fff',
    },
    moreThumb: {
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreText: {
        fontSize: 10,
        color: '#1F5E2E',
        fontWeight: 'bold',
    },
    viewCartText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
    },
    cartBadgeCount: {
        backgroundColor: '#fff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 'auto',
    },
    cartCountText: {
        color: '#1F5E2E',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
