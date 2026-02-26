import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';

export default function RateOrderScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { orders } = useUser();

    const orderId = String(id);
    // Find the order. Note: The ID passed might be just the number suffix if we stripped it, 
    // or the full ID. Let's try to match both.
    const order = orders.find(o => o.id === orderId || o.id.endsWith(orderId));

    // State
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [productRating, setProductRating] = useState(0);
    const [driverRating, setDriverRating] = useState(0);
    const [review, setReview] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingReview, setLoadingReview] = useState(true);

    React.useEffect(() => {
        if (!order) return;
        const fetchReview = async () => {
            setLoadingReview(true);
            try {
                const { data, error } = await supabase
                    .from('order_reviews')
                    .select('*')
                    .eq('order_id', order.id)
                    .single();

                if (data) {
                    setProductRating(data.product_rating);
                    setDriverRating(data.driver_rating);
                    setReview(data.review_text || '');
                    setIsSubmitted(true);
                }
            } catch (err) {
                // Not found or error, we just stay in unsubmitted state
            } finally {
                setLoadingReview(false);
            }
        };
        fetchReview();
    }, [order]);

    if (!order) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Order not found</Text>
                <TouchableOpacity onPress={() => router.back()}><Text style={{ color: 'green', marginTop: 10 }}>Go Back</Text></TouchableOpacity>
            </View>
        );
    }

    const getProxiedImageUrl = (url?: string) => {
        if (!url) return undefined;
        return url.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev');
    };

    const itemsSummary = order.items.map(i => i.productName).join(', ');
    const productImage = order.items.length > 0 && order.items[0].image
        ? { uri: getProxiedImageUrl(order.items[0].image) }
        : { uri: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60' };

    const handleSubmit = async () => {
        if (productRating === 0 || (order.deliveryPartnerName && driverRating === 0)) {
            Alert.alert("Incomplete", "Please provide a rating for the product" + (order.deliveryPartnerName ? " and driver." : "."));
            return;
        }

        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
            Alert.alert("Error", "You must be logged in to submit a review.");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.from('order_reviews').upsert({
                order_id: order.id,
                user_id: userData.user.id,
                product_rating: productRating,
                driver_rating: driverRating,
                review_text: review,
                updated_at: new Date().toISOString()
            }, { onConflict: 'order_id' });

            if (error) throw error;
            setIsSubmitted(true);
            Alert.alert("Success", "Your review has been submitted!");
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = () => {
        setIsSubmitted(false);
    };

    const handleDelete = () => {
        Alert.alert("Delete Review", "Are you sure you want to delete your review?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const { error } = await supabase.from('order_reviews').delete().eq('order_id', order.id);
                        if (error) throw error;
                        setProductRating(0);
                        setDriverRating(0);
                        setReview('');
                        setIsSubmitted(false);
                    } catch (err: any) {
                        Alert.alert("Error", err.message || "Failed to delete review");
                    }
                }
            }
        ]);
    };

    const handleCancelOrder = async () => {
        // Check if order can be cancelled
        const cancellableStatuses = ['Pending', 'Confirmed'];

        if (!cancellableStatuses.includes(order.status)) {
            Alert.alert(
                "Cannot Cancel Order",
                "This order has already been shipped by the farmer and cannot be cancelled.",
                [{ text: "OK" }]
            );
            return;
        }

        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            const { error } = await supabase
                                .from('orders')
                                .update({
                                    status: 'Cancelled',
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', order.id);

                            if (error) throw error;

                            Alert.alert(
                                "Order Cancelled",
                                "Your order has been cancelled successfully.",
                                [{ text: "OK", onPress: () => router.back() }]
                            );
                        } catch (e: any) {
                            Alert.alert("Error", "Failed to cancel order: " + e.message);
                        } finally {
                            setCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    const renderStars = (rating: number, setRating: (r: number) => void, readOnly: boolean) => {
        return (
            <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => !readOnly && setRating(star)}
                        activeOpacity={readOnly ? 1 : 0.7}
                        disabled={readOnly}
                    >
                        <Ionicons
                            name={star <= rating ? "star" : "star-outline"}
                            size={32}
                            color="#F4B400"
                            style={{ marginRight: 8 }}
                        />
                    </TouchableOpacity>
                ))}
            </View>
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
                <Text style={styles.headerTitle}>{isSubmitted ? 'Your Review' : 'Rate Your Order'}</Text>
                <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Order Summary / Product Rating */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Image
                            source={productImage}
                            style={styles.productImage}
                        />
                        <View style={styles.badgeContainer}>
                            <View style={styles.quantityBadge}><Text style={styles.quantityText}>{order.items.length}</Text></View>
                        </View>

                        <View style={styles.orderInfo}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.orderNumber} numberOfLines={1} ellipsizeMode="middle">{order.id}</Text>
                            </View>
                            <View style={styles.rowBetween}>
                                <Text style={styles.itemSummary} numberOfLines={1}>{itemsSummary}</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{order.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.dateText}>{new Date(order.date).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Show Details only if editing/new, OR just always show summaries? Keeping summary always */}
                    <View style={styles.cardFooter}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{order.totalAmount}</Text>

                    </View>

                    {!isSubmitted && (
                        <View style={styles.reorderContainer}>
                            <TouchableOpacity>
                                <Text style={styles.reorderText}>Re-order</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Product Rating Section */}
                    <View style={styles.ratingSection}>
                        <Text style={styles.questionText}>
                            {isSubmitted ? 'Your Rating' : 'How was your experience?'}
                        </Text>
                        {renderStars(productRating, setProductRating, isSubmitted)}
                    </View>
                </View>

                {/* Driver Rating */}
                {order.deliveryPartnerName ? (
                    <>
                        <Text style={styles.sectionTitle}>Driver</Text>
                        <View style={styles.card}>
                            <View style={styles.driverHeader}>
                                <View style={styles.driverInfo}>
                                    <Image
                                        source={{ uri: getProxiedImageUrl(order.deliveryPartnerPhoto) || 'https://images.unsplash.com/photo-1542596594-649edbc13630?w=500&auto=format&fit=crop&q=60' }}
                                        style={styles.driverAvatar}
                                    />
                                    <View>
                                        <Text style={styles.driverName}>{order.deliveryPartnerName}</Text>
                                        <Text style={styles.driverDetails}>{order.deliveryPartnerPhone}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.ratingSection}>
                                <Text style={styles.questionText}>
                                    {isSubmitted ? 'Delivery Rating' : 'How was the delivery?'}
                                </Text>
                                {renderStars(driverRating, setDriverRating, isSubmitted)}
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={[styles.card, { marginTop: 20 }]}>
                        <Text style={styles.driverDetails}>Delivery Partner not assigned yet.</Text>
                    </View>
                )}

                {/* Review Section */}
                <Text style={styles.sectionTitle}>{isSubmitted ? 'Your Review' : 'Add a review'}</Text>

                {isSubmitted ? (
                    // Submitted View
                    <View style={[styles.card, styles.reviewCard, styles.submittedReviewCard]}>
                        <Text style={styles.submittedReviewText}>
                            {review || "No detailed review added."}
                        </Text>
                    </View>
                ) : (
                    // Editting View
                    <View style={[styles.card, styles.reviewCard]}>
                        <TextInput
                            placeholder="Share your experience in details"
                            placeholderTextColor="#999"
                            multiline
                            style={styles.reviewInput}
                            value={review}
                            onChangeText={setReview}
                        />
                    </View>
                )}

                {/* Cancel Order Section */}
                {['Pending', 'Confirmed'].includes(order.status) && (
                    <View style={styles.cancelSection}>
                        <TouchableOpacity
                            style={[styles.cancelOrderBtn, cancelling && styles.disabledBtn]}
                            onPress={handleCancelOrder}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <ActivityIndicator color="#FF4444" />
                            ) : (
                                <>
                                    <Ionicons name="close-circle-outline" size={20} color="#FF4444" />
                                    <Text style={styles.cancelOrderText}>Cancel Order</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.cancelHint}>You can cancel this order until it's shipped</Text>
                    </View>
                )}

                {['Shipped', 'Out for Delivery', 'Processing'].includes(order.status) && (
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color="#FF9800" />
                        <Text style={styles.infoText}>
                            This order has been shipped by the farmer and cannot be cancelled.
                        </Text>
                    </View>
                )}

                {/* Action Buttons */}
                {!['Pending', 'Confirmed'].includes(order.status) && (
                    isSubmitted ? (
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
                                <Ionicons name="trash-outline" size={20} color="#FF4444" />
                                <Text style={styles.deleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={handleEdit}>
                                <Ionicons name="create-outline" size={20} color="#fff" />
                                <Text style={styles.editBtnText}>Edit Review</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.submitBtn, submitting && styles.disabledBtn]}
                            onPress={handleSubmit}
                            disabled={submitting || (order.deliveryPartnerName ? (driverRating === 0 || productRating === 0) : productRating === 0)}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    )
                )}

                <View style={{ height: 40 }} />
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
    backBtn: { padding: 4 },
    notificationBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    badge: {
        position: 'absolute', top: 2, right: 2, backgroundColor: '#1F5E2E',
        width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    content: { paddingHorizontal: 20 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', marginBottom: 16 },
    productImage: { width: 60, height: 60, borderRadius: 12, marginRight: 16 },
    badgeContainer: {
        position: 'absolute', top: -6, left: 50, backgroundColor: '#1F5E2E', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, zIndex: 1,
    },
    quantityBadge: {},
    quantityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    orderInfo: { flex: 1, overflow: 'hidden' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    orderNumber: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', flex: 1, marginRight: 8 },
    statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
    statusText: { fontSize: 10, fontFamily: 'DMSans_700Bold', color: '#1F5E2E' },
    itemSummary: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#333', flex: 1, marginRight: 8 },
    dateText: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#999' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    totalLabel: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#1A1A1A' },
    totalValue: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#1F5E2E' },
    reorderContainer: { alignItems: 'flex-end', marginBottom: 16 },
    reorderText: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: '#1F5E2E' },

    ratingSection: { marginTop: 8, alignItems: 'center' },
    questionText: { fontSize: 14, fontFamily: 'DMSans_500Medium', color: '#333', marginBottom: 12, alignSelf: 'flex-start' },
    starContainer: { flexDirection: 'row', justifyContent: 'center' },

    sectionTitle: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', marginBottom: 12, marginTop: 4 },

    driverHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    driverInfo: { flexDirection: 'row', alignItems: 'center' },
    driverAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    driverName: { fontSize: 14, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    driverDetails: { fontSize: 12, color: '#666' },

    reviewCard: { minHeight: 120, padding: 0 },
    reviewInput: { flex: 1, padding: 16, fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#1A1A1A', textAlignVertical: 'top' },
    submittedReviewCard: { padding: 16, justifyContent: 'center' },
    submittedReviewText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#333', lineHeight: 20 },

    submitBtn: {
        backgroundColor: '#1F5E2E', borderRadius: 30, paddingVertical: 18, alignItems: 'center', marginTop: 10, marginBottom: 20,
    },
    submitBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold' },

    actionRow: {
        flexDirection: 'row', gap: 12, marginTop: 10, marginBottom: 20,
    },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 30,
        borderWidth: 1,
    },
    editBtn: {
        backgroundColor: '#1F5E2E', borderColor: '#1F5E2E',
    },
    editBtnText: {
        color: '#fff', fontSize: 14, fontFamily: 'DMSans_700Bold', marginLeft: 8,
    },
    deleteBtn: {
        backgroundColor: '#fff', borderColor: '#FF4444',
    },
    deleteBtnText: {
        color: '#FF4444', fontSize: 14, fontFamily: 'DMSans_700Bold', marginLeft: 8,
    },

    cancelSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    cancelOrderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#FF4444',
        backgroundColor: '#fff',
        gap: 8,
    },
    cancelOrderText: {
        color: '#FF4444',
        fontSize: 15,
        fontFamily: 'DMSans_700Bold',
    },
    cancelHint: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
        fontFamily: 'DMSans_400Regular',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#E65100',
        fontFamily: 'DMSans_500Medium',
        lineHeight: 18,
    },
});
