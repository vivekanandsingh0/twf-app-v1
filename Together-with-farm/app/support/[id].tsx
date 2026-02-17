
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useUser } from '@/contexts/UserContext';

import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

// Helper Type
interface TicketMessage {
    sender: 'User' | 'Admin'; // or other roles
    text: string;
    timestamp: string;
}

export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();
    const { isDark } = useTheme();
    const [ticket, setTicket] = useState<any>(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);

    // Auto-scroll to bottom
    const scrollViewRef = useRef<ScrollView>(null);

    const fetchTicket = async () => {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) setTicket(data);
        } catch (e) {
            console.error("Failed to fetch ticket", e);
        }
    };

    useEffect(() => {
        fetchTicket();

        // Realtime subscription for this specific ticket
        const channel = supabase
            .channel(`ticket_${id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${id}` },
                (payload) => {
                    fetchTicket();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (ticket?.messages && scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [ticket?.messages]);

    const handleSendReply = async () => {
        if (!reply.trim()) return;
        setSending(true);

        try {
            // Append new message to existing array
            const newMessage: TicketMessage = {
                sender: 'User',
                text: reply,
                timestamp: new Date().toISOString()
            };

            const currentMessages = ticket?.messages || [];
            const updatedMessages = [...currentMessages, newMessage];

            const { error } = await supabase
                .from('tickets')
                .update({
                    messages: updatedMessages,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            setReply('');
            // fetchTicket will be triggered by realtime, but optimistic update is good practice
            // For now, we rely on fetchTicket or realtime
            fetchTicket();

        } catch (e) {
            console.error("Failed to send reply", e);
        } finally {
            setSending(false);
        }
    };

    if (!ticket) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Loading chat...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, isDark && { backgroundColor: '#1E1E1E', borderBottomColor: '#333' }]}>
                <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333' }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.headerTitle, isDark && { color: '#AAA' }]} numberOfLines={1}>#{ticket.id.split('-')[1]}</Text>
                    <Text style={[styles.headerSubtitle, isDark && { color: '#FFF' }]} numberOfLines={1}>{ticket.subject}</Text>
                </View>
                <View style={[styles.statusBadge,
                ticket.status === 'Open' ? (isDark ? { backgroundColor: '#1E3E2E' } : styles.statusOpen) : (isDark ? { backgroundColor: '#333' } : styles.statusClosed)
                ]}>
                    <Text style={[styles.statusText,
                    ticket.status === 'Open' ? (isDark ? { color: '#81C784' } : styles.statusTextOpen) : (isDark ? { color: '#AAA' } : styles.statusTextClosed)
                    ]}>{ticket.status}</Text>
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
            >
                {ticket.messages.map((msg: any, index: number) => {
                    const isUser = msg.sender === 'User';
                    return (
                        <View key={index} style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAdmin]}>
                            {!isUser && (
                                <View style={styles.adminAvatar}>
                                    <Ionicons name="headset" size={16} color="#fff" />
                                </View>
                            )}
                            <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAdmin, !isUser && isDark && { backgroundColor: '#333' }]}>
                                <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAdmin, !isUser && isDark && { color: '#FFF' }]}>{msg.text}</Text>
                                <Text style={[styles.msgTime, isUser ? styles.msgTimeUser : styles.msgTimeAdmin, !isUser && isDark && { color: '#AAA' }]}>
                                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputBar, isDark && { backgroundColor: '#1E1E1E', borderTopColor: '#333' }]}>
                    <TextInput
                        style={[styles.input, isDark && { backgroundColor: '#333', color: '#FFF' }]}
                        placeholder="Type a message..."
                        placeholderTextColor={isDark ? '#888' : '#999'}
                        value={reply}
                        onChangeText={setReply}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !reply.trim() && styles.sendButtonDisabled, isDark && !reply.trim() && { backgroundColor: '#333' }]}
                        onPress={handleSendReply}
                        disabled={!reply.trim() || sending}
                    >
                        <Ionicons name="send" size={20} color={!reply.trim() ? (isDark ? "#666" : "#ccc") : "#fff"} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'DMSans_500Medium',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#1A1A1A',
        fontFamily: 'DMSans_700Bold',
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusOpen: { backgroundColor: '#E8F5E9' },
    statusClosed: { backgroundColor: '#F5F5F5' },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    statusTextOpen: { color: '#2E7D32' },
    statusTextClosed: { color: '#757575' },

    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 20,
        paddingBottom: 40,
    },
    msgRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    msgRowUser: {
        justifyContent: 'flex-end',
    },
    msgRowAdmin: {
        justifyContent: 'flex-start',
    },
    adminAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1F5E2E',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    msgBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    msgBubbleUser: {
        backgroundColor: '#1F5E2E',
        borderBottomRightRadius: 2,
    },
    msgBubbleAdmin: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    msgText: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
    },
    msgTextUser: {
        color: '#fff',
    },
    msgTextAdmin: {
        color: '#333',
    },
    msgTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    msgTimeUser: {
        color: 'rgba(255,255,255,0.7)',
    },
    msgTimeAdmin: {
        color: '#999',
    },
    inputBar: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1F5E2E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#F5F5F5',
    },
});
