
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

export default function SupportScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();
    const { isDark } = useTheme();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // New Ticket Form State
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // Supabase is already imported from UserContext via useUser hook or we can import the client directly
    // Since useUser exposes user, we need to import supabase from lib if valid.
    // The previous implementation used user.id. 
    // We will use the supabase client directly.

    // We need to import the supabase client.
    // However, I will check if I can import it. The current imports don't show it.
    // I will modify imports first if needed, but let's see. 
    // Wait, I will use `supabase` from `@/lib/supabase` (need to add import).

    // Actually, I should update imports first.
    // But since I can only replace a chunk, I'll update the logic assuming imports are there or I'll add imports.
    // Ah, imports are at the top. I need a multi-edit or separate edits.
    // I'll update the component logic first.

    // Wait, let's use MULTI REPLACE to update imports and logic at once.
    // Ah, I am using `replace_file_content`.
    // I will replace the component body.

    const fetchTickets = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Updated to use Supabase
            // Import supabase from '@lib/supabase' needed at top. I will add it via import update later or now.
            // Using require or assuming import exists? No.
            // I'll inject the logic but I MUST add the import.
            // I will use a separate tool call for imports or assume the next step.

            // Actually, I'll update the logic to use `supabase` which I will import.
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            if (data) setTickets(data);

        } catch (e) {
            console.error("Failed to fetch tickets", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();

        // Optional: Realtime subscription
        const channel = supabase
            .channel('tickets_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tickets', filter: `user_id=eq.${user?.id}` },
                (payload) => {
                    fetchTickets();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleCreateTicket = async () => {
        if (!subject.trim() || !message.trim()) {
            alert("Please fill in both subject and message.");
            return;
        }

        if (!user) return;

        try {
            const newTicket = {
                user_id: user.id,
                subject,
                messages: [{
                    sender: 'User',
                    text: message,
                    timestamp: new Date().toISOString()
                }]
            };

            const { data, error } = await supabase
                .from('tickets')
                .insert([newTicket])
                .select();

            if (error) throw error;

            if (data) {
                setSubject('');
                setMessage('');
                setCreating(false);
                fetchTickets(); // Refresh list
                alert("Ticket created successfully!");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating ticket.");
        }
    };

    const renderTicket = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.ticketCard, isDark && { backgroundColor: '#1E1E1E', shadowColor: 'transparent' }]}
            onPress={() => router.push(`/support/${item.id}`)}
        >
            <View style={styles.ticketHeader}>
                <Text style={[styles.ticketSubject, isDark && { color: '#FFF' }]} numberOfLines={1}>{item.subject}</Text>
                <View style={[styles.statusBadge,
                item.status === 'Open' ? (isDark ? { backgroundColor: '#1E3E2E' } : styles.statusOpen) :
                    item.status === 'Closed' ? (isDark ? { backgroundColor: '#333' } : styles.statusClosed) : (isDark ? { backgroundColor: '#3E2723' } : styles.statusPending)
                ]}>
                    <Text style={[styles.statusText,
                    item.status === 'Open' ? (isDark ? { color: '#81C784' } : styles.statusTextOpen) :
                        item.status === 'Closed' ? (isDark ? { color: '#AAA' } : styles.statusTextClosed) : (isDark ? { color: '#FFCC80' } : styles.statusTextPending)
                    ]}>{item.status}</Text>
                </View>
            </View>
            <Text style={[styles.ticketPreview, isDark && { color: '#AAA' }]} numberOfLines={2}>
                {item.messages && item.messages.length > 0 ? item.messages[item.messages.length - 1].text : 'No messages'}
            </Text>
            <View style={[styles.ticketFooter, isDark && { borderTopColor: '#333' }]}>
                <Text style={[styles.ticketDate, isDark && { color: '#666' }]}>{new Date(item.last_updated || item.created_at || Date.now()).toLocaleDateString()}</Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#666' : '#999'} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, isDark && { backgroundColor: '#1E1E1E', borderBottomColor: '#333' }]}>
                <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Help & Support</Text>
                <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]} onPress={() => setCreating(!creating)}>
                    <Ionicons name={creating ? "close" : "add"} size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
            </View>

            {creating && (
                <View style={[styles.createForm, isDark && { backgroundColor: '#1E1E1E' }]}>
                    <Text style={[styles.formTitle, isDark && { color: '#FFF' }]}>New Support Ticket</Text>
                    <TextInput
                        style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#FFF' }]}
                        placeholder="Subject (e.g., Order Issue)"
                        placeholderTextColor={isDark ? '#888' : '#999'}
                        value={subject}
                        onChangeText={setSubject}
                    />
                    <TextInput
                        style={[styles.input, styles.textArea, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#FFF' }]}
                        placeholder="Describe your issue..."
                        placeholderTextColor={isDark ? '#888' : '#999'}
                        multiline
                        numberOfLines={4}
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity style={[styles.submitButton, isDark && { backgroundColor: '#4CAF50' }]} onPress={handleCreateTicket}>
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
                            <Ionicons name="chatbubbles-outline" size={48} color={isDark ? '#444' : '#ccc'} />
                            <Text style={[styles.emptyText, isDark && { color: '#FFF' }]}>No support tickets yet.</Text>
                            <Text style={[styles.emptySubtext, isDark && { color: '#888' }]}>Tap the + button to create one.</Text>
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
