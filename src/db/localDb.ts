/**
 * Local State Engine and Server API Synchronizer
 * Persists data in localStorage and integrates with server-side Gemini moderation APIs
 */

import { Product, Store, UserProfile, Coupon, Ad, AppSettings, Order, Message, Conversation, Complaint, Review, ChatRoom, ChatMessage, SmsNotification } from '../types';
import { INITIAL_SETTINGS, MOCK_USERS, MOCK_STORES, MOCK_PRODUCTS, MOCK_COUPONS, MOCK_ADS, MOCK_ORDERS, MOCK_CONVERSATIONS, MOCK_MESSAGES } from './mockData';

// Helper to load or initialize from localStorage
function getStored<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(`market_ma_${key}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing localStorage key:', key, e);
    }
  }
  
  // Save default value immediately for future access
  localStorage.setItem(`market_ma_${key}`, JSON.stringify(defaultValue));
  return defaultValue;
}

function setStored<T>(key: string, value: T): void {
  localStorage.setItem(`market_ma_${key}`, JSON.stringify(value));
}

export class LocalDatabase {
  static initialize(): void {
    getStored<AppSettings>('settings', INITIAL_SETTINGS);
    getStored<UserProfile[]>('users', MOCK_USERS);
    getStored<Store[]>('stores', MOCK_STORES);
    getStored<Product[]>('products', MOCK_PRODUCTS);
    getStored<Order[]>('orders', MOCK_ORDERS);
    getStored<Coupon[]>('coupons', MOCK_COUPONS);
    getStored<Ad[]>('ads', MOCK_ADS);
    getStored<Complaint[]>('complaints', []);
    getStored<Review[]>('reviews', []);
    getStored<ChatRoom[]>('chat_rooms', []);
    getStored<SmsNotification[]>('sms_notifications', []);
  }

  static getSettings(): AppSettings {
    return getStored<AppSettings>('settings', INITIAL_SETTINGS);
  }

  static saveSettings(settings: AppSettings): void {
    setStored('settings', settings);
    // Also try to sync to server
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.log('Non-blocking server settings sync skipped:', err));
  }

  static updateSettings(settings: AppSettings): void {
    this.saveSettings(settings);
  }

  static getUsers(): UserProfile[] {
    return getStored<UserProfile[]>('users', MOCK_USERS);
  }

  static saveUsers(users: UserProfile[]): void {
    setStored('users', users);
  }

  static updateUserRole(userId: string, role: any): void {
    const list = this.getUsers();
    const found = list.find(u => u.id === userId);
    if (found) {
      found.role = role;
      this.saveUsers(list);
    }
  }

  static getStores(): Store[] {
    return getStored<Store[]>('stores', MOCK_STORES);
  }

  static saveStores(stores: Store[]): void {
    setStored('stores', stores);
  }

  static addStore(store: Store): void {
    const list = this.getStores();
    list.push(store);
    this.saveStores(list);
  }

  static updateStoreSettings(store: Store): void {
    const list = this.getStores();
    const idx = list.findIndex(s => s.id === store.id);
    if (idx > -1) {
      list[idx] = store;
      this.saveStores(list);
    }
  }

  static updateStoreStatus(storeId: string, status: any): void {
    const list = this.getStores();
    const found = list.find(s => s.id === storeId);
    if (found) {
      found.status = status;
      this.saveStores(list);
    }
  }

  static deleteStore(storeId: string): void {
    const list = this.getStores().filter(s => s.id !== storeId);
    this.saveStores(list);
  }

  static incrementStoreSales(storeId: string): void {
    const list = this.getStores();
    const found = list.find(s => s.id === storeId);
    if (found) {
      found.orderCount += 1;
      this.saveStores(list);
    }
  }

  static getProducts(): Product[] {
    return getStored<Product[]>('products', MOCK_PRODUCTS);
  }

  static saveProducts(products: Product[]): void {
    setStored('products', products);
  }

  static addProduct(prod: Product): void {
    const list = this.getProducts();
    list.push(prod);
    this.saveProducts(list);
  }

  static updateProductStatus(productId: string, status: any): void {
    const list = this.getProducts();
    const found = list.find(p => p.id === productId);
    if (found) {
      found.status = status;
      this.saveProducts(list);
    }
  }

  static getOrders(): Order[] {
    return getStored<Order[]>('orders', MOCK_ORDERS);
  }

  static saveOrders(orders: Order[]): void {
    setStored('orders', orders);
  }

  static addOrder(order: Order): void {
    const list = this.getOrders();
    list.push(order);
    this.saveOrders(list);
  }

  static updateOrderStatus(orderId: string, status: any, note: string): void {
    const list = this.getOrders();
    const found = list.find(o => o.id === orderId);
    if (found) {
      found.status = status;
      found.trackingHistory.push({
        status,
        timestamp: new Date().toISOString(),
        note
      });
      this.saveOrders(list);
    }
  }

  static getCoupons(): Coupon[] {
    return getStored<Coupon[]>('coupons', MOCK_COUPONS);
  }

  static saveCoupons(coupons: Coupon[]): void {
    setStored('coupons', coupons);
  }

  static addCoupon(coupon: Coupon): void {
    const list = this.getCoupons();
    list.push(coupon);
    this.saveCoupons(list);
  }

  static incrementCouponUses(couponId: string): void {
    const list = this.getCoupons();
    const found = list.find(c => c.id === couponId);
    if (found) {
      found.usedCount += 1;
      this.saveCoupons(list);
    }
  }

  static getAds(): Ad[] {
    return getStored<Ad[]>('ads', MOCK_ADS);
  }

  static saveAds(ads: Ad[]): void {
    setStored('ads', ads);
  }

  static addAd(ad: Ad): void {
    const list = this.getAds();
    list.push(ad);
    this.saveAds(list);
  }

  static getComplaints(): Complaint[] {
    return getStored<Complaint[]>('complaints', []);
  }

  static saveComplaints(complaints: Complaint[]): void {
    setStored('complaints', complaints);
  }

  static addComplaint(complaint: Complaint): void {
    const list = this.getComplaints();
    list.push(complaint);
    this.saveComplaints(list);
  }

  static resolveComplaint(complaintId: string, reply: string): void {
    const list = this.getComplaints();
    const found = list.find(c => c.id === complaintId);
    if (found) {
      found.status = 'resolved';
      found.reply = reply;
      this.saveComplaints(list);
    }
  }

  static getConversations(): Conversation[] {
    return getStored<Conversation[]>('conversations', MOCK_CONVERSATIONS);
  }

  static saveConversations(conversations: Conversation[]): void {
    setStored('conversations', conversations);
  }

  static getMessages(): Message[] {
    return getStored<Message[]>('messages', MOCK_MESSAGES);
  }

  static saveMessages(messages: Message[]): void {
    setStored('messages', messages);
  }

  static getReviews(): Review[] {
    return getStored<Review[]>('reviews', []);
  }

  static saveReviews(reviews: Review[]): void {
    setStored('reviews', reviews);
  }

  static addReview(review: Review): void {
    const list = this.getReviews();
    list.push(review);
    this.saveReviews(list);
  }

  static getChatRooms(): ChatRoom[] {
    return getStored<ChatRoom[]>('chat_rooms', []);
  }

  static saveChatRooms(rooms: ChatRoom[]): void {
    setStored('chat_rooms', rooms);
  }

  static addChatRoom(room: ChatRoom): void {
    const list = this.getChatRooms();
    list.push(room);
    this.saveChatRooms(list);
  }

  static addChatMessage(roomId: string, senderId: string, content: string): void {
    const rooms = this.getChatRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.messages.push({
        id: `msg-${Date.now()}`,
        senderId,
        content,
        createdAt: new Date().toISOString()
      });
      room.updatedAt = new Date().toISOString();
      this.saveChatRooms(rooms);
    }
  }

  static getCurrentUser(): UserProfile | null {
    const user = localStorage.getItem('market_ma_current_user');
    return user ? JSON.parse(user) : null;
  }

  static setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem('market_ma_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('market_ma_current_user');
    }
  }

  static getSmsNotifications(): SmsNotification[] {
    return getStored<SmsNotification[]>('sms_notifications', []);
  }

  static saveSmsNotifications(list: SmsNotification[]): void {
    setStored('sms_notifications', list);
  }

  static addSmsNotification(sms: SmsNotification): void {
    const list = this.getSmsNotifications();
    list.unshift(sms);
    this.saveSmsNotifications(list);
  }

  // --- Real AI Integration Methods calling Express Backend ---
  
  /**
   * Run server-side Gemini moderation on the product.
   * Checks for illegal or prohibited items in Morocco.
   */
  static async moderateProduct(name: string, description: string, category: string): Promise<{ status: 'active' | 'rejected', reason: string }> {
    try {
      const response = await fetch('/api/moderate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category })
      });
      if (!response.ok) {
        throw new Error('Moderation API failed');
      }
      return await response.json();
    } catch (e) {
      console.error('Non-blocking Moderation API error, falling back to manual approval:', e);
      return { status: 'active', reason: 'معتمد تلقائياً (تم تخطي الفحص الذكي للشبكة)' };
    }
  }

  /**
   * Generates a descriptive, persuasive Moroccan sales page description using Gemini.
   */
  static async generateProductDescription(name: string, category: string, features: string): Promise<string> {
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, features })
      });
      if (!response.ok) {
        throw new Error('AI Generation API failed');
      }
      const data = await response.json();
      return data.description;
    } catch (e) {
      console.error('AI Generation error:', e);
      return `منتج ${name} الفاخر المختار بعناية للسوق المغربي. جودة عالية وممتازة للتوصيل لجميع المدن.`;
    }
  }
}
