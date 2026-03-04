import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Clipboard,
    ToastAndroid,
    Platform,
    Alert,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isExpired(dateStr: string) {
    // You can add expiry logic if notifications carry an expiry field
    return false;
}

export default function PromotionsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { notifications, refreshNotifications } = useNotifications();
    const { isDark } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Only show promo type notifications
    const promoNotifications = notifications.filter(n => n.type === 'promo');

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshNotifications();
        setRefreshing(false);
    };

    const handleCopyCode = (code: string) => {
        Clipboard.setString(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);

        if (Platform.OS === 'android') {
            ToastAndroid.show(`Code "${code}" copied!`, ToastAndroid.SHORT);
        } else {
            Alert.alert('Copied!', `Coupon code "${code}" copied to clipboard.`);
        }
    };

    const bg = isDark ? '#121212' : '#FCFCFC';
    const cardBg = isDark ? '#1E1E1E' : '#fff';
    const textPrimary = isDark ? '#FFF' : '#1A1A1A';
    const textSecondary = isDark ? '#AAA' : '#666';
    const divider = isDark ? '#2A2A2A' : '#F0F0F0';

    return (
        <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.iconBtn, isDark && { backgroundColor: '#333' }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={22} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textPrimary }]}>Promotions & Vouchers</Text>
                <View style={{ width: 40 }} />
            </View>

            {promoNotifications.length === 0 ? (
                // Empty state
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconBg, isDark && { backgroundColor: '#1E1E1E' }]}>
                        <Ionicons name="gift-outline" size={48} color="#1F5E2E" />
                    </View>
                    <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Promotions Yet</Text>
                    <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                        Exclusive deals and coupon codes will appear here once they're available.
                    </Text>
                    <TouchableOpacity
                        style={styles.browseBtn}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={styles.browseBtnText}>Browse Products</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#1F5E2E']}
                            tintColor="#1F5E2E"
                        />
                    }
                >
                    {/* Hero Banner */}
                    <View style={[styles.heroBanner, isDark && { backgroundColor: '#1A3520' }]}>
                        <View>
                            <Text style={styles.heroLabel}>🎁 Active Offers</Text>
                            <Text style={styles.heroTitle}>{promoNotifications.length} Deal{promoNotifications.length > 1 ? 's' : ''} Available</Text>
                            <Text style={styles.heroSub}>Tap a code to copy and apply at checkout</Text>
                        </View>
                        <Ionicons name="pricetags" size={48} color="rgba(255,255,255,0.2)" />
                    </View>

                    {/* Promo Cards */}
                    {promoNotifications.map((promo, index) => {
                        const isCopied = copiedCode === promo.voucherCode;
                        const hasCode = !!promo.voucherCode;
                        const expired = isExpired(promo.createdAt);

                        return (
                            <View
                                key={promo.id}
                                style={[
                                    styles.promoCard,
                                    { backgroundColor: cardBg },
                                    expired && styles.expiredCard,
                                    isDark && { shadowColor: 'transparent', borderColor: '#2A2A2A', borderWidth: 1 }
                                ]}
                            >
                                {/* Card Top: left color strip */}
                                <View style={styles.cardStrip} />

                                <View style={styles.cardBody}>
                                    {/* Icon + Date row */}
                                    <View style={styles.cardTopRow}>
                                        <View style={[styles.promoIconBg, isDark && { backgroundColor: '#1A3520' }]}>
                                            <Ionicons name="gift-outline" size={20} color="#1F5E2E" />
                                        </View>
                                        <Text style={[styles.promoDate, { color: textSecondary }]}>
                                            {formatDate(promo.createdAt)}
                                        </Text>
                                        {expired && (
                                            <View style={styles.expiredBadge}>
                                                <Text style={styles.expiredBadgeText}>Expired</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Title & Body */}
                                    <Text style={[styles.promoTitle, { color: textPrimary }]}>{promo.title}</Text>
                                    <Text style={[styles.promoBody, { color: textSecondary }]}>{promo.body}</Text>

                                    {/* Coupon Code Row — only if code exists */}
                                    {hasCode && (
                                        <>
                                            <View style={[styles.divider, { backgroundColor: divider }]} />
                                            <TouchableOpacity
                                                style={[
                                                    styles.codeRow,
                                                    isDark && { backgroundColor: '#0D2B14' },
                                                    isCopied && styles.codeRowCopied,
                                                    expired && styles.codeRowExpired,
                                                ]}
                                                onPress={() => !expired && handleCopyCode(promo.voucherCode!)}
                                                disabled={expired}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.codeLeft}>
                                                    <Ionicons
                                                        name={isCopied ? 'checkmark-circle' : 'copy-outline'}
                                                        size={18}
                                                        color={isCopied ? '#4CAF50' : '#1F5E2E'}
                                                    />
                                                    <Text style={[styles.codeLabel, { color: isDark ? '#AAA' : '#888' }]}>
                                                        {isCopied ? 'Copied!' : 'Coupon Code'}
                                                    </Text>
                                                </View>
                                                <Text style={[
                                                    styles.codeText,
                                                    isCopied && { color: '#4CAF50' },
                                                    expired && { color: '#999' }
                                                ]}>
                                                    {promo.voucherCode}
                                                </Text>
                                                <View style={[
                                                    styles.copyBtn,
                                                    isCopied && { backgroundColor: '#4CAF50' },
                                                    expired && { backgroundColor: '#DDD' }
                                                ]}>
                                                    <Text style={styles.copyBtnText}>
                                                        {isCopied ? '✓' : 'COPY'}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    emptyIconBg: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        textAlign: 'center',
        lineHeight: 22,
    },
    browseBtn: {
        marginTop: 8,
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14,
    },
    browseBtnText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
        fontSize: 15,
    },

    // Content
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    // Hero Banner
    heroBanner: {
        backgroundColor: '#1F5E2E',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden',
    },
    heroLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
        marginBottom: 4,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        marginBottom: 4,
    },
    heroSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
    },

    // Promo Card
    promoCard: {
        borderRadius: 18,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    expiredCard: {
        opacity: 0.65,
    },
    cardStrip: {
        width: 5,
        backgroundColor: '#1F5E2E',
    },
    cardBody: {
        flex: 1,
        padding: 16,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    promoIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    promoDate: {
        flex: 1,
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
    },
    expiredBadge: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    expiredBadgeText: {
        color: '#D32F2F',
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
    },
    promoTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        marginBottom: 6,
    },
    promoBody: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginVertical: 14,
    },

    // Coupon Code Row
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FAF2',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 8,
    },
    codeRowCopied: {
        backgroundColor: '#E8F5E9',
    },
    codeRowExpired: {
        backgroundColor: '#F5F5F5',
    },
    codeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    codeLabel: {
        fontSize: 11,
        fontFamily: 'DMSans_400Regular',
    },
    codeText: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 15,
        color: '#1F5E2E',
        letterSpacing: 1.5,
    },
    copyBtn: {
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    copyBtnText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: 'DMSans_700Bold',
        letterSpacing: 0.5,
    },
});
