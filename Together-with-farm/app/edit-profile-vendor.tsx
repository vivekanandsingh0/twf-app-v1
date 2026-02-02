import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useVendor } from '@/contexts/VendorContext';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

export default function VendorProfileEditScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const { profile, updateProfile: updateVendorProfile } = useVendor();

    // Local State initialized from Vendor Profile (Source of Truth)
    const [fullName, setFullName] = useState(profile.ownerName || '');
    const [phone, setPhone] = useState(profile.phone || '');
    const [gender, setGender] = useState(profile.gender || '');
    const [dob, setDob] = useState(profile.dob || '');
    const [experience, setExperience] = useState(profile.experience || '');
    const [farmSize, setFarmSize] = useState(profile.farmSize || '');
    const [ourStory, setOurStory] = useState(profile.bio || '');

    // Update local state when profile loads (if it was empty initially)
    React.useEffect(() => {
        if (profile.ownerName) setFullName(profile.ownerName);
        if (profile.phone) setPhone(profile.phone);
        if (profile.gender) setGender(profile.gender);
        if (profile.dob) setDob(profile.dob);
        if (profile.experience) setExperience(profile.experience);
        if (profile.farmSize) setFarmSize(profile.farmSize);
        if (profile.bio) setOurStory(profile.bio);
    }, [profile]);

    const handleSave = async () => {
        if (!user) {
            alert("Error: Not logged in.");
            return;
        }

        try {
            // Update via Vendor Context (Syncs to Admin Backend)
            await updateVendorProfile({
                ownerName: fullName,
                phone: phone,
                gender: gender,
                dob: dob,
                experience: experience,
                farmSize: farmSize,
                bio: ourStory
            });

            alert('Profile Updated Successfully!');
            router.back();
        } catch (error: any) {
            console.error(error);
            alert('Error: ' + error.message);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Avatar Placeholder */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarWrapper}>
                        <Image source={require('@/assets/images/3d-model-with-veg.png')} style={styles.avatar} contentFit="cover" />
                        <View style={styles.cameraButton}>
                            <Ionicons name="camera-outline" size={20} color="#1A1A1A" />
                        </View>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Name" />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <TextInput style={styles.input} value={gender} onChangeText={setGender} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>DOB</Text>
                        <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="DD Month YYYY" />
                    </View>

                    {/* Vendor Specific */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Experience</Text>
                            <TextInput style={styles.input} value={experience} onChangeText={setExperience} placeholder="Years" />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Farm Size</Text>
                            <TextInput style={styles.input} value={farmSize} onChangeText={setFarmSize} placeholder="Acres" />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Our Story (Bio)</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={ourStory} onChangeText={setOurStory} multiline />
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 },
    headerTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold' },
    iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F9F9', borderRadius: 20 },
    content: { padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatarWrapper: { width: 100, height: 100, position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 20 },
    cameraButton: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#FFF', padding: 5, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
    formContainer: { gap: 15, marginBottom: 30 },
    inputGroup: { gap: 5 },
    label: { fontSize: 14, fontFamily: 'DMSans_700Bold', color: '#333' },
    input: { borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 14, fontFamily: 'DMSans_500Medium' },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
    actionRow: { flexDirection: 'row', gap: 15 },
    cancelButton: { flex: 1, padding: 16, backgroundColor: '#EEE', borderRadius: 12, alignItems: 'center' },
    saveButton: { flex: 1, padding: 16, backgroundColor: '#1F5E2E', borderRadius: 12, alignItems: 'center' },
    cancelText: { fontFamily: 'DMSans_700Bold', color: '#333' },
    saveText: { fontFamily: 'DMSans_700Bold', color: '#FFF' }
});
