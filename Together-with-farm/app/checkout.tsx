import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
// import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useAddresses } from '@/contexts/AddressContext';
import { useMarket } from '@/contexts/MarketContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function CheckoutScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { quantities, updateQuantity, totalCartItems, appliedCoupon, setAppliedCoupon } = useCart();
    const { selectedAddress, addresses, setSelectedAddress, updateAddress } = useAddresses();
    const { products: marketProducts } = useMarket();
    const { isDark } = useTheme();

    // Local State
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    // Delivery Settings
    const [deliverySettings, setDeliverySettings] = useState({ min_order: 200, fee: 30 });

    React.useEffect(() => {
        const fetchDeliverySettings = async () => {
            const { data } = await supabase.from('app_settings').select('value').eq('key', 'delivery_charges').single();
            if (data?.value) {
                setDeliverySettings({
                    min_order: data.value.min_order_for_free_delivery || 200,
                    fee: data.value.delivery_fee || 30
                });
            }
        };
        fetchDeliverySettings();
    }, []);

    // Derived Data
    const cartItems = marketProducts.filter(p => quantities[p.id] && quantities[p.id] > 0);

    const subtotal = cartItems.reduce((sum, item) => {
        const effectivePrice = (item.discountValue && item.discountValue > 0)
            ? item.price * (1 - item.discountValue / 100)
            : item.price;
        return sum + (effectivePrice * (quantities[item.id] || 0));
    }, 0);

    const isFreeDelivery = subtotal >= deliverySettings.min_order;
    const shippingFee = isFreeDelivery ? 0 : deliverySettings.fee;

    // Calculate actual discount from applied coupon
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
            let potentialDiscount = subtotal * (appliedCoupon.discount_value / 100);
            if (appliedCoupon.max_discount && potentialDiscount > appliedCoupon.max_discount) {
                potentialDiscount = appliedCoupon.max_discount;
            }
            discount = potentialDiscount;
        } else {
            discount = appliedCoupon.discount_value;
        }
    }
    // Prevent discount from making total negative
    if (discount > subtotal) {
        discount = subtotal;
    }

    const total = subtotal + shippingFee - discount;

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponError('');
        setIsApplyingCoupon(true);

        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponInput.trim().toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                setCouponError('Invalid or expired coupon code.');
                setAppliedCoupon(null);
                return;
            }

            // Check min order value
            if (data.min_order_value && subtotal < data.min_order_value) {
                setCouponError(`Minimum order value of ₹${data.min_order_value} required.`);
                setAppliedCoupon(null);
                return;
            }

            // Check expiry
            if (data.valid_until && new Date(data.valid_until) < new Date()) {
                setCouponError('This coupon has expired.');
                setAppliedCoupon(null);
                return;
            }

            // Optional: check specific_product_id if needed, but for now we apply globally
            if (data.specific_product_id) {
                const hasProduct = cartItems.some(i => i.id === data.specific_product_id);
                if (!hasProduct) {
                    setCouponError('This coupon is not valid for the items in your cart.');
                    setAppliedCoupon(null);
                    return;
                }
            }

            setAppliedCoupon(data);
            setCouponInput('');
        } catch (err: any) {
            setCouponError('Error applying coupon.');
            setAppliedCoupon(null);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError('');
    };

    // Check if cart has pre-order items
    const hasPreorderItems = cartItems.some(item => item.order_type === 'pre-order');
    const allPreorder = cartItems.every(item => item.order_type === 'pre-order');
    const maxPreorderDays = cartItems
        .filter(item => item.order_type === 'pre-order')
        .reduce((max, item) => Math.max(max, item.preorder_duration || 3), 0);

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
        router.push('/confirm-address');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, isDark && { backgroundColor: '#333' }]}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Free Delivery Notice */}
                {!isFreeDelivery && (
                    <View style={{ backgroundColor: '#E0F2F1', padding: 16, marginBottom: 24, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Ionicons name="cart-outline" size={24} color="#1F5E2E" />
                        <Text style={{ fontFamily: 'DMSans_500Medium', color: '#1F5E2E', fontSize: 14, flex: 1, lineHeight: 20 }}>
                            Add items worth <Text style={{ fontFamily: 'DMSans_700Bold' }}>₹{(deliverySettings.min_order - subtotal).toFixed(0)}</Text> more to get <Text style={{ fontFamily: 'DMSans_700Bold' }}>FREE delivery</Text>.
                        </Text>
                    </View>
                )}

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
                            <Text style={[styles.addressTitle, isDark && { color: '#FFF' }]}>{selectedAddress?.type || 'Home'}</Text>
                            <Ionicons name={showLocationPicker ? "chevron-up" : "chevron-down"} size={16} color={isDark ? '#FFF' : '#1A1A1A'} />
                        </View>
                        <Text style={[styles.addressSubtitle, isDark && { color: '#AAA' }]} numberOfLines={1}>
                            {selectedAddress?.address || 'Patna, Bihar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Cart Items */}
                <View style={styles.listContainer}>
                    {cartItems.map((item) => (
                        <View key={item.id} style={[styles.itemCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                            <View style={[styles.imageContainer, isDark && { backgroundColor: '#333', borderColor: '#444' }]}>
                                <Image source={item.image} style={styles.image} resizeMode="cover" />
                            </View>

                            <View style={styles.itemDetails}>
                                <Text style={[styles.itemTitle, isDark && { color: '#FFF' }]}>{item.name}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={[styles.itemPrice, isDark && { color: '#81C784' }]}>₹{item.price}</Text>
                                    <Text style={[styles.itemUnit, isDark && { color: '#AAA' }]}>/{item.unit}</Text>
                                </View>
                            </View>

                            <View style={styles.qtyContainer}>
                                <TouchableOpacity
                                    style={[styles.qtyBtn, isDark && { backgroundColor: '#333' }]} // Minus Icon not outlined in screenshot, just grey bg maybe? 
                                    // Screenshot shows simple line for minus
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

                {/* Pre-order Notice */}
                {hasPreorderItems && (
                    <View style={[styles.preorderNotice, isDark && { backgroundColor: '#3E2723', borderColor: '#E65100' }]}>
                        <Ionicons name="time-outline" size={20} color="#E65100" />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.preorderNoticeTitle, isDark && { color: '#FFE0B2' }]}>
                                {allPreorder ? 'Pre-order' : 'Cart contains pre-order items'}
                            </Text>
                            <Text style={[styles.preorderNoticeText, isDark && { color: '#FFCC80' }]}>
                                {allPreorder
                                    ? `Your order will be ready in ~${maxPreorderDays} days after placing.`
                                    : `Some items are pre-orders (ready in ~${maxPreorderDays} days). Instant items will ship normally.`
                                }
                            </Text>
                        </View>
                    </View>
                )}

                {/* Add More Section */}
                <View style={[styles.addMoreCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                    <View>
                        <Text style={[styles.addMoreTitle, isDark && { color: '#FFF' }]}>Need anything else?</Text>
                        <Text style={[styles.addMoreSubtitle, isDark && { color: '#AAA' }]}>Add other product, if you want.</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addMoreBtn}
                        onPress={() => router.push('/(tabs)')} // Go to market to add more
                    >
                        <Text style={styles.addMoreBtnText}>Add more</Text>
                    </TouchableOpacity>
                </View>

                {/* Coupons Section */}
                <View style={[styles.sectionCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                    <Text style={[styles.sectionHeaderTitle, { marginBottom: 12 }, isDark && { color: '#FFF' }]}>Apply Coupon</Text>

                    {appliedCoupon ? (
                        <View style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={styles.couponIcon}>
                                    <Ionicons name="pricetag" size={16} color="#fff" />
                                </View>
                                <View>
                                    <Text style={{ fontFamily: 'DMSans_700Bold', color: '#1F5E2E', fontSize: 14 }}>{appliedCoupon.code}</Text>
                                    <Text style={{ fontFamily: 'DMSans_400Regular', color: '#1F5E2E', fontSize: 12 }}>Coupon applied successfully</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleRemoveCoupon} style={{ padding: 4 }}>
                                <Ionicons name="close-circle" size={24} color="#1F5E2E" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TextInput
                                    style={{ flex: 1, borderWidth: 1, borderColor: isDark ? '#444' : '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, height: 48, fontFamily: 'DMSans_500Medium', color: isDark ? '#FFF' : '#1A1A1A' }}
                                    placeholder="Enter coupon code"
                                    placeholderTextColor={isDark ? '#666' : '#999'}
                                    autoCapitalize="characters"
                                    value={couponInput}
                                    onChangeText={setCouponInput}
                                    editable={!isApplyingCoupon}
                                />
                                <TouchableOpacity
                                    style={{ height: 48, paddingHorizontal: 20, backgroundColor: couponInput.trim() ? '#1F5E2E' : '#A5D6A7', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                                    onPress={handleApplyCoupon}
                                    disabled={!couponInput.trim() || isApplyingCoupon}
                                >
                                    <Text style={{ color: '#fff', fontFamily: 'DMSans_700Bold', fontSize: 14 }}>
                                        {isApplyingCoupon ? 'Applying' : 'Apply'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {couponError ? (
                                <Text style={{ color: '#E53935', fontSize: 12, marginTop: 8, fontFamily: 'DMSans_500Medium' }}>{couponError}</Text>
                            ) : null}
                        </>
                    )}
                </View>



                {/* Order Summary */}
                <View style={[styles.sectionCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}>
                    <Text style={[styles.sectionHeaderTitle, { marginBottom: 16 }, isDark && { color: '#FFF' }]}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, isDark && { color: '#AAA' }]}>Subtotal ({totalCartItems}items)</Text>
                        <Text style={[styles.summaryValue, isDark && { color: '#81C784' }]}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, isDark && { color: '#AAA' }]}>Shipping fee</Text>
                        <Text style={[styles.summaryValue, isDark && { color: '#81C784' }]}>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, isDark && { color: '#AAA' }]}>Voucher Discount</Text>
                        <Text style={[styles.summaryValue, isDark && { color: '#81C784' }]}>₹{discount.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.divider, isDark && { backgroundColor: '#333' }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, isDark && { color: '#FFF' }]}>Total</Text>
                        <Text style={[styles.totalValue, isDark && { color: '#81C784' }]}>₹{total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }, isDark && { backgroundColor: '#1E1E1E', borderTopColor: '#333' }]}>
                <View>
                    <Text style={[styles.bottomPrice, isDark && { color: '#FFF' }]}>₹{total.toFixed(2)}</Text>
                    <Text style={[styles.bottomItems, isDark && { color: '#AAA' }]}>{totalCartItems} items</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeOrderBtn, hasPreorderItems && { backgroundColor: '#E65100' }]}
                    activeOpacity={0.9}
                    onPress={handlePlaceOrder}
                >
                    {hasPreorderItems && <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 6 }} />}
                    <Text style={styles.placeOrderText}>{allPreorder ? 'Place Pre-order' : (hasPreorderItems ? 'Place Order' : 'Place Order')}</Text>
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
                    <View style={[styles.locationDropdown, { top: insets.top + 80 }, isDark && { backgroundColor: '#333', borderColor: '#444' }]}>
                        {addresses.map((addr) => (
                            <TouchableOpacity
                                key={addr.id}
                                style={[styles.locationOption, isDark && { borderBottomColor: '#444' }]}
                                onPress={() => {
                                    setSelectedAddress(addr);
                                    setShowLocationPicker(false);
                                }}
                            >
                                <Ionicons
                                    name={selectedAddress?.id === addr.id ? "radio-button-on" : "radio-button-off"}
                                    size={18}
                                    color={selectedAddress?.id === addr.id ? "#1F5E2E" : "#999"}
                                />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={[styles.locationOptionTitle, selectedAddress?.id === addr.id && { color: '#81C784' }, isDark && selectedAddress?.id !== addr.id && { color: '#FFF' }]}>
                                        {addr.type}
                                    </Text>
                                    <Text style={[styles.locationOptionAddress, isDark && { color: '#AAA' }]} numberOfLines={2}>
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
        flexDirection: 'row',
        alignItems: 'center',
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
    preorderNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    preorderNoticeTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#E65100',
        marginBottom: 2,
    },
    preorderNoticeText: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#BF360C',
        lineHeight: 18,
    },
});
