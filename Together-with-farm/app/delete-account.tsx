
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

export default function DeleteAccountScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { userData, signOut } = useUser();
    const { isDark } = useTheme();

    const [stage, setStage] = useState<'WARNING' | 'VERIFY_OTP' | 'DELETING'>('WARNING');
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [checkingOrders, setCheckingOrders] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const startTimer = () => setTimer(60);

    const checkActiveOrders = async () => {
        if (!userData.phoneNumber) {
            Alert.alert("Error", "No user profile found.");
            return;
        }

        setCheckingOrders(true);
        try {
            // Client-side quick check
            const { data: activeOrders, error } = await supabase
                .from('orders')
                .select('id, status')
                .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
                .not('status', 'in', '("Delivered","Cancelled","Returned")') // Active defined as NOT these statuses
                .limit(1);

            if (error) throw error;

            if (activeOrders && activeOrders.length > 0) {
                Alert.alert(
                    "Cannot Delete Account",
                    "You have active orders in progress. Please wait for them to be delivered or cancel them before deleting your account.",
                    [{ text: "View Orders", onPress: () => router.push('/orders') }, { text: "OK" }]
                );
                return;
            }

            // Proceed to OTP Verification
            startOtpVerification();
        } catch (e: any) {
            Alert.alert("Error Checking Orders", e.message);
        } finally {
            setCheckingOrders(false);
        }
    };

    const startOtpVerification = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone: userData.phoneNumber });
            if (error) throw error;

            setStage('VERIFY_OTP');
            startTimer();
            Alert.alert("OTP Sent", `Please verifying your identity. An OTP has been sent to ${userData.phoneNumber}.`);
        } catch (e: any) {
            Alert.alert("Failed to Send OTP", e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndDelete = async () => {
        if (otp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter the 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            // Verify OTP
            const { error: verifyError } = await supabase.auth.verifyOtp({
                phone: userData.phoneNumber,
                token: otp,
                type: 'sms'
            });

            if (verifyError) throw verifyError;

            // Proceed to Delete via RPC
            setStage('DELETING');

            // Call the RPC function we migrated
            const { error: deleteError } = await supabase.rpc('delete_own_account');

            if (deleteError) {
                // If remote delete fails (e.g. permissions), we try simpler flow or alert user
                // But specifically for 'active orders', the RPC should throw an exception we catch here.
                throw deleteError;
            }

            // Success!
            // Show Success Message -> Logout -> Splash
            Alert.alert(
                "Account Deleted",
                "Your account has been deleted successfully. We are sorry to see you go.",
                [{
                    text: "Goodbye",
                    onPress: async () => {
                        await signOut(); // Ensure local cleanup
                        router.replace('/'); // Go to splash/login
                    }
                }]
            );

        } catch (e: any) {
            Alert.alert("Deletion Failed", e.message);
            setStage('VERIFY_OTP'); // Go back to OTP stage on error (unless critical, but safe to allow retry)
        } finally {
            setLoading(false);
        }
    };

    if (stage === 'DELETING') {
        return (
            <View style={[styles.container, styles.centered, isDark && { backgroundColor: '#121212' }]}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <ActivityIndicator size="large" color="#FF453A" />
                <Text style={[styles.deletingText, isDark && { color: '#FFF' }]}>Deleting your account...</Text>
                <Text style={styles.deletingSubtext}>Please wait while we remove your data.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, isDark && { backgroundColor: '#121212', borderBottomColor: '#333' }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, isDark && { backgroundColor: '#333' }]}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Delete Account</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {stage === 'WARNING' && (
                    <View style={styles.warningContainer}>
                        <View style={styles.iconWrapper}>
                            <Ionicons name="warning" size={48} color="#FF453A" />
                        </View>
                        <Text style={[styles.warningTitle, isDark && { color: '#FFF' }]}>Are you sure you want to delete your account?</Text>

                        <View style={[styles.warningBox, isDark && { backgroundColor: '#3c1f1f', borderColor: '#5c2b2b' }]}>
                            <Text style={[styles.warningText, isDark && { color: '#ffb3b3' }]}>
                                • You will lose your entire order history.{"\n\n"}
                                • All your saved addresses and favourites will be removed.{"\n\n"}
                                • Account once deleted <Text style={{ fontWeight: 'bold' }}>cannot be restored</Text>.
                            </Text>
                        </View>

                        <Text style={[styles.instructionText, isDark && { color: '#AAA' }]}>
                            If you still wish to proceed, please confirm below. We will verify your identity via OTP before deleting.
                        </Text>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity
                            style={[styles.deleteButton, (checkingOrders || loading) && styles.disabledButton]}
                            onPress={checkActiveOrders}
                            disabled={checkingOrders || loading}
                        >
                            {checkingOrders ? (
                                <ActivityIndicator color="#FF453A" />
                            ) : (
                                <Text style={styles.deleteButtonText}>Proceed to Delete</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                            <Text style={styles.cancelButtonText}>Cancel & Keep Account</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {stage === 'VERIFY_OTP' && (
                    <View style={styles.otpContainer}>
                        <Text style={[styles.stepTitle, isDark && { color: '#FFF' }]}>Verify Identity</Text>
                        <Text style={[styles.stepDesc, isDark && { color: '#AAA' }]}>
                            Enter the 6-digit verification code sent to <Text style={{ fontWeight: 'bold', color: isDark ? '#FFF' : '#000' }}>{userData.phoneNumber}</Text>.
                        </Text>

                        <TextInput
                            style={[styles.input, isDark && { backgroundColor: '#333', color: '#FFF', borderColor: '#444' }]}
                            placeholder="Enter 6-digit OTP"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                            editable={!loading}
                        />

                        <TouchableOpacity
                            style={[styles.confirmDeleteButton, loading && styles.disabledButton]}
                            onPress={handleVerifyAndDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.confirmDeleteText}>Confirm Permanent Deletion</Text>
                            )}
                        </TouchableOpacity>

                        {timer > 0 ? (
                            <Text style={[styles.timerText, isDark && { color: '#AAA' }]}>Resend OTP in {timer}s</Text>
                        ) : (
                            <TouchableOpacity onPress={startOtpVerification} disabled={loading}>
                                <Text style={styles.resendLink}>Resend OTP</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    content: {
        padding: 24,
        flexGrow: 1,
    },
    warningContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFEBEA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    warningTitle: {
        fontSize: 22,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 24,
    },
    warningBox: {
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FFEBEE',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 24,
    },
    warningText: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#D32F2F',
        lineHeight: 24,
    },
    instructionText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 20,
    },
    deleteButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#FF453A',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    deleteButtonText: {
        color: '#FF453A',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
    cancelButton: {
        padding: 16,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
    },
    disabledButton: {
        opacity: 0.6,
    },
    otpContainer: {
        paddingTop: 20,
        gap: 20,
    },
    stepTitle: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    stepDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        marginBottom: 10,
    },
    confirmDeleteButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#FF453A',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF453A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmDeleteText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
    timerText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 8,
    },
    resendLink: {
        textAlign: 'center',
        color: '#1F5E2E',
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        textDecorationLine: 'underline',
        marginTop: 8,
    },
    deletingText: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginTop: 20,
        marginBottom: 8,
    },
    deletingSubtext: {
        fontSize: 14,
        color: '#666',
    },
});
