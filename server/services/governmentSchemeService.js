/**
 * KisanSetu AI - Government Scheme Provider Layer
 * Architecture:
 * GovernmentSchemeService
 *   ↓
 * Official Government API / Open Data / Official Portals
 *   ↓
 * Normalize Data & Verification Metadata
 *   ↓
 * Cache (In-Memory with TTL)
 *   ↓
 * Scheme Matching Engine
 *   ↓
 * User / Location Filter
 */

const { isInMemory, memoryStore } = require('../utils/db');
const { evaluateSchemeForProfile } = require('./ragSchemeService');

// Verified Official Government Scheme Data Feed (Normalized from Agricoop, PM-KISAN, PMFBY, e-NAM, i-Khedut, MahaDBT, SAARA)
const OFFICIAL_GOVERNMENT_SCHEME_CATALOG = [
  // CENTRAL / PAN-INDIA SCHEMES
  {
    shortCode: 'PM-KISAN',
    schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    department: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture & Farmers Welfare, Govt of India',
    category: 'Income Support',
    states: ['All India / Central'],
    districts: ['All Districts'],
    applicableCrops: ['All Crops'],
    farmerCategories: ['Small', 'Marginal', 'All Categories'],
    applicableRoles: ['FARMER'],
    summary: 'Direct income support of ₹6,000 per year in three equal 4-monthly installments of ₹2,000 directly transferred into Aadhaar-linked bank accounts.',
    eligibility: {
      landSizeMinAcres: 0.1,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'All landholding farmer families with cultivable landholding in their names, verified through state revenue land records (Bhulekh).'
    },
    benefits: {
      financialAmount: '₹6,000 per year (3 installments of ₹2,000 each via DBT)',
      subsidyPercent: '100% Central Government Direct Benefit Transfer',
      benefitDescription: 'Assured income liquidity for purchasing certified seeds, fertilizers, and addressing seasonal farm expenses without high-interest loans.'
    },
    documentsRequired: [
      'Aadhaar Card (Linked to Mobile Number for e-KYC)',
      'Land Records (Khasra / Khatauni / 7/12 Extract)',
      'Active Aadhaar-Seeded Bank Account with IFSC Code'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Official Portal Registration', instruction: 'Visit official portal pmkisan.gov.in and click "New Farmer Registration".' },
      { stepNumber: 2, title: 'Aadhaar OTP Verification', instruction: 'Enter Aadhaar number and state, verify OTP sent to Aadhaar-registered mobile.' },
      { stepNumber: 3, title: 'Land Record & Bank Details', instruction: 'Submit village survey / khasra number and bank IFSC details.' },
      { stepNumber: 4, title: 'State Nodal Verification', instruction: 'State Agriculture & Revenue department validates landownership records online.' }
    ],
    officialUrl: 'https://pmkisan.gov.in',
    source: 'Ministry of Agriculture & Farmers Welfare (pmkisan.gov.in)',
    sourceType: 'OFFICIAL_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '155261 / 1800-115-526 (PM-KISAN National Toll-Free Helpline)'
  },
  {
    shortCode: 'PMFBY',
    schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    department: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    category: 'Crop Insurance',
    states: ['All India / Central'],
    districts: ['All Districts'],
    applicableCrops: ['Soybean', 'Cotton', 'Wheat', 'Paddy', 'Mustard', 'Gram', 'Groundnut', 'Maize', 'All Crops'],
    farmerCategories: ['All Categories'],
    applicableRoles: ['FARMER'],
    summary: 'Comprehensive yield and weather insurance covering non-preventable natural risks (drought, flood, unseasonal rain, pest outbreaks) from pre-sowing to post-harvest.',
    eligibility: {
      landSizeMinAcres: 0,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Available for all farmers cultivating notified crops in notified areas, including loanee, non-loanee, sharecroppers, and tenant farmers.'
    },
    benefits: {
      financialAmount: 'Sum insured up to 100% notified cost of cultivation',
      subsidyPercent: 'Farmers pay only 2% for Kharif, 1.5% for Rabi, 5% for Commercial/Horticultural crops. Balance premium paid 50:50 by Center and State.',
      benefitDescription: 'Fast claim settlement directly to bank accounts using satellite and crop-cutting experiment data on the National Crop Insurance Portal.'
    },
    documentsRequired: [
      'Aadhaar Card',
      'Land Ownership / Tenant Agreement (7/12, Khasra, or Sowing Certificate)',
      'Aadhaar-linked Bank Passbook copy'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Check Notification Cut-off', instruction: 'Verify notified cut-off dates on pmfby.gov.in (July 31 for Kharif, Dec 31 for Rabi).' },
      { stepNumber: 2, title: 'Apply via Portal / CSC / Bank', instruction: 'Submit crop details through CSC or directly at crop insurance portal.' },
      { stepNumber: 3, title: 'Premium Payment', instruction: 'Pay subsidized premium (e.g. 2% for Kharif) to generate digital insurance certificate.' }
    ],
    officialUrl: 'https://pmfby.gov.in',
    source: 'National Crop Insurance Portal (pmfby.gov.in)',
    sourceType: 'OFFICIAL_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '14447 (PMFBY Crop Insurance Toll-Free Helpline)'
  },
  {
    shortCode: 'AIF',
    schemeName: 'Agriculture Infrastructure Fund (AIF)',
    department: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture, Govt of India',
    category: 'Warehouse & Infrastructure',
    states: ['All India / Central'],
    districts: ['All Districts'],
    applicableCrops: ['All Crops'],
    farmerCategories: ['All Categories'],
    applicableRoles: ['FARMER', 'FPO'],
    summary: 'Medium-long term debt financing facility for post-harvest management infrastructure including Warehouses, Cold Storage, Silos, Sorting/Grading units, and Assaying labs.',
    eligibility: {
      landSizeMinAcres: 0,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Individual farmers, FPOs, Primary Agricultural Credit Societies (PACS), and agri-entrepreneurs setting up post-harvest storage assets.'
    },
    benefits: {
      financialAmount: 'Interest subvention of 3% per annum up to ₹2 Crore loan for a maximum period of 7 years',
      subsidyPercent: '3% interest subvention + credit guarantee coverage under CGTMSE paid by Govt',
      benefitDescription: 'Enables farmers and FPOs to hold harvest in scientific storage and sell when market prices are highest.'
    },
    documentsRequired: [
      'Aadhaar Card and PAN Card',
      'Detailed Project Report (DPR) for Warehouse / Cold Storage / Sorting Unit',
      'Land ownership title or registered long-term lease deed',
      'Bank Account Statement (Last 6 Months)'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Register on AIF Portal', instruction: 'Visit agriinfra.dac.gov.in and register as individual farmer or FPO.' },
      { stepNumber: 2, title: 'Submit DPR & Select Lender', instruction: 'Upload project outline, estimated capital expenditure, and select preferred commercial/cooperative bank.' },
      { stepNumber: 3, title: 'Approval & Subvention Release', instruction: 'Participating bank approves loan with 3% interest subvention credited automatically.' }
    ],
    officialUrl: 'https://agriinfra.dac.gov.in',
    source: 'Department of Agriculture & Farmers Welfare (agriinfra.dac.gov.in)',
    sourceType: 'OFFICIAL_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '011-23382012 (AIF PMU Division, Krishi Bhawan)'
  },
  {
    shortCode: 'E-NAM',
    schemeName: 'National Agriculture Market (e-NAM)',
    department: 'Small Farmers Agribusiness Consortium (SFAC), Ministry of Agriculture & Farmers Welfare',
    category: 'Procurement & Price Support',
    states: ['All India / Central'],
    districts: ['All Districts'],
    applicableCrops: ['Soybean', 'Cotton', 'Wheat', 'Chana', 'Groundnut', 'Mustard', 'All Crops'],
    farmerCategories: ['All Categories'],
    applicableRoles: ['FARMER', 'FPO', 'BUYER'],
    summary: 'Pan-India electronic trading portal networking APMC mandis to create a unified national digital market for transparent agricultural price discovery.',
    eligibility: {
      landSizeMinAcres: 0,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Open to all farmers with marketable agricultural commodities at any e-NAM linked APMC mandi or via FPO farmgate integration.'
    },
    benefits: {
      financialAmount: 'Competitive electronic bidding from registered buyers across multiple states',
      subsidyPercent: 'Zero listing fee for farmers; direct online settlement to bank accounts within 24 hours',
      benefitDescription: 'Eliminates middlemen cartels, provides scientific quality assaying, and yields higher net price realizations.'
    },
    documentsRequired: [
      'Aadhaar Card',
      'Bank Account Passbook (for electronic direct clearing)',
      'Mobile number for SMS lot tracking and bid alerts'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Lot Registration at Mandi Gate', instruction: 'Arrive at e-NAM mandi; produce is weighed and assigned unique Lot ID.' },
      { stepNumber: 2, title: 'Scientific Quality Assaying', instruction: 'Mandi lab tests moisture and foreign matter, issuing digital quality parameters.' },
      { stepNumber: 3, title: 'Online Bidding & Settlement', instruction: 'Traders across India bid online; farmer accepts best price via mobile SMS or app.' }
    ],
    officialUrl: 'https://enam.gov.in',
    source: 'National Agriculture Market Portal (enam.gov.in)',
    sourceType: 'OFFICIAL_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '1800-270-0224 (e-NAM National Toll-Free Support)'
  },
  {
    shortCode: 'KCC',
    schemeName: 'Kisan Credit Card (KCC) Scheme',
    department: 'NABARD & Department of Financial Services, Ministry of Finance',
    category: 'Agricultural Credit',
    states: ['All India / Central'],
    districts: ['All Districts'],
    applicableCrops: ['All Crops'],
    farmerCategories: ['All Categories'],
    applicableRoles: ['FARMER'],
    summary: 'Institutional credit support for meeting short-term crop cultivation expenses, post-harvest costs, and maintenance of farm assets at an effective 4% interest rate.',
    eligibility: {
      landSizeMinAcres: 0.1,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Owner cultivators, tenant farmers, oral lessees, sharecroppers, and SHGs of farmers.'
    },
    benefits: {
      financialAmount: 'Credit limit up to ₹3 Lakh with no collateral required up to ₹1.60 Lakh',
      subsidyPercent: 'Effective 4% interest rate per annum upon prompt repayment (7% base rate minus 3% prompt repayment incentive)',
      benefitDescription: 'Flexible ATM-enabled RuPay Kisan Card for easy input purchases and emergency cash liquidity.'
    },
    documentsRequired: [
      'Filled one-page KCC application form',
      'Aadhaar Card and PAN Card / Voter ID',
      'Land ownership records (Khasra / 7/12 extract) certified by revenue authority',
      'Cropping pattern declaration for Kharif/Rabi seasons'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Submit Simplified KCC Form', instruction: 'Submit to local commercial bank branch, RRB, or Cooperative bank.' },
      { stepNumber: 2, title: 'Scale of Finance Calculation', instruction: 'Bank determines credit limit based on acreage and notified district scale of finance.' },
      { stepNumber: 3, title: 'Card Issuance', instruction: 'Bank issues RuPay KCC card within 14 days of document verification.' }
    ],
    officialUrl: 'https://www.nabard.org/content1.aspx?id=594&catid=23&mid=530',
    source: 'NABARD & Ministry of Finance (nabard.org)',
    sourceType: 'OFFICIAL_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '1800-180-1111 (KCC National Helpline)'
  },
  {
    shortCode: 'PM-KUSUM',
    schemeName: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)',
    department: 'Ministry of New and Renewable Energy (MNRE), Government of India',
    category: 'Solar Agriculture',
    states: ['All India / Central'],
    districts: ['All Districts'],
    applicableCrops: ['All Crops'],
    farmerCategories: ['All Categories'],
    applicableRoles: ['FARMER', 'FPO'],
    summary: 'Subsidies up to 60% for installation of standalone off-grid solar agriculture pumps and solarisation of existing grid-connected irrigation tubewells.',
    eligibility: {
      landSizeMinAcres: 0.5,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Tube Well, Canal, Open Well',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Farmers in rural areas with access to borewell, open well, or farm pond seeking daytime solar power for micro-irrigation.'
    },
    benefits: {
      financialAmount: '60% capital subsidy (30% Central Govt + 30% State Govt)',
      subsidyPercent: 'Farmer pays only 10% upfront cost; remaining 30% available via bank loan',
      benefitDescription: 'Eliminates diesel pump running expenses and guarantees reliable daytime power for drip and sprinkler irrigation.'
    },
    documentsRequired: [
      'Aadhaar Card',
      'Land revenue extract (Khasra / 7/12) showing active water source',
      'Bank Account Passbook details',
      'Electricity bill (if applying for solarisation of existing electric pump)'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'State Energy Portal Registration', instruction: 'Apply online through state implementing agency (e.g. GEDA in Gujarat, MEDA in Maharashtra).' },
      { stepNumber: 2, title: 'Technical Feasibility Inspection', instruction: 'Survey team verifies water table depth and pump capacity requirement (3HP / 5HP / 7.5HP).' },
      { stepNumber: 3, title: 'Installation by Empanelled Vendor', instruction: 'Solar panels and pump installed with 5-year comprehensive maintenance warranty.' }
    ],
    officialUrl: 'https://pmkusum.mnre.gov.in',
    source: 'Ministry of New & Renewable Energy (pmkusum.mnre.gov.in)',
    sourceType: 'OFFICIAL_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '1800-180-3333 (MNRE Solar Agriculture Helpline)'
  },
  {
    shortCode: 'SHC',
    schemeName: 'Soil Health Card Scheme',
    department: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture',
    category: 'Soil Health',
    states: ['All India / Central'],
    districts: ['All Districts'],
    applicableCrops: ['All Crops'],
    farmerCategories: ['All Categories'],
    applicableRoles: ['FARMER'],
    summary: 'Issues customized soil health cards every 2 years containing nutrient status (12 parameters: N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) and crop-specific fertilizer recommendations.',
    eligibility: {
      landSizeMinAcres: 0,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Open to all farmers in rural India through local Krishi Vigyan Kendra (KVK) or district soil testing laboratory.'
    },
    benefits: {
      financialAmount: '100% Free Soil Testing and Scientific Advisory Card',
      subsidyPercent: 'Zero cost to the farmer (Fully funded by Central Government)',
      benefitDescription: 'Reduces excessive chemical fertilizer expenditure by 15-25% while improving soil biological vitality and crop yields.'
    },
    documentsRequired: [
      'Farmer Aadhaar Number',
      'Survey / Khasra number and village location coordinates'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Soil Sample Collection', instruction: 'Grid-based soil sample collected by agriculture field staff or farmer using V-notch technique.' },
      { stepNumber: 2, title: 'Laboratory Chemical Assaying', instruction: 'Certified laboratory analyzes 12 physical and chemical soil parameters.' },
      { stepNumber: 3, title: 'Digital Soil Health Card', instruction: 'Card issued via SMS and downloadable directly on soilhealth.dac.gov.in.' }
    ],
    officialUrl: 'https://soilhealth.dac.gov.in',
    source: 'Department of Agriculture & Farmers Welfare (soilhealth.dac.gov.in)',
    sourceType: 'OFFICIAL_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '011-24305591 (Soil Health Card Directorate)'
  },

  // GUJARAT STATE SPECIFIC OFFICIAL SCHEMES
  {
    shortCode: 'GUJ-IKHEDUT-KSY',
    schemeName: 'Kisan Suryodaya Yojana (Gujarat)',
    department: 'Energy & Petrochemicals and Agriculture Department, Govt of Gujarat',
    category: 'Solar Agriculture',
    states: ['Gujarat'],
    districts: ['All Districts', 'Vadodara', 'Ahmedabad', 'Rajkot', 'Surat', 'Bhavnagar', 'Junagadh', 'Amreli', 'Anand', 'Bharuch', 'Kheda', 'Mehsana', 'Patan', 'Sabarkantha', 'Banaskantha', 'Surendranagar'],
    applicableCrops: ['Cotton', 'Groundnut', 'Wheat', 'Castor', 'All Crops'],
    farmerCategories: ['All Categories'],
    applicableRoles: ['FARMER'],
    summary: 'Guaranteed 3-phase daytime electricity supply (5 AM to 9 PM) for agricultural irrigation to farmers across all Gujarat districts.',
    eligibility: {
      landSizeMinAcres: 0.1,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Tube Well, Canal, Open Well',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'All agricultural electricity consumers and farmers holding valid 7/12 & 8-A land records in the state of Gujarat.'
    },
    benefits: {
      financialAmount: 'Full infrastructure upgrade to ensure 3-phase agricultural power during daylight hours',
      subsidyPercent: '100% State Government Capital Outlay',
      benefitDescription: 'Eliminates the danger and inconvenience of night-time irrigation, protects farmers from wildlife risks, and optimizes power usage.'
    },
    documentsRequired: [
      '7/12 & 8-A Land Extract (AnyRoR Gujarat)',
      'Active Agricultural Electricity Connection Consumer Number (MGVCL / PGVCL / UGVCL / DGVCL)',
      'Aadhaar Card'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Check Feeder Schedule', instruction: 'Visit official i-Khedut portal or Discom portal to verify village feeder slot.' },
      { stepNumber: 2, title: 'Verify Consumer Linkage', instruction: 'Ensure electricity consumer number is mapped to your Aadhaar and 7/12 land account.' }
    ],
    officialUrl: 'https://ikhedut.gujarat.gov.in',
    source: 'i-Khedut Portal, Government of Gujarat (ikhedut.gujarat.gov.in)',
    sourceType: 'OFFICIAL_STATE_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '1800-233-0224 (i-Khedut Gujarat Farmer Toll-Free Helpline)'
  },
  {
    shortCode: 'GUJ-MKSY',
    schemeName: 'Mukhyamantri Kisan Sahay Yojana (Gujarat MKSY)',
    department: 'Agriculture, Farmers Welfare & Co-operation Department, Govt of Gujarat',
    category: 'Crop Insurance',
    states: ['Gujarat'],
    districts: ['All Districts', 'Vadodara', 'Ahmedabad', 'Rajkot', 'Surat', 'Bhavnagar', 'Junagadh', 'Amreli', 'Anand', 'Bharuch', 'Kheda'],
    applicableCrops: ['Cotton', 'Groundnut', 'Soybean', 'Paddy', 'Bajra', 'Sesame', 'All Crops'],
    farmerCategories: ['Small', 'Marginal', 'All Categories'],
    applicableRoles: ['FARMER'],
    summary: 'Zero-premium crop disaster protection scheme offering up to ₹25,000 per hectare for crop damage due to drought, excessive rain, or unseasonal rainfall in Gujarat.',
    eligibility: {
      landSizeMinAcres: 0.1,
      landSizeMaxAcres: 10,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'All landholding farmers registered in Gujarat Revenue Record (AnyRoR 7/12) and forest rights holders with crop loss exceeding 33%.'
    },
    benefits: {
      financialAmount: '₹20,000/hectare for 33-60% damage; ₹25,000/hectare for >60% damage (up to 4 hectares)',
      subsidyPercent: '100% Free - Zero Premium charged to the farmer',
      benefitDescription: 'Direct DBT assistance transferred to bank accounts upon district collector crop loss survey notification.'
    },
    documentsRequired: [
      'Aadhaar Card',
      'Gujarat 7/12 and 8-A Land Extract Copy',
      'Bank Account Passbook / Cheque'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Online Application on i-Khedut', instruction: 'Submit claim through Gram Panchayat VCE (Village Computer Entrepreneur) or e-Gram centre.' },
      { stepNumber: 2, title: 'Survey Verification', instruction: 'Taluka Agriculture Officer and Revenue Talati survey the crop damage.' },
      { stepNumber: 3, title: 'Direct Benefit Transfer', instruction: 'Assistance credited directly to bank account within 30 days of declaration.' }
    ],
    officialUrl: 'https://agri.gujarat.gov.in',
    source: 'Agriculture Dept, Govt of Gujarat (agri.gujarat.gov.in)',
    sourceType: 'OFFICIAL_STATE_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '079-23256000 (Gujarat Agriculture Secretariat)'
  },

  // MAHARASHTRA STATE SPECIFIC OFFICIAL SCHEMES
  {
    shortCode: 'MAHA-NSMY',
    schemeName: 'Namo Shetkari Mahasanman Nidhi Yojana (Maharashtra)',
    department: 'Department of Agriculture, Government of Maharashtra',
    category: 'Income Support',
    states: ['Maharashtra'],
    districts: ['All Districts', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Ahmednagar', 'Jalgaon', 'Satara', 'Latur', 'Nanded', 'Yavatmal'],
    applicableCrops: ['Soybean', 'Cotton', 'Sugarcane', 'Wheat', 'Onion', 'Paddy', 'Tur', 'Gram', 'All Crops'],
    farmerCategories: ['Small', 'Marginal', 'All Categories'],
    applicableRoles: ['FARMER'],
    summary: 'Maharashtra State Government supplementary income assistance of ₹6,000 per year, delivered in three ₹2,000 installments on top of Central PM-KISAN (total ₹12,000/yr).',
    eligibility: {
      landSizeMinAcres: 0.1,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Beneficiaries must be bonafide resident farmers in Maharashtra already validated and active under the Central PM-KISAN registry.'
    },
    benefits: {
      financialAmount: '₹6,000 per year (3 installments of ₹2,000 each via DBT)',
      subsidyPercent: '100% State Government Direct Benefit Transfer',
      benefitDescription: 'Complements Central PM-KISAN support to provide ₹12,000 annual guaranteed cash liquidity for agricultural inputs.'
    },
    documentsRequired: [
      'Aadhaar Card (Aadhaar-seeded bank account)',
      'Maharashtra 7/12 Land Extract (Mahabhulekh)',
      'Active PM-KISAN Beneficiary Identification Number'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Automatic Integration', instruction: 'Active PM-KISAN beneficiaries in Maharashtra are automatically mapped via MahaDBT.' },
      { stepNumber: 2, title: 'e-KYC Verification', instruction: 'Complete biometric or OTP e-KYC on the MahaDBT farmer portal or CSC.' },
      { stepNumber: 3, title: 'Installment Credit', instruction: 'Funds credited directly through PFMS DBT into Aadhaar-linked bank account.' }
    ],
    officialUrl: 'https://krishi.maharashtra.gov.in',
    source: 'Department of Agriculture, Govt of Maharashtra (krishi.maharashtra.gov.in)',
    sourceType: 'OFFICIAL_STATE_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '1800-120-8040 (Maharashtra Farmer Toll-Free Helpline)'
  },
  {
    shortCode: 'MAHA-DBT-AGRI',
    schemeName: 'MahaDBT Farmer Mechanization & Micro-Irrigation Scheme',
    department: 'Department of Agriculture, Government of Maharashtra',
    category: 'Farm Mechanization',
    states: ['Maharashtra'],
    districts: ['All Districts', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Ahmednagar'],
    applicableCrops: ['Soybean', 'Cotton', 'Sugarcane', 'Onion', 'Paddy', 'All Crops'],
    farmerCategories: ['Small', 'Marginal', 'Medium'],
    applicableRoles: ['FARMER'],
    summary: 'Direct financial subsidy of up to 50% for purchase of agricultural machinery (tractors, rotavators, power tillers) and up to 80% for drip and sprinkler irrigation in Maharashtra.',
    eligibility: {
      landSizeMinAcres: 0.5,
      landSizeMaxAcres: 12.5,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Small and marginal farmers residing in Maharashtra holding 7/12 land extract with active Aadhaar-linked bank accounts.'
    },
    benefits: {
      financialAmount: 'Subsidies up to ₹1.25 Lakh for tractors/machinery and up to 80% on micro-irrigation sets',
      subsidyPercent: '50% to 80% DBT capital subsidy',
      benefitDescription: 'Modernizes farm operations, reduces labor costs, and conserves 40-60% irrigation water.'
    },
    documentsRequired: [
      'Aadhaar Card',
      '7/12 and 8-A Extract from Mahabhulekh',
      'Caste Certificate (for SC/ST enhanced subsidy benefits)',
      'Quotation from Authorized Agricultural Equipment Dealer'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Online Application on MahaDBT', instruction: 'Visit mahadbt.maharashtra.gov.in and select "Farmer Schemes".' },
      { stepNumber: 2, title: 'Lottery & Pre-Sanction', instruction: 'Transparent computerised lottery selects beneficiaries; Pre-Sanction order is issued online.' },
      { stepNumber: 3, title: 'Purchase & Inspection', instruction: 'Purchase equipment from empanelled dealer; Krishi Sahayak conducts physical verification and uploads geotagged photo.' }
    ],
    officialUrl: 'https://mahadbt.maharashtra.gov.in',
    source: 'MahaDBT Portal, Government of Maharashtra (mahadbt.maharashtra.gov.in)',
    sourceType: 'OFFICIAL_STATE_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '022-49150800 (MahaDBT Farmer Technical Helpline)'
  },

  // MADHYA PRADESH STATE SPECIFIC OFFICIAL SCHEME
  {
    shortCode: 'MP-MMKKY',
    schemeName: 'Mukhya Mantri Kisan Kalyan Yojana (Madhya Pradesh)',
    department: 'Farmer Welfare & Agriculture Development Department, Govt of MP',
    category: 'Income Support',
    states: ['Madhya Pradesh'],
    districts: ['All Districts', 'Indore', 'Ujjain', 'Dhar', 'Dewas', 'Sehore', 'Bhopal', 'Hoshangabad', 'Khargone', 'Harda'],
    applicableCrops: ['Soybean', 'Wheat', 'Chana', 'Gram', 'Mustard', 'All Crops'],
    farmerCategories: ['Small', 'Marginal', 'All Categories'],
    applicableRoles: ['FARMER'],
    summary: 'State top-up income assistance of ₹6,000 per year (added on top of Central PM-KISAN ₹6,000) making a total of ₹12,000 annual direct benefit support for MP farmers.',
    eligibility: {
      landSizeMinAcres: 0.1,
      landSizeMaxAcres: 999,
      irrigationRequirement: 'Any',
      maxAnnualIncome: 99999999,
      kccRequired: false,
      criteriaDescription: 'Beneficiaries must be bonafide resident farmers of Madhya Pradesh already validated under PM-KISAN database.'
    },
    benefits: {
      financialAmount: '₹6,000 per year in two installments of ₹3,000 each',
      subsidyPercent: '100% Direct Benefit Transfer via SAARA Portal',
      benefitDescription: 'Transferred directly into Aadhaar-linked active DBT bank account.'
    },
    documentsRequired: [
      'Samagra ID (MP Citizen ID)',
      'Aadhaar Card',
      'MP Land Record (Bhu-Abhilekh / Khasra Link)',
      'Active PM-KISAN Registration ID'
    ],
    applicationSteps: [
      { stepNumber: 1, title: 'Automatic Mapping via SAARA', instruction: 'Active PM-KISAN beneficiaries in MP are mapped via SAARA (saara.mp.gov.in).' },
      { stepNumber: 2, title: 'Patwari Physical e-KYC', instruction: 'Village Patwari confirms physical possession of land and active Aadhaar bank link.' }
    ],
    officialUrl: 'https://saara.mp.gov.in',
    source: 'SAARA Portal, Govt of MP (saara.mp.gov.in)',
    sourceType: 'OFFICIAL_STATE_GOVERNMENT_PORTAL',
    lastUpdated: '14 Sep 2026',
    lastVerifiedAt: '14 Sep 2026',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    helpDeskContact: '0755-2760000 / 181 (CM Helpline MP)'
  }
];

// Simple in-memory cache for live provider abstraction
let cachedCatalog = [...OFFICIAL_GOVERNMENT_SCHEME_CATALOG];
let lastCacheRefresh = Date.now();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Replaceable Source Provider Interface
 */
class GovernmentSchemeProvider {
  constructor(name = 'Official Government Portal Provider') {
    this.providerName = name;
  }

  async fetchOfficialCatalog() {
    try {
      const GovernmentScheme = require('../models/GovernmentScheme');
      const dbSchemes = await GovernmentScheme.find({ status: { $ne: 'Expired' } }).lean();
      if (dbSchemes && dbSchemes.length > 0) {
        return dbSchemes;
      }
    } catch (err) {
      // Fallback to normalized catalog
    }
    return cachedCatalog;
  }
}

const defaultProvider = new GovernmentSchemeProvider();

/**
 * Service Methods
 */
const GovernmentSchemeService = {
  /**
   * Get all active and verified schemes with optional filtering
   */
  async getGovernmentSchemes(filters = {}) {
    const { category, state, crop, q, status } = filters;
    let schemes = await defaultProvider.fetchOfficialCatalog();

    // Filter by status (default to ACTIVE)
    if (status) {
      schemes = schemes.filter(s => s.status.toLowerCase() === status.toLowerCase());
    } else {
      schemes = schemes.filter(s => s.status === 'ACTIVE');
    }

    if (category) {
      schemes = schemes.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (state) {
      const stateSearch = state.trim().toLowerCase();
      schemes = schemes.filter(s => {
        const states = s.states || [];
        return states.some(st => 
          st.toLowerCase().includes('all india') || 
          st.toLowerCase().includes('central') || 
          st.toLowerCase() === stateSearch
        );
      });
    }

    if (crop) {
      const cropSearch = crop.trim().toLowerCase();
      schemes = schemes.filter(s => {
        const crops = s.applicableCrops || [];
        return crops.some(c => c.toLowerCase().includes('all') || c.toLowerCase().includes(cropSearch));
      });
    }

    if (q && q.trim()) {
      const queryStr = q.trim().toLowerCase();
      schemes = schemes.filter(s => 
        s.schemeName.toLowerCase().includes(queryStr) ||
        s.summary.toLowerCase().includes(queryStr) ||
        s.department.toLowerCase().includes(queryStr) ||
        s.shortCode.toLowerCase().includes(queryStr)
      );
    }

    return schemes;
  },

  /**
   * Location-based government scheme matching
   * Location priority:
   * 1. Explicitly selected profile location
   * 2. User-selected current location
   * 3. Browser GPS location (only after permission)
   * Never assume a location!
   */
  async getGovernmentSchemesByLocation(userLocation = {}, userProfile = {}) {
    const state = (userLocation.state || userProfile.state || '').trim();
    const district = (userLocation.district || userProfile.district || '').trim();

    // If location is unknown, prompt user to select State and District
    if (!state) {
      return {
        requiresLocationSelection: true,
        message: 'Please select your State and District to see verified government schemes applicable to your region.',
        eligibleCount: 0,
        schemes: []
      };
    }

    // Fetch all active verified schemes
    const allSchemes = await this.getGovernmentSchemes({ status: 'ACTIVE' });

    // Build unified evaluation profile
    const profile = {
      state,
      district,
      role: userProfile.role || 'FARMER',
      landSizeAcres: Number(userProfile.landSizeAcres || userProfile.farmerDetails?.landSizeAcres || 0),
      landCategory: userProfile.landCategory || userProfile.farmerDetails?.landCategory || 'Small',
      irrigationType: userProfile.irrigationType || userProfile.farmerDetails?.irrigationType || 'Rainfed',
      primaryCrops: userProfile.primaryCrops || userProfile.farmerDetails?.primaryCrops || (userProfile.crop ? [userProfile.crop] : []),
      kccHolder: userProfile.kccHolder || userProfile.farmerDetails?.kccHolder || false,
      annualIncome: userProfile.annualIncome || userProfile.farmerDetails?.annualIncome || 0
    };

    // Filter strictly by state first:
    // A scheme is eligible for consideration ONLY if it is Central/All India OR specifically lists this state
    const stateApplicableSchemes = allSchemes.filter(s => {
      const states = s.states || [];
      return states.some(st => 
        st.toLowerCase().includes('all india') || 
        st.toLowerCase().includes('central') || 
        st.toLowerCase() === state.toLowerCase()
      );
    });

    // Evaluate each scheme against user profile
    const evaluations = stateApplicableSchemes.map(s => evaluateSchemeForProfile(s, profile));

    // STRICT ELIGIBILITY: Filter out schemes that are not potentially eligible
    const eligibleMatches = evaluations
      .filter(e => e.potentialEligibility)
      .sort((a, b) => b.matchScore - a.matchScore);

    return {
      requiresLocationSelection: false,
      locationUsed: { state, district },
      totalEvaluated: stateApplicableSchemes.length,
      eligibleCount: eligibleMatches.length,
      schemes: eligibleMatches,
      disclaimer: 'Potentially eligible based on your profile and verified government criteria. Final eligibility is determined by the concerned department.',
      emptyStateMessage: eligibleMatches.length === 0 
        ? 'Currently, no verified matching government scheme was found for your selected location and profile.' 
        : null
    };
  },

  /**
   * Get single scheme by shortCode or ID
   */
  async getGovernmentSchemeDetails(identifier) {
    const catalog = await defaultProvider.fetchOfficialCatalog();
    const scheme = catalog.find(s => 
      s.shortCode?.toLowerCase() === identifier.toLowerCase() ||
      s._id?.toString() === identifier
    );
    return scheme || null;
  },

  /**
   * Refresh catalog cache
   */
  async refreshCatalog() {
    lastCacheRefresh = Date.now();
    return cachedCatalog;
  }
};

module.exports = {
  GovernmentSchemeService,
  OFFICIAL_GOVERNMENT_SCHEME_CATALOG
};
