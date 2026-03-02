import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

interface Review {
    id: string;
    order_id: string;
    product_rating: number;
    driver_rating: number;
    review_text: string | null;
    created_at: string;
    orders: {
        items: any[];
    };
    user: {
        full_name: string | null;
        profile_image: string | null;
    };
}

export default function VendorReviewsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const proxyUrl = (url?: any) => {
        let urlString = undefined;
        if (typeof url === 'string') {
            urlString = url;
        } else if (url && typeof url === 'object' && typeof url.uri === 'string') {
            urlString = url.uri;
        }
        if (!urlString) return undefined;
        return urlString.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev');
    };

    const fetchReviews = async () => {
        if (!user?.id) return;
        try {
            const { data, error } = await supabase
                .from('order_reviews')
                .select(`
                    *,
                    orders!inner(vendor_id, items),
                    user:profiles!order_reviews_user_id_fkey(full_name, profile_image)
                `)
                .eq('orders.vendor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Re-map with proxy
            const mapped = (data || []).map(r => ({
                ...r,
                user: {
                    ...r.user,
                    profile_image: proxyUrl(r.user?.profile_image)
                }
            })) as Review[];

            setReviews(mapped);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchReviews();
        }, [user?.id])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchReviews();
    };

    const avgProductRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.product_rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const avgDriverRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.driver_rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const renderReviewCard = (review: Review) => {
        const itemNames = review.orders.items.map(i => i.productName).join(', ');
        const initial = review.user?.full_name ? review.user.full_name.charAt(0).toUpperCase() : '?';

        return (
            <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                    {review.user?.profile_image ? (
                        <Image source={{ uri: review.user.profile_image }} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{initial}</Text>
                        </View>
                    )}
                    <View style={styles.reviewerInfo}>
                        <Text style={styles.reviewerName}>{review.user?.full_name || 'Customer'}</Text>
                        <Text style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                <Text style={styles.itemsLabel}>Items: <Text style={{ fontFamily: 'DMSans_400Regular' }}>{itemNames}</Text></Text>

                <View style={styles.ratingRow}>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingBadgeLabel}>Product</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text style={styles.ratingBadgeScore}>{review.product_rating}</Text>
                        </View>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingBadgeLabel}>Delivery</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text style={styles.ratingBadgeScore}>{review.driver_rating}</Text>
                        </View>
                    </View>
                </View>

                {review.review_text && (
                    <Text style={styles.reviewText}>"{review.review_text}"</Text>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customer Reviews</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#1F5E2E" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1F5E2E']} />}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.overviewSection}>
                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreTitle}>Product Avg</Text>
                            <View style={styles.scoreCircle}>
                                <Text style={styles.scoreValue}>{avgProductRating}</Text>
                                <Ionicons name="star" size={24} color="#F59E0B" style={{ marginTop: 2 }} />
                            </View>
                            <Text style={styles.scoreSubtitle}>Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
                        </View>
                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreTitle}>Delivery Avg</Text>
                            <View style={styles.scoreCircle}>
                                <Text style={styles.scoreValue}>{avgDriverRating}</Text>
                                <Ionicons name="star" size={24} color="#1F5E2E" style={{ marginTop: 2 }} />
                            </View>
                            <Text style={styles.scoreSubtitle}>Driver service rating</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>All Reviews</Text>

                    {reviews.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>No reviews yet.</Text>
                            <Text style={styles.emptySubtext}>When customers rate their orders, they will appear here.</Text>
                        </View>
                    ) : (
                        reviews.map(renderReviewCard)
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
    headerTitle: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { padding: 20 },

    overviewSection: {
        flexDirection: 'row', gap: 15, marginBottom: 25,
    },
    scoreBox: {
        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
        alignItems: 'center', elevation: 2, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
        borderWidth: 1, borderColor: '#F0F0F0'
    },
    scoreTitle: { fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#666', marginBottom: 10 },
    scoreCircle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    scoreValue: { fontSize: 36, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    scoreSubtitle: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: '#999', textAlign: 'center' },

    sectionTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', marginBottom: 15 },

    reviewCard: {
        backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 15,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 5, borderWidth: 1, borderColor: '#F0F0F0'
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    avatarPlaceholder: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center'
    },
    avatarInitial: { fontSize: 18, fontFamily: 'DMSans_700Bold', color: '#1F5E2E' },
    reviewerInfo: { marginLeft: 12, flex: 1 },
    reviewerName: { fontSize: 15, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    reviewDate: { fontSize: 12, fontFamily: 'DMSans_400Regular', color: '#999', marginTop: 2 },

    itemsLabel: { fontSize: 12, fontFamily: 'DMSans_500Medium', color: '#666', marginBottom: 12 },

    ratingRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    ratingBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6,
        borderWidth: 1, borderColor: '#FEF3C7'
    },
    ratingBadgeLabel: { fontSize: 11, fontFamily: 'DMSans_500Medium', color: '#D97706' },
    ratingBadgeScore: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: '#B45309' },

    reviewText: {
        fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#333',
        lineHeight: 22, fontStyle: 'italic',
        backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8, marginTop: 4
    },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#666', marginTop: 15 },
    emptySubtext: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#999', marginTop: 5, textAlign: 'center', paddingHorizontal: 20 }
});
