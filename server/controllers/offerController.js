const { isInMemory, memoryStore } = require('../utils/db');
const { sendBuyerMatchNotification } = require('../services/notificationService');

// GET /api/offers or GET /api/offers/listing/:listingId
const getOffers = async (req, res) => {
  try {
    const listingId = req.query.listingId || req.params.listingId;

    if (isInMemory()) {
      let offers = [...memoryStore.offers];
      if (listingId) offers = offers.filter(o => o.listingId === listingId);
      return res.json({ success: true, count: offers.length, offers });
    }

    const Offer = require('../models/Offer');
    const query = {};
    if (listingId) query.listingId = listingId;

    const offers = await Offer.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: offers.length, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/offers (Buyer places initial offer)
const createOffer = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('../models/User');
    const Listing = require('../models/Listing');

    const {
      listingId,
      cropName = 'Soybean',
      quantityKg = 500,
      offeredPricePerQuintal,
      paymentTerms = 'Escrow on delivery / Same day UPI',
      pickupResponsibility = 'Buyer Arranges'
    } = req.body;

    if (!offeredPricePerQuintal) {
      return res.status(400).json({ success: false, message: 'Offered price is required.' });
    }

    let buyerName = req.user?.name || req.body.buyerName;
    let buyerBusiness = req.user?.buyerDetails?.businessName || req.body.buyerBusiness;
    let buyerTrustScore = req.user?.buyerDetails?.trustScore || 92;
    let buyerId = req.user?._id;

    if (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId)) {
      const defaultBuyer = await User.findOne({ role: 'BUYER' }) || await User.findOne();
      buyerId = defaultBuyer?._id || new mongoose.Types.ObjectId();
      if (!buyerName) buyerName = defaultBuyer?.name || 'Verified Agribusiness Buyer';
      if (!buyerBusiness) buyerBusiness = defaultBuyer?.buyerDetails?.businessName || 'AgroProcure Enterprise';
    }

    let validListingId = listingId;
    if (!validListingId || !mongoose.Types.ObjectId.isValid(validListingId)) {
      const existingListing = await Listing.findOne({ cropName: new RegExp(cropName, 'i') }) || await Listing.findOne();
      if (existingListing) {
        validListingId = existingListing._id;
      } else {
        validListingId = new mongoose.Types.ObjectId();
      }
    }

    const offerData = {
      listingId: validListingId,
      cropName,
      quantityKg: Number(quantityKg) || 500,
      buyerId,
      buyerName: buyerName || 'Verified Institutional Buyer',
      buyerBusiness: buyerBusiness || 'National Mandi Buyer',
      buyerTrustScore,
      offeredPricePerQuintal: Number(offeredPricePerQuintal),
      status: 'Pending',
      paymentTerms,
      pickupResponsibility,
      timeline: [
        {
          actor: 'BUYER',
          action: `Offered ₹${offeredPricePerQuintal} / quintal`,
          pricePerQuintal: Number(offeredPricePerQuintal),
          timestamp: new Date()
        }
      ]
    };

    let createdOffer;
    if (isInMemory()) {
      createdOffer = {
        _id: `off_${Date.now()}`,
        ...offerData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.offers.unshift(createdOffer);
    } else {
      const Offer = require('../models/Offer');
      createdOffer = await Offer.create(offerData);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('offer_received', {
        message: `New offer of ₹${offeredPricePerQuintal}/qtl received from ${buyerBusiness}`,
        offer: createdOffer
      });
    }

    // Dispatch in-app, email, and WhatsApp notifications to farmer
    try {
      const Listing = require('../models/Listing');
      const User = require('../models/User');
      const listing = await Listing.findById(listingId);
      if (listing) {
        const farmer = await User.findById(listing.farmerId);
        await sendBuyerMatchNotification({
          farmer: farmer || { name: listing.farmerName, phone: listing.farmerPhone },
          buyer: req.user,
          listing,
          offer: createdOffer,
          io
        });
      }
    } catch (e) {
      console.warn('Could not dispatch buyer match notification:', e.message);
    }

    res.status(201).json({ success: true, offer: createdOffer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/offers/:id/counter (Farmer or Buyer counter-offers)
const counterOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { counterPrice, actor = 'FARMER' } = req.body;

    const price = Number(counterPrice);
    let updatedOffer;

    if (isInMemory()) {
      const offer = memoryStore.offers.find(o => o._id === id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

      offer.status = actor === 'FARMER' ? 'Farmer Countered' : 'Buyer Countered';
      if (actor === 'FARMER') offer.farmerCounterPrice = price;
      else offer.offeredPricePerQuintal = price;

      offer.timeline.push({
        actor,
        action: `${actor === 'FARMER' ? 'Farmer' : 'Buyer'} counter-offered ₹${price}/quintal`,
        pricePerQuintal: price,
        timestamp: new Date()
      });
      offer.updatedAt = new Date();
      updatedOffer = offer;
    } else {
      const Offer = require('../models/Offer');
      const offer = await Offer.findById(id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

      offer.status = actor === 'FARMER' ? 'Farmer Countered' : 'Buyer Countered';
      if (actor === 'FARMER') offer.farmerCounterPrice = price;
      else offer.offeredPricePerQuintal = price;

      offer.timeline.push({
        actor,
        action: `${actor === 'FARMER' ? 'Farmer' : 'Buyer'} counter-offered ₹${price}/quintal`,
        pricePerQuintal: price,
        timestamp: new Date()
      });
      await offer.save();
      updatedOffer = offer;
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('offer_updated', {
        message: `${actor === 'FARMER' ? 'Farmer' : 'Buyer'} counter-offered ₹${price}/quintal`,
        offer: updatedOffer
      });
    }

    res.json({ success: true, offer: updatedOffer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/offers/:id/accept (Accepts offer and creates Order with Harvest Journey)
const acceptOffer = async (req, res) => {
  try {
    const { id } = req.params;
    let acceptedOffer;

    if (isInMemory()) {
      const offer = memoryStore.offers.find(o => o._id === id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

      const finalPrice = offer.farmerCounterPrice || offer.offeredPricePerQuintal;
      offer.status = 'Accepted';
      offer.finalAgreedPrice = finalPrice;
      offer.timeline.push({
        actor: 'SYSTEM',
        action: `Deal Confirmed at ₹${finalPrice} / quintal! Order created.`,
        pricePerQuintal: finalPrice,
        timestamp: new Date()
      });
      acceptedOffer = offer;

      // Create Order
      const matchedListing = memoryStore.listings.find(l => l._id === offer.listingId);
      const farmerName = matchedListing?.farmerName || (req.user ? req.user.name : 'Farmer');
      const qtyQuintals = offer.quantityKg / 100;
      const grossAmount = finalPrice * qtyQuintals;
      const order = {
        _id: `ord_${Date.now()}`,
        orderNumber: `ORD-KS-${Math.floor(100000 + Math.random() * 900000)}`,
        listingId: offer.listingId,
        offerId: offer._id,
        cropName: offer.cropName,
        quantityKg: offer.quantityKg,
        quantityQuintals: qtyQuintals,
        pricePerQuintal: finalPrice,
        totalGrossAmount: grossAmount,
        transportCost: 0,
        platformFee: 0,
        netFarmerPayout: grossAmount,
        farmerName,
        buyerName: offer.buyerName,
        buyerBusiness: offer.buyerBusiness,
        stage: 'DEAL_CONFIRMED',
        paymentStatus: 'Escrow Funded',
        createdAt: new Date()
      };
      memoryStore.orders.unshift(order);

      const io = req.app.get('io');
      if (io) {
        io.emit('deal_confirmed', {
          message: `🎉 Deal Confirmed! ${offer.quantityKg} kg ${offer.cropName} sold at ₹${finalPrice}/qtl.`,
          offer: acceptedOffer,
          order
        });
      }

      return res.json({ success: true, offer: acceptedOffer, order });
    }

    const Offer = require('../models/Offer');
    const Order = require('../models/Order');
    const Listing = require('../models/Listing');

    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

    const matchedListing = await Listing.findById(offer.listingId);
    const farmerName = matchedListing?.farmerName || (req.user ? req.user.name : 'Farmer');

    const finalPrice = offer.farmerCounterPrice || offer.offeredPricePerQuintal;
    offer.status = 'Accepted';
    offer.finalAgreedPrice = finalPrice;
    offer.timeline.push({
      actor: 'SYSTEM',
      action: `Deal Confirmed at ₹${finalPrice} / quintal! Order created.`,
      pricePerQuintal: finalPrice,
      timestamp: new Date()
    });
    await offer.save();

    const qtyQuintals = offer.quantityKg / 100;
    const grossAmount = finalPrice * qtyQuintals;
    const order = await Order.create({
      orderNumber: `ORD-KS-${Math.floor(100000 + Math.random() * 900000)}`,
      listingId: offer.listingId,
      offerId: offer._id,
      cropName: offer.cropName,
      quantityKg: offer.quantityKg,
      quantityQuintals: qtyQuintals,
      pricePerQuintal: finalPrice,
      totalGrossAmount: grossAmount,
      transportCost: 0,
      platformFee: 0,
      netFarmerPayout: grossAmount,
      farmerName,
      buyerName: offer.buyerName,
      buyerBusiness: offer.buyerBusiness,
      stage: 'DEAL_CONFIRMED',
      paymentStatus: 'Escrow Funded',
      timeline: [
        {
          stage: 'DEAL_CONFIRMED',
          title: 'सौदा पक्का (Deal Confirmed)',
          note: `Price agreed at ₹${finalPrice}/quintal. Escrow funded.`,
          updatedBy: { name: 'System Escrow', role: 'SYSTEM' },
          timestamp: new Date()
        }
      ]
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('deal_confirmed', {
        message: `🎉 Deal Confirmed! ${offer.quantityKg} kg ${offer.cropName} sold at ₹${finalPrice}/qtl.`,
        offer,
        order
      });
    }

    res.json({ success: true, offer, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders (Track Harvest Journey)
const getOrders = async (req, res) => {
  try {
    if (isInMemory()) {
      return res.json({ success: true, count: memoryStore.orders.length, orders: memoryStore.orders });
    }
    const Order = require('../models/Order');
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOffers,
  createOffer,
  counterOffer,
  acceptOffer,
  getOrders
};
