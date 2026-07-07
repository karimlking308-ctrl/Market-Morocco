import React, { useState, useMemo } from 'react';
import { DollarSign, ShoppingCart, Package, Users, Plus, Settings, Eye, Edit3, Trash2, Globe, Sparkles, Check, AlertTriangle, Send, X, Percent } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { Product, Store, Order, AppSettings } from '../types';
import { LocalDatabase } from '../db/localDb';
import SellerAnalyticsCharts from './SellerAnalyticsCharts';

interface SellerDashboardProps {
  language: 'ar' | 'fr';
  store: Store | undefined;
  products: Product[];
  orders: Order[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProductStatus: (productId: string, status: 'active' | 'rejected') => void;
  onUpdateOrderStatus: (orderId: string, status: any, note: string) => void;
  onUpdateStoreSettings: (updatedStore: Store) => void;
  onWithdrawFunds: (amount: number, details: string) => void;
  settings: AppSettings;
}

export default function SellerDashboard({
  language,
  store,
  products,
  orders,
  onAddProduct,
  onUpdateProductStatus,
  onUpdateOrderStatus,
  onUpdateStoreSettings,
  onWithdrawFunds,
  settings
}: SellerDashboardProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'add-product' | 'orders' | 'settings'>('analytics');

  // Add Product Form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodSalePrice, setProdSalePrice] = useState<number | undefined>(undefined);
  const [prodInventory, setProdInventory] = useState<number>(10);
  const [prodCategory, setProdCategory] = useState(settings.allowedCategories[0]);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImagesText, setProdImagesText] = useState('');
  const [prodVideo, setProdVideo] = useState('');
  const [prodWeight, setProdWeight] = useState<number | undefined>(undefined);
  const [prodColorsText, setProdColorsText] = useState('');
  const [prodSizesText, setProdSizesText] = useState('');
  const [prodTagsText, setProdTagsText] = useState('');
  const [prodDelivery, setProdDelivery] = useState('2-3 jours');
  const [prodShipping, setProdShipping] = useState('Livraison gratuite');

  // AI Description Generator state
  const [aiFeaturesText, setAiFeaturesText] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Add product submission status
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productModerationError, setProductModerationError] = useState('');
  const [productAddedSuccess, setProductAddedSuccess] = useState(false);

  // Withdraw Capital Dialog state
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState('');

  // Order status update state helper
  const [selectedOrderToEdit, setSelectedOrderToEdit] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<any>('confirmed');
  const [orderStatusNote, setOrderStatusNote] = useState('');

  // Store Settings update states
  const [editStoreName, setEditStoreName] = useState(store?.name || '');
  const [editStoreDesc, setEditStoreDesc] = useState(store?.description || '');
  const [editStoreCategory, setEditStoreCategory] = useState(store?.category || settings.allowedCategories[0]);
  const [editStoreCity, setEditStoreCity] = useState(store?.city || settings.moroccanCities[0]);
  const [editStoreLogo, setEditStoreLogo] = useState(store?.logo || '');
  const [editStoreCover, setEditStoreCover] = useState(store?.cover || '');
  const [storeSettingsSaved, setStoreSettingsSaved] = useState(false);

  // Compute Store Analytics
  const storeProducts = useMemo(() => {
    if (!store) return [];
    return products.filter(p => p.storeId === store.id);
  }, [products, store]);

  const storeOrders = useMemo(() => {
    if (!store) return [];
    return orders.filter(o => o.storeId === store.id);
  }, [orders, store]);

  const totalGrossSales = useMemo(() => {
    return storeOrders
      .filter(o => o.status === 'delivered')
      .reduce((acc, o) => acc + o.total, 0);
  }, [storeOrders]);

  const totalCommissionFee = useMemo(() => {
    return storeOrders
      .filter(o => o.status === 'delivered')
      .reduce((acc, o) => acc + o.commissionFee, 0);
  }, [storeOrders]);

  const totalStoreEarnings = useMemo(() => {
    // Sum total amount of delivered orders minus commission percentage
    return totalGrossSales - totalCommissionFee;
  }, [totalGrossSales, totalCommissionFee]);

  const totalClientsCount = useMemo(() => {
    const uniqueClients = new Set(storeOrders.map(o => o.buyerId));
    return uniqueClients.size;
  }, [storeOrders]);

  // AI copywriting generator via Express backend
  const handleAiWriteDescription = async () => {
    if (!prodName.trim()) {
      alert(language === 'ar' ? 'يرجى كتابة اسم المنتج أولاً!' : 'Veuillez saisir d’abord le nom du produit !');
      return;
    }
    setIsGeneratingDescription(true);
    setAiSuccessMsg('');
    try {
      const generated = await LocalDatabase.generateProductDescription(prodName, prodCategory, aiFeaturesText);
      setProdDescription(generated);
      setAiSuccessMsg(t.aiGenerateSuccess);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Safe compliance product submission with server moderation
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    if (!prodName || !prodPrice || !prodDescription || !prodImagesText) return;

    setIsSubmittingProduct(true);
    setProductModerationError('');
    setProductAddedSuccess(false);

    const imagesArray = prodImagesText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const colorsArray = prodColorsText.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const sizesArray = prodSizesText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const tagsArray = prodTagsText.split(',').map(t => t.trim()).filter(t => t.length > 0);

    try {
      // 1. Fire server-side Gemini Content Moderation!
      const moderation = await LocalDatabase.moderateProduct(prodName, prodDescription, prodCategory);
      
      const newProduct: Product = {
        id: `prod-${Math.floor(Math.random() * 900000) + 100000}`,
        storeId: store.id,
        storeName: store.name,
        images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&h=400&q=80'],
        videoUrl: prodVideo,
        name: prodName,
        description: prodDescription,
        price: Number(prodPrice),
        salePrice: prodSalePrice ? Number(prodSalePrice) : undefined,
        inventory: Number(prodInventory),
        category: prodCategory,
        tags: tagsArray,
        weight: prodWeight,
        colors: colorsArray,
        sizes: sizesArray,
        shippingInfo: prodShipping,
        deliveryDuration: prodDelivery,
        status: moderation.status === 'active' ? 'active' : 'rejected',
        moderationReason: moderation.status === 'rejected' ? moderation.reason : undefined,
        rating: 5.0,
        ratingCount: 0,
        createdAt: new Date().toISOString()
      };

      // Register product
      onAddProduct(newProduct);

      if (moderation.status === 'rejected') {
        // Trigger alert of rejection reason
        setProductModerationError(`${t.forbiddenProductAlert} "${moderation.reason}"`);
      } else {
        setProductAddedSuccess(true);
        // Clear fields
        setProdName('');
        setProdPrice(0);
        setProdSalePrice(undefined);
        setProdDescription('');
        setProdImagesText('');
        setProdColorsText('');
        setProdSizesText('');
        setProdTagsText('');
        setAiFeaturesText('');
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || withdrawAmount <= 0 || !withdrawDetails) return;
    
    onWithdrawFunds(withdrawAmount, withdrawDetails);
    setWithdrawSuccessMsg(t.withdrawSuccess);
    setWithdrawDetails('');
    setTimeout(() => {
      setShowWithdrawDialog(false);
      setWithdrawSuccessMsg('');
    }, 4000);
  };

  const handleUpdateOrderStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToEdit || !newOrderStatus) return;
    onUpdateOrderStatus(selectedOrderToEdit.id, newOrderStatus, orderStatusNote || 'تحديث حالة الشحنة من طرف البائع');
    setSelectedOrderToEdit(null);
    setOrderStatusNote('');
  };

  const handleStoreSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    const updated: Store = {
      ...store,
      name: editStoreName,
      description: editStoreDesc,
      category: editStoreCategory,
      city: editStoreCity,
      logo: editStoreLogo,
      cover: editStoreCover
    };
    onUpdateStoreSettings(updated);
    setStoreSettingsSaved(true);
    setTimeout(() => setStoreSettingsSaved(false), 3000);
  };

  if (!store) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 p-8 space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-800 dark:text-white">لم تقم بتأسيس متجر حتى الآن</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">للبدء في بيع منتجاتك وكسب المال، يرجى التوجه لإنشاء متجر جديد مقابل 9 دراهم مغربية فقط.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn" id="seller-dashboard-container">
      
      {/* Dashboard Top banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            🏢 {store.name} • {t.sellerDashboard}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'ar' ? 'مرحباً بك مجدداً. تتبع أرباحك، مبيعاتك وعملائك بشكل فوري.' : 'Gérez votre activité commerciale en temps réel.'}
          </p>
        </div>
        
        {/* Navigation Tab selection */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            📊 {language === 'ar' ? 'الإحصائيات والطلبيات' : 'Commandes'}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            📦 {language === 'ar' ? 'منتجاتي المعروضة' : 'Mes produits'}
          </button>
          <button
            onClick={() => setActiveTab('add-product')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 bg-morocco-green text-white hover:bg-morocco-green/95`}
          >
            <Plus className="h-4 w-4" />
            <span>{t.addProduct}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            ⚙️ {t.storeSettings}
          </button>
        </div>
      </div>

      {/* Main Tab Rendering */}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn" id="seller-analytics-tab">
          
          {/* Automatic Commission Deduction Info Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <Percent className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-right">
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                {language === 'ar' ? '💡 نظام الاقتطاع التلقائي لعمولة المنصة مفعل' : '💡 Système de déduction automatique de commission actif'}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'ar' 
                  ? `يقوم الموقع تلقائياً بخصم نسبة عمولة قدرها ${settings.commissionPercent}% من كل عملية بيع مستلمة. تظهر أرباحك الصافية هنا وجاهزة للسحب المباشر دون أي رسوم إضافية مخفية.`
                  : `Le site prélève automatiquement une commission de ${settings.commissionPercent}% sur chaque vente livrée. Vos revenus nets sont mis à jour ici et prêts à être retirés.`}
              </p>
            </div>
          </div>

          {/* Analytical summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Net Earnings */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {language === 'ar' ? 'الصافي القابل للسحب' : 'Revenus Nets'}
                </p>
                <h4 className="text-md sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{totalStoreEarnings} DH</h4>
              </div>
            </div>

            {/* Card 2: Gross Sales */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {language === 'ar' ? 'إجمالي المبيعات' : 'Ventes Brutes'}
                </p>
                <h4 className="text-md sm:text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{totalGrossSales} DH</h4>
              </div>
            </div>

            {/* Card 3: Auto-deducted Commission */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-morocco-red/10 text-morocco-red">
                <Percent className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {language === 'ar' ? `العمولة (${settings.commissionPercent}%)` : `Commission (${settings.commissionPercent}%)`}
                </p>
                <h4 className="text-md sm:text-lg font-black text-morocco-red mt-0.5">-{totalCommissionFee} DH</h4>
              </div>
            </div>

            {/* Card 4: Orders Count */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{t.ordersCount}</p>
                <h4 className="text-md sm:text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">{storeOrders.length}</h4>
              </div>
            </div>
          </div>

          {/* Withdraw Capital Button */}
          <div className="p-5 bg-gradient-to-r from-morocco-green/10 to-transparent border border-morocco-green/10 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{t.withdrawCapital}</h4>
              <p className="text-xs text-gray-400 mt-1">{t.availableBalance}: <span className="font-bold text-morocco-green font-mono">{totalStoreEarnings} DH</span></p>
            </div>
            <button
              onClick={() => setShowWithdrawDialog(true)}
              className="px-5 py-2.5 bg-morocco-green hover:bg-morocco-green/95 text-white rounded-xl text-xs font-black transition shadow"
            >
              💵 {t.withdrawCapital}
            </button>
          </div>

          {/* Recharts Analytics Visualization Section */}
          <SellerAnalyticsCharts
            language={language}
            orders={storeOrders}
            products={storeProducts}
            commissionPercent={settings.commissionPercent}
          />

          {/* Received Orders tracking */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 dark:bg-slate-850 border-b border-gray-100 dark:border-gray-800 font-extrabold text-slate-800 dark:text-white text-xs">
              {t.recentOrders}
            </div>
            
            {storeOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">لا توجد طلبيات مستلمة بعد. روج لمتجرك لتبدأ في جلب مبيعاتك الأولى!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-850 font-bold text-gray-400">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">{language === 'ar' ? 'الزبون' : 'Client'}</th>
                      <th className="p-3">{language === 'ar' ? 'المدينة' : 'Ville'}</th>
                      <th className="p-3">{language === 'ar' ? 'السلع' : 'Produits'}</th>
                      <th className="p-3">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                      <th className="p-3">{language === 'ar' ? 'العمولة المقتطعة' : 'Commission'}</th>
                      <th className="p-3">{language === 'ar' ? 'الربح الصافي' : 'Net Payout'}</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold text-slate-700 dark:text-gray-300">
                    {storeOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono font-bold text-morocco-red">{ord.id}</td>
                        <td className="p-3">{ord.buyerName} ({ord.buyerPhone})</td>
                        <td className="p-3">{ord.buyerCity.split(' ')[0]}</td>
                        <td className="p-3">
                          {ord.items.map((item, i) => (
                            <span key={i} className="block truncate max-w-[150px]">
                              {item.productName} (x{item.quantity})
                            </span>
                          ))}
                        </td>
                        <td className="p-3 font-bold">{ord.total} DH</td>
                        <td className="p-3 font-mono text-red-500 font-bold">-{ord.commissionFee} DH</td>
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-black">{ord.total - ord.commissionFee} DH</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === 'delivered' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                            ord.status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' :
                            ord.status === 'shipped' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' :
                            ord.status === 'cancelled' ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' :
                            'bg-gray-100 dark:bg-slate-800 text-gray-500'
                          }`}>
                            {ord.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedOrderToEdit(ord)}
                            className="text-xs text-morocco-red hover:underline"
                          >
                            ✏️ {language === 'ar' ? 'تحديث الحالة' : 'Statut'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Withdraw Dialog popup */}
          {showWithdrawDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{t.withdrawCapital}</h4>
                  <button onClick={() => setShowWithdrawDialog(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleWithdrawRequest} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{language === 'ar' ? 'المبلغ المراد سحبه (درهم)' : 'Montant à retirer (MAD)'}</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={totalStoreEarnings}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.bankDetails}</label>
                    <textarea
                      required
                      rows={3}
                      placeholder={language === 'ar' ? 'اكتب رقم حسابك البنكي المغربي RIB المكون من 24 رقماً أو الاسم الكامل لتحويل الأموال عبر كاش بليس...' : 'Entrez votre RIB bancaire à 24 chiffres ou les détails Cash Plus...'}
                      value={withdrawDetails}
                      onChange={(e) => setWithdrawDetails(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs leading-relaxed"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-morocco-green hover:bg-morocco-green/95 text-white rounded-xl text-xs font-black transition shadow"
                  >
                    🚀 {language === 'ar' ? 'تأكيد تقديم طلب السحب' : 'Valider la demande'}
                  </button>
                </form>
                {withdrawSuccessMsg && (
                  <p className="text-[10px] text-morocco-green font-bold text-center mt-2 p-2 bg-morocco-green/10 rounded">
                    {withdrawSuccessMsg}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order State Editor Dialog popup */}
          {selectedOrderToEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                    {language === 'ar' ? 'تعديل حالة طلبية' : 'Modifier le statut'} #{selectedOrderToEdit.id}
                  </h4>
                  <button onClick={() => setSelectedOrderToEdit(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleUpdateOrderStatusSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{language === 'ar' ? 'اختر الحالة الجديدة الشحن' : 'Nouveau statut :'}</label>
                    <select
                      value={newOrderStatus}
                      onChange={(e) => setNewOrderStatus(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                    >
                      <option value="confirmed">{t.orderConfirmed}</option>
                      <option value="shipped">{t.orderShipped}</option>
                      <option value="delivered">{t.orderDelivered}</option>
                      <option value="cancelled">{t.orderCancelled}</option>
                      <option value="refunded">{t.orderRefunded}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{language === 'ar' ? 'ملاحظة أو تعليق للتتبع (للزبون)' : 'Note de suivi (visible par le client)'}</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: تم تجهيز طلبكم وتسليمه لشركة التوصيل أمانة ليتوجه لمدينتكم"
                      value={orderStatusNote}
                      onChange={(e) => setOrderStatusNote(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-950/30 text-[10px] leading-relaxed flex items-start gap-2">
                    <span className="text-sm">💬</span>
                    <div className="text-right flex-1">
                      <p className="font-extrabold">{language === 'ar' ? 'تنبيه الرسائل النصية القصيرة (SMS) نشط' : 'Notification SMS Active'}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {language === 'ar' 
                          ? 'سيتم إرسال رسالة SMS تلقائية على الرقم المغربي للزبون لإعلامه بتغيير الحالة بشكل فوري.' 
                          : 'Un SMS de suivi sera envoyé automatiquement au numéro marocain du client.'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-morocco-red hover:bg-morocco-red/95 text-white rounded-xl text-xs font-black transition shadow"
                  >
                    💾 {language === 'ar' ? 'حفظ حالة التتبع الجديدة' : 'Mettre à jour'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Listed products tab */}
      {activeTab === 'products' && (
        <div className="space-y-4 animate-fadeIn" id="seller-products-tab">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{language === 'ar' ? 'السلع التي قمت بعرضها' : 'Mes articles répertoriés'} ({storeProducts.length})</h3>
            <button
              onClick={() => setActiveTab('add-product')}
              className="px-3.5 py-1.5 bg-morocco-red hover:bg-morocco-red/95 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>{t.addProduct}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 flex gap-4 items-center shadow-sm"
              >
                <img src={p.images[0]} alt={p.name} className="w-14 h-16 rounded-lg object-cover border border-gray-100" />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{p.name}</h4>
                  <p className="text-xs font-black text-morocco-red">{p.price} DH</p>
                  
                  {/* Compliance Verification status bar */}
                  <div className="flex items-center gap-1.5">
                    {p.status === 'active' ? (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                        🟢 {t.statusActive}
                      </span>
                    ) : p.status === 'pending_moderation' ? (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                        ⏳ قيد المراجعة الآلية
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[10px] bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                          ❌ {language === 'ar' ? 'مرفوض من طرف الذكاء الاصطناعي' : 'Refusé par l’IA'}
                        </span>
                        {p.moderationReason && (
                          <p className="text-[9px] text-red-500 font-bold leading-normal">
                            🚨 {p.moderationReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add product form tab with AI generator */}
      {activeTab === 'add-product' && (
        <form onSubmit={handleProductSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-6 shadow-sm animate-fadeIn" id="add-product-tab">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2">
            ✨ {language === 'ar' ? 'تفاصيل السلعة الجديدة والمراجعة الآلية' : 'Ajouter un article et révision IA'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.productName}</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قفطان مغربي حر بلون خمري"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-morocco-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.productPrice}</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.productSalePrice}</label>
                  <input
                    type="number"
                    value={prodSalePrice || ''}
                    onChange={(e) => setProdSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.productInventory}</label>
                  <input
                    type="number"
                    required
                    value={prodInventory}
                    onChange={(e) => setProdInventory(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.storeCategory}</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                  >
                    {settings.allowedCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.productImages}</label>
                <textarea
                  required
                  rows={3}
                  placeholder="https://images.unsplash.com/...&#10;رابط آخر في سطر جديد"
                  value={prodImagesText}
                  onChange={(e) => setProdImagesText(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* AI description copywriter & detailed specifications */}
            <div className="space-y-4">
              
              {/* Gemini AI Writer tool built right in */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-morocco-red/5 to-morocco-green/5 border border-morocco-red/10 space-y-3">
                <span className="text-[10px] font-bold text-slate-800 dark:text-white flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-morocco-red" />
                  {t.aiGenerateDescription}
                </span>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'اكتب ميزات المنتج (مثال: حرير خالص، تطريز يدوي، مقاس واسع...)' : 'Entrez les caractéristiques clés...'}
                  value={aiFeaturesText}
                  onChange={(e) => setAiFeaturesText(e.target.value)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAiWriteDescription}
                  disabled={isGeneratingDescription}
                  className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>{isGeneratingDescription ? t.aiGenerating : t.aiGenerateDescription}</span>
                </button>
                {aiSuccessMsg && <p className="text-[10px] text-morocco-green font-bold">{aiSuccessMsg}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.productDescription}</label>
                <textarea
                  required
                  rows={4}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.productColors}</label>
                  <input
                    type="text"
                    placeholder="Red, Blue, Green"
                    value={prodColorsText}
                    onChange={(e) => setProdColorsText(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.productSizes}</label>
                  <input
                    type="text"
                    placeholder="M, L, XL"
                    value={prodSizesText}
                    onChange={(e) => setProdSizesText(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-850 space-y-3">
            <button
              type="submit"
              disabled={isSubmittingProduct}
              className="w-full py-4 bg-morocco-red hover:bg-morocco-red/95 text-white font-black text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
              id="publish-product-btn"
            >
              {isSubmittingProduct ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                  <span>جاري مراجعة ومطابقة المنتج بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{t.submitProduct}</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 font-bold text-center">{t.productModerationNote}</p>
          </div>

          {productModerationError && (
            <div className="p-4 bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-xs space-y-1">
              <p>{productModerationError}</p>
              <p className="text-[10px] font-medium text-red-500">تم حظر السلعة حمايةً لأمان المشترين وسنلغي حساب المتجر عند محاولة نشر مواد ممنوعة تكراراً.</p>
            </div>
          )}

          {productAddedSuccess && (
            <div className="p-4 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl font-bold text-xs text-center animate-bounce">
              🎉 تم إرسال وفحص وتفعيل المنتج بنجاح في متجرك!
            </div>
          )}
        </form>
      )}

      {/* Edit store settings tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleStoreSettingsSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-6 shadow-sm animate-fadeIn" id="store-settings-tab">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-gray-850 pb-2">
            ⚙️ {t.storeSettings}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.storeName}</label>
                <input
                  type="text"
                  required
                  value={editStoreName}
                  onChange={(e) => setEditStoreName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.storeDescription}</label>
                <textarea
                  required
                  rows={4}
                  value={editStoreDesc}
                  onChange={(e) => setEditStoreDesc(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.storeCategory}</label>
                  <select
                    value={editStoreCategory}
                    onChange={(e) => setEditStoreCategory(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                  >
                    {settings.allowedCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.storeCity}</label>
                  <select
                    value={editStoreCity}
                    onChange={(e) => setEditStoreCity(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
                  >
                    {settings.moroccanCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.storeLogo}</label>
                <input
                  type="text"
                  required
                  value={editStoreLogo}
                  onChange={(e) => setEditStoreLogo(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.storeCover}</label>
                <input
                  type="text"
                  required
                  value={editStoreCover}
                  onChange={(e) => setEditStoreCover(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-morocco-red hover:bg-morocco-red/95 text-white font-black text-xs rounded-xl transition shadow"
            id="save-store-settings-btn"
          >
            💾 {t.saveSettings}
          </button>

          {storeSettingsSaved && (
            <p className="text-xs text-center text-morocco-green font-bold p-2 bg-morocco-green/10 rounded animate-bounce">
              🎉 تم تحديث وحفظ بيانات ومعلومات متجرك بنجاح!
            </p>
          )}
        </form>
      )}

    </div>
  );
}
