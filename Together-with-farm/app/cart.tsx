import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
// import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useMarket } from '@/contexts/MarketContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function CartScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { quantities, updateQuantity, totalCartItems } = useCart();
    const { products: marketProducts } = useMarket();
    const { isDark } = useTheme();

    // Get all products that are currently in the cart
    const cartItems = marketProducts.filter(p => quantities[p.id] && quantities[p.id] > 0);

    const totalPrice = cartItems.reduce((sum, item) => {
        const effectivePrice = (item.discountValue && item.discountValue > 0)
            ? item.price * (1 - item.discountValue / 100)
            : item.price;
        return sum + (effectivePrice * (quantities[item.id] || 0));
    }, 0);

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, isDark && { backgroundColor: '#333' }]}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Your Carts</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {cartItems.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="cart-outline" size={64} color={isDark ? '#555' : '#CCC'} />
                        <Text style={[styles.emptyText, isDark && { color: '#AAA' }]}>Your cart is empty</Text>
                        <TouchableOpacity style={styles.continueBtn} onPress={() => router.back()}>
                            <Text style={styles.continueBtnText}>Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {cartItems.map((item) => (
                            <View key={item.id} style={[styles.cartItem, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                                <View style={[styles.imageContainer, isDark && { backgroundColor: '#333' }]}>
                                    <Image source={item.image} style={styles.image} resizeMode="cover" />
                                </View>

                                <View style={styles.itemDetails}>
                                    <Text style={[styles.itemTitle, isDark && { color: '#FFF' }]}>{item.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={styles.priceContainer}>
                                            {item.discountValue && item.discountValue > 0 ? (
                                                <>
                                                    <Text style={[styles.itemPrice, isDark && { color: '#81C784' }]}>₹{(item.price * (1 - item.discountValue / 100)).toFixed(0)}</Text>
                                                    <Text style={{ fontSize: 11, color: '#999', textDecorationLine: 'line-through', fontFamily: 'DMSans_400Regular', marginLeft: 4 }}>₹{item.price}</Text>
                                                </>
                                            ) : (
                                                <Text style={[styles.itemPrice, isDark && { color: '#81C784' }]}>₹{item.price}</Text>
                                            )}
                                            <Text style={[styles.itemUnit, isDark && { color: '#AAA' }]}>/{item.unit}</Text>
                                        </View>
                                        {item.order_type === 'pre-order' && (
                                            <View style={{ backgroundColor: '#E65100', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                <Text style={{ color: '#fff', fontSize: 9, fontFamily: 'DMSans_700Bold' }}>Pre-order</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, isDark && { backgroundColor: '#333' }]}
                                        onPress={() => updateQuantity(item.id, -1)}
                                    >
                                        <Ionicons name="remove" size={18} color={isDark ? '#FFF' : '#1A1A1A'} />
                                    </TouchableOpacity>

                                    <Text style={[styles.qtyText, isDark && { color: '#FFF' }]}>{quantities[item.id]}</Text>

                                    <TouchableOpacity
                                        style={[styles.qtyBtn, styles.qtyBtnAdd]}
                                        onPress={() => updateQuantity(item.id, 1)}
                                    >
                                        <Ionicons name="add" size={18} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                {/* Spacer for bottom bar */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            {cartItems.length > 0 && (
                <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }, isDark && { backgroundColor: '#1E1E1E', borderTopColor: '#333' }]}>
                    <View>
                        <Text style={[styles.totalPrice, isDark && { color: '#FFF' }]}>₹{totalPrice.toFixed(2)}</Text>
                        <Text style={[styles.totalItems, isDark && { color: '#AAA' }]}>{totalCartItems} items</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        activeOpacity={0.9}
                        onPress={() => router.push('/checkout')}
                    >
                        <Text style={styles.checkoutBtnText}>Proceed Checkout</Text>
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
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
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
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    listContainer: {
        gap: 16,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1F5E2E', // Green border as per screenshot
        backgroundColor: '#fff',
        // Slight shadow if needed but screenshot looks flat with border
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        overflow: 'hidden',
        marginRight: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 14, // Looks relatively small in screenshot
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    itemPrice: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    itemUnit: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
    },
    qtyBtnAdd: {
        backgroundColor: '#1F5E2E',
    },
    qtyText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        minWidth: 20,
        textAlign: 'center',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginTop: 16,
        marginBottom: 24,
    },
    continueBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#1F5E2E',
        borderRadius: 24,
    },
    continueBtnText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
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
        paddingTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    totalPrice: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    totalItems: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
    },
    checkoutBtn: {
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 30,
    },
    checkoutBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    }
});
