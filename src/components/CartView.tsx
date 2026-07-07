import React, { useState } from 'react';
import { Trash2, ShoppingCart, MapPin, Phone, User, Home, Sparkles, Receipt, CheckCircle2, CreditCard, Lock, Shield, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { OrderItem, Product, AppSettings } from '../types';

interface CartViewProps {
  language: 'ar' | 'fr';
  cart: { product: Product; quantity: number; color?: string; size?: string }[];
  onRemoveFromCart: (idx: number) => void;
  onUpdateCartQty: (idx: number, qty: number) => void;
  onPlaceOrder: (fullName: string, phone: string, address: string, city: string, couponCode?: string, paymentMethod?: 'COD' | 'card') => void;
  settings: AppSettings;
  coupons: any[];
}

export default function CartView({
  language,
  cart,
  onRemoveFromCart,
  onUpdateCartQty,
  onPlaceOrder,
  settings,
  coupons
}: CartViewProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // Checkout inputs
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(settings.moroccanCities[0] || '');
  
  // Payment methods
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'card'>('COD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardError, setCardError] = useState('');

  // Coupons calculations
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // View state after checkout complete
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.product.salePrice ?? item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal > 500 ? 0 : 25; // Free shipping on orders above 500 DH

  // Calculate discount based on active coupon
  const discount = activeCoupon
    ? activeCoupon.discountType === 'percent'
      ? Math.round(subtotal * (activeCoupon.discountValue / 100))
      : activeCoupon.discountValue
    : 0;

  const total = Math.max(0, subtotal + shippingFee - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) return;

    // Search coupon code
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.status === 'active');
    
    if (found) {
      setActiveCoupon(found);
      setCouponSuccess(t.couponApplied);
    } else {
      setActiveCoupon(null);
      setCouponError(t.invalidCoupon);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !city) return;

    if (paymentMethod === 'card') {
      setCardError('');
      // Clean digits check
      const digitsOnly = cardNumber.replace(/\s+/g, '');
      if (digitsOnly.length < 16) {
        setCardError(language === 'ar' ? 'رقم البطاقة غير صحيح (يجب أن يتكون من 16 رقماً)' : 'Numéro de carte invalide (doit contenir 16 chiffres)');
        return;
      }
      if (!cardHolder.trim()) {
        setCardError(language === 'ar' ? 'يرجى إدخال اسم صاحب البطاقة' : 'Veuillez saisir le nom du titulaire');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setCardError(language === 'ar' ? 'صيغة تاريخ انتهاء الصلاحية غير صحيحة (MM/YY)' : 'Format d\'expiration invalide (MM/YY)');
        return;
      }
      const parts = cardExpiry.split('/');
      const month = parseInt(parts[0], 10);
      if (month < 1 || month > 12) {
        setCardError(language === 'ar' ? 'شهر انتهاء الصلاحية غير صحيح' : 'Mois d\'expiration invalide');
        return;
      }
      if (cardCvv.length < 3) {
        setCardError(language === 'ar' ? 'الرمز السري الخلفي CVV غير صحيح (3 أرقام)' : 'Code CVV invalide (3 chiffres)');
        return;
      }

      setIsProcessingCard(true);
      // Simulate CMI/Stripe 3D-Secure secure payment gateway verification delay
      setTimeout(() => {
        setIsProcessingCard(false);
        const fakeOrderId = `order-ma-${Math.floor(1000 + Math.random() * 9000)}`;
        setPlacedOrderId(fakeOrderId);
        setIsOrderPlaced(true);
        onPlaceOrder(fullName, phone, address, city, activeCoupon?.code, 'card');
      }, 2000);
    } else {
      const fakeOrderId = `order-ma-${Math.floor(1000 + Math.random() * 9000)}`;
      setPlacedOrderId(fakeOrderId);
      setIsOrderPlaced(true);
      onPlaceOrder(fullName, phone, address, city, activeCoupon?.code, 'COD');
    }
  };

  if (isOrderPlaced) {
    return (
      <div className="max-w-xl mx-auto text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6 animate-scaleUp" id="checkout-success-view">
        <CheckCircle2 className="h-20 w-20 text-morocco-green mx-auto animate-bounce" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
          {t.orderSuccessTitle}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {t.orderSuccessDesc}
        </p>
        
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl space-y-2 text-right">
          <p className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between">
            <span>{t.orderId}:</span>
            <span className="font-mono text-morocco-red font-black">{placedOrderId}</span>
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between">
            <span>{language === 'ar' ? 'الاسم:' : 'Nom :'}:</span>
            <span>{fullName}</span>
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between">
            <span>{t.phone}:</span>
            <span>{phone}</span>
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between">
            <span>{language === 'ar' ? 'المدينة والوجهة:' : 'Destination :'}:</span>
            <span>{city}</span>
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between">
            <span>{language === 'ar' ? 'طريقة الدفع:' : 'Mode de paiement :'}:</span>
            <span className="font-semibold text-slate-950 dark:text-slate-100">
              {paymentMethod === 'card' 
                ? (language === 'ar' ? '💳 بطاقة بنكية (مقبولة)' : '💳 Carte Bancaire') 
                : (language === 'ar' ? '💵 الدفع عند الاستلام' : '💵 Cash on Delivery')}
            </span>
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-gray-300 flex justify-between border-t border-gray-200/50 pt-2 font-black text-morocco-red">
            <span>{t.totalAmount}:</span>
            <span>{total} DH</span>
          </p>
        </div>

        {paymentMethod === 'card' ? (
          <div className="text-[11px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30 rounded-lg p-3 flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-right">
              {language === 'ar' 
                ? '✓ تم تأكيد الدفع بنجاح عبر البطاقة البنكية الآمنة (المركز المغربي لوسائل الدفع CMI / Visa / Mastercard). طلبك مؤمن بالكامل.' 
                : '✓ Paiement effectué avec succès par Carte Bancaire sécurisée (CMI / Visa / Mastercard). Votre commande est entièrement sécurisée.'}
            </span>
          </div>
        ) : (
          <div className="text-[10px] bg-amber-50 dark:bg-amber-900/10 text-amber-600 border border-amber-200/50 rounded-lg p-3">
            ⚠️ {language === 'ar' ? 'تنبيه: لن يطلب منك أي دفع بالبطاقة المصرفية الآن. قم بالدفع هاتفياً أو نقداً بعد معاينة السلعة في منزلك.' : 'Remarque : Aucun paiement bancaire en ligne n’est requis. Payez en espèces uniquement lors de la livraison.'}
          </div>
        )}
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 space-y-4" id="empty-cart-view">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto" />
        <h2 className="text-lg font-black text-slate-800 dark:text-white">{language === 'ar' ? 'سلة التسوق فارغة' : 'Votre panier est vide'}</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">{t.emptyCart}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn" id="cart-checkout-container">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        <ShoppingCart className="h-6 w-6 text-morocco-red" />
        {t.cartTitle} ({cart.length})
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart items list - left 7 columns */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {cart.map((item, idx) => {
              const activePrice = item.product.salePrice ?? item.product.price;
              
              return (
                <div key={idx} className="p-4 sm:p-5 flex gap-4 items-center" id={`cart-item-${idx}`}>
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-20 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      🏢 {item.product.storeName}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-gray-500">
                      {item.color && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Couleur: {item.color}</span>}
                      {item.size && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Taille: {item.size}</span>}
                    </div>
                  </div>

                  {/* Quantity and actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                      <button
                        onClick={() => item.quantity > 1 && onUpdateCartQty(idx, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateCartQty(idx, item.quantity + 1)}
                        className="px-2.5 py-1 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p className="text-xs font-black text-slate-800 dark:text-white">
                        {activePrice * item.quantity} DH
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveFromCart(idx)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Code Panel */}
          <form onSubmit={handleApplyCoupon} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <input
              type="text"
              placeholder={t.couponCode}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red uppercase"
            />
            <button
              type="submit"
              className="bg-morocco-red hover:bg-morocco-red/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              {t.applyCoupon}
            </button>
          </form>
          {couponError && <p className="text-[10px] text-red-500 font-bold px-2">{couponError}</p>}
          {couponSuccess && <p className="text-[10px] text-morocco-green font-bold px-2">{couponSuccess}</p>}
        </div>

        {/* Checkout Order Form - right 5 columns */}
        <div className="lg:col-span-5">
          <form onSubmit={handleCheckoutSubmit} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-800 pb-2">
              {t.checkoutTitle}
            </h3>

            {/* Input Details */}
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.fullName}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} flex items-center text-gray-400`}>
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={t.fullNamePlaceholder}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.phone}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} flex items-center text-gray-400`}>
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder={t.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.selectCity}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} flex items-center text-gray-400`}>
                    <MapPin className="h-4 w-4 text-morocco-red" />
                  </span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red appearance-none"
                  >
                    {settings.moroccanCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{language === 'ar' ? 'العنوان بالتفصيل' : 'Adresse de livraison'}</label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-3' : 'left-3'} flex items-center text-gray-400`}>
                    <Home className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={t.addressPlaceholder}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{language === 'ar' ? 'طريقة الدفع' : 'Mode de paiement'}</label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Option 1: COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-2xl border text-right flex flex-col justify-between h-22 transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-morocco-red bg-morocco-red/5 dark:bg-morocco-red/10 shadow-sm'
                      : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-morocco-red">💵 COD</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                    {language === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
                  </span>
                </button>

                {/* Option 2: Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border text-right flex flex-col justify-between h-22 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-morocco-red bg-morocco-red/5 dark:bg-morocco-red/10 shadow-sm'
                      : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-emerald-600">💳 Card</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white mt-1 leading-tight">
                    {language === 'ar' ? 'بطاقة بنكية مغربية ودولية' : 'Carte bancaire nationale & intl'}
                  </span>
                </button>
              </div>
            </div>

            {/* Credit Card Details Subform */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Lock className="h-3 w-3 text-emerald-500" />
                    {language === 'ar' ? 'بوابة دفع آمنة CMI / Stripe' : 'Passerelle sécurisée CMI / Stripe'}
                  </span>
                  {/* Logos */}
                  <div className="flex items-center gap-1 opacity-85">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded bg-white text-slate-700 font-extrabold shadow-sm">CMI</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded bg-white text-blue-800 font-extrabold shadow-sm">Visa</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded bg-white text-red-500 font-extrabold shadow-sm">MC</span>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase">{language === 'ar' ? 'اسم صاحب البطاقة' : 'Nom du titulaire'}</label>
                  <input
                    type="text"
                    required={paymentMethod === 'card'}
                    placeholder={language === 'ar' ? 'مثال: KARIM ALAOUI' : 'EX: KARIM ALAOUI'}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-morocco-red"
                  />
                </div>

                {/* Card Number */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase">{language === 'ar' ? 'رقم البطاقة (16 رقماً)' : 'Numéro de la carte'}</label>
                  <div className="relative">
                    <input
                      type="text"
                      required={paymentMethod === 'card'}
                      maxLength={19} // Supports space separators
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => {
                        // Format credit card with spaces
                        const val = e.target.value.replace(/\D/g, '');
                        const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                        setCardNumber(formatted);
                      }}
                      className="w-full pl-3 pr-10 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <CreditCard className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">{language === 'ar' ? 'تاريخ الانتهاء' : 'Expiration'}</label>
                    <input
                      type="text"
                      required={paymentMethod === 'card'}
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setCardExpiry(val);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-morocco-red"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">CVV / CVC</label>
                    <input
                      type="password"
                      required={paymentMethod === 'card'}
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-morocco-red"
                    />
                  </div>
                </div>

                {cardError && (
                  <p className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded">
                    ⚠️ {cardError}
                  </p>
                )}
              </div>
            )}

            {/* Calculations Box */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-150 dark:border-gray-700/50 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-gray-300">
                <span>{t.subtotal}:</span>
                <span>{subtotal} DH</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs font-bold text-morocco-red">
                  <span>{t.discountAmount}:</span>
                  <span>-{discount} DH</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-gray-300">
                <span>{t.shippingFee}:</span>
                <span>{shippingFee === 0 ? (language === 'ar' ? 'مجاني' : 'Gratuit') : `${shippingFee} DH`}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-800 dark:text-white border-t border-gray-200/50 pt-3 text-sm">
                <span>{t.totalAmount}:</span>
                <span>{total} DH</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessingCard}
              className={`w-full py-4 rounded-xl text-white font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 ${
                isProcessingCard
                  ? 'bg-slate-700 dark:bg-slate-800 cursor-not-allowed opacity-90'
                  : 'bg-morocco-red hover:bg-morocco-red/95 cursor-pointer'
              }`}
              id="confirm-checkout-btn"
            >
              {isProcessingCard ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>
                    {language === 'ar' ? 'جاري الاتصال الآمن بالبنك...' : 'Transaction CMI 3D-Secure...'}
                  </span>
                </>
              ) : (
                <>
                  {paymentMethod === 'card' ? (
                    <Shield className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>
                    {paymentMethod === 'card'
                      ? (language === 'ar' ? `دفع وآمن ${total} درهم` : `Payer en toute sécurité ${total} DH`)
                      : t.placeOrder}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
