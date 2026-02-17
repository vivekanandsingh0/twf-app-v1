
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function LegalPage() {
    const { slug } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [content, setContent] = useState<string | null>(null);
    const [title, setTitle] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolicy();
    }, [slug]);

    const fetchPolicy = async () => {
        try {
            const { data, error } = await supabase
                .from('app_policies')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                console.error('Error fetching policy:', error);
                setContent('<h2 style="text-align:center; margin-top: 50px; color: #666;">Content not available.</h2>');
            } else {
                setTitle(data.title);
                // Inject styles directly
                const styledContent = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  padding: 20px;
                  color: #333;
                  line-height: 1.6;
                  background-color: #fff;
                }
                h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #1F5E2E; }
                h2 { font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; color: #1A1A1A; }
                h3 { font-size: 18px; font-weight: 600; margin-top: 20px; margin-bottom: 10px; }
                p { font-size: 16px; margin-bottom: 16px; color: #444; }
                ul, ol { margin-bottom: 16px; padding-left: 24px; }
                li { margin-bottom: 8px; font-size: 16px; }
                a { color: #1F5E2E; text-decoration: none; font-weight: 500; }
                blockquote { border-left: 4px solid #1F5E2E; padding-left: 16px; margin: 16px 0; color: #666; font-style: italic; }
              </style>
            </head>
            <body>
              ${data.content || '<p>No content provided yet.</p>'}
            </body>
          </html>
        `;
                setContent(styledContent);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title || 'Legal'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1F5E2E" />
                </View>
            ) : (
                <WebView
                    originWhitelist={['*']}
                    source={{ html: content || '' }}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    javaScriptEnabled={true}
                />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
