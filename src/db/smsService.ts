import { Order, SmsNotification, UserProfile } from '../types';
import { LocalDatabase } from './localDb';

export class MockSmsService {
  /**
   * Dispatches a mock SMS and persists it in the database.
   * Can trigger a visual callback if one is registered (to show real-time SMS toast overlay in App.tsx)
   */
  private static onSmsSentCallbacks: ((sms: SmsNotification) => void)[] = [];

  static registerOnSmsSent(callback: (sms: SmsNotification) => void) {
    this.onSmsSentCallbacks.push(callback);
    return () => {
      this.onSmsSentCallbacks = this.onSmsSentCallbacks.filter(cb => cb !== callback);
    };
  }

  static sendSms(smsData: Omit<SmsNotification, 'id' | 'timestamp' | 'status'>) {
    const newSms: SmsNotification = {
      ...smsData,
      id: `sms-log-${Math.floor(Math.random() * 900000) + 100000}`,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Save to LocalDatabase
    LocalDatabase.addSmsNotification(newSms);

    // Call any registered visual listener in App.tsx (e.g. to show an animated phone SMS popup)
    this.onSmsSentCallbacks.forEach(cb => {
      try {
        cb(newSms);
      } catch (e) {
        console.error('Error executing SMS sent callback:', e);
      }
    });

    // Console logging for verification
    console.log(
      `%c[SMS GATEWAY OUTBOX] %cSent to ${newSms.receiverName} (${newSms.receiverPhone}) [%c${newSms.receiverRole.toUpperCase()}%c]:\n"${newSms.message}"`,
      'color: #06b6d4; font-weight: bold;',
      'color: inherit;',
      'color: #f43f5e; font-weight: bold;',
      'color: inherit;'
    );
  }

  /**
   * Find seller phone number by checking user profiles matching the store's ownerId
   */
  private static getSellerPhoneAndName(storeId: string): { phone: string; name: string } {
    const users = LocalDatabase.getUsers();
    const stores = LocalDatabase.getStores();
    const store = stores.find(s => s.id === storeId);
    
    if (store) {
      const owner = users.find(u => u.id === store.ownerId);
      if (owner) {
        return {
          phone: owner.phone || '+212611223344',
          name: owner.name
        };
      }
      return { phone: '+212611223344', name: `مالك متجر ${store.name}` };
    }
    return { phone: '+212600000000', name: 'التاجر' };
  }

  /**
   * Notify buyer and seller about order placement
   */
  static triggerOrderPlacementSms(order: Order) {
    // 1. Notify Buyer
    const buyerPhone = order.buyerPhone || '+212600000000';
    const buyerMsg = `MktMorocco SMS:
مرحباً ${order.buyerName}، تم استلام طلبك رقم (${order.id}) بنجاح من متجر "${order.storeName}".
💵 الإجمالي: ${order.total} درهم (طريقة الدفع: ${order.paymentMethod === 'card' ? '💳 بطاقة بنكية' : '💵 الدفع عند الاستلام'}).
سنقوم بالتواصل معك قريباً لتأكيد الشحن والتوصيل. شكراً لك !
---
Merci ${order.buyerName}, votre commande (${order.id}) de ${order.total} DH chez "${order.storeName}" a été enregistrée. Mode de paiement: ${order.paymentMethod === 'card' ? 'Carte Bancaire' : 'Cash on Delivery'}.`;

    this.sendSms({
      sender: 'MAROC_MKT',
      receiverPhone: buyerPhone,
      receiverName: order.buyerName,
      receiverRole: 'buyer',
      message: buyerMsg,
      orderId: order.id
    });

    // 2. Notify Seller
    const sellerInfo = this.getSellerPhoneAndName(order.storeId);
    const sellerMsg = `MktMorocco SMS:
رائع ! تم تسجيل طلب جديد رقم (${order.id}) بقيمة ${order.total} درهم لمتجركم "${order.storeName}".
الزبون: ${order.buyerName} (${order.buyerCity}).
يرجى الدخول إلى لوحة التحكم الخاصة بكم لتأكيد وتجهيز الطلب في أقرب وقت.
---
Succès ! Nouvelle commande (${order.id}) de ${order.total} DH enregistrée pour votre boutique "${order.storeName}". Client: ${order.buyerName} (${order.buyerCity}).`;

    this.sendSms({
      sender: 'MktMorocco_Store',
      receiverPhone: sellerInfo.phone,
      receiverName: sellerInfo.name,
      receiverRole: 'seller',
      message: sellerMsg,
      orderId: order.id
    });
  }

  /**
   * Notify buyer about order status updates
   */
  static triggerOrderStatusUpdateSms(order: Order, status: string, note?: string) {
    const buyerPhone = order.buyerPhone || '+212600000000';
    let arStatusStr = '';
    let frStatusStr = '';

    switch (status) {
      case 'confirmed':
        arStatusStr = `تمت الموافقة وتأكيد طلبك رقم (${order.id}) وهو قيد التجهيز والتغليف الآن.`;
        frStatusStr = `Votre commande (${order.id}) a été confirmée et est en cours de préparation.`;
        break;
      case 'shipped':
        arStatusStr = `خبر سار ! تم شحن طلبك رقم (${order.id}) من طرف متجر "${order.storeName}" وهو الآن في الطريق إليك مع موزعنا.`;
        frStatusStr = `Bonne nouvelle ! Votre commande (${order.id}) a été expédiée et est en cours de livraison.`;
        break;
      case 'delivered':
        arStatusStr = `✓ تم تسليم طلبك رقم (${order.id}) بنجاح وتلقي المبلغ. شكراً جزيلاً لثقتك بمتجر "${order.storeName}" !`;
        frStatusStr = `✓ Votre commande (${order.id}) a été livrée avec succès. Merci pour votre confiance !`;
        break;
      case 'cancelled':
        arStatusStr = `تنبيه: تم إلغاء طلبك رقم (${order.id}) من طرف المتجر. ${note ? `السبب: ${note}` : ''}`;
        frStatusStr = `Alerte: Votre commande (${order.id}) a été annulée par la boutique. ${note ? `Raison: ${note}` : ''}`;
        break;
      case 'refunded':
        arStatusStr = `تمت معالجة استرجاع أموال طلبك رقم (${order.id}) بنجاح.`;
        frStatusStr = `Le remboursement de votre commande (${order.id}) a été effectué avec succès.`;
        break;
      default:
        arStatusStr = `تم تحديث حالة طلبك رقم (${order.id}) إلى: ${status}.`;
        frStatusStr = `Le statut de votre commande (${order.id}) a été mis à jour: ${status}.`;
    }

    const message = `MktMorocco SMS:
مرحباً ${order.buyerName}،
${arStatusStr}
${note ? `📝 ملاحظة: ${note}` : ''}
---
Bonjour ${order.buyerName},
${frStatusStr}`;

    this.sendSms({
      sender: 'MAROC_MKT',
      receiverPhone: buyerPhone,
      receiverName: order.buyerName,
      receiverRole: 'buyer',
      message: message,
      orderId: order.id
    });
  }
}
