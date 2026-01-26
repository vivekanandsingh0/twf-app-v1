import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function AddProductVendorScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('');
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState<'Instant' | 'Pre-order'>('Instant');

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Product</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Picker Area */}
                <TouchableOpacity style={styles.imagePickerContainer}>
                    <ImageBackground
                        source={require('@/assets/images/3d-model-with-veg.png')} // Fallback/Placeholder background
                        style={styles.imageBackground}
                        imageStyle={{ borderRadius: 16, opacity: 0.8 }}
                    >
                        <View style={styles.cameraIconContainer}>
                            <Ionicons name="camera-outline" size={32} color="#FFFFFF" />
                        </View>
                    </ImageBackground>
                </TouchableOpacity>

                {/* Product Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Product Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g, Organic Baby Spinach"
                        placeholderTextColor="#999"
                        value={productName}
                        onChangeText={setProductName}
                    />
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity style={styles.dropdownInput}>
                        <Text style={styles.dropdownText}>Fresh Vegetables</Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Price per Unit */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Price per Unit</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 12 }]}
                            placeholder="e.g, 40"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="e.g, 400g"
                            placeholderTextColor="#999"
                            value={unit}
                            onChangeText={setUnit}
                        />
                    </View>
                </View>

                {/* Available Quantity */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Available Quantity (Units)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g, 60"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={setQuantity}
                    />
                </View>

                {/* Order Type */}
                <View style={styles.orderTypeCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.orderTypeLabel}>Order Type</Text>
                        <Text style={styles.orderTypeSubLabel}>Choose how customers can order</Text>
                    </View>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, orderType === 'Instant' && styles.activeToggle]}
                            onPress={() => setOrderType('Instant')}
                        >
                            <Text style={[styles.toggleText, orderType === 'Instant' && styles.activeToggleText]}>Instant</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, orderType === 'Pre-order' && styles.activeToggle]}
                            onPress={() => setOrderType('Pre-order')}
                        >
                            <Text style={[styles.toggleText, orderType === 'Pre-order' && styles.activeToggleText]}>Pre-order</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Submit for Approval</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    imagePickerContainer: {
        height: 180,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        backgroundColor: '#F0F0F0',
    },
    imageBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
    dropdownInput: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
    row: {
        flexDirection: 'row',
    },
    orderTypeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        marginBottom: 32,
    },
    orderTypeLabel: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    orderTypeSubLabel: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 20,
        padding: 2,
        height: 36,
    },
    toggleButton: {
        borderRadius: 18,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 70,
    },
    activeToggle: {
        backgroundColor: '#1F5E2E',
    },
    toggleText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#666',
    },
    activeToggleText: {
        color: '#FFFFFF',
    },
    submitButton: {
        backgroundColor: '#1F5E2E',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        boxShadow: '0px 4px 10px rgba(31, 94, 46, 0.3)',
        elevation: 5,
    },
    submitButtonText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#FFFFFF',
    },
});
