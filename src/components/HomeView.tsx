import React, { useState, useMemo } from 'react';
import { Sparkles, MapPin, SlidersHorizontal, Heart, Star, ShoppingBag, Eye, TrendingUp, Compass, ArrowUpDown, UserPlus, HelpCircle, Truck, ChevronDown, ChevronUp } from 'lucide-react';
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
  onCreateStore?: () => void;
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
  onAddToCart,
  onCreateStore
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

  // FAQ state
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<'all' | 'general' | 'buyer' | 'seller'>('all');

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
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white dark:bg-slate-900 shadow-xs" id="ad-banner-slider">
          <div className="p-6 sm:p-8 flex flex-col md:flex-row items-stretch justify-between gap-6">
            <div className="space-y-4 flex-1 text-right flex flex-col justify-between">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-800 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  {language === 'ar' ? 'إعلان مميز (Promo Ad)' : 'Sponsorisé'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeAds[currentAdIndex].title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {language === 'ar' 
                    ? 'أنشئ متجرك الإلكتروني الاحترافي بـ 9 دراهم مغربية فقط وابدأ البيع اليوم!' 
                    : 'Créez votre boutique professionnelle pour seulement 9 DH et commencez à vendre dès aujourd\'hui !'}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-bold border border-slate-200/40 dark:border-slate-700">
                    {t.setupFeeNote}
                  </span>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-bold border border-slate-200/40 dark:border-slate-700">
                    {t.commissionNote} {settings.commissionPercent}%
                  </span>
                </div>
              </div>
              
              <div className="pt-3">
                <button
                  onClick={() => onSelectStore('caftan-tazi')}
                  className="inline-flex items-center justify-center bg-slate-950 hover:bg-slate-800 text-white text-xs font-black px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {language === 'ar' ? 'تصفح الآن' : 'Découvrir'}
                </button>
              </div>
            </div>
            
            {/* Promo Image (Fully visible and un-obscured) */}
            <div className="relative w-full md:w-80 h-44 shrink-0 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800">
              <img
                src={activeAds[currentAdIndex].image}
                alt="Promo Ad"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Launch Store Promotion Banner CTA */}
      {onCreateStore && (
        <div className="bg-[#fcfaf2] dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border border-amber-200/60 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="space-y-1.5 text-right flex-1">
            <h4 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
              🚀 {language === 'ar' ? 'أطلق متجرك الإلكتروني الاحترافي بـ 9 دراهم فقط!' : 'Lancez votre e-commerce pour 9 DH seulement !'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {language === 'ar' 
                ? 'انضم إلى مئات الحرفيين والتجار المغاربة وعرض منتجاتك على ملايين الزبائن بضمان الدفع عند الاستلام وبوابة SMS فورية!'
                : 'Rejoignez des centaines d\'artisans et commerçants marocains. Vendez à des millions d\'acheteurs !'}
            </p>
          </div>
          <button
            onClick={onCreateStore}
            className="shrink-0 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>✨ {language === 'ar' ? 'تأسيس متجر الآن' : 'Créer ma boutique'}</span>
          </button>
        </div>
      )}

      {/* How it Works Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs" id="how-it-works-section">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-850 pb-4">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="text-right">
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              {language === 'ar' ? 'كيف يعمل may-store ؟' : 'Comment fonctionne may-store ?'}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              {language === 'ar' 
                ? 'خطوات بسيطة ومضمونة لتبدأ تجارتك الإلكترونية أو تشتري بأمان'
                : 'Des étapes simples pour lancer votre commerce ou acheter en toute sécurité'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="space-y-3 relative group">
            <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse md:flex-row">
              <div className="w-10 h-10 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-extrabold text-sm border border-slate-100 dark:border-slate-700 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all">
                1
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1 hidden md:block"></div>
            </div>
            
            <div className="space-y-1 text-right">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center justify-end md:justify-start gap-2 flex-row-reverse">
                <UserPlus className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{language === 'ar' ? 'تسجيل حساب فوري' : 'Inscription Rapide'}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {language === 'ar'
                  ? 'أنشئ حساباً مجانياً بثوانٍ كبائع أو مشترٍ من خلال بوابتنا الآمنة لتستفيد من كافة خدمات المنصة.'
                  : 'Créez un compte gratuit en quelques secondes pour acheter ou configurer vos accès de vente.'}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 relative group">
            <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse md:flex-row">
              <div className="w-10 h-10 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-extrabold text-sm border border-slate-100 dark:border-slate-700 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all">
                2
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1 hidden md:block"></div>
            </div>
            
            <div className="space-y-1 text-right">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center justify-end md:justify-start gap-2 flex-row-reverse">
                <ShoppingBag className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{language === 'ar' ? 'إطلاق المتجر (9 DH)' : 'Lancement du Magasin (9 DH)'}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {language === 'ar'
                  ? 'بضغطة واحدة، سدّد رسوم التأسيس البالغة 9 دراهم فقط لمرة واحدة مدى الحياة، وابدأ برفع سلعك فوراً.'
                  : 'Réglez des frais uniques de 9 DH à vie, personnalisez votre boutique et publiez vos premiers produits.'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 relative group">
            <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse md:flex-row">
              <div className="w-10 h-10 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-extrabold text-sm border border-slate-100 dark:border-slate-700 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all">
                3
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
            </div>
            
            <div className="space-y-1 text-right">
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center justify-end md:justify-start gap-2 flex-row-reverse">
                <Truck className="h-4 w-4 text-morocco-red shrink-0" />
                <span>{language === 'ar' ? 'استقبال الطلبات والبيع' : 'Vente & Expédition'}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {language === 'ar'
                  ? 'استقبل الطلبات من الزبائن مع تنبيهات SMS تلقائية. اشحن بأمان لجميع مدن المغرب بنظام الدفع عند الاستلام.'
                  : 'Recevez des commandes avec alertes SMS automatiques et livrez vos clients partout au Maroc.'}
              </p>
            </div>
          </div>

        </div>
      </div>

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

      {/* Interactive FAQ Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs" id="marketplace-faq-section">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-850 pb-5">
          <div className="text-right">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-end md:justify-start gap-2 flex-row-reverse">
              <HelpCircle className="h-5 w-5 text-morocco-red shrink-0" />
              <span>{language === 'ar' ? 'الأسئلة الشائعة (FAQ)' : 'Foire Aux Questions'}</span>
            </h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              {language === 'ar' 
                ? 'إجابات شاملة على كل تساؤلاتك حول الاستخدام، البيع والضمانات'
                : 'Tout ce que vous devez savoir pour acheter et vendre en toute confiance'}
            </p>
          </div>

          {/* FAQ Category Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-850 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => { setFaqCategory('all'); setActiveFaqId(null); }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                faqCategory === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'Tout'}
            </button>
            <button
              onClick={() => { setFaqCategory('general'); setActiveFaqId(null); }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                faqCategory === 'general'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'عام' : 'Général'}
            </button>
            <button
              onClick={() => { setFaqCategory('buyer'); setActiveFaqId(null); }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                faqCategory === 'buyer'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'المشترون' : 'Acheteurs'}
            </button>
            <button
              onClick={() => { setFaqCategory('seller'); setActiveFaqId(null); }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                faqCategory === 'seller'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'البائعون' : 'Vendeurs'}
            </button>
          </div>
        </div>

        {/* FAQs Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: 1,
              category: 'general',
              question: {
                ar: 'ما هي منصة may-store؟',
                fr: "Qu'est-ce que may-store ?"
              },
              answer: {
                ar: 'هي منصة تجارة إلكترونية وطنية رائدة تهدف إلى تمكين الحرفيين، التعاونيات، والتجار المغاربة من إطلاق متاجرهم المستقلة وعرض منتجاتهم الأصيلة (كالقفطان، زيت الأركان، والحرف اليدوية) للملايين عبر قنوات تسويق متكاملة ودعم ذكي.',
                fr: "C'est une plateforme d'e-commerce marocaine conçue pour aider les artisans, les coopératives et les commerçants à créer leurs boutiques en ligne et à vendre des produits locaux authentiques (comme les caftans, l'huile d'argan et l'artisanat)."
              }
            },
            {
              id: 2,
              category: 'seller',
              question: {
                ar: 'كم تبلغ تكلفة إنشاء متجر وبدء البيع؟',
                fr: "Combien coûte la création d'une boutique ?"
              },
              answer: {
                ar: 'رسوم تأسيس المتجر هي 9 دراهم مغربية فقط تُدفع لمرة واحدة مدى الحياة! لا توجد اشتراكات شهرية خفية، بينما تبلغ عمولة المنصة على المبيعات الناجحة 5% فقط لتغطية خدمات الرسائل القصيرة والصيانة والدعم المباشر.',
                fr: "Les frais d'installation de la boutique sont de seulement 9 DH, payables une fois à vie ! Il n'y a pas d'abonnement mensuel caché, et la commission sur les ventes réussies est de 5% pour financer les services de maintenance et de SMS."
              }
            },
            {
              id: 3,
              category: 'buyer',
              question: {
                ar: 'كيف أضمن جودة المنتجات وهل يوجد دفع عند الاستلام؟',
                fr: "Comment s'assurer de la qualité et comment payer ?"
              },
              answer: {
                ar: 'نعم، جميع المعاملات في منصتنا تعتمد بشكل أساسي على "الدفع عند الاستلام" (Cash on Delivery). كما يمكنك تصفح تقييمات المتاجر والمنتجات من زبائن حقيقيين للتأكد من جودة وموثوقية السلع قبل الطلب.',
                fr: "Oui, la majorité des transactions se font par Paiement à la Livraison (Cash on Delivery). Vous pouvez également consulter les avis authentiques des clients sur chaque produit et chaque boutique pour acheter en toute sérénité."
              }
            },
            {
              id: 4,
              category: 'seller',
              question: {
                ar: 'ما هي الميزات الذكية (AI) المتوفرة للتجار؟',
                fr: "Quelles sont les fonctionnalités IA disponibles ?"
              },
              answer: {
                ar: 'توفر المنصة مساعداً ذكياً للمشتري لمساعدته على اختيار المنتجات المناسبة، كما توفر صائغ ردود تلقائي بالذكاء الاصطناعي للبائعين لمساعدتهم في الرد الفوري والاحترافي على رسائل واستفسارات الزبائن بسهولة وسرعة.',
                fr: "La plateforme propose un conseiller shopping IA pour aider les acheteurs à choisir leurs articles, ainsi qu'un générateur de réponses intelligentes IA pour les vendeurs afin de répondre rapidement aux messages des clients."
              }
            },
            {
              id: 5,
              category: 'buyer',
              question: {
                ar: 'كيف يمكنني تقديم شكوى في حال واجهت مشكلة مع بائع؟',
                fr: "Comment déposer une réclamation en cas de problème ?"
              },
              answer: {
                ar: 'سلامتكم ورضاكم هما أولويتنا! في حال حدوث أي مشكلة، يمكنك الانتقال إلى قسم الشكاوى المتاح في حسابك وتقديم بلاغ رسمي. سيقوم فريق الإدارة بمراجعة المشكلة والتدخل لضمان استرداد حقك بالكامل وحظر المتاجر المخالفة.',
                fr: "Votre satisfaction est notre priorité ! En cas de problème, vous pouvez déposer une réclamation officielle depuis votre espace client. Notre équipe administrative étudiera l'incident pour garantir vos droits."
              }
            },
            {
              id: 6,
              category: 'general',
              question: {
                ar: 'هل التوصيل متوفر لجميع المدن المغربية؟',
                fr: "La livraison est-elle disponible dans toutes les villes ?"
              },
              answer: {
                ar: 'نعم! يتعاون تجارنا مع أفضل شركات الشحن السريع بالمغرب لضمان توصيل آمن وموثوق ومستعجل إلى باب بيتك في جميع المدن والقرى من طنجة إلى الكويرة.',
                fr: "Absolument ! Nos vendeurs collaborent avec les meilleurs services de livraison express au Maroc pour expédier vos colis à domicile, de Tanger à Lagouira."
              }
            }
          ]
            .filter(faq => faqCategory === 'all' || faq.category === faqCategory)
            .map((faq) => {
              const isOpen = activeFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-250 ${
                    isOpen
                      ? 'border-slate-300 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-850/40 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-750'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaqId(isOpen ? null : faq.id)}
                    className="w-full text-right px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-2.5 flex-row-reverse text-right">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        faq.category === 'seller'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                          : faq.category === 'buyer'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {faq.category === 'seller' ? (language === 'ar' ? 'بائع' : 'Vendeur') : faq.category === 'buyer' ? (language === 'ar' ? 'مشتري' : 'Acheteur') : (language === 'ar' ? 'عام' : 'Général')}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                        {language === 'ar' ? faq.question.ar : faq.question.fr}
                      </h4>
                    </div>
                    <div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold border-t border-slate-100/60 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/30 animate-fadeIn">
                      {language === 'ar' ? faq.answer.ar : faq.answer.fr}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
}
