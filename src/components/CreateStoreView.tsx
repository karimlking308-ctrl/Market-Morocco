import React, { useState } from 'react';
import { Store, MapPin, Sparkles, Check, AlertCircle, ShoppingBag, ShieldCheck, CreditCard, ChevronRight, ChevronLeft, Building, HelpCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface CreateStoreViewProps {
  language: 'ar' | 'fr';
  settings: AppSettings;
  onLaunchStore: (storeName: string, category: string, city: string) => void;
  onBackToHome: () => void;
}

export default function CreateStoreView({
  language,
  settings,
  onLaunchStore,
  onBackToHome
}: CreateStoreViewProps) {
  const isRtl = language === 'ar';
  const [step, setStep] = useState<1 | 2>(1);
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState(settings.allowedCategories[0] || 'القفطان والجلابة المغربية');
  const [city, setCity] = useState(settings.moroccanCities[0] || 'الدار البيضاء');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    title: isRtl ? 'تأسيس متجرك المغربي الخاص' : 'Créer votre Boutique Marocaine',
    subtitle: isRtl 
      ? 'أطلق مشروعك الإلكتروني الخاص الآن برأس مال رمزي يبلغ 9 دراهم فقط!'
      : 'Lancez votre propre commerce en ligne avec un capital de 9 DH seulement !',
    stepInfo: isRtl ? '1. معلومات المتجر' : '1. Infos Boutique',
    stepPay: isRtl ? '2. تأكيد دفع الرسوم' : '2. Paiement des Frais',
    setupFeeNote: isRtl ? 'رسوم إنشاء المتجر لمرة واحدة: 9 دراهم' : 'Frais de création uniques : 9 DH',
    storeNameLabel: isRtl ? 'اسم المتجر الإلكتروني' : 'Nom de la Boutique',
    storeNamePlaceholder: isRtl ? 'مثال: جلابيات الأطلس، متجر مراكش...' : 'Ex: Caftan de l\'Atlas, Shop Marrakech...',
    categoryLabel: isRtl ? 'التصنيف الرئيسي للمنتجات' : 'Catégorie principale',
    cityLabel: isRtl ? 'المدينة (المقر الرئيسي للشحن)' : 'Ville d\'expédition',
    descLabel: isRtl ? 'نبذة قصيرة تظهر للزبائن' : 'Brève description pour les clients',
    descPlaceholder: isRtl ? 'اكتب بضعة كلمات تصف بها جودة منتجاتك وخدمة التوصيل...' : 'Décrivez brièvement la qualité de vos produits...',
    btnNext: isRtl ? 'الاستمرار للدفع (9 دراهم)' : 'Continuer au paiement (9 DH)',
    btnBack: isRtl ? 'الرجوع' : 'Retour',
    cancel: isRtl ? 'إلغاء والعودة للرئيسية' : 'Annuler et revenir à l\'accueil',
    payTitle: isRtl ? 'بوابة الدفع الآمنة - 9 دراهم فقط' : 'Paiement Sécurisé - 9 DH Unique',
    payDesc: isRtl 
      ? 'رسوم تأسيس المتجر تُدفع لمرة واحدة مدى الحياة لتغطية خوادم الاستضافة وبوابة الـ SMS التلقائية.'
      : 'Frais de création uniques payables à vie pour couvrir l\'hébergement et la passerelle SMS.',
    cardHolder: isRtl ? 'الاسم الكامل لحامل البطاقة' : 'Nom complet sur la carte',
    cardNumberLabel: isRtl ? 'رقم البطاقة البنكية المغربية أو الدولية' : 'Numéro de carte bancaire',
    cardExpiryLabel: isRtl ? 'تاريخ الصلاحية' : 'Date d\'expiration',
    cardCvvLabel: isRtl ? 'رمز الأمان (CVV)' : 'Code de sécurité (CVV)',
    btnPayNow: isRtl ? 'تأكيد عملية الدفع الفوري (9 DH)' : 'Valider le paiement de 9 DH',
    payingLoader: isRtl ? 'جاري معالجة المعاملة البنكية بأمان المغرب الرقمي...' : 'Traitement sécurisé par Maroc Numérique...',
    successTitle: isRtl ? 'مبروك! تم تأسيس متجرك بنجاح 🎉' : 'Félicitations ! Votre boutique est créée 🎉',
    successDesc: isRtl 
      ? 'تم تفعيل حسابك كبائع رسمي وتوجيهك تلقائياً إلى لوحة التحكم لإضافة أولى منتجاتك وتلقي الطلبات.'
      : 'Votre compte vendeur est activé. Vous allez être redirigé vers votre tableau de bord.',
    bankTransfer: isRtl ? 'تحويل بنكي / كاش بليس' : 'Virement / Cash Plus',
    creditCard: isRtl ? 'بطاقة بنكية مغربية (CMI / Visa)' : 'Carte bancaire (CMI / Visa / Mastercard)',
    commissionNotice: isRtl 
      ? `ملاحظة: المنصة لا تأخذ أي اشتراك شهري، نأخذ فقط عمولة رمزية تبلغ ${settings.commissionPercent}% على الطلبات المسلمة بنجاح.`
      : `Note : Aucun abonnement mensuel. Commission fixe de ${settings.commissionPercent}% uniquement sur les commandes livrées.`,
    secureSeal: isRtl ? 'بوابة مشفرة ومحمية بالكامل طبقاً لمعايير بنك المغرب' : 'Passerelle sécurisée conforme aux normes de Bank Al-Maghrib'
  };

  const handleNext = () => {
    if (!storeName.trim()) {
      setError(isRtl ? 'يرجى إدخال اسم المتجر أولاً' : 'Veuillez saisir un nom de boutique');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPaying(true);

    // Simulate payment transaction with bank gateway
    setTimeout(() => {
      setIsPaying(false);
      setIsSuccess(true);
      
      // Redirect or call handler after animation
      setTimeout(() => {
        onLaunchStore(storeName, category, city);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8" id="create-store-view-container">
      
      {/* Visual Success overlay */}
      {isSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 text-center space-y-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Check className="h-8 w-8 stroke-[3] animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.successTitle}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                {t.successDesc}
              </p>
            </div>
            <div className="pt-2">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        </div>
      )}

      {/* Main Form Block */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-lg overflow-hidden relative">
        {/* Branding Gold Accent top bar */}
        <div className="h-2 bg-gradient-to-r from-slate-900 via-amber-500 to-slate-900"></div>

        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Form Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-100 dark:border-gray-850 pb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <Store className="h-6 w-6 text-slate-900 dark:text-amber-500" />
                <span>{t.title}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {t.subtitle}
              </p>
            </div>
            
            {/* Step badges */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={`px-3 py-1.5 rounded-lg border transition-all ${
                step === 1 
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900' 
                  : 'bg-slate-50 dark:bg-slate-800 text-gray-400 border-transparent'
              }`}>
                {t.stepInfo}
              </span>
              <span className={`px-3 py-1.5 rounded-lg border transition-all ${
                step === 2 
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 animate-pulse' 
                  : 'bg-slate-50 dark:bg-slate-800 text-gray-400 border-transparent'
              }`}>
                {t.stepPay}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Store Information Details Form */
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Store Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-800 dark:text-gray-300 uppercase tracking-wider">
                    {t.storeNameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder={t.storeNamePlaceholder}
                    className="w-full px-4 py-3 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:text-white"
                    required
                  />
                </div>

                {/* Main Category */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-800 dark:text-gray-300 uppercase tracking-wider">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:text-white"
                  >
                    {settings.allowedCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* City of Origin */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-800 dark:text-gray-300 uppercase tracking-wider">
                    {t.cityLabel}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:text-white"
                  >
                    {settings.moroccanCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Startup cost notice badge */}
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{t.setupFeeNote}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.commissionNotice}</p>
                  </div>
                </div>

              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 dark:text-gray-300 uppercase tracking-wider">
                  {t.descLabel}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:text-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-850">
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-center"
                >
                  {t.cancel}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.btnNext}</span>
                  {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>

            </div>
          ) : (
            /* STEP 2: Payment checkout form (9 DH fee) */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <div className="p-5 bg-amber-500/5 dark:bg-amber-950/10 rounded-2xl border border-amber-500/10 space-y-2">
                  <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>{t.payTitle}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-gray-300 font-semibold leading-relaxed">
                    {t.payDesc}
                  </p>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border text-xs font-extrabold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-850 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-gray-400 bg-transparent hover:bg-slate-50'
                    }`}
                  >
                    <span>💳</span>
                    <span>{t.creditCard}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 rounded-xl border text-xs font-extrabold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'transfer'
                        ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-slate-850 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-gray-400 bg-transparent hover:bg-slate-50'
                    }`}
                  >
                    <span>🏦</span>
                    <span>{t.bankTransfer}</span>
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  /* Card details input fields */
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-gray-800 animate-fade-in">
                    
                    {/* Cardholder Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">
                        {t.cardHolder}
                      </label>
                      <input
                        type="text"
                        defaultValue="Karim Alami"
                        className="w-full px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-gray-750 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    {/* Card Number */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">
                        {t.cardNumberLabel}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-gray-750 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:text-white"
                          required
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                          <CreditCard className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiry */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-500 uppercase">
                          {t.cardExpiryLabel}
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-gray-750 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:text-white text-center"
                          required
                        />
                      </div>

                      {/* CVV */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-500 uppercase">
                          {t.cardCvvLabel}
                        </label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={3}
                          className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-gray-750 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:text-white text-center"
                          required
                        />
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Transfer details info */
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-gray-800 text-xs space-y-3 animate-fade-in font-semibold">
                    <p className="text-slate-700 dark:text-gray-300">
                      {isRtl 
                        ? 'يمكنك الدفع عبر إرسال حوالة بقيمة 9 دراهم إلى حساب المنصة المعتمد في CIH Bank أو عبر أي مكتب كاش بليس.'
                        : 'Veuillez effectuer un virement ou versement de 9 DH à notre compte CIH Bank officiel.'
                      }
                    </p>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-150 dark:border-gray-700 space-y-1 text-[11px] font-mono">
                      <p className="text-gray-400">RIB: <span className="text-slate-800 dark:text-white font-bold">230 145 09988231200019 45</span></p>
                      <p className="text-gray-400">Cash Plus: <span className="text-slate-800 dark:text-white font-bold">M-PLAY-MOROCCO</span></p>
                    </div>
                  </div>
                )}

                {/* Secure certificate Seal */}
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold justify-center pt-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>{t.secureSeal}</span>
                </div>
              </div>

              {/* Action buttons step 2 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-850">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-center"
                  disabled={isPaying}
                >
                  {t.btnBack}
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.payingLoader}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>{t.btnPayNow}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
}
