const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isInMemory, memoryStore } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fasalniti_secure_jwt_secret_key_prod_892347';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      email: user.email || '',
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Calculate profile completion percentage and missing fields
const calculateProfileCompletion = (user) => {
  let score = 0;
  const missing = [];

  if (user.name && user.name.trim()) score += 15;
  else missing.push({ field: 'name', label: 'Full Name' });

  if (user.phone || user.email) score += 15;

  if (user.state && user.state.trim() && user.district && user.district.trim()) {
    score += 25;
  } else {
    if (!user.state) missing.push({ field: 'state', label: 'State' });
    if (!user.district) missing.push({ field: 'district', label: 'District' });
  }

  if (user.village && user.village.trim()) score += 10;
  else missing.push({ field: 'village', label: 'Village / City' });

  if (user.preferredLanguage) score += 10;

  // Role-specific check
  if (user.role === 'FARMER') {
    const crops = user.farmerDetails?.primaryCrops || [];
    const land = user.farmerDetails?.landSizeAcres || 0;
    if (crops.length > 0 && land > 0) {
      score += 25;
    } else {
      if (crops.length === 0) missing.push({ field: 'crops', label: 'Primary Crops' });
      if (land <= 0) missing.push({ field: 'landSizeAcres', label: 'Land Size (Acres)' });
    }
  } else if (user.role === 'BUYER') {
    const bName = user.buyerDetails?.businessName;
    const reqCrops = user.buyerDetails?.requiredCrops || [];
    if (bName && reqCrops.length > 0) {
      score += 25;
    } else {
      if (!bName) missing.push({ field: 'businessName', label: 'Business / Firm Name' });
      if (reqCrops.length === 0) missing.push({ field: 'requiredCrops', label: 'Procurement Crops' });
    }
  } else if (user.role === 'FPO') {
    const fName = user.fpoDetails?.fpoName;
    const mCount = user.fpoDetails?.memberCount || 0;
    if (fName && mCount > 0) {
      score += 25;
    } else {
      if (!fName) missing.push({ field: 'fpoName', label: 'FPO Name' });
      if (mCount <= 0) missing.push({ field: 'memberCount', label: 'Member Count' });
    }
  } else {
    score += 25;
  }

  return {
    percentage: Math.min(score, 100),
    missingFields: missing,
    recommendationPrompt: missing.length > 0 
      ? `Complete your profile (${missing.map(m => m.label).join(', ')}) to receive better government scheme and market recommendations.` 
      : 'Your profile is 100% complete! Optimal scheme matching and market price discoveries are active.'
  };
};

// Sanitize user before response
const sanitizeUser = (user) => {
  const completion = calculateProfileCompletion(user);
  const u = { ...(user.toObject ? user.toObject() : user) };
  delete u.password;
  u.profileCompletion = completion;
  return u;
};

// Register - Farmers, Buyers, FPOs, Transporters, Warehouses
const register = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      password, 
      role = 'FARMER', 
      state = '', 
      district = '', 
      village = '', 
      preferredLanguage = 'en',
      farmerDetails,
      buyerDetails,
      fpoDetails
    } = req.body;

    const rawPhone = phone || req.body.mobile || '';
    if (!name || !rawPhone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, mobile number and password are required.' 
      });
    }

    // Protect admin role from unauthorized creation
    const requestedRole = role.toUpperCase();
    if (requestedRole === 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Administrator account creation is restricted to system configuration.' 
      });
    }

    const cleanPhone = rawPhone.trim();
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isInMemory()) {
      const existing = memoryStore.users.find(u => 
        u.phone === cleanPhone || (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
      );
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'An account with this mobile number or email already exists.' 
        });
      }

      const newUser = {
        _id: `usr_${Date.now()}`,
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        password: hashedPassword,
        role: requestedRole,
        state,
        district,
        village,
        preferredLanguage,
        verified: false,
        status: 'Active',
        avatar: '',
        farmerDetails: requestedRole === 'FARMER' ? {
          landSizeAcres: Number(farmerDetails?.landSizeAcres) || 0,
          landCategory: farmerDetails?.landCategory || 'Small',
          irrigationType: farmerDetails?.irrigationType || 'Rainfed',
          primaryCrops: farmerDetails?.primaryCrops || [],
          annualIncome: Number(farmerDetails?.annualIncome) || 0,
          kccHolder: Boolean(farmerDetails?.kccHolder),
          farmingActivity: farmerDetails?.farmingActivity || 'Crop Cultivation'
        } : {},
        buyerDetails: requestedRole === 'BUYER' ? {
          businessName: buyerDetails?.businessName || '',
          gstNumber: buyerDetails?.gstNumber || '',
          businessType: buyerDetails?.businessType || 'Wholesaler / Processor',
          verificationStatus: 'Pending',
          requiredCrops: buyerDetails?.requiredCrops || [],
          trustScore: 80,
          completedTransactions: 0,
          responseRatePercent: 100,
          disputeRatePercent: 0.0
        } : {},
        fpoDetails: requestedRole === 'FPO' ? {
          fpoName: fpoDetails?.fpoName || '',
          memberCount: Number(fpoDetails?.memberCount) || 0,
          totalAcreage: Number(fpoDetails?.totalAcreage) || 0,
          registrationNumber: fpoDetails?.registrationNumber || '',
          cropsHandled: fpoDetails?.cropsHandled || []
        } : {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      memoryStore.users.push(newUser);
      const token = generateToken(newUser);
      const sanitized = sanitizeUser(newUser);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: sanitized,
        data: { ...sanitized, token }
      });
    }

    // MongoDB Mode
    const User = require('../models/User');
    const existingUser = await User.findOne({
      $or: [
        { phone: cleanPhone },
        ...(cleanEmail ? [{ email: cleanEmail }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this mobile number or email already exists.' 
      });
    }

    const userDoc = new User({
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password: hashedPassword,
      role: requestedRole,
      state,
      district,
      village,
      preferredLanguage,
      verified: false,
      status: 'Active',
      farmerDetails: requestedRole === 'FARMER' ? farmerDetails : undefined,
      buyerDetails: requestedRole === 'BUYER' ? buyerDetails : undefined,
      fpoDetails: requestedRole === 'FPO' ? fpoDetails : undefined
    });

    await userDoc.save();
    const token = generateToken(userDoc);
    const sanitizedDoc = sanitizeUser(userDoc);
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: sanitizedDoc,
      data: { ...sanitizedDoc, token }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login - Supports Email or Phone + Password
const login = async (req, res) => {
  try {
    const { identifier, phone, email, password } = req.body;
    const searchKey = (identifier || email || phone || '').trim();

    if (!searchKey || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide mobile number / email and password.' 
      });
    }

    const isEmail = searchKey.includes('@');
    let user;

    if (isInMemory()) {
      if (isEmail) {
        user = memoryStore.users.find(u => u.email && u.email.toLowerCase() === searchKey.toLowerCase());
      } else {
        user = memoryStore.users.find(u => u.phone === searchKey || (u.email && u.email.toLowerCase() === searchKey.toLowerCase()));
      }
    } else {
      const User = require('../models/User');
      if (isEmail) {
        user = await User.findOne({ email: searchKey.toLowerCase() });
      } else {
        user = await User.findOne({
          $or: [
            { phone: searchKey },
            { email: searchKey.toLowerCase() }
          ]
        });
      }
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No registered account found with provided credentials. Please register first.' 
      });
    }

    if (user.status && user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${user.status}. Please contact system support.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password. Please check your password and try again.' 
      });
    }

    const token = generateToken(user);
    const sanitized = sanitizeUser(user);
    res.json({ 
      success: true, 
      token, 
      user: sanitized, 
      data: { ...sanitized, token } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Current User Profile
const getMe = async (req, res) => {
  try {
    res.json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      name,
      email,
      state,
      district,
      village,
      preferredLanguage,
      avatar,
      farmerDetails,
      buyerDetails,
      fpoDetails
    } = req.body;

    if (isInMemory()) {
      const user = memoryStore.users.find(u => u._id === userId || u.phone === req.user.phone);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      if (name) user.name = name.trim();
      if (email !== undefined) user.email = email.trim().toLowerCase();
      if (state !== undefined) user.state = state;
      if (district !== undefined) user.district = district;
      if (village !== undefined) user.village = village;
      if (preferredLanguage) user.preferredLanguage = preferredLanguage;
      if (avatar !== undefined) user.avatar = avatar;

      const finalFarmerDetails = farmerDetails || {
        ...(req.body.crops ? { primaryCrops: req.body.crops } : {}),
        ...(req.body.primaryCrops ? { primaryCrops: req.body.primaryCrops } : {}),
        ...(req.body.landSize ? { landSizeAcres: Number(req.body.landSize) } : {}),
        ...(req.body.landSizeAcres ? { landSizeAcres: Number(req.body.landSizeAcres) } : {}),
        ...(req.body.farmerCategory ? { landCategory: req.body.farmerCategory } : {}),
        ...(req.body.irrigationType ? { irrigationType: req.body.irrigationType } : {}),
        ...(req.body.farmingActivity ? { farmingActivity: req.body.farmingActivity } : {})
      };

      if (Object.keys(finalFarmerDetails).length > 0 && user.role === 'FARMER') {
        user.farmerDetails = {
          ...user.farmerDetails,
          ...finalFarmerDetails
        };
      }

      if (buyerDetails && user.role === 'BUYER') {
        user.buyerDetails = {
          ...user.buyerDetails,
          ...buyerDetails
        };
      }

      if (fpoDetails && user.role === 'FPO') {
        user.fpoDetails = {
          ...user.fpoDetails,
          ...fpoDetails
        };
      }

      user.updatedAt = new Date();
      const sanitizedUser = sanitizeUser(user);
      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: sanitizedUser,
        data: sanitizedUser
      });
    }

    // MongoDB Mode
    const User = require('../models/User');
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (state !== undefined) updateData.state = state;
    if (district !== undefined) updateData.district = district;
    if (village !== undefined) updateData.village = village;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
    if (avatar !== undefined) updateData.avatar = avatar;

    const finalFarmerDetails = farmerDetails || {
      ...(req.body.crops ? { primaryCrops: req.body.crops } : {}),
      ...(req.body.primaryCrops ? { primaryCrops: req.body.primaryCrops } : {}),
      ...(req.body.landSize ? { landSizeAcres: Number(req.body.landSize) } : {}),
      ...(req.body.landSizeAcres ? { landSizeAcres: Number(req.body.landSizeAcres) } : {}),
      ...(req.body.farmerCategory ? { landCategory: req.body.farmerCategory } : {}),
      ...(req.body.irrigationType ? { irrigationType: req.body.irrigationType } : {}),
      ...(req.body.farmingActivity ? { farmingActivity: req.body.farmingActivity } : {})
    };

    if (Object.keys(finalFarmerDetails).length > 0 && req.user.role === 'FARMER') {
      for (const key of Object.keys(finalFarmerDetails)) {
        updateData[`farmerDetails.${key}`] = finalFarmerDetails[key];
      }
    }
    if (buyerDetails && req.user.role === 'BUYER') {
      for (const key of Object.keys(buyerDetails)) {
        updateData[`buyerDetails.${key}`] = buyerDetails[key];
      }
    }
    if (fpoDetails && req.user.role === 'FPO') {
      for (const key of Object.keys(fpoDetails)) {
        updateData[`fpoDetails.${key}`] = fpoDetails[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const sanitizedDoc = sanitizeUser(updatedUser);
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: sanitizedDoc,
      data: sanitizedDoc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/buyers - List registered verified buyers
const getBuyers = async (req, res) => {
  try {
    let buyers = [];
    if (isInMemory()) {
      buyers = memoryStore.users
        .filter(u => u.role === 'BUYER' && u.status !== 'Deactivated')
        .map(u => ({
          id: u._id,
          name: u.buyerDetails?.businessName || u.name,
          businessName: u.buyerDetails?.businessName || u.name,
          rep: u.name,
          state: u.state,
          district: u.district,
          location: u.village ? `${u.village}, ${u.district}` : u.district,
          trustScore: u.buyerDetails?.trustScore || 80,
          completedDeals: u.buyerDetails?.completedDeals || 0,
          buyingCrops: u.buyerDetails?.requiredCrops || [],
          badge: u.verified ? 'AUDITED BUYER' : 'REGISTERED BUYER'
        }));
    } else {
      const User = require('../models/User');
      const buyerDocs = await User.find({ role: 'BUYER', status: { $ne: 'Deactivated' } }).select('-password');
      buyers = buyerDocs.map(u => ({
        id: u._id,
        name: u.buyerDetails?.businessName || u.name,
        businessName: u.buyerDetails?.businessName || u.name,
        rep: u.name,
        state: u.state,
        district: u.district,
        location: u.village ? `${u.village}, ${u.district}` : u.district,
        trustScore: u.buyerDetails?.trustScore || 80,
        completedDeals: u.buyerDetails?.completedDeals || 0,
        buyingCrops: u.buyerDetails?.requiredCrops || [],
        badge: u.verified ? 'AUDITED BUYER' : 'REGISTERED BUYER'
      }));
    }

    res.json({
      success: true,
      count: buyers.length,
      buyers,
      data: buyers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot-password
// Generates 6-digit OTP, stores expiry, returns WhatsApp quick-link and debugOtp
const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const searchKey = (identifier || '').trim();

    if (!searchKey) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered mobile number or email.'
      });
    }

    const isEmail = searchKey.includes('@');
    let user;

    if (isInMemory()) {
      user = memoryStore.users.find(u => 
        (isEmail && u.email && u.email.toLowerCase() === searchKey.toLowerCase()) ||
        (!isEmail && (u.phone === searchKey || (u.email && u.email.toLowerCase() === searchKey.toLowerCase())))
      );
    } else {
      const User = require('../models/User');
      user = await User.findOne(
        isEmail
          ? { email: searchKey.toLowerCase() }
          : { $or: [{ phone: searchKey }, { email: searchKey.toLowerCase() }] }
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with provided mobile number or email.'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;

    if (!isInMemory()) {
      await user.save();
    }

    // Mask phone / email
    const maskedPhone = user.phone 
      ? `${user.phone.slice(0, 2)}******${user.phone.slice(-2)}` 
      : '';
    const maskedEmail = user.email 
      ? `${user.email[0]}***@${user.email.split('@')[1]}` 
      : '';

    const whatsappMsg = `FasalNiti Security: Your 6-digit password reset OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${user.phone}&text=${encodeURIComponent(whatsappMsg)}`;

    console.log(`[AUTH] Password reset OTP generated for ${user.phone}: ${otp}`);

    res.json({
      success: true,
      message: 'A 6-digit verification OTP has been generated for your account.',
      maskedPhone,
      maskedEmail,
      whatsappUrl,
      debugOtp: otp
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/reset-password
// Verifies OTP, hashes new password with bcrypt, clears OTP, and returns active session token
const resetPassword = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    const searchKey = (identifier || '').trim();
    const inputOtp = (otp || '').trim();

    if (!searchKey || !inputOtp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Identifier (mobile/email), 6-digit OTP, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const isEmail = searchKey.includes('@');
    let user;

    if (isInMemory()) {
      user = memoryStore.users.find(u => 
        (isEmail && u.email && u.email.toLowerCase() === searchKey.toLowerCase()) ||
        (!isEmail && (u.phone === searchKey || (u.email && u.email.toLowerCase() === searchKey.toLowerCase())))
      );
    } else {
      const User = require('../models/User');
      user = await User.findOne(
        isEmail
          ? { email: searchKey.toLowerCase() }
          : { $or: [{ phone: searchKey }, { email: searchKey.toLowerCase() }] }
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with provided mobile number or email.'
      });
    }

    // Verify OTP
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== inputOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check the 6-digit code and try again.'
      });
    }

    // Check expiry
    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification OTP has expired. Please request a new OTP.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    user.updatedAt = new Date();

    if (!isInMemory()) {
      await user.save();
    }

    const token = generateToken(user);
    const sanitized = sanitizeUser(user);

    res.json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      token,
      user: sanitized,
      data: { ...sanitized, token }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot-username
// Allows users who forgot their login identifier (phone number or email) to locate their registered account
const forgotUsername = async (req, res) => {
  try {
    const { searchType = 'email', email, name, state, district } = req.body;

    if (searchType === 'email') {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail) {
        return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
      }

      let user;
      if (isInMemory()) {
        user = memoryStore.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
      } else {
        const User = require('../models/User');
        user = await User.findOne({ email: cleanEmail });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account registered with this email address.'
        });
      }

      return res.json({
        success: true,
        message: 'Account located successfully.',
        accounts: [{
          name: user.name,
          role: user.role,
          phone: user.phone,
          maskedPhone: `${user.phone.slice(0, 2)}******${user.phone.slice(-2)}`,
          email: user.email,
          state: user.state,
          district: user.district,
          village: user.village
        }]
      });
    }

    // Search by Name + Location
    const cleanName = (name || '').trim();
    if (!cleanName || cleanName.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please enter at least 3 characters of your registered name.'
      });
    }

    let accounts = [];

    if (isInMemory()) {
      accounts = memoryStore.users
        .filter(u => {
          const matchName = u.name.toLowerCase().includes(cleanName.toLowerCase());
          const matchState = !state || u.state?.toLowerCase() === state.toLowerCase();
          const matchDistrict = !district || u.district?.toLowerCase() === district.toLowerCase();
          return matchName && (matchState || matchDistrict);
        })
        .slice(0, 5)
        .map(u => ({
          name: u.name,
          role: u.role,
          maskedPhone: `${u.phone.slice(0, 2)}******${u.phone.slice(-2)}`,
          unmaskedLast4: u.phone.slice(-4),
          email: u.email ? `${u.email[0]}***@${u.email.split('@')[1]}` : '',
          state: u.state,
          district: u.district,
          village: u.village,
          registeredAt: u.createdAt
        }));
    } else {
      const User = require('../models/User');
      const query = {
        name: { $regex: new RegExp(cleanName, 'i') }
      };
      if (state) query.state = new RegExp(state, 'i');
      if (district) query.district = new RegExp(district, 'i');

      const docs = await User.find(query).limit(5).select('name role phone email state district village createdAt');
      accounts = docs.map(u => ({
        name: u.name,
        role: u.role,
        maskedPhone: `${u.phone.slice(0, 2)}******${u.phone.slice(-2)}`,
        unmaskedLast4: u.phone.slice(-4),
        email: u.email ? `${u.email[0]}***@${u.email.split('@')[1]}` : '',
        state: u.state,
        district: u.district,
        village: u.village,
        registeredAt: u.createdAt
      }));
    }

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching account found with provided Name and Location. Please verify spelling or try another district.'
      });
    }

    res.json({
      success: true,
      message: `Found ${accounts.length} matching account(s).`,
      accounts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  calculateProfileCompletion,
  getBuyers,
  forgotPassword,
  resetPassword,
  forgotUsername
};

