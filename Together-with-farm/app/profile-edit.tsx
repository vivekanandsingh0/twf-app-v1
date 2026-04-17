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
    Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileEditScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userData, updateProfile, setUserData } = useUser();
    const { isDark } = useTheme();

    const [fullName, setFullName] = useState(userData.fullName);
    const [phone, setPhone] = useState(userData.phoneNumber || '+91 23456 7890');
    const [gender, setGender] = useState(userData.gender);
    const [dob, setDob] = useState(userData.dob);
    const [profileImage, setProfileImage] = useState(userData.profileImage || '');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const day = selectedDate.getDate().toString().padStart(2, '0');
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
            const year = selectedDate.getFullYear();
            setDob(`${day}/${month}/${year}`);
        }
    };

    const parseDob = (dateStr: string) => {
        if (!dateStr) return new Date(2000, 0, 1);
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(2000, 0, 1);
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const base64Img = asset.base64
                    ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
                    : asset.uri;
                setProfileImage(base64Img);
            }
        } catch (e) {
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const handleSave = () => {
        // Update all profile fields including phone number and image to DB
        updateProfile(fullName, gender, dob, phone, undefined, undefined, undefined, profileImage);

        // Show success message
        if (Platform.OS === 'web') {
            alert('Profile updated successfully!');
        } else {
            Alert.alert('Success', 'Profile updated successfully!');
        }

        router.back();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, isDark && { borderBottomColor: '#333' }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, isDark && { backgroundColor: '#333' }]}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Edit Profile</Text>
                <TouchableOpacity style={[styles.notificationBtn, isDark && { backgroundColor: '#333' }]} onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={profileImage ? { uri: profileImage } : require('@/assets/images/default-dp.png')}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                        <View style={[styles.cameraButton, isDark && { backgroundColor: '#333', borderColor: '#444' }]}>
                            <Ionicons name="camera-outline" size={20} color={isDark ? '#FFF' : '#1A1A1A'} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, isDark && { color: '#FFF' }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#FFF' }]}
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, isDark && { color: '#FFF' }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#FFF' }]}
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderContainer}>
                            {['Male', 'Female', 'Other'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.genderOption,
                                        isDark && { borderColor: '#444', backgroundColor: '#333' },
                                        gender === option && styles.genderOptionSelected,
                                        isDark && gender === option && { backgroundColor: '#1E3E2E', borderColor: '#1F5E2E' }
                                    ]}
                                    onPress={() => setGender(option)}
                                >
                                    <View style={[
                                        styles.radioOuter,
                                        isDark && { borderColor: '#888' },
                                        gender === option && styles.radioOuterSelected,
                                        isDark && gender === option && { borderColor: '#1F5E2E' }
                                    ]}>
                                        {gender === option && <View style={[styles.radioInner, isDark && { backgroundColor: '#1F5E2E' }]} />}
                                    </View>
                                    <Text style={[
                                        styles.genderText,
                                        isDark && { color: '#AAA' },
                                        gender === option && styles.genderTextSelected,
                                        isDark && gender === option && { color: '#FFF' }
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, isDark && { color: '#FFF' }]}>Date of Birth</Text>
                        <Pressable 
                            onPress={() => setShowDatePicker(true)}
                            style={[styles.input, isDark && { backgroundColor: '#333', borderColor: '#444' }, { justifyContent: 'center' }]}
                        >
                            <Text style={[styles.dobValue, isDark && { color: '#FFF' }, !dob && { color: isDark ? '#888' : '#999' }]}>
                                {dob || 'Select date of birth'}
                            </Text>
                            <Ionicons 
                                name="calendar-outline" 
                                size={20} 
                                color={isDark ? '#AAA' : '#666'} 
                                style={{ position: 'absolute', right: 16 }} 
                            />
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={parseDob(dob)}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
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
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#1F5E2E',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
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
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F5F5F5',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: '#fff',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
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
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#333',
        height: 50,
    },
    dobValue: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#333',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    genderOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 8,
    },
    genderOptionSelected: {
        borderColor: '#1F5E2E',
        backgroundColor: '#F1F8E9',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: '#1F5E2E',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1F5E2E',
    },
    genderText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#666',
    },
    genderTextSelected: {
        color: '#1F5E2E',
        fontFamily: 'DMSans_700Bold',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#757575',
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#1F5E2E',
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
});
