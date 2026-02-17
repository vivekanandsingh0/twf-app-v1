import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }, isDark && { backgroundColor: '#1E1E1E', borderTopColor: '#333' }]}>
            <View style={styles.content}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    let iconName: any;
                    if (route.name === 'index') iconName = isFocused ? 'storefront' : 'storefront-outline';
                    else if (route.name === 'feed') iconName = isFocused ? 'home' : 'home-outline';
                    else if (route.name === 'category') iconName = isFocused ? 'grid' : 'grid-outline';
                    else if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

                    return (
                        <TouchableOpacity
                            key={route.name}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={[
                                styles.tabItem,
                                isFocused ? (isDark ? { backgroundColor: '#1E3E2E' } : styles.activeTabItem) : styles.inactiveTabItem
                            ]}
                        >
                            <Ionicons
                                name={iconName}
                                size={24}
                                color={isFocused ? '#FFFFFF' : (isDark ? '#AAA' : '#1A1A1A')}
                            />
                            {isFocused && (
                                <Text style={styles.activeLabel} numberOfLines={1}>
                                    {label as string}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        // Shadow for the bar itself
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Distribute space evenly between items
        paddingHorizontal: 24, // Comfortable side margins
        paddingVertical: 12,
        width: '100%',
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 30,
        height: 48,
    },
    activeTabItem: {
        backgroundColor: '#1F5E2E',
        paddingHorizontal: 20, // More breathing room for active state
    },
    inactiveTabItem: {
        backgroundColor: 'transparent',
    },
    activeLabel: {
        color: '#FFFFFF',
        fontFamily: 'DMSans_700Bold',
        fontSize: 13, // Slightly smaller to ensure fit
        marginLeft: 8,
    },
});
