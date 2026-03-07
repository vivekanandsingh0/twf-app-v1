import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
    onFinish: () => void;
}

const onboardingData = [
    {
        title: 'Fresh Groceries,\nDelivered Every Day',
        description: 'Handpicked local produce delivered fresh\nfrom nearby farms to you.',
    },
    {
        title: 'Shop Smarter,\nSave Time and Money',
        description: 'Compare prices, find deals, and check out\nfaster every single time.',
    },
    {
        title: 'Fast Delivery,\nRight When You Need',
        description: 'Track your order live and receive groceries\nexactly when expected.',
    },
];

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            scrollViewRef.current?.scrollTo({
                x: width * (currentIndex + 1),
                animated: true,
            });
        }
    };

    const isLastSlide = currentIndex === onboardingData.length - 1;

    // Render content
    return (
        <View style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Background Image Container - Fixed position */}
            <View style={[styles.imageContainer, { top: insets.top + 20 }]}>
                <Image
                    source={require('@/assets/images/3d-model-with-veg.png')}
                    style={styles.image}
                    contentFit="contain"
                />
            </View>

            {/* White Content Container with Curved Top */}
            <View style={styles.contentWrapper}>
                {/* The Big Circle View for the Curve */}
                <View style={[styles.curveBackground, isDark && { backgroundColor: '#1E1E1E' }]} />

                {/* Foreground Content (Text & Buttons) */}
                <View style={styles.foregroundContent}>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        bounces={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {onboardingData.map((item, index) => (
                            <View key={index} style={styles.slide}>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.title, isDark && { color: '#FFF' }]}>{item.title}</Text>
                                    <Text style={[styles.description, isDark && { color: '#AAA' }]}>{item.description}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom + 10, 24) }]}>
                        {/* Pagination dots */}
                        <View style={styles.dotsContainer}>
                            {onboardingData.map((_, dotIndex) => (
                                <View
                                    key={dotIndex}
                                    style={[
                                        styles.dot,
                                        currentIndex === dotIndex ? styles.activeDot : (isDark ? { backgroundColor: '#555' } : styles.inactiveDot),
                                    ]}
                                />
                            ))}
                        </View>

                        {/* Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={isLastSlide ? onFinish : handleNext}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>
                                {isLastSlide ? 'Get Started' : 'Next'}
                            </Text>
                        </TouchableOpacity>

                        {/* Terms text */}
                        <View style={styles.termsContainer}>
                            {isLastSlide && (
                                <Text style={[styles.termsText, isDark && { color: '#888' }]}>
                                    By continuing, you agree to our{' '}
                                    <Text style={[styles.termsLink, isDark && { color: '#4CAF50' }]}>Terms</Text> &{' '}
                                    <Text style={[styles.termsLink, isDark && { color: '#4CAF50' }]}>Privacy Policy</Text>.
                                </Text>
                            )}
                        </View>
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
        backgroundColor: '#E8EDE8', // Light greenish grey background for the image area
        overflow: 'hidden', // Clip the large curve horizontally at the screen edges
    },
    imageContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: height * 0.6, // Takes up top 60%
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 1,
    },
    image: {
        width: width * 0.9, // Much larger image
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
        // Removed overflow: 'hidden' so the top curve is visible
    },
    curveBackground: {
        position: 'absolute',
        top: -CURVE_HEIGHT, // Pull it up to create the overlapping curve
        left: -(width * 0.5), // Center the big circle
        width: width * 2,
        height: BOTTOM_CONTAINER_HEIGHT + CURVE_HEIGHT,
        backgroundColor: '#FAFAF8',
        borderTopLeftRadius: width, // Create the perfect arc
        borderTopRightRadius: width,
        boxShadow: '0px -10px 10px rgba(0, 0, 0, 0.05)',
        elevation: 5,
    },
    foregroundContent: {
        flex: 1,
        width: width, // Restrict width back to screen width for content
        height: '100%',
        paddingTop: 0,
    },
    scrollContent: {
        alignItems: 'flex-start',
    },
    slide: {
        width: width,
        paddingHorizontal: 32,
        alignItems: 'center',
        paddingTop: 10, // Push text down a bit from the curve peak
    },
    textContainer: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
        color: '#6B6B6B',
        textAlign: 'center',
        lineHeight: 24,
    },
    bottomControls: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: '#1F5E2E',
    },
    inactiveDot: {
        backgroundColor: '#E0E0E0',
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: '#1F5E2E',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 4px 8px rgba(31, 94, 46, 0.3)',
        elevation: 4,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#FFFFFF',
    },
    termsContainer: {
        height: 20, // fixed height to prevent jumping
        marginTop: 16,
        justifyContent: 'center',
    },
    termsText: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#888',
        textAlign: 'center',
    },
    termsLink: {
        color: '#1F5E2E',
        fontFamily: 'DMSans_500Medium',
    },
});
