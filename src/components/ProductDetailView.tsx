import React, { useState, useMemo } from 'react';
import { Star, Heart, MessageSquare, Share2, MapPin, Truck, ShieldCheck, Check, ChevronLeft, ChevronRight, ShoppingBag, Send } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { Product, Store, Review } from '../types';

interface ProductDetailViewProps {
  language: 'ar' | 'fr';
  product: Product;
  products: Product[];
  store: Store | undefined;
  onAddToCart: (product: Product, color?: string, size?: string) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  onOpenChat: (storeId: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectStore: (storeId: string) => void;
  reviews: Review[];
  onSubmitReview: (rating: number, comment: string) => void;
  currentUser: any;
}

export default function ProductDetailView({
  language,
  product,
  products,
  store,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onOpenChat,
  onSelectProduct,
  onSelectStore,
  reviews,
  onSubmitReview,
  currentUser
}: ProductDetailViewProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [alertAdded, setAlertAdded] = useState(false);

  // Interactive Rating States
  const [starHover, setStarHover] = useState<number | null>(null);
  const [formStarHover, setFormStarHover] = useState<number | null>(null);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewPosted, setReviewPosted] = useState(false);

  const handleTopStarClick = (ratingValue: number) => {
    setNewRating(ratingValue);
    const element = document.getElementById('review-form-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const textarea = element.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  };

  const getRatingLabel = (val: number) => {
    const labels: Record<number, { ar: string; fr: string }> = {
      1: { ar: 'ضعيف جداً (Très mauvais) 😞', fr: 'Très mauvais 😞' },
      2: { ar: 'ضعيف (Mauvais) 🙁', fr: 'Mauvais 🙁' },
      3: { ar: 'مقبول (Moyen) 😐', fr: 'Moyen 😐' },
      4: { ar: 'جيد جداً (Très bien) 🙂', fr: 'Très bien 🙂' },
      5: { ar: 'ممتاز (Excellent) 😍', fr: 'Excellent 😍' },
    };
    return labels[val] ? (language === 'ar' ? labels[val].ar : labels[val].fr) : '';
  };

  // Filter similar products
  const similarProducts = useMemo(() => {
    return products
      .filter(p => p.category === product.category && p.id !== product.id && p.status === 'active')
      .slice(0, 3);
  }, [products, product]);

  // Product specific reviews
  const productReviews = useMemo(() => {
    return reviews.filter(r => r.entityId === product.id && r.entityType === 'product');
  }, [reviews, product]);

  const handleShare = () => {
    const fakeLink = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(fakeLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCartClick = () => {
    onAddToCart(product, selectedColor, selectedSize);
    setAlertAdded(true);
    setTimeout(() => setAlertAdded(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onSubmitReview(newRating, newComment);
    setNewComment('');
    setReviewPosted(true);
    setTimeout(() => setReviewPosted(false), 3000);
  };

  const isFavorite = wishlist.includes(product.id);

  return (
    <div className="space-y-12 animate-fadeIn" id="product-detail-container">
      
      {/* Product Information Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
        
        {/* Gallery Image Slider */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-slate-950">
            <img
              src={product.images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Left/Right controls */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full shadow hover:bg-white dark:hover:bg-slate-800 transition"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-white" />
                </button>
                <button
                  onClick={() => setActiveImageIdx(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full shadow hover:bg-white dark:hover:bg-slate-800 transition"
                >
                  <ChevronRight className="h-5 w-5 text-slate-800 dark:text-white" />
                </button>
              </>
            )}
          </div>
          
          {/* Miniature images indicator */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 ${
                    activeImageIdx === idx ? 'border-morocco-red' : 'border-transparent'
                  } transition`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs bg-morocco-red/10 text-morocco-red font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 transition-all flex items-center gap-1.5 text-xs"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{copiedLink ? t.copied : t.shareProduct}</span>
                </button>
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-500 font-extrabold" id="top-rating-stars-container">
              <div 
                className="flex items-center gap-0.5 bg-amber-500/5 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/10"
                title={language === 'ar' ? 'اضغط لتقييم المنتج مباشرة' : 'Cliquez pour évaluer ce produit'}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = starHover !== null ? star <= starHover : star <= Math.floor(product.rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setStarHover(star)}
                      onMouseLeave={() => setStarHover(null)}
                      onClick={() => handleTopStarClick(star)}
                      className="p-0.5 transition-transform duration-150 hover:scale-125 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`h-4 w-4 transition-colors ${
                          isFilled 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-gray-200 dark:text-gray-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-slate-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800">
                {product.rating} ★ ({product.ratingCount} {language === 'ar' ? 'تقييم' : 'avis'})
              </span>
              <span className="text-[10px] text-slate-400 dark:text-gray-400 font-bold ml-1 animate-pulse hidden sm:inline">
                {language === 'ar' ? '← اضغط لتقييم المنتج فورياً!' : '← Évaluez instantanément !'}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-slate-550/10 dark:bg-slate-800/50 border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              {product.salePrice ? (
                <>
                  <span className="text-2xl font-black text-morocco-red">{product.salePrice} DH</span>
                  <span className="text-sm text-gray-400 line-through font-bold">{product.price} DH</span>
                </>
              ) : (
                <span className="text-2xl font-black text-slate-800 dark:text-white">{product.price} DH</span>
              )}
            </div>
            <div className="text-[11px] text-morocco-green font-bold flex items-center gap-1">
              <Truck className="h-4 w-4" />
              <span>{product.deliveryDuration} • {t.shippingInfoPlaceholder}</span>
            </div>
          </div>

          {/* Options Selection (Colors/Sizes) */}
          <div className="space-y-4">
            {product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {language === 'ar' ? 'اختر اللون المفضل:' : 'Choisir la couleur :'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedColor === color
                          ? 'border-morocco-red bg-morocco-red/10 text-morocco-red'
                          : 'border-gray-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {language === 'ar' ? 'اختر المقاس الملائم:' : 'Choisir la taille :'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedSize === size
                          ? 'border-morocco-red bg-morocco-red/10 text-morocco-red'
                          : 'border-gray-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleCartClick}
              className="w-full py-4 rounded-xl bg-morocco-red hover:bg-morocco-red/95 text-white font-black transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              id="buy-product-btn"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{t.buyNow}</span>
            </button>
            
            {alertAdded && (
              <div className="p-2.5 bg-morocco-green/10 text-morocco-green rounded-lg text-center text-xs font-bold animate-bounce">
                {t.addedToCart}
              </div>
            )}
          </div>

          {/* Moroccan Trust Badges */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center space-y-1">
              <ShieldCheck className="h-5 w-5 text-morocco-green mx-auto" />
              <p className="text-[9px] text-gray-500 font-bold dark:text-gray-400">
                {language === 'ar' ? 'مضمون 100٪' : '100% Garanti'}
              </p>
            </div>
            <div className="text-center space-y-1">
              <Truck className="h-5 w-5 text-morocco-green mx-auto" />
              <p className="text-[9px] text-gray-500 font-bold dark:text-gray-400">
                {language === 'ar' ? 'دفع عند الاستلام' : 'COD à la livraison'}
              </p>
            </div>
            <div className="text-center space-y-1">
              <Check className="h-5 w-5 text-morocco-green mx-auto" />
              <p className="text-[9px] text-gray-500 font-bold dark:text-gray-400">
                {language === 'ar' ? 'توصيل سريع' : 'Expédition rapide'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Product Description Detailed Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Detailed information & tags */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
            {language === 'ar' ? 'وصف وتفاصيل المنتج' : 'Description du produit'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          <div className="space-y-2 pt-4">
            <span className="text-xs font-bold text-slate-400 block">{language === 'ar' ? 'الوسوم والكلمات الدلالية:' : 'Tags :'}</span>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 font-semibold">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Seller details & Direct Chat */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">
              {t.sellerInfo}
            </h4>
            
            {store ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                  />
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-white hover:underline cursor-pointer" onClick={() => onSelectStore(store.id)}>
                      {store.name}
                    </h5>
                    <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {store.city}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-center">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{store.productCount}</p>
                    <p className="text-[10px] text-gray-400">{language === 'ar' ? 'منتجات معروضة' : 'produits'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{store.orderCount}</p>
                    <p className="text-[10px] text-gray-400">{language === 'ar' ? 'طلبيات ناجحة' : 'commandes'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">بائع مسجل غير متصل بالمتجر حالياً.</p>
            )}
          </div>

          <button
            onClick={() => store && onOpenChat(store.id)}
            className="w-full py-3 bg-morocco-green hover:bg-morocco-green/95 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-2 text-xs"
            id="chat-seller-btn"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{t.chatWithSeller}</span>
          </button>
        </div>

      </div>

      {/* Review Ratings and Feedback Form Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
          {t.reviews} ({productReviews.length})
        </h3>

        {/* Existing review comments */}
        {productReviews.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">{t.noReviews}</p>
        ) : (
          <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
            {productReviews.map((r) => (
              <div key={r.id} className="pt-4 first:pt-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{r.reviewerName}</span>
                  <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-amber-500' : 'text-gray-200 dark:text-gray-700'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-300">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Post a Review Form */}
        <form onSubmit={handleReviewSubmit} id="review-form-section" className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 scroll-mt-24">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{t.writeReview}</h4>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-850/60 p-4 rounded-2xl border border-gray-100/85 dark:border-gray-800/85">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.ratingScore}</span>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = formStarHover !== null ? star <= formStarHover : star <= newRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setFormStarHover(star)}
                      onMouseLeave={() => setFormStarHover(null)}
                      className="p-1 hover:scale-125 transition-all duration-150 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          isActive 
                            ? 'fill-amber-500 text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.25)]' 
                            : 'text-gray-200 dark:text-gray-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 min-w-[120px] text-center">
                {getRatingLabel(formStarHover !== null ? formStarHover : newRating)}
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              placeholder={t.commentPlaceholder}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              required
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-morocco-red text-xs leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-morocco-red hover:bg-morocco-red/90 text-white font-black text-xs transition shadow flex items-center gap-1.5"
            id="submit-review-btn"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{t.submitReview}</span>
          </button>

          {reviewPosted && (
            <div className="p-2 bg-morocco-green/10 text-morocco-green rounded-lg text-center text-xs font-bold">
              {language === 'ar' ? 'شكراً لك على مراجعتك القيمة!' : 'Merci pour votre avis précieux !'}
            </div>
          )}
        </form>
      </div>

      {/* Similar Products section */}
      {similarProducts.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">
            {t.similarProducts}
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="group p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 cursor-pointer hover:shadow-md transition flex items-center gap-3"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-12 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-morocco-red">
                    {p.name}
                  </h5>
                  <p className="text-xs font-black text-morocco-red mt-1">
                    {p.salePrice ?? p.price} DH
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
