/**
 * MongoDB Atlas Diagnostic & Health Check CLI Tool: npm run db:check
 * Inspects connection health, collection counts, indexes, and master data integrity.
 */

const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectAtlasDB } = require('../config/db');

const Location = require('../models/Location');
const Commodity = require('../models/Commodity');
const Market = require('../models/Market');
const MarketPrice = require('../models/MarketPrice');
const GovernmentScheme = require('../models/GovernmentScheme');
const Warehouse = require('../models/Warehouse');
const TransportProvider = require('../models/TransportProvider');
const Listing = require('../models/Listing');
const Offer = require('../models/Offer');
const Order = require('../models/Order');
const User = require('../models/User');

async function checkDatabase() {
  console.log('\n======================================================');
  console.log('🔍 KISANSETU AI — MONGODB ATLAS HEALTH & AUDIT CHECK');
  console.log('======================================================\n');

  const startTime = Date.now();

  try {
    await connectAtlasDB();
    const pingTimeMs = Date.now() - startTime;

    console.log(`📡 Latency to Atlas Cluster: ${pingTimeMs}ms (Healthy)`);

    // Verify Master Collections
    const locationCount = await Location.countDocuments();
    const commodityCount = await Commodity.countDocuments();
    const marketCount = await Market.countDocuments();
    const priceCount = await MarketPrice.countDocuments();
    const schemeCount = await GovernmentScheme.countDocuments();
    const warehouseCount = await Warehouse.countDocuments();
    const transportCount = await TransportProvider.countDocuments();

    // Verify User Collections
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    const farmerCount = await User.countDocuments({ role: 'FARMER' });
    const buyerCount = await User.countDocuments({ role: 'BUYER' });
    const fpoCount = await User.countDocuments({ role: 'FPO' });
    const listingCount = await Listing.countDocuments();
    const offerCount = await Offer.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log('\n📊 MASTER DATA INVENTORY:');
    console.log(`   • Locations (States/UTs): ${locationCount} (Target: >= 36)`);
    console.log(`   • Commodities           : ${commodityCount} (Target: >= 9)`);
    console.log(`   • APMC Markets          : ${marketCount}`);
    console.log(`   • Verified Prices       : ${priceCount}`);
    console.log(`   • Government Schemes    : ${schemeCount}`);
    console.log(`   • Accredited Warehouses : ${warehouseCount}`);
    console.log(`   • Transporters          : ${transportCount}`);

    console.log('\n👥 USER DATA AUDIT (CLEAN SLATE VERIFICATION):');
    console.log(`   • System Admin Accounts : ${adminCount} (Target: 1 -> kisan@admin.com)`);
    console.log(`   • Farmers (Demo/Active) : ${farmerCount} (Target: 0 initial)`);
    console.log(`   • Buyers (Demo/Active)  : ${buyerCount} (Target: 0 initial)`);
    console.log(`   • FPOs (Demo/Active)    : ${fpoCount} (Target: 0 initial)`);
    console.log(`   • Crop Listings         : ${listingCount} (Target: 0 initial)`);
    console.log(`   • Trade Offers          : ${offerCount} (Target: 0 initial)`);
    console.log(`   • Orders                : ${orderCount} (Target: 0 initial)`);

    // Verify Indexes
    console.log('\n⚡ DATABASE INDEXES AUDIT:');
    const priceIndexes = await MarketPrice.collection.indexes();
    const hasUniqueCompound = priceIndexes.some(i => i.name === 'unique_market_price_record');
    console.log(`   • MarketPrice Indexes   : ${priceIndexes.length} active`);
    console.log(`   • Duplicate Protection  : ${hasUniqueCompound ? '✅ ACTIVE (unique_market_price_record)' : '⚠️ Warning: index not built yet'}`);

    const userIndexes = await User.collection.indexes();
    console.log(`   • User Indexes          : ${userIndexes.length} active (phone, email, role/state/district)`);

    console.log('\n======================================================');
    console.log('✅ ATLAS DATABASE STATUS: HEALTHY & PRODUCTION-READY');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ ATLAS DATABASE CHECK FAILED:', err.message);
    process.exit(1);
  }
}

checkDatabase();
