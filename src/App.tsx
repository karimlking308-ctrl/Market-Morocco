import React, { useState, useEffect } from 'react';
import { Smartphone, History, Mail } from 'lucide-react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ProductDetailView from './components/ProductDetailView';
import StoreDetailView from './components/StoreDetailView';
import CartView from './components/CartView';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import ChatView from './components/ChatView';
import ComplaintsView from './components/ComplaintsView';
import BuyerOrderHistory from './components/BuyerOrderHistory';

import { LocalDatabase } from './db/localDb';
import { Product, Store, Order, Complaint, Coupon, Ad, AppSettings, UserProfile, ChatRoom, SmsNotification } from './types';
import { MockSmsService } from './db/smsService';
import { TRANSLATIONS } from './db/translations';

export default function App() {
  // Localization & Theme
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // DB States
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  // Navigation
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'store' | 'cart' | 'dashboard' | 'admin' | 'chat' | 'complaints' | 'orders'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Active Personas
  const [currentUserRole, setCurrentUserRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [currentUserId, setCurrentUserId] = useState<string>('usr-buyer-1');
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);

  // Cart & Wishlist states
  const [cart, setCart] = useState<{ product: Product; quantity: number; color?: string; size?: string }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time simulated SMS states
  const [activeSmsToast, setActiveSmsToast] = useState<SmsNotification | null>(null);
  const [showSmsHistoryModal, setShowSmsHistoryModal] = useState<boolean>(false);
  const [smsNotificationList, setSmsNotificationList] = useState<SmsNotification[]>([]);

  // Setup initial load
  useEffect(() => {
    LocalDatabase.initialize();
    
    // Read from DB
    setProducts(LocalDatabase.getProducts());
    setStores(LocalDatabase.getStores());
    setOrders(LocalDatabase.getOrders());
    setComplaints(LocalDatabase.getComplaints());
    setCoupons(LocalDatabase.getCoupons());
    setAds(LocalDatabase.getAds());
    setSettings(LocalDatabase.getSettings());
    setUsers(LocalDatabase.getUsers());
    setChatRooms(LocalDatabase.getChatRooms());
    setSmsNotificationList(LocalDatabase.getSmsNotifications());
  }, []);

  // Listen for sent SMS logs
  useEffect(() => {
    const unsubscribe = MockSmsService.registerOnSmsSent((sms) => {
      setActiveSmsToast(sms);
      setSmsNotificationList(LocalDatabase.getSmsNotifications());
      
      // Auto-dismiss the toast after 7 seconds
      const timer = setTimeout(() => {
        setActiveSmsToast(prev => prev?.id === sms.id ? null : prev);
      }, 7000);
      return () => clearTimeout(timer);
    });
    return unsubscribe;
  }, []);

  // Sync to database updates
  const syncWithDb = () => {
    setProducts(LocalDatabase.getProducts());
    setStores(LocalDatabase.getStores());
    setOrders(LocalDatabase.getOrders());
    setComplaints(LocalDatabase.getComplaints());
    setCoupons(LocalDatabase.getCoupons());
    setAds(LocalDatabase.getAds());
    setSettings(LocalDatabase.getSettings());
    setUsers(LocalDatabase.getUsers());
    setChatRooms(LocalDatabase.getChatRooms());
    setSmsNotificationList(LocalDatabase.getSmsNotifications());
  };

  const currentProfile = users.find(u => u.id === currentUserId) || {
    id: currentUserId,
    name: 'Abdelkader',
    email: 'buyer@marketplace.ma',
    role: currentUserRole,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    phone: '+212612345678'
  };

  const sellerStore = stores.find(s => s.ownerId === currentUserId);

  // Handlers
  const handleAddToCart = (product: Product, color?: string, size?: string) => {
    setCart((prev) => {
      const idx = prev.findIndex(item => item.product.id === product.id && item.color === color && item.size === size);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { product, quantity: 1, color, size }];
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateCartQty = (index: number, qty: number) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index].quantity = qty;
      return copy;
    });
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Switch Role handler
  const handleSwitchRole = (role: 'buyer' | 'seller' | 'admin') => {
    setCurrentUserRole(role);
    if (role === 'buyer') {
      setCurrentUserId('usr-buyer-1');
      setCurrentView('home');
    } else if (role === 'seller') {
      // Pick Fatima or Karim
      setCurrentUserId('usr-seller-1'); // Fatima
      setCurrentView('dashboard');
    } else {
      setCurrentUserId('usr-admin-1'); // Admin
      setCurrentView('admin');
    }
  };

  // Launch store setup - cost 9 DH
  const handleLaunchStore = (storeName: string, category: string, city: string) => {
    const newStore: Store = {
      id: `store-${Math.floor(Math.random() * 9000) + 1000}`,
      ownerId: currentUserId,
      name: storeName,
      logo: 'https://images.unsplash.com/photo-1546213290-e1b7610339e5?auto=format&fit=crop&w=120&h=120&q=80',
      cover: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&h=300&q=80',
      description: 'متجر مغربي تقليدي لبيع المنتجات الفاخرة.',
      category: category,
      city: city,
      slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: 'active',
      rating: 5.0,
      ratingCount: 1,
      productCount: 0,
      orderCount: 0,
      createdAt: new Date().toISOString()
    };
    
    // Add store
    LocalDatabase.addStore(newStore);
    syncWithDb();
    setCurrentView('dashboard');
  };

  // Add product with compliance validation handler
  const handleAddProduct = (newProduct: Product) => {
    LocalDatabase.addProduct(newProduct);
    syncWithDb();
  };

  // Update order status handler
  const handleUpdateOrderStatus = (orderId: string, status: any, note: string) => {
    LocalDatabase.updateOrderStatus(orderId, status, note);
    syncWithDb();

    // Trigger SMS notification for status update
    const allOrders = LocalDatabase.getOrders();
    const updatedOrder = allOrders.find(o => o.id === orderId);
    if (updatedOrder) {
      MockSmsService.triggerOrderStatusUpdateSms(updatedOrder, status, note);
    }
  };

  // Update store settings handler
  const handleUpdateStoreSettings = (updated: Store) => {
    LocalDatabase.updateStoreSettings(updated);
    syncWithDb();
  };

  // Place checkout order
  const handlePlaceOrder = (fullName: string, phone: string, address: string, city: string, couponCode?: string, paymentMethod: 'COD' | 'card' = 'COD') => {
    if (!settings) return;

    // Calc totals
    const subtotal = cart.reduce((acc, item) => {
      const itemPrice = item.product.salePrice ?? item.product.price;
      return acc + itemPrice * item.quantity;
    }, 0);

    const shippingFee = subtotal > 500 ? 0 : 25;
    
    let discount = 0;
    if (couponCode) {
      const cp = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
      if (cp) {
        discount = cp.discountType === 'percent' ? Math.round(subtotal * (cp.discountValue / 100)) : cp.discountValue;
        LocalDatabase.incrementCouponUses(cp.id);
      }
    }

    const finalTotal = Math.max(0, subtotal + shippingFee - discount);
    const commFee = Math.round(finalTotal * (settings.commissionPercent / 100));

    // Create an order for each distinct store
    const storeIds = Array.from(new Set(cart.map(item => item.product.storeId))) as string[];

    storeIds.forEach((storeId) => {
      const storeItems = cart.filter(item => item.product.storeId === storeId);
      const storeSubtotal = storeItems.reduce((acc, item) => {
        const itemPrice = item.product.salePrice ?? item.product.price;
        return acc + itemPrice * item.quantity;
      }, 0);

      const storeTotal = storeSubtotal; // Simplified allocation
      const storeComm = Math.round(storeTotal * (settings.commissionPercent / 100));

      const newOrder: Order = {
        id: `ord-ma-${Math.floor(Math.random() * 9000) + 1000}`,
        storeId: storeId,
        storeName: storeItems[0].product.storeName,
        buyerId: currentUserId,
        buyerName: fullName,
        buyerPhone: phone,
        buyerAddress: address,
        buyerCity: city,
        items: storeItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.salePrice ?? item.product.price,
          color: item.color,
          size: item.size,
          image: item.product.images[0]
        })),
        subtotal: storeSubtotal,
        shippingFee: shippingFee / storeIds.length,
        total: storeTotal,
        commissionFee: storeComm,
        status: 'pending',
        paymentMethod: paymentMethod,
        trackingHistory: [
          {
            timestamp: new Date().toISOString(),
            status: 'pending',
            note: 'تم استلام طلبكم بنجاح وهو قيد المراجعة الفورية من طرف المتجر'
          }
        ],
        createdAt: new Date().toISOString()
      };

      LocalDatabase.addOrder(newOrder);
      LocalDatabase.incrementStoreSales(storeId);
      
      // Trigger order placement SMS (dispatches to buyer and seller)
      MockSmsService.triggerOrderPlacementSms(newOrder);
    });

    setCart([]);
    syncWithDb();
  };

  // Withdraw Capital
  const handleWithdrawFunds = (amount: number, details: string) => {
    if (!sellerStore) return;
    // Log withdrawal or trigger mock subtraction
    console.log(`Withdrawn ${amount} MAD with details: ${details}`);
  };

  // Open direct messages contact channel
  const handleOpenChat = (storeId: string) => {
    const activeStore = stores.find(s => s.id === storeId);
    if (!activeStore) return;

    // Look for existing chat
    let foundRoom = chatRooms.find(r => r.buyerId === currentUserId && r.storeId === storeId);
    
    if (!foundRoom) {
      const newRoom: ChatRoom = {
        id: `room-${Math.floor(Math.random() * 900000) + 100000}`,
        buyerId: currentUserId,
        buyerName: currentProfile.name,
        storeId: storeId,
        storeName: activeStore.name,
        messages: [
          {
            id: `msg-init-${Date.now()}`,
            senderId: storeId,
            content: `مرحباً بك في متجرنا ${activeStore.name}! كيف يمكننا مساعدتك اليوم؟`,
            createdAt: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
      LocalDatabase.addChatRoom(newRoom);
      foundRoom = newRoom;
    }

    setActiveChatRoomId(foundRoom.id);
    setChatRooms(LocalDatabase.getChatRooms());
    setCurrentView('chat');
  };

  const handleSendMessage = (roomId: string, content: string) => {
    LocalDatabase.addChatMessage(roomId, currentUserId, content);
    syncWithDb();
  };

  // Admin override tools
  const handleUpdateStoreStatus = (storeId: string, status: 'active' | 'suspended') => {
    LocalDatabase.updateStoreStatus(storeId, status);
    syncWithDb();
  };

  const handleDeleteStore = (storeId: string) => {
    LocalDatabase.deleteStore(storeId);
    syncWithDb();
  };

  const handleUpdateProductStatus = (productId: string, status: 'active' | 'rejected') => {
    LocalDatabase.updateProductStatus(productId, status);
    syncWithDb();
  };

  const handleResolveComplaint = (complaintId: string, reply: string) => {
    LocalDatabase.resolveComplaint(complaintId, reply);
    syncWithDb();
  };

  const handleAddCoupon = (coupon: Coupon) => {
    LocalDatabase.addCoupon(coupon);
    syncWithDb();
  };

  const handleAddAd = (ad: Ad) => {
    LocalDatabase.addAd(ad);
    syncWithDb();
  };

  const handleAddComplaint = (subject: string, message: string) => {
    const newC: Complaint = {
      id: `ticket-${Math.floor(Math.random() * 9000) + 1000}`,
      userId: currentUserId,
      userName: currentProfile.name,
      subject: subject,
      message: message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    LocalDatabase.addComplaint(newC);
    syncWithDb();
  };

  const handleUpdateSettings = (updated: AppSettings) => {
    LocalDatabase.updateSettings(updated);
    syncWithDb();
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-morocco-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-400">Loading Marketplace Morocco...</p>
        </div>
      </div>
    );
  }

  const t = TRANSLATIONS[language];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-gray-100' : 'bg-gray-50 text-slate-800'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Platform Header Navigation */}
      <Header
        language={language}
        setLanguage={setLanguage}
        theme={darkMode ? 'dark' : 'light'}
        setTheme={(newTheme) => setDarkMode(newTheme === 'dark')}
        activeView={currentView === 'chat' ? 'messages' : currentView}
        setActiveView={(view) => {
          if (view === 'messages') {
            setCurrentView('chat');
          } else {
            setCurrentView(view as any);
          }
        }}
        currentUser={currentProfile as any}
        setCurrentUser={() => {}}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        unreadMessages={0}
        onSearch={(query) => setSearchQuery(query)}
        onSwitchRole={(role) => handleSwitchRole(role as any)}
        setSelectedStoreSlug={() => {}}
        onOpenSmsLogs={() => setShowSmsHistoryModal(true)}
      />

      {/* Main Container Core Views */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' && (
          <HomeView
            language={language}
            products={products}
            stores={stores}
            ads={ads}
            settings={settings}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setCurrentView('product');
            }}
            onSelectStore={(storeSlug) => {
              setSelectedStoreId(storeSlug);
              setCurrentView('store');
            }}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentView === 'product' && selectedProduct && (
          <ProductDetailView
            language={language}
            product={selectedProduct}
            products={products}
            store={stores.find(s => s.id === selectedProduct.storeId)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
            onOpenChat={handleOpenChat}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onSelectStore={(stId) => {
              setSelectedStoreId(stId);
              setCurrentView('store');
            }}
            reviews={LocalDatabase.getReviews()}
            onSubmitReview={(rating, comment) => {
              const newReview = {
                id: `review-${Date.now()}`,
                entityType: 'product' as const,
                entityId: selectedProduct.id,
                reviewerId: currentProfile.id,
                reviewerName: currentProfile.name,
                rating,
                comment,
                createdAt: new Date().toISOString()
              };
              LocalDatabase.addReview(newReview);
              // Recalc average rating for this product
              const allProductReviews = LocalDatabase.getReviews().filter(r => r.entityId === selectedProduct.id);
              const avg = allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length;
              selectedProduct.rating = Number(avg.toFixed(1));
              selectedProduct.ratingCount = allProductReviews.length;
              LocalDatabase.updateProductStatus(selectedProduct.id, selectedProduct.status);
              syncWithDb();
            }}
            currentUser={currentProfile}
          />
        )}

        {currentView === 'store' && selectedStoreId && (
          <StoreDetailView
            language={language}
            store={stores.find(s => s.id === selectedStoreId) || stores[0]}
            products={products}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setCurrentView('product');
            }}
            onOpenChat={handleOpenChat}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentView === 'cart' && (
          <CartView
            language={language}
            cart={cart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            onPlaceOrder={handlePlaceOrder}
            settings={settings}
            coupons={coupons}
          />
        )}

        {currentView === 'dashboard' && sellerStore && (
          <SellerDashboard
            language={language}
            store={sellerStore}
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateProductStatus={handleUpdateProductStatus}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateStoreSettings={handleUpdateStoreSettings}
            onWithdrawFunds={handleWithdrawFunds}
            settings={settings}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            language={language}
            users={users}
            stores={stores}
            products={products}
            orders={orders}
            complaints={complaints}
            coupons={coupons}
            ads={ads}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onUpdateUserRole={(uId, role) => {
              LocalDatabase.updateUserRole(uId, role);
              syncWithDb();
            }}
            onUpdateStoreStatus={handleUpdateStoreStatus}
            onDeleteStore={handleDeleteStore}
            onUpdateProductStatus={handleUpdateProductStatus}
            onResolveComplaint={handleResolveComplaint}
            onAddCoupon={handleAddCoupon}
            onAddAd={handleAddAd}
          />
        )}

        {currentView === 'chat' && (
          <ChatView
            language={language}
            rooms={chatRooms}
            currentUser={currentProfile}
            stores={stores}
            onSendMessage={handleSendMessage}
            onSelectRoom={setActiveChatRoomId}
            activeRoomId={activeChatRoomId}
          />
        )}

        {currentView === 'complaints' && (
          <ComplaintsView
            language={language}
            complaints={complaints}
            currentUser={currentProfile}
            onAddComplaint={handleAddComplaint}
          />
        )}

        {currentView === 'orders' && (
          <BuyerOrderHistory
            language={language}
            orders={orders.filter(o => o.buyerId === currentProfile.id)}
            onOpenChat={handleOpenChat}
          />
        )}
      </main>

      {/* Decorative Moroccan Footnote credits */}
      <footer className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 py-12 border-t border-slate-200/60 dark:border-slate-900 mt-20 text-xs leading-relaxed" id="platform-footer">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-display tracking-tight uppercase">
              👑 {language === 'ar' ? 'منصة ماركت بليس المغرب' : 'Marketplace Morocco'}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {language === 'ar' ? 'المنصة الوطنية الأولى لتأسيس وإطلاق المتاجر الإلكترونية الاحترافية برأس مال 9 دراهم فقط.' : 'La plateforme nationale pour créer votre propre boutique en ligne à 9 DH seulement.'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">{language === 'ar' ? 'دعم وأمان' : 'Sécurité & Support'}</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400 font-semibold">
              <li>
                <button onClick={() => setCurrentView('complaints')} className="hover:text-morocco-red transition-all cursor-pointer">
                  ⚖️ {language === 'ar' ? 'رفع نزاع أو بلاغ شكوى' : 'Lancer un litige / Support'}
                </button>
              </li>
              <li>
                <span className="block text-slate-500 dark:text-slate-400">🛡️ {language === 'ar' ? 'ضمان الدفع عند الاستلام (COD)' : 'Paiement à la livraison garanti'}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">{language === 'ar' ? 'حقوق ملكية' : 'Droits d’auteur'}</h4>
            <p className="text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Marketplace Morocco. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
            </p>
            <div className="text-[10px] bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 inline-block">
              🇲🇦 {language === 'ar' ? 'صنع بكل فخر بالمملكة المغربية' : 'Fait fièrement au Royaume du Maroc'}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
