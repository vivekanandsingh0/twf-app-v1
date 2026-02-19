import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useMarket, MarketVendor } from '@/contexts/MarketContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';


export default function FeedScreen() {
  const { vendors, articles, feedSections } = useMarket();
  const { unreadCount } = useNotifications();
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const spotlightFarmers = vendors.filter(v => v.tag);

  // Build category list dynamically from real articles
  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];

  // Filter articles by selected category
  const recentArticles = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }, isDark && { backgroundColor: '#121212' }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconButton, isDark && { backgroundColor: '#333', borderRadius: 12 }]}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && { color: '#FFF' }]}>Social Feed</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconButton, isDark && { backgroundColor: '#333', borderRadius: 12 }]}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1F5E2E']} />
        }
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, isDark && { backgroundColor: '#333' }]}>
          <Ionicons name="search-outline" size={20} color={isDark ? '#AAA' : '#666'} style={styles.searchIcon} />
          <TextInput
            placeholder="Search fresh products or brands"
            placeholderTextColor={isDark ? '#888' : '#999'}
            style={[styles.searchInput, isDark && { color: '#FFF' }]}
          />
        </View>

        {/* Spotlight Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Spotlight</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spotlightContainer}
        >
          {spotlightFarmers.map((farmer) => (
            <TouchableOpacity
              key={farmer.id}
              style={styles.spotlightItem}
              onPress={() => router.push(`/farmer/${farmer.id}`)}
            >
              <View style={[styles.spotlightImageContainer, isDark && { borderColor: '#444' }]}>
                <Image source={farmer.image} style={styles.spotlightImage} contentFit="cover" />
              </View>
              {/* <Text style={styles.spotlightName} numberOfLines={1}>{farmer.name}</Text> */}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryChip,
                activeCategory === cat ? styles.activeCategoryChip : styles.inactiveCategoryChip
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === cat ? styles.activeCategoryText : styles.inactiveCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* All Articles Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>All Articles</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.articlesContainer}
        >
          {recentArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={[styles.articleCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
              onPress={() => router.push(`/article/${article.id}` as any)}
              activeOpacity={0.9}
            >
              <Image source={article.image} style={styles.articleImage} contentFit="cover" />

              <View style={styles.imageOverlay}>
                <View style={[styles.tagBadge, isDark && { backgroundColor: 'rgba(31, 94, 46, 0.8)', borderColor: '#1F5E2E' }]}>
                  <Text style={[styles.tagText, isDark && { color: '#FFF' }]}>{article.category}</Text>
                </View>
                <View style={[styles.timeBadge, isDark && { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Text style={[styles.timeText, isDark && { color: '#FFF' }]}>{article.time}</Text>
                </View>
              </View>

              <View style={styles.articleContent}>
                <Text style={[styles.articleTitle, isDark && { color: '#FFF' }]} numberOfLines={2}>
                  {article.title}
                </Text>
                <View style={styles.readMoreLink}>
                  <Text style={styles.readMoreText}>Read article</Text>
                  <Ionicons name="arrow-forward" size={14} color="#1F5E2E" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dynamic Sections from Admin */}
        {feedSections.map(section => {
          const sectionArticles = articles.filter(a => a.section_id === section.id);
          if (sectionArticles.length === 0) return null;
          return (
            <View key={section.id}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>{section.name}</Text>
                {section.description ? (
                  <Text style={{ fontSize: 12, color: isDark ? '#888' : '#999', fontFamily: 'DMSans_400Regular', marginTop: 2 }}>
                    {section.description}
                  </Text>
                ) : null}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.articlesContainer}
              >
                {sectionArticles.map(article => (
                  <TouchableOpacity
                    key={article.id}
                    style={[styles.articleCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }]}
                    onPress={() => router.push(`/article/${article.id}` as any)}
                    activeOpacity={0.9}
                  >
                    <Image source={article.image} style={styles.articleImage} contentFit="cover" />
                    <View style={styles.imageOverlay}>
                      <View style={[styles.tagBadge, isDark && { backgroundColor: 'rgba(31, 94, 46, 0.8)', borderColor: '#1F5E2E' }]}>
                        <Text style={[styles.tagText, isDark && { color: '#FFF' }]}>{article.category}</Text>
                      </View>
                      <View style={[styles.timeBadge, isDark && { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                        <Text style={[styles.timeText, isDark && { color: '#FFF' }]}>{article.time}</Text>
                      </View>
                    </View>
                    <View style={styles.articleContent}>
                      <Text style={[styles.articleTitle, isDark && { color: '#FFF' }]} numberOfLines={2}>
                        {article.title}
                      </Text>
                      <View style={styles.readMoreLink}>
                        <Text style={styles.readMoreText}>Read article</Text>
                        <Ionicons name="arrow-forward" size={14} color="#1F5E2E" />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}

        {/* Spacer for Floating Tab Bar */}
        <View style={{ height: 100 }} />

      </ScrollView>
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
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#1F5E2E',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  spotlightContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  spotlightItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 3,
    borderWidth: 2,
    borderColor: '#EFEFEF', // Default border
  },
  activeSpotlight: {
    borderColor: '#1F5E2E', // Active/Selected border
  },
  spotlightImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  spotlightName: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#1A1A1A',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeCategoryChip: {
    backgroundColor: '#1F5E2E',
    borderColor: '#1F5E2E',
  },
  inactiveCategoryChip: {
    backgroundColor: '#fff',
    borderColor: '#EFEFEF',
  },
  categoryText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
  activeCategoryText: {
    color: '#fff',
  },
  inactiveCategoryText: {
    color: '#333',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  articlesContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  articleCard: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    // Shadow
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 160,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    color: '#1F5E2E',
  },
  timeBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    color: '#1A1A1A',
  },
  articleContent: {
    padding: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 22,
  },
  readMoreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: '#1F5E2E',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 10,
    // Shadow
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  insightImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  insightMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  trendingBadge: {
    backgroundColor: '#1F5E2E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendingText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'DMSans_700Bold',
    textTransform: 'uppercase',
  },
  insightTime: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'DMSans_400Regular',
  },
  insightTitle: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    overflow: 'visible', // Important for overlapping image
    // paddingBottom: 24, // Handled in modalContent
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    height: 120,
    backgroundColor: '#1F5E2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalAvatarContainer: {
    position: 'absolute',
    top: 60, // Half of header height roughly
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    backgroundColor: '#F5F5F5', // Match card bg to create 'cutout' effect look
  },
  modalAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  modalContent: {
    marginTop: 70, // Space for the avatar
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalTagBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTagText: {
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
    color: '#555',
    textTransform: 'uppercase',
  },
  modalBioName: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#333',
    marginBottom: 8,
  },
  modalDescription: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#555',
    lineHeight: 22,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#1F5E2E',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
  },
});
