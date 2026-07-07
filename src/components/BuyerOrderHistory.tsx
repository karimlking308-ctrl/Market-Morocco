import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  Check, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  XCircle, 
  RotateCcw, 
  Calendar, 
  MapPin, 
  Phone, 
  ChevronRight, 
  ChevronLeft,
  Search,
  AlertCircle
} from 'lucide-react';
import { Order, TrackingStep } from '../types';

interface BuyerOrderHistoryProps {
  language: 'ar' | 'fr';
  orders: Order[];
  onOpenChat: (storeId: string) => void;
}

export default function BuyerOrderHistory({
  language,
  orders,
  onOpenChat
}: BuyerOrderHistoryProps) {
  const isRtl = language === 'ar';
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Local translations for high fidelity
  const t = {
    title: isRtl ? 'سجل طلباتي وتتبع الشحنات' : 'Mes Commandes & Suivi',
    subtitle: isRtl 
      ? 'تابع حالة طلباتك مباشرة من المتاجر المغربية خطوة بخطوة' 
      : 'Suivez l\'état de vos commandes auprès des boutiques marocaines étape par étape',
    emptyState: isRtl ? 'لا توجد أي طلبات حالياً' : 'Aucune commande pour le moment',
    emptyStateSub: isRtl 
      ? 'لم تقم بتقديم أي طلب بعد. تصفح المنتجات وأضفها إلى السلة!' 
      : 'Vous n\'avez pas encore passé de commande. Parcourez nos produits et commencez vos achats !',
    orderNumber: isRtl ? 'رقم الطلب' : 'Commande N°',
    store: isRtl ? 'المتجر' : 'Boutique',
    date: isRtl ? 'تاريخ الطلب' : 'Date',
    total: isRtl ? 'المجموع الإجمالي' : 'Total global',
    status: isRtl ? 'الحالة الحالية' : 'Statut actuel',
    viewDetails: isRtl ? 'تتبع وتفاصيل الطلب' : 'Suivi & Détails',
    backToList: isRtl ? 'العودة لجميع الطلبات' : 'Retour aux commandes',
    orderSummary: isRtl ? 'خلاصة الطلب' : 'Résumé de la commande',
    deliveryAddress: isRtl ? 'عنوان التوصيل' : 'Adresse de livraison',
    paymentMethod: isRtl ? 'طريقة الدفع' : 'Mode de paiement',
    cod: isRtl ? 'الدفع عند الاستلام (COD)' : 'Paiement à la livraison (COD)',
    card: isRtl ? 'الدفع بالبطاقة البنكية' : 'Paiement par Carte',
    itemsCount: isRtl ? 'المنتجات' : 'Articles',
    subtotal: isRtl ? 'المجموع الفرعي' : 'Sous-total',
    shipping: isRtl ? 'الشحن والتوصيل' : 'Frais de livraison',
    discount: isRtl ? 'خصم الكوبون' : 'Remise Coupon',
    grandTotal: isRtl ? 'المجموع النهائي' : 'Total à payer',
    contactStore: isRtl ? 'اتصل بصاحب المتجر' : 'Contacter le vendeur',
    timelineTitle: isRtl ? 'مسار تتبع الشحنة المباشر' : 'Historique de suivi en direct',
    timelineSubtitle: isRtl 
      ? 'تحديثات الحالة الفورية لطلبك المرسلة عبر بوابة الـ SMS' 
      : 'Mises à jour instantanées de votre commande envoyées par passerelle SMS',
    searchPlaceholder: isRtl ? 'البحث برقم الطلب أو اسم المتجر...' : 'Rechercher par N° de commande ou boutique...',
    
    // Status definitions
    pending: isRtl ? 'قيد الانتظار' : 'En attente',
    confirmed: isRtl ? 'تم التأكيد' : 'Confirmé',
    shipped: isRtl ? 'تم الشحن' : 'Expédié',
    delivered: isRtl ? 'تم التوصيل' : 'Livré',
    cancelled: isRtl ? 'ملغي' : 'Annulé',
    refunded: isRtl ? 'مسترجع' : 'Remboursé',

    // Progress step labels
    stepPending: isRtl ? 'طلب مستلم' : 'Reçu',
    stepConfirmed: isRtl ? 'تأكيد الطلب' : 'Confirmé',
    stepShipped: isRtl ? 'قيد الشحن' : 'En transit',
    stepDelivered: isRtl ? 'تم التوصيل' : 'Livré',

    // Progress descriptions
    descPending: isRtl ? 'تم استلام طلبك بنجاح وهو قيد المراجعة' : 'Commande reçue et en attente de validation',
    descConfirmed: isRtl ? 'تم تأكيد طلبك وتحضيره للشحن' : 'Votre commande est confirmée et en préparation',
    descShipped: isRtl ? 'الطلب مع شركة التوصيل في الطريق إليك' : 'Colis expédié et pris en charge par le transporteur',
    descDelivered: isRtl ? 'تم تسليم الشحنة بنجاح، شكرا لثقتكم' : 'Colis livré avec succès à votre adresse'
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return o.id.toLowerCase().includes(query) || o.storeName.toLowerCase().includes(query);
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Help calculate the visual state of the tracking steps
  const getStepStatus = (orderStatus: string, stepIndex: number) => {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIdx = statuses.indexOf(orderStatus);
    
    // If cancelled or refunded, standard steps are affected
    if (orderStatus === 'cancelled' || orderStatus === 'refunded') {
      return 'disabled';
    }

    if (currentIdx >= stepIndex) {
      return 'completed';
    } else if (currentIdx + 1 === stepIndex) {
      return 'active';
    }
    return 'upcoming';
  };

  // Extract the time for a specific status step from the history
  const getStepTime = (order: Order, stepStatusKey: string) => {
    const step = order.trackingHistory.find(h => h.status === stepStatusKey);
    if (!step) return null;
    const date = new Date(step.timestamp);
    return date.toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6" id="buyer-orders-history-container">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="h-6 w-6 text-morocco-red" />
            <span>{t.title}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>
        
        {!selectedOrderId && (
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-morocco-red focus:border-transparent"
              id="buyer-order-search"
            />
            <div className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-gray-400`}>
              <Search className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Main Area */}
      {!selectedOrderId ? (
        // List View
        filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Package className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t.emptyState}</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">{t.emptyStateSub}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => {
              const currentStepIdx = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status);
              
              return (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all p-5 flex flex-col gap-5"
                >
                  {/* Row 1: Order Metadata & Badge */}
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          #{order.id}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t.store}: <span className="font-extrabold text-slate-800 dark:text-slate-200">{order.storeName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Price tag */}
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-semibold">{t.total}</p>
                        <p className="text-xs font-black text-morocco-green dark:text-emerald-400">{order.total} DH</p>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                        order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400' :
                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                        order.status === 'refunded' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {order.status === 'pending' && t.pending}
                        {order.status === 'confirmed' && t.confirmed}
                        {order.status === 'shipped' && t.shipped}
                        {order.status === 'delivered' && t.delivered}
                        {order.status === 'cancelled' && t.cancelled}
                        {order.status === 'refunded' && t.refunded}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Micro Step-by-Step Mini Progress Bar */}
                  {order.status !== 'cancelled' && order.status !== 'refunded' ? (
                    <div className="py-2">
                      <div className="relative flex items-center justify-between w-full max-w-lg mx-auto">
                        
                        {/* Connecting track line background */}
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-100 dark:bg-slate-800 rounded-full z-0"></div>
                        
                        {/* Connecting active filled line */}
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full z-0 transition-all duration-500"
                          style={{
                            width: `${currentStepIdx === 0 ? '0%' : currentStepIdx === 1 ? '33.33%' : currentStepIdx === 2 ? '66.66%' : '100%'}`,
                            right: isRtl ? 'auto' : undefined,
                            left: isRtl ? 'auto' : undefined,
                          }}
                        ></div>

                        {/* Step 1: Pending */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                            currentStepIdx >= 0 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                              : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'
                          }`}>
                            {currentStepIdx > 0 ? <Check className="h-3 w-3 stroke-[3]" /> : <Clock className="h-3.5 w-3.5" />}
                          </div>
                          <span className="text-[9px] font-black mt-1 text-slate-700 dark:text-slate-300">{t.stepPending}</span>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                            currentStepIdx >= 1 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                              : currentStepIdx === 0 
                                ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 animate-pulse'
                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'
                          }`}>
                            {currentStepIdx > 1 ? <Check className="h-3 w-3 stroke-[3]" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          <span className="text-[9px] font-black mt-1 text-slate-700 dark:text-slate-300">{t.stepConfirmed}</span>
                        </div>

                        {/* Step 3: Shipped */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                            currentStepIdx >= 2 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                              : currentStepIdx === 1 
                                ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 animate-pulse'
                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'
                          }`}>
                            {currentStepIdx > 2 ? <Check className="h-3 w-3 stroke-[3]" /> : <Truck className="h-3.5 w-3.5" />}
                          </div>
                          <span className="text-[9px] font-black mt-1 text-slate-700 dark:text-slate-300">{t.stepShipped}</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                            currentStepIdx >= 3 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                              : currentStepIdx === 2 
                                ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 animate-pulse'
                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'
                          }`}>
                            <Package className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-[9px] font-black mt-1 text-slate-700 dark:text-slate-300">{t.stepDelivered}</span>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 font-bold justify-center border border-red-100 dark:border-red-900/30">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        {order.status === 'cancelled' 
                          ? (language === 'ar' ? 'تم إلغاء هذا الطلب من قبل صاحب المتجر أو بطلب منكم.' : 'Cette commande a été annulée.')
                          : (language === 'ar' ? 'تم استرجاع ثمن هذا الطلب بالكامل.' : 'Cette commande a été remboursée.')
                        }
                      </span>
                    </div>
                  )}

                  {/* Row 3: Items teaser & Action Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-gray-100 dark:border-slate-800 pt-4 mt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img 
                            key={idx} 
                            src={item.image} 
                            alt={item.productName} 
                            className="w-8 h-8 rounded-lg object-cover border-2 border-white dark:border-slate-900 shadow-xs"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        {order.items.length} {t.itemsCount} (
                        {order.items.map(i => i.productName).join(', ').substring(0, 35)}
                        {order.items.map(i => i.productName).join(', ').length > 35 ? '...' : ''}
                        )
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.viewDetails}</span>
                      {isRtl ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )
      ) : (
        // Detailed Order View with full visual step-by-step progress tracking
        selectedOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="buyer-order-details-view">
            
            {/* Left/Middle Column (2/3 width on desktop): Visual Progress Stepper & Timeline details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Step-by-Step Live Tracking Progress Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md p-6 sm:p-8 space-y-8 relative overflow-hidden">
                
                {/* Visual decoration top background */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-morocco-red via-amber-500 to-morocco-green"></div>

                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1">
                    <button 
                      onClick={() => setSelectedOrderId(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      <span>{t.backToList}</span>
                    </button>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
                      {t.orderNumber} <span className="text-morocco-red">#{selectedOrder.id}</span>
                    </h3>
                  </div>

                  <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide ${
                    selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                    selectedOrder.status === 'confirmed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400' :
                    selectedOrder.status === 'cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                    selectedOrder.status === 'refunded' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {selectedOrder.status === 'pending' && t.pending}
                    {selectedOrder.status === 'confirmed' && t.confirmed}
                    {selectedOrder.status === 'shipped' && t.shipped}
                    {selectedOrder.status === 'delivered' && t.delivered}
                    {selectedOrder.status === 'cancelled' && t.cancelled}
                    {selectedOrder.status === 'refunded' && t.refunded}
                  </span>
                </div>

                {/* The Step-by-Step Progress Bar container */}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'refunded' ? (
                  <div className="space-y-10 py-4">
                    
                    {/* Stepper track */}
                    <div className="relative flex items-center justify-between w-full">
                      
                      {/* Gray track background line */}
                      <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full z-0"></div>
                      
                      {/* Active green filled progress line */}
                      <div 
                        className="absolute left-6 top-5 -translate-y-1/2 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-morocco-green rounded-full z-0 transition-all duration-700"
                        style={{
                          width: `${
                            selectedOrder.status === 'pending' ? '0%' :
                            selectedOrder.status === 'confirmed' ? '33.33%' :
                            selectedOrder.status === 'shipped' ? '66.66%' : '100%'
                          }`,
                          right: isRtl ? 'auto' : undefined,
                          left: isRtl ? 'auto' : undefined,
                        }}
                      ></div>

                      {/* Step 1: Pending */}
                      {(() => {
                        const stepState = getStepStatus(selectedOrder.status, 0);
                        const stepTime = getStepTime(selectedOrder, 'pending');
                        return (
                          <div className="flex flex-col items-center text-center max-w-[20%] relative z-10 group">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-3 transition-all duration-300 shadow-xs ${
                              stepState === 'completed' 
                                ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'
                            }`}>
                              {stepState === 'completed' ? <Check className="h-5 w-5 stroke-[3]" /> : <Clock className="h-5 w-5" />}
                            </div>
                            <h4 className={`text-xs font-black mt-2.5 ${stepState === 'completed' ? 'text-slate-900 dark:text-white' : 'text-gray-400'}`}>
                              {t.stepPending}
                            </h4>
                            <p className="text-[9px] text-gray-400 mt-1 line-clamp-2 max-w-[100px] hidden sm:block font-semibold">
                              {t.descPending}
                            </p>
                            {stepTime && (
                              <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                {stepTime}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Step 2: Confirmed */}
                      {(() => {
                        const stepState = getStepStatus(selectedOrder.status, 1);
                        const stepTime = getStepTime(selectedOrder, 'confirmed');
                        return (
                          <div className="flex flex-col items-center text-center max-w-[20%] relative z-10 group">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-3 transition-all duration-300 shadow-xs ${
                              stepState === 'completed' 
                                ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
                                : stepState === 'active'
                                  ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 scale-110 animate-pulse ring-4 ring-emerald-500/15'
                                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'
                            }`}>
                              {stepState === 'completed' ? <Check className="h-5 w-5 stroke-[3]" /> : <CheckCircle2 className="h-5 w-5" />}
                            </div>
                            <h4 className={`text-xs font-black mt-2.5 ${stepState === 'completed' || stepState === 'active' ? 'text-slate-900 dark:text-white' : 'text-gray-400'}`}>
                              {t.stepConfirmed}
                            </h4>
                            <p className="text-[9px] text-gray-400 mt-1 line-clamp-2 max-w-[100px] hidden sm:block font-semibold">
                              {t.descConfirmed}
                            </p>
                            {stepTime && (
                              <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                {stepTime}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Step 3: Shipped */}
                      {(() => {
                        const stepState = getStepStatus(selectedOrder.status, 2);
                        const stepTime = getStepTime(selectedOrder, 'shipped');
                        return (
                          <div className="flex flex-col items-center text-center max-w-[20%] relative z-10 group">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-3 transition-all duration-300 shadow-xs ${
                              stepState === 'completed' 
                                ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
                                : stepState === 'active'
                                  ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 scale-110 animate-pulse ring-4 ring-emerald-500/15'
                                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'
                            }`}>
                              {stepState === 'completed' ? <Check className="h-5 w-5 stroke-[3]" /> : <Truck className="h-5 w-5" />}
                            </div>
                            <h4 className={`text-xs font-black mt-2.5 ${stepState === 'completed' || stepState === 'active' ? 'text-slate-900 dark:text-white' : 'text-gray-400'}`}>
                              {t.stepShipped}
                            </h4>
                            <p className="text-[9px] text-gray-400 mt-1 line-clamp-2 max-w-[100px] hidden sm:block font-semibold">
                              {t.descShipped}
                            </p>
                            {stepTime && (
                              <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                {stepTime}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* Step 4: Delivered */}
                      {(() => {
                        const stepState = getStepStatus(selectedOrder.status, 3);
                        const stepTime = getStepTime(selectedOrder, 'delivered');
                        return (
                          <div className="flex flex-col items-center text-center max-w-[20%] relative z-10 group">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-3 transition-all duration-300 shadow-xs ${
                              stepState === 'completed' 
                                ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
                                : stepState === 'active'
                                  ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 scale-110 animate-pulse ring-4 ring-emerald-500/15'
                                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-400'
                            }`}>
                              <Package className="h-5 w-5" />
                            </div>
                            <h4 className={`text-xs font-black mt-2.5 ${stepState === 'completed' || stepState === 'active' ? 'text-slate-900 dark:text-white' : 'text-gray-400'}`}>
                              {t.stepDelivered}
                            </h4>
                            <p className="text-[9px] text-gray-400 mt-1 line-clamp-2 max-w-[100px] hidden sm:block font-semibold">
                              {t.descDelivered}
                            </p>
                            {stepTime && (
                              <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 mt-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                {stepTime}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 text-xs font-bold justify-center">
                    <XCircle className="h-5 w-5 animate-bounce" />
                    <span>
                      {selectedOrder.status === 'cancelled' 
                        ? (language === 'ar' ? 'تنبيه: تم إلغاء معالجة هذا الطلب من قبل صاحب المتجر.' : 'Annulé : le vendeur a annulé cette commande.')
                        : (language === 'ar' ? 'تنبيه: تم استرجاع هذا الطلب بشكل رسمي.' : 'Remboursé : cette commande a été remboursée.')
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Card 2: Detailed status timeline updates / log history */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {t.timelineTitle}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {t.timelineSubtitle}
                  </p>
                </div>

                <div className="relative border-r border-l-0 dark:border-slate-800 pr-5 pl-0 rtl:border-r-0 rtl:border-l rtl:pl-5 space-y-6">
                  {/* Vertical bar decoration line */}
                  <div className="absolute top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 right-1.5 rtl:right-auto rtl:left-1.5 z-0"></div>

                  {selectedOrder.trackingHistory.slice().reverse().map((step: TrackingStep, idx: number) => {
                    const stepDate = new Date(step.timestamp);
                    const isLatest = idx === 0;

                    return (
                      <div key={idx} className="relative flex items-start gap-4 z-10 animate-fade-in">
                        
                        {/* Dot */}
                        <span className={`w-3.5 h-3.5 rounded-full border-3 shrink-0 mt-1 transition-all ${
                          isLatest 
                            ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-950 scale-110 ring-4 ring-emerald-500/10' 
                            : 'bg-slate-300 border-white dark:border-slate-900'
                        }`}></span>

                        {/* Text and context */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap justify-between items-center gap-1">
                            <span className={`text-xs font-black ${isLatest ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>
                              {step.status === 'pending' && t.pending}
                              {step.status === 'confirmed' && t.confirmed}
                              {step.status === 'shipped' && t.shipped}
                              {step.status === 'delivered' && t.delivered}
                              {step.status === 'cancelled' && t.cancelled}
                              {step.status === 'refunded' && t.refunded}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">
                              {stepDate.toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                          
                          <p className={`text-xs leading-relaxed p-3 rounded-xl border font-semibold ${
                            isLatest 
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-950/20' 
                              : 'bg-slate-50/50 dark:bg-slate-850/50 text-slate-500 dark:text-gray-400 border-slate-100/50 dark:border-slate-800/50'
                          }`}>
                            {step.note}
                          </p>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column (1/3 width on desktop): Order summary & Store contact details */}
            <div className="space-y-6">
              
              {/* Card 1: Order Summary details */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md p-6 space-y-5">
                <h4 className="text-sm font-black text-slate-900 dark:text-white pb-3 border-b border-gray-100 dark:border-slate-800">
                  {t.orderSummary}
                </h4>

                {/* Items list */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <img 
                        src={item.image} 
                        alt={item.productName} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-slate-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-white truncate">{item.productName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                          Qty: {item.quantity} 
                          {item.color && ` • ${item.color}`}
                          {item.size && ` • ${item.size}`}
                        </p>
                        <p className="text-[10px] text-morocco-green dark:text-emerald-400 font-extrabold mt-0.5">{item.price} DH</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost summary table */}
                <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between text-gray-500">
                    <span>{t.subtotal}</span>
                    <span>{selectedOrder.subtotal} DH</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{t.shipping}</span>
                    <span>{selectedOrder.shippingFee === 0 ? (language === 'ar' ? 'مرو ممتن (مجاني)' : 'Gratuit') : `${selectedOrder.shippingFee} DH`}</span>
                  </div>
                  
                  <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm border-t border-gray-100 dark:border-slate-800 pt-3">
                    <span>{t.grandTotal}</span>
                    <span className="text-morocco-green dark:text-emerald-400">{selectedOrder.total} DH</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Shipping address & Delivery options */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md p-6 space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white pb-2 border-b border-gray-100 dark:border-slate-800">
                  {t.deliveryAddress}
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.buyerName}</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">{selectedOrder.buyerAddress}</p>
                      <p className="text-gray-500 dark:text-gray-400 font-extrabold mt-0.5">{selectedOrder.buyerCity}, Morocco</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-mono font-bold text-gray-600 dark:text-gray-300">{selectedOrder.buyerPhone}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-2">
                  <p className="text-[10px] text-gray-400 font-bold">{t.paymentMethod}</p>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-sm">💵</span>
                    <span>{selectedOrder.paymentMethod === 'COD' ? t.cod : t.card}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Contact Seller for queries */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md space-y-4 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4">
                  <Package className="w-40 h-40" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-morocco-red">
                    {selectedOrder.storeName}
                  </h4>
                  <p className="text-xs font-semibold text-gray-400">
                    {language === 'ar' ? 'هل لديك أي استفسار بخصوص تفاصيل توصيل الشحنة؟' : 'Une question sur l\'expédition ou la livraison ?'}
                  </p>
                </div>

                <button
                  onClick={() => onOpenChat(selectedOrder.storeId)}
                  className="w-full py-2.5 bg-morocco-red hover:bg-morocco-red/90 text-white font-extrabold rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>💬 {t.contactStore}</span>
                </button>
              </div>

            </div>

          </div>
        )
      )}

    </div>
  );
}
