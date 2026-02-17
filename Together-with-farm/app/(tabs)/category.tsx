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
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFavourites } from '@/contexts/FavouritesContext';
import { useCart } from '@/contexts/CartContext';
import { useMarket, MarketProduct } from '@/contexts/MarketContext';
import { useTheme } from '@/contexts/ThemeContext';
import CartPopup from '@/components/CartPopup';

const { width } = Dimensions.get('window');

// --- Mock Data ---

const CATEGORIES = [
    {
        id: 'vegetables',
        name: 'Veggies',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=2568&auto=format&fit=crop', // Veggies
    },
    {
        id: 'fruits',
        name: 'Fruits',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop', // Fruits
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

const categoryFilters: Record<string, string[]> = {
    vegetables: ['Roots', 'Leafy', 'Hydroponic', 'Organic', 'Fruit Veg', 'Daily', 'Vegetables'],
    fruits: ['Fruit', 'Seasonal', 'Bestsellers', 'Fruits'], // Assuming some mapping
    meats: ['Meat', 'Poultry'],
    seafood: ['Seafood', 'Fish'],
    dairy: ['Dairy', 'Eggs'],
    bakery: ['Bakery', 'Bread'],
};

export default function CategoryScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { toggleFavourite, isFavourite } = useFavourites();
    const { updateQuantity, getItemQuantity } = useCart();
    const { products } = useMarket();
    const { isDark } = useTheme();

    const [selectedCategoryId, setSelectedCategoryId] = useState('vegetables');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Filter states
    const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'name' | 'popular'>('popular');
    const [priceRange, setPriceRange] = useState<'all' | 'under-50' | '50-100' | 'above-100'>('all');
    const [showDiscountOnly, setShowDiscountOnly] = useState(false);
    const [showInStockOnly, setShowInStockOnly] = useState(false);

    const activeCategoryProducts = products.filter(p => {
        const filters = categoryFilters[selectedCategoryId] || [];
        const matchesCategory = filters.includes(p.type) || filters.some(f => p.tag?.includes(f)) || (selectedCategoryId === 'vegetables' && !['Fruit', 'Fruits', 'Meat', 'Dairy', 'Bakery', 'Seafood'].includes(p.type));
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Price filter
        let matchesPrice = true;
        if (priceRange === 'under-50') matchesPrice = p.price < 50;
        else if (priceRange === '50-100') matchesPrice = p.price >= 50 && p.price <= 100;
        else if (priceRange === 'above-100') matchesPrice = p.price > 100;

        // Discount filter
        const matchesDiscount = !showDiscountOnly || (p.discount && p.discount !== '');

        return matchesCategory && matchesSearch && matchesPrice && matchesDiscount;
    }).sort((a, b) => {
        // Sorting logic
        if (sortBy === 'price-low') {
            return a.price - b.price;
        } else if (sortBy === 'price-high') {
            return b.price - a.price;
        } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        }
        return 0; // popular (default order)
    });

    const activeFilterCount =
        (priceRange !== 'all' ? 1 : 0) +
        (showDiscountOnly ? 1 : 0) +
        (sortBy !== 'popular' ? 1 : 0);

    const resetFilters = () => {
        setSortBy('popular');
        setPriceRange('all');
        setShowDiscountOnly(false);
        setShowInStockOnly(false);
    };

    const renderCategoryItem = (item: typeof CATEGORIES[0]) => {
        const isActive = selectedCategoryId === item.id;
        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.categoryItemSidebar, isActive ? styles.activeCategorySidebar : null, isActive && isDark ? { backgroundColor: '#1E1E1E' } : null]}
                onPress={() => setSelectedCategoryId(item.id)}
                activeOpacity={0.8}
            >
                <View style={[styles.categoryIconContainer, isActive && styles.activeCategoryIconContainer, isDark && { backgroundColor: '#333', borderColor: '#444' }, isActive && isDark && { borderColor: '#1E1E1E' }]}>
                    <Image source={{ uri: item.image }} style={styles.categoryImage} contentFit="cover" />
                </View>
                <Text style={[styles.categorySidebarText, isActive && styles.activeCategorySidebarText, isDark && { color: '#AAA' }, isActive && isDark && { color: '#FFF' }]}>
                    {item.name}
                </Text>
                {isActive && <View style={[styles.activeIndicator, isDark && { backgroundColor: '#81C784' }]} />}
            </TouchableOpacity>
        );
    };

    const renderProductItem = ({ item }: { item: MarketProduct }) => {
        const qty = getItemQuantity(item.id);

        return (
            <TouchableOpacity
                style={[styles.productCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.9}
            >
                <View style={[styles.productImageContainer, isDark && { backgroundColor: '#333' }]}>
                    <Image source={item.image} style={styles.productImage} contentFit="cover" />
                    {item.discount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{item.discount}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.favoriteButton, isDark && { backgroundColor: '#333' }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            toggleFavourite(item.id);
                        }}
                    >
                        <Ionicons
                            name={isFavourite(item.id) ? "heart" : "heart-outline"}
                            size={18}
                            color={isFavourite(item.id) ? "#FF4B4B" : (isDark ? "#FFF" : "#1A1A1A")}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.productInfo}>
                    <Text style={[styles.tagText, isDark && { color: '#AAA' }]}>{item.tag || item.type}</Text>
                    <Text style={[styles.productTitle, isDark && { color: '#FFF' }]} numberOfLines={1}>{item.name}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
                        <Text style={[styles.priceText, isDark && { color: '#81C784' }]}>₹{item.price}</Text>
                        <Text style={[styles.unitText, isDark && { color: '#AAA' }]}>/{item.unit}</Text>
                    </View>

                    {qty === 0 ? (
                        <TouchableOpacity
                            style={[styles.addButton, isDark && { backgroundColor: '#3E5E3E' }]}
                            onPress={() => updateQuantity(item.id, 1)}
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.qtyControl, isDark && { backgroundColor: '#3E5E3E' }]}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => updateQuantity(item.id, -1)}
                            >
                                <Ionicons name="remove" size={14} color="#fff" />
                            </TouchableOpacity>
                            <Text style={styles.qtyText} numberOfLines={1}>{qty}</Text>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => updateQuantity(item.id, 1)}
                            >
                                <Ionicons name="add" size={14} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, isDark && { backgroundColor: '#1E1E1E' }]}>
                <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Categories</Text>
                <TouchableOpacity
                    style={[styles.iconButton, isDark && { backgroundColor: '#333' }]}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Ionicons name="options-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                <Ionicons name="search-outline" size={20} color={isDark ? '#AAA' : '#666'} style={styles.searchIcon} />
                <TextInput
                    placeholder="Search veggies"
                    placeholderTextColor={isDark ? '#888' : '#999'}
                    style={[styles.searchInput, isDark && { color: '#FFF' }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Main Content Split View */}
            <View style={styles.mainContent}>
                {/* Left Sidebar */}
                <View style={[styles.sidebarContainer, isDark && { backgroundColor: '#121212', borderRightWidth: 1, borderRightColor: '#333' }]}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.sidebarContent}
                    >
                        {CATEGORIES.map(renderCategoryItem)}
                    </ScrollView>
                </View>

                {/* Right Product Grid */}
                <View style={[styles.gridContainer, isDark && { backgroundColor: '#121212' }]}>
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
                                <Text style={[styles.emptyText, isDark && { color: '#AAA' }]}>No products found.</Text>
                            </View>
                        )}
                        // Add extra padding at bottom for floating cart
                        ListFooterComponent={<View style={{ height: 80 }} />}
                    />
                </View>
            </View>

            {/* Floating Cart Popup */}
            <CartPopup />

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={[styles.modalOverlay, isDark && { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                    <View style={[styles.modalContent, isDark && { backgroundColor: '#1E1E1E' }]}>
                        {/* Modal Header */}
                        <View style={[styles.modalHeader, isDark && { borderBottomColor: '#333' }]}>
                            <Text style={[styles.modalTitle, isDark && { color: '#FFF' }]}>Filters & Sort</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={28} color={isDark ? '#FFF' : '#1A1A1A'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Sort By Section */}
                            <View style={[styles.filterSection, isDark && { borderBottomColor: '#333' }]}>
                                <Text style={[styles.filterSectionTitle, isDark && { color: '#AAA' }]}>Sort By</Text>
                                <View style={styles.filterOptions}>
                                    {['popular', 'price-low', 'price-high', 'name'].map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[styles.filterOption, sortBy === option && styles.filterOptionActive, isDark && { backgroundColor: '#333', borderColor: '#444' }, sortBy === option && isDark && { borderColor: '#1F5E2E', backgroundColor: '#333' }]}
                                            onPress={() => setSortBy(option as any)}
                                        >
                                            <Ionicons
                                                name={sortBy === option ? "radio-button-on" : "radio-button-off"}
                                                size={20}
                                                color={sortBy === option ? "#1F5E2E" : "#999"}
                                            />
                                            <Text style={[styles.filterOptionText, sortBy === option && styles.filterOptionTextActive, isDark && { color: '#FFF' }]}>
                                                {option === 'popular' && 'Most Popular'}
                                                {option === 'price-low' && 'Price: Low to High'}
                                                {option === 'price-high' && 'Price: High to Low'}
                                                {option === 'name' && 'Name (A-Z)'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Price Range Section */}
                            <View style={[styles.filterSection, isDark && { borderBottomColor: '#333' }]}>
                                <Text style={[styles.filterSectionTitle, isDark && { color: '#AAA' }]}>Price Range</Text>
                                <View style={styles.filterOptions}>
                                    {['all', 'under-50', '50-100', 'above-100'].map((range) => (
                                        <TouchableOpacity
                                            key={range}
                                            style={[styles.filterOption, priceRange === range && styles.filterOptionActive, isDark && { backgroundColor: '#333', borderColor: '#444' }, priceRange === range && isDark && { borderColor: '#1F5E2E', backgroundColor: '#333' }]}
                                            onPress={() => setPriceRange(range as any)}
                                        >
                                            <Ionicons
                                                name={priceRange === range ? "radio-button-on" : "radio-button-off"}
                                                size={20}
                                                color={priceRange === range ? "#1F5E2E" : "#999"}
                                            />
                                            <Text style={[styles.filterOptionText, priceRange === range && styles.filterOptionTextActive, isDark && { color: '#FFF' }]}>
                                                {range === 'all' && 'All Prices'}
                                                {range === 'under-50' && 'Under ₹50'}
                                                {range === '50-100' && '₹50 - ₹100'}
                                                {range === 'above-100' && 'Above ₹100'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Other Filters */}
                            <View style={styles.filterSection}>
                                <Text style={[styles.filterSectionTitle, isDark && { color: '#AAA' }]}>Other Filters</Text>
                                <TouchableOpacity
                                    style={[styles.filterOption, showDiscountOnly && styles.filterOptionActive, isDark && { backgroundColor: '#333', borderColor: '#444' }, showDiscountOnly && isDark && { borderColor: '#1F5E2E', backgroundColor: '#333' }]}
                                    onPress={() => setShowDiscountOnly(!showDiscountOnly)}
                                >
                                    <Ionicons
                                        name={showDiscountOnly ? "checkbox" : "square-outline"}
                                        size={20}
                                        color={showDiscountOnly ? "#1F5E2E" : "#999"}
                                    />
                                    <Text style={[styles.filterOptionText, showDiscountOnly && styles.filterOptionTextActive, isDark && { color: '#FFF' }]}>
                                        Show Discounted Items Only
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        {/* Modal Footer */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={resetFilters}
                            >
                                <Text style={styles.resetButtonText}>Reset All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => setShowFilterModal(false)}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        width: '100%',
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
        gap: 4,
        width: '100%',
        maxWidth: '100%',
        justifyContent: 'space-between',
    },
    qtyBtn: {
        width: 24,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    qtyText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
        fontSize: 13,
        flex: 1,
        textAlign: 'center',
        minWidth: 20,
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

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    filterSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    filterSectionTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    filterOptions: {
        gap: 8,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        gap: 12,
    },
    filterOptionActive: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#1F5E2E',
    },
    filterOptionText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#666',
        flex: 1,
    },
    filterOptionTextActive: {
        color: '#1F5E2E',
        fontFamily: 'DMSans_700Bold',
    },
    modalFooter: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1F5E2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButtonText: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    applyButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#1F5E2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonText: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#fff',
    },
});
