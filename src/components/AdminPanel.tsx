import React, { useState, useMemo } from 'react';
import { Settings, Users, Store, Package, ShoppingCart, MessageSquare, Plus, Check, Trash2, ShieldAlert, Award, DollarSign } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { UserProfile, Store as StoreType, Product, Order, Complaint, Coupon, Ad, AppSettings } from '../types';

interface AdminPanelProps {
  language: 'ar' | 'fr';
  users: UserProfile[];
  stores: StoreType[];
  products: Product[];
  orders: Order[];
  complaints: Complaint[];
  coupons: Coupon[];
  ads: Ad[];
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateUserRole: (userId: string, role: any) => void;
  onUpdateStoreStatus: (storeId: string, status: any) => void;
  onDeleteStore: (storeId: string) => void;
  onUpdateProductStatus: (productId: string, status: any) => void;
  onResolveComplaint: (complaintId: string, reply: string) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onAddAd: (ad: Ad) => void;
}

export default function AdminPanel({
  language,
  users,
  stores,
  products,
  orders,
  complaints,
  coupons,
  ads,
  settings,
  onUpdateSettings,
  onUpdateUserRole,
  onUpdateStoreStatus,
  onDeleteStore,
  onUpdateProductStatus,
  onResolveComplaint,
  onAddCoupon,
  onAddAd
}: AdminPanelProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'users' | 'stores' | 'products' | 'complaints' | 'coupons' | 'ads'>('settings');

  // Local settings update form
  const [commRate, setCommRate] = useState(settings.commissionPercent);
  const [setupFee, setSetupFee] = useState(settings.setupFeeMAD);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Local add coupon form
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percent' | 'fixed'>('percent');
  const [couponValue, setCouponValue] = useState(10);
  const [couponExpiry, setCouponExpiry] = useState('2026-12-31');

  // Local add Ad form
  const [adTitle, setAdTitle] = useState('');
  const [adImage, setAdImage] = useState('');
  const [adLink, setAdLink] = useState('');
  const [adLocation, setAdLocation] = useState<'home_banner' | 'sidebar' | 'product_page'>('home_banner');

  // Complaint reply state helper
  const [replyText, setReplyText] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Platform profits calculation
  const platformEarningsFromStores = useMemo(() => {
    // 9 MAD setup fee per store
    return stores.length * settings.setupFeeMAD;
  }, [stores, settings]);

  const platformEarningsFromCommissions = useMemo(() => {
    // Sum total commission fees from delivered orders
    return orders
      .filter(o => o.status === 'delivered')
      .reduce((acc, o) => acc + o.commissionFee, 0);
  }, [orders]);

  const totalPlatformEarnings = platformEarningsFromStores + platformEarningsFromCommissions;

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      commissionPercent: Number(commRate),
      setupFeeMAD: Number(setupFee)
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    const newC: Coupon = {
      id: `coupon-${Math.floor(Math.random() * 9000) + 1000}`,
      code: couponCode.toUpperCase(),
      discountType: couponType,
      discountValue: Number(couponValue),
      expirationDate: couponExpiry,
      maxUses: 100,
      usedCount: 0,
      status: 'active'
    };
    onAddCoupon(newC);
    setCouponCode('');
  };

  const handleAddAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adImage || !adLink) return;
    const newA: Ad = {
      id: `ad-${Math.floor(Math.random() * 9000) + 1000}`,
      title: adTitle,
      image: adImage,
      link: adLink,
      location: adLocation,
      status: 'active',
      views: 0,
      clicks: 0,
      provider: 'custom'
    };
    onAddAd(newA);
    setAdTitle('');
    setAdImage('');
    setAdLink('');
  };

  const handleResolveComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId || !replyText.trim()) return;
    onResolveComplaint(selectedComplaintId, replyText);
    setSelectedComplaintId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-panel-container">
      
      {/* Platform Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            🛡️ {t.adminTitle}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'ar' ? 'لوحة تحكم المشرف العام لمطابقة المتاجر، مراجعة النزاعات والأرباح الكلية.' : 'Panneau d’administration général.'}
          </p>
        </div>

        {/* Global Platform profits box */}
        <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
          <DollarSign className="h-6 w-6 animate-pulse" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider">{t.totalPlatformProfit}</p>
            <h4 className="text-md sm:text-lg font-black font-mono">{totalPlatformEarnings.toFixed(2)} DH</h4>
          </div>
        </div>
      </div>

      {/* Admin Tab Nav controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-850">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeSubTab === 'settings' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300'
          }`}
        >
          ⚙️ {language === 'ar' ? 'إعدادات المنصة والعمولات' : 'Frais & Commissions'}
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeSubTab === 'users' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300'
          }`}
        >
          👥 {t.manageUsers} ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('stores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeSubTab === 'stores' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300'
          }`}
        >
          🏢 {t.manageStores} ({stores.length})
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeSubTab === 'products' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300'
          }`}
        >
          📦 {t.manageProducts} ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('complaints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeSubTab === 'complaints' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300'
          }`}
        >
          🔔 {t.manageComplaints} ({complaints.length})
        </button>
        <button
          onClick={() => setActiveSubTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeSubTab === 'coupons' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300'
          }`}
        >
          🎟️ {t.manageCoupons} ({coupons.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeSubTab === 'ads' ? 'bg-morocco-red text-white' : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300'
          }`}
        >
          📺 {t.manageAds} ({ads.length})
        </button>
      </div>

      {/* Settings Subtab */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSettingsSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-6 shadow-sm animate-fadeIn" id="admin-settings-tab">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{language === 'ar' ? 'تعديل المعايير المالية العامة' : 'Modifier les paramètres financiers'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.commissionRate}</label>
              <input
                type="number"
                required
                min={0}
                max={50}
                value={commRate}
                onChange={(e) => setCommRate(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
              />
              <p className="text-[10px] text-gray-400 mt-1">يقتطع هذا الخيار كعمولة تلقائية من مبيعات التجار لصالح أرباح المنصة.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{t.setupFeeMADLabel}</label>
              <input
                type="number"
                required
                min={0}
                value={setupFee}
                onChange={(e) => setSetupFee(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded-xl text-xs font-bold"
              />
              <p className="text-[10px] text-gray-400 mt-1">الرسوم المطلوبة من البائع لتفعيل المتجر الجديد لمرة واحدة.</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-morocco-red hover:bg-morocco-red/95 text-white font-black text-xs rounded-xl transition shadow"
          >
            💾 {t.saveSettings}
          </button>
          {settingsSaved && (
            <p className="text-xs text-center text-morocco-green font-bold bg-morocco-green/10 p-2 rounded">
              ✅ تم حفظ التغييرات والعمولات المالية وتعميمها بنجاح!
            </p>
          )}
        </form>
      )}

      {/* Users Subtab */}
      {activeSubTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm animate-fadeIn" id="admin-users-tab">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-850 font-bold text-gray-400">
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold text-slate-700 dark:text-gray-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 flex items-center gap-2">
                      <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3 font-mono">{u.email}</td>
                    <td className="p-3 font-bold text-morocco-red uppercase">{u.role}</td>
                    <td className="p-3">{u.phone || 'N/A'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onUpdateUserRole(u.id, u.role === 'admin' ? 'buyer' : 'admin')}
                        className="text-[10px] text-morocco-green bg-morocco-green/10 px-2 py-1 rounded hover:underline"
                      >
                        🔑 Promouvoir Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stores Subtab */}
      {activeSubTab === 'stores' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm animate-fadeIn" id="admin-stores-tab">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-850 font-bold text-gray-400">
                  <th className="p-3">Store</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold text-slate-700 dark:text-gray-300">
                {stores.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 flex items-center gap-2">
                      <img src={st.logo} alt="" className="w-7 h-7 rounded object-cover" />
                      <span className="font-bold">{st.name}</span>
                    </td>
                    <td className="p-3">{st.city}</td>
                    <td className="p-3 text-gray-400">{st.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        st.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {st.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 space-x-2 flex gap-2">
                      {st.status === 'active' ? (
                        <button
                          onClick={() => onUpdateStoreStatus(st.id, 'suspended')}
                          className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded"
                        >
                          {t.actionSuspend}
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStoreStatus(st.id, 'active')}
                          className="text-[9px] bg-morocco-green text-white px-2 py-0.5 rounded"
                        >
                          {t.actionApprove}
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteStore(st.id)}
                        className="text-[9px] text-gray-400 hover:text-red-500"
                      >
                        {t.actionDelete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products compliance subtab */}
      {activeSubTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm animate-fadeIn" id="admin-products-tab">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-850 font-bold text-gray-400">
                  <th className="p-3">Product</th>
                  <th className="p-3">Store</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Compliance Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-semibold text-slate-700 dark:text-gray-300">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 flex items-center gap-2">
                      <img src={p.images[0]} alt="" className="w-7 h-9 rounded object-cover" />
                      <span className="truncate max-w-[200px]">{p.name}</span>
                    </td>
                    <td className="p-3 font-bold text-morocco-red">{p.storeName}</td>
                    <td className="p-3 font-bold">{p.price} DH</td>
                    <td className="p-3">
                      {p.status === 'active' ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">🟢 Approved</span>
                      ) : (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded">🚨 Blocked (IA)</span>
                      )}
                    </td>
                    <td className="p-3 flex gap-2">
                      {p.status === 'active' ? (
                        <button
                          onClick={() => onUpdateProductStatus(p.id, 'rejected')}
                          className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded"
                        >
                          حظر (Block)
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateProductStatus(p.id, 'active')}
                          className="text-[9px] bg-morocco-green text-white px-2 py-0.5 rounded"
                        >
                          تفعيل (Allow)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Complaints support subtab */}
      {activeSubTab === 'complaints' && (
        <div className="space-y-4 animate-fadeIn" id="admin-complaints-tab">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{t.manageComplaints}</h3>
          
          {complaints.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">لا توجد شكاوى أو تبليغات واردة حالياً. المنصة آمنة وسليمة!</p>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div key={c.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-xs font-bold text-slate-850 dark:text-white">من: {c.userName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">الموضوع: {c.subject}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.message}</p>
                  
                  {c.reply && (
                    <div className="p-3 bg-gray-50 dark:bg-slate-850 rounded text-xs">
                      <span className="font-bold text-morocco-red block">رد الإدارة:</span>
                      <p className="text-slate-600 dark:text-gray-300 mt-1">{c.reply}</p>
                    </div>
                  )}

                  {c.status === 'pending' && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!replyText.trim()) return;
                        onResolveComplaint(c.id, replyText);
                        setReplyText('');
                      }}
                      className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800"
                    >
                      <input
                        type="text"
                        required
                        placeholder="اكتب رد المشرف هنا لإرساله للزبون..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 p-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 rounded text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-morocco-green text-white text-xs font-bold rounded"
                      >
                        {t.actionReply}
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coupons tab */}
      {activeSubTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn" id="admin-coupons-tab">
          {/* Coupon creator form */}
          <form onSubmit={handleAddCouponSubmit} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{t.addCoupon}</h4>
            
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">{t.couponCode}</label>
              <input
                type="text"
                required
                placeholder="Ex: SPECIAL20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded text-xs font-bold uppercase"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Type</label>
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 rounded text-xs"
                >
                  <option value="percent">Percentage %</option>
                  <option value="fixed">Fixed MAD</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Value</label>
                <input
                  type="number"
                  required
                  value={couponValue}
                  onChange={(e) => setCouponValue(Number(e.target.value))}
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 rounded text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-morocco-red hover:bg-morocco-red/90 text-white rounded text-xs font-bold"
            >
              Add Coupon
            </button>
          </form>

          {/* Active list */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Active Promo Codes</h4>
            <div className="space-y-2">
              {coupons.map((cp) => (
                <div key={cp.id} className="p-3 bg-gray-50 dark:bg-slate-850 rounded flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-black text-morocco-red text-sm">{cp.code}</span>
                    <p className="text-gray-400 text-[10px] mt-0.5">Discount: {cp.discountValue} {cp.discountType === 'percent' ? '%' : 'DH'}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">Used: {cp.usedCount} / {cp.maxUses}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ads manager subtab */}
      {activeSubTab === 'ads' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn" id="admin-ads-tab">
          {/* Ad creator form */}
          <form onSubmit={handleAddAdSubmit} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{t.addAd}</h4>
            
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">{t.adTitle}</label>
              <input
                type="text"
                required
                placeholder="تخفيضات أركان طبيعي"
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">{t.adImage}</label>
              <input
                type="text"
                required
                placeholder="https://..."
                value={adImage}
                onChange={(e) => setAdImage(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 rounded text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">{t.adLink}</label>
              <input
                type="text"
                required
                placeholder="/store/caftan-tazi"
                value={adLink}
                onChange={(e) => setAdLink(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 dark:bg-slate-800 rounded text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-morocco-green hover:bg-morocco-green/90 text-white rounded text-xs font-bold"
            >
              Publish Advertisement Area
            </button>
          </form>

          {/* List of Ads and Stats */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Advertisement spaces performance</h4>
            <div className="space-y-3">
              {ads.map((ad) => (
                <div key={ad.id} className="p-3 bg-gray-50 dark:bg-slate-850 rounded flex gap-4 items-center text-xs">
                  <img src={ad.image} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block truncate">{ad.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{ad.link}</span>
                  </div>
                  <div className="text-right text-[10px] font-bold text-gray-400 space-y-1">
                    <p>Views: {ad.views}</p>
                    <p>Clicks: {ad.clicks}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] bg-blue-50 dark:bg-blue-950/20 text-blue-500 p-3 rounded-lg border border-blue-200/50">
              ℹ️ {t.adGoogleNote}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
