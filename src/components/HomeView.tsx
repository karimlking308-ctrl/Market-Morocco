import React, { useState, useMemo } from 'react';
import { Sparkles, MapPin, SlidersHorizontal, Heart, Star, ShoppingBag, Eye, TrendingUp, Compass, ArrowUpDown } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { Product, Store, Ad, AppSettings } from '../types';
import { LocalDatabase } from '../db/localDb';

interface HomeViewProps {
  language: 'ar' | 'fr';
  products: Product[];
  stores: Store[];
  ads: Ad[];
  settings: AppSettings;
  onSelectProduct: (product: Product) => void;
  onSelectStore: (storeSlug: string) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function HomeView({
  language,
  products,
  stores,
  ads,
  settings,
  onSelectProduct,
  onSelectStore,
  onToggleWishlist,
  wishlist,
  searchQuery,
  setSearchQuery,
  onAddToCart
}: HomeViewProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  // Active custom ads for banner
  const activeAds = useMemo(() => ads.filter(a => a.status === 'active'), [ads]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status === 'active');

    // Search query matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // City Filter
    if (selectedCity !== 'all') {
      // Find stores in that city, and match products
      const storesInCity = stores.filter(s => s.city === selectedCity).map(s => s.id);
      result = result.filter(p => storesInCity.includes(p.storeId));
    }

    // Price Filter
    result = result.filter(p => {
      const activePrice = p.salePrice ?? p.price;
      return activePrice >= minPrice && activePrice <= maxPrice;
    });

    // Sorting
    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, stores, searchQuery, selectedCategory, selectedCity, minPrice, maxPrice, sortBy]);

  const activeCategoryIcons: Record<string, string> = {
    'القفطان والجلابة المغربية': '👗',
    'الصناعة التقليدية والديكور': '🏺',
    'الزيوت والأعشاب الطبيعية': '🌿',
    'المنتجات الغذائية والمحلية': '🍲',
    'الملابس والأحذية الحديثة': '👟',
    'الهواتف والإلكترونيات': '📱',
    'مستحضرات التجميل المغربية': '💅',
    'أخرى': '📦'
  };

  return (
    <div className="space-y-8" id="home-view-wrapper">
      
      {/* 9 DH Banner Ads Promo */}
      {activeAds.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm" id="ad-banner-slider">
          <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-4 max-w-xl text-right md:text-right">
              <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                المغرب الرقمي (Morocco Digital)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {activeAds[currentAdIndex].title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.createStoreSlogan}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <span className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 font-semibold">
                  {t.setupFeeNote}
                </span>
                <span className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 font-semibold">
                  {t.commissionNote} {settings.commissionPercent}%
                </span>
              </div>
            </div>
            
            <div className="relative w-full md:w-80 h-44 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
              <img
                src={activeAds[currentAdIndex].image}
                alt="Promo Ad"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/10 flex items-end p-3">
                <button
                  onClick={() => onSelectStore('caftan-tazi')}
                  className="bg-morocco-red hover:bg-morocco-red/90 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all w-full text-center shadow-md cursor-pointer"
                >
                  {language === 'ar' ? 'تصفح الآن' : 'Découvrir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Horizontal Selector */}
      <div className="space-y-3" id="categories-scroller">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Compass className="h-5 w-5 text-morocco-red" />
          <h3 className="text-lg font-extrabold tracking-tight">{t.allCategories}</h3>
        </div>
        
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-morocco-red text-white border-morocco-red shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/65 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            🌟 {t.allCategories}
          </button>
          
          {settings.allowedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-morocco-red text-white border-morocco-red shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/65 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{activeCategoryIcons[cat] || '📦'}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Active Cities Dropdown */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="appearance-none pl-10 pr-6 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-morocco-red"
            >
              <option value="all">📍 {t.allCities}</option>
              {settings.moroccanCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Filters Toggle button */}
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              showFiltersPanel
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-gray-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{language === 'ar' ? 'تصفية الأسعار' : 'Prix'}</span>
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            {t.sortBy}:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-4 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-morocco-red"
          >
            <option value="latest">{t.sortLatest}</option>
            <option value="price_low">{t.sortPriceLow}</option>
            <option value="price_high">{t.sortPriceHigh}</option>
            <option value="rating">{t.sortRating}</option>
          </select>
        </div>

      </div>

      {/* Advanced Price Filters Panel */}
      {showFiltersPanel && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 space-y-4 animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-gray-200">{t.priceRange}</span>
            <span className="text-xs font-mono text-morocco-red font-bold">
              {minPrice} DH - {maxPrice} DH
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">{t.minPrice}</label>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full accent-morocco-red"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">{t.maxPrice}</label>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-morocco-red"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Popular Morocco Stores List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.bestSellers}
            </h4>
          </div>
          
          <div className="space-y-3">
            {stores.slice(0, 3).map((store) => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store.id)}
                className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:shadow-md cursor-pointer transition-all flex items-center gap-3"
              >
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {store.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-0.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {store.city}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-extrabold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{store.rating} ({store.ratingCount})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <ShoppingBag className="h-4 w-4 text-morocco-red" />
              {t.featuredProducts} ({filteredProducts.length})
            </h4>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 px-4 shadow-sm">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400 dark:text-slate-400 font-bold">{t.noProductsFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const hasSale = p.salePrice && p.salePrice < p.price;
                const isFavorite = wishlist.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
                    id={`product-card-${p.id}`}
                  >
                    {/* Image Header with float buttons */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-slate-50 dark:bg-slate-850 cursor-pointer" onClick={() => onSelectProduct(p)}>
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      
                      {/* Sale Tag */}
                      {hasSale && (
                        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} bg-morocco-red text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm`}>
                          -{Math.round(((p.price - p.salePrice!) / p.price) * 100)}%
                        </div>
                      )}

                      {/* Floating Favorite Heart */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(p.id);
                        }}
                        className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} p-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm transition-all hover:scale-105 cursor-pointer`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-gray-400'}`} />
                      </button>

                      {/* City location badge */}
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5 text-morocco-red" />
                        <span>{stores.find(s => s.id === p.storeId)?.city.split(' ')[0] || 'المغرب'}</span>
                      </div>
                    </div>

                    {/* Content details */}
                    <div className="p-4 flex flex-col flex-1 space-y-2.5 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span className="truncate max-w-[120px] hover:underline cursor-pointer" onClick={() => onSelectStore(p.storeId)}>
                          🏢 {p.storeName}
                        </span>
                        <span>{p.category}</span>
                      </div>

                      <h5
                        onClick={() => onSelectProduct(p)}
                        className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-morocco-red cursor-pointer leading-relaxed flex-1 h-8"
                      >
                        {p.name}
                      </h5>

                      {/* Rating details */}
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 font-extrabold">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-2.5 w-2.5 ${
                                i < Math.floor(p.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400">{p.rating} ({p.ratingCount})</span>
                      </div>

                      {/* Price & Cart buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex flex-col">
                          {hasSale ? (
                            <>
                              <span className="text-sm font-black text-morocco-red">{p.salePrice} DH</span>
                              <span className="text-[10px] text-slate-400 line-through">{p.price} DH</span>
                            </>
                          ) : (
                            <span className="text-sm font-black text-slate-900 dark:text-white">{p.price} DH</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => onAddToCart(p)}
                          className="bg-morocco-red hover:bg-morocco-red/90 text-white py-2 px-3.5 rounded-full transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>{t.addToCart}</span>
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center mt-1 bg-slate-50 dark:bg-slate-800/50 py-1 rounded-lg">
                        🚚 {t.shippingInfoPlaceholder}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
