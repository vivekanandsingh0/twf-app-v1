import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '@/contexts/UserContext';

interface Props {
    onLogout: () => void;
}

export default function VendorPendingScreen({ onLogout }: Props) {
    const insets = useSafeAreaInsets();
    const { userData } = useUser();

    const openWhatsApp = () => {
        const phone = '919876543210'; // Replace with your TWF support WhatsApp number
        const message = encodeURIComponent(
            `Hi TWF Team!\nI'm ${userData.fullName || 'a new farmer'} and I just registered on the Together With Farm app as a vendor.\nMy phone: ${userData.phoneNumber}\nPlease complete my onboarding process. 🙏`
        );
        Linking.openURL(`https://wa.me/${phone}?text=${message}`);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Top decorative bar */}
            <View style={styles.topBar}>
                <View style={styles.topBarInner} />
            </View>

            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconCircle}>
                    <Ionicons name="hourglass-outline" size={48} color="#D97706" />
                </View>

                {/* Title */}
                <Text style={styles.title}>Account Under Review</Text>
                <Text style={styles.subtitle}>
                    Your farmer/vendor account has been registered successfully! Our team needs to verify and activate your account before you can access the dashboard.
                </Text>

                {/* Steps Card */}
                <View style={styles.stepsCard}>
                    <Text style={styles.stepsTitle}>What happens next?</Text>

                    <View style={styles.step}>
                        <View style={[styles.stepDot, { backgroundColor: '#1F5E2E' }]}>
                            <Ionicons name="checkmark" size={14} color="#FFF" />
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepLabel}>Account Created</Text>
                            <Text style={styles.stepDesc}>Your profile is saved in our system</Text>
                        </View>
                    </View>

                    <View style={styles.stepLine} />

                    <View style={styles.step}>
                        <View style={[styles.stepDot, { backgroundColor: '#D97706' }]}>
                            <Text style={{ color: '#FFF', fontFamily: 'DMSans_700Bold', fontSize: 12 }}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepLabel}>Contact TWF Team</Text>
                            <Text style={styles.stepDesc}>Reach out via WhatsApp for onboarding</Text>
                        </View>
                    </View>

                    <View style={styles.stepLine} />

                    <View style={styles.step}>
                        <View style={[styles.stepDot, { backgroundColor: '#E5E7EB' }]}>
                            <Text style={{ color: '#999', fontFamily: 'DMSans_700Bold', fontSize: 12 }}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepLabel}>Get Approved</Text>
                            <Text style={styles.stepDesc}>Once approved, you can access everything</Text>
                        </View>
                    </View>
                </View>

                {/* WhatsApp Button */}
                <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp} activeOpacity={0.8}>
                    <Ionicons name="logo-whatsapp" size={22} color="#FFF" />
                    <Text style={styles.whatsappText}>Contact TWF Team on WhatsApp</Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={18} color="#999" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    topBar: {
        height: 6,
        backgroundColor: '#F3F4F6',
    },
    topBarInner: {
        height: '100%',
        width: '40%',
        backgroundColor: '#D97706',
        borderTopRightRadius: 3,
        borderBottomRightRadius: 3,
    },
    content: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 48,
        alignItems: 'center',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        borderWidth: 3,
        borderColor: '#FDE68A',
    },
    title: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    stepsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 28,
    },
    stepsTitle: {
        fontSize: 15,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 20,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepContent: {
        flex: 1,
    },
    stepLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    stepDesc: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
        marginTop: 2,
    },
    stepLine: {
        width: 2,
        height: 20,
        backgroundColor: '#E5E7EB',
        marginLeft: 13,
        marginVertical: 4,
    },
    whatsappButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#25D366',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        width: '100%',
        marginBottom: 16,
    },
    whatsappText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#FFF',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    logoutText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#999',
    },
});
