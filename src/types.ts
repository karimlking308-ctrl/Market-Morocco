/**
 * Marketplace Morocco - Shared Type Definitions
 */

export type UserRole = 'admin' | 'seller' | 'buyer' | 'visitor';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
  storeId?: string; // If role is seller, reference to their store
  wishlist: string[]; // List of product IDs
  balance: number; // For sellers, accumulated earnings
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  logo: string;
  cover: string;
  description: string;
  category: string;
  city: string;
  slug: string; // Friendly URL, e.g., 'karim-shop' -> /store/karim-shop
  status: 'pending_payment' | 'active' | 'suspended';
  rating: number;
  ratingCount: number;
  productCount: number;
  orderCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  images: string[];
  videoUrl?: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number; // Optional discount price
  inventory: number;
  category: string;
  tags: string[];
  weight?: number; // in kg
  colors: string[];
  sizes: string[];
  shippingInfo?: string;
  deliveryDuration: string; // e.g. "2-3 days"
  status: 'active' | 'pending_moderation' | 'flagged' | 'rejected';
  moderationReason?: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  image: string;
}

export interface TrackingStep {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  commissionFee: number; // Platform fee cut
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentMethod: 'COD' | 'card'; // Cash on Delivery (COD) as default Moroccan choice
  createdAt: string;
  trackingHistory: TrackingStep[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  storeId: string;
  storeName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountBuyer: number;
  unreadCountSeller: number;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  entityId: string; // Can be productId, storeId, or sellerId
  entityType: 'product' | 'store';
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  expirationDate: string;
  storeId?: string; // Optional: null means sitewide, otherwise store-specific
  maxUses: number;
  usedCount: number;
  status: 'active' | 'inactive';
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  storeId?: string;
  storeName?: string;
  productId?: string;
  productName?: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  reply?: string;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  image: string;
  link: string;
  location: 'home_banner' | 'sidebar' | 'product_page';
  status: 'active' | 'inactive';
  views: number;
  clicks: number;
  provider: 'custom' | 'google_adsense';
}

export interface AppSettings {
  commissionPercent: number; // e.g. 5% commission on each sale
  setupFeeMAD: number; // 9 MAD setup fee
  allowedCategories: string[];
  moroccanCities: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  buyerId: string;
  buyerName: string;
  storeId: string;
  storeName: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface SmsNotification {
  id: string;
  sender: string; // e.g., "MktMorocco" or "MAROC_MKT"
  receiverPhone: string;
  receiverName: string;
  receiverRole: 'buyer' | 'seller' | 'admin';
  message: string;
  timestamp: string;
  orderId?: string;
  status: 'sent' | 'delivered' | 'failed';
}

