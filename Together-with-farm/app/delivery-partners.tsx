import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    TextInput, Modal, Alert, ActivityIndicator, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DeliveryPartner {
    id: string;
    vendor_id: string;
    name: string;
    phone: string;
    photo_url: string | null;
    created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
    name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function DeliveryPartnersScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useUser();

    const [partners, setPartners] = useState<DeliveryPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [form, setForm] = useState({ name: '', phone: '', photoUri: null as string | null });
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const proxyUrl = (url?: any) => {
        if (typeof url === 'string') {
            return url.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev');
        }
        if (url && typeof url === 'object' && typeof url.uri === 'string') {
            return { ...url, uri: url.uri.replace('ftnkpsaxxdbdnrkxtvkt.supabase.co', 'tiny-base-2323twf0api.rksuccessor.workers.dev') };
        }
        return url;
    };

    // ── Fetch partners from Supabase ─────────────────────────────────────
    const fetchPartners = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('delivery_partners')
                .select('*')
                .eq('vendor_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const mappedData = data?.map(d => ({ ...d, photo_url: proxyUrl(d.photo_url) })) || [];
            setPartners(mappedData);
        } catch (e) {
            console.error('Failed to fetch delivery partners:', e);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useFocusEffect(useCallback(() => { fetchPartners(); }, [fetchPartners]));

    // ── Pick photo ────────────────────────────────────────────────────────
    const pickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            setForm(f => ({ ...f, photoUri: result.assets[0].uri }));
        }
    };

    // ── Upload photo to Supabase Storage ──────────────────────────────────
    const uploadPhoto = async (uri: string): Promise<string | null> => {
        setUploadingPhoto(true);
        try {
            const filename = `${user?.id}_${Date.now()}.jpg`;
            const response = await fetch(uri);
            const blob = await response.blob();

            const { data, error } = await supabase.storage
                .from('delivery-partners')
                .upload(filename, blob, { contentType: 'image/jpeg', upsert: true });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('delivery-partners')
                .getPublicUrl(data.path);

            return urlData.publicUrl;
        } catch (e) {
            console.error('Photo upload failed:', e);
            return null;
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ── Add partner ───────────────────────────────────────────────────────
    const handleAdd = async () => {
        const name = form.name.trim();
        const phone = form.phone.trim();

        if (!name) { Alert.alert('Name required', 'Please enter the partner\'s name.'); return; }
        if (!phone || phone.length < 10) { Alert.alert('Valid phone required', 'Enter a 10-digit phone number.'); return; }
        if (!user?.id) { Alert.alert('Error', 'Vendor ID not found. Please re-login.'); return; }
        const vendorId = user.id;
        if (!vendorId) { Alert.alert('Error', 'Vendor ID not found. Please re-login.'); return; }

        setSaving(true);
        try {
            // Upload photo if selected
            let photoUrl: string | null = null;
            if (form.photoUri) {
                photoUrl = await uploadPhoto(form.photoUri);
            }

            const { error } = await supabase.from('delivery_partners').insert({
                vendor_id: vendorId,
                name,
                phone,
                photo_url: photoUrl,
            });

            if (error) throw error;

            await fetchPartners();
            setModalVisible(false);
            setForm({ name: '', phone: '', photoUri: null });
        } catch (e) {
            console.error('Failed to add partner:', e);
            Alert.alert('Error', 'Could not add delivery partner. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete partner ────────────────────────────────────────────────────
    const handleDelete = (partner: DeliveryPartner) => {
        Alert.alert(
            'Remove Partner',
            `Remove ${partner.name} from your delivery team?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete photo from storage if exists
                            if (partner.photo_url) {
                                const path = partner.photo_url.split('/delivery-partners/')[1];
                                if (path) await supabase.storage.from('delivery-partners').remove([path]);
                            }
                            const { error } = await supabase
                                .from('delivery_partners')
                                .delete()
                                .eq('id', partner.id);
                            if (error) throw error;
                            setPartners(prev => prev.filter(p => p.id !== partner.id));
                        } catch (e) {
                            Alert.alert('Error', 'Failed to remove partner.');
                        }
                    },
                },
            ]
        );
    };

    // ── Render partner card ───────────────────────────────────────────────
    const renderPartner = (partner: DeliveryPartner) => (
        <View key={partner.id} style={styles.card}>
            {partner.photo_url ? (
                <Image source={{ uri: partner.photo_url }} style={styles.avatar} contentFit="cover" />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{getInitials(partner.name)}</Text>
                </View>
            )}

            <View style={styles.cardInfo}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={14} color="#666" />
                    <Text style={styles.partnerPhone}>{partner.phone}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(partner)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <Ionicons name="trash-outline" size={20} color="#D32F2F" />
            </TouchableOpacity>
        </View>
    );

    // ─────────────────────────────────────────────────────────────────────
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Partners</Text>
                <TouchableOpacity style={styles.addHeaderBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#1F5E2E" />
                </View>
            ) : partners.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                        <Ionicons name="bicycle-outline" size={56} color="#1F5E2E" />
                    </View>
                    <Text style={styles.emptyTitle}>No Delivery Partners Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Add your delivery team members so they can be assigned to orders.
                    </Text>
                    <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setModalVisible(true)}>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.emptyAddBtnText}>Add First Partner</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.countLabel}>
                        {partners.length} partner{partners.length !== 1 ? 's' : ''} added
                    </Text>
                    {partners.map(renderPartner)}
                    <View style={{ height: 80 }} />
                </ScrollView>
            )}

            {/* FAB */}
            {!loading && partners.length > 0 && (
                <TouchableOpacity
                    style={[styles.fab, { bottom: insets.bottom + 24 }]}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.85}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            {/* ── Add Partner Modal ─────────────────────────────────────────── */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />
                <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>

                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetTitle}>Add Delivery Partner</Text>

                    {/* Photo picker */}
                    <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto} activeOpacity={0.8}>
                        {form.photoUri ? (
                            <Image source={{ uri: form.photoUri }} style={styles.photoPreview} contentFit="cover" />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                {uploadingPhoto ? (
                                    <ActivityIndicator color="#999" />
                                ) : (
                                    <>
                                        <Ionicons name="camera-outline" size={30} color="#999" />
                                        <Text style={styles.photoLabel}>Add photo</Text>
                                    </>
                                )}
                            </View>
                        )}
                        {form.photoUri && (
                            <View style={styles.photoEditBadge}>
                                <Ionicons name="pencil" size={12} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name="person-outline" size={18} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Raju Kumar"
                                placeholderTextColor="#BBB"
                                value={form.name}
                                onChangeText={t => setForm(f => ({ ...f, name: t }))}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone Number *</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name="call-outline" size={18} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="10-digit mobile number"
                                placeholderTextColor="#BBB"
                                value={form.phone}
                                onChangeText={t => setForm(f => ({ ...f, phone: t.replace(/[^0-9]/g, '') }))}
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.75 }]}
                        onPress={handleAdd}
                        disabled={saving}
                        activeOpacity={0.85}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveBtnText}>Add Partner</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                        setModalVisible(false);
                        setForm({ name: '', phone: '', photoUri: null });
                    }}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, height: 60, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold', color: '#1A1A1A' },
    addHeaderBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#1F5E2E', alignItems: 'center', justifyContent: 'center',
    },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Empty
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyIcon: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },
    emptyTitle: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
    emptySubtitle: {
        fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#666',
        textAlign: 'center', lineHeight: 22, marginBottom: 32,
    },
    emptyAddBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#1F5E2E', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30,
    },
    emptyAddBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans_700Bold' },

    // List
    listContent: { padding: 20 },
    countLabel: { fontSize: 13, fontFamily: 'DMSans_500Medium', color: '#999', marginBottom: 14 },

    // Card
    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 16, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#EFEFEF',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4,
    },
    avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E0E0E0' },
    avatarPlaceholder: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#1F5E2E', alignItems: 'center', justifyContent: 'center',
    },
    avatarInitials: { color: '#fff', fontSize: 18, fontFamily: 'DMSans_700Bold' },
    cardInfo: { flex: 1, marginLeft: 14 },
    partnerName: { fontSize: 16, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', marginBottom: 4 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    partnerPhone: { fontSize: 14, fontFamily: 'DMSans_400Regular', color: '#555' },
    deleteBtn: { padding: 8 },

    // FAB
    fab: {
        position: 'absolute', right: 20, width: 56, height: 56,
        borderRadius: 28, backgroundColor: '#1F5E2E',
        alignItems: 'center', justifyContent: 'center',
        elevation: 6, shadowColor: '#1F5E2E',
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
    },

    // Modal
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 24,
        borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 16,
    },
    sheetHandle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0',
        alignSelf: 'center', marginBottom: 20,
    },
    sheetTitle: { fontSize: 20, fontFamily: 'DMSans_700Bold', color: '#1A1A1A', marginBottom: 24, textAlign: 'center' },

    // Photo
    photoPicker: { alignSelf: 'center', marginBottom: 24 },
    photoPreview: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#1F5E2E' },
    photoPlaceholder: {
        width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0F0F0',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed',
    },
    photoLabel: { fontSize: 10, color: '#999', marginTop: 4, fontFamily: 'DMSans_400Regular' },
    photoEditBadge: {
        position: 'absolute', bottom: 2, right: 2,
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: '#1F5E2E', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff',
    },

    // Inputs
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontFamily: 'DMSans_700Bold', color: '#555', marginBottom: 6 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8F9FA', borderRadius: 12,
        borderWidth: 1, borderColor: '#E8E8E8',
        paddingHorizontal: 14, height: 50,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, fontFamily: 'DMSans_400Regular', color: '#1A1A1A' },

    // Buttons
    saveBtn: {
        backgroundColor: '#1F5E2E', borderRadius: 30,
        paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 12,
    },
    saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans_700Bold' },
    cancelBtn: { alignItems: 'center', paddingVertical: 10 },
    cancelBtnText: { fontSize: 15, color: '#999', fontFamily: 'DMSans_500Medium' },
});
