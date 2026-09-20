/**
 * APMC Mandi Synchronization Script: npm run db:sync-markets
 * Verifies and synchronizes official APMC reference mandis in MongoDB Atlas.
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectAtlasDB } = require('../config/db');
const { getSeedData } = require('../data/seedData');
const Market = require('../models/Market');

async function syncMarkets() {
  console.log('🏛️ Connecting to MongoDB Atlas to sync APMC Mandis...');
  try {
    await connectAtlasDB();
    const seed = await getSeedData();

    let updated = 0;
    let inserted = 0;

    for (const mkt of seed.markets) {
      const result = await Market.findOneAndUpdate(
        { code: mkt.code },
        {
          ...mkt,
          market: mkt.name,
          marketCode: mkt.code
        },
        { upsert: true, new: true, rawResult: true }
      );

      if (result.lastErrorObject?.updatedExisting) {
        updated++;
      } else {
        inserted++;
      }
    }

    const total = await Market.countDocuments();
    console.log(`✅ APMC Mandis synced successfully: ${inserted} added, ${updated} updated. Total in Atlas: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to sync APMC Mandis:', err.message);
    process.exit(1);
  }
}

syncMarkets();
