import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [darkMode, setDarkMode] = useState(false);

    const renderSettingItem = (
        icon: any,
        title: string,
        subtitle?: string,
        onPress?: () => void,
        showArrow: boolean = true,
        showSwitch: boolean = false,
        switchValue?: boolean,
        onSwitchChange?: (value: boolean) => void
    ) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            activeOpacity={showSwitch ? 1 : 0.7}
            disabled={showSwitch}
        >
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color="#1A1A1A" />
                </View>
                <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {showSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                    thumbColor={switchValue ? '#1F5E2E' : '#f4f3f4'}
                />
            ) : showArrow ? (
                <Ionicons name="chevron-forward" size={20} color="#999" />
            ) : null}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <TouchableOpacity
                    style={styles.notificationBtn}
                    onPress={() => router.push('/notifications')}
                >
                    <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Preferences Section */}
                <Text style={styles.sectionTitle}>Preferences</Text>
                {renderSettingItem(
                    'language-outline',
                    'Language',
                    'English',
                    () => console.log('Language pressed')
                )}
                {renderSettingItem(
                    'moon-outline',
                    'Dark Mode',
                    undefined,
                    undefined,
                    false,
                    true,
                    darkMode,
                    setDarkMode
                )}

                {/* Security Section */}
                <Text style={styles.sectionTitle}>Security</Text>
                {renderSettingItem(
                    'lock-closed-outline',
                    'Change Password',
                    undefined,
                    () => console.log('Change Password pressed')
                )}
                {renderSettingItem(
                    'shield-checkmark-outline',
                    'Privacy & Security',
                    undefined,
                    () => console.log('Privacy & Security pressed')
                )}

                {/* About Section */}
                <Text style={styles.sectionTitle}>About</Text>
                {renderSettingItem(
                    'document-text-outline',
                    'Terms & Conditions',
                    undefined,
                    () => console.log('Terms pressed')
                )}
                {renderSettingItem(
                    'shield-outline',
                    'Privacy Policy',
                    undefined,
                    () => console.log('Privacy Policy pressed')
                )}
                {renderSettingItem(
                    'information-circle-outline',
                    'App Version',
                    '1.0.0',
                    undefined,
                    true
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
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
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
        marginTop: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    settingSubtitle: {
        fontSize: 13,
        fontFamily: 'DMSans_400Regular',
        color: '#999',
        marginTop: 2,
    },
});
