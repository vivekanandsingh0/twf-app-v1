
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useUser } from '@/contexts/UserContext';

export default function SupportScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // New Ticket Form State
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const getApiUrl = () => {
        const debuggerHost = Constants.expoConfig?.hostUri;
        const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
        const host = debuggerHost ? debuggerHost.split(':')[0] : localhost;
        return `http://${host}:3000`;
    };

    const fetchTickets = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const API_URL = getApiUrl();
            const res = await fetch(`${API_URL}/api/tickets?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (e) {
            console.error("Failed to fetch tickets", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchTickets, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const handleCreateTicket = async () => {
        if (!subject.trim() || !message.trim()) {
            alert("Please fill in both subject and message.");
            return;
        }

        try {
            const API_URL = getApiUrl();
            const res = await fetch(`${API_URL}/api/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    subject,
                    message
                })
            });

            if (res.ok) {
                setSubject('');
                setMessage('');
                setCreating(false);
                fetchTickets(); // Refresh list
                alert("Ticket created successfully!");
            } else {
                alert("Failed to create ticket.");
            }
        } catch (e) {
            alert("Error creating ticket.");
        }
    };

    const renderTicket = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.ticketCard}
            onPress={() => router.push(`/support/${item.id}`)}
        >
            <View style={styles.ticketHeader}>
                <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
                <View style={[styles.statusBadge,
                item.status === 'Open' ? styles.statusOpen :
                    item.status === 'Closed' ? styles.statusClosed : styles.statusPending
                ]}>
                    <Text style={[styles.statusText,
                    item.status === 'Open' ? styles.statusTextOpen :
                        item.status === 'Closed' ? styles.statusTextClosed : styles.statusTextPending
                    ]}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.ticketPreview} numberOfLines={2}>
                {item.messages && item.messages.length > 0 ? item.messages[item.messages.length - 1].text : 'No messages'}
            </Text>
            <View style={styles.ticketFooter}>
                <Text style={styles.ticketDate}>{new Date(item.last_updated).toLocaleDateString()}</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <TouchableOpacity style={styles.iconButton} onPress={() => setCreating(!creating)}>
                    <Ionicons name={creating ? "close" : "add"} size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            {creating && (
                <View style={styles.createForm}>
                    <Text style={styles.formTitle}>New Support Ticket</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Subject (e.g., Order Issue)"
                        value={subject}
                        onChangeText={setSubject}
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your issue..."
                        multiline
                        numberOfLines={4}
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleCreateTicket}>
                        <Text style={styles.submitButtonText}>Submit Ticket</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={tickets}
                renderItem={renderTicket}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchTickets} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No support tickets yet.</Text>
                            <Text style={styles.emptySubtext}>Tap the + button to create one.</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    listContent: {
        padding: 20,
    },
    ticketCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ticketSubject: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusOpen: { backgroundColor: '#E8F5E9' },
    statusClosed: { backgroundColor: '#F5F5F5' },
    statusPending: { backgroundColor: '#FFF3E0' },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    statusTextOpen: { color: '#2E7D32' },
    statusTextClosed: { color: '#757575' },
    statusTextPending: { color: '#EF6C00' },
    ticketPreview: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'DMSans_400Regular',
        marginBottom: 12,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    ticketDate: {
        fontSize: 12,
        color: '#999',
    },
    createForm: {
        backgroundColor: '#fff',
        padding: 20,
        margin: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    formTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        fontFamily: 'DMSans_400Regular',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#1F5E2E',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontFamily: 'DMSans_700Bold',
        fontSize: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#333',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
});
