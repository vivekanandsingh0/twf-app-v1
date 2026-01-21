import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useAddresses } from '@/contexts/AddressContext';
import { PRODUCTS } from '@/constants/products';

export default function CheckoutScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { quantities, updateQuantity, totalCartItems } = useCart();
    const { selectedAddress, addresses, setSelectedAddress, updateAddress } = useAddresses();

    // Local State
    const [tipAmount, setTipAmount] = useState<number>(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    // Derived Data
    const cartItems = PRODUCTS.filter(p => quantities[p.id] && quantities[p.id] > 0);

    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.price * (quantities[item.id] || 0));
    }, 0);

    const shippingFee = 4.4; // Fixed shipping for now
    const discount = couponApplied ? 6.22 : 0; // Example discount
    const total = subtotal + shippingFee - discount + tipAmount;

    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            Alert.alert(
                "No Address Selected",
                "Please select a delivery address to proceed.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Select Address", onPress: () => setShowLocationPicker(true) }
                ]
            );
            return;
        }
        router.push('/select-location');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Address Section */}
                <View style={styles.addressSection}>
                    <View style={styles.locationIconBg}>
                        <Ionicons name="location-outline" size={24} color="#fff" />
                    </View>
                    <TouchableOpacity
                        style={styles.addressInfo}
                        onPress={() => setShowLocationPicker(!showLocationPicker)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.addressHeaderRow}>
                            <Text style={styles.addressTitle}>{selectedAddress?.type || 'Home'}</Text>
                            <Ionicons name={showLocationPicker ? "chevron-up" : "chevron-down"} size={16} color="#1A1A1A" />
                        </View>
                        <Text style={styles.addressSubtitle} numberOfLines={1}>
                            {selectedAddress?.address || 'Patna, Bihar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Cart Items */}
                <View style={styles.listContainer}>
                    {cartItems.map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" />
                            </View>

                            <View style={styles.itemDetails}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.itemPrice}>${item.price}</Text>
                                    <Text style={styles.itemUnit}>/{item.unit}</Text>
                                </View>
                            </View>

                            <View style={styles.qtyContainer}>
                                <TouchableOpacity
                                    style={styles.qtyBtn} // Minus Icon not outlined in screenshot, just grey bg maybe? 
                                    // Screenshot shows simple line for minus
                                    onPress={() => updateQuantity(item.id, -1)}
                                >
                                    <Ionicons name="remove" size={18} color="#1A1A1A" />
                                </TouchableOpacity>

                                <Text style={styles.qtyText}>{quantities[item.id]}</Text>

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

                {/* Add More Section */}
                <View style={styles.addMoreCard}>
                    <View>
                        <Text style={styles.addMoreTitle}>Need anything else?</Text>
                        <Text style={styles.addMoreSubtitle}>Add other product, if you want.</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addMoreBtn}
                        onPress={() => router.push('/(tabs)/market')} // Go to market to add more
                    >
                        <Text style={styles.addMoreBtnText}>Add more</Text>
                    </TouchableOpacity>
                </View>

                {/* Coupons Section */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionHeaderTitle}>Coupons</Text>
                    <View style={styles.couponRow}>
                        <View style={styles.couponIcon}>
                            <Ionicons name="pricetag-outline" size={20} color="#fff" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.couponText}>Get Rs.50 cashback on</Text>
                            <Text style={styles.couponText}>Bihar Pride</Text>
                        </View>
                        <TouchableOpacity onPress={() => setCouponApplied(!couponApplied)}>
                            <Text style={styles.applyText}>{couponApplied ? 'Remove' : 'Apply'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Delivery Tip Section */}
                <View style={styles.sectionCard}>
                    <View style={styles.tipHeaderRow}>
                        <Ionicons name="heart-outline" size={20} color="#1A1A1A" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionHeaderTitle}>Delivery Partner Tip</Text>
                    </View>
                    <Text style={styles.tipSubtitle}>
                        100% of the tip goes to your delivery partner. They help deliver fresh foods to bihar homes.
                    </Text>

                    <View style={styles.tipOptionsRow}>
                        {[10, 100, 200].map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[styles.tipOption, tipAmount === amount && styles.tipOptionSelected]}
                                onPress={() => setTipAmount(amount)}
                            >
                                <Text style={[styles.tipText, tipAmount === amount && styles.tipTextSelected]}>
                                    ${amount}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.tipOption}>
                            <Text style={styles.tipText}>Custom</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.sectionCard}>
                    <Text style={[styles.sectionHeaderTitle, { marginBottom: 16 }]}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal ({totalCartItems}items)</Text>
                        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping fee</Text>
                        <Text style={styles.summaryValue}>${shippingFee.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Voucher Discount</Text>
                        <Text style={styles.summaryValue}>${discount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
                <View>
                    <Text style={styles.bottomPrice}>${total.toFixed(2)}</Text>
                    <Text style={styles.bottomItems}>{totalCartItems} items</Text>
                </View>
                <TouchableOpacity
                    style={styles.placeOrderBtn}
                    activeOpacity={0.9}
                    onPress={handlePlaceOrder}
                >
                    <Text style={styles.placeOrderText}>Place Order</Text>
                </TouchableOpacity>
            </View>

            {/* Location Dropdown Overlay */}
            {showLocationPicker && (
                <>
                    <TouchableOpacity
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 900 }}
                        activeOpacity={1}
                        onPress={() => setShowLocationPicker(false)}
                    />
                    <View style={[styles.locationDropdown, { top: insets.top + 80 }]}>
                        {addresses.map((addr) => (
                            <TouchableOpacity
                                key={addr.id}
                                style={styles.locationOption}
                                onPress={() => {
                                    setSelectedAddress(addr);
                                    setShowLocationPicker(false);
                                }}
                            >
                                <Ionicons
                                    name={selectedAddress.id === addr.id ? "radio-button-on" : "radio-button-off"}
                                    size={18}
                                    color={selectedAddress.id === addr.id ? "#1F5E2E" : "#999"}
                                />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={[styles.locationOptionTitle, selectedAddress.id === addr.id && { color: '#1F5E2E' }]}>
                                        {addr.type}
                                    </Text>
                                    <Text style={styles.locationOptionAddress} numberOfLines={2}>
                                        {addr.address}, {addr.city}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[styles.locationOption, { borderBottomWidth: 0 }]}
                            onPress={() => {
                                setShowLocationPicker(false);
                                router.push('/addresses');
                            }}
                        >
                            <View style={[styles.locationIconBg, { width: 32, height: 32, borderRadius: 10, marginRight: 0, backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="add" size={20} color="#1F5E2E" />
                            </View>
                            <Text style={[styles.locationOptionTitle, { marginLeft: 12, color: '#1F5E2E' }]}>Add New Address</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Order Confirmation Modal - Moved to separate screen */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
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
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    // Address
    addressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    locationIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1F5E2E',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    addressInfo: {
        flex: 1,
    },
    addressHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addressTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    addressSubtitle: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
        marginTop: 2,
    },

    // Items
    listContainer: {
        gap: 16,
        marginBottom: 24,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1F5E2E',
        backgroundColor: '#fff',
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
    },
    itemTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    priceRow: {
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
        color: '#999',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
    },
    qtyBtnAdd: {
        backgroundColor: '#1F5E2E',
    },
    qtyText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        width: 16,
        textAlign: 'center',
    },

    // Add More
    addMoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1F5E2E',
        backgroundColor: '#fff',
        marginBottom: 24,
    },
    addMoreTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    addMoreSubtitle: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
    },
    addMoreBtn: {
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addMoreBtnText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
    },

    // Sections (Coupon, Tip, Summary)
    sectionCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#000000', // As per screenshot, seems darker border
        backgroundColor: '#fff',
        marginBottom: 24,
    },
    sectionHeaderTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    // Coupon
    couponRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    couponIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1F5E2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    couponText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    applyText: {
        color: '#1F5E2E',
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
    },

    // Tip
    tipHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipSubtitle: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
        marginBottom: 12,
        lineHeight: 14,
    },
    tipOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    tipOption: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    tipOptionSelected: {
        borderColor: '#1F5E2E',
        backgroundColor: '#E8F5E9',
    },
    tipText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    tipTextSelected: {
        color: '#1F5E2E',
    },

    // Summary
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'DMSans_400Regular',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1F5E2E',
        fontFamily: 'DMSans_700Bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    totalValue: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
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
        zIndex: 200, // Ensure it is above ScrollView content
    },
    bottomPrice: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    bottomItems: {
        fontSize: 14,
        color: '#999',
    },
    placeOrderBtn: {
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 30,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
    locationDropdown: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        zIndex: 1000,
    },
    locationOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    locationOptionTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#333',
    },
    locationOptionAddress: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginTop: 2,
    },

    // Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },
    modalIcon: {
        width: 60, height: 60,
        borderRadius: 30,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F5F5F5',
    },
    confirmBtn: {
        backgroundColor: '#1F5E2E',
    },
    cancelBtnText: {
        color: '#1A1A1A',
        fontFamily: 'DMSans_700Bold',
    },
    confirmBtnText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
    },
    mapContainer: {
        width: '100%',
        height: 150,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#f0f0f0',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    changeAddressText: {
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});
