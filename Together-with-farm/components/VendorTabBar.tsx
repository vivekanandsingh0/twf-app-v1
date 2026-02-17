import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export function VendorTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
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

                    let iconName: keyof typeof Ionicons.glyphMap = 'help';
                    if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
                    else if (route.name === 'orders') iconName = isFocused ? 'storefront' : 'storefront-outline';
                    else if (route.name === 'inventory') iconName = isFocused ? 'clipboard' : 'clipboard-outline';
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
                                isFocused ? styles.activeTabItem : styles.inactiveTabItem
                            ]}
                        >
                            <Ionicons
                                name={iconName}
                                size={24}
                                color={isFocused ? '#FFFFFF' : '#1A1A1A'}
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
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 4,
        gap: 4,
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 30,
        minWidth: 50,
    },
    activeTabItem: {
        backgroundColor: '#1F5E2E',
        flex: 1,
    },
    inactiveTabItem: {
        backgroundColor: 'transparent',
        flex: 0,
    },
    activeLabel: {
        color: '#FFFFFF',
        fontFamily: 'DMSans_700Bold',
        fontSize: 13,
        marginLeft: 8,
    },
});
