import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFavourites } from '@/contexts/FavouritesContext';
import { useAddresses } from '@/contexts/AddressContext';
import { useCart } from '@/contexts/CartContext';
import { useMarket, MarketProduct } from '@/contexts/MarketContext';
import { useNotifications } from '@/contexts/NotificationContext';
import CartPopup from '@/components/CartPopup';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Leafy', 'Seasonals', 'Roots', 'Daily Essentials'];

const LOCATIONS = [
  { id: '1', type: 'Home', address: 'Patna, Bihar', zip: '800001' },
  { id: '2', type: 'Office', address: 'Boring Road, Patna', zip: '800002' },
  { id: '3', type: 'Parents', address: 'Danapur, Patna', zip: '801503' },
];

export default function MarketScreen() {
  const router = useRouter();
  const { products } = useMarket();
  const { toggleFavourite, isFavourite } = useFavourites();
  const { addresses, selectedAddress, setSelectedAddress } = useAddresses();
  const { updateQuantity, getItemQuantity } = useCart();
  const { unreadCount } = useNotifications();
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const insets = useSafeAreaInsets();

  const dealProducts = products.filter(p => p.specialOffer);
  const regularProducts = products.filter(p => !p.specialOffer);

  // Combine for search
  const allProducts = products;
  const filteredSearchResults = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductCard = (item: any) => {
    const qty = getItemQuantity(item.id);
    const isDeal = item.specialOffer !== undefined;
    const isPreorder = item.order_type === 'pre-order';
    const hasDiscount = item.discountValue && item.discountValue > 0;
    const discountedPrice = hasDiscount ? (item.price * (1 - item.discountValue / 100)).toFixed(0) : null;

    // Dynamic style based on if it's a deal product or not, 
    // passing existing logic.
    const cardStyle = isDeal
      ? [styles.productCard, { borderColor: '#FFD700', borderWidth: 2, backgroundColor: isDark ? '#3E2723' : '#FFFDE7' }]
      : [styles.productCard, isDark && { backgroundColor: '#1E1E1E', borderColor: '#333' }];

    return (
      <TouchableOpacity
        key={item.id}
        style={cardStyle}
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={[styles.productImageContainer, isDark && { backgroundColor: '#2C2C2C' }]}>
          <Image source={item.image} style={styles.productImage} contentFit="contain" />
          {hasDiscount && (
            <View style={[styles.discountBadge, isDeal && { backgroundColor: '#FBC02D' }]}>
              <Text style={[styles.discountText, isDeal && { color: '#000' }]}>{item.discount}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.favButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavourite(item.id);
            }}
          >
            <Ionicons
              name={isFavourite(item.id) ? "heart" : "heart-outline"}
              size={20}
              color={isFavourite(item.id) ? "#FF4B4B" : "#1A1A1A"}
            />
          </TouchableOpacity>
          {isPreorder && (
            <View style={styles.preorderBadge}>
              <Ionicons name="time-outline" size={10} color="#fff" />
              <Text style={styles.preorderBadgeText}>Pre-order</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          {isDeal && (
            <Text style={[styles.productType, { color: '#F57F17', fontWeight: 'bold' }]}>{item.specialOffer}</Text>
          )}
          {!isDeal && !!item.type && (
            <Text style={[styles.productType, isDark && { color: '#AAA' }]}>{item.type}</Text>
          )}
          <Text style={[styles.productName, isDark && { color: '#FFF' }]} numberOfLines={1}>{item.name}</Text>

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              {hasDiscount ? (
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.price, isDark && { color: '#81C784' }]}>₹{discountedPrice}</Text>
                  <Text style={[styles.originalPrice, isDark && { color: '#888' }, { marginLeft: 4 }]}>₹{item.price}</Text>
                </View>
              ) : (
                <Text style={[styles.price, isDark && { color: '#81C784' }]}>₹{item.price}</Text>
              )}
              <Text style={styles.unit}>{item.unit}</Text>
            </View>

            {qty === 0 ? (
              <TouchableOpacity
                style={[styles.addButton, isDeal && { backgroundColor: '#F9A825' }, isPreorder && { backgroundColor: '#E65100' }]}
                onPress={() => updateQuantity(item.id, 1)}
              >
                <Ionicons name={isPreorder ? "time-outline" : "add"} size={isPreorder ? 20 : 24} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={[styles.quantityControl, isDeal && { backgroundColor: '#F9A825' }]}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Ionicons name="remove" size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isDark && { backgroundColor: '#121212' }]}>
      <StatusBar style="light" />

      {/* Header Section */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 30), zIndex: 10 }]}>
        <View style={styles.headerTop}>
          {/* Location Dropdown Trigger */}
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => setShowLocationPicker(!showLocationPicker)}
            activeOpacity={0.8}
          >
            <View style={styles.locationIconBg}>
              <Ionicons name="location-outline" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.locationRow}>
                <Text style={styles.locationTitle}>{selectedAddress?.type || 'Select Location'}</Text>
                <Ionicons name={showLocationPicker ? "chevron-up" : "chevron-down"} size={16} color="#fff" />
              </View>
              <Text style={styles.deliveryTime} numberOfLines={1} ellipsizeMode="tail">
                {selectedAddress?.address || 'No address selected'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.notificationBtn, isDark && { backgroundColor: '#333' }]}
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

        {/* Search Bar */}
        <View style={[styles.searchContainer, isDark && { backgroundColor: '#333' }]}>
          <Ionicons name="search-outline" size={20} color={isDark ? '#AAA' : '#666'} style={styles.searchIcon} />
          <TextInput
            placeholder="Search 'Tomato' or 'Potato'"
            placeholderTextColor={isDark ? '#888' : '#999'}
            style={[styles.searchInput, isDark && { color: '#FFF' }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories - Only show if NO search query */}
        {searchQuery.length === 0 && (
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
        )}
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {searchQuery.length > 0 ? (
          // Search Results View
          <View style={styles.searchResultsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Search Results ({filteredSearchResults.length})</Text>
            </View>
            <View style={styles.gridContainer}>
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map(renderProductCard)
              ) : (
                <View style={styles.noResults}>
                  <Ionicons name="search" size={48} color="#DDD" />
                  <Text style={styles.noResultText}>No items found for "{searchQuery}"</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          // Normal Sections View
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Bestsellers</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsContainer}>
              {/* Show top rated or random products */}
              {products.filter(p => p.isFavorite).slice(0, 5).map(renderProductCard)}
            </ScrollView>

            {dealProducts.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Grab Best Deal</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsContainer}>
                  {dealProducts.map(renderProductCard)}
                </ScrollView>
              </>
            )}

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Leafy & Fresh</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsContainer}>
              {products.filter(p => ['Leafy', 'Hydroponic', 'Organic', 'Fresh'].includes(p.type) || p.tag === 'Fresh').map(renderProductCard)}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Seasonal Fruits</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsContainer}>
              {products.filter(p => p.type.includes('Fruit')).map(renderProductCard)}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Farm Classics</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsContainer}>
              {products.filter(p => p.type === 'Daily' || p.tag === 'Local').map(renderProductCard)}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFF' }]}>Root Vegetables</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsContainer}>
              {products.filter(p => p.type === 'Roots').map(renderProductCard)}
            </ScrollView>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Cart Popup */}
      <CartPopup />

      {/* Location Dropdown Overlay - Global Position */}
      {showLocationPicker && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 900 }} pointerEvents="box-none">
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            activeOpacity={1}
            onPress={() => setShowLocationPicker(false)}
          />
          <View style={[styles.locationDropdown, { top: Math.max(insets.top + 55, 75) }, isDark && { backgroundColor: '#333' }]}>
            {addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={[styles.locationOption, isDark && { borderBottomColor: '#444' }]}
                onPress={() => {
                  setSelectedAddress(addr);
                  setShowLocationPicker(false);
                }}
              >
                <Ionicons
                  name={selectedAddress?.id === addr.id ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={selectedAddress?.id === addr.id ? "#1F5E2E" : "#999"}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.locationOptionTitle, selectedAddress?.id === addr.id && { color: '#81C784' }, isDark && selectedAddress?.id !== addr.id && { color: '#FFF' }]}>
                    {addr.type}
                  </Text>
                  <Text style={[styles.locationOptionAddress, isDark && { color: '#AAA' }]} numberOfLines={2}>
                    {addr.address}, {addr.city}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    backgroundColor: '#1F5E2E',
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden', // Ensures content respects the rounded corners
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    maxWidth: '70%',
  },
  locationIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTitle: {
    color: '#fff',
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  deliveryTime: {
    color: '#A5D6A7', // Light green text
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1F5E2E',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'DMSans_700Bold',
    lineHeight: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
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
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCategoryChip: {
    backgroundColor: '#AED581', // Limeish Green
  },
  inactiveCategoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent for "merged" look
  },
  categoryText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  activeCategoryText: {
    color: '#1F5E2E',
  },
  inactiveCategoryText: {
    color: '#FFFFFF', // White text on transparent background
  },
  scrollContent: {
    paddingTop: 24,
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
  productsContainer: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 24, // Space for shadow
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    // Shadow
    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.06)',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  productImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1F5E2E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'DMSans_700Bold',
  },
  favButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 2,
  },
  productInfo: {
    width: '100%',
  },
  productType: {
    fontSize: 10,
    color: '#888',
    fontFamily: 'DMSans_400Regular',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'DMSans_700Bold',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#1F5E2E',
  },
  originalPrice: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  unit: {
    fontSize: 12,
    color: '#888',
    marginLeft: 2,
    fontFamily: 'DMSans_400Regular',
  },
  preorderBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#E65100',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  preorderBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'DMSans_700Bold',
  },
  // ... existing styles ...
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F5E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F5E2E',
    borderRadius: 16,
    height: 32,
    paddingHorizontal: 4,
    gap: 8,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: '#fff',
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  cartPopupContainer: {
    // ... existing styles ...
    position: 'absolute',
    bottom: 90, // Above tab bar
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  cartPopup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F5E2E',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 12,
    boxShadow: '0px 4px 15px rgba(31, 94, 46, 0.4)',
    elevation: 8,
    minWidth: 160,
  },
  cartImages: {
    width: 50,
    height: 30,
    position: 'relative',
    marginRight: 8,
  },
  tinyThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1F5E2E',
    position: 'absolute',
    top: 0,
    backgroundColor: '#fff',
  },
  moreThumb: {
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 10,
    color: '#1F5E2E',
    fontWeight: 'bold',
  },
  viewCartText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  cartBadgeCount: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  cartCountText: {
    color: '#1F5E2E',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // NEW STYLES
  locationDropdown: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 1000,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  locationOptionTitle: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    color: '#333',
  },
  locationOptionAddress: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
    marginTop: 2,
  },
  searchResultsContainer: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 20,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    gap: 12,
  },
  noResultText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#999',
  },
});
