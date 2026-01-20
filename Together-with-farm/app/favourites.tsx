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

import { PRODUCTS as ALL_PRODUCTS } from '@/constants/products';

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
