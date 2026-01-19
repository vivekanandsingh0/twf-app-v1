import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

// Mock Farmer Data
const FARMER_DATA = {
    id: 1,
    name: 'Ramesh Kumar',
    location: 'Patna, Bihar',
    image: 'https://images.unsplash.com/photo-1595245860882-628d689656a4?q=80&w=2574&auto=format&fit=crop', // Portrait
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop', // Field
    stats: {
        experience: '15+ Years',
        method: 'Organic',
        size: '5 Acres'
    },
    story: "For Ramesh Kumar, farming isn't just a profession; it's a legacy passed down through four generations in Muzaffarpur. Growing up in the fertile plains of Bihar, Ramesh learned the secret language of the soil early on.\n\nToday, he is a pioneer of organic practices in his village. By completely eliminating chemical pesticides and using traditional vermicompost methods, he ensures that every piece of produce harvested from his 5-acre farm is as pure as nature intended.",
    quote: "My mission is simple: I want families in Patna to eat vegetables as fresh and safe as the ones I serve my own children."
};

// Mock Products for this farmer
const FARMER_PRODUCTS = [
    {
        id: 201, // Sweet Potatoes
        title: 'Sweet Potatoes',
        price: 1.79,
        unit: 'lb',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyN5y-txNHOqaxZJy4yWA4lK_oiEQxjmX3xg&s',
        discount: 40,
        tag: 'Organic',
        isFavorite: true,
    },
    {
        id: 203, // Parsley
        title: 'Parsley',
        price: 4.29,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2574&auto=format&fit=crop',
        discount: 30,
        tag: 'Organic',
        isFavorite: false,
    },
    {
        id: 204, // Spinach
        title: 'Organic Spinach',
        price: 2.49,
        unit: 'bunch',
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=2574&auto=format&fit=crop',
        discount: 20,
        tag: 'Leafy',
        isFavorite: true,
    },
    {
        id: 206, // Tomatoes
        title: 'Red Tomatoes',
        price: 2.99,
        unit: 'lb',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2574&auto=format&fit=crop',
        discount: 10,
        tag: 'Daily',
        isFavorite: false,
    }
];

export default function FarmerDetailsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // In real app, fetch farmer by ID
    const farmer = FARMER_DATA;

    const renderProductCard = (item: typeof FARMER_PRODUCTS[0]) => (
        <TouchableOpacity
            key={item.id}
            style={styles.productCard}
            onPress={() => router.push(`/product/${item.id}`)}
            activeOpacity={0.9}
        >
            <View style={styles.productImageContainer}>
                <Image source={{ uri: item.image }} style={styles.productImage} contentFit="contain" />
                {item.discount > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{item.discount}%</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons
                        name={item.isFavorite ? "heart" : "heart-outline"}
                        size={18}
                        color={item.isFavorite ? "#FF4B4B" : "#1A1A1A"}
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
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" /> {/* Overlay status bar for cover image */}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Cover Image */}
                <ImageBackground source={{ uri: farmer.coverImage }} style={styles.coverImage}>
                    <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }]}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="heart-outline" size={24} color="#1A1A1A" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="share-outline" size={24} color="#1A1A1A" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>

                {/* Floating Profile Card */}
                <View style={styles.profileCardContainer}>
                    <View style={styles.profileCard}>
                        {/* Avatar & Name Row */}
                        <View style={styles.profileHeader}>
                            <Image source={{ uri: farmer.image }} style={styles.avatar} contentFit="cover" />
                            <View style={styles.profileInfo}>
                                <Text style={styles.farmerName}>{farmer.name}</Text>
                                <View style={styles.locationRow}>
                                    <Ionicons name="location-outline" size={14} color="#1F5E2E" />
                                    <Text style={styles.locationText}>{farmer.location}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <MaterialCommunityIcons name="medal-outline" size={20} color="#1F5E2E" style={{ marginBottom: 4 }} />
                                <Text style={styles.statLabel}>EXPERIENCE</Text>
                                <Text style={styles.statValue}>{farmer.stats.experience}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Ionicons name="leaf-outline" size={20} color="#1F5E2E" style={{ marginBottom: 4 }} />
                                <Text style={styles.statLabel}>METHOD</Text>
                                <Text style={styles.statValue}>{farmer.stats.method}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <MaterialCommunityIcons name="image-filter-hdr" size={20} color="#1F5E2E" style={{ marginBottom: 4 }} />
                                <Text style={styles.statLabel}>FARM SIZE</Text>
                                <Text style={styles.statValue}>{farmer.stats.size}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                    {/* Our Story */}
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="book-outline" size={20} color="#1F5E2E" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>Our Story</Text>
                    </View>
                    <Text style={styles.storyText}>{farmer.story}</Text>

                    {/* Quote */}
                    <View style={styles.quoteContainer}>
                        <Text style={styles.quoteText}>"{farmer.quote}"</Text>
                    </View>

                    {/* All Products */}
                    <Text style={styles.sectionTitleProducts}>All Products</Text>
                    <View style={styles.productsGrid}>
                        {FARMER_PRODUCTS.map(renderProductCard)}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    coverImage: {
        width: '100%',
        height: 300,
        justifyContent: 'flex-start',
    },
    headerOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    profileCardContainer: {
        paddingHorizontal: 20,
        marginTop: -80, // Pull up to overlap cover
        marginBottom: 20,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
        backgroundColor: '#F5F5F5',
    },
    profileInfo: {
        flex: 1,
    },
    farmerName: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 14,
        color: '#1F5E2E',
        fontFamily: 'DMSans_500Medium',
        marginLeft: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#1F5E2E',
        borderRadius: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
        color: '#666',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    contentSection: {
        paddingHorizontal: 20,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    storyText: {
        fontSize: 14,
        color: '#555',
        fontFamily: 'DMSans_400Regular',
        lineHeight: 22,
        marginBottom: 24,
    },
    quoteContainer: {
        backgroundColor: '#CCD5AE',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        borderLeftWidth: 4,
        borderLeftColor: '#1F5E2E',
    },
    quoteText: {
        fontSize: 14,
        fontStyle: 'italic',
        fontFamily: 'DMSans_500Medium',
        color: '#1F5E2E',
        lineHeight: 22,
    },
    sectionTitleProducts: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12, // For older RN
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 16, // Row gap manual for wrap
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
});
