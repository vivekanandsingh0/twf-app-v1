import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import FastImage from '@/components/FastImage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/contexts/ThemeContext';
import { useMarket } from '@/contexts/MarketContext';

const { width } = Dimensions.get('window');

// Wrap HTML content in a full document with styling
function buildHtmlDoc(html: string, isDark: boolean) {
    const bg = isDark ? '#121212' : '#FFFFFF';
    const textColor = isDark ? '#E0E0E0' : '#333333';
    const headingColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const linkColor = '#1F5E2E';

    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 16px;
    line-height: 1.7;
    color: ${textColor};
    background: ${bg};
    padding: 0 4px 24px 4px;
    word-wrap: break-word;
  }
  h1, h2, h3 { color: ${headingColor}; margin: 20px 0 10px; font-weight: 700; }
  h2 { font-size: 20px; }
  h3 { font-size: 17px; }
  p { margin-bottom: 14px; }
  ul, ol { padding-left: 22px; margin-bottom: 14px; }
  li { margin-bottom: 6px; }
  a { color: ${linkColor}; text-decoration: underline; }
  b, strong { font-weight: 700; color: ${headingColor}; }
  i, em { font-style: italic; }
  u { text-decoration: underline; }
  s { text-decoration: line-through; }
  blockquote {
    border-left: 3px solid ${linkColor};
    padding-left: 14px;
    margin: 14px 0;
    color: ${isDark ? '#AAA' : '#666'};
    font-style: italic;
  }
</style>
</head>
<body>${html}</body>
</html>`;
}

// Dummy fallback content
const DUMMY_CONTENT = `
<h2>Introduction</h2>
<p>Sustainable farming is not just a trend but a necessity for our future. By adopting eco-friendly practices, we ensure that our soil remains fertile and our produce remains healthy.</p>
<h2>Key Practices</h2>
<ul>
  <li>Use <b>organic compost</b> instead of chemical fertilizers.</li>
  <li>Implement <b>crop rotation</b> to maintain soil health.</li>
  <li>Conserve water through <b>drip irrigation</b> systems.</li>
</ul>
<h2>Conclusion</h2>
<p>Adopting these methods will not only improve yield but also contribute to a greener planet. Start small, think big — every step towards sustainable farming counts.</p>
`;

export default function ArticleDetailScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const { articles } = useMarket();

    const article = articles.find(a => String(a.id) === String(id));

    if (!article) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, isDark && { color: '#FFF' }]}>Article not found</Text>
                </View>
            </View>
        );
    }

    const isHtml = article.content && (article.content.includes('<') && article.content.includes('>'));
    const htmlContent = buildHtmlDoc(
        isHtml ? article.content! : (article.content ? `<p>${article.content.replace(/\n/g, '</p><p>')}</p>` : DUMMY_CONTENT),
        isDark
    );

    const onShare = async () => {
        try {
            const plainText = article.content
                ? article.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200)
                : '';
            await Share.share({
                title: article.title,
                message: `📰 ${article.title}\n\n${plainText}${plainText.length === 200 ? '...' : ''}\n\n— Together We Farm App\n📲 Download the app: https://play.google.com/store/apps/details?id=com.togetherwithfarm.app`,
            });
        } catch (e) {
            // User cancelled or error — do nothing
        }
    };

    return (
        <View style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <FastImage source={article.image} style={styles.heroImage} contentFit="cover" />

                    {/* Header Overlay */}
                    <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }]}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backCircleBtn}>
                            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareCircleBtn} onPress={onShare}>
                            <Ionicons name="share-social-outline" size={22} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.contentContainer, isDark && { backgroundColor: '#121212' }]}>
                    {/* Meta Tags */}
                    <View style={styles.metaRow}>
                        <View style={[styles.categoryBadge, isDark && { backgroundColor: '#1E3E2E' }]}>
                            <Text style={styles.categoryText}>{article.category || article.type || 'Article'}</Text>
                        </View>
                        {article.tag && (
                            <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>{article.tag}</Text>
                            </View>
                        )}
                        <Text style={[styles.timeText, isDark && { color: '#AAA' }]}>{article.time}</Text>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, isDark && { color: '#FFF' }]}>{article.title}</Text>

                    {/* Author Meta */}
                    <View style={styles.authorRow}>
                        <FastImage
                            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60' }}
                            style={styles.authorImage}
                            contentFit="cover"
                        />
                        <View>
                            <Text style={[styles.authorName, isDark && { color: '#FFF' }]}>TWF Admin Team</Text>
                            <Text style={styles.publishDate}>Published · {article.time}</Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, isDark && { backgroundColor: '#333' }]} />

                    {/* HTML Content via WebView */}
                    <WebView
                        source={{ html: htmlContent }}
                        style={[styles.webview, isDark && { backgroundColor: '#121212' }]}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        onShouldStartLoadWithRequest={(request) => {
                            // Allow only about:blank and data: URIs; block external navigation
                            return request.url === 'about:blank' || request.url.startsWith('data:');
                        }}
                        injectedJavaScript={`
                            // Resize webview to content height
                            window.ReactNativeWebView.postMessage(
                                JSON.stringify({ type: 'height', height: document.body.scrollHeight })
                            );
                            true;
                        `}
                        onMessage={(event) => {
                            // Height adjustment handled by fixed minHeight
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    backBtn: {
        padding: 4,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backCircleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    shareCircleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        marginTop: -24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        color: '#1F5E2E',
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        textTransform: 'uppercase',
    },
    tagBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        color: '#E65100',
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
    },
    timeText: {
        color: '#666',
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
    },
    title: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        lineHeight: 32,
        marginBottom: 20,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    authorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    authorName: {
        fontSize: 14,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    publishDate: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#888',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 20,
    },
    webview: {
        width: width - 48,
        minHeight: 400,
        backgroundColor: 'transparent',
    },
});
