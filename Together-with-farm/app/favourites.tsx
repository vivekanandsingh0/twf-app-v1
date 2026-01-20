import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFavourites } from '@/contexts/FavouritesContext';

const { width } = Dimensions.get('window');

// Comprehensive product list from both Category and Market screens
const ALL_PRODUCTS = [
    // Category Screen Products
    {
        id: 1,
        categoryId: 'vegetables',
        title: 'Sweet Potatoes',
        price: 1.79,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?q=80&w=2574&auto=format&fit=crop',
        discount: 40,
        tag: 'Organic',
    },
    {
        id: 2,
        categoryId: 'vegetables',
        title: 'Fresh Sweet Corn',
        price: 4.29,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2670&auto=format&fit=crop',
        discount: 30,
        tag: 'Fresh',
    },
    {
        id: 3,
        categoryId: 'vegetables',
        title: 'Parsley',
        price: 4.29,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=2630&auto=format&fit=crop',
        discount: 30,
        tag: 'Organic',
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
    },
    {
        id: 7,
        categoryId: 'seafood',
        title: 'Salmon Fillet',
        price: 12.99,
        unit: 'each',
        image: 'https://images.unsplash.com/photo-1601314167099-232775b3d6fd?q=80&w=2672&auto=format&fit=crop',
        discount: 5,
        tag: 'Wild Caught',
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
    },
    // Market Screen Products (200 series)
    {
        id: 201,
        categoryId: 'vegetables',
        title: 'Sweet Potatoes',
        price: 1.79,
        unit: 'lb',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyN5y-txNHOqaxZJy4yWA4lK_oiEQxjmX3xg&s',
        discount: 40,
        tag: 'Roots',
    },
    {
        id: 202,
        categoryId: 'vegetables',
        title: 'Broccoli Fresh Green',
        price: 3.29,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=2601&auto=format&fit=crop',
        discount: 30,
        tag: 'Hydroponic',
    },
    {
        id: 203,
        categoryId: 'vegetables',
        title: 'Fresh Parsley',
        price: 1.49,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2574&auto=format&fit=crop',
        discount: 30,
        tag: 'Organic',
    },
    {
        id: 204,
        categoryId: 'vegetables',
        title: 'Organic Spinach',
        price: 2.49,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=2574&auto=format&fit=crop',
        discount: 20,
        tag: 'Leafy',
    },
    {
        id: 205,
        categoryId: 'vegetables',
        title: 'Fresh Lettuce',
        price: 1.99,
        unit: 'head',
        image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=2574&auto=format&fit=crop',
        discount: 15,
        tag: 'Hydroponic',
    },
    {
        id: 206,
        categoryId: 'vegetables',
        title: 'Red Tomatoes',
        price: 2.99,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2574&auto=format&fit=crop',
        discount: 10,
        tag: 'Daily',
    },
    {
        id: 207,
        categoryId: 'vegetables',
        title: 'Crunchy Carrots',
        price: 1.49,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=2574&auto=format&fit=crop',
        discount: 25,
        tag: 'Roots',
    },
    {
        id: 208,
        categoryId: 'vegetables',
        title: 'Red Onions',
        price: 1.29,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=2574&auto=format&fit=crop',
        discount: 5,
        tag: 'Roots',
    },
    {
        id: 209,
        categoryId: 'vegetables',
        title: 'Bell Peppers',
        price: 3.49,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1563565375-f3fdf5dbc240?q=80&w=2574&auto=format&fit=crop',
        discount: 15,
        tag: 'Daily',
    },
    {
        id: 210,
        categoryId: 'fruits',
        title: 'Fresh Strawberries',
        price: 4.99,
        unit: 'box',
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=2670&auto=format&fit=crop',
        discount: 20,
        tag: 'Fruit',
    },
    {
        id: 211,
        categoryId: 'fruits',
        title: 'Sweet Watermelon',
        price: 5.99,
        unit: 'each',
        image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?q=80&w=2670&auto=format&fit=crop',
        discount: 0,
        tag: 'Season',
    },
    // Market Deal Products
    {
        id: 101,
        categoryId: 'vegetables',
        title: 'Veggie Saver Pack',
        price: 12.99,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2680&auto=format&fit=crop',
        discount: 50,
        tag: 'Combo',
    },
    {
        id: 102,
        categoryId: 'fruits',
        title: 'Summer Fruit Basket',
        price: 15.49,
        unit: 'basket',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop',
        discount: 50,
        tag: 'Seasonal',
    },
];

export default function FavouritesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { favourites, toggleFavourite, isFavourite } = useFavourites();

    const favouriteProducts = ALL_PRODUCTS.filter(p => isFavourite(p.id));

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Favourites</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.notificationBtn, { marginLeft: 8 }]}
                        onPress={() => router.push('/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {favouriteProducts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="heart-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No favourites yet</Text>
                        <Text style={styles.emptySubtext}>Start adding products you love!</Text>
                    </View>
                ) : (
                    <View style={styles.productsGrid}>
                        {favouriteProducts.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.productCard}
                                onPress={() => router.push(`/product/${item.id}`)}
                                activeOpacity={0.9}
                            >
                                <View style={styles.productImageContainer}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={styles.productImage}
                                        contentFit="cover"
                                    />
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
                                            name="heart"
                                            size={20}
                                            color="#FF4B4B"
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

                                        <TouchableOpacity style={styles.addButton}>
                                            <Ionicons name="add" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
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
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#1F5E2E',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontFamily: 'DMSans_700Bold',
        lineHeight: 10,
    },
    content: {
        paddingHorizontal: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
        marginTop: 8,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    productImageContainer: {
        width: '100%',
        height: 120,
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
});
