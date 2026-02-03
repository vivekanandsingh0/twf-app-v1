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
    { id: 'phonepe_1', type: 'upi', title: 'PhonePe', subtitle: 'UPI id-9873638368@ybl', icon: 'alpha-p-circle', iconProvider: 'MaterialCommunityIcons' },
    { id: 'cod', type: 'cod', title: 'Cash On Delivery', icon: 'cash', iconProvider: 'Ionicons' },
];

const SAVED_METHODS: PaymentMethod[] = [
    { id: 'visa_1', type: 'card', title: 'VISA ending6790', subtitle: 'Expires 06/27', icon: 'credit-card', iconProvider: 'FontAwesome5' },
    { id: 'phonepe_2', type: 'upi', title: 'PhonePe', subtitle: 'UPI id-9873638368@ybl', icon: 'alpha-p-circle', iconProvider: 'MaterialCommunityIcons' },
    { id: 'paytm', type: 'upi', title: 'PayTM', subtitle: 'UPI id-979995373@ptyes', icon: 'wallet', iconProvider: 'Ionicons' },
];

export default function PaymentScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<string>('phonepe_1');

    const { quantities, clearCart } = useCart();
    const { addOrder } = useVendor();
    const { products: marketProducts } = useMarket();
    const { userData, user } = useUser();
    const { selectedAddress } = useAddresses();

    const handlePayment = () => {
        // 1. Identify items in cart
        const cartItemIds = Object.keys(quantities).filter(id => quantities[id] > 0);

        if (cartItemIds.length === 0) {
            Alert.alert("Empty Cart", "Your cart is empty.");
            return;
        }

        // 2. Group Items by Vendor
        const ordersByVendor: Record<string, { items: any[], total: number }> = {};

        cartItemIds.forEach(id => {
            const product = marketProducts.find(p => p.id === id);
            if (product) {
                const vendorId = product.vendorId || 'vendor_def_001'; // Fallback to default
                const qty = quantities[id];
                const itemTotal = product.price * qty;

                if (!ordersByVendor[vendorId]) {
                    ordersByVendor[vendorId] = { items: [], total: 0 };
                }

                ordersByVendor[vendorId].items.push({
                    productName: product.name,
                    quantity: qty,
                    price: product.price,
                    image: product.image // Pass image for display in history
                });
                ordersByVendor[vendorId].total += itemTotal;
            }
        });

        // 3. Create Vendor Orders
        Object.keys(ordersByVendor).forEach(vendorId => {
            const vendorData = ordersByVendor[vendorId];

            // Use stable User ID if available, else fallback
            const finalUserId = user?.id || (userData.phoneNumber ? `user_${userData.phoneNumber.replace(/\D/g, '')}` : 'guest_user');

            const newOrder: VendorOrder = {
                id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                userId: finalUserId,
                customerName: userData ? userData.fullName : "Guest User",
                items: vendorData.items,
                totalAmount: vendorData.total,
                status: 'Pending',
                date: new Date().toISOString(),
                paymentStatus: selectedId === 'cod' ? 'COD' : 'Paid',
                paymentMethod: LINKED_METHODS.find(m => m.id === selectedId)?.title || SAVED_METHODS.find(m => m.id === selectedId)?.title || 'Unknown',
                customerPhone: userData?.phoneNumber || '+91 99999 99999',
                shippingFee: 4.4, // Consistent with checkout
                deliveryAddress: selectedAddress ? `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.pincode}` : "Patna, Bihar" // Enhanced address line
            };

            addOrder(newOrder); // This adds it to the Vendor Context (shared memory)
        });

        // 4. Clear Cart and Redirect
        clearCart();
        router.push('/order-success');
    };

    const renderMethodItem = (item: PaymentMethod) => {
        const isSelected = selectedId === item.id;

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                onPress={() => setSelectedId(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.row}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        {/* Custom handling for icons based on type */}
                        {item.id.includes('phonepe') && <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#5f259f' }}>Pe</Text>}
                        {item.id.includes('paytm') && <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#00b9f5' }}>Paytm</Text>}
                        {item.type === 'cod' && <Ionicons name="cash-outline" size={24} color="#1A1A1A" />}
                        {item.type === 'card' && <FontAwesome5 name="credit-card" size={20} color="#1A1A1A" />}
                    </View>

                    {/* Text */}
                    <View style={styles.textContainer}>
                        <Text style={styles.methodTitle}>{item.title}</Text>
                        {item.subtitle && <Text style={styles.methodSubtitle}>{item.subtitle}</Text>}
                    </View>

                    {/* Radio Button */}
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Payment</Text>
                <TouchableOpacity style={styles.notificationBadge} onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    <View style={styles.badgeDot}><Text style={styles.badgeText}>2</Text></View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Linked Methods */}
                <Text style={styles.sectionTitle}>Linked Methods</Text>
                {LINKED_METHODS.map(renderMethodItem)}

                {/* Saved Methods */}
                <View style={{ height: 24 }} />
                <Text style={styles.sectionTitle}>Saved Methods</Text>
                {SAVED_METHODS.map(renderMethodItem)}

                {/* Add Methods */}
                <View style={{ height: 24 }} />
                <Text style={styles.sectionTitle}>Add Methods</Text>
                <TouchableOpacity style={styles.methodCard}>
                    <View style={styles.row}>
                        <View style={[styles.iconContainer, { backgroundColor: '#fff', borderWidth: 0 }]}>
                            <Ionicons name="add" size={24} color="#1A1A1A" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.methodTitle}>Add New Method</Text>
                            <Text style={styles.methodSubtitle}>UPI, Netbanking, etc</Text>
                        </View>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                    </View>
                </TouchableOpacity>

            </ScrollView>

            {/* Pay Button Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
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
