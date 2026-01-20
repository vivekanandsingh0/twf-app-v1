import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { PRODUCTS } from '@/constants/products';

export default function CartPopup() {
    const { totalCartItems, quantities } = useCart();
    const router = useRouter();

    if (totalCartItems === 0) {
        return null;
    }

    // Get images of items actually in the cart
    const cartProductIds = Object.keys(quantities)
        .map(Number)
        .filter(id => quantities[id] > 0);

    // Get up to 2 product images
    const cartImages = cartProductIds.slice(0, 2).map(id => {
        const product = PRODUCTS.find(p => p.id === id);
        return product?.image;
    }).filter(Boolean);

    return (
        <View style={styles.cartPopupContainer}>
            <TouchableOpacity
                style={styles.cartPopup}
                activeOpacity={0.9}
                onPress={() => router.push('/cart')}
            >
                <View style={styles.cartImages}>
                    {cartImages[0] && (
                        <Image source={{ uri: cartImages[0] }} style={[styles.tinyThumb, { left: 0, zIndex: 3 }]} />
                    )}
                    {cartImages[1] && (
                        <Image source={{ uri: cartImages[1] }} style={[styles.tinyThumb, { left: 15, zIndex: 2 }]} />
                    )}
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
    );
}

const styles = StyleSheet.create({
    cartPopupContainer: {
        position: 'absolute',
        bottom: 90,
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
