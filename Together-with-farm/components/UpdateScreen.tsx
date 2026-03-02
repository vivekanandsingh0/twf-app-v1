import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

type UpdateScreenProps = {
    message: string;
    link: string;
    isMandatory: boolean;
    onDismiss: () => void;
};

export default function UpdateScreen({ message, link, isMandatory, onDismiss }: UpdateScreenProps) {
    const handleUpdate = () => {
        if (link) {
            Linking.openURL(link).catch(err => console.error("Couldn't load page", err));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.overlay} />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🚀</Text>
                </View>
                <Text style={styles.title}>Update Available</Text>

                <View style={styles.card}>
                    <Text style={styles.messageText}>
                        {message || "A new version of the app is available. Please update to get the latest features and bug fixes!"}
                    </Text>

                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                        <Text style={styles.updateButtonText}>Update Now</Text>
                    </TouchableOpacity>

                    {!isMandatory && (
                        <TouchableOpacity style={styles.laterButton} onPress={onDismiss}>
                            <Text style={styles.laterButtonText}>Maybe Later</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {isMandatory && (
                    <Text style={styles.footerText}>
                        This is a required update. You must update the app to continue using it.
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    content: {
        width: '85%',
        alignItems: 'center',
        zIndex: 10,
    },
    iconContainer: {
        width: 90,
        height: 90,
        backgroundColor: '#1F5E2E',
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -45,
        zIndex: 20,
        borderWidth: 4,
        borderColor: '#E8F5E9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 60,
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        paddingTop: 30,
        borderRadius: 24,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    messageText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        color: '#333333',
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 24,
    },
    updateButton: {
        backgroundColor: '#1F5E2E',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontFamily: 'DMSans_700Bold',
        fontSize: 16,
    },
    laterButton: {
        width: '100%',
        paddingVertical: 12,
        alignItems: 'center',
    },
    laterButtonText: {
        color: '#666666',
        fontFamily: 'DMSans_500Medium',
        fontSize: 15,
    },
    footerText: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 20,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
});
