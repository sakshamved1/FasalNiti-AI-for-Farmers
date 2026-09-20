const { isInMemory, memoryStore } = require('../utils/db');
const { sendOrderStatusNotification } = require('../services/notificationService');

/**
 * GET /api/orders
 * Fetches real active orders with live tracking timeline
 */
const getOrders = async (req, res) => {
  try {
    if (isInMemory()) {
      let orders = [...(memoryStore.orders || [])];
      return res.json({ success: true, count: orders.length, orders });
    }

    const Order = require('../models/Order');
    let query = {};

    // Filter by user if logged in
    if (req.user && req.user.role === 'FARMER') {
      query.$or = [{ farmerId: req.user._id }, { farmerName: req.user.name }];
    } else if (req.user && req.user.role === 'BUYER') {
      query.$or = [{ buyerId: req.user._id }, { buyerName: req.user.name }];
    }

    const orders = await Order.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/orders/:id
 * Fetches single order with full tracking history
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInMemory()) {
      const order = (memoryStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    }

    const Order = require('../models/Order');
    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/orders/:id/stage
 * Advances live tracking stage (e.g. DEAL_CONFIRMED -> TRANSPORT_DISPATCHED -> DELIVERED_WEIGHED -> PAYMENT_RELEASED -> COMPLETED)
 */
const updateOrderStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, note, location } = req.body;

    const validStages = [
      'HARVEST_READY',
      'PRICE_CHECKED',
      'AI_RECOMMENDED',
      'BUYER_MATCHED',
      'DEAL_CONFIRMED',
      'TRANSPORT_DISPATCHED',
      'DELIVERED_WEIGHED',
      'PAYMENT_RELEASED',
      'COMPLETED'
    ];

    if (!validStages.includes(stage)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid stage: ${stage}. Valid stages are: ${validStages.join(', ')}` 
      });
    }

    const actor = req.user ? {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    } : {
      name: 'Authorized Logistics Partner',
      role: 'LOGISTICS'
    };

    if (isInMemory()) {
      const order = (memoryStore.orders || []).find(o => o._id === id || o.orderNumber === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.stage = stage;
      if (location) order.currentLocation = location;
      if (stage === 'PAYMENT_RELEASED') order.paymentStatus = 'Paid to Farmer';

      if (!order.timeline) order.timeline = [];
      order.timeline.push({
        stage,
        note: note || `Order advanced to ${stage}`,
        location: location || order.currentLocation,
        updatedBy: actor,
        timestamp: new Date()
      });
      order.updatedAt = new Date();

      const notifResult = await sendOrderStatusNotification({
        order,
        updatedBy: actor,
        newStage: stage,
        note,
        io: req.app.get('io')
      });

      return res.json({ 
        success: true, 
        message: `Live tracking updated: ${stage}`, 
        order,
        notification: notifResult
      });
    }

    const Order = require('../models/Order');
    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.stage = stage;
    if (location) order.currentLocation = location;
    if (stage === 'PAYMENT_RELEASED') order.paymentStatus = 'Paid to Farmer';

    order.timeline.push({
      stage,
      note: note || `Order stage updated to ${stage}`,
      location: location || order.currentLocation,
      updatedBy: actor,
      timestamp: new Date()
    });

    await order.save();

    const notifResult = await sendOrderStatusNotification({
      order,
      updatedBy: actor,
      newStage: stage,
      note,
      io: req.app.get('io')
    });

    res.json({ 
      success: true, 
      message: `Live tracking milestone updated: ${stage}`, 
      order,
      notification: notifResult
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStage
};
