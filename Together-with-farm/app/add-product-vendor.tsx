import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ImageBackground, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useVendor } from '@/contexts/VendorContext';
import { useMarket } from '@/contexts/MarketContext';
import { useUser } from '@/contexts/UserContext';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 'Seafood'];

export default function AddProductVendorScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { addProduct: addVendorProduct } = useVendor();
    const { addProduct: addMarketProduct } = useMarket();
    const { user } = useUser();

    const [productName, setProductName] = useState('');
    const [productInfo, setProductInfo] = useState('');
    const [highlights, setHighlights] = useState('');
    const [category, setCategory] = useState('Vegetables');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState<'Instant' | 'Pre-order'>('Instant');

    const handleSave = () => {
        if (!productName || !price || !quantity) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        const numericPrice = parseFloat(price);
        const numericStock = parseInt(quantity);
        const productImage = require('@/assets/images/3d-model-with-veg.png'); // Mock image

        // 1. Add to Vendor Context (Private Management)
        addVendorProduct({
            name: productName,
            description: productInfo,
            category,
            price: numericPrice,
            unit: unit || 'kg',
            stock: numericStock,
            status: 'Active',
            image: productImage
        });

        // 2. Add to Market Context (Public Listing) - bridging the mock data
        addMarketProduct({
            vendorId: user?.id || 'vendor_def_001', // Link to current user or default
            name: productName,
            type: category, // Map Category to Type
            price: numericPrice,
            unit: unit || 'kg',
            image: productImage,
            description: productInfo,
            isFavorite: false,
            tag: highlights || category, // Use highlights as tag or fallback to category
            discount: ''
        });

        Alert.alert("Success", "Product added and listed in Market!");
        router.back();
    };

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
                {/* Image Picker */}
                <TouchableOpacity style={styles.imageContainer}>
                    <ImageBackground
                        source={require('@/assets/images/3d-model-with-veg.png')}
                        style={styles.imageBackground}
                        imageStyle={{ borderRadius: 16 }}
                    >
                        <View style={styles.cameraIconContainer}>
                            <Ionicons name="camera-outline" size={28} color="#FFFFFF" />
                        </View>
                    </ImageBackground>
                </TouchableOpacity>

                {/* Product Name */}
                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g, Organic Baby Spinach"
                    placeholderTextColor="#9CA3AF"
                    value={productName}
                    onChangeText={setProductName}
                />

                {/* Product Info */}
                <Text style={styles.label}>Product Info</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Description of this product ...."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    value={productInfo}
                    onChangeText={setProductInfo}
                />

                {/* Highlights */}
                <Text style={styles.label}>Highlights</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g, Vitamin A rich, Gluten Free"
                    placeholderTextColor="#9CA3AF"
                    value={highlights}
                    onChangeText={setHighlights}
                />

                {/* Category Selection */}
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryContainer}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Price per Unit */}
                <Text style={styles.label}>Price per Unit</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 12 }]}
                        placeholder="e.g, 40"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="e.g, kg"
                        placeholderTextColor="#9CA3AF"
                        value={unit}
                        onChangeText={setUnit}
                    />
                </View>

                {/* Available Quantity */}
                <Text style={styles.label}>Available Quantity</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g, 60"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                />

                {/* Order Type */}
                <View style={styles.orderTypeContainer}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.orderLabel}>Order Type</Text>
                        <Text style={styles.orderSubLabel}>Choose how customers can order</Text>
                    </View>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleItem, orderType === 'Instant' && styles.toggleActive]}
                            onPress={() => setOrderType('Instant')}
                        >
                            <Text style={[styles.toggleText, orderType === 'Instant' && styles.toggleTextActive]}>Instant</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleItem, orderType === 'Pre-order' && styles.toggleActive]}
                            onPress={() => setOrderType('Pre-order')}
                        >
                            <Text style={[styles.toggleText, orderType === 'Pre-order' && styles.toggleTextActive]}>Pre-order</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} activeOpacity={0.8} onPress={handleSave}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Submit for Approval</Text>
                </TouchableOpacity>

                {/* Bottom Padding */}
                <View style={{ height: 40 }} />
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
        borderRadius: 20,
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    imageContainer: {
        width: '100%',
        height: 180,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    label: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        paddingTop: 14,
        textAlignVertical: 'top',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    categoryChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    categoryChipActive: {
        backgroundColor: '#1F5E2E',
        borderColor: '#1F5E2E',
    },
    categoryText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#4B5563',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    dropdown: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dropdownText: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0, // margin is handled by input marginBottom
    },
    orderTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
    },
    orderLabel: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    orderSubLabel: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#9CA3AF',
        marginTop: 2,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        padding: 4,
    },
    toggleItem: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    toggleActive: {
        backgroundColor: '#1F5E2E',
    },
    toggleText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#4B5563',
    },
    toggleTextActive: {
        color: '#FFFFFF',
    },
    submitButton: {
        backgroundColor: '#1F5E2E',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#FFFFFF',
    },
});
