import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

interface RoleSelectionScreenProps {
    onSelectUser: () => void;
    onSelectVendor: () => void;
}

export default function RoleSelectionScreen({ onSelectUser, onSelectVendor }: RoleSelectionScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Background Image Container */}
            <View style={[styles.imageContainer, { top: insets.top + 20 }]}>
                <Image
                    source={require('@/assets/images/3d-model-with-veg.png')}
                    style={styles.image}
                    contentFit="contain"
                />
            </View>

            {/* White Content Container with Curved Top */}
            <View style={styles.contentWrapper}>
                {/* Curve Background */}
                <View style={styles.curveBackground} />

                {/* Foreground Content */}
                <View style={styles.foregroundContent}>
                    <Text style={styles.title}>Continue as,</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.userButton]}
                            onPress={onSelectUser}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.userButtonText}>User</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.vendorButton]}
                            onPress={onSelectVendor}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.vendorButtonText}>Vendor</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const CURVE_HEIGHT = 50;
const BOTTOM_CONTAINER_HEIGHT = height * 0.45;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8EDE8', // Match onboarding background
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: height * 0.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 1,
    },
    image: {
        width: width * 0.9,
        height: '100%',
    },
    contentWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: BOTTOM_CONTAINER_HEIGHT,
        zIndex: 2,
        justifyContent: 'flex-end',
    },
    curveBackground: {
        position: 'absolute',
        top: -CURVE_HEIGHT,
        left: -(width * 0.5),
        width: width * 2,
        height: BOTTOM_CONTAINER_HEIGHT + CURVE_HEIGHT,
        backgroundColor: '#FCFCFC', // Slightly off-white or white
        borderTopLeftRadius: width,
        borderTopRightRadius: width,
        boxShadow: '0px -10px 10px rgba(0, 0, 0, 0.05)',
        elevation: 5,
    },
    foregroundContent: {
        flex: 1,
        width: width,
        height: '100%',
        alignItems: 'center',
        paddingTop: 80, // Push content down into the white area
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 160,
    },
    userButton: {
        backgroundColor: '#1F5E2E',
        boxShadow: '0px 4px 8px rgba(31, 94, 46, 0.3)',
        elevation: 4,
    },
    vendorButton: {
        backgroundColor: '#E0E0E0',
    },
    userButtonText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#FFFFFF',
    },
    vendorButtonText: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium', // slightly less bold maybe? or same
        color: '#1A1A1A',
    }
});
