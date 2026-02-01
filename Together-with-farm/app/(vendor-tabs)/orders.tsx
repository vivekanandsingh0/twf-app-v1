import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useVendor, VendorOrder } from '@/contexts/VendorContext';

import { printToFileAsync, printAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function VendorOrdersScreen() {
    const insets = useSafeAreaInsets();
    const router = require('expo-router').useRouter();
    const { orders, updateOrderStatus, profile } = useVendor();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Pending', 'Preparing', 'On the Way', 'Delivered'];

    // Map Context Status to UI Status filters
    const getUIStatus = (status: VendorOrder['status']) => {
        if (status === 'Accepted') return 'Preparing';
        if (status === 'Shipped') return 'On the Way';
        return status;
    };

    const displayOrders = orders.filter(o => {
        const uiStatus = getUIStatus(o.status);
        if (activeFilter !== 'All' && uiStatus !== activeFilter) return false;

        const searchLower = searchQuery.toLowerCase();
        return o.id.toLowerCase().includes(searchLower) || o.customerName.toLowerCase().includes(searchLower);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getStatusColor = (status: VendorOrder['status']) => {
        switch (status) {
            case 'Pending': return '#D97706'; // Orange
            case 'Accepted': return '#1F5E2E'; // Green (Preparing)
            case 'Ready': return '#1F5E2E'; // Green
            case 'Shipped': return '#5B4DBC'; // Purple/Blue (On the Way)
            case 'Delivered': return '#666';
            default: return '#666';
        }
    };

    const itemsToString = (items: VendorOrder['items']) => {
        return items.map(i => `${i.quantity}x ${i.productName}`).join(', ');
    };

    const renderOrderCard = (order: VendorOrder) => {
        const uiStatus = getUIStatus(order.status);

        const handleDownloadInvoice = async () => {
            try {
                const date = new Date(order.date);
                const formattedDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                // CSS Barcode Generator (Simple visual simulation)
                const barcodeHtml = `
                    <div style="display: flex; height: 50px; justify-content: center; overflow: hidden;">
                        ${Array.from({ length: 40 }).map(() => {
                    const width = Math.random() > 0.5 ? 4 : 2;
                    return `<div style="width: ${width}px; height: 100%; background: #000; margin-right: 2px;"></div>`;
                }).join('')}
                    </div>
                    <div style="text-align: center; letter-spacing: 4px; font-family: monospace; font-size: 12px; margin-top: 4px;">${order.id}</div>
                `;

                const html = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                            <style>
                                body { font-family: 'Inter', sans-serif; color: #1F2937; line-height: 1.4; font-size: 12px; max-width: 800px; margin: 0 auto; background: #fff; padding: 20px; }
                                
                                /* Shipping Label Styles */
                                .shipping-label { border: 2px solid #000; padding: 20px; margin-bottom: 20px; position: relative; }
                                .label-header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                                .label-section { margin-bottom: 15px; }
                                .label-title { font-weight: 700; font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 4px; letter-spacing: 0.5px; }
                                .big-text { font-size: 16px; font-weight: 700; color: #000; }
                                .address-text { font-size: 14px; line-height: 1.4; }
                                
                                .cut-line { border-top: 2px dashed #999; margin: 30px 0; text-align: center; position: relative; }
                                .cut-line::after { content: '✂ Cut Here'; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #fff; padding: 0 10px; color: #999; font-size: 10px; }

                                /* Invoice Styles (Compact) */
                                .invoice-container { padding: 20px; border: 1px solid #ddd; }
                                .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                                .logo { font-size: 18px; font-weight: 700; color: #1F5E2E; text-transform: uppercase; }
                                
                                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
                                th { text-align: left; padding: 8px; background-color: #f9f9f9; border-bottom: 1px solid #ddd; }
                                td { padding: 8px; border-bottom: 1px solid #eee; }
                                .right { text-align: right; }
                                
                                .summary-row { display: flex; justify-content: space-between; padding: 4px 0; }
                                .total-row { font-weight: 700; font-size: 14px; border-top: 1px solid #000; margin-top: 8px; padding-top: 8px; }
                            </style>
                        </head>
                        <body>
                            <!-- SHIPPING LABEL -->
                            <div class="shipping-label">
                                <div class="label-header">
                                    <div style="width: 60%;">${barcodeHtml}</div>
                                    <div style="text-align: right;">
                                        <div style="border: 2px solid #000; padding: 5px 10px; font-weight: bold; display: inline-block;">STANDARD</div>
                                    </div>
                                </div>
                                
                                <div style="display: flex; gap: 20px;">
                                    <div style="flex: 1;">
                                        <div class="label-section">
                                            <div class="label-title">SHIP TO:</div>
                                            <div class="big-text">${order.customerName}</div>
                                            <div class="address-text">${order.deliveryAddress}</div>
                                            <div style="margin-top: 5px;">Phone: +91 XXXXX XXXXX</div>
                                        </div>
                                    </div>
                                    <div style="flex: 1; border-left: 1px solid #ccc; padding-left: 20px;">
                                        <div class="label-section">
                                            <div class="label-title">SOLD BY:</div>
                                            <div style="font-weight: 600;">${profile.businessName}</div>
                                            <div>${profile.address}</div>
                                        </div>
                                        <div class="label-section">
                                            <div class="label-title">ORDER DETAILS:</div>
                                            <div>Order #: <strong>${order.id}</strong></div>
                                            <div>Date: ${formattedDate}</div>
                                            <div>Weight: 0.5 kg (Approx)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="cut-line"></div>

                            <!-- INVOICE / PACKING SLIP -->
                            <div class="invoice-container">
                                <div class="header-row">
                                    <div>
                                        <div class="logo">${profile.businessName}</div>
                                        <div>Tax Invoice / Bill of Supply</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div>Invoice #: <strong>${order.id}</strong></div>
                                        <div>Date: ${formattedDate}</div>
                                    </div>
                                </div>

                                <table>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th class="right">Qty</th>
                                            <th class="right">Price</th>
                                            <th class="right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${item.productName}</td>
                                                <td class="right">${item.quantity}</td>
                                                <td class="right">₹${item.price}</td>
                                                <td class="right">₹${item.price * item.quantity}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>

                                <div style="display: flex; justify-content: flex-end;">
                                    <div style="width: 200px;">
                                        <div class="summary-row"><span>Subtotal:</span> <span>₹${order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span></div>
                                        <div class="summary-row"><span>Tax:</span> <span>₹${order.tax || 0}</span></div>
                                        <div class="summary-row"><span>Discount:</span> <span>-₹${order.discount || 0}</span></div>
                                        <div class="summary-row total-row"><span>Grand Total:</span> <span>₹${order.totalAmount}</span></div>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 20px; font-size: 10px; color: #666; text-align: center;">
                                    Returns Policy: Returns accepted within 7 days of delivery for damaged items only.
                                </div>
                            </div>
                        </body>
                    </html>
                `;

                if (Platform.OS === 'web') {
                    // Custom Web Printing Implementation to ensure isolation
                    const printWindow = window.open('', '', 'width=800,height=600');
                    if (printWindow) {
                        printWindow.document.write(html);
                        printWindow.document.close();
                        printWindow.focus();
                        // Wait for images/styles to load (though we are inline css) then print
                        setTimeout(() => {
                            printWindow.print();
                            printWindow.close();
                        }, 500);
                    } else {
                        // Fallback if popup blocked
                        await printAsync({ html });
                    }
                } else {
                    const { uri } = await printToFileAsync({ html, base64: false });
                    const filename = `Label_${order.id}.pdf`;
                    await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: `Label #${order.id}` });
                }
            } catch (error) {
                console.error(error);
                alert("Could not generate label");
            }
        };

        return (
            <View key={order.id} style={styles.card}>
                {/* Header Row */}
                <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => router.push({ pathname: '/vendor-order-details', params: { id: order.id } })}
                >
                    <View style={styles.userInfo}>
                        <Image
                            source={require('@/assets/images/3d-model-with-veg.png')} // Placeholder for user avatar
                            style={styles.userImage}
                            contentFit="cover"
                        />
                        <View>
                            <Text style={styles.userName}>{order.customerName}</Text>
                            <Text style={styles.orderId}>{order.id} <Ionicons name="chevron-forward" size={12} color="#999" /></Text>
                        </View>
                    </View>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {uiStatus}
                    </Text>
                </TouchableOpacity>

                {/* Order Details Box */}
                <View style={styles.detailsBox}>
                    <Text style={styles.itemsText} numberOfLines={2}>{itemsToString(order.items)}</Text>

                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <Text style={styles.amountValue}>₹{order.totalAmount}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    {order.status === 'Pending' && (
                        <>
                            <TouchableOpacity
                                style={[styles.primaryButton, { flex: 1 }]}
                                onPress={() => updateOrderStatus(order.id, 'Accepted')}
                            >
                                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryButtonText}>Accept Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="share-social-outline" size={20} color="#1A1A1A" />
                            </TouchableOpacity>
                        </>
                    )}

                    {(order.status === 'Accepted' || order.status === 'Ready') && (
                        <>
                            {order.status === 'Accepted' ? (
                                <TouchableOpacity
                                    style={[styles.primaryButton, { flex: 1 }]}
                                    onPress={() => updateOrderStatus(order.id, 'Shipped')}
                                >
                                    <Ionicons name="cube-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.primaryButtonText}>Mark as Dispatched</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.primaryButton, { flex: 1 }]}
                                    onPress={() => updateOrderStatus(order.id, 'Shipped')}
                                >
                                    <Ionicons name="bicycle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.primaryButtonText}>Dispatch Order</Text>
                                </TouchableOpacity>
                            )}

                            {/* Download Invoice Button */}
                            <TouchableOpacity style={styles.iconButton} onPress={handleDownloadInvoice}>
                                <Ionicons name="document-text-outline" size={20} color="#1F5E2E" />
                            </TouchableOpacity>
                        </>
                    )}

                    {order.status === 'Shipped' && (
                        <>
                            <TouchableOpacity
                                style={[styles.primaryButton, { flex: 1 }]}
                                onPress={() => updateOrderStatus(order.id, 'Delivered')}
                            >
                                <Ionicons name="checkmark-done-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryButtonText}>Verify Delivery</Text>
                            </TouchableOpacity>

                            {/* Download Invoice Button */}
                            <TouchableOpacity style={styles.iconButton} onPress={handleDownloadInvoice}>
                                <Ionicons name="document-text-outline" size={20} color="#1F5E2E" />
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Add for Delivered/Cancelled too if needed, e.g. for past lookup */}
                    {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                        <TouchableOpacity style={[styles.iconButton, { width: '100%', flexDirection: 'row', gap: 8 }]} onPress={handleDownloadInvoice}>
                            <Ionicons name="document-text-outline" size={20} color="#1F5E2E" />
                            <Text style={{ fontFamily: 'DMSans_700Bold', color: '#1F5E2E' }}>Download Invoice</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <View style={styles.titleRow}>
                        <Ionicons name="bag-handle" size={24} color="#1F5E2E" style={{ marginRight: 8 }} />
                        <Text style={styles.headerTitle}>Orders</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>GREENVALLEY FARM</Text>
                </View>

                <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{orders.filter(o => o.status === 'Pending').length}</Text>
                    </View>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Order ID or Customer"
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
                style={{ maxHeight: 60, marginBottom: 12 }}
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

            <ScrollView
                contentContainerStyle={styles.ordersList}
                showsVerticalScrollIndicator={false}
            >
                {displayOrders.map(renderOrderCard)}
                {displayOrders.length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>No orders found.</Text>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        color: '#529F5D', // Light green
        marginTop: 4,
        textTransform: 'uppercase',
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20, // Circular
        backgroundColor: '#F7F7F7',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#1F5E2E',
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'DMSans_700Bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        marginHorizontal: 20,
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
        paddingHorizontal: 20,
        gap: 12,
        paddingBottom: 4, // Add padding to avoid clipping shadow/border
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
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
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
    },
    activeFilterText: {
        color: '#FFFFFF',
    },
    inactiveFilterText: {
        color: '#1A1A1A',
    },
    ordersList: {
        paddingHorizontal: 20,
        gap: 16,
        paddingTop: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.03)',
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 48,
        height: 48,
        borderRadius: 12, // Somewhat squarish rounded
        marginRight: 12,
        backgroundColor: '#EEF',
    },
    userName: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    orderId: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
        marginTop: 2,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
    },
    detailsBox: {
        backgroundColor: '#F0F2F0', // Light grey box
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        gap: 12,
    },
    itemsText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
        lineHeight: 20,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    amountLabel: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: '#888', // Greenish grey
    },
    amountValue: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1F5E2E',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryButton: {
        height: 48,
        backgroundColor: '#1F5E2E',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
    },
    iconButton: {
        width: 48,
        height: 48,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
