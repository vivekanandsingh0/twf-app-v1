import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    // Animation values
    const logoOpacity = useSharedValue(0);
    const logoScale = useSharedValue(0.95);
    const progressWidth = useSharedValue(0);
    const { isDark } = useTheme();

    useEffect(() => {
        // Elegant fade-in with subtle scale
        logoOpacity.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.cubic)
        });

        // Subtle breathing effect - very minimal
        logoScale.value = withRepeat(
            withTiming(1, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease)
            }),
            -1,
            true
        );

        // Smooth progress bar animation
        progressWidth.value = withDelay(
            200,
            withTiming(100, {
                duration: 2200,
                easing: Easing.bezier(0.4, 0.0, 0.2, 1)
            })
        );

        // Finish splash after 2.5 seconds
        const timer = setTimeout(() => {
            onFinish();
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />
            {/* Logo with subtle animation */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <Image
                    source={require('@/assets/images/twf-logo.png')}
                    style={styles.logo}
                    contentFit="contain"
                />
            </Animated.View>

            {/* Minimal progress bar */}
            <View style={[styles.progressBarContainer, isDark && { backgroundColor: '#333' }]}>
                <Animated.View style={[styles.progressBar, progressAnimatedStyle, isDark && { backgroundColor: '#81C784' }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAF8', // Off-white background
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: width * 0.55,
        height: width * 0.55,
        maxWidth: 280,
        maxHeight: 280,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    progressBarContainer: {
        width: 120,
        height: 3,
        backgroundColor: '#E8E8E6',
        borderRadius: 2,
        marginTop: 60,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#5A8F5E', // Green matching logo
        borderRadius: 2,
    },
});
