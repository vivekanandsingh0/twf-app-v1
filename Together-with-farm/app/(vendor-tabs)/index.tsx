import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface StockItem {
    id: string;
    name: string;
    price: string;
    quantity: number;
    inStock: boolean;
    image: any;
    status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
}

export default function VendorHomeScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Stock');

    // Dummy Data
    const [stockItems, setStockItems] = useState<StockItem[]>([
        {
            id: '1',
            name: 'Sweet Tomatoes',
            price: '$5.49/each',
            quantity: 12,
            inStock: true,
            image: require('@/assets/images/3d-model-with-veg.png'), // Placeholder
            status: 'IN STOCK'
        },
        {
            id: '2',
            name: 'Sweet Tomatoes',
            price: '$5.49/each',
            quantity: 12,
            inStock: true,
            image: require('@/assets/images/3d-model-with-veg.png'),
            status: 'LOW STOCK'
        },
        {
            id: '3',
            name: 'Sweet Tomatoes',
            price: '$5.49/each',
            quantity: 0,
            inStock: false,
            image: require('@/assets/images/3d-model-with-veg.png'),
            status: 'OUT OF STOCK'
        }
    ]);

    const filters = ['All Stock', 'Low Stock', 'Out of Stock', 'Roots'];

    const handleStockToggle = (id: string, value: boolean) => {
        setStockItems(prev => prev.map(item => {
            if (item.id === id) {
                const newInStock = value;
                let newStatus: StockItem['status'] = item.status;
                let newQuantity = item.quantity;

                if (!newInStock) {
                    newStatus = 'OUT OF STOCK';
                } else {
                    // When turning ON, ensure at least quantity 1 if it was 0
                    if (newQuantity === 0) newQuantity = 1;

                    if (newQuantity < 5) newStatus = 'LOW STOCK';
                    else newStatus = 'IN STOCK';
                }

                return { ...item, inStock: newInStock, status: newStatus, quantity: newQuantity };
            }
            return item;
        }));
    };

    const handleQuantityUpdate = (id: string, change: number) => {
        setStockItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(0, item.quantity + change);
                let newStatus: StockItem['status'] = 'IN STOCK';
                let newInStock = item.inStock;

                if (newQuantity === 0) {
                    newStatus = 'OUT OF STOCK';
                    newInStock = false;
                } else if (newQuantity < 5) {
                    newStatus = 'LOW STOCK';
                    newInStock = true;
                } else {
                    newStatus = 'IN STOCK';
                    newInStock = true;
                }

                return { ...item, quantity: newQuantity, status: newStatus, inStock: newInStock };
            }
            return item;
        }));
    };

    const renderStockItem = (item: StockItem) => (
        <View key={item.id} style={styles.stockCard}>
            <Image
                source={item.image}
                style={styles.stockImage}
                contentFit="cover"
            />
            <View style={styles.stockInfo}>
                <View style={styles.stockHeader}>
                    <Text style={styles.stockName}>{item.name}</Text>
                    <Switch
                        trackColor={{ false: '#E0E0E0', true: '#1F5E2E' }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor="#E0E0E0"
                        onValueChange={(value) => handleStockToggle(item.id, value)}
                        value={item.inStock}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                </View>
                <Text style={styles.stockPrice}>{item.price}</Text>

                <View style={styles.stockControls}>
                    <View style={styles.quantityControl}>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => handleQuantityUpdate(item.id, -1)}
                        >
                            <Text style={styles.qtyButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => handleQuantityUpdate(item.id, 1)}
                        >
                            <Text style={styles.qtyButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[
                        styles.statusBadge,
                        item.status === 'LOW STOCK' && styles.statusLow,
                        item.status === 'OUT OF STOCK' && styles.statusOut
                    ]}>
                        <Text style={[
                            styles.statusText,
                            item.status === 'LOW STOCK' && styles.statusTextLow,
                            item.status === 'OUT OF STOCK' && styles.statusTextOut
                        ]}>{item.status}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Green Header Background */}
            <View style={[styles.headerBackground, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Home</Text>
                        <Text style={styles.headerSubtitle}>Today, Oct 24- 12 Low Stock</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="#1F5E2E" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search 'Tomato' or 'Potato'"
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
                            style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Cards */}
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

                {/* Quick Stock Updates */}
                <Text style={styles.sectionTitle}>Quick Stock Updates</Text>
                <View style={styles.stockList}>
                    {stockItems.map(renderStockItem)}
                </View>

                {/* Business Insights */}
                <Text style={styles.sectionTitle}>Business Insights</Text>
                <View style={styles.insightsCard}>
                    <Text style={styles.insightsLabel}>Sales(₹)</Text>

                    {/* Dummy Chart Placeholder */}
                    <View style={styles.chartContainer}>
                        <View style={styles.chartLine} />
                        <View style={styles.chartLine} />
                        <View style={styles.chartLine} />
                        <View style={styles.chartLine} />

                        <View style={styles.chartLabels}>
                            <Text style={styles.chartLabelText}>40k</Text>
                            <Text style={styles.chartLabelText}>30k</Text>
                            <Text style={styles.chartLabelText}>20k</Text>
                            <Text style={styles.chartLabelText}>10k</Text>
                        </View>
                    </View>

                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    headerBackground: {
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#E0E0E0',
        marginTop: 4,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
    filtersContainer: {
        gap: 12,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeFilterChip: {
        backgroundColor: '#164522',
    },
    filterText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#1F5E2E', // Default text color for white chips
    },
    activeFilterText: {
        color: '#FFFFFF',
    },

    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statsCard: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 16,
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

    sectionTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    stockList: {
        marginBottom: 32,
        gap: 16,
    },
    stockCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
        backgroundColor: '#fff',
    },
    stockInfo: {
        flex: 1,
    },
    stockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    stockName: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    stockPrice: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium', // Green color in design?
        color: '#1F5E2E',
        marginBottom: 8,
    },
    stockControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 4,
    },
    qtyButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    qtyText: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginHorizontal: 8,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#B0BEC5', // Light gray for IN STOCK (default) based on image "IN STOCK" text
    },
    statusLow: {
        backgroundColor: '#FFECB3',
    },
    statusTextLow: {
        color: '#FFA000',
    },
    statusOut: {
        backgroundColor: 'transparent',
    },
    statusTextOut: {
        color: '#FF5252',
    },

    insightsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 300,
    },
    insightsLabel: {
        fontSize: 14,
        color: '#999',
        marginBottom: 20,
    },
    chartContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    chartLine: {
        height: 1,
        backgroundColor: '#F0F0F0',
        width: '100%',
        marginLeft: 30,
    },
    chartLabels: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        justifyContent: 'space-between',
    },
    chartLabelText: {
        fontSize: 12,
        color: '#999',
    },
});
