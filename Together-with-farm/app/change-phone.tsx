
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

type Stage = 'VERIFY_CURRENT' | 'ENTER_NEW' | 'VERIFY_NEW';

export default function ChangePhoneScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { userData, setUserData } = useUser();
    const { isDark } = useTheme();

    const [stage, setStage] = useState<Stage>('VERIFY_CURRENT');
    const [loading, setLoading] = useState(false);

    // Stage 1 Inputs
    const [currentOtp, setCurrentOtp] = useState('');
    const [otpSentCurrent, setOtpSentCurrent] = useState(false);

    // Stage 2 Inputs
    const [newPhone, setNewPhone] = useState('');

    // Stage 3 Inputs
    const [newOtp, setNewOtp] = useState('');

    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // --- Helpers ---
    const startTimer = () => setTimer(60);

    // --- Stage 1: Verify Current Number ---

    const sendOtpToCurrent = async () => {
        if (!userData.phoneNumber) {
            Alert.alert("Error", "No current phone number found.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone: userData.phoneNumber });
            if (error) throw error;
            setOtpSentCurrent(true);
            startTimer();
            Alert.alert("OTP Sent", `An OTP has been sent to ${userData.phoneNumber}`);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyCurrentOtp = async () => {
        if (!currentOtp || currentOtp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter a 6-digit OTP.");
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: userData.phoneNumber,
                token: currentOtp,
                type: 'sms'
            });

            if (error) throw error;
            if (data.session) {
                // Success
                setStage('ENTER_NEW');
            } else {
                Alert.alert("Failed", "Verification failed. Please try again.");
            }
        } catch (e: any) {
            Alert.alert("Verification Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Stage 2: Enter New Number ---

    const sendOtpToNew = async () => {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!newPhone.match(phoneRegex)) {
            Alert.alert("Invalid Phone", "Please enter a valid phone number (e.g. +91XXXXXXXXXX)");
            return;
        }
        if (newPhone === userData.phoneNumber) {
            Alert.alert("Same Number", "New number cannot be the same as the current number.");
            return;
        }

        setLoading(true);
        try {
            // Trigger Phone Change Flow
            const { data, error } = await supabase.auth.updateUser({ phone: newPhone });
            if (error) throw error;

            setStage('VERIFY_NEW');
            startTimer();
            Alert.alert("OTP Sent", `An OTP has been sent to ${newPhone}`);
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Stage 3: Verify New Number ---

    const verifyNewOtp = async () => {
        if (!newOtp || newOtp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter a 6-digit OTP.");
            return;
        }
        setLoading(true);
        try {
            // Verify and Update
            const { data, error } = await supabase.auth.verifyOtp({
                phone: newPhone,
                token: newOtp,
                type: 'phone_change'
            });

            if (error) throw error;

            if (data.user) {
                // Determine user type - assuming 'User' if not present, or fetch from somewhere else if critically needed.
                // But we are just updating phone, role should persist. 
                // We do need to update PUBLIC profile manually if not handled by triggers.

                const updates = {
                    phone_number: newPhone,
                    updated_at: new Date().toISOString(),
                };

                // We use data.user.id
                await supabase.from('profiles').update(updates).eq('id', data.user.id);

                // Start local update
                setUserData({ phoneNumber: newPhone });

                Alert.alert("Success", "Your phone number has been updated successfully.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                throw new Error("Verification failed.");
            }
        } catch (e: any) {
            Alert.alert("Update Failed", e.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Render Helpers ---

    const renderHeader = () => (
        <View style={[styles.header, isDark && { backgroundColor: '#1E1E1E', borderBottomColor: '#333' }]}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, isDark && { backgroundColor: '#333' }]}>
                <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Change Mobile Number</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderStage1 = () => (
        <View style={styles.stageContainer}>
            <Text style={[styles.stepTitle, isDark && { color: '#FFF' }]}>Step 1: Verify Current Number</Text>
            <Text style={[styles.stepDesc, isDark && { color: '#AAA' }]}>
                We need to verify your identity before changing your number.
                Your current number is <Text style={{ fontWeight: 'bold', color: isDark ? '#81C784' : '#1F5E2E' }}>{userData.phoneNumber}</Text>.
            </Text>

            {!otpSentCurrent ? (
                <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.disabledButton]}
                    onPress={sendOtpToCurrent}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP to Current Number</Text>}
                </TouchableOpacity>
            ) : (
                <View style={styles.otpSection}>
                    <TextInput
                        style={[styles.input, isDark && { backgroundColor: '#333', color: '#FFF', borderColor: '#444' }]}
                        placeholder="Enter 6-digit OTP"
                        placeholderTextColor={isDark ? '#888' : '#999'}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={currentOtp}
                        onChangeText={setCurrentOtp}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.disabledButton]}
                        onPress={verifyCurrentOtp}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Current Number</Text>}
                    </TouchableOpacity>

                    {timer > 0 ? (
                        <Text style={[styles.timerText, isDark && { color: '#AAA' }]}>Resend OTP in {timer}s</Text>
                    ) : (
                        <TouchableOpacity onPress={sendOtpToCurrent} disabled={loading}>
                            <Text style={styles.resendLink}>Resend OTP</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    const renderStage2 = () => (
        <View style={styles.stageContainer}>
            <Text style={[styles.stepTitle, isDark && { color: '#FFF' }]}>Step 2: Enter New Number</Text>
            <Text style={[styles.stepDesc, isDark && { color: '#AAA' }]}>Please enter your new 10-digit mobile number.</Text>

            <TextInput
                style={[styles.input, isDark && { backgroundColor: '#333', color: '#FFF', borderColor: '#444' }]}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={isDark ? '#888' : '#999'}
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
                editable={!loading}
            />

            <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={sendOtpToNew}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP to New Number</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderStage3 = () => (
        <View style={styles.stageContainer}>
            <Text style={[styles.stepTitle, isDark && { color: '#FFF' }]}>Step 3: Verify New Number</Text>
            <Text style={[styles.stepDesc, isDark && { color: '#AAA' }]}>
                Enter the OTP sent to <Text style={{ fontWeight: 'bold', color: isDark ? '#81C784' : '#1F5E2E' }}>{newPhone}</Text>.
            </Text>

            <TextInput
                style={[styles.input, isDark && { backgroundColor: '#333', color: '#FFF', borderColor: '#444' }]}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={isDark ? '#888' : '#999'}
                keyboardType="number-pad"
                maxLength={6}
                value={newOtp}
                onChangeText={setNewOtp}
                editable={!loading}
            />

            <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={verifyNewOtp}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Update Number</Text>}
            </TouchableOpacity>

            {timer > 0 ? (
                <Text style={[styles.timerText, isDark && { color: '#AAA' }]}>Resend OTP in {timer}s</Text>
            ) : (
                <TouchableOpacity onPress={sendOtpToNew} disabled={loading}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            {renderHeader()}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {stage === 'VERIFY_CURRENT' && renderStage1()}
                    {stage === 'ENTER_NEW' && renderStage2()}
                    {stage === 'VERIFY_NEW' && renderStage3()}
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
    },
    stageContainer: {
        gap: 20,
    },
    stepTitle: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    stepDesc: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
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
    },
    primaryButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#1F5E2E',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#1F5E2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#A5D6A7',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
    otpSection: {
        gap: 16,
        width: '100%',
    },
    timerText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 8,
        fontFamily: 'DMSans_400Regular',
    },
    resendLink: {
        textAlign: 'center',
        color: '#1F5E2E',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
        fontFamily: 'DMSans_700Bold',
        textDecorationLine: 'underline',
    },
});
