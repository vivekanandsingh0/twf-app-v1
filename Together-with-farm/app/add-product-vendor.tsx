import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ImageBackground, Alert, Platform, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVendor } from '@/contexts/VendorContext';
import { useMarket } from '@/contexts/MarketContext';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 'Seafood'];

export default function AddProductVendorScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { addProduct: addVendorProduct, updateProduct, deleteProduct, products } = useVendor();
    // const { addProduct: addMarketProduct } = useMarket(); // Removed as Market updates via DB sync
    const { user } = useUser();

    const [productName, setProductName] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [productInfo, setProductInfo] = useState('');
    const [highlights, setHighlights] = useState<{ title: string; value: string }[]>([]);
    const [category, setCategory] = useState('Vegetables');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [quantity, setQuantity] = useState('');
    const [discountPercent, setDiscountPercent] = useState('');
    const [orderType, setOrderType] = useState<'Instant' | 'Pre-order'>('Instant');
    const [preorderDuration, setPreorderDuration] = useState('3');
    const DURATION_OPTIONS = ['1', '2', '3', '5', '7'];

    const params = useLocalSearchParams();
    // Ensure id is a string (handle array case)
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const isEditMode = !!id;

    React.useEffect(() => {
        if (id && products.length > 0) {
            const productToEdit = products.find(p => p.id === id);
            if (productToEdit) {
                setProductName(productToEdit.name);
                // Load existing images or fallback to single image if available
                if (productToEdit.images && productToEdit.images.length > 0) {
                    setImages(productToEdit.images);
                } else if (productToEdit.image && typeof productToEdit.image === 'object' && productToEdit.image.uri) {
                    setImages([productToEdit.image.uri]);
                } else if (productToEdit.image && typeof productToEdit.image === 'string') {
                    // rare case if it was just a string
                    setImages([productToEdit.image]);
                }

                setProductInfo(productToEdit.description);
                setHighlights(productToEdit.highlights && productToEdit.highlights.length > 0
                    ? productToEdit.highlights
                    : [{ title: '', value: '' }]);
                setCategory(productToEdit.category);
                setPrice(productToEdit.price.toString());
                setUnit(productToEdit.unit);
                setQuantity(productToEdit.stock.toString());
                setDiscountPercent((productToEdit as any).discount ? (productToEdit as any).discount.toString() : '');
                if ((productToEdit as any).order_type === 'pre-order') {
                    setOrderType('Pre-order');
                    setPreorderDuration(((productToEdit as any).preorder_duration || 3).toString());
                } else {
                    setOrderType('Instant');
                }
            }
        }
    }, [id, products]);

    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        if (images.length >= 3) {
            Alert.alert("Limit Reached", "You can only add up to 3 images.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            console.log('📸 [AddProduct] Image selected:', imageUri);

            // Just store the local URI - upload will happen when Save is clicked
            setImages([...images, imageUri]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        console.log("Handle Save Pressed");

        if (!productName || !price || !quantity) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        if (images.length === 0) {
            Alert.alert("Image Required", "Please add at least one product image.");
            return;
        }

        if (!user) {
            Alert.alert("Error", "You must be logged in to manage products.");
            return;
        }

        // Optimistic UI - Don't wait for DB
        try {
            const numericPrice = parseFloat(price);
            const numericStock = parseInt(quantity);
            // const productImage = require('@/assets/images/3d-model-with-veg.png'); // Mock image (number)

            if (isEditMode && id) {
                // UPDATE EXISTING (Optimistic)
                updateProduct(id, {
                    name: productName,
                    images: images,
                    image: images[0], // Primary for display logic compatibility
                    description: productInfo,
                    category,
                    price: numericPrice,
                    unit: unit || 'kg',
                    stock: numericStock,
                    highlights: highlights.filter(h => h.title || h.value), // Filter empty
                    order_type: orderType === 'Pre-order' ? 'pre-order' : 'instant',
                    preorder_duration: orderType === 'Pre-order' ? parseInt(preorderDuration) || 3 : 0,
                    discount: parseInt(discountPercent) || 0,
                } as any).catch((err: any) => {
                    console.error("Background update failed:", err);
                    Alert.alert("Error", "Failed to save changes to server.");
                });

                router.back(); // Navigate immediately

            } else {
                // CREATE NEW (Optimistic - Instant)
                addVendorProduct({
                    name: productName,
                    description: productInfo,
                    category,
                    price: numericPrice,
                    unit: unit || 'kg',
                    stock: numericStock,
                    highlights: highlights.filter(h => h.title || h.value),
                    status: 'Active',
                    image: images[0], // First image as primary
                    images: images,
                    order_type: orderType === 'Pre-order' ? 'pre-order' : 'instant',
                    preorder_duration: orderType === 'Pre-order' ? parseInt(preorderDuration) || 3 : 0,
                    discount: parseInt(discountPercent) || 0,
                } as any);

                // Don't wait, just go back
                router.back();
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };

    const handleDelete = () => {
        console.log("Delete button pressed");
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to delete this product?");
            if (confirmed) {
                performDelete();
            }
        } else {
            Alert.alert(
                "Delete Product",
                "Are you sure you want to delete this product? This action cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: performDelete
                    }
                ]
            );
        }
    };

    const performDelete = async () => {
        if (!id) return;

        console.log("Performing delete for ID:", id);
        // Optimistic Delete - Don't wait for Promise to resolve
        deleteProduct(id).catch(err => {
            console.error("Background delete failed:", err);
            Alert.alert("Error", "Failed to delete from server.");
        });

        router.back(); // Navigate immediately
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Product' : 'Add New Product'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Picker */}
                <Text style={styles.label}>Product Images (Min 1, Max 3)</Text>
                <View style={styles.imagesRow}>
                    {images.map((uri, index) => (
                        <View key={index} style={styles.imageSlot}>
                            {uri ? (
                                <Image source={{ uri }} style={styles.thumbnail} />
                            ) : (
                                <View style={styles.thumbnail} />
                            )}
                            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                                <Ionicons name="close-circle" size={24} color="#FF5252" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {images.length < 3 && (
                        <TouchableOpacity style={[styles.imageSlot, styles.addSlot]} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={32} color="#1F5E2E" />
                            <Text style={styles.addText}>Add</Text>
                        </TouchableOpacity>
                    )}
                </View>

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
                <View style={{ marginBottom: 20 }}>
                    {highlights.map((item, index) => (
                        <View key={index} style={styles.highlightRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                                placeholder="Title (e.g. Nutrient)"
                                placeholderTextColor="#9CA3AF"
                                value={item.title}
                                onChangeText={(text) => {
                                    const newHighlights = [...highlights];
                                    newHighlights[index].title = text;
                                    setHighlights(newHighlights);
                                }}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                                placeholder="Value (e.g. Rich)"
                                placeholderTextColor="#9CA3AF"
                                value={item.value}
                                onChangeText={(text) => {
                                    const newHighlights = [...highlights];
                                    newHighlights[index].value = text;
                                    setHighlights(newHighlights);
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    const newHighlights = highlights.filter((_, i) => i !== index);
                                    setHighlights(newHighlights);
                                }}
                                style={styles.removeHighlightBtn}
                            >
                                <Ionicons name="close-circle" size={24} color="#FF5252" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity
                        style={styles.addHighlightBtn}
                        onPress={() => setHighlights([...highlights, { title: '', value: '' }])}
                    >
                        <Ionicons name="add" size={20} color="#1F5E2E" />
                        <Text style={styles.addHighlightText}>Add Highlight</Text>
                    </TouchableOpacity>
                </View>

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

                {/* Discount */}
                <Text style={styles.label}>Discount (%)</Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 12 }]}
                        placeholder="e.g, 10"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={discountPercent}
                        onChangeText={(text) => setDiscountPercent(text.replace(/[^0-9]/g, ''))}
                    />
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {discountPercent && parseInt(discountPercent) > 0 && price ? (
                            <Text style={{ fontFamily: 'DMSans_500Medium', color: '#1F5E2E', fontSize: 14 }}>
                                Sale: ₹{(parseFloat(price) * (1 - parseInt(discountPercent) / 100)).toFixed(0)}/{unit || 'kg'}
                            </Text>
                        ) : (
                            <Text style={{ fontFamily: 'DMSans_400Regular', color: '#9CA3AF', fontSize: 13 }}>No discount</Text>
                        )}
                    </View>
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

                {/* Pre-order Duration - Only shown when Pre-order is selected */}
                {orderType === 'Pre-order' && (
                    <View style={styles.preorderSection}>
                        <View style={styles.preorderHeader}>
                            <Ionicons name="time-outline" size={20} color="#1F5E2E" />
                            <Text style={styles.preorderTitle}>Pre-order Duration</Text>
                        </View>
                        <Text style={styles.preorderSubtext}>How many days before the product is ready?</Text>
                        <View style={styles.durationContainer}>
                            {DURATION_OPTIONS.map((d) => (
                                <TouchableOpacity
                                    key={d}
                                    style={[styles.durationChip, preorderDuration === d && styles.durationChipActive]}
                                    onPress={() => setPreorderDuration(d)}
                                >
                                    <Text style={[styles.durationText, preorderDuration === d && styles.durationTextActive]}>
                                        {d} {parseInt(d) === 1 ? 'day' : 'days'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.customDurationRow}>
                            <Text style={styles.customDurationLabel}>Custom:</Text>
                            <TextInput
                                style={styles.customDurationInput}
                                placeholder="e.g, 10"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={preorderDuration}
                                onChangeText={(text) => setPreorderDuration(text.replace(/[^0-9]/g, ''))}
                            />
                            <Text style={styles.customDurationSuffix}>days</Text>
                        </View>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && { opacity: 0.7 }]}
                    activeOpacity={0.8}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.submitButtonText, { marginRight: 10 }]}>Processing...</Text>
                        </View>
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>{isEditMode ? 'Save Changes' : 'Submit for Approval'}</Text>
                        </>
                    )}
                </TouchableOpacity>

                {isEditMode && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        activeOpacity={0.8}
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        <Ionicons name="trash-outline" size={24} color="#FF5252" style={{ marginRight: 8 }} />
                        <Text style={styles.deleteButtonText}>Delete Product</Text>
                    </TouchableOpacity>
                )}

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
    imagesRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    imageSlot: {
        width: 100,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    removeBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    addSlot: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: '#1F5E2E',
        borderRadius: 16,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addText: {
        fontFamily: 'DMSans_500Medium',
        color: '#1F5E2E',
        fontSize: 12,
        marginTop: 4,
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
    preorderSection: {
        backgroundColor: '#F0FAF0',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    preorderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    preorderTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    preorderSubtext: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginBottom: 12,
    },
    durationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    durationChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C8E6C9',
        backgroundColor: '#FFFFFF',
    },
    durationChipActive: {
        backgroundColor: '#1F5E2E',
        borderColor: '#1F5E2E',
    },
    durationText: {
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
        color: '#4B5563',
    },
    durationTextActive: {
        color: '#FFFFFF',
    },
    customDurationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    customDurationLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#4B5563',
    },
    customDurationInput: {
        height: 40,
        width: 70,
        borderWidth: 1,
        borderColor: '#C8E6C9',
        borderRadius: 12,
        paddingHorizontal: 12,
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
    },
    customDurationSuffix: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
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
    deleteButton: {
        marginTop: 16,
        backgroundColor: '#FFF0F0',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FF5252',
    },
    deleteButtonText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#FF5252',
    },
    highlightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    removeHighlightBtn: {
        padding: 4,
    },
    addHighlightBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#E8F5E9',
    },
    addHighlightText: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
        marginLeft: 4,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    uploadingText: {
        marginTop: 8,
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: '#1F5E2E',
    },
});
