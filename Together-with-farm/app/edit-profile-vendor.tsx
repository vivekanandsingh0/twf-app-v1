import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Platform,
    ScrollView,
    Alert,
    ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

export default function VendorProfileEditScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Local state for vendor profile
    const [fullName, setFullName] = useState('Amit Kumar');
    const [phone, setPhone] = useState('+9175567776');
    const [gender, setGender] = useState('Male');
    const [dob, setDob] = useState('10 August 1992');
    const [experience, setExperience] = useState('');
    const [farmSize, setFarmSize] = useState('');
    const [ourStory, setOurStory] = useState('');

    const handleSave = () => {
        // Logic to save vendor profile would go here
        Alert.alert('Success', 'Profile updated successfully!');
        router.back();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={require('@/assets/images/3d-model-with-veg.png')}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                        <View style={styles.cameraButton}>
                            <Ionicons name="camera-outline" size={20} color="#1A1A1A" />
                        </View>
                    </View>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Full Name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder="Phone Number"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <TextInput
                            style={styles.input}
                            value={gender}
                            onChangeText={setGender}
                            placeholder="Gender"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TextInput
                            style={styles.input}
                            value={dob}
                            onChangeText={setDob}
                            placeholder="DD Month YYYY"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* Experience & Farm Size Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                            <Text style={styles.label}>Experience</Text>
                            <TextInput
                                style={styles.input}
                                value={experience}
                                onChangeText={setExperience}
                                placeholder="e.g. 15 years"
                                placeholderTextColor="#999"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Farm Size</Text>
                            <TextInput
                                style={styles.input}
                                value={farmSize}
                                onChangeText={setFarmSize}
                                placeholder="e.g. 4 acre"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    {/* Our Story */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Our Story</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={ourStory}
                            onChangeText={setOurStory}
                            placeholder="Tell something about yourself to us."
                            placeholderTextColor="#999"
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} activeOpacity={0.8}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                        <Text style={styles.saveText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>

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
        marginBottom: 10,
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
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 20,
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#1F5E2E',
        borderRadius: 9,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontFamily: 'DMSans_700Bold',
        lineHeight: 10,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarWrapper: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 24, // Slightly squarish rounded as per screenshot? Or distinct enough.
        // Screenshot shows rounded square or circle. Let's do rounded square like vendor images usually are in this app concept.
        // Actually screenshot looks like a rounded square with radius ~20-24. 
    },
    cameraButton: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#FFFFFF',
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    formContainer: {
        gap: 20,
        marginBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginLeft: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CECECE', // Slightly darker border than typical light grey for visibility
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
        backgroundColor: '#FFFFFF',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#9E9E9E', // Grey
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#1F5E2E', // Green
        paddingVertical: 16,
        borderRadius: 12, // Slightly boxier than full pill
        alignItems: 'center',
    },
    cancelText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'DMSans_700Bold',
    },
    saveText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'DMSans_700Bold',
    },
});
