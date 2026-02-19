
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { WebView } from 'react-native-webview';

export default function AboutUsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const { data } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'vendor_about_us_content')
                    .single();

                if (data?.value) {
                    setContent(data.value);
                } else {
                    setContent('<p style="text-align:center; margin-top: 50px; font-family: sans-serif; color: #666;">Content coming soon...</p>');
                }
            } catch (e) {
                console.error('Error fetching About Us content:', e);
                setContent('<p>Error loading content.</p>');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const htmlSource = {
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <style>
                    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #1a1a1a; margin: 0; padding-bottom: 50px; }
                    img { max-width: 100%; height: auto; border-radius: 8px; }
                    p { line-height: 1.6; font-size: 16px; color: #4a5568; }
                    h1 { color: #1F5E2E; font-size: 24px; margin-bottom: 16px; }
                    h2 { color: #2D3748; font-size: 20px; margin-top: 24px; margin-bottom: 12px; }
                    ul { padding-left: 20px; }
                    li { margin-bottom: 8px; line-height: 1.6; }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1F5E2E" />
                </View>
            ) : Platform.OS === 'web' ? (
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
                    <div dangerouslySetInnerHTML={{ __html: content }} style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#1a1a1a',
                        lineHeight: '1.6'
                    }} />
                </ScrollView>
            ) : (
                <View style={styles.webviewContainer}>
                    <WebView
                        originWhitelist={['*']}
                        source={htmlSource}
                        style={{ flex: 1, backgroundColor: 'transparent' }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        zIndex: 10,
        backgroundColor: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
