import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

type MaintenanceScreenProps = {
    message: string;
    appType: 'User' | 'Vendor';
};

export default function MaintenanceScreen({ message, appType }: MaintenanceScreenProps) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🚧</Text>
                </View>
                <Text style={styles.title}>Under Maintenance</Text>
                <Text style={styles.subtitle}>
                    The {appType} App is temporarily unavailable
                </Text>

                <View style={styles.card}>
                    <Text style={styles.messageText}>
                        {message || "We are currently updating our systems to serve you better. We'll be back online shortly!"}
                    </Text>
                </View>

                <Text style={styles.footerText}>
                    Thank you for your patience and understanding.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F5E2E',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    icon: {
        fontSize: 50,
    },
    title: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 32,
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 16,
        color: '#A5D6A7',
        marginBottom: 40,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 20,
        width: '100%',
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
    },
    footerText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 40,
        textAlign: 'center',
    },
});
