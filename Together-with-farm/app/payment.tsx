import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useVendor, VendorOrder } from '@/contexts/VendorContext';
import { useMarket } from '@/contexts/MarketContext';
import { useUser } from '@/contexts/UserContext';
import { useAddresses } from '@/contexts/AddressContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
// @ts-ignore
import RazorpayCheckout from 'react-native-razorpay';
// Types for Payment Methods
type PaymentMethod = {
    id: string;
    type: 'upi' | 'card' | 'cod' | 'add';
    title: string;
    subtitle?: string;
    icon?: any; // Name of icon or specific source
    iconProvider?: 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5';
};

const LINKED_METHODS: PaymentMethod[] = [
    { id: 'razorpay', type: 'upi', title: 'Pay Online', subtitle: 'UPI, Credit/Debit Cards, Netbanking', icon: 'shield-check', iconProvider: 'MaterialCommunityIcons' },
    { id: 'cod', type: 'cod', title: 'Cash On Delivery', subtitle: 'Pay when your order arrives', icon: 'cash', iconProvider: 'Ionicons' },
];

const SAVED_METHODS: PaymentMethod[] = [];

export default function PaymentScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string>('razorpay');
    const { isDark } = useTheme();

    const { quantities, clearCart, appliedCoupon } = useCart();
    const { addOrder } = useVendor();
    const { products: marketProducts } = useMarket();
    const { userData, user, refreshOrders } = useUser();
    const { selectedAddress } = useAddresses();

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

    const handlePayment = async () => {
        // 1. Identify items in cart
        const cartItemIds = Object.keys(quantities).filter(id => quantities[id] > 0);

        if (cartItemIds.length === 0) {
            Alert.alert("Empty Cart", "Your cart is empty.");
            return;
        }

        // 2. Group Items by Vendor
        const ordersByVendor: Record<string, { items: any[], total: number, hasPreorder: boolean, maxDuration: number }> = {};
        let cartSubtotal = 0;

        cartItemIds.forEach(id => {
            const product = marketProducts.find(p => p.id === id);
            if (product) {
                const vendorId = product.vendorId || 'vendor_def_001'; // Fallback to default
                const qty = quantities[id];
                const effectivePrice = (product.discountValue && product.discountValue > 0)
                    ? product.price * (1 - product.discountValue / 100)
                    : product.price;
                const itemTotal = effectivePrice * qty;
                const isPreorder = product.order_type === 'pre-order';

                if (!ordersByVendor[vendorId]) {
                    ordersByVendor[vendorId] = { items: [], total: 0, hasPreorder: false, maxDuration: 0 };
                }

                if (isPreorder) {
                    ordersByVendor[vendorId].hasPreorder = true;
                    ordersByVendor[vendorId].maxDuration = Math.max(
                        ordersByVendor[vendorId].maxDuration,
                        product.preorder_duration || 3
                    );
                }
                ordersByVendor[vendorId].items.push({
                    productName: product.name,
                    quantity: qty,
                    price: effectivePrice,
                    image: product.image // Pass image for display in history
                });
                ordersByVendor[vendorId].total += itemTotal;

                // Track total across all vendors for shipping threshold
                cartSubtotal += itemTotal;
            }
        });

        // Calculate if we reached free delivery
        const isFreeDelivery = cartSubtotal >= deliverySettings.min_order;
        const shippingFee = isFreeDelivery ? 0 : deliverySettings.fee;

        let totalCouponDiscount = 0;
        if (appliedCoupon) {
            totalCouponDiscount = appliedCoupon.discount_type === 'percentage'
                ? Math.min(cartSubtotal * (appliedCoupon.discount_value / 100), appliedCoupon.max_discount || Infinity)
                : appliedCoupon.discount_value;
        }

        const grandTotal = Math.max(0, cartSubtotal + shippingFee - totalCouponDiscount);

        const processOrders = async (paymentId?: string) => {
            // 3. Create Vendor Orders (async loop)
            const orderPromises = Object.keys(ordersByVendor).map(async (vendorId, index) => {
                const vendorData = ordersByVendor[vendorId];

                // Assign shipping fee to the first order only (or split it)
                const orderShippingFee = index === 0 ? shippingFee : 0;

                // Use stable User ID if available, else fallback
                const finalUserId = user?.id || (userData?.phoneNumber ? `user_${userData.phoneNumber.replace(/\D/g, '')}` : 'guest_user');

                // Calculate the discount for this part of the order (or just apply it entirely to the first order)
                const orderCouponDiscount = index === 0 && appliedCoupon ?
                    (appliedCoupon.discount_type === 'percentage'
                        ? Math.min(cartSubtotal * (appliedCoupon.discount_value / 100), appliedCoupon.max_discount || Infinity)
                        : appliedCoupon.discount_value)
                    : 0;

                const finalOrderTotal = Math.max(0, vendorData.total + orderShippingFee - orderCouponDiscount);

                const newOrder: VendorOrder = {
                    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    userId: finalUserId,
                    vendorId: vendorId, // Link order to specific Vendor
                    customerName: userData ? userData.fullName : "Guest User",
                    items: vendorData.items,
                    totalAmount: finalOrderTotal,
                    status: 'Pending',
                    date: new Date().toISOString(),
                    paymentStatus: selectedId === 'cod' ? 'COD' : 'Paid',
                    paymentMethod: LINKED_METHODS.find(m => m.id === selectedId)?.title || SAVED_METHODS.find(m => m.id === selectedId)?.title || 'Online',
                    transactionId: paymentId,
                    customerPhone: userData?.phoneNumber || '+91 99999 99999',
                    shippingFee: orderShippingFee, // Dynamic shipping fee applied to first order
                    deliveryAddress: selectedAddress ? `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.pincode}` : "Patna, Bihar",
                    deliveryLatitude: selectedAddress?.latitude,
                    deliveryLongitude: selectedAddress?.longitude,
                    receiverName: selectedAddress?.receiverName,
                    receiverPhone: selectedAddress?.receiverPhone,
                    order_type: vendorData.hasPreorder ? 'pre-order' : 'instant',
                    estimated_delivery: vendorData.hasPreorder
                        ? new Date(Date.now() + vendorData.maxDuration * 24 * 60 * 60 * 1000).toISOString()
                        : undefined,
                    coupon_id: index === 0 && appliedCoupon ? appliedCoupon.id : undefined,
                    coupon_discount: orderCouponDiscount,
                } as any;

                await addOrder(newOrder); // This adds it to the Vendor Context and Supabase
            });

            await Promise.all(orderPromises);

            // Slight delay to ensure DB propagation
            await new Promise(resolve => setTimeout(resolve, 500));

            // 4. Force refresh User Orders (to ensure they appear immediately even if realtime is slow)
            await refreshOrders();

            // 5. Clear Cart and Redirect
            clearCart();
            router.push('/order-success');
        };

        if (selectedId === 'cod') {
            await processOrders();
        } else {
            // Trigger Razorpay for Online Payments
            const options = {
                description: 'Order from Together With Farm',
                image: 'https://i.imgur.com/3g7nmJC.png', // Replace with your logo if applicable
                currency: 'INR',
                key: 'rzp_live_SW93HyQQLI49af',
                amount: Math.round(grandTotal * 100), // Amount in paisa
                name: 'Together With Farm',
                prefill: {
                  email: user?.email || 'test@example.com',
                  contact: userData?.phoneNumber || '',
                  name: userData?.fullName || 'Guest User'
                },
                theme: { color: '#1F5E2E' }
            };
            
            try {
                const data = await RazorpayCheckout.open(options);
                // Payment successful
                await processOrders(data.razorpay_payment_id);
            } catch (error: any) {
                // If the user cancelled or payment failed
                Alert.alert("Payment Failed", error.description || "Could not complete the transaction.");
            }
        }
    };

    const renderMethodItem = (item: PaymentMethod) => {
        const isSelected = selectedId === item.id;

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.methodCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }, isSelected && (isDark ? { backgroundColor: '#1E3E2E', borderColor: '#1F5E2E' } : styles.methodCardSelected)]}
                onPress={() => setSelectedId(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.row}>
                    {/* Icon */}
                    <View style={[styles.iconContainer, isDark && { backgroundColor: '#333', borderColor: '#444' }]}>
                        {/* Custom handling for icons based on type */}
                        {item.id === 'razorpay' && <MaterialCommunityIcons name="shield-check" size={24} color={isDark ? '#FFF' : '#1F5E2E'} />}
                        {item.type === 'cod' && <Ionicons name="cash-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />}
                    </View>

                    {/* Text */}
                    <View style={styles.textContainer}>
                        <Text style={[styles.methodTitle, isDark && { color: '#FFF' }]}>{item.title}</Text>
                        {item.subtitle && <Text style={[styles.methodSubtitle, isDark && { color: '#AAA' }]}>{item.subtitle}</Text>}
                    </View>

                    {/* Radio Button */}
                    <View style={[styles.radioOuter, isDark && { borderColor: '#FFF' }, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={[styles.radioInner, isDark && { backgroundColor: '#FFF' }]} />}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, isDark && { backgroundColor: '#121212' }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, isDark && { backgroundColor: '#333', borderRadius: 12 }]}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Select Payment</Text>
                <TouchableOpacity style={[styles.notificationBadge, isDark && { backgroundColor: '#333', borderRadius: 12 }]} onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    <View style={styles.badgeDot}><Text style={styles.badgeText}>2</Text></View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Payment Methods */}
                <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Payment Options</Text>
                {LINKED_METHODS.map(renderMethodItem)}

            </ScrollView>

            {/* Pay Button Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }, isDark && { backgroundColor: '#1E1E1E', borderTopColor: '#333' }]}>
                <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
                    <Text style={styles.payBtnText}>Pay & Place Order</Text>
                </TouchableOpacity>
            </View>
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
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    notificationBadge: {
        position: 'relative',
        padding: 8,
    },
    badgeDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#1F5E2E',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120, // Space for footer
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    methodCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    methodCardSelected: {
        backgroundColor: '#F2F8F4', // Light green bg
        borderColor: '#1F5E2E',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    textContainer: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    methodSubtitle: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: '#1A1A1A', // Design shows black outline with black inner? Or green?
        // Screenshot shows black radio with inner circle
    },
    radioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#1A1A1A',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    payBtn: {
        backgroundColor: '#1F5E2E',
        borderRadius: 30,
        paddingVertical: 18,
        alignItems: 'center',
    },
    payBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
});
