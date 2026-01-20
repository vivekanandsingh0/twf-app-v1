import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Share,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useCart } from '@/contexts/CartContext';
import CartPopup from '@/components/CartPopup';

const { width } = Dimensions.get('window');

// Reusing data from category page, extended with details
const PRODUCTS_DATA = [
    {
        id: 1,
        categoryId: 'vegetables',
        title: 'Sweet Potatoes',
        price: 1.79,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?q=80&w=2574&auto=format&fit=crop',
        discount: 40,
        tag: 'Organic',
        isFavorite: true,
        description: 'Sweet potatoes are rich in fiber, vitamins, and minerals. They are also high in antioxidants that protect your body from free radical damage and chronic disease.',
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
        isFavorite: false,
        description: 'Crispy, juicy, and naturally sweet great for grilling, boiling or roasting. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
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
        isFavorite: false,
        description: 'Parsley is a popular herb often used to garnish dishes, but it includes many healthy nutrients like Vitamin K.',
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
        description: 'Fresh, juicy tomatoes perfect for salads, sauces, and sandwiches.',
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
        description: 'Rich in potassium and perfect for a quick snack or smoothie.',
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
        description: 'Crisp and sweet red apples, locally sourced from best orchards.',
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
        description: 'Sweet and juicy strawberries, perfect for desserts or snacking.',
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
        description: 'Refreshing and hydrating watermelon, a summer favorite.',
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
        description: 'Lean and tender chicken breast, ideal for grilling or baking.',
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
        description: 'High quality ground beef, perfect for burgers, tacos, and pastoral dishes.',
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
        isFavorite: true,
        description: 'Rich in Omega-3 fatty acids, this wild caught salmon is perfect for a healthy dinner.',
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
        description: 'Plump and juicy shrimp, great for stir-fries, pasta, or cocktails.',
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
        description: 'Fresh whole milk, rich in calcium and vitamins.',
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
        description: 'Free range organic eggs from happy hens.',
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
        description: 'Artisan sourdough bread with a crispy crust and soft chewy center.',
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
        description: 'Buttery, flaky croissants made with traditional french methods.',
    },
    // --- Market Screen Products ---
    {
        id: 201,
        categoryId: 'vegetables',
        title: 'Sweet Potatoes',
        price: 1.79,
        unit: 'lb',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyN5y-txNHOqaxZJy4yWA4lK_oiEQxjmX3xg&s',
        discount: 40,
        tag: 'Roots',
        isFavorite: true,
        description: 'Nutritious sweet potatoes, perfect for baking or mashing.',
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
        isFavorite: false,
        description: 'Crisp and green broccoli, grown hydroponically for maximum freshness.',
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
        isFavorite: false,
        description: 'Aromatic fresh parsley, essential for garnishing and cooking.',
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
        isFavorite: true,
        description: 'Tender organic spinach leaves, rich in iron and vitamins.',
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
        isFavorite: false,
        description: 'Crisp lettuce head, clean and ready for your salads.',
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
        isFavorite: false,
        description: 'Plump red tomatoes, a kitchen staple for sauces and salads.',
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
        isFavorite: true,
        description: 'Sweet and crunchy carrots, great for snacking or cooking.',
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
        isFavorite: false,
        description: 'Flavorful red onions to add zest to your dishes.',
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
        isFavorite: false,
        description: 'Colorful bell peppers, crisp and sweet.',
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
        isFavorite: true,
        description: 'Juicy fresh strawberries, a delightful treat.',
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
        isFavorite: false,
        description: 'Big sweet watermelon, the taste of summer.',
    },
    // Deals
    {
        id: 101,
        categoryId: 'vegetables',
        title: 'Veggie Saver Pack',
        price: 12.99,
        unit: 'pack',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2680&auto=format&fit=crop',
        discount: 50,
        tag: 'Combo',
        isFavorite: true,
        description: 'A value pack of essential vegetables to save you money.',
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
        isFavorite: true,
        description: 'A basket full of the best summer fruits.',
    },
];

// Helper to get product by ID (simulating database)
const getProduct = (id: string | string[]) => {
    const productId = Number(id);
    const found = PRODUCTS_DATA.find(p => p.id === productId);
    if (!found) {
        return PRODUCTS_DATA[1]; // Default to Corn if not found
    }
    return found;
};

// Simplified copy of PRODUCTS for "Related Products"
const RELATED_PRODUCTS = [
    {
        id: 1,
        title: 'Sweet Potatoes',
        price: 1.79,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?q=80&w=2574&auto=format&fit=crop',
        discount: 40,
        tag: 'Organic',
        isFavorite: true,
    },
    {
        id: 3,
        title: 'Parsley',
        price: 4.29,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=2630&auto=format&fit=crop',
        discount: 30,
        tag: 'Organic',
        isFavorite: false,
    },
    {
        id: 11,
        title: 'Tomatoes',
        price: 2.99,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2574&auto=format&fit=crop',
        discount: 10,
        tag: 'Fresh',
        isFavorite: true,
    }
];

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { updateQuantity, getItemQuantity } = useCart();

    const product = getProduct(id);

    const displayTitle = product.title;
    const displayPrice = product.price;
    const displayUnit = `/${product.unit}`;
    const displaySub = product.id === 2
        ? "Each ear weighs around 250-300 gm."
        : "Fresh from the farm, delivered to you.";
    const displayDesc = product.description;

    const qty = getItemQuantity(product.id);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    // Mock multiple images for demonstration
    const productImages = [product.image, product.image, product.image];

    const onScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveImageIndex(roundIndex);
    };

    const onShare = async () => {
        try {
            await Share.share({
                message: `Check out ${displayTitle} on Together with Farm!`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: 10 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="heart-outline" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={onShare}>
                        <Ionicons name="share-outline" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Product Image Section */}
                <View style={styles.imageSection}>
                    {/* Organic Tag */}
                    <View style={styles.tagPill}>
                        <Ionicons name="leaf" size={12} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={styles.tagText}>{product.tag || 'Organic'}</Text>
                    </View>

                    <View style={{ height: 250, marginTop: 20, marginBottom: 20 }}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={onScroll}
                            scrollEventThrottle={16}
                            style={{ width: width }}
                        >
                            {productImages.map((img, index) => (
                                <View key={index} style={{ width: width, height: 250, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image source={{ uri: img }} style={{ width: width - 100, height: '100%' }} contentFit="contain" />
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {productImages.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.dot, activeImageIndex === index && styles.activeDot]}
                            />
                        ))}
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.categoryText}>Veggies</Text>
                    <View style={styles.titleRow}>
                        <Text style={styles.titleText}>{displayTitle}</Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.mainPriceText}>${displayPrice}</Text>
                            <Text style={styles.mainUnitText}>{displayUnit}</Text>
                        </View>
                    </View>
                    <Text style={styles.subtitleText}>{displaySub}</Text>

                    {/* Feature Boxes */}
                    <Text style={styles.sectionHeader}>Product Details</Text>
                    <View style={styles.featureRow}>
                        <View style={styles.featureBox}>
                            <Text style={styles.featureTitle}>48 hours</Text>
                            <Text style={styles.featureSub}>Replacement</Text>
                        </View>
                        <View style={styles.featureBox}>
                            <Text style={styles.featureTitle}>24/7</Text>
                            <Text style={styles.featureSub}>Support</Text>
                        </View>
                        <View style={styles.featureBox}>
                            <Text style={styles.featureTitle}>Fast</Text>
                            <Text style={styles.featureSub}>Delivery</Text>
                        </View>
                    </View>

                    {/* Highlights */}
                    <View style={styles.highlightsContainer}>
                        <Text style={styles.subHeader}>Highlights</Text>
                        <View style={styles.highlightRow}>
                            <Text style={styles.highlightLabel}>Health Benefits</Text>
                            <Text style={styles.highlightValue}>Vitamin A Rich</Text>
                        </View>
                        <View style={styles.highlightRow}>
                            <Text style={styles.highlightLabel}>Good to know</Text>
                            <Text style={styles.highlightValue}>Gluten-free</Text>
                        </View>
                    </View>

                    {/* Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.subHeader}>Info</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Description</Text>
                            <Text style={styles.descriptionText}>{displayDesc}</Text>
                        </View>
                    </View>

                    {/* Meet the Farmer */}
                    <Text style={styles.sectionHeader}>Meet the Farmer</Text>
                    <View style={styles.farmerCard}>
                        <View style={styles.farmerInfo}>
                            <Text style={styles.farmerName}>Ramesh Kumar</Text>
                            <Text style={styles.farmerLocation}>Patna, Bihar</Text>
                            <TouchableOpacity onPress={() => router.push('/farmer/1')}>
                                <Text style={styles.showMoreLink}>Show More About Farmer</Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1595245860882-628d689656a4?q=80&w=2574&auto=format&fit=crop' }} // Farmer Portrait
                            style={styles.farmerAvatar}
                        />
                    </View>

                    {/* Explore More Products */}
                    <Text style={styles.sectionHeader}>Explore more products</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                        {RELATED_PRODUCTS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.relatedCard}
                                onPress={() => router.push(`/product/${item.id}`)}
                            >
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>-{item.discount}%</Text>
                                </View>
                                <View style={styles.relatedImageContainer}>
                                    <Image source={{ uri: item.image }} style={styles.relatedImage} contentFit="contain" />
                                </View>
                                <View style={styles.favIconSmall}>
                                    <Ionicons name="heart-outline" size={16} color="#1A1A1A" />
                                </View>

                                <Text style={styles.relatedTag}>{item.tag}</Text>
                                <Text style={styles.relatedTitle} numberOfLines={1}>{item.title}</Text>
                                <View style={styles.relatedPriceRow}>
                                    <Text style={styles.relatedPrice}>${item.price}<Text style={styles.relatedUnit}>/{item.unit}</Text></Text>
                                    <View style={styles.addButtonSmall}>
                                        <Ionicons name="add" size={16} color="#fff" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
                <View>
                    <Text style={styles.weightText}>300 g</Text>
                    <Text style={styles.bottomPrice}>${displayPrice}<Text style={styles.bottomUnit}>{displayUnit}</Text></Text>
                    <Text style={styles.taxText}>Incl. of all taxes</Text>
                </View>

                {qty === 0 ? (
                    <TouchableOpacity style={styles.addToCartBtn} onPress={() => updateQuantity(product.id, 1)}>
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.qtyControlBig}>
                        <TouchableOpacity style={styles.qtyBtnBig} onPress={() => updateQuantity(product.id, -1)}>
                            <Ionicons name="remove" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.qtyTextBig}>{qty}</Text>
                        <TouchableOpacity style={styles.qtyBtnBig} onPress={() => updateQuantity(product.id, 1)}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Cart Popup */}
            <CartPopup />
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
        paddingBottom: 10,
        backgroundColor: '#fff',
        zIndex: 10,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageSection: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        backgroundColor: '#fff',
        position: 'relative',
    },
    tagPill: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: '#1F5E2E',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        zIndex: 5,
    },
    tagText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
        fontSize: 12,
    },
    imageContainer: {
        width: width - 40,
        height: 250,
        marginTop: 20,
        marginBottom: 20,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
    activeDot: {
        backgroundColor: '#1A1A1A',
    },
    detailsContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: 0,
    },
    categoryText: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleText: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        flex: 1,
        marginRight: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    mainPriceText: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    mainUnitText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'DMSans_400Regular',
    },
    subtitleText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'DMSans_400Regular',
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E', // Green headers
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    featureBox: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Grey box
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTitle: {
        fontSize: 13,
        fontFamily: 'DMSans_700Bold',
        color: '#333',
        marginBottom: 2,
    },
    featureSub: {
        fontSize: 11,
        color: '#666',
        fontFamily: 'DMSans_400Regular',
    },
    highlightsContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    subHeader: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#333',
        marginBottom: 12,
    },
    highlightRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    highlightLabel: {
        width: 120,
        fontSize: 14,
        color: '#555',
        fontFamily: 'DMSans_500Medium',
    },
    highlightValue: {
        flex: 1,
        fontSize: 14,
        color: '#888',
        fontFamily: 'DMSans_400Regular',
    },
    infoContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
    },
    infoLabel: {
        width: 120,
        fontSize: 14,
        color: '#333',
        fontFamily: 'DMSans_500Medium',
        marginBottom: 4,
    },
    descriptionText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        fontFamily: 'DMSans_400Regular',
        lineHeight: 20,
    },
    farmerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#555', // Darker border
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    farmerInfo: {
        flex: 1,
    },
    farmerName: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    farmerLocation: {
        fontSize: 14,
        color: '#1F5E2E',
        fontFamily: 'DMSans_500Medium',
        marginBottom: 8,
    },
    showMoreLink: {
        fontSize: 12,
        color: '#1F5E2E', // Green link
        fontFamily: 'DMSans_700Bold',
    },
    farmerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ccc',
    },
    relatedScroll: {
        gap: 16,
        paddingRight: 20,
        paddingBottom: 20,
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 2,
    },
    discountText: {
        fontSize: 10,
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
    },
    relatedCard: {
        width: 150,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    relatedImageContainer: {
        width: '100%',
        height: 100,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    relatedImage: {
        width: '90%',
        height: '90%',
    },
    favIconSmall: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        zIndex: 2,
    },
    relatedTag: {
        fontSize: 10,
        color: '#888',
        marginBottom: 4,
        fontFamily: 'DMSans_400Regular',
    },
    relatedTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    relatedPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    relatedPrice: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    relatedUnit: {
        fontSize: 10,
        color: '#888',
    },
    addButtonSmall: {
        backgroundColor: '#1F5E2E',
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingHorizontal: 20,
        paddingTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    weightText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontFamily: 'DMSans_700Bold',
    },
    bottomPrice: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    bottomUnit: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'DMSans_400Regular',
    },
    taxText: {
        fontSize: 10,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
    },
    addToCartBtn: {
        backgroundColor: '#1F5E2E',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        letterSpacing: 0.5,
    },
    qtyControlBig: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F5E2E',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 16,
    },
    qtyBtnBig: {
        padding: 4,
    },
    qtyTextBig: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        minWidth: 20,
        textAlign: 'center',
    }
});
