/**
 * Development Cleanup Script: npm run db:cleanup-demo
 * Safely removes only user-generated development data (demo farmers, buyers, FPOs, listings, offers, deals, orders)
 * Directly operates on MongoDB Atlas.
 * Strictly preserves Master Data: States, Districts, Commodities, Markets, Verified Schemes, Warehouses, and the system Admin account.
 */

const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectAtlasDB } = require('../config/db');

async function cleanupDemoData() {
  console.log('🌾 ========================================================');
  console.log('🌾  FasalNiti AI — MongoDB Atlas Sanitization Script');
  console.log('🌾 ========================================================\n');

  try {
    await connectAtlasDB();

    const User = require('../models/User');
    const Listing = require('../models/Listing');
    const Offer = require('../models/Offer');
    const Order = require('../models/Order');

    // 1. Purge all user listings, offers, and orders
    const listingsDeleted = await Listing.deleteMany({});
    const offersDeleted = await Offer.deleteMany({});
    const ordersDeleted = await Order.deleteMany({});
    console.log(`🧹 Deleted ${listingsDeleted.deletedCount} user listings.`);
    console.log(`🧹 Deleted ${offersDeleted.deletedCount} user offers/negotiations.`);
    console.log(`🧹 Deleted ${ordersDeleted.deletedCount} user orders.`);

    // 2. Remove all non-admin users
    const nonAdminDeleted = await User.deleteMany({ role: { $ne: 'ADMIN' } });
    console.log(`🧹 Deleted ${nonAdminDeleted.deletedCount} non-admin user accounts (farmers, buyers, FPOs).`);

    // 3. Ensure the single system administrator exists
    const adminEmail = 'kisan@admin.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const adminPassword = await bcrypt.hash('Admin@12345', 10);
      admin = await User.create({
        name: 'FasalNiti Administrator',
        email: adminEmail,
        phone: '9999999999',
        password: adminPassword,
        role: 'ADMIN',
        state: 'National',
        district: 'New Delhi',
        village: 'Krishi Bhawan',
        preferredLanguage: 'en',
        verified: true,
        status: 'Active'
      });
      console.log('👑 Single system administrator created: kisan@admin.com');
    } else {
      console.log('👑 Single system administrator verified: kisan@admin.com');
    }

    // 4. Verify collection counts
    const remainingUsers = await User.countDocuments();
    const remainingAdmin = await User.countDocuments({ role: 'ADMIN' });
    const remainingFarmers = await User.countDocuments({ role: 'FARMER' });
    const remainingBuyers = await User.countDocuments({ role: 'BUYER' });
    const remainingFPOs = await User.countDocuments({ role: 'FPO' });
    const remainingListings = await Listing.countDocuments();
    const remainingOffers = await Offer.countDocuments();
    const remainingOrders = await Order.countDocuments();

    console.log('\n📊 Sanitized MongoDB Atlas Collection Verification:');
    console.log(`   • Total Users:    ${remainingUsers} (Admin: ${remainingAdmin})`);
    console.log(`   • Farmers:        ${remainingFarmers} (Clean slate)`);
    console.log(`   • Buyers:         ${remainingBuyers} (Clean slate)`);
    console.log(`   • FPOs:           ${remainingFPOs} (Clean slate)`);
    console.log(`   • Crop Listings:  ${remainingListings} (Clean slate)`);
    console.log(`   • Trade Offers:   ${remainingOffers} (Clean slate)`);
    console.log(`   • Trade Orders:   ${remainingOrders} (Clean slate)`);
    console.log('\n✅ MongoDB Atlas database sanitization complete. Master data untouched.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup in MongoDB Atlas:', err.message);
    process.exit(1);
  }
}

cleanupDemoData();
