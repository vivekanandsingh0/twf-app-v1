import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { useVendor, VendorOrder } from '@/contexts/VendorContext';

export default function RateOrderScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { orders } = useVendor();

    const orderId = String(id);
    // Find the order. Note: The ID passed might be just the number suffix if we stripped it, 
    // or the full ID. Let's try to match both.
    const order = orders.find(o => o.id === orderId || o.id.endsWith(orderId));

    // State
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [productRating, setProductRating] = useState(0);
    const [driverRating, setDriverRating] = useState(0);
    const [review, setReview] = useState('');

    if (!order) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Order not found</Text>
                <TouchableOpacity onPress={() => router.back()}><Text style={{ color: 'green', marginTop: 10 }}>Go Back</Text></TouchableOpacity>
            </View>
        );
    }

    const itemsSummary = order.items.map(i => i.productName).join(', ');

    const handleSubmit = () => {
        if (productRating === 0 || driverRating === 0) {
            Alert.alert("Incomplete", "Please provide a rating for both product and driver.");
            return;
        }
        setIsSubmitted(true);
        Alert.alert("Success", "Your review has been submitted!");
    };

    // ... handlers ...

    const handleEdit = () => {
        setIsSubmitted(false);
    };

    const handleDelete = () => {
        Alert.alert("Delete Review", "Are you sure you want to delete your review?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    setProductRating(0);
                    setDriverRating(0);
                    setReview('');
                    setIsSubmitted(false);
                }
            }
        ]);
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
                            source={{ uri: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60' }}
                            style={styles.productImage}
                        />
                        <View style={styles.badgeContainer}>
                            <View style={styles.quantityBadge}><Text style={styles.quantityText}>{order.items.length}</Text></View>
                        </View>

                        <View style={styles.orderInfo}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.orderNumber}>{order.id}</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{order.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.itemSummary} numberOfLines={1}>{itemsSummary}</Text>
                            <Text style={styles.dateText}>{new Date(order.date).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Show Details only if editing/new, OR just always show summaries? Keeping summary always */}
                    <View style={styles.cardFooter}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${order.totalAmount}</Text>
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
                <Text style={styles.sectionTitle}>Driver</Text>
                <View style={styles.card}>
                    <View style={styles.driverHeader}>
                        <View style={styles.driverInfo}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1542596594-649edbc13630?w=500&auto=format&fit=crop&q=60' }}
                                style={styles.driverAvatar}
                            />
                            <View>
                                <Text style={styles.driverName}>Amit Kumar</Text>
                                <Text style={styles.driverDetails}>BR01AJ2346</Text>
                            </View>
                        </View>
                        {!isSubmitted && <Ionicons name="ellipsis-horizontal" size={24} color="#DDD" />}
                    </View>

                    <View style={styles.ratingSection}>
                        <Text style={styles.questionText}>
                            {isSubmitted ? 'Delivery Rating' : 'How was the delivery?'}
                        </Text>
                        {renderStars(driverRating, setDriverRating, isSubmitted)}
                    </View>
                </View>

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

                {/* Action Buttons */}
                {isSubmitted ? (
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
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitBtnText}>Submit Review</Text>
                    </TouchableOpacity>
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
    orderInfo: { flex: 1 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    orderNumber: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontFamily: 'DMSans_700Bold', color: '#1F5E2E' },
    itemSummary: { fontSize: 13, fontFamily: 'DMSans_400Regular', color: '#333', marginBottom: 4 },
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
});
