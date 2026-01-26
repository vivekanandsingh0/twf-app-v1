import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface InventoryItem {
    id: string;
    name: string;
    description: string; // e.g., '45kg available', 'Out of Stock', 'Only 4 units left'
    price: string;
    status: 'IN STOCK' | 'RESTOCK' | 'LOW STOCK'; // Matches visual design text
    image: any;
}

export default function VendorInventoryScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter(); // Initialize router
    const [shopOpen, setShopOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Stock');

    const filters = ['All Stock', 'Low Stock', 'Organic', 'Roots', 'Daily'];

    const inventoryItems: InventoryItem[] = [
        {
            id: '1',
            name: 'Sweet Tomatoes',
            description: '45kg available',
            price: '$5.49/each',
            status: 'IN STOCK',
            image: require('@/assets/images/3d-model-with-veg.png'),
        },
        {
            id: '2',
            name: 'Sweet Tomatoes',
            description: 'Out of Stock',
            price: '$5.49/each',
            status: 'RESTOCK',
            image: require('@/assets/images/3d-model-with-veg.png'),
        },
        {
            id: '3',
            name: 'Sweet Tomatoes',
            description: 'Only 4 units left',
            price: '$5.49/each',
            status: 'LOW STOCK',
            image: require('@/assets/images/3d-model-with-veg.png'),
        },
    ];

    const getStatusColor = (status: InventoryItem['status']) => {
        switch (status) {
            case 'IN STOCK': return '#1F5E2E';
            case 'RESTOCK': return '#FF5252';
            case 'LOW STOCK': return '#FFA000';
            default: return '#1A1A1A';
        }
    };

    const getDescriptionColor = (status: InventoryItem['status']) => {
        switch (status) {
            case 'IN STOCK': return '#999999';
            case 'RESTOCK': return '#FF5252';
            case 'LOW STOCK': return '#FFA000';
            default: return '#999999';
        }
    };

    const renderInventoryItem = (item: InventoryItem) => (
        <View key={item.id} style={styles.itemCard}>
            <Image
                source={item.image}
                style={styles.itemImage}
                contentFit="cover"
            />
            <View style={styles.itemInfo}>
                <View style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                </View>

                <View style={styles.itemRow}>
                    <Text style={[styles.itemDescription, { color: getDescriptionColor(item.status) }]}>
                        {item.description}
                    </Text>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header Area */}
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Shop Status Card */}
                <View style={styles.shopStatusCard}>
                    <Text style={styles.shopStatusTitle}>SHOP STATUS</Text>
                    <Text style={styles.shopStatusSubtitle}>
                        {shopOpen ? 'Currently accepting orders' : 'Not accepting orders'}
                    </Text>
                    <Switch
                        trackColor={{ false: '#E0E0E0', true: '#1F5E2E' }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor="#E0E0E0"
                        onValueChange={setShopOpen}
                        value={shopOpen}
                        style={styles.switch}
                    />
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsLabel}>Active Orders</Text>
                        <Text style={styles.statsValue}>08</Text>
                    </View>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsLabel}>Out of Stock</Text>
                        <Text style={[styles.statsValue, { color: '#FF5252' }]}>03</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search inventory..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter ? styles.activeFilterChip : styles.inactiveFilterChip
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter ? styles.activeFilterText : styles.inactiveFilterText
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Inventory List */}
                <View style={styles.inventoryList}>
                    {inventoryItems.map(renderInventoryItem)}
                </View>

                {/* Spacer for FAB and TabBar */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.8}
                    onPress={() => router.push('/add-product-vendor')}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
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
        justifyContent: 'space-between', // Adjust to push notification to right
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        marginLeft: 'auto',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    shopStatusCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    shopStatusTitle: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    shopStatusSubtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium', // Keep it readable
        color: '#1F5E2E',
        marginBottom: 16,
    },
    switch: {
        alignSelf: 'flex-start',
        transform: Platform.OS === 'ios' ? [{ scaleX: 1.2 }, { scaleY: 1.2 }] : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
        // Screenshot shows a large-ish switch
        // Note: transform scale can misalign touch targets on some androids, but matches design intent
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statsCard: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'center',
    },
    statsLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#666',
        marginBottom: 8,
    },
    statsValue: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9', // Very light grey/white
        // screenshot looks like it might be same as background or slightly off? 
        // Actually screenshot shows "Search inventory..." inside a light grey pill
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
    filtersContainer: {
        gap: 12,
        marginBottom: 24,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeFilterChip: {
        backgroundColor: '#1F5E2E',
        borderColor: '#1F5E2E',
    },
    inactiveFilterChip: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
    },
    filterText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
    },
    activeFilterText: {
        color: '#FFFFFF',
    },
    inactiveFilterText: {
        color: '#1A1A1A',
    },
    inventoryList: {
        gap: 16,
    },
    itemCard: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
    },
    itemImage: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#999', // Matches "$5.49/each" grey color in screenshot
    },
    itemDescription: {
        fontSize: 13, // slightly smaller
        fontFamily: 'DMSans_500Medium',
    },
    statusText: {
        fontSize: 12, // small caps look
        fontFamily: 'DMSans_700Bold',
        textTransform: 'uppercase',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24, // TabBar height is usually ~60-80px. 
        // In the screenshot, the FAB is "floating" just above the tab bar.
        // However, since we are inside a Tab Screen, the TabBar is rendered by the parent layout.
        // We should position relative to the bottom of the screen but account for potential tab bar overlay?
        // Actually, absolute positioning here works relative to the View.
        alignSelf: 'center',
        zIndex: 10,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#164522', // Dark green matching tab bar active state
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 4px 10px rgba(31, 94, 46, 0.4)',
        elevation: 6,
    }
});
