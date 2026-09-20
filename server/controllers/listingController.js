const mongoose = require('mongoose');
const { isInMemory, memoryStore } = require('../utils/db');

// GET /api/listings
const getListings = async (req, res) => {
  try {
    const { crop, district, status } = req.query;

    if (isInMemory()) {
      let listings = [...memoryStore.listings];
      if (crop) listings = listings.filter(l => l.cropName.toLowerCase().includes(crop.toLowerCase()));
      if (district) listings = listings.filter(l => l.location?.district?.toLowerCase() === district.toLowerCase());
      if (status) listings = listings.filter(l => l.status === status);

      return res.json({ success: true, count: listings.length, listings });
    }

    const Listing = require('../models/Listing');
    const query = {};
    if (crop) query.cropName = new RegExp(crop, 'i');
    if (district) query['location.district'] = district;
    if (status) query.status = status;

    const listings = await Listing.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/listings/:id
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInMemory()) {
      const listing = memoryStore.listings.find(l => l._id === id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
      return res.json({ success: true, listing });
    }

    const Listing = require('../models/Listing');
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/listings
const createListing = async (req, res) => {
  try {
    const {
      cropName,
      variety = 'Standard',
      quantityKg,
      expectedPricePerQuintal,
      grade = 'Grade A',
      moisturePercent = 11.0,
      qualityConfidence = 88,
      location,
      description
    } = req.body;

    if (!cropName || !quantityKg || !expectedPricePerQuintal) {
      return res.status(400).json({ 
        success: false, 
        message: 'Crop name, quantity, and expected price are required.' 
      });
    }

    const farmerName = (req.user && req.user.name) || req.body.farmerName || 'Verified Farmer';
    const rawId = (req.user && (req.user._id || req.user.id)) || req.body.farmerId;
    const farmerId = rawId && mongoose.Types.ObjectId.isValid(rawId) ? rawId : null;
    const farmerPhone = (req.user && (req.user.phone || req.user.mobile)) || req.body.farmerPhone || '';
    const userLocation = location || (req.user && (req.user.profile?.location || req.user.location));

    const listingData = {
      ...(farmerId ? { farmerId } : {}),
      farmerName,
      farmerPhone,
      cropName,
      variety,
      quantityKg: Number(quantityKg),
      expectedPricePerQuintal: Number(expectedPricePerQuintal),
      grade,
      moisturePercent: Number(moisturePercent) || 11.0,
      qualityConfidence: Number(qualityConfidence) || 88,
      location: {
        state: userLocation?.state || 'Gujarat',
        district: userLocation?.district || 'Ahmedabad',
        village: userLocation?.village || '',
        lat: Number(userLocation?.latitude || userLocation?.lat) || 23.0225,
        lng: Number(userLocation?.longitude || userLocation?.lng) || 72.5714
      },
      status: 'Active',
      description: description || `Freshly harvested ${cropName}, graded ${grade}. Moisture ${moisturePercent}%. Ready for farmgate pickup or mandi dispatch.`
    };

    let createdListing;
    if (isInMemory()) {
      createdListing = {
        _id: `lst_${Date.now()}`,
        ...listingData,
        createdAt: new Date()
      };
      memoryStore.listings.unshift(createdListing);
    } else {
      const Listing = require('../models/Listing');
      createdListing = await Listing.create(listingData);
    }

    // Broadcast real-time event to connected buyers
    const io = req.app.get('io');
    if (io) {
      io.emit('new_listing', {
        message: `New crop listing: ${quantityKg} kg ${cropName} by ${farmerName}`,
        listing: createdListing
      });
    }

    res.status(201).json({ success: true, listing: createdListing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing
};
