import React, { useState } from 'react';
import { ShoppingCart, Heart, MessageSquare, Bell, Store, Settings, LogOut, Search, User, Globe, Moon, Sun, ChevronDown, Smartphone, History } from 'lucide-react';
import { TRANSLATIONS } from '../db/translations';
import { UserProfile, UserRole } from '../types';
import { LocalDatabase } from '../db/localDb';

interface HeaderProps {
  language: 'ar' | 'fr';
  setLanguage: (lang: 'ar' | 'fr') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  cartCount: number;
  unreadMessages: number;
  onSearch: (query: string) => void;
  onSwitchRole: (role: UserRole) => void;
  selectedStoreSlug?: string;
  setSelectedStoreSlug: (slug: string | undefined) => void;
  onOpenSmsLogs?: () => void;
}

export default function Header({
  language,
  setLanguage,
  theme,
  setTheme,
  activeView,
  setActiveView,
  currentUser,
  setCurrentUser,
  cartCount,
  unreadMessages,
  onSearch,
  onSwitchRole,
  setSelectedStoreSlug,
  onOpenSmsLogs
}: HeaderProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  const [searchVal, setSearchVal] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    setActiveView('home');
  };

  const selectPersona = (role: UserRole) => {
    onSwitchRole(role);
    setShowRoleDropdown(false);
    // Redirect appropriately
    if (role === 'admin') {
      setActiveView('admin');
    } else if (role === 'seller') {
      setActiveView('dashboard');
    } else {
      setActiveView('home');
    }
  };

  const handleLogoClick = () => {
    onSearch('');
    setSearchVal('');
    setSelectedStoreSlug(undefined);
    setActiveView('home');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleLogoClick} id="app-logo-container">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-morocco-red flex items-center justify-center text-white font-extrabold text-xl shadow-md border border-morocco-red/10">
                M
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-6 rounded border border-white/90 dark:border-slate-900/90 overflow-hidden shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-full h-full object-cover">
                  <rect width="900" height="600" fill="#c1272d"/>
                  <path d="m450 174 53 162-139-101h172L397 336z" fill="none" stroke="#006233" strokeWidth="25" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-2">
                <span>{t.appName}</span>
                <span className="inline-flex h-3.5 w-5 rounded-sm overflow-hidden shadow-xs border border-gray-200/50 dark:border-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-full h-full object-cover">
                    <rect width="900" height="600" fill="#c1272d"/>
                    <path d="m450 174 53 162-139-101h172L397 336z" fill="none" stroke="#006233" strokeWidth="25" strokeLinejoin="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
                {t.appSlogan}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative hidden sm:block">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-morocco-red focus:border-transparent transition-all text-sm"
              id="global-search-input"
            />
            <div className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center pr-3 pointer-events-none`}>
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* Nav Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 flex items-center gap-1.5 text-xs font-semibold"
              title="Change Language"
              id="language-toggle-btn"
            >
              <Globe className="h-4 w-4" />
              <span>{t.languageToggle}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              title="Toggle Theme"
              id="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Persona Switcher Dropdown (Crucial for live preview testing) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-morocco-green/30 bg-morocco-green/5 hover:bg-morocco-green/10 text-morocco-green dark:text-emerald-400 text-xs font-bold transition-colors"
                id="role-switcher-btn"
              >
                <span>Role: {currentUser ? currentUser.role.toUpperCase() : 'VISITOR'}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showRoleDropdown && (
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden`}>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                    Select Test Persona
                  </div>
                  <button onClick={() => selectPersona('visitor')} className="w-full text-right px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-between">
                    <span>زائر (Visitor)</span>
                    <span className="text-[10px] bg-gray-100 dark:bg-slate-600 px-1.5 py-0.5 rounded text-gray-500">Read-Only</span>
                  </button>
                  <button onClick={() => selectPersona('buyer')} className="w-full text-right px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-between">
                    <span>مشتري: ياسين (Buyer Yassine)</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">Cart/COD</span>
                  </button>
                  <button onClick={() => selectPersona('seller')} className="w-full text-right px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-between">
                    <span>بائع: كريم (Seller Karim)</span>
                    <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">Store Admin</span>
                  </button>
                  <button onClick={() => selectPersona('admin')} className="w-full text-right px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-between">
                    <span>مدير المنصة: أمين (Admin Amine)</span>
                    <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">Full Control</span>
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setActiveView('cart')}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title={t.cart}
              id="header-cart-btn"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-morocco-red text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Messages Button */}
            <button
              onClick={() => {
                if (currentUser) {
                  setActiveView('messages');
                } else {
                  setActiveView('login');
                }
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title={t.messages}
              id="header-messages-btn"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-morocco-green text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>

            {/* Simulated SMS Gateway Button */}
            {onOpenSmsLogs && (
              <button
                onClick={onOpenSmsLogs}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title={language === 'ar' ? 'بوابة الرسائل SMS' : 'SMS Gateway'}
                id="header-sms-gateway-btn"
              >
                <Smartphone className="h-5 w-5 text-emerald-500 animate-pulse" />
                <span className="absolute -top-1 -right-1 bg-emerald-500 h-2 w-2 rounded-full border border-white dark:border-slate-900"></span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveView('wishlist')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors hidden sm:block"
              title={t.wishlist}
              id="header-wishlist-btn"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* User Profile / Dashboard Button */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 hover:opacity-90 focus:outline-none"
                  id="profile-dropdown-trigger"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                  />
                </button>
              ) : (
                <button
                  onClick={() => setActiveView('login')}
                  className="p-2 rounded-lg bg-morocco-red hover:bg-morocco-red/95 text-white flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                  id="header-login-btn"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{t.login}</span>
                </button>
              )}

              {/* Profile Dropdown */}
              {currentUser && showProfileDropdown && (
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden`}>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{currentUser.email}</p>
                    <p className="text-[9px] bg-morocco-red/10 text-morocco-red px-1.5 py-0.5 rounded inline-block mt-2 font-bold uppercase tracking-wide">
                      {currentUser.role}
                    </p>
                  </div>
                  
                  {/* Action Navigation */}
                  <div className="py-1">
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { setActiveView('admin'); setShowProfileDropdown(false); }}
                        className="w-full text-right px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span>{t.adminPanel}</span>
                      </button>
                    )}
                    
                    {currentUser.role === 'seller' && (
                      <>
                        <button
                          onClick={() => { setActiveView('dashboard'); setShowProfileDropdown(false); }}
                          className="w-full text-right px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          <span>{t.sellerDashboard}</span>
                        </button>
                        {currentUser.storeId && (
                          <button
                            onClick={() => {
                              setSelectedStoreSlug(currentUser.storeId);
                              setActiveView('store');
                              setShowProfileDropdown(false);
                            }}
                            className="w-full text-right px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Store className="h-4 w-4 text-gray-400" />
                            <span>{t.myStore}</span>
                          </button>
                        )}
                      </>
                    )}

                    {currentUser.role === 'buyer' && (
                      <button
                        onClick={() => { setActiveView('orders'); setShowProfileDropdown(false); }}
                        className="w-full text-right px-4 py-2 text-xs text-slate-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold"
                      >
                        <History className="h-4 w-4 text-gray-400" />
                        <span>{language === 'ar' ? 'تتبع طلباتي' : 'Suivre mes commandes'}</span>
                      </button>
                    )}

                    {currentUser.role === 'buyer' && !currentUser.storeId && (
                      <button
                        onClick={() => { setActiveView('create-store'); setShowProfileDropdown(false); }}
                        className="w-full text-right px-4 py-2 text-xs text-morocco-red hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 font-bold"
                      >
                        <Store className="h-4 w-4 text-morocco-red" />
                        <span>{t.createStoreTitle} (9 DH)</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setActiveView('complaints'); setShowProfileDropdown(false); }}
                      className="w-full text-right px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Bell className="h-4 w-4 text-gray-400" />
                      <span>{t.contactSupport}</span>
                    </button>

                    <button
                      onClick={() => {
                        LocalDatabase.setCurrentUser(null);
                        setCurrentUser(null);
                        setActiveView('home');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-right px-4 py-2 text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
        
        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="sm:hidden pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-morocco-red focus:border-transparent text-xs"
              id="mobile-search-input"
            />
            <div className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center pr-3 pointer-events-none`}>
              <Search className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </form>

      </div>
    </header>
  );
}
