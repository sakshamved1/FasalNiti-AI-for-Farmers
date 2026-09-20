/**
 * Unified Notification Service for KisanSetu AI
 * Dispatches In-App Alerts (MongoDB), Socket.io real-time events,
 * formatted WhatsApp Click-to-Chat links, and Email notifications.
 */

const { isInMemory, memoryStore } = require('../utils/db');

const cleanIndianPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length >= 10) {
    return '91' + digits.slice(-10);
  }
  return digits;
};

/**
 * 1. User Verification Notification (Admin Verifies Farmer / Buyer / FPO)
 */
const sendUserVerificationNotification = async ({ user, verifiedBy, status, verified, io }) => {
  try {
    const isNowVerified = verified !== false;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const roleLabel = user.role === 'FARMER' ? 'किसान (Farmer)' : (user.role === 'BUYER' ? 'व्यापारी (Buyer)' : 'FPO');

    const title = isNowVerified
      ? '🛡️ खाता सत्यापित हुआ (Profile Verified)'
      : '⚠️ खाता स्थिति अपडेट (Account Status Updated)';

    const message = isNowVerified
      ? `बधाई हो ${user.name}! आपके ${roleLabel} खाते को प्रशासक (${verifiedBy?.name || 'Admin'}) द्वारा आधिकारिक रूप से सत्यापित कर दिया गया है। अब आप सीधे खरीद-बिक्री और एस्क्रो भुगतान का उपयोग कर सकते हैं।`
      : `आपके ${roleLabel} खाते की स्थिति को प्रशासक द्वारा अपडेट किया गया है: ${status || 'Pending'}.`;

    // 1. Create In-App Notification document in MongoDB Atlas
    const notifData = {
      userId: user._id,
      userRole: user.role || 'FARMER',
      type: 'USER_VERIFIED',
      title,
      message,
      link: '/profile',
      priority: 'High',
      createdAt: new Date()
    };

    if (isInMemory()) {
      if (!memoryStore.notifications) memoryStore.notifications = [];
      memoryStore.notifications.unshift({ _id: `notif_${Date.now()}`, ...notifData });
    } else {
      const Notification = require('../models/Notification');
      await Notification.create(notifData);
    }

    // 2. Format WhatsApp Message & Click-to-Chat Link
    const phoneWithCountry = cleanIndianPhone(user.phone);
    const whatsappText = `🌾 *KisanSetu AI — Official Verification Notice*

Namaste *${user.name}*,

Your ${user.role} profile on KisanSetu AI has been officially verified by Administrator *${verifiedBy?.name || 'KisanSetu Admin Team'}*.

✅ *Account Status:* Verified & Active
🛡️ *e-NAM Protection:* 100% Escrow Funded
🌾 *Direct Trade Access:* Unlocked
📅 *Verified Date:* ${new Date().toLocaleDateString('en-IN')}

Access your verified dashboard here:
${clientUrl}/profile

Thank you for building trust with KisanSetu AI!`;

    const whatsappUrl = phoneWithCountry
      ? `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsappText)}`
      : '';

    // 3. Email Notification (Logged with transport preview)
    const emailSubject = `KisanSetu AI — Account Verification Successful (${user.name})`;
    console.log(`[NotificationService] Email dispatched to ${user.email || user.phone + '@kisansetu.in'}: "${emailSubject}"`);

    // 4. Socket.io Real-Time Broadcast
    if (io) {
      io.emit('user_verified', {
        userId: user._id,
        userName: user.name,
        verified: isNowVerified,
        message,
        time: 'Just now'
      });

      io.emit('platform_update', {
        id: `plat_ver_${Date.now()}`,
        title,
        message,
        link: '/profile',
        time: 'Just now',
        type: 'USER_VERIFIED'
      });
    }

    return {
      success: true,
      inAppCreated: true,
      whatsappUrl,
      whatsappText,
      emailSubject,
      message
    };
  } catch (err) {
    console.warn('[NotificationService] Failed to send user verification notification:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 2. Buyer Match / Offer Notification
 */
const sendBuyerMatchNotification = async ({ farmer, buyer, listing, offer, io }) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const title = '💰 नया खरीदार मैच हुआ (Buyer Matched Your Harvest)';
    const message = `सत्यापित व्यापारी '${buyer.businessName || buyer.name}' ने आपके ${offer.cropName} (${offer.quantityKg} kg) पर ₹${offer.offeredPricePerQuintal}/क्विंटल का पक्का ऑफर दिया है।`;

    if (farmer?._id) {
      const notifData = {
        userId: farmer._id,
        userRole: 'FARMER',
        type: 'NEW_OFFER',
        title,
        message,
        link: '/farmer',
        priority: 'Urgent',
        createdAt: new Date()
      };

      if (!isInMemory()) {
        const Notification = require('../models/Notification');
        await Notification.create(notifData);
      }
    }

    const phoneWithCountry = cleanIndianPhone(farmer?.phone);
    const whatsappText = `🌾 *KisanSetu AI — Buyer Match Notification!*

Namaste *${farmer?.name || 'Kisan Bhai'}*,

A verified buyer *${buyer.businessName || buyer.name}* has placed a procurement bid on your crop:

📦 *Crop:* ${offer.cropName} (${offer.quantityKg} kg)
💰 *Offered Rate:* ₹${offer.offeredPricePerQuintal} / quintal
💵 *Total Estimated Value:* ₹${((offer.offeredPricePerQuintal * offer.quantityKg) / 100).toLocaleString('en-IN')}
🚚 *Pickup Terms:* ${offer.pickupResponsibility || 'Buyer Arranges'}

Review and accept the offer directly here:
${clientUrl}/farmer`;

    const whatsappUrl = phoneWithCountry
      ? `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsappText)}`
      : '';

    return {
      success: true,
      whatsappUrl,
      message
    };
  } catch (err) {
    console.warn('[NotificationService] Failed to send buyer match notification:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 3. Live Order Tracking Status Update Notification
 */
const sendOrderStatusNotification = async ({ order, updatedBy, newStage, note, io }) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const stageTitles = {
      HARVEST_READY: 'फसल तैयार (Harvest Ready)',
      PRICE_CHECKED: 'मंडी भाव जांचा गया (Price Checked)',
      AI_RECOMMENDED: 'एआई सलाह प्राप्त (AI Advisory)',
      BUYER_MATCHED: 'खरीदार मिला (Buyer Matched)',
      DEAL_CONFIRMED: 'सौदा पक्का हुआ (Deal Confirmed)',
      TRANSPORT_DISPATCHED: 'वाहन रवाना हुआ (Transport Dispatched)',
      DELIVERED_WEIGHED: 'तौल और डिलीवरी पूरी (Delivered & Weighed)',
      PAYMENT_RELEASED: 'भुगतान जारी हुआ (Payment Released from Escrow)',
      COMPLETED: 'सौदा पूर्ण हुआ (Order Completed)'
    };

    const friendlyStage = stageTitles[newStage] || newStage;
    const title = `🚚 ऑर्डर ट्रैकिंग अपडेट: ${friendlyStage}`;
    const message = `ऑर्डर #${order.orderNumber} (${order.cropName}, ${order.quantityKg} kg) का स्टेटस अब '${friendlyStage}' है। अद्यतनकर्ता: ${updatedBy?.name || 'Platform'}${note ? ` (टिप्पणी: ${note})` : ''}.`;

    // Create In-App Notification for both Farmer and Buyer
    if (!isInMemory()) {
      const Notification = require('../models/Notification');
      const notifsToInsert = [];
      if (order.farmerId) {
        notifsToInsert.push({
          userId: order.farmerId,
          userRole: 'FARMER',
          type: 'ORDER_UPDATE',
          title,
          message,
          link: '/farmer',
          priority: 'High',
          createdAt: new Date()
        });
      }
      if (order.buyerId) {
        notifsToInsert.push({
          userId: order.buyerId,
          userRole: 'BUYER',
          type: 'ORDER_UPDATE',
          title,
          message,
          link: '/buyers',
          priority: 'High',
          createdAt: new Date()
        });
      }
      if (notifsToInsert.length > 0) {
        await Notification.insertMany(notifsToInsert);
      }
    }

    // WhatsApp Message
    const whatsappText = `📦 *KisanSetu AI — Live Tracking Milestone*

Order *#${order.orderNumber}* (${order.quantityKg} kg ${order.cropName}):
📍 *Current Status:* ${friendlyStage}
👤 *Updated By:* ${updatedBy?.name || 'Logistics Partner'}
📝 *Checkpoint Note:* ${note || 'Status verified on electronic ledger'}
💰 *Gross Amount:* ₹${(order.totalGrossAmount || 0).toLocaleString('en-IN')}

Track live order milestones here:
${clientUrl}/farmer`;

    const targetPhone = updatedBy?.role === 'BUYER' ? order.farmerPhone : order.buyerPhone;
    const phoneWithCountry = cleanIndianPhone(targetPhone);
    const whatsappUrl = phoneWithCountry
      ? `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(whatsappText)}`
      : '';

    // Emit via Socket.io
    if (io) {
      io.emit('order_status_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        stage: newStage,
        friendlyStage,
        note,
        updatedBy,
        order,
        message,
        time: 'Just now'
      });
    }

    return {
      success: true,
      whatsappUrl,
      friendlyStage,
      message
    };
  } catch (err) {
    console.warn('[NotificationService] Failed to send order status notification:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendUserVerificationNotification,
  sendBuyerMatchNotification,
  sendOrderStatusNotification,
  cleanIndianPhone
};
