import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onBack: () => void;
    userType: 'User' | 'Vendor';
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'delete'];

export default function LoginScreen({ onLoginSuccess, onBack, userType }: LoginScreenProps) {
    const insets = useSafeAreaInsets();
    const { setUserData, sendOtp, verifyOtp } = useUser();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleKeyPress = (key: string) => {
        if (loading) return;

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
            const { error } = await verifyOtp(formattedPhone, otp, userType);
            setLoading(false);

            if (error) {
                alert(`Verification Failed: ${error.message}`);
                setOtp('');
            } else {
                onLoginSuccess();
            }
        };

        if (step === 'phone' && phoneNumber.length === 10) {
            handlePhoneSubmit();
        }
        if (step === 'otp' && otp.length === 6) {
            handleOtpSubmit();
        }
    }, [phoneNumber, otp, step]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header Content */}
            <View style={styles.contentContainer}>
                {step === 'phone' ? (
                    <>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.subtext}>Continue Journey As {userType === 'Vendor' ? 'Farmer' : userType}</Text>

                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/twf-logo.png')}
                                style={styles.logo}
                                contentFit="contain"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Enter Your Phone number</Text>
                            <View style={styles.phoneInputBox}>
                                <Text style={[styles.phoneText, !phoneNumber && styles.placeholderText]}>
                                    {phoneNumber ? `+91-${phoneNumber}` : '+91-9113950801'}
                                </Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={[styles.logoContainer, { marginTop: 60, marginBottom: 40 }]}>
                            <Image
                                source={require('@/assets/images/twf-logo.png')}
                                style={styles.logo}
                                contentFit="contain"
                            />
                        </View>

                        <View style={styles.otpContainer}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <View key={index} style={[styles.otpBox, otp.length > index && styles.otpBoxFilled]}>
                                    <Text style={styles.otpText}>
                                        {otp[index] || ''}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.otpLabel}>Enter your OTP</Text>
                    </>
                )}
            </View>

            {/* Custom Keyboard */}
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
                            <View style={styles.backspaceKey}>
                                <Ionicons name="backspace-outline" size={24} color="#1F5E2E" />
                            </View>
                        ) : key === 'back' ? (
                            <View style={styles.backspaceKey}>
                                <Ionicons name="arrow-back" size={24} color="#1F5E2E" />
                            </View>
                        ) : key !== '' ? (
                            <Text style={styles.keyText}>{key}</Text>
                        ) : null}
                    </TouchableOpacity>
                ))}
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    welcomeText: {
        fontSize: 20, // Reduced from 24 to match image scale
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    subtext: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 40,
    },
    logoContainer: {
        width: 150,
        height: 150,
        marginBottom: 40,
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
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
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
});
