import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVendor } from '@/contexts/VendorContext';

export default function PayoutMethodScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { profile, updateProfile } = useVendor();

    const [accountHolderName, setAccountHolderName] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile.bankDetails) {
            setAccountHolderName(profile.bankDetails.accountHolderName);
            setBankName(profile.bankDetails.bankName);
            setAccountNumber(profile.bankDetails.accountNumber);
            setIfscCode(profile.bankDetails.ifscCode);
        }
    }, [profile]);

    const handleSave = async () => {
        if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
            Alert.alert("Missing Details", "Please fill in all bank details.");
            return;
        }

        setLoading(true);
        // Simulate async save
        setTimeout(() => {
            updateProfile({
                bankDetails: {
                    accountHolderName,
                    bankName,
                    accountNumber,
                    ifscCode
                }
            });
            setLoading(false);
            Alert.alert("Success", "Bank details verified and saved successfully.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        }, 1000);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payout Method</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionTitle}>Bank Account Details</Text>
                <Text style={styles.sectionSubtitle}>
                    Please provide accurate details to ensure secure and timely payments.
                </Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Account Holder Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Full name as per the bank records"
                        placeholderTextColor="#999"
                        value={accountHolderName}
                        onChangeText={setAccountHolderName}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Bank Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Bank name"
                        placeholderTextColor="#999"
                        value={bankName}
                        onChangeText={setBankName}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Account Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter account number"
                        placeholderTextColor="#999"
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        keyboardType="number-pad"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>IFSC Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter IFSC code"
                        placeholderTextColor="#999"
                        value={ifscCode}
                        onChangeText={text => setIfscCode(text.toUpperCase())}
                        autoCapitalize="characters"
                    />
                </View>

            </ScrollView>

            {/* Footer Button */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>{loading ? 'Verifying...' : 'Verify & Save'}</Text>
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
        height: 60,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginBottom: 30,
        lineHeight: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
        backgroundColor: '#fff',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    saveButton: {
        backgroundColor: '#1F5E2E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
});
