const bcrypt = require('bcryptjs');

const generate30DayHistory = (basePrice, trendMultiplier = 1) => {
  const history = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Realistic agricultural fluctuation curve
    const cycle = Math.sin(i / 4) * 85 * trendMultiplier;
    const noise = (Math.cos(i * 1.3) * 35);
    const modalPrice = Math.round(basePrice + cycle + noise);
    const arrivals = Math.round(350 + Math.sin(i / 3) * 120 + (Math.random() * 40));

    history.push({
      date: dateStr,
      modalPrice,
      arrivals
    });
  }
  return history;
};

const getSeedData = async () => {
  const adminPassword = await bcrypt.hash('Admin@12345', 10);

  // Strictly ZERO fake farmers, buyers, or FPOs. Only the single system administrator.
  const users = [
    {
      name: 'FasalNiti Administrator',
      email: 'kisan@admin.com',
      phone: '9999999999',
      password: adminPassword,
      role: 'ADMIN',
      state: 'National',
      district: 'New Delhi',
      village: 'Krishi Bhawan',
      preferredLanguage: 'en',
      verified: true,
      status: 'Active'
    }
  ];

  const markets = [
    {
      name: 'Indore Krishi Upaj Mandi',
      code: 'IND-APMC-01',
      state: 'Madhya Pradesh',
      district: 'Indore',
      location: { lat: 22.7533, lng: 75.8937 },
      address: 'Laxmi Bai Nagar, Sanwer Road, Indore',
      contactNumber: '0731-2410882',
      operatingHours: '6:00 AM - 4:00 PM',
      facilities: ['Grading Lab', 'Electronic Weighbridge', 'e-NAM Terminal', 'Banking Counter', 'Kisan Rest House'],
      isApMCVerified: true
    },
    {
      name: 'Dewas Mandi',
      code: 'DWS-APMC-02',
      state: 'Madhya Pradesh',
      district: 'Dewas',
      location: { lat: 22.9676, lng: 76.0534 },
      address: 'AB Road, Mandi Gate, Dewas',
      contactNumber: '07272-255140',
      operatingHours: '7:00 AM - 3:30 PM',
      facilities: ['e-NAM Terminal', 'Electronic Weighbridge', 'Covered Sheds'],
      isApMCVerified: true
    },
    {
      name: 'Ujjain Mandi',
      code: 'UJN-APMC-03',
      state: 'Madhya Pradesh',
      district: 'Ujjain',
      location: { lat: 23.1765, lng: 75.7885 },
      address: 'Maksi Road Krishi Upaj Mandi, Ujjain',
      contactNumber: '0734-2521190',
      operatingHours: '6:30 AM - 4:00 PM',
      facilities: ['Quality Assay Lab', 'Weighbridge', 'Warehouses', 'e-NAM'],
      isApMCVerified: true
    },
    {
      name: 'Bhopal Karond Mandi',
      code: 'BPL-APMC-04',
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      location: { lat: 23.2990, lng: 77.4012 },
      address: 'Karond Bypass, Bhopal',
      contactNumber: '0755-2740112',
      operatingHours: '6:00 AM - 5:00 PM',
      facilities: ['Cold Storage', 'Grain Testing', 'e-NAM Terminal'],
      isApMCVerified: true
    },
    {
      name: 'Nashik APMC',
      code: 'NSK-APMC-05',
      state: 'Maharashtra',
      district: 'Nashik',
      location: { lat: 19.9975, lng: 73.7898 },
      address: 'Dindori Road, Panchavati, Nashik',
      contactNumber: '0253-2512345',
      operatingHours: '5:30 AM - 6:00 PM',
      facilities: ['Export Cargo Inspection', 'Auction Sheds', 'Cold Storage'],
      isApMCVerified: true
    },
    {
      name: 'Gondal APMC Mandi',
      code: 'GDL-APMC-06',
      state: 'Gujarat',
      district: 'Rajkot',
      location: { lat: 21.9619, lng: 70.7923 },
      address: 'Marketing Yard, National Highway 27, Gondal',
      contactNumber: '02825-220033',
      operatingHours: '6:00 AM - 5:00 PM',
      facilities: ['Groundnut & Cotton Auction Yard', 'e-NAM Terminal', 'Moisture Meter', 'Weighbridge'],
      isApMCVerified: true
    },
    {
      name: 'Azadpur Mandi',
      code: 'AZD-APMC-07',
      state: 'Delhi',
      district: 'North Delhi',
      location: { lat: 28.7118, lng: 77.1782 },
      address: 'Azadpur Main Market, GT Karnal Road, Delhi',
      contactNumber: '011-27691234',
      operatingHours: '4:00 AM - 8:00 PM',
      facilities: ['National Fruit & Vegetable Hub', 'Cold Chain Terminal', 'Digital Price Screens', 'e-NAM'],
      isApMCVerified: true
    },
    {
      name: 'Khanna Grain Market',
      code: 'KHN-APMC-08',
      state: 'Punjab',
      district: 'Ludhiana',
      location: { lat: 30.7071, lng: 76.2163 },
      address: 'Asia Largest Grain Market, GT Road, Khanna',
      contactNumber: '01628-225678',
      operatingHours: '6:00 AM - 6:00 PM',
      facilities: ['Wheat & Paddy Silos', 'Automated Bagging', 'Assay Testing Labs', 'e-NAM'],
      isApMCVerified: true
    },
    {
      name: 'Kota Mandi Yard',
      code: 'KTA-APMC-09',
      state: 'Rajasthan',
      district: 'Kota',
      location: { lat: 25.1843, lng: 75.8342 },
      address: 'Bhamashah Krishi Upaj Mandi, Anantpura, Kota',
      contactNumber: '0744-2471900',
      operatingHours: '7:00 AM - 4:00 PM',
      facilities: ['Soybean & Mustard Hub', 'Electronic Bidding', 'Warehouse Network'],
      isApMCVerified: true
    },
    {
      name: 'Yeshwanthpur APMC Market',
      code: 'YSH-APMC-10',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      location: { lat: 13.0238, lng: 77.5529 },
      address: 'APMC Yard, Tumkur Road, Yeshwanthpur, Bengaluru',
      contactNumber: '080-23371400',
      operatingHours: '5:00 AM - 5:00 PM',
      facilities: ['Multi-Commodity Auction', 'e-NAM Trading Terminal', 'Cold Storage Logistics'],
      isApMCVerified: true
    }
  ];

  const crops = [
    {
      name: 'Soybean',
      localNames: {
        hi: 'सोयाबीन',
        gu: 'સોયાબીન',
        mr: 'सोयाबीन',
        pa: 'ਸੋਇਆਬੀਨ',
        bn: 'সয়াবিন',
        ta: 'சோயாபீன்',
        te: 'సోయాబీన్',
        kn: 'ಸೋಯಾಬೀನ್'
      },
      category: 'Oilseed',
      season: 'Kharif',
      mspPrice: 4892,
      unit: 'Quintal (100 kg)',
      shelfLifeDaysNormal: 90,
      shelfLifeDaysCold: 365,
      icon: '🌱'
    },
    {
      name: 'Wheat',
      localNames: {
        hi: 'गेहूं (शरबती)',
        gu: 'ઘઉં',
        mr: 'गहू',
        pa: 'ਕਣਕ',
        bn: 'গম',
        ta: 'கோதுமை',
        te: 'గోధుమలు',
        kn: 'ಗೋಧಿ'
      },
      category: 'Cereal',
      season: 'Rabi',
      mspPrice: 2275,
      unit: 'Quintal (100 kg)',
      shelfLifeDaysNormal: 180,
      shelfLifeDaysCold: 400,
      icon: '🌾'
    },
    {
      name: 'Chana',
      localNames: {
        hi: 'चना (देसी/काबुली)',
        gu: 'ચણા',
        mr: 'हरभरा',
        pa: 'ਛੋਲੇ',
        bn: 'ছোলা',
        ta: 'கொண்டைக்கடலை',
        te: 'శనగలు',
        kn: 'ಕಡಲೆ'
      },
      category: 'Pulse',
      season: 'Rabi',
      mspPrice: 5440,
      unit: 'Quintal (100 kg)',
      shelfLifeDaysNormal: 120,
      shelfLifeDaysCold: 365,
      icon: '🫘'
    },
    {
      name: 'Onion',
      localNames: {
        hi: 'प्याज (लाल)',
        gu: 'ડુંગળી',
        mr: 'कांदा',
        pa: 'ਪਿਆਜ਼',
        bn: 'পেঁয়াজ',
        ta: 'வெங்காயம்',
        te: 'ఉల్లిపాయ',
        kn: 'ಈರುಳ್ಳಿ'
      },
      category: 'Vegetable',
      season: 'Rabi',
      mspPrice: 1650,
      unit: 'Quintal (100 kg)',
      shelfLifeDaysNormal: 25,
      shelfLifeDaysCold: 180,
      icon: '🧅'
    },
    {
      name: 'Mustard',
      localNames: {
        hi: 'सरसों',
        gu: 'રાઈ',
        mr: 'मोहरी',
        pa: 'ਸਰ੍ਹੋਂ',
        bn: 'সরিষা',
        ta: 'கடுகு',
        te: 'ఆవాలు',
        kn: 'ಸಾಸಿವೆ'
      },
      category: 'Oilseed',
      season: 'Rabi',
      mspPrice: 5650,
      unit: 'Quintal (100 kg)',
      shelfLifeDaysNormal: 150,
      shelfLifeDaysCold: 365,
      icon: '🌼'
    },
    {
      name: 'Cotton',
      localNames: {
        hi: 'कपास',
        gu: 'કપાસ',
        mr: 'कापूस',
        pa: 'ਕਪਾਹ',
        bn: 'তুলা',
        ta: 'பருத்தி',
        te: 'పత్తి',
        kn: 'ಹತ್ತಿ'
      },
      category: 'Fiber',
      season: 'Kharif',
      mspPrice: 7121,
      unit: 'Quintal (100 kg)',
      shelfLifeDaysNormal: 240,
      shelfLifeDaysCold: 365,
      icon: '☁️'
    }
  ];

  const marketPrices = [
    {
      cropName: 'Soybean',
      marketName: 'Indore Krishi Upaj Mandi',
      state: 'Madhya Pradesh',
      district: 'Indore',
      variety: 'Yellow (JS 335 / JS 9560)',
      minPrice: 4250,
      maxPrice: 4680,
      modalPrice: 4500,
      priceChange24h: 45,
      percentChange24h: 1.01,
      arrivalsTonnes: 480,
      demandLevel: 'High',
      source: 'Agmarknet / MP Mandi Board Live Gateway',
      isVerified: true,
      history: generate30DayHistory(4400, 1.2)
    },
    {
      cropName: 'Soybean',
      marketName: 'Dewas Mandi',
      state: 'Madhya Pradesh',
      district: 'Dewas',
      variety: 'Yellow Standard',
      minPrice: 4150,
      maxPrice: 4480,
      modalPrice: 4350,
      demandLevel: 'Moderate',
      isVerified: true
    },
    {
      cropName: 'Wheat',
      marketName: 'Indore Krishi Upaj Mandi',
      state: 'Madhya Pradesh',
      district: 'Indore',
      variety: 'Sharbati Lokwan',
      minPrice: 2450,
      maxPrice: 2850,
      modalPrice: 2620,
      priceChange24h: 15,
      percentChange24h: 0.58,
      arrivalsTonnes: 620,
      demandLevel: 'High',
      source: 'Agmarknet / MP Mandi Board Live Gateway',
      isVerified: true,
      history: generate30DayHistory(2580, 0.6)
    },
    {
      cropName: 'Gram (Chana)',
      marketName: 'Indore Krishi Upaj Mandi',
      state: 'Madhya Pradesh',
      district: 'Indore',
      variety: 'Desi Chana (Kantewala)',
      minPrice: 5850,
      maxPrice: 6300,
      modalPrice: 6150,
      priceChange24h: 60,
      percentChange24h: 0.99,
      arrivalsTonnes: 210,
      demandLevel: 'High',
      source: 'Agmarknet / MP Mandi Board Live Gateway',
      isVerified: true,
      history: generate30DayHistory(5980, 1.4)
    },
    {
      cropName: 'Onion',
      marketName: 'Indore Krishi Upaj Mandi',
      state: 'Madhya Pradesh',
      district: 'Indore',
      variety: 'Nasik Red Medium',
      minPrice: 1900,
      maxPrice: 2600,
      modalPrice: 2400,
      priceChange24h: 120,
      percentChange24h: 5.26,
      arrivalsTonnes: 540,
      demandLevel: 'High',
      source: 'Agmarknet / MP Mandi Board Live Gateway',
      isVerified: true,
      history: generate30DayHistory(2200, 2.1)
    },
    {
      cropName: 'Mustard',
      marketName: 'Indore Krishi Upaj Mandi',
      state: 'Madhya Pradesh',
      district: 'Indore',
      variety: 'Black Bold',
      minPrice: 5350,
      maxPrice: 5820,
      modalPrice: 5620,
      priceChange24h: 30,
      percentChange24h: 0.54,
      arrivalsTonnes: 140,
      demandLevel: 'Moderate',
      source: 'Agmarknet / MP Mandi Board Live Gateway',
      isVerified: true,
      history: generate30DayHistory(5550, 0.8)
    },

    // Madhya Pradesh - Dewas & Ujjain & Bhopal
    {
      cropName: 'Soybean',
      marketName: 'Dewas Mandi',
      state: 'Madhya Pradesh',
      district: 'Dewas',
      variety: 'Yellow Standard',
      minPrice: 4150,
      maxPrice: 4480,
      modalPrice: 4350,
      priceChange24h: -20,
      percentChange24h: -0.46,
      arrivalsTonnes: 290,
      demandLevel: 'Moderate',
      source: 'Agmarknet / MP Mandi Board Live Gateway',
      isVerified: true,
      history: generate30DayHistory(4280, 0.9)
    },
    {
      cropName: 'Soybean',
      marketName: 'Ujjain Mandi',
      state: 'Madhya Pradesh',
      district: 'Ujjain',
      variety: 'Yellow Grade A',
      minPrice: 4200,
      maxPrice: 4560,
      modalPrice: 4420,
      priceChange24h: 30,
      percentChange24h: 0.68,
      arrivalsTonnes: 320,
      demandLevel: 'High',
      source: 'Agmarknet / MP Mandi Board Live Gateway',
      isVerified: true,
      history: generate30DayHistory(4350, 1.1)
    },
    {
      cropName: 'Wheat',
      marketName: 'Bhopal Karond Mandi',
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      variety: 'Mill Quality FAQ',
      minPrice: 2420,
      maxPrice: 2680,
      modalPrice: 2580,
      priceChange24h: 10,
      percentChange24h: 0.39,
      arrivalsTonnes: 410,
      demandLevel: 'High',
      source: 'Agmarknet / MP Mandi Board Live Gateway',
      isVerified: true,
      history: generate30DayHistory(2540, 0.5)
    },

    // Gujarat - Gondal APMC Mandi
    {
      cropName: 'Groundnut',
      marketName: 'Gondal APMC Mandi',
      state: 'Gujarat',
      district: 'Rajkot',
      variety: 'GG-20 / Bold Pods',
      minPrice: 6100,
      maxPrice: 6750,
      modalPrice: 6450,
      priceChange24h: 75,
      percentChange24h: 1.18,
      arrivalsTonnes: 420,
      demandLevel: 'High',
      source: 'Agmarknet / Gujarat State Agricultural Marketing Board (GSAMB)',
      isVerified: true,
      history: generate30DayHistory(6300, 1.3)
    },
    {
      cropName: 'Cotton',
      marketName: 'Gondal APMC Mandi',
      state: 'Gujarat',
      district: 'Rajkot',
      variety: 'Shankar-6 (Medium/Long)',
      minPrice: 6850,
      maxPrice: 7420,
      modalPrice: 7180,
      priceChange24h: 60,
      percentChange24h: 0.84,
      arrivalsTonnes: 380,
      demandLevel: 'High',
      source: 'Agmarknet / Gujarat State Agricultural Marketing Board (GSAMB)',
      isVerified: true,
      history: generate30DayHistory(7050, 1.1)
    },
    {
      cropName: 'Wheat',
      marketName: 'Gondal APMC Mandi',
      state: 'Gujarat',
      district: 'Rajkot',
      variety: 'Tukdi Premium',
      minPrice: 2520,
      maxPrice: 2840,
      modalPrice: 2680,
      priceChange24h: 20,
      percentChange24h: 0.75,
      arrivalsTonnes: 260,
      demandLevel: 'High',
      source: 'Agmarknet / Gujarat State Agricultural Marketing Board (GSAMB)',
      isVerified: true,
      history: generate30DayHistory(2620, 0.7)
    },

    // Maharashtra - Nashik APMC
    {
      cropName: 'Onion',
      marketName: 'Nashik APMC',
      state: 'Maharashtra',
      district: 'Nashik',
      variety: 'Pol / Gavran Red',
      minPrice: 2100,
      maxPrice: 2750,
      modalPrice: 2480,
      priceChange24h: 90,
      percentChange24h: 3.77,
      arrivalsTonnes: 720,
      demandLevel: 'High',
      source: 'Agmarknet / MSAMB Maharashtra Mandi Portal',
      isVerified: true,
      history: generate30DayHistory(2320, 1.8)
    },
    {
      cropName: 'Soybean',
      marketName: 'Nashik APMC',
      state: 'Maharashtra',
      district: 'Nashik',
      variety: 'Yellow FAQ',
      minPrice: 4280,
      maxPrice: 4620,
      modalPrice: 4490,
      priceChange24h: 25,
      percentChange24h: 0.56,
      arrivalsTonnes: 310,
      demandLevel: 'Moderate',
      source: 'Agmarknet / MSAMB Maharashtra Mandi Portal',
      isVerified: true,
      history: generate30DayHistory(4420, 0.9)
    },
    {
      cropName: 'Gram (Chana)',
      marketName: 'Nashik APMC',
      state: 'Maharashtra',
      district: 'Nashik',
      variety: 'Vijay Desi Chana',
      minPrice: 5800,
      maxPrice: 6280,
      modalPrice: 6100,
      priceChange24h: 40,
      percentChange24h: 0.66,
      arrivalsTonnes: 195,
      demandLevel: 'High',
      source: 'Agmarknet / MSAMB Maharashtra Mandi Portal',
      isVerified: true,
      history: generate30DayHistory(6010, 1.0)
    },

    // Punjab - Khanna Grain Market
    {
      cropName: 'Wheat',
      marketName: 'Khanna Grain Market',
      state: 'Punjab',
      district: 'Ludhiana',
      variety: 'HD 3086 / PBW 550',
      minPrice: 2500,
      maxPrice: 2780,
      modalPrice: 2650,
      priceChange24h: 15,
      percentChange24h: 0.57,
      arrivalsTonnes: 850,
      demandLevel: 'High',
      source: 'Agmarknet / Punjab Mandi Board',
      isVerified: true,
      history: generate30DayHistory(2610, 0.5)
    },
    {
      cropName: 'Paddy (Dhan)',
      marketName: 'Khanna Grain Market',
      state: 'Punjab',
      district: 'Ludhiana',
      variety: 'PR 126 / Basmati Pusa 1509',
      minPrice: 2200,
      maxPrice: 2480,
      modalPrice: 2320,
      priceChange24h: 25,
      percentChange24h: 1.09,
      arrivalsTonnes: 640,
      demandLevel: 'High',
      source: 'Agmarknet / Punjab Mandi Board',
      isVerified: true,
      history: generate30DayHistory(2260, 0.8)
    },
    {
      cropName: 'Maize',
      marketName: 'Khanna Grain Market',
      state: 'Punjab',
      district: 'Ludhiana',
      variety: 'Yellow Hybrid',
      minPrice: 2050,
      maxPrice: 2290,
      modalPrice: 2180,
      priceChange24h: -10,
      percentChange24h: -0.46,
      arrivalsTonnes: 180,
      demandLevel: 'Moderate',
      source: 'Agmarknet / Punjab Mandi Board',
      isVerified: true,
      history: generate30DayHistory(2150, 0.4)
    },

    // Rajasthan - Kota Mandi Yard
    {
      cropName: 'Mustard',
      marketName: 'Kota Mandi Yard',
      state: 'Rajasthan',
      district: 'Kota',
      variety: 'Pusa Bold (42% Oil)',
      minPrice: 5400,
      maxPrice: 5920,
      modalPrice: 5680,
      priceChange24h: 50,
      percentChange24h: 0.89,
      arrivalsTonnes: 310,
      demandLevel: 'High',
      source: 'Agmarknet / Rajasthan State Agricultural Marketing Board (RSAMB)',
      isVerified: true,
      history: generate30DayHistory(5580, 1.1)
    },
    {
      cropName: 'Soybean',
      marketName: 'Kota Mandi Yard',
      state: 'Rajasthan',
      district: 'Kota',
      variety: 'JS 9560 Cleaned',
      minPrice: 4300,
      maxPrice: 4680,
      modalPrice: 4520,
      priceChange24h: 30,
      percentChange24h: 0.67,
      arrivalsTonnes: 280,
      demandLevel: 'Moderate',
      source: 'Agmarknet / RSAMB Gateway',
      isVerified: true,
      history: generate30DayHistory(4450, 0.9)
    },

    // Delhi - Azadpur Mandi
    {
      cropName: 'Onion',
      marketName: 'Azadpur Mandi',
      state: 'Delhi',
      district: 'North Delhi',
      variety: 'Nasik Red Super',
      minPrice: 2350,
      maxPrice: 2950,
      modalPrice: 2650,
      priceChange24h: 110,
      percentChange24h: 4.33,
      arrivalsTonnes: 920,
      demandLevel: 'High',
      source: 'Agmarknet / Delhi Agricultural Marketing Board (DAMB)',
      isVerified: true,
      history: generate30DayHistory(2480, 1.9)
    },
    {
      cropName: 'Wheat',
      marketName: 'Azadpur Mandi',
      state: 'Delhi',
      district: 'North Delhi',
      variety: 'Desi Sharbati Fine',
      minPrice: 2550,
      maxPrice: 2900,
      modalPrice: 2720,
      priceChange24h: 20,
      percentChange24h: 0.74,
      arrivalsTonnes: 450,
      demandLevel: 'High',
      source: 'Agmarknet / DAMB Gateway',
      isVerified: true,
      history: generate30DayHistory(2660, 0.6)
    },

    // Karnataka - Yeshwanthpur APMC Market
    {
      cropName: 'Maize',
      marketName: 'Yeshwanthpur APMC Market',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      variety: 'Yellow Feed Quality',
      minPrice: 2100,
      maxPrice: 2380,
      modalPrice: 2240,
      priceChange24h: 20,
      percentChange24h: 0.90,
      arrivalsTonnes: 390,
      demandLevel: 'High',
      source: 'Agmarknet / Karnataka State Agricultural Marketing Board (KSAMB)',
      isVerified: true,
      history: generate30DayHistory(2190, 0.7)
    },
    {
      cropName: 'Groundnut',
      marketName: 'Yeshwanthpur APMC Market',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      variety: 'TMV-2 Pods',
      minPrice: 6200,
      maxPrice: 6800,
      modalPrice: 6520,
      priceChange24h: 40,
      percentChange24h: 0.62,
      arrivalsTonnes: 210,
      demandLevel: 'Moderate',
      source: 'Agmarknet / KSAMB Gateway',
      isVerified: true,
      history: generate30DayHistory(6410, 0.8)
    },
    {
      cropName: 'Paddy (Dhan)',
      marketName: 'Yeshwanthpur APMC Market',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      variety: 'Sona Masoori Raw',
      minPrice: 2250,
      maxPrice: 2550,
      modalPrice: 2380,
      priceChange24h: 30,
      percentChange24h: 1.28,
      arrivalsTonnes: 350,
      demandLevel: 'High',
      source: 'Agmarknet / KSAMB Gateway',
      isVerified: true,
      history: generate30DayHistory(2310, 0.9)
    }
  ];

  const pricePredictions = [
    {
      cropName: 'Soybean',
      marketName: 'Indore Krishi Upaj Mandi',
      currentPrice: 4500,
      forecast1d: { price: 4530, percentChange: 0.67, trend: 'UP' },
      forecast3d: { price: 4590, percentChange: 2.0, trend: 'UP' },
      forecast7d: { price: 4716, percentChange: 4.8, trend: 'UP' },
      forecast14d: { price: 4650, percentChange: 3.33, trend: 'DOWN' },
      forecast30d: { price: 4810, percentChange: 6.89, trend: 'UP' },
      confidencePercent: 84,
      riskLevel: 'Low',
      factors: [
        { factorName: 'Crushers Demand', impact: 'Positive', description: 'Solvent extraction plants in Malwa region increasing crushing capacities before export season.' },
        { factorName: 'Rainfall Delay', impact: 'Positive', description: 'Late monsoon arrivals temporarily tightening spot supply across Maharashtra & MP.' },
        { factorName: 'Global Edible Oil', impact: 'Positive', description: 'Palm oil international prices trending upwards +2.4% this week.' }
      ],
      aiInsight: 'Prices are showing a strong upward trend over the next 5-7 days. Storing your harvest for approximately 5 days is expected to deliver a net gain of ₹326/quintal even after accounting for warehouse storage costs.',
      recommendationAction: 'WAIT_5_DAYS',
      disclaimer: 'AI prediction — actual market prices may vary based on mandi physical arrival volumes and official quality inspection.'
    },
    {
      cropName: 'Wheat',
      marketName: 'Indore Krishi Upaj Mandi',
      currentPrice: 2620,
      forecast1d: { price: 2625, percentChange: 0.19, trend: 'STABLE' },
      forecast3d: { price: 2640, percentChange: 0.76, trend: 'UP' },
      forecast7d: { price: 2660, percentChange: 1.53, trend: 'UP' },
      forecast14d: { price: 2680, percentChange: 2.29, trend: 'UP' },
      forecast30d: { price: 2710, percentChange: 3.44, trend: 'UP' },
      confidencePercent: 89,
      riskLevel: 'Low',
      factors: [
        { factorName: 'FCI Procurement Buffer', impact: 'Neutral', description: 'Stable government open market sales keeping price variations in tight bands.' },
        { factorName: 'Flour Millers Demand', impact: 'Positive', description: 'Steady local retail wheat flour consumption across central India.' }
      ],
      aiInsight: 'Wheat price movement is steady with low volatility. Selling now or within 3 days is recommended to save working capital unless low-cost home storage is already available.',
      recommendationAction: 'SELL_NOW',
      disclaimer: 'AI prediction — actual market prices may vary based on mandi physical arrival volumes.'
    }
  ];

  const governmentSchemes = [
    {
      schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      shortCode: 'PM-KISAN',
      department: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture',
      state: 'All India / Central',
      category: 'Income Support',
      summary: 'Direct income support of ₹6,000 per year in three equal 4-monthly installments of ₹2,000 directly transferred into Aadhaar-linked bank accounts.',
      eligibility: {
        targetFarmers: ['Small & Marginal Farmers', 'All Landholding Farmer Families'],
        landSizeMaxAcres: 999,
        landSizeMinAcres: 0.1,
        applicableCrops: ['All Crops'],
        irrigationRequirement: 'Any',
        stateSpecific: false,
        criteriaDescription: 'All landholding farmer families with cultivable landholding in their names, subject to standard institutional/high-income tax exclusion criteria.'
      },
      benefits: {
        financialAmount: '₹6,000 per annum (3 installments of ₹2,000 each)',
        subsidyPercent: '100% Direct Benefit Transfer (DBT)',
        benefitDescription: 'Guaranteed liquidity to meet input costs and household necessities without taking high-interest informal debt.'
      },
      documents: [
        'Aadhaar Card (Mandatory)',
        'Land Ownership Record (Khasra / Khatauni Copy)',
        'Aadhaar-seeded Bank Passbook & Account Details',
        'Mobile Number linked to Aadhaar'
      ],
      applicationProcess: [
        { stepNumber: 1, title: 'Self Registration on Portal', instruction: 'Visit pmkisan.gov.in and click "Farmers Corner" -> "New Farmer Registration".' },
        { stepNumber: 2, title: 'Aadhaar Verification', instruction: 'Enter Aadhaar number and captcha, choose your state, and verify via OTP.' },
        { stepNumber: 3, title: 'Enter Land & Bank Details', instruction: 'Fill village, survey/khasra number, land holding size in hectares, and bank IFSC code.' },
        { stepNumber: 4, title: 'Patwari / Nodal Officer Verification', instruction: 'District revenue department verifies the submitted land record electronically.' }
      ],
      officialUrl: 'https://pmkisan.gov.in',
      lastVerified: 'August 2024',
      status: 'Active',
      isCentralScheme: true,
      helpDeskContact: '155261 / 1800-115-526 (PM-KISAN Helpline)'
    },
    {
      schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      shortCode: 'PMFBY',
      department: 'Ministry of Agriculture & Farmers Welfare',
      state: 'All India / Central',
      category: 'Crop Insurance',
      summary: 'Comprehensive crop insurance against non-preventable natural risks (drought, flood, unseasonal rains, pest attacks) with minimal farmer premium.',
      eligibility: {
        targetFarmers: ['All Farmers (Loanee and Non-Loanee)'],
        landSizeMaxAcres: 999,
        landSizeMinAcres: 0,
        applicableCrops: ['Soybean', 'Wheat', 'Chana', 'Cotton', 'Paddy', 'Mustard'],
        irrigationRequirement: 'Any',
        stateSpecific: false,
        criteriaDescription: 'Available for all farmers growing notified crops in notified areas, including sharecroppers and tenant farmers with sowing certificates.'
      },
      benefits: {
        financialAmount: 'Sum insured up to 100% cost of cultivation',
        subsidyPercent: 'Farmers pay only 2% for Kharif, 1.5% for Rabi, 5% for Commercial/Horticultural crops. Balance premium paid 50:50 by Center and State.',
        benefitDescription: 'Fast automated claim settlement via satellite, drone, and remote sensing crop cutting experiments.'
      },
      documents: [
        'Aadhaar Card',
        'Land Ownership Certificate (Bhu-Abhilekh / Khasra)',
        'Sowing Certificate / Declaration issued by Patwari or Sarpanch',
        'Bank Passbook with active IFSC and account number'
      ],
      applicationProcess: [
        { stepNumber: 1, title: 'Check Notified Crop Window', instruction: 'Check crop cut-off dates on pmfby.gov.in (July 31 for Kharif, Dec 31 for Rabi).' },
        { stepNumber: 2, title: 'Apply via CSC / Bank or Portal', instruction: 'Submit through CSC (Common Service Centre) or directly through National Crop Insurance Portal.' },
        { stepNumber: 3, title: 'Premium Payment', instruction: 'Pay nominal 2% Kharif / 1.5% Rabi premium amount online or at branch.' }
      ],
      officialUrl: 'https://pmfby.gov.in',
      lastVerified: 'September 2024',
      status: 'Active',
      isCentralScheme: true,
      helpDeskContact: '14447 (PMFBY Crop Insurance Toll Free Help Desk)'
    },
    {
      schemeName: 'Agriculture Infrastructure Fund (AIF)',
      shortCode: 'AIF',
      department: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
      state: 'All India / Central',
      category: 'Warehouse & Infrastructure',
      summary: 'Medium-long term debt financing for post-harvest management infrastructure including Warehouses, Cold Stores, Silos, Sorting/Grading units.',
      eligibility: {
        targetFarmers: ['Individual Farmers', 'FPOs', 'PACS', 'Agri-entrepreneurs', 'Self Help Groups'],
        landSizeMaxAcres: 999,
        landSizeMinAcres: 0,
        applicableCrops: ['All Crops'],
        irrigationRequirement: 'Any',
        stateSpecific: false,
        criteriaDescription: 'Farmers and farmer groups seeking to build storage, cleaning, drying, or processing assets to eliminate distress sale.'
      },
      benefits: {
        financialAmount: 'Loans up to ₹2 Crore per project with 3% interest subvention',
        subsidyPercent: '3% per annum interest subvention for up to 7 years + CGTMSE credit guarantee fee paid by Govt',
        benefitDescription: 'Enables farmers to establish their own on-farm scientific storage and sell when market rates are highest.'
      },
      documents: [
        'Aadhaar Card and PAN Card',
        'Detailed Project Report (DPR) for Warehouse / Sorting Unit',
        'Land ownership or long-term registered lease deed',
        'Bank Statements (Last 6 months)'
      ],
      applicationProcess: [
        { stepNumber: 1, title: 'Register on AIF Portal', instruction: 'Visit agriinfra.dac.gov.in and register as Farmer / FPO applicant.' },
        { stepNumber: 2, title: 'Upload Project DPR', instruction: 'Choose project type (e.g. 500 Tonne Grain Warehouse), enter cost, and upload basic DPR.' },
        { stepNumber: 3, title: 'Bank Evaluation & Sanction', instruction: 'Chosen participating bank verifies and sanctions loan with interest subvention coded directly.' }
      ],
      officialUrl: 'https://agriinfra.dac.gov.in',
      lastVerified: 'July 2024',
      status: 'Active',
      isCentralScheme: true,
      helpDeskContact: '011-23382012 (AIF PMU Cell)'
    },
    {
      schemeName: 'National Agriculture Market (e-NAM)',
      shortCode: 'E-NAM',
      department: 'Small Farmers Agri-Business Consortium (SFAC), MoA&FW',
      state: 'All India / Central',
      category: 'Procurement & Price Support',
      summary: 'Pan-India electronic trading portal networking APMC mandis to create a unified national market for agricultural commodities.',
      eligibility: {
        targetFarmers: ['All Farmers with harvest to sell'],
        landSizeMaxAcres: 999,
        landSizeMinAcres: 0,
        applicableCrops: ['Soybean', 'Wheat', 'Chana', 'Mustard', 'All 200+ listed commodities'],
        irrigationRequirement: 'Any',
        stateSpecific: false,
        criteriaDescription: 'Any farmer can bring their produce to an e-NAM integrated APMC mandi or trade through FPO collective sales.'
      },
      benefits: {
        financialAmount: 'Transparent online bidding from buyers across multiple states',
        subsidyPercent: 'Zero listing fee for farmers; direct online settlement to bank accounts within 24 hours',
        benefitDescription: 'Higher net price realization through competitive national-level digital auctions and electronic assaying.'
      },
      documents: [
        'Aadhaar Card',
        'Bank Passbook Copy for electronic payment transfer',
        'Mobile Number for SMS lot status and bid alerts'
      ],
      applicationProcess: [
        { stepNumber: 1, title: 'Lot Registration at Mandi Gate', instruction: 'Show produce at mandi entry; receive unique e-NAM lot ID and weighment slip.' },
        { stepNumber: 2, title: 'Quality Assaying Lab', instruction: 'Mandi lab checks moisture, foreign matter, and assigns digital quality certificate.' },
        { stepNumber: 3, title: 'Bidding & Acceptance', instruction: 'Buyers across India place bids online; farmer accepts best bid on their phone.' }
      ],
      officialUrl: 'https://enam.gov.in',
      lastVerified: 'August 2024',
      status: 'Active',
      isCentralScheme: true,
      helpDeskContact: '1800-270-0224 (e-NAM National Help Desk)'
    },
    {
      schemeName: 'Kisan Credit Card (KCC) Scheme',
      shortCode: 'KCC',
      department: 'NABARD & Department of Financial Services, Ministry of Finance',
      state: 'All India / Central',
      category: 'Agricultural Credit',
      summary: 'Timely and adequate credit support to meet short-term crop cultivation expenses and post-harvest maintenance at heavily subsidized interest rates.',
      eligibility: {
        targetFarmers: ['Individual Landowners', 'Joint Borrowers', 'Tenant Farmers', 'Oral Lessees'],
        landSizeMaxAcres: 999,
        landSizeMinAcres: 0.2,
        applicableCrops: ['All Crops'],
        irrigationRequirement: 'Any',
        stateSpecific: false,
        criteriaDescription: 'Farmers needing operational credit for seeds, fertilizers, diesel, pesticide, and post-harvest storage expenses.'
      },
      benefits: {
        financialAmount: 'Credit limit up to ₹3,00,000 without collateral up to ₹1,60,000',
        subsidyPercent: 'Effective interest rate of only 4% per annum upon prompt repayment (7% base - 3% prompt subvention)',
        benefitDescription: 'Revolving cash credit facility with ATM-enabled RuPay Kisan Card for easy input purchases.'
      },
      documents: [
        'Duly filled KCC application form',
        'Aadhaar Card and Voter ID / PAN',
        'Land Holding Records certified by Revenue Authority (Patwari)',
        'Cropping pattern details for the upcoming Kharif/Rabi seasons'
      ],
      applicationProcess: [
        { stepNumber: 1, title: 'Form Submission', instruction: 'Submit simplified one-page KCC form to local commercial bank, RRB, or Cooperative bank.' },
        { stepNumber: 2, title: 'Verification & Sanction', instruction: 'Bank calculates scale of finance based on acreage and issues RuPay KCC card within 14 days.' }
      ],
      officialUrl: 'https://www.nabard.org/content1.aspx?id=594&catid=23&mid=530',
      lastVerified: 'July 2024',
      status: 'Active',
      isCentralScheme: true,
      helpDeskContact: '1800-180-1111 (NABARD Kisan Support)'
    },
    {
      schemeName: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)',
      shortCode: 'PM-KUSUM',
      department: 'Ministry of New & Renewable Energy (MNRE)',
      state: 'All India / Central',
      category: 'Solar Agriculture',
      summary: 'Subsidies for installation of standalone off-grid solar agriculture pumps and solarisation of existing grid-connected agriculture pumps.',
      eligibility: {
        targetFarmers: ['Individual Farmers', 'Water User Associations', 'FPOs'],
        landSizeMaxAcres: 999,
        landSizeMinAcres: 0.5,
        applicableCrops: ['All Crops'],
        irrigationRequirement: 'Canal, Tube Well, Open Well',
        stateSpecific: false,
        criteriaDescription: 'Farmers in off-grid or diesel-pump reliant areas needing reliable daytime daytime solar power for tubewells and drip systems.'
      },
      benefits: {
        financialAmount: 'Up to 60% total capital subsidy (30% Central + 30% State Govt)',
        subsidyPercent: 'Farmer pays only 10% upfront; remaining 30% available via bank loan',
        benefitDescription: 'Eliminates recurring diesel expenses and ensures dependable daytime irrigation.'
      },
      documents: [
        'Aadhaar Card',
        'Land Records (Khasra/Khatauni) showing active irrigation water source (well/borewell)',
        'Bank Account Details',
        'No-Objection Certificate (NOC) if tube well is jointly owned'
      ],
      applicationProcess: [
        { stepNumber: 1, title: 'State Renewable Energy Portal', instruction: 'Apply online through state implementing agency (e.g., urja.mp.gov.in in MP).' },
        { stepNumber: 2, title: 'Site Inspection & Feasibility', instruction: 'Survey team verifies borehole water depth and pump requirement (3HP / 5HP / 7.5HP).' },
        { stepNumber: 3, title: 'Installation by Empanelled Vendor', instruction: 'Solar panels and solar pump installed with 5-year comprehensive maintenance warranty.' }
      ],
      officialUrl: 'https://pmkusum.mnre.gov.in',
      lastVerified: 'June 2024',
      status: 'Active',
      isCentralScheme: true,
      helpDeskContact: '1800-180-3333 (MNRE Solar Helpline)'
    },
    {
      schemeName: 'Soil Health Card Scheme',
      shortCode: 'SHC',
      department: 'Department of Agriculture, Cooperation & Farmers Welfare',
      state: 'All India / Central',
      category: 'Soil Health',
      summary: 'Provides soil health cards to farmers every 2 years with crop-wise nutrient status (N, P, K, micronutrients) and dosage recommendations.',
      eligibility: {
        targetFarmers: ['All Farmers with cultivable land'],
        landSizeMaxAcres: 999,
        landSizeMinAcres: 0,
        applicableCrops: ['All Crops'],
        irrigationRequirement: 'Any',
        stateSpecific: false,
        criteriaDescription: 'Open to all farmers in rural India through local Krishi Vigyan Kendra (KVK) or District Soil Testing Laboratory.'
      },
      benefits: {
        financialAmount: '100% Free Testing & Advisory Card',
        subsidyPercent: 'Zero cost to farmer',
        benefitDescription: 'Reduces excessive chemical fertilizer expenditure by 15-25% while improving soil biological vitality and crop yields.'
      },
      documents: [
        'Farmer Aadhaar / Mobile number',
        'Survey / Khasra number and village name'
      ],
      applicationProcess: [
        { stepNumber: 1, title: 'Soil Sample Collection', instruction: 'Department field staff or farmer collects grid-based soil sample using V-notch method.' },
        { stepNumber: 2, title: 'Lab Chemical Analysis', instruction: 'Sample tested for 12 parameters (pH, EC, Organic Carbon, N, P, K, S, Zn, Fe, Cu, Mn, Bo).' },
        { stepNumber: 3, title: 'Digital Card Generation', instruction: 'Card issued via SMS and downloadable directly on soilhealth.dac.gov.in.' }
      ],
      officialUrl: 'https://soilhealth.dac.gov.in',
      lastVerified: 'August 2024',
      status: 'Active',
      isCentralScheme: true,
      helpDeskContact: '011-24305591 (Soil Health Card Directorate)'
    },
    {
      schemeName: 'Mukhya Mantri Kisan Kalyan Yojana (MP)',
      shortCode: 'MMKKY-MP',
      department: 'Farmer Welfare & Agriculture Development Dept, Govt of Madhya Pradesh',
      state: 'Madhya Pradesh',
      category: 'Income Support',
      summary: 'State top-up income assistance of ₹6,000 per year (added on top of Central PM-KISAN ₹6,000) making a total of ₹12,000 annual support for MP farmers.',
      eligibility: {
        targetFarmers: ['Small, Marginal and All Registered Farmers in MP'],
        landSizeMaxAcres: 999,
        landSizeMinAcres: 0.1,
        applicableCrops: ['Soybean', 'Wheat', 'Chana', 'Gram', 'All Crops'],
        irrigationRequirement: 'Any',
        stateSpecific: true,
        criteriaDescription: 'Beneficiaries must be bonafide residents of Madhya Pradesh already validated under PM-KISAN database.'
      },
      benefits: {
        financialAmount: '₹6,000 per year in two installments of ₹3,000 each',
        subsidyPercent: '100% Direct DBT Transfer',
        benefitDescription: 'Transferred via SAARA portal into Aadhaar-linked active DBT bank account.'
      },
      documents: [
        'Samagra ID (MP Citizen ID)',
        'Aadhaar Card',
        'MP Land Record (Bhu-Abhilekh / Khasra Link)',
        'Active PM-KISAN Registration ID'
      ],
      applicationProcess: [
        { stepNumber: 1, title: 'Automatic Inclusion', instruction: 'Active PM-KISAN beneficiaries in MP are mapped via SAARA (saara.mp.gov.in).' },
        { stepNumber: 2, title: 'Patwari e-KYC Verification', instruction: 'Village Patwari confirms physical possession of land and active Aadhaar bank link.' }
      ],
      officialUrl: 'https://saara.mp.gov.in',
      lastVerified: 'September 2024',
      status: 'Active',
      isCentralScheme: false,
      helpDeskContact: '0755-2760000 (CM Helpline 181 MP)'
    }
  ];

  const governmentOffices = [
    {
      name: 'Krishi Vigyan Kendra (KVK) Kasturbagram, Indore',
      department: 'ICAR - Agricultural Extension Division',
      officeType: 'KVK',
      district: 'Indore',
      state: 'Madhya Pradesh',
      address: 'Kasturbagram Rural Institute, Khandwa Road, Indore - 452020',
      contactNumber: '0731-2780280',
      tollFreeHelpline: '1800-180-1551',
      email: 'kvk.indore@icar.gov.in',
      workingHours: 'Monday to Friday: 10:00 AM - 5:00 PM',
      servicesOffered: [
        'Crop Quality Testing & Soil Testing Lab',
        'Certified Foundation Seed Sales (Soybean JS 9560 / Sharbati Wheat)',
        'Farmer Training on Post-Harvest Handling & Storage',
        'Direct Agronomist Consultations'
      ],
      location: { lat: 22.6841, lng: 75.8943 },
      officialWebsite: 'https://kvk.icar.gov.in',
      verifiedOfficerDesignation: 'Senior Scientist & Head, KVK Indore'
    },
    {
      name: 'District Agriculture Office (Krishi Bhawan), Indore',
      department: 'Department of Farmer Welfare & Agriculture Development, Govt of MP',
      officeType: 'District Agriculture Office',
      district: 'Indore',
      state: 'Madhya Pradesh',
      address: 'Collectorate Campus, Moti Tabela, Indore - 452007',
      contactNumber: '0731-2538800',
      tollFreeHelpline: '181 (CM Helpline)',
      email: 'ddagri.indore@mp.gov.in',
      workingHours: 'Monday to Saturday: 10:30 AM - 5:30 PM (2nd & 4th Sat Off)',
      servicesOffered: [
        'Government Scheme Application Assistance (PM-KISAN, PMFBY)',
        'Farm Equipment & Tractor Subsidy Processing',
        'Farmer Grievance Redressal Cell',
        'Fertilizer and Pesticide Dealer Licensing'
      ],
      location: { lat: 22.7126, lng: 75.8577 },
      officialWebsite: 'https://mpkrishi.mp.gov.in',
      verifiedOfficerDesignation: 'Deputy Director of Agriculture (DDA), Indore'
    },
    {
      name: 'APMC Mandi Committee Office, Laxmibai Nagar',
      department: 'Madhya Pradesh State Agricultural Marketing Board (Mandi Board)',
      officeType: 'APMC Mandi Office',
      district: 'Indore',
      state: 'Madhya Pradesh',
      address: 'Krishi Upaj Mandi Samiti, Sanwer Road, Indore - 452015',
      contactNumber: '0731-2410882',
      tollFreeHelpline: '1800-233-1456',
      email: 'secretary.mandi.indore@mp.gov.in',
      workingHours: 'Monday to Saturday: 8:00 AM - 6:00 PM',
      servicesOffered: [
        'e-NAM Digital Lot Registration and e-Payment Settlement',
        'Electronic Weighbridge Calibration & Dispute Resolution',
        'Mandi Fee Verification & Direct Trader Licensing',
        'Kisan Rest House Accommodation'
      ],
      location: { lat: 22.7533, lng: 75.8937 },
      officialWebsite: 'https://mpmandiboard.co.in',
      verifiedOfficerDesignation: 'Secretary, Krishi Upaj Mandi Samiti, Indore'
    }
  ];

  const warehouses = [
    {
      name: 'MP Warehousing & Logistics Corp - Branch Indore #4',
      ownerType: 'CWC / State Warehousing Corp',
      storageType: 'Dry Warehouse',
      state: 'Madhya Pradesh',
      district: 'Indore',
      address: 'Industrial Area Sector A, Sanwer Road, Indore',
      location: { lat: 22.7610, lng: 75.8820 },
      totalCapacityTonnes: 12000,
      availableCapacityTonnes: 3450,
      ratePerQuintalPerDay: 2.2, // ₹2.2 / day / quintal
      rating: 4.8,
      wdraAccredited: true,
      insuranceCovered: true,
      contactPhone: '0731-2856123',
      features: ['WDRA Certified e-NWR Issued', '76% Pledge Financing Available via SBI/BOB', 'Fumigation & Pest Proofing', '24x7 CCTV Security']
    },
    {
      name: 'Malwa Modern Cold Storage & Agro Silos',
      ownerType: 'Private WDRA Accredited',
      storageType: 'Cold Storage',
      state: 'Madhya Pradesh',
      district: 'Dewas',
      address: 'Plot 42, Tata Export Bypass Road, Dewas',
      location: { lat: 22.9540, lng: 76.0310 },
      totalCapacityTonnes: 8500,
      availableCapacityTonnes: 1800,
      ratePerQuintalPerDay: 3.5,
      rating: 4.6,
      wdraAccredited: true,
      insuranceCovered: true,
      contactPhone: '07272-241900',
      features: ['Temperature Controlled (2°C - 10°C)', 'Multi-Chamber for Fruits/Vegetables/Seeds', 'Backup Diesel Generators', 'Scientific Moisture Control']
    },
    {
      name: 'Sanwer Primary Agri Cooperative Society (PACS) Godown',
      ownerType: 'Cooperative / PACS',
      storageType: 'Dry Warehouse',
      state: 'Madhya Pradesh',
      district: 'Indore',
      address: 'Main Market Road, Sanwer Tehsil, Indore',
      location: { lat: 22.9734, lng: 75.8288 },
      totalCapacityTonnes: 1500,
      availableCapacityTonnes: 420,
      ratePerQuintalPerDay: 1.8,
      rating: 4.4,
      wdraAccredited: false,
      insuranceCovered: true,
      contactPhone: '07321-222345',
      features: ['Village Level Convenient Drop-off', 'Subsidized Cooperative Rates', 'Tractor Unloading Ramp']
    }
  ];

  const transportProviders = [
    {
      operatorName: 'Indore Kisan Express Logistics',
      vehicleType: 'Pickup / Bolero Maxi (1.5T)',
      capacityTonnes: 1.5,
      driverName: 'Kisan Express Dispatch Desk',
      driverPhone: '+91 98260 41234',
      vehicleNumber: 'MP 09 GH 7124',
      baseFare: 300,
      ratePerKm: 22,
      rating: 4.9,
      totalTrips: 342,
      currentLocation: { district: 'Indore', lat: 22.7533, lng: 75.8937 },
      isAvailable: true
    },
    {
      operatorName: 'Gramin Krishi Parivahan Fleet',
      vehicleType: 'Tractor Trolley (2T)',
      capacityTonnes: 2.5,
      driverName: 'Gramin Fleet Support Desk',
      driverPhone: '+91 98261 88452',
      vehicleNumber: 'MP 09 EA 4190',
      baseFare: 200,
      ratePerKm: 16,
      rating: 4.7,
      totalTrips: 215,
      currentLocation: { district: 'Indore (Sanwer)', lat: 22.9734, lng: 75.8288 },
      isAvailable: true
    },
    {
      operatorName: 'Malwa Commercial Freight Carriers',
      vehicleType: 'Eicher Light Truck (4T)',
      capacityTonnes: 4.0,
      driverName: 'Regional Logistics Desk',
      driverPhone: '+91 98262 99014',
      vehicleNumber: 'MP 09 KV 8812',
      baseFare: 550,
      ratePerKm: 32,
      rating: 4.8,
      totalTrips: 510,
      currentLocation: { district: 'Dewas', lat: 22.9676, lng: 76.0534 },
      isAvailable: true
    }
  ];

  return {
    users,
    markets,
    crops,
    marketPrices,
    pricePredictions,
    governmentSchemes,
    governmentOffices,
    warehouses,
    transportProviders
  };
};

module.exports = { getSeedData };
