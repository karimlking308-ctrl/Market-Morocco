import React, { useState, useMemo } from 'react';
import { Star, MapPin, Search, Grid, Info, Phone, MessageSquare, ShoppingBag } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { Store, Product } from '../types';

interface StoreDetailViewProps {
  language: 'ar' | 'fr';
  store: Store;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenChat: (storeId: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function StoreDetailView({
  language,
  store,
  products,
  onSelectProduct,
  onOpenChat,
  onAddToCart
}: StoreDetailViewProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [storeSearch, setStoreSearch] = useState('');

  // Filter store-specific products and match search inside store
  const storeProducts = useMemo(() => {
    let result = products.filter(p => p.storeId === store.id && p.status === 'active');
    
    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [products, store, storeSearch]);

  return (
    <div className="space-y-8 animate-fadeIn" id="store-detail-container">
      
      {/* Store Header Cover Banner & Logo branding */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-lg">
        {/* Cover Photo */}
        <div className="h-44 sm:h-64 relative bg-slate-200 dark:bg-slate-800">
          <img
            src={store.cover}
            alt="Store Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/30" />
        </div>

        {/* Store branding profile details */}
        <div className="p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16 mb-4">
            <img
              src={store.logo}
              alt={store.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-slate-900 object-cover shadow-md bg-white"
            />
            
            <div className="flex-1 space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                {store.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-0.5 text-morocco-red font-bold">
                  <MapPin className="h-3.5 w-3.5" />
                  {store.city}
                </span>
                <span>•</span>
                <span className="font-semibold">{store.category}</span>
              </div>
            </div>

            <button
              onClick={() => onOpenChat(store.id)}
              className="px-5 py-2.5 rounded-xl bg-morocco-green hover:bg-morocco-green/95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm w-full sm:w-auto justify-center"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{t.chatWithSeller}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            {/* Description info */}
            <div className="md:col-span-2 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <Info className="h-3 w-3" />
                {language === 'ar' ? 'نبذة عن المتجر' : 'À propos de la boutique'}
              </span>
              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                {store.description}
              </p>
            </div>

            {/* Quick stats box */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl text-center items-center">
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-white">{storeProducts.length}</p>
                <p className="text-[9px] text-gray-400 uppercase font-semibold">{language === 'ar' ? 'منتجاتنا' : 'produits'}</p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-white">{store.orderCount}</p>
                <p className="text-[9px] text-gray-400 uppercase font-semibold">{language === 'ar' ? 'طلبيات' : 'commandes'}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-0.5 text-xs font-black text-amber-500">
                  <Star className="h-3 w-3 fill-amber-500" />
                  <span>{store.rating}</span>
                </div>
                <p className="text-[9px] text-gray-400 uppercase font-semibold">({store.ratingCount})</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Search & Filter Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <h3 className="text-md font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Grid className="h-5 w-5 text-morocco-red" />
            {language === 'ar' ? 'جميع معروضات المتجر' : 'Tous les produits de la boutique'} ({storeProducts.length})
          </h3>
          
          {/* Specific Search inside Store */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث داخل هذا المتجر فقط...' : 'Rechercher dans cette boutique...'}
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-morocco-red"
              id="store-specific-search"
            />
            <div className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center pr-3 pointer-events-none`}>
              <Search className="h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {storeProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-gray-800 px-4">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">{t.noProductsFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {storeProducts.map((p) => {
              const hasSale = p.salePrice && p.salePrice < p.price;
              
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-slate-850">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {hasSale && (
                      <div className="absolute top-3 left-3 bg-morocco-red text-white text-[9px] font-black px-2 py-0.5 rounded">
                        -{Math.round(((p.price - p.salePrice!) / p.price) * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 space-y-2">
                    <h5 className="text-xs font-extrabold text-slate-800 dark:text-white line-clamp-2 leading-relaxed flex-1 h-8">
                      {p.name}
                    </h5>

                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{p.rating} ({p.ratingCount})</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800/50">
                      <div className="flex flex-col">
                        {hasSale ? (
                          <>
                            <span className="text-xs font-black text-morocco-red">{p.salePrice} DH</span>
                            <span className="text-[10px] text-gray-400 line-through">{p.price} DH</span>
                          </>
                        ) : (
                          <span className="text-xs font-black text-slate-800 dark:text-white">{p.price} DH</span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(p);
                        }}
                        className="bg-morocco-red hover:bg-morocco-red/90 text-white p-1.5 rounded-lg transition-all"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
