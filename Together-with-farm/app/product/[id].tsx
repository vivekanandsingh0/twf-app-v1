import React, { useState, useEffect, useRef } from 'react';
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
    NativeSyntheticEvent,
    NativeScrollEvent
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
// import { Image } from 'expo-image';
import FastImage from '@/components/FastImage';
import { useCart } from '@/contexts/CartContext';
import { useMarket, MarketProduct } from '@/contexts/MarketContext';
import { useFavourites } from '@/contexts/FavouritesContext';
import CartPopup from '@/components/CartPopup';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { updateQuantity, getItemQuantity } = useCart();
    const { products, vendors } = useMarket();
    const { toggleFavourite, isFavourite } = useFavourites();
    const { isDark } = useTheme();

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
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }, isDark && { backgroundColor: '#121212' }]}>
                <Text style={isDark && { color: '#FFF' }}>Product not found.</Text>
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
    const displayDesc = product.description;
    const hasDiscount = (product.discountValue ?? 0) > 0;
    const discountedPrice = hasDiscount ? (product.price * (1 - (product.discountValue || 0) / 100)).toFixed(0) : null;

    const qty = getItemQuantity(product.id);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Determine images to show
    const productImages = product.images && product.images.length > 0
        ? product.images.map(uri => ({ uri }))
        : [product.image];

    const scrollRef = useRef<ScrollView>(null);

    // Auto Slide Logic
    useEffect(() => {
        if (productImages.length <= 1) return;

        const interval = setInterval(() => {
            setActiveImageIndex(prev => {
                const nextIndex = (prev + 1) % productImages.length;
                scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
                return nextIndex;
            });
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, [productImages.length]);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        // Only update if it changed significantly to avoid jitter with auto-scroll
        if (roundIndex !== activeImageIndex) {
            setActiveImageIndex(roundIndex);
        }
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
        <View style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: 10 }, isDark && { backgroundColor: '#121212' }]}>
                <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.iconButton, isDark && { backgroundColor: '#333' }]}
                        onPress={() => product && toggleFavourite(product.id)}
                    >
                        <Ionicons
                            name={product && isFavourite(product.id) ? "heart" : "heart-outline"}
                            size={24}
                            color={product && isFavourite(product.id) ? "#FF4B4B" : (isDark ? "#FFF" : "#1A1A1A")}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]} onPress={onShare}>
                        <Ionicons name="share-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Product Image Section */}
                <View style={[styles.imageSection, isDark && { backgroundColor: '#121212' }]}>
                    {/* Organic Tag */}
                    <View style={styles.tagPill}>
                        <Ionicons name="leaf" size={12} color="#fff" style={{ marginRight: 4 }} />
                        <Text style={styles.tagText}>{product.tag || 'Organic'}</Text>
                    </View>

                    <View style={{ height: 250, marginTop: 20, marginBottom: 20 }}>
                        <ScrollView
                            ref={scrollRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={onScroll}
                            scrollEventThrottle={16}
                            style={{ width: width }}
                        >
                            {productImages.map((img, index) => (
                                <View key={index} style={{ width: width, height: 250, alignItems: 'center', justifyContent: 'center' }}>
                                    <FastImage source={img} style={{ width: width - 100, height: '100%' }} contentFit="contain" />
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {productImages.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.dot, activeImageIndex === index ? styles.activeDot : (isDark ? { backgroundColor: '#555' } : null), activeImageIndex === index && isDark && { backgroundColor: '#FFF' }]}
                            />
                        ))}
                    </View>
                </View>

                {/* Details Section */}
                <View style={[styles.detailsContainer, isDark && { backgroundColor: '#1E1E1E' }]}>
                    <Text style={[styles.categoryText, isDark && { color: '#AAA' }]}>{product.type}</Text>
                    <View style={styles.titleRow}>
                        <Text style={[styles.titleText, isDark && { color: '#FFF' }]}>{displayTitle}</Text>
                        <View style={styles.priceContainer}>
                            {hasDiscount ? (
                                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                    <Text style={[styles.mainPriceText, isDark && { color: '#81C784' }]}>₹{discountedPrice}</Text>
                                    <Text style={[styles.mainPriceStrike, isDark && { color: '#888' }, { marginLeft: 6 }]}>₹{displayPrice}</Text>
                                </View>
                            ) : (
                                <Text style={[styles.mainPriceText, isDark && { color: '#81C784' }]}>₹{displayPrice}</Text>
                            )}
                            <Text style={[styles.mainUnitText, isDark && { color: '#AAA' }]}>{displayUnit}</Text>
                        </View>
                    </View>
                    {hasDiscount && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 12, color: '#1F5E2E' }}>{product.discountValue}% OFF</Text>
                            </View>
                            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#888' }}>You save ₹{(displayPrice - parseFloat(discountedPrice!)).toFixed(0)}</Text>
                        </View>
                    )}
                    <Text style={[styles.subtitleText, isDark && { color: '#CCC' }]}>{displaySub}</Text>

                    {/* Feature Boxes */}
                    <Text style={[styles.sectionHeader, isDark && { color: '#81C784' }]}>Product Details</Text>
                    <View style={styles.featureRow}>
                        <View style={[styles.featureBox, isDark && { backgroundColor: '#333' }]}>
                            <Text style={[styles.featureTitle, isDark && { color: '#FFF' }]}>Fresh</Text>
                            <Text style={[styles.featureSub, isDark && { color: '#AAA' }]}>Guarantee</Text>
                        </View>
                        <View style={[styles.featureBox, isDark && { backgroundColor: '#333' }]}>
                            <Text style={[styles.featureTitle, isDark && { color: '#FFF' }]}>Organic</Text>
                            <Text style={[styles.featureSub, isDark && { color: '#AAA' }]}>Certified</Text>
                        </View>
                        <View style={[styles.featureBox, isDark && { backgroundColor: '#333' }]}>
                            <Text style={[styles.featureTitle, isDark && { color: '#FFF' }]}>
                                {product.order_type === 'pre-order' ? `${product.preorder_duration || 3}d` : 'Fast'}
                            </Text>
                            <Text style={[styles.featureSub, isDark && { color: '#AAA' }]}>
                                {product.order_type === 'pre-order' ? 'Pre-order' : 'Delivery'}
                            </Text>
                        </View>
                    </View>

                    {/* Pre-order Benefits Section */}
                    {product.order_type === 'pre-order' && (
                        <View style={styles.preorderBenefitsSection}>
                            <View style={styles.preorderBenefitsHeader}>
                                <Ionicons name="sparkles" size={18} color="#E65100" />
                                <Text style={styles.preorderBenefitsTitle}>Why Pre-order?</Text>
                            </View>

                            <View style={styles.benefitsGrid}>
                                <View style={styles.benefitItem}>
                                    <View style={[styles.benefitIconBox, { backgroundColor: '#E8F5E9' }]}>
                                        <Ionicons name="pricetag" size={18} color="#1F5E2E" />
                                    </View>
                                    <Text style={styles.benefitLabel}>Best Price</Text>
                                    <Text style={styles.benefitDesc}>Guaranteed lowest farm price</Text>
                                </View>
                                <View style={styles.benefitItem}>
                                    <View style={[styles.benefitIconBox, { backgroundColor: '#FFF3E0' }]}>
                                        <Ionicons name="leaf" size={18} color="#E65100" />
                                    </View>
                                    <Text style={styles.benefitLabel}>Ultra Fresh</Text>
                                    <Text style={styles.benefitDesc}>Harvested just for you</Text>
                                </View>
                                <View style={styles.benefitItem}>
                                    <View style={[styles.benefitIconBox, { backgroundColor: '#E3F2FD' }]}>
                                        <Ionicons name="shield-checkmark" size={18} color="#1565C0" />
                                    </View>
                                    <Text style={styles.benefitLabel}>Farm Direct</Text>
                                    <Text style={styles.benefitDesc}>No middlemen involved</Text>
                                </View>
                                <View style={styles.benefitItem}>
                                    <View style={[styles.benefitIconBox, { backgroundColor: '#FCE4EC' }]}>
                                        <Ionicons name="timer" size={18} color="#C62828" />
                                    </View>
                                    <Text style={styles.benefitLabel}>Ready in {product.preorder_duration || 3}d</Text>
                                    <Text style={styles.benefitDesc}>We'll notify you!</Text>
                                </View>
                            </View>

                            <View style={styles.preorderTimeline}>
                                <View style={styles.timelineStep}>
                                    <View style={[styles.timelineDot, { backgroundColor: '#1F5E2E' }]} />
                                    <Text style={styles.timelineText}>You place order today</Text>
                                </View>
                                <View style={styles.timelineLine} />
                                <View style={styles.timelineStep}>
                                    <View style={[styles.timelineDot, { backgroundColor: '#E65100' }]} />
                                    <Text style={styles.timelineText}>Farmer prepares your order</Text>
                                </View>
                                <View style={styles.timelineLine} />
                                <View style={styles.timelineStep}>
                                    <View style={[styles.timelineDot, { backgroundColor: '#1565C0' }]} />
                                    <Text style={styles.timelineText}>Fresh delivery in ~{product.preorder_duration || 3} days</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Highlights */}
                    {product.highlights && product.highlights.length > 0 && (
                        <View style={[styles.highlightsContainer, isDark && { backgroundColor: '#333' }]}>
                            <Text style={[styles.subHeader, isDark && { color: '#FFF' }]}>Highlights</Text>
                            {product.highlights.map((h: any, i: number) => (
                                <View key={i} style={styles.highlightRow}>
                                    <Text style={[styles.highlightLabel, isDark && { color: '#CCC' }]}>{h.title}</Text>
                                    <Text style={[styles.highlightValue, isDark && { color: '#DDD' }]}>{h.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Info */}
                    <View style={[styles.infoContainer, isDark && { backgroundColor: '#333' }]}>
                        <Text style={[styles.subHeader, isDark && { color: '#FFF' }]}>Info</Text>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, isDark && { color: '#CCC' }]}>Description</Text>
                            <Text style={[styles.descriptionText, isDark && { color: '#DDD' }]}>{displayDesc}</Text>
                        </View>
                    </View>

                    {/* Meet the Farmer */}
                    {vendor && (
                        <>
                            <Text style={[styles.sectionHeader, isDark && { color: '#81C784' }]}>Meet the Farmer</Text>
                            <View style={[styles.farmerCard, isDark && { borderColor: '#444' }]}>
                                <View style={styles.farmerInfo}>
                                    <Text style={[styles.farmerName, isDark && { color: '#FFF' }]}>{vendor.name}</Text>
                                    <Text style={[styles.farmerLocation, isDark && { color: '#CCC' }]}>{vendor.location}</Text>
                                    <TouchableOpacity onPress={() => router.push(`/farmer/${vendor.id}`)}>
                                        <Text style={[styles.showMoreLink, isDark && { color: '#81C784' }]}>Show More About Farmer</Text>
                                    </TouchableOpacity>
                                </View>
                                <FastImage
                                    source={vendor.image}
                                    style={styles.farmerAvatar}
                                    contentFit="cover"
                                />
                            </View>
                        </>
                    )}

                    <Text style={[styles.sectionHeader, isDark && { color: '#81C784' }]}>
                        {vendor ? `More from ${vendor.name}` : 'Explore more products'}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                        {displayRelated.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.relatedCard, isDark && { backgroundColor: '#333', borderColor: '#444' }]}
                                onPress={() => router.push(`/product/${item.id}`)}
                            >
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{item.discount || '-10%'}</Text>
                                </View>
                                <View style={styles.relatedImageContainer}>
                                    <FastImage source={item.image} style={styles.relatedImage} contentFit="contain" />
                                </View>
                                <View style={[styles.favIconSmall, isDark && { backgroundColor: '#444' }]}>
                                    <Ionicons name="heart-outline" size={16} color={isDark ? '#FFF' : '#1A1A1A'} />
                                </View>

                                <Text style={[styles.relatedTag, isDark && { color: '#AAA' }]}>{item.tag || item.type}</Text>
                                <Text style={[styles.relatedTitle, isDark && { color: '#FFF' }]} numberOfLines={1}>{item.name}</Text>
                                <View style={styles.relatedPriceRow}>
                                    <Text style={[styles.relatedPrice, isDark && { color: '#81C784' }]}>₹{item.price}<Text style={[styles.relatedUnit, isDark && { color: '#AAA' }]}>/{item.unit}</Text></Text>
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
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }, isDark && { backgroundColor: '#1E1E1E', borderTopColor: '#333' }]}>
                <View>
                    <Text style={[styles.weightText, isDark && { color: '#FFF' }]}>300 g</Text>
                    {hasDiscount ? (
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                            <Text style={[styles.bottomPrice, isDark && { color: '#81C784' }]}>₹{discountedPrice}<Text style={[styles.bottomUnit, isDark && { color: '#AAA' }]}>{displayUnit}</Text></Text>
                            <Text style={{ fontSize: 13, color: '#999', textDecorationLine: 'line-through', fontFamily: 'DMSans_400Regular' }}>₹{displayPrice}</Text>
                        </View>
                    ) : (
                        <Text style={[styles.bottomPrice, isDark && { color: '#81C784' }]}>₹{displayPrice}<Text style={[styles.bottomUnit, isDark && { color: '#AAA' }]}>{displayUnit}</Text></Text>
                    )}
                    <Text style={[styles.taxText, isDark && { color: '#888' }]}>Incl. of all taxes</Text>
                </View>

                {product.order_type === 'pre-order' ? (
                    // Pre-order button
                    qty === 0 ? (
                        <TouchableOpacity style={styles.preorderBtn} onPress={() => updateQuantity(product.id, 1)}>
                            <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.preorderBtnText}>Pre-order</Text>
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
                    )
                ) : (
                    // Normal add to cart
                    qty === 0 ? (
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
                    )
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
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    mainPriceStrike: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
        textDecorationLine: 'line-through',
        marginLeft: 4,
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
    },
    preorderBtn: {
        backgroundColor: '#E65100',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    preorderBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        letterSpacing: 0.5,
    },
    preorderBenefitsSection: {
        backgroundColor: '#FFFDF5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    preorderBenefitsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    preorderBenefitsTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#E65100',
    },
    benefitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    benefitItem: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    benefitIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    benefitLabel: {
        fontSize: 13,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 2,
        textAlign: 'center',
    },
    benefitDesc: {
        fontSize: 10,
        fontFamily: 'DMSans_400Regular',
        color: '#888',
        textAlign: 'center',
    },
    preorderTimeline: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    timelineStep: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    timelineText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: '#4B5563',
    },
    timelineLine: {
        width: 2,
        height: 16,
        backgroundColor: '#E0E0E0',
        marginLeft: 4,
    },
    preorderBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFE0B2',
        gap: 12,
    },
    preorderBannerIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    preorderBannerTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#E65100',
        marginBottom: 2,
    },
    preorderBannerText: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#BF360C',
        lineHeight: 18,
    },
});
