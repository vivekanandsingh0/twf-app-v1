import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function NameInputScreen({ onFinish }: { onFinish: () => void }) {
    const insets = useSafeAreaInsets();
    const { updateProfile } = useUser();
    const { isDark } = useTheme();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            alert("Please enter your name.");
            return;
        }
        setLoading(true);
        // Default gender and dob for now
        await updateProfile(name, '', '');
        setLoading(false);
        onFinish();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.contentContainer}
            >
                <View style={[styles.logoContainer, { marginTop: 40, marginBottom: 20 }]}>
                    <Image
                        source={require('@/assets/images/twf-logo.png')}
                        style={styles.logo}
                        contentFit="contain"
                    />
                </View>

                <Text style={[styles.welcomeText, isDark && { color: '#FFF' }]}>One Last Thing</Text>
                <Text style={[styles.subtext, isDark && { color: '#AAA' }]}>What should we call you?</Text>

                <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, isDark && { color: '#FFF' }]}>Full Name</Text>
                    <TextInput
                        style={[styles.textInput, isDark && { backgroundColor: '#333', borderColor: '#444', color: '#FFF' }]}
                        placeholder="e.g. Rahul Kumar"
                        placeholderTextColor={isDark ? '#888' : '#999'}
                        value={name}
                        onChangeText={setName}
                        autoFocus={false}
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, !name.trim() && styles.submitButtonDisabled]}
                    onPress={handleSave}
                    disabled={!name.trim() || loading}
                >
                    <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Get Started'}</Text>
                    {loading && <Ionicons name="sync" size={16} color="white" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    logoContainer: {
        width: 150,
        height: 150,
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    welcomeText: {
        fontSize: 20,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    subtext: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#333',
        marginBottom: 12,
    },
    textInput: {
        width: '100%',
        height: 56,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
        backgroundColor: '#F9F9F9',
    },
    submitButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#1F5E2E',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        flexDirection: 'row'
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
    },
});
