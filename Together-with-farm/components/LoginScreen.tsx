import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    ScrollView
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onBack: () => void;
    userType: 'User' | 'Vendor';
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'delete'];

export default function LoginScreen({ onLoginSuccess, onBack, userType }: LoginScreenProps) {
    const insets = useSafeAreaInsets();
    const { userData, setUserData, sendOtp, verifyOtp, updateProfile } = useUser();
    const { isDark } = useTheme();
    const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleKeyPress = (key: string) => {
        if (loading || step === 'name') return;

        if (key === 'back') {
            if (step === 'otp') {
                setStep('phone');
                setOtp('');
            } else {
                onBack();
            }
            return;
        }

        if (key === 'delete') {
            if (step === 'phone') {
                setPhoneNumber(prev => prev.slice(0, -1));
            } else {
                setOtp(prev => prev.slice(0, -1));
            }
        } else if (key !== '') {
            if (step === 'phone') {
                if (phoneNumber.length < 10) {
                    setPhoneNumber(prev => prev + key);
                }
            } else {
                if (otp.length < 6) {
                    setOtp(prev => prev + key);
                }
            }
        }
    };

    // Auto-proceed logic
    useEffect(() => {
        const handlePhoneSubmit = async () => {
            if (loading) return;
            setLoading(true);
            const formattedPhone = `+91${phoneNumber}`;
            const { error } = await sendOtp(formattedPhone);
            setLoading(false);

            if (error) {
                if (error.message.includes('Twilio')) {
                    alert(`SMS Config Error: The backend SMS provider is misconfigured. Please use a Test Phone Number (e.g. 1234567890) or check Supabase settings.`);
                } else {
                    alert(`Error: ${error.message}`);
                }
            } else {
                setStep('otp');
            }
        };

        const handleOtpSubmit = async () => {
            if (loading) return;
            setLoading(true);
            const formattedPhone = `+91${phoneNumber}`;
            // verifyOtp now handles fetching existing profile and setting userData
            const { session, error } = await verifyOtp(formattedPhone, otp, userType);
            setLoading(false);

            if (error) {
                alert(`Verification Failed: ${error.message}`);
                setOtp('');
            } else {
                // Check if name is needed
                // We need to check the updated context or the session return
                // verifyOtp updates userData in context, so we can check that, but state updates might be async.
                // However, verifyOtp is awaited.
                // Let's rely on the returned session/profile ideally, but context is updated.
                // But verifyOtp logic we just wrote checks existing profile.

                // We need to know if the name is 'Anonymous' or empty.
                // Since we can't easily access the *just updated* userData state here (closure),
                // we should rely on what verifyOtp did.
                // But verifyOtp logic: `const finalName = existingName ...`
                // If it returned session, it means successful login.

                // Let's fetch the profile one last time or trust the flow.
                // Ideally `verifyOtp` should return the profile.
                // But we can check `userData.fullName` in a useEffect or just assume if it's new.

                // Hack: We can just enable the name step if the user is new.
                // Check if name is 'Anonymous'
                // We will add a small delay or check properly.

                // Better: We check `userData` in a separate useEffect? No, that triggers on any change.

                // Let's try to proceed to Name step ALWAYS if we want to enforce it?
                // No, only if it's missing.

                // Let's assume for now we transition to 'name' step if session is valid.
                // Then inside 'name' step logic, we perceive if name is pre-filled.
                // If pre-filled with real name, we skip?
                // But we want to FORCE it for first time.

                // Let's look at `verifyOtp` again. It sets `fullName` in state.
                // So subsequent render has it.
                // But we are in the function closure.

                // Let's just go to 'name' step if name is 'Anonymous'.
                // But we don't know that yet here.

                // Let's update `onLoginSuccess` to be called ONLY if name is valid.
                setStep('name');
            }
        };

        if (step === 'phone' && phoneNumber.length === 10) {
            handlePhoneSubmit();
        }
        if (step === 'otp' && otp.length === 6) {
            handleOtpSubmit();
        }
    }, [phoneNumber, otp, step]);

    const handleNameSubmit = async () => {
        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }
        setLoading(true);
        // Date of birth and gender defaults are fine for now, we just want name.
        await updateProfile(name, '', '');
        setLoading(false);
        onLoginSuccess();
    };

    // Skip name step if already has a valid name? 
    // We can check on render of 'name' step.
    useEffect(() => {
        if (step === 'name' && userData.fullName && userData.fullName !== 'Anonymous') {
            // Already has name, skip
            onLoginSuccess();
        }
    }, [step, userData.fullName]);


    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
 
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Top Content */}
                <View style={styles.contentContainer}>
                {step === 'phone' ? (
                    <>
                        <Text style={[styles.welcomeText, isDark && { color: '#FFF' }]}>Welcome Back</Text>
                        <Text style={[styles.subtext, isDark && { color: '#AAA' }]}>Continue Journey As {userType === 'Vendor' ? 'Farmer' : 'Consumer'}</Text>

                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/twf-logo.png')}
                                style={styles.logo}
                                contentFit="contain"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, isDark && { color: '#FFF' }]}>Enter Your Phone number</Text>
                            <View style={[styles.phoneInputBox, isDark && { borderColor: '#333', backgroundColor: '#1E1E1E' }]}>
                                <Text style={[styles.phoneText, isDark && { color: '#FFF' }, !phoneNumber && styles.placeholderText]}>
                                    {phoneNumber ? `+91-${phoneNumber}` : '+91-9113950801'}
                                </Text>
                            </View>
                        </View>
                    </>
                ) : step === 'otp' ? (
                    <>
                        <View style={[styles.logoContainer, { marginTop: height < 700 ? 10 : 30, marginBottom: height < 700 ? 10 : 20 }]}>
                            <Image
                                source={require('@/assets/images/twf-logo.png')}
                                style={styles.logo}
                                contentFit="contain"
                            />
                        </View>

                        <View style={styles.otpContainer}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <View key={index} style={[styles.otpBox, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }, otp.length > index && (isDark ? { backgroundColor: '#1E3E2E', borderColor: '#1F5E2E' } : styles.otpBoxFilled)]}>
                                    <Text style={[styles.otpText, isDark && { color: '#FFF' }]}>
                                        {otp[index] || ''}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.otpLabel}>Enter your OTP</Text>
                    </>
                ) : (
                    /* NAME STEP */
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
                        <View style={[styles.logoContainer, { marginTop: 40, marginBottom: 20 }]}>
                            <Image
                                source={require('@/assets/images/twf-logo.png')}
                                style={styles.logo}
                                contentFit="contain"
                            />
                        </View>

                        <Text style={[styles.welcomeText, isDark && { color: '#FFF' }]}>One Last Thing</Text>
                        <Text style={[styles.subtext, isDark && { color: '#AAA' }]}>What should we call you?</Text>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, isDark && { color: '#FFF' }]}>Full Name</Text>
                            <TextInput
                                style={[styles.textInput, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#FFF' }]}
                                placeholder="e.g. Rahul Kumar"
                                placeholderTextColor={isDark ? '#888' : '#999'}
                                value={name}
                                onChangeText={setName}
                                autoFocus={false}
                                returnKeyType="done"
                                onSubmitEditing={handleNameSubmit}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, !name.trim() && styles.submitButtonDisabled]}
                            onPress={handleNameSubmit}
                            disabled={!name.trim() || loading}
                        >
                            <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Get Started'}</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                )}
                </View>
            </ScrollView>

            {/* Custom Keyboard - Only for Phone and OTP */}
            {step !== 'name' && (
                <View style={[styles.keyboardContainer, { paddingBottom: insets.bottom + 20 }]}>
                    {KEYS.map((key, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.keyButton}
                            onPress={() => handleKeyPress(key)}
                            disabled={key === ''}
                            activeOpacity={key === '' ? 1 : 0.7}
                        >
                            {key === 'delete' ? (
                                <View style={[styles.backspaceKey, isDark && { borderColor: '#FFF' }]}>
                                    <Ionicons name="backspace-outline" size={24} color={isDark ? '#FFF' : '#1F5E2E'} />
                                </View>
                            ) : key === 'back' ? (
                                <View style={[styles.backspaceKey, isDark && { borderColor: '#FFF' }]}>
                                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1F5E2E'} />
                                </View>
                            ) : key !== '' ? (
                                <Text style={[styles.keyText, isDark && { color: '#FFF' }]}>{key}</Text>
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: height < 700 ? 20 : 40,
        paddingBottom: 20,
    },
    welcomeText: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    subtext: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: height < 700 ? 10 : 20,
        textAlign: 'center',
    },
    logoContainer: {
        width: height < 700 ? 80 : 120,
        height: height < 700 ? 80 : 120,
        marginBottom: height < 700 ? 15 : 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    inputContainer: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#333',
        marginBottom: 12,
    },
    phoneInputBox: {
        width: '100%',
        height: 56,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    textInput: {
        width: '100%',
        height: 56,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
        backgroundColor: '#F9F9F9',
    },
    phoneText: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    placeholderText: {
        color: '#A0A0A0',
    },
    keyboardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 40,
        justifyContent: 'space-between',
    },
    keyButton: {
        width: '30%',
        height: height < 700 ? 60 : 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: height < 700 ? 5 : 10,
    },
    keyText: {
        fontSize: 24,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    backspaceKey: {
        width: 48,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#1F5E2E',
        borderRadius: 8,
    },

    // OTP Styles
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    otpBox: {
        width: 48,
        height: 56,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpBoxFilled: {
        borderColor: '#1F5E2E',
        backgroundColor: '#F1F8E9',
    },
    otpText: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    otpLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
    },

    // Name Step Buttons
    submitButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#1F5E2E',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
});
