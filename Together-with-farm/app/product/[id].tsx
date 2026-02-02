import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Share,
    Platform,
    ActivityIndicator,
    Image
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
// import { Image } from 'expo-image';
import { useCart } from '@/contexts/CartContext';
import { useMarket, MarketProduct } from '@/contexts/MarketContext';
import CartPopup from '@/components/CartPopup';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { updateQuantity, getItemQuantity } = useCart();
    const { products, vendors } = useMarket();

    const productId = Array.isArray(id) ? id[0] : id; // Handle string | string[]
    const product = products.find(p => p.id === productId);

    // Find vendor
    const vendor = product ? vendors.find(v => v.id === product.vendorId) : null;

    // Find related products (Same Vendor)
    const relatedProducts = product
        ? products.filter(p => p.vendorId === product.vendorId && p.id !== product.id).slice(0, 5)
        : [];

    // Fallback: If no products from same vendor, show similar category
    const similarProducts = (product && relatedProducts.length === 0)
        ? products.filter(p => p.type === product.type && p.id !== product.id).slice(0, 5)
        : relatedProducts;

    const displayRelated = similarProducts;

    if (!product) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Product not found.</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: '#1F5E2E', marginTop: 10 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const displayTitle = product.name;
    const displayPrice = product.price;
    const displayUnit = `/${product.unit}`;
    const displaySub = product.description;
    const displayDesc = product.description; // or more detailed if available

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
                                    <Image source={img} style={{ width: width - 100, height: '100%' }} resizeMode="contain" />
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
                    <Text style={styles.categoryText}>{product.type}</Text>
                    <View style={styles.titleRow}>
                        <Text style={styles.titleText}>{displayTitle}</Text>
                        <View style={styles.priceContainer}>
                            <Text style={styles.mainPriceText}>₹{displayPrice}</Text>
                            <Text style={styles.mainUnitText}>{displayUnit}</Text>
                        </View>
                    </View>
                    <Text style={styles.subtitleText}>{displaySub}</Text>

                    {/* Feature Boxes */}
                    <Text style={styles.sectionHeader}>Product Details</Text>
                    <View style={styles.featureRow}>
                        <View style={styles.featureBox}>
                            <Text style={styles.featureTitle}>Fresh</Text>
                            <Text style={styles.featureSub}>Guarantee</Text>
                        </View>
                        <View style={styles.featureBox}>
                            <Text style={styles.featureTitle}>Organic</Text>
                            <Text style={styles.featureSub}>Certified</Text>
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
                            <Text style={styles.highlightValue}>Nutrient Rich</Text>
                        </View>
                        <View style={styles.highlightRow}>
                            <Text style={styles.highlightLabel}>Good to know</Text>
                            <Text style={styles.highlightValue}>Locally Sourced</Text>
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
                    {vendor && (
                        <>
                            <Text style={styles.sectionHeader}>Meet the Farmer</Text>
                            <View style={styles.farmerCard}>
                                <View style={styles.farmerInfo}>
                                    <Text style={styles.farmerName}>{vendor.name}</Text>
                                    <Text style={styles.farmerLocation}>{vendor.location}</Text>
                                    <TouchableOpacity onPress={() => router.push(`/farmer/${vendor.id}`)}>
                                        <Text style={styles.showMoreLink}>Show More About Farmer</Text>
                                    </TouchableOpacity>
                                </View>
                                <Image
                                    source={vendor.image}
                                    style={styles.farmerAvatar}
                                />
                            </View>
                        </>
                    )}

                    <Text style={styles.sectionHeader}>
                        {vendor ? `More from ${vendor.name}` : 'Explore more products'}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                        {displayRelated.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.relatedCard}
                                onPress={() => router.push(`/product/${item.id}`)}
                            >
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{item.discount || '-10%'}</Text>
                                </View>
                                <View style={styles.relatedImageContainer}>
                                    <Image source={item.image} style={styles.relatedImage} resizeMode="contain" />
                                </View>
                                <View style={styles.favIconSmall}>
                                    <Ionicons name="heart-outline" size={16} color="#1A1A1A" />
                                </View>

                                <Text style={styles.relatedTag}>{item.tag || item.type}</Text>
                                <Text style={styles.relatedTitle} numberOfLines={1}>{item.name}</Text>
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
