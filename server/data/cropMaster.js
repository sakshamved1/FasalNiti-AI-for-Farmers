/**
 * Server Crop Master Dataset for KisanSetu AI
 * CommonJS format for backend services & AI controllers
 */

const CROP_CATEGORIES = [
  { id: 'CEREALS', nameEn: 'Cereals & Millets', nameHi: 'अनाज और मोटे अनाज' },
  { id: 'PULSES', nameEn: 'Pulses & Legumes', nameHi: 'दलहन / दालें' },
  { id: 'OILSEEDS', nameEn: 'Oilseeds', nameHi: 'तिलहन' },
  { id: 'CASH_CROPS', nameEn: 'Cash & Commercial Crops', nameHi: 'व्यावसायिक फसलें' },
  { id: 'VEGETABLES', nameEn: 'Vegetables', nameHi: 'सब्जियां' },
  { id: 'FRUITS', nameEn: 'Fruits', nameHi: 'फल' },
  { id: 'SPICES', nameEn: 'Spices & Condiments', nameHi: 'मसाले' },
  { id: 'OTHER', nameEn: 'Other Crops', nameHi: 'अन्य फसलें' }
];

const CROP_MASTER_LIST = [
  // Cereals & Millets
  { id: 'wheat', name: 'Wheat', hindiName: 'गेहूं', category: 'CEREALS', typicalMsp: 2275, unit: 'quintal' },
  { id: 'paddy_common', name: 'Paddy (Common / Dhan)', hindiName: 'धान (साधारण)', category: 'CEREALS', typicalMsp: 2183, unit: 'quintal' },
  { id: 'paddy_basmati', name: 'Paddy (Basmati)', hindiName: 'बासमती धान', category: 'CEREALS', typicalMsp: 3800, unit: 'quintal' },
  { id: 'maize', name: 'Maize (Makka)', hindiName: 'मक्का', category: 'CEREALS', typicalMsp: 2090, unit: 'quintal' },
  { id: 'barley', name: 'Barley (Jau)', hindiName: 'जौ', category: 'CEREALS', typicalMsp: 1850, unit: 'quintal' },
  { id: 'bajra', name: 'Pearl Millet (Bajra)', hindiName: 'बाजरा', category: 'CEREALS', typicalMsp: 2500, unit: 'quintal' },
  { id: 'jowar', name: 'Sorghum (Jowar)', hindiName: 'ज्वार', category: 'CEREALS', typicalMsp: 3180, unit: 'quintal' },
  { id: 'ragi', name: 'Finger Millet (Ragi)', hindiName: 'रागी / मड़ुआ', category: 'CEREALS', typicalMsp: 3846, unit: 'quintal' },

  // Pulses
  { id: 'gram', name: 'Gram / Chana', hindiName: 'चना (देसी)', category: 'PULSES', typicalMsp: 5440, unit: 'quintal' },
  { id: 'kabuli_chana', name: 'Kabuli Chana (Chickpeas)', hindiName: 'काबुली चना / डॉलर चना', category: 'PULSES', typicalMsp: 9200, unit: 'quintal' },
  { id: 'tur_arhar', name: 'Tur / Arhar (Pigeon Pea)', hindiName: 'तुअर / अरहर', category: 'PULSES', typicalMsp: 7000, unit: 'quintal' },
  { id: 'moong', name: 'Moong (Green Gram)', hindiName: 'मूंग दाल', category: 'PULSES', typicalMsp: 8558, unit: 'quintal' },
  { id: 'urad', name: 'Urad (Black Gram)', hindiName: 'उड़द', category: 'PULSES', typicalMsp: 6950, unit: 'quintal' },
  { id: 'masoor', name: 'Masoor (Lentil)', hindiName: 'मसूर', category: 'PULSES', typicalMsp: 6425, unit: 'quintal' },
  { id: 'peas', name: 'Field Peas (Matar)', hindiName: 'हरा / सूखा मटर', category: 'PULSES', typicalMsp: 4200, unit: 'quintal' },
  { id: 'rajma', name: 'Rajma (Kidney Beans)', hindiName: 'राजमा', category: 'PULSES', typicalMsp: 8500, unit: 'quintal' },

  // Oilseeds
  { id: 'soybean', name: 'Soybean', hindiName: 'सोयाबीन', category: 'OILSEEDS', typicalMsp: 4600, unit: 'quintal' },
  { id: 'mustard', name: 'Mustard / Rapeseed (Sarson)', hindiName: 'सरसों / राई', category: 'OILSEEDS', typicalMsp: 5650, unit: 'quintal' },
  { id: 'groundnut', name: 'Groundnut (Peanut)', hindiName: 'मूंगफली', category: 'OILSEEDS', typicalMsp: 6377, unit: 'quintal' },
  { id: 'sunflower', name: 'Sunflower Seed', hindiName: 'सूरजमुखी बीज', category: 'OILSEEDS', typicalMsp: 6760, unit: 'quintal' },
  { id: 'sesame', name: 'Sesame (Til)', hindiName: 'तिल', category: 'OILSEEDS', typicalMsp: 8635, unit: 'quintal' },
  { id: 'castor', name: 'Castor Seed (Arandi)', hindiName: 'अरंडी बीज', category: 'OILSEEDS', typicalMsp: 5800, unit: 'quintal' },
  { id: 'linseed', name: 'Linseed (Alsi)', hindiName: 'अलसी', category: 'OILSEEDS', typicalMsp: 5400, unit: 'quintal' },

  // Cash Crops
  { id: 'cotton_medium', name: 'Cotton (Kapas Medium)', hindiName: 'कपास (मध्यम रेशा)', category: 'CASH_CROPS', typicalMsp: 6620, unit: 'quintal' },
  { id: 'cotton_long', name: 'Cotton (Kapas Long)', hindiName: 'कपास (लंबा रेशा)', category: 'CASH_CROPS', typicalMsp: 7020, unit: 'quintal' },
  { id: 'sugarcane', name: 'Sugarcane (Ganna)', hindiName: 'गन्ना (FRP)', category: 'CASH_CROPS', typicalMsp: 340, unit: 'quintal' },
  { id: 'jute', name: 'Raw Jute (Patson)', hindiName: 'कच्चा पटसन', category: 'CASH_CROPS', typicalMsp: 5050, unit: 'quintal' },

  // Vegetables
  { id: 'onion', name: 'Onion (Pyaz)', hindiName: 'प्याज', category: 'VEGETABLES', typicalMsp: 1800, unit: 'quintal' },
  { id: 'potato', name: 'Potato (Aloo)', hindiName: 'आलू', category: 'VEGETABLES', typicalMsp: 1200, unit: 'quintal' },
  { id: 'tomato', name: 'Tomato (Tamatar)', hindiName: 'टमाटर', category: 'VEGETABLES', typicalMsp: 1600, unit: 'quintal' },
  { id: 'garlic', name: 'Garlic (Lahsun)', hindiName: 'लहसुन', category: 'VEGETABLES', typicalMsp: 8500, unit: 'quintal' },
  { id: 'ginger', name: 'Ginger (Adrak)', hindiName: 'अदरक', category: 'VEGETABLES', typicalMsp: 6500, unit: 'quintal' },
  { id: 'green_chilli', name: 'Green Chilli (Hari Mirch)', hindiName: 'हरी मिर्च', category: 'VEGETABLES', typicalMsp: 3200, unit: 'quintal' },
  { id: 'cauliflower', name: 'Cauliflower (Phoolgobhi)', hindiName: 'फूलगोभी', category: 'VEGETABLES', typicalMsp: 1400, unit: 'quintal' },
  { id: 'cabbage', name: 'Cabbage (Pattagobhi)', hindiName: 'पत्तागोभी', category: 'VEGETABLES', typicalMsp: 1100, unit: 'quintal' },
  { id: 'okra', name: 'Okra / Ladyfinger (Bhindi)', hindiName: 'भिंडी', category: 'VEGETABLES', typicalMsp: 2400, unit: 'quintal' },
  { id: 'brinjal', name: 'Brinjal / Eggplant (Baingan)', hindiName: 'बैंगन', category: 'VEGETABLES', typicalMsp: 1300, unit: 'quintal' },

  // Fruits
  { id: 'mango', name: 'Mango (Aam)', hindiName: 'आम', category: 'FRUITS', typicalMsp: 4500, unit: 'quintal' },
  { id: 'banana', name: 'Banana (Kela)', hindiName: 'केला', category: 'FRUITS', typicalMsp: 1800, unit: 'quintal' },
  { id: 'apple', name: 'Apple (Seb)', hindiName: 'सेब', category: 'FRUITS', typicalMsp: 7500, unit: 'quintal' },
  { id: 'orange', name: 'Orange / Kinnow (Santra)', hindiName: 'संतरा / किन्नू', category: 'FRUITS', typicalMsp: 3200, unit: 'quintal' },
  { id: 'pomegranate', name: 'Pomegranate (Anar)', hindiName: 'अनार', category: 'FRUITS', typicalMsp: 8000, unit: 'quintal' },
  { id: 'grapes', name: 'Grapes (Angoor)', hindiName: 'अंगूर', category: 'FRUITS', typicalMsp: 5500, unit: 'quintal' },
  { id: 'guava', name: 'Guava (Amrood)', hindiName: 'अमरूद', category: 'FRUITS', typicalMsp: 2200, unit: 'quintal' },
  { id: 'papaya', name: 'Papaya (Papita)', hindiName: 'पपीता', category: 'FRUITS', typicalMsp: 1700, unit: 'quintal' },

  // Spices
  { id: 'turmeric', name: 'Turmeric (Haldi)', hindiName: 'हल्दी', category: 'SPICES', typicalMsp: 13500, unit: 'quintal' },
  { id: 'coriander', name: 'Coriander Seed (Dhaniya)', hindiName: 'धनिया बीज', category: 'SPICES', typicalMsp: 7200, unit: 'quintal' },
  { id: 'cumin', name: 'Cumin (Jeera)', hindiName: 'जीरा', category: 'SPICES', typicalMsp: 24000, unit: 'quintal' },
  { id: 'fennel', name: 'Fennel Seed (Saunf)', hindiName: 'सौंफ', category: 'SPICES', typicalMsp: 11000, unit: 'quintal' },
  { id: 'fenugreek', name: 'Fenugreek (Methi Dana)', hindiName: 'मेथी दाना', category: 'SPICES', typicalMsp: 5800, unit: 'quintal' },
  { id: 'red_chilli_dry', name: 'Dry Red Chilli (Lal Mirch)', hindiName: 'सूखी लाल मिर्च', category: 'SPICES', typicalMsp: 18500, unit: 'quintal' },
  { id: 'black_pepper', name: 'Black Pepper (Kali Mirch)', hindiName: 'काली मिर्च', category: 'SPICES', typicalMsp: 48000, unit: 'quintal' },
  { id: 'cardamom', name: 'Green Cardamom (Elaichi)', hindiName: 'हरी इलायची', category: 'SPICES', typicalMsp: 140000, unit: 'quintal' },

  // Other option
  { id: 'other', name: 'Other', hindiName: 'अन्य (अपनी फसल लिखें)', category: 'OTHER', isCustom: true }
];

const findCropByName = (query = '') => {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  return CROP_MASTER_LIST.find(
    c => c.name.toLowerCase() === q ||
         c.hindiName.toLowerCase() === q ||
         c.id.toLowerCase() === q ||
         q.includes(c.name.toLowerCase()) ||
         c.name.toLowerCase().includes(q)
  );
};

module.exports = {
  CROP_CATEGORIES,
  CROP_MASTER_LIST,
  findCropByName
};
