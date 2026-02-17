import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

type ThemeContextType = {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Extend Default Theme with Custom Colors
export const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#FFFFFF',
        text: '#1A1A1A',
        primary: '#1F5E2E',
        secondary: '#F5F5F5',
        card: '#FFFFFF',
        border: '#E0E0E0',
        notification: '#1F5E2E',
        subtext: '#666666',
        tint: '#1F5E2E',
        tabBar: '#FFFFFF',
    },
};

export const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: '#121212',
        text: '#FFFFFF',
        primary: '#4CAF50', // Lighter green for dark mode
        secondary: '#1E1E1E',
        card: '#1E1E1E',
        border: '#333333',
        notification: '#4CAF50',
        subtext: '#AAAAAA',
        tint: '#FFFFFF',
        tabBar: '#1E1E1E',
    },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    // Load saved preference
    useEffect(() => {
        AsyncStorage.getItem('themeMode').then((saved) => {
            if (saved) {
                setThemeMode(saved as any);
            }
        });
    }, []);

    // Update isDark based on mode and system preference
    useEffect(() => {
        if (themeMode === 'system') {
            setIsDark(systemScheme === 'dark');
        } else {
            setIsDark(themeMode === 'dark');
        }
    }, [themeMode, systemScheme]);

    // Save preference when changed
    const handleSetThemeMode = async (mode: 'light' | 'dark' | 'system') => {
        setThemeMode(mode);
        await AsyncStorage.setItem('themeMode', mode);
    };

    const toggleTheme = () => {
        handleSetThemeMode(isDark ? 'light' : 'dark');
    };

    const theme = isDark ? CustomDarkTheme : CustomLightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode: handleSetThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
