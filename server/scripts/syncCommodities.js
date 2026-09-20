/**
 * Commodity Synchronization Script: npm run db:sync-commodities
 * Syncs standard agricultural commodities into MongoDB Atlas.
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectAtlasDB } = require('../config/db');
const Commodity = require('../models/Commodity');

const COMMODITY_CATALOG = [
  {
    name: 'Wheat',
    category: 'Cereals',
    aliases: ['Gehu', 'गेहूं', 'ઘઉં', 'गहू', 'ਕਣਕ', 'গম', 'கோதுமை', 'గోధుమ', 'ಗೋಧಿ'],
    standardGrade: 'FAQ Grade-A',
    unit: 'Quintal',
    mspPrice: 2275,
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    active: true
  },
  {
    name: 'Paddy (Dhan)',
    category: 'Cereals',
    aliases: ['Paddy', 'Dhan', 'धान', 'ડાંગર', 'भात', 'ਝੋਨਾ', 'ধান', 'நெல்', 'వరి', 'ಭತ್ತ'],
    standardGrade: 'Common / Grade-A',
    unit: 'Quintal',
    mspPrice: 2183,
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    active: true
  },
  {
    name: 'Soybean',
    category: 'Oilseeds',
    aliases: ['Soyabean', 'सोयाबीन', 'સોયાબીન', 'ਸੋਇਆਬੀਨ', 'সয়াবিন', 'சோயாபீன்', 'సోయాబీన్', 'ಸೋಯಾಬೀನ್'],
    standardGrade: 'Yellow FAQ',
    unit: 'Quintal',
    mspPrice: 4600,
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    active: true
  },
  {
    name: 'Cotton',
    category: 'Fibres',
    aliases: ['Kapas', 'कपास', 'કપાસ', 'कापूस', 'ਕਪਾਹ', 'তুলা', 'பருத்தி', 'పత్తి', 'ಹತ್ತಿ'],
    standardGrade: 'Medium / Long Staple',
    unit: 'Quintal',
    mspPrice: 7020,
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    active: true
  },
  {
    name: 'Gram (Chana)',
    category: 'Pulses',
    aliases: ['Chana', 'चना', 'ચણા', 'हरभरा', 'ਛੋਲੇ', 'ছোলা', 'கொண்டைக்கடலை', 'శనగలు', 'ಕಡಲೆ'],
    standardGrade: 'Desi / Kabuli FAQ',
    unit: 'Quintal',
    mspPrice: 5440,
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    active: true
  },
  {
    name: 'Mustard',
    category: 'Oilseeds',
    aliases: ['Sarson', 'Rai', 'सरसों', 'રાઈ', 'मोहरी', 'ਸਰ੍ਹੋਂ', 'সরিষা', 'கடுகு', 'ఆవాలు', 'ಸಾಸಿವೆ'],
    standardGrade: 'Standard 42% Oil Content',
    unit: 'Quintal',
    mspPrice: 5650,
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    active: true
  },
  {
    name: 'Maize',
    category: 'Cereals',
    aliases: ['Makka', 'मक्का', 'મકાઈ', 'मका', 'ਮੱਕੀ', 'ভুট্টা', 'மக்காச்சோளம்', 'మొక్కజొన్న', 'ಮೆಕ್ಕೆಜೋಳ'],
    standardGrade: 'Yellow Hybrid',
    unit: 'Quintal',
    mspPrice: 2090,
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    active: true
  },
  {
    name: 'Groundnut',
    category: 'Oilseeds',
    aliases: ['Moongphali', 'मूंगफली', 'મગફળી', 'भुईमूग', 'ਮੂੰਗਫਲੀ', 'চীনাবাদাম', 'வேர்க்கடலை', 'వేరుశనగ', 'ಕಡಲೆಕಾಯಿ'],
    standardGrade: 'Bold Pods FAQ',
    unit: 'Quintal',
    mspPrice: 6377,
    source: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
    active: true
  },
  {
    name: 'Onion',
    category: 'Vegetables',
    aliases: ['Pyaz', 'Kanda', 'प्याज', 'ડુંગળી', 'कांदा', 'ਗੰਢਾ', 'পেঁয়াজ', 'வெங்காயம்', 'ఉల్లిపాయ', 'ಈರುಳ್ಳಿ'],
    standardGrade: 'Medium Red / Nasik Quality',
    unit: 'Quintal',
    mspPrice: 0,
    source: 'National Horticultural Research & Development Foundation (NHRDF)',
    active: true
  }
];

async function syncCommodities() {
  console.log('🌾 Connecting to MongoDB Atlas to sync standard commodities...');
  try {
    await connectAtlasDB();

    for (const comm of COMMODITY_CATALOG) {
      await Commodity.findOneAndUpdate(
        { name: comm.name },
        comm,
        { upsert: true, new: true }
      );
    }

    const total = await Commodity.countDocuments();
    console.log(`✅ Commodities synced successfully. Total in Atlas: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to sync commodities:', err.message);
    process.exit(1);
  }
}

syncCommodities();
