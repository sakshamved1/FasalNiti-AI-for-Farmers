const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectAtlasDB, getDbStatus } = require('../config/db');
const { getMasterStates, getDistrictsByState } = require('../data/locationMaster');
const { GovernmentSchemeService } = require('../services/governmentSchemeService');
const { handleKisanMitraQuery } = require('../services/aiAssistantService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Listing = require('../models/Listing');
const Offer = require('../models/Offer');
const Order = require('../models/Order');
const MarketPrice = require('../models/MarketPrice');

async function runComprehensiveVerification() {
  console.log('====================================================');
  console.log('🔍 RUNNING fasalniti MONGODB ATLAS VERIFICATION SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. DATA AUDIT: Check Database Initialization in MongoDB Atlas
  console.log('--- TEST GROUP 1: MONGODB ATLAS & ZERO USER DEMO DATA ---');
  await connectAtlasDB();
  const dbStatus = getDbStatus();

  assert(dbStatus.connected, `MongoDB Atlas connection verified (Cluster: ${dbStatus.host})`);

  const [farmerCount, buyerCount, fpoCount, admins, listingCount, offerCount, orderCount] = await Promise.all([
    User.countDocuments({ role: 'FARMER' }),
    User.countDocuments({ role: 'BUYER' }),
    User.countDocuments({ role: 'FPO' }),
    User.find({ role: 'ADMIN' }),
    Listing.countDocuments(),
    Offer.countDocuments(),
    Order.countDocuments()
  ]);

  assert(farmerCount === 0, `Initial Farmers count in Atlas is 0 (Found: ${farmerCount})`);
  assert(buyerCount === 0, `Initial Buyers count in Atlas is 0 (Found: ${buyerCount})`);
  assert(fpoCount === 0, `Initial FPOs count in Atlas is 0 (Found: ${fpoCount})`);
  assert(admins.length === 1 && admins[0].email === 'kisan@admin.com', `Single Admin is kisan@admin.com (Found: ${admins.length})`);
  assert(listingCount === 0, `Initial Listings count in Atlas is 0 (Found: ${listingCount})`);
  assert(offerCount === 0, `Initial Offers count in Atlas is 0 (Found: ${offerCount})`);
  assert(orderCount === 0, `Initial Orders count in Atlas is 0 (Found: ${orderCount})`);

  // Verify Admin password in Atlas
  const adminMatch = bcrypt.compareSync('Admin@12345', admins[0].password);
  assert(adminMatch, 'Admin password Admin@12345 is correctly hashed and verified in Atlas');

  // Verify Duplicate Price Protection Index
  const priceIndexes = await MarketPrice.collection.indexes();
  const hasUniquePriceIndex = priceIndexes.some(i => i.name === 'unique_market_price_record');
  assert(hasUniquePriceIndex, 'Unique compound index (unique_market_price_record) active on MarketPrice in Atlas');

  // 2. MASTER LOCATION DATA: State -> District Dependency
  console.log('\n--- TEST GROUP 2: STATE -> DISTRICT MASTER DATA DEPENDENCY ---');
  const states = getMasterStates();
  assert(states.length >= 28, `Master states catalog loaded (${states.length} states)`);
  
  const gujaratDistricts = getDistrictsByState('Gujarat');
  assert(gujaratDistricts.includes('Vadodara'), 'Gujarat contains Vadodara');
  assert(gujaratDistricts.includes('Bharuch'), 'Gujarat contains Bharuch');
  assert(!gujaratDistricts.includes('Pune'), 'Gujarat does NOT contain Pune');
  assert(!gujaratDistricts.includes('Indore'), 'Gujarat does NOT contain Indore');

  const maharashtraDistricts = getDistrictsByState('Maharashtra');
  assert(maharashtraDistricts.includes('Pune'), 'Maharashtra contains Pune');
  assert(maharashtraDistricts.includes('Nashik'), 'Maharashtra contains Nashik');
  assert(!maharashtraDistricts.includes('Vadodara'), 'Maharashtra does NOT contain Vadodara');
  assert(!maharashtraDistricts.includes('Indore'), 'Maharashtra does NOT contain Indore');

  // 3. GOVERNMENT SCHEME SERVICE: Location Matching & Verification Transparency
  console.log('\n--- TEST GROUP 3: GOVERNMENT SCHEME LOCATION MATCHING & TRANSPARENCY ---');
  
  // Gujarat farmer
  const gujResult = await GovernmentSchemeService.getGovernmentSchemesByLocation(
    { state: 'Gujarat', district: 'Vadodara' },
    { primaryCrops: ['Cotton'], landCategory: 'Small' }
  );
  const gujSchemes = (gujResult.schemes || []).map(item => item.scheme);

  assert(gujSchemes.length > 0, `Found ${gujSchemes.length} schemes for Gujarat/Vadodara`);
  const hasKhedut = gujSchemes.some(s => s.shortCode === 'GUJ-IKHEDUT-KSY');
  const hasMKSY = gujSchemes.some(s => s.shortCode === 'GUJ-MKSY');
  const hasMahaSchemeInGuj = gujSchemes.some(s => s.shortCode === 'MAHA-NSMY');
  assert(hasKhedut, 'Gujarat schemes include Gujarat Khedut Sahay Yojana (GUJ-IKHEDUT-KSY)');
  assert(hasMKSY, 'Gujarat schemes include Mukhyamantri Kisan Sahay Yojana (GUJ-MKSY)');
  assert(!hasMahaSchemeInGuj, 'Gujarat results strictly DO NOT include Maharashtra schemes');

  // Check transparency metadata
  const sampleScheme = gujSchemes[0];
  assert(Boolean(sampleScheme.officialUrl), `Scheme has official officialUrl (${sampleScheme.officialUrl})`);
  assert(Boolean(sampleScheme.lastVerifiedAt), `Scheme has lastVerifiedAt timestamp (${sampleScheme.lastVerifiedAt})`);
  assert(sampleScheme.verificationStatus === 'VERIFIED', `Scheme verificationStatus is 'VERIFIED'`);
  assert(Boolean(sampleScheme.department), `Scheme has official department (${sampleScheme.department})`);

  // Maharashtra farmer
  const mhResult = await GovernmentSchemeService.getGovernmentSchemesByLocation(
    { state: 'Maharashtra', district: 'Pune' },
    { primaryCrops: ['Wheat'], landCategory: 'Small' }
  );
  const mhSchemes = (mhResult.schemes || []).map(item => item.scheme);

  assert(mhSchemes.length > 0, `Found ${mhSchemes.length} schemes for Maharashtra/Pune`);
  const hasNamo = mhSchemes.some(s => s.shortCode === 'MAHA-NSMY');
  const hasMahaDBT = mhSchemes.some(s => s.shortCode === 'MAHA-DBT-AGRI');
  const hasGujSchemeInMH = mhSchemes.some(s => s.shortCode === 'GUJ-IKHEDUT-KSY');
  assert(hasNamo, 'Maharashtra schemes include Namo Shetkari Mahasanman Yojana (MAHA-NSMY)');
  assert(hasMahaDBT, 'Maharashtra schemes include MahaDBT Krishi Yantrikikaran (MAHA-DBT-AGRI)');
  assert(!hasGujSchemeInMH, 'Maharashtra results strictly DO NOT include Gujarat schemes');

  // No Matching Location / Empty State Requirement
  const emptyLocationResult = await GovernmentSchemeService.getGovernmentSchemesByLocation(
    { state: 'NonExistentState', district: 'Nowhere' },
    { primaryCrops: ['Coffee'] }
  );
  const emptyLocationSchemes = (emptyLocationResult.schemes || []).map(item => item.scheme);
  // Should only match Central if universal, but state schemes will be 0
  const stateSchemesInNonExistent = emptyLocationSchemes.filter(s => 
    !s.states.some(st => st.toLowerCase().includes('all india') || st.toLowerCase().includes('central'))
  );
  assert(stateSchemesInNonExistent.length === 0, 'No fake/invented state schemes appear for non-matching location');

  // 4. MULTILINGUAL AI CHATBOT CONTEXT & RESPONSES
  console.log('\n--- TEST GROUP 4: AI ASSISTANT MULTILINGUAL & CONTEXT ADHERENCE ---');

  // Gujarati Query with language 'gu'
  const guResponse = await handleKisanMitraQuery({
    query: 'મારા માટે કઈ સરકારી યોજના છે?',
    language: 'gu',
    farmerProfile: {
      name: 'નરેશ',
      state: 'Gujarat',
      district: 'Vadodara',
      primaryCrops: ['Cotton']
    }
  });

  assert(Boolean(guResponse && guResponse.answer), 'AI assistant responded successfully to Gujarati query');
  const containsGujarati = /[\u0A80-\u0AFF]/.test(guResponse.answer);
  assert(containsGujarati, `AI response contains authentic Gujarati script: "${guResponse.answer.slice(0, 70)}..."`);
  assert(guResponse.answer.toLowerCase().includes('gujarat') || /ગુજરાત/.test(guResponse.answer) || /યોજના/.test(guResponse.answer), 'AI response references Gujarat / schemes');

  // Hindi Query with language 'hi'
  const hiResponse = await handleKisanMitraQuery({
    query: 'मेरे लिए कौन सी सरकारी योजना है?',
    language: 'hi',
    farmerProfile: {
      name: 'राजेश',
      state: 'Gujarat',
      district: 'Vadodara',
      primaryCrops: ['Cotton']
    }
  });

  assert(Boolean(hiResponse && hiResponse.answer), 'AI assistant responded successfully to Hindi query');
  const containsHindi = /[\u0900-\u097F]/.test(hiResponse.answer);
  assert(containsHindi, `AI response contains authentic Hindi script: "${hiResponse.answer.slice(0, 70)}..."`);

  // English Query with language 'en'
  const enResponse = await handleKisanMitraQuery({
    query: 'What government schemes are available for me?',
    language: 'en',
    farmerProfile: {
      name: 'Rajesh',
      state: 'Gujarat',
      district: 'Vadodara',
      primaryCrops: ['Cotton']
    }
  });

  assert(Boolean(enResponse && enResponse.answer), 'AI assistant responded successfully to English query');
  assert(/PM-KISAN|Scheme|Gujarat|Welfare|Khedut/i.test(enResponse.answer), `AI response contains English scheme explanation`);

  // 5. SECURITY & ROLE AUTHORIZATION
  console.log('\n--- TEST GROUP 5: SECURITY & ADMIN SEPARATION ---');
  const JWT_SECRET = process.env.JWT_SECRET || 'fasalniti_secure_jwt_secret_key_prod_892347';
  
  const mockFarmer = {
    _id: 'farmer_atlas_test_123',
    name: 'Real Test Farmer',
    phone: '9876543210',
    role: 'FARMER',
    state: 'Gujarat',
    district: 'Vadodara'
  };

  // Test requireAdmin middleware logic
  const { requireAdmin } = require('../middleware/auth');
  
  // Farmer trying to access admin
  let farmerBlocked = false;
  const mockReqFarmer = { user: mockFarmer };
  const mockResFarmer = {
    status: (code) => ({
      json: (data) => {
        if (code === 403) farmerBlocked = true;
      }
    })
  };
  requireAdmin(mockReqFarmer, mockResFarmer, () => {});
  assert(farmerBlocked, 'Farmer user is strictly BLOCKED (403) from accessing admin routes');

  // Admin accessing admin
  let adminAllowed = false;
  const mockReqAdmin = { user: admins[0] };
  const mockResAdmin = { status: () => ({ json: () => {} }) };
  requireAdmin(mockReqAdmin, mockResAdmin, () => {
    adminAllowed = true;
  });
  assert(adminAllowed, 'Admin user is ALLOWED access to admin routes');

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================');

  process.exit(passedTests === totalTests ? 0 : 1);
}

runComprehensiveVerification().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
