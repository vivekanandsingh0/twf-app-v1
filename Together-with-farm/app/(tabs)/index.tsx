import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Image as RNImage,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Nutrition', 'Storage Tips', 'Recipes', 'Tips'];

const ARTICLES = [
  {
    id: 1,
    title: 'How to Keep Fruits Fresh Longer',
    category: 'Storage Tips',
    time: '4 mins',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'How to Keep Fruits Fresh Longer',
    category: 'Storage Tips',
    time: '4 mins',
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=2642&auto=format&fit=crop',
  },
];

const INSIGHTS = [
  {
    id: 1,
    title: 'Farming Tips from Local Farmers in Patna',
    tag: 'Trending',
    time: '4 min read',
    type: 'Farming Tips',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Farming Tips from Local Farmers in Patna',
    tag: 'Trending',
    time: '4 min read',
    type: 'Farming Tips',
    image: 'https://images.unsplash.com/photo-1628188554224-12d7c04052fe?q=80&w=2487&auto=format&fit=crop',
  },
];

export default function FeedScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Social Feed</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="gift-outline" size={24} color="#1A1A1A" />
              <View style={styles.giftBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Search fresh products or brands"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((cat, index) => (
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
            <Text style={styles.sectionTitle}>All Articles</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.articlesContainer}
          >
            {ARTICLES.map((article) => (
              <View key={article.id} style={styles.articleCard}>
                <Image source={{ uri: article.image }} style={styles.articleImage} contentFit="cover" />

                <View style={styles.imageOverlay}>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{article.category}</Text>
                  </View>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeText}>{article.time}</Text>
                  </View>
                </View>

                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <TouchableOpacity style={styles.readMoreLink}>
                    <Text style={styles.readMoreText}>Read article</Text>
                    <Ionicons name="arrow-forward" size={14} color="#1F5E2E" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Admin Insights Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Admin Insights</Text>
          </View>

          <View style={styles.insightsContainer}>
            {INSIGHTS.map((item) => (
              <View key={item.id} style={styles.insightCard}>
                <Image source={{ uri: item.image }} style={styles.insightImage} contentFit="cover" />
                <View style={styles.insightContent}>
                  <View style={styles.insightMetaRow}>
                    <View style={styles.trendingBadge}>
                      <Text style={styles.trendingText}>{item.tag}</Text>
                    </View>
                    <Text style={styles.insightTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.insightTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <TouchableOpacity style={styles.readMoreLink}>
                    <Text style={styles.readMoreText}>{item.type}</Text>
                    <Ionicons name="arrow-forward" size={14} color="#1F5E2E" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Spacer for Floating Tab Bar */}
          <View style={{ height: 100 }} />

        </ScrollView>
      </View>
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
  giftBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50', // Green dot
    borderWidth: 1,
    borderColor: '#fff',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    marginHorizontal: 20,
    marginTop: 10,
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
});
