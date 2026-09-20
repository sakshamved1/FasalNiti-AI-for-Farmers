const { isInMemory, memoryStore } = require('../utils/db');
const { sendUserVerificationNotification } = require('../services/notificationService');

// Helper to write to audit log
const logAdminAction = async ({ admin, action, entity, entityId, details, oldValue, newValue, req }) => {
  const auditData = {
    _id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    adminId: admin._id || admin.id || 'admin',
    adminName: admin.name || 'Administrator',
    action,
    entity,
    entityId: String(entityId),
    details,
    oldValue: oldValue || null,
    newValue: newValue || null,
    ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1',
    userAgent: req ? (req.headers['user-agent'] || '') : '',
    createdAt: new Date()
  };

  if (isInMemory()) {
    if (!memoryStore.auditLogs) memoryStore.auditLogs = [];
    memoryStore.auditLogs.unshift(auditData);
    return;
  }

  try {
    const AuditLog = require('../models/AuditLog');
    const doc = new AuditLog(auditData);
    await doc.save();
  } catch (err) {
    console.warn('Audit log write error:', err.message);
  }
};

/**
 * GET /api/admin/overview
 * Real live platform metrics aggregated from actual database
 */
const getOverview = async (req, res) => {
  try {
    if (isInMemory()) {
      const users = memoryStore.users || [];
      const farmersCount = users.filter(u => u.role === 'FARMER').length;
      const buyersCount = users.filter(u => u.role === 'BUYER').length;
      const fposCount = users.filter(u => u.role === 'FPO').length;

      const listings = memoryStore.listings || [];
      const offers = memoryStore.offers || [];
      const tickets = memoryStore.supportTickets || [];
      const schemes = memoryStore.governmentSchemes || [];

      return res.json({
        success: true,
        stats: {
          totalUsers: users.length,
          farmersCount,
          buyersCount,
          fposCount,
          activeListingsCount: listings.length,
          totalOffersCount: offers.length,
          dealsCompleted: offers.filter(o => o.status === 'Accepted').length,
          verifiedSchemesCount: schemes.filter(s => s.status === 'Active').length,
          tickets: {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'Open').length,
            underReview: tickets.filter(t => t.status === 'Under Review').length,
            resolved: tickets.filter(t => t.status === 'Resolved').length,
            urgent: tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').length
          }
        }
      });
    }

    const User = require('../models/User');
    const Listing = require('../models/Listing');
    const Offer = require('../models/Offer');
    const GovernmentScheme = require('../models/GovernmentScheme');
    const SupportTicket = require('../models/SupportTicket');
    const Grievance = require('../models/Grievance');

    const [
      totalUsers,
      farmersCount,
      buyersCount,
      fposCount,
      activeListingsCount,
      totalOffersCount,
      dealsCompleted,
      verifiedSchemesCount,
      openTickets,
      underReviewTickets,
      resolvedTickets,
      urgentTickets,
      submittedGrievances,
      reviewGrievances,
      resolvedGrievances
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'FARMER' }),
      User.countDocuments({ role: 'BUYER' }),
      User.countDocuments({ role: 'FPO' }),
      Listing.countDocuments({ status: 'ACTIVE' }),
      Offer.countDocuments(),
      Offer.countDocuments({ status: 'Accepted' }),
      GovernmentScheme.countDocuments({ status: { $in: ['Active', 'ACTIVE'] } }),
      SupportTicket.countDocuments({ status: 'Open' }),
      SupportTicket.countDocuments({ status: 'Under Review' }),
      SupportTicket.countDocuments({ status: 'Resolved' }),
      SupportTicket.countDocuments({ priority: 'Urgent', status: { $nin: ['Resolved', 'Closed'] } }),
      Grievance.countDocuments({ status: 'Submitted' }),
      Grievance.countDocuments({ status: { $in: ['Under Review', 'Action Taken'] } }),
      Grievance.countDocuments({ status: 'Resolved' })
    ]);

    const MarketPrice = require('../models/MarketPrice');
    const { getDbStatus } = require('../config/db');
    const latestPrice = await MarketPrice.findOne().sort({ priceDate: -1, createdAt: -1 });
    const dbStatus = getDbStatus();

    const totalOpenTickets = openTickets + submittedGrievances;
    const totalUnderReviewTickets = underReviewTickets + reviewGrievances;
    const totalResolvedTickets = resolvedTickets + resolvedGrievances;

    res.json({
      success: true,
      stats: {
        totalUsers,
        farmersCount,
        buyersCount,
        fposCount,
        activeListingsCount,
        totalOffersCount,
        dealsCompleted,
        verifiedSchemesCount,
        tickets: {
          total: totalOpenTickets + totalUnderReviewTickets + totalResolvedTickets,
          open: totalOpenTickets,
          underReview: totalUnderReviewTickets,
          resolved: totalResolvedTickets,
          urgent: urgentTickets
        }
      },
      databaseHealth: {
        atlasStatus: dbStatus.connected ? 'Connected' : 'Disconnected',
        clusterHost: dbStatus.host,
        database: dbStatus.name,
        mandiDataSource: latestPrice ? 'Healthy' : 'Unavailable',
        lastSuccessfulFetch: latestPrice ? (latestPrice.fetchedAt || latestPrice.lastVerifiedAt || latestPrice.createdAt) : new Date(),
        latestPriceDate: latestPrice ? (latestPrice.priceDate || latestPrice.date) : new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/users
 * Search and filter registered users by role, state, district, verification, status
 */
const getUsers = async (req, res) => {
  try {
    const { role, state, district, status, verified, q } = req.query;

    if (isInMemory()) {
      let list = [...(memoryStore.users || [])];

      if (role && role !== 'ALL') {
        list = list.filter(u => u.role === role.toUpperCase());
      }
      if (state) {
        list = list.filter(u => u.state?.toLowerCase().includes(state.toLowerCase()));
      }
      if (district) {
        list = list.filter(u => u.district?.toLowerCase().includes(district.toLowerCase()));
      }
      if (status && status !== 'ALL') {
        list = list.filter(u => u.status === status);
      }
      if (verified !== undefined && verified !== '') {
        const isVer = verified === 'true';
        list = list.filter(u => Boolean(u.verified) === isVer);
      }
      if (q && q.trim()) {
        const search = q.trim().toLowerCase();
        list = list.filter(u => 
          u.name?.toLowerCase().includes(search) ||
          u.phone?.includes(search) ||
          u.email?.toLowerCase().includes(search)
        );
      }

      // Hide passwords
      const sanitized = list.map(u => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });

      return res.json({ success: true, count: sanitized.length, users: sanitized });
    }

    const User = require('../models/User');
    const query = {};

    if (role && role !== 'ALL') query.role = role.toUpperCase();
    if (state) query.state = new RegExp(state, 'i');
    if (district) query.district = new RegExp(district, 'i');
    if (status && status !== 'ALL') query.status = status;
    if (verified !== undefined && verified !== '') query.verified = verified === 'true';
    if (q && q.trim()) {
      query.$or = [
        { name: new RegExp(q.trim(), 'i') },
        { phone: new RegExp(q.trim(), 'i') },
        { email: new RegExp(q.trim(), 'i') }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Activate, deactivate, suspend, or verify a user
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verified } = req.body;

    if (isInMemory()) {
      const user = memoryStore.users.find(u => u._id === id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      const oldStatus = user.status;
      const oldVerified = user.verified;

      if (status) user.status = status;
      if (verified !== undefined) user.verified = Boolean(verified);
      user.updatedAt = new Date();

      await logAdminAction({
        admin: req.user,
        action: 'UPDATE_USER_STATUS',
        entity: 'User',
        entityId: id,
        details: `Changed user ${user.name} (${user.role}) status: ${oldStatus} -> ${user.status}, verified: ${oldVerified} -> ${user.verified}`,
        oldValue: { status: oldStatus, verified: oldVerified },
        newValue: { status: user.status, verified: user.verified },
        req
      });

      const notifResult = await sendUserVerificationNotification({
        user,
        verifiedBy: req.user,
        status: user.status,
        verified: user.verified,
        io: req.app.get('io')
      });

      const copy = { ...user };
      delete copy.password;
      return res.json({ 
        success: true, 
        message: 'User updated successfully.', 
        user: copy,
        notification: notifResult
      });
    }

    const User = require('../models/User');
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const oldStatus = user.status;
    const oldVerified = user.verified;

    if (status) user.status = status;
    if (verified !== undefined) user.verified = Boolean(verified);
    await user.save();

    await logAdminAction({
      admin: req.user,
      action: 'UPDATE_USER_STATUS',
      entity: 'User',
      entityId: id,
      details: `Changed user ${user.name} (${user.role}) status: ${oldStatus} -> ${user.status}, verified: ${oldVerified} -> ${user.verified}`,
      oldValue: { status: oldStatus, verified: oldVerified },
      newValue: { status: user.status, verified: user.verified },
      req
    });

    const notifResult = await sendUserVerificationNotification({
      user,
      verifiedBy: req.user,
      status: user.status,
      verified: user.verified,
      io: req.app.get('io')
    });

    res.json({ 
      success: true, 
      message: 'User updated successfully.', 
      user,
      notification: notifResult
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete user according to policy
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInMemory()) {
      const idx = memoryStore.users.findIndex(u => u._id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'User not found.' });
      const removed = memoryStore.users.splice(idx, 1)[0];

      await logAdminAction({
        admin: req.user,
        action: 'DELETE_USER',
        entity: 'User',
        entityId: id,
        details: `Deleted user account: ${removed.name} (${removed.phone}, ${removed.role})`,
        oldValue: { name: removed.name, phone: removed.phone, role: removed.role },
        req
      });

      return res.json({ success: true, message: `User ${removed.name} has been deleted.` });
    }

    const User = require('../models/User');
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await logAdminAction({
      admin: req.user,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: id,
      details: `Deleted user account: ${user.name} (${user.phone}, ${user.role})`,
      oldValue: { name: user.name, phone: user.phone, role: user.role },
      req
    });

    res.json({ success: true, message: `User ${user.name} has been deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/schemes
 * Admin view of all government schemes
 */
const getSchemes = async (req, res) => {
  try {
    if (isInMemory()) {
      return res.json({ success: true, schemes: memoryStore.governmentSchemes || [] });
    }
    const GovernmentScheme = require('../models/GovernmentScheme');
    const schemes = await GovernmentScheme.find().sort({ createdAt: -1 });
    res.json({ success: true, schemes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/schemes
 * Create a new verified government scheme
 */
const createScheme = async (req, res) => {
  try {
    const {
      schemeName,
      shortCode,
      department,
      summary,
      category,
      states,
      districts,
      applicableCrops,
      farmerCategories,
      benefits,
      eligibility,
      documentsRequired,
      applicationSteps,
      officialUrl,
      status = 'Active'
    } = req.body;

    if (!schemeName || !shortCode || !department || !summary || !category || !officialUrl) {
      return res.status(400).json({
        success: false,
        message: 'schemeName, shortCode, department, summary, category and officialUrl are required.'
      });
    }

    const schemeData = {
      _id: `sch_${Date.now()}`,
      schemeName: schemeName.trim(),
      shortCode: shortCode.trim().toUpperCase(),
      department: department.trim(),
      summary: summary.trim(),
      category,
      states: states && states.length ? states : ['All India / Central'],
      districts: districts && districts.length ? districts : ['All Districts'],
      applicableCrops: applicableCrops && applicableCrops.length ? applicableCrops : ['All Crops'],
      farmerCategories: farmerCategories && farmerCategories.length ? farmerCategories : ['All Categories'],
      benefits: benefits || { benefitDescription: 'Government welfare assistance.' },
      eligibility: eligibility || { criteriaDescription: 'Standard landholder criteria.' },
      documentsRequired: documentsRequired || ['Aadhaar Card', 'Land Record'],
      applicationSteps: applicationSteps || [],
      officialUrl: officialUrl.trim(),
      status,
      verifiedBy: req.user ? req.user.name : 'System Administrator',
      lastVerifiedAt: 'September 2026',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isInMemory()) {
      if (!memoryStore.governmentSchemes) memoryStore.governmentSchemes = [];
      memoryStore.governmentSchemes.unshift(schemeData);

      await logAdminAction({
        admin: req.user,
        action: 'CREATE_SCHEME',
        entity: 'GovernmentScheme',
        entityId: schemeData.shortCode,
        details: `Created verified scheme: ${schemeData.schemeName} (${schemeData.shortCode})`,
        newValue: schemeData,
        req
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('platform_update', {
          id: `notif_${Date.now()}`,
          type: 'NEW_SCHEME',
          title: `📜 नई सरकारी योजना: ${schemeData.schemeName}`,
          message: `${schemeData.department} द्वारा नई योजना शुरू की गई।`,
          time: 'Just now',
          link: '/schemes'
        });
      }

      return res.status(201).json({ success: true, message: 'Scheme created successfully.', scheme: schemeData });
    }

    const GovernmentScheme = require('../models/GovernmentScheme');
    const doc = new GovernmentScheme(schemeData);
    await doc.save();

    await logAdminAction({
      admin: req.user,
      action: 'CREATE_SCHEME',
      entity: 'GovernmentScheme',
      entityId: doc._id,
      details: `Created verified scheme: ${doc.schemeName} (${doc.shortCode})`,
      newValue: doc,
      req
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('platform_update', {
        id: `notif_${Date.now()}`,
        type: 'NEW_SCHEME',
        title: `📜 नई सरकारी योजना: ${doc.schemeName}`,
        message: `${doc.department} द्वारा नई योजना शुरू की गई।`,
        time: 'Just now',
        link: '/schemes'
      });
    }

    res.status(201).json({ success: true, message: 'Scheme created successfully.', scheme: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/schemes/:id
 * Edit government scheme and verify/expire
 */
const updateScheme = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInMemory()) {
      const scheme = (memoryStore.governmentSchemes || []).find(s => s._id === id || s.shortCode === id);
      if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found.' });

      const oldScheme = { ...scheme };
      Object.assign(scheme, req.body);
      scheme.lastVerifiedAt = 'September 2026';
      scheme.verifiedBy = req.user ? req.user.name : 'System Administrator';
      scheme.updatedAt = new Date();

      await logAdminAction({
        admin: req.user,
        action: 'UPDATE_SCHEME',
        entity: 'GovernmentScheme',
        entityId: id,
        details: `Updated government scheme: ${scheme.schemeName}`,
        oldValue: oldScheme,
        newValue: scheme,
        req
      });

      return res.json({ success: true, message: 'Scheme updated successfully.', scheme });
    }

    const GovernmentScheme = require('../models/GovernmentScheme');
    const scheme = await GovernmentScheme.findByIdAndUpdate(
      id,
      { 
        $set: { 
          ...req.body, 
          lastVerifiedAt: 'September 2026', 
          verifiedBy: req.user.name,
          updatedAt: new Date() 
        } 
      },
      { new: true }
    );

    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found.' });

    await logAdminAction({
      admin: req.user,
      action: 'UPDATE_SCHEME',
      entity: 'GovernmentScheme',
      entityId: id,
      details: `Updated government scheme: ${scheme.schemeName}`,
      newValue: scheme,
      req
    });

    res.json({ success: true, message: 'Scheme updated successfully.', scheme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/admin/schemes/:id
 * Deactivate / delete scheme
 */
const deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInMemory()) {
      const idx = (memoryStore.governmentSchemes || []).findIndex(s => s._id === id || s.shortCode === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Scheme not found.' });
      const deleted = memoryStore.governmentSchemes.splice(idx, 1)[0];

      await logAdminAction({
        admin: req.user,
        action: 'DELETE_SCHEME',
        entity: 'GovernmentScheme',
        entityId: id,
        details: `Deleted government scheme: ${deleted.schemeName}`,
        oldValue: deleted,
        req
      });

      return res.json({ success: true, message: `Scheme ${deleted.schemeName} deleted successfully.` });
    }

    const GovernmentScheme = require('../models/GovernmentScheme');
    const deleted = await GovernmentScheme.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Scheme not found.' });

    await logAdminAction({
      admin: req.user,
      action: 'DELETE_SCHEME',
      entity: 'GovernmentScheme',
      entityId: id,
      details: `Deleted government scheme: ${deleted.schemeName}`,
      oldValue: deleted,
      req
    });

    res.json({ success: true, message: `Scheme ${deleted.schemeName} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/tickets
 * Support Help Center tickets with status/category filter
 */
const getTickets = async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    if (isInMemory()) {
      let tickets = [...(memoryStore.supportTickets || [])];
      (memoryStore.grievances || []).forEach(g => {
        if (!tickets.some(t => t.ticketId === g.trackingNumber)) {
          tickets.push({
            _id: g.trackingNumber,
            ticketId: g.trackingNumber,
            userId: g.farmerId,
            name: g.farmerName,
            phone: g.farmerPhone,
            email: '',
            category: g.category || 'Government Scheme',
            subject: g.subject,
            message: g.description,
            priority: 'High',
            status: g.status === 'Submitted' ? 'Open' : g.status === 'Action Taken' ? 'Under Review' : g.status,
            assignedTo: g.assignedOfficer,
            department: g.department,
            state: g.state,
            district: g.district,
            createdAt: g.filingDate || new Date(),
            replies: g.officialResponse ? [{
              senderName: g.assignedOfficer || 'Nodal Officer',
              senderRole: 'ADMIN',
              message: g.officialResponse,
              createdAt: g.resolvedDate || g.filingDate
            }] : []
          });
        }
      });

      if (status && status !== 'ALL') tickets = tickets.filter(t => t.status === status);
      if (category && category !== 'ALL') tickets = tickets.filter(t => t.category === category);
      if (priority && priority !== 'ALL') tickets = tickets.filter(t => t.priority === priority);
      return res.json({ success: true, count: tickets.length, tickets });
    }

    const SupportTicket = require('../models/SupportTicket');
    const Grievance = require('../models/Grievance');

    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (category && category !== 'ALL') query.category = category;
    if (priority && priority !== 'ALL') query.priority = priority;

    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });

    // Build grievance query mapping
    const grievanceQuery = {};
    if (status && status !== 'ALL') {
      if (status === 'Open') grievanceQuery.status = { $in: ['Submitted', 'Open'] };
      else if (status === 'Under Review') grievanceQuery.status = { $in: ['Under Review', 'Action Taken'] };
      else grievanceQuery.status = status;
    }
    if (category && category !== 'ALL' && category !== 'Government Scheme') {
      grievanceQuery.category = category;
    }

    const grievances = await Grievance.find(grievanceQuery).sort({ filingDate: -1, createdAt: -1 });

    const existingTicketIds = new Set(tickets.map(t => t.ticketId));
    const formattedGrievances = grievances
      .filter(g => !existingTicketIds.has(g.trackingNumber))
      .map(g => ({
        _id: g._id.toString(),
        ticketId: g.trackingNumber,
        userId: g.farmerId ? g.farmerId.toString() : undefined,
        name: g.farmerName,
        phone: g.farmerPhone,
        email: '',
        category: g.category || 'Government Scheme',
        subject: g.subject,
        message: g.description,
        priority: 'High',
        status: g.status === 'Submitted' ? 'Open' : g.status === 'Action Taken' ? 'Under Review' : g.status,
        assignedTo: g.assignedOfficer,
        department: g.department,
        state: g.state,
        district: g.district,
        createdAt: g.filingDate || g.createdAt,
        updatedAt: g.updatedAt,
        replies: g.officialResponse ? [{
          senderName: g.assignedOfficer || 'Agriculture Nodal Officer',
          senderRole: 'ADMIN',
          message: g.officialResponse,
          createdAt: g.resolvedDate || g.updatedAt || g.filingDate
        }] : []
      }));

    const combined = [...tickets, ...formattedGrievances].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: combined.length, tickets: combined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/admin/tickets/:id/reply
 * Admin responds to support ticket or grievance, changes status, adds internal note
 */
const replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status, isInternal = false, assignedTo } = req.body;

    const adminName = req.user ? req.user.name : 'System Administrator';

    if (isInMemory()) {
      let ticket = (memoryStore.supportTickets || []).find(t => t._id === id || t.ticketId === id);
      const grievance = (memoryStore.grievances || []).find(g => g.trackingNumber === id || g._id === id);

      if (!ticket && grievance) {
        ticket = {
          _id: grievance.trackingNumber,
          ticketId: grievance.trackingNumber,
          userId: grievance.farmerId,
          name: grievance.farmerName,
          phone: grievance.farmerPhone,
          category: grievance.category || 'Government Scheme',
          subject: grievance.subject,
          message: grievance.description,
          priority: 'High',
          status: 'Open',
          assignedTo: grievance.assignedOfficer,
          createdAt: grievance.filingDate,
          replies: []
        };
        memoryStore.supportTickets.push(ticket);
      }

      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket / Grievance not found.' });

      const oldStatus = ticket.status;

      if (message && message.trim()) {
        ticket.replies.push({
          senderId: req.user ? req.user._id : 'admin',
          senderName: adminName,
          senderRole: 'ADMIN',
          message: message.trim(),
          isInternal: Boolean(isInternal),
          createdAt: new Date()
        });
      }

      if (status) ticket.status = status;
      if (assignedTo) ticket.assignedTo = assignedTo;
      ticket.updatedAt = new Date();
      if (status === 'Resolved' || status === 'Closed') ticket.resolvedAt = new Date();

      if (grievance) {
        if (message && message.trim()) grievance.officialResponse = message.trim();
        if (status) grievance.status = status === 'Resolved' ? 'Resolved' : status === 'Closed' ? 'Rejected' : 'Action Taken';
        if (assignedTo) grievance.assignedOfficer = assignedTo;
        if (status === 'Resolved') grievance.resolvedDate = new Date();
      }

      await logAdminAction({
        admin: req.user,
        action: 'REPLY_TICKET',
        entity: 'SupportTicket',
        entityId: ticket.ticketId,
        details: `Admin ${adminName} replied to ticket ${ticket.ticketId}. Status: ${oldStatus} -> ${ticket.status} (${isInternal ? 'Internal Note' : 'Public Reply'})`,
        oldValue: { status: oldStatus },
        newValue: { status: ticket.status },
        req
      });

      return res.json({ success: true, message: 'Ticket updated successfully.', ticket });
    }

    const SupportTicket = require('../models/SupportTicket');
    const Grievance = require('../models/Grievance');

    let ticket = await SupportTicket.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ticketId: id }].filter(Boolean)
    });

    const grievance = await Grievance.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { trackingNumber: id }].filter(Boolean)
    });

    if (!ticket && !grievance) {
      return res.status(404).json({ success: false, message: 'Ticket or Grievance not found.' });
    }

    if (!ticket && grievance) {
      ticket = new SupportTicket({
        ticketId: grievance.trackingNumber,
        userId: grievance.farmerId ? grievance.farmerId.toString() : undefined,
        name: grievance.farmerName,
        phone: grievance.farmerPhone,
        category: 'Government Scheme',
        subject: grievance.subject,
        message: grievance.description,
        priority: 'High',
        status: grievance.status === 'Submitted' ? 'Open' : grievance.status === 'Action Taken' ? 'Under Review' : grievance.status,
        assignedTo: grievance.assignedOfficer
      });
    }

    const oldStatus = ticket.status;

    if (message && message.trim()) {
      ticket.replies.push({
        senderId: req.user ? req.user._id : 'admin',
        senderName: adminName,
        senderRole: 'ADMIN',
        message: message.trim(),
        isInternal: Boolean(isInternal),
        createdAt: new Date()
      });
    }

    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    if (status === 'Resolved' || status === 'Closed') ticket.resolvedAt = new Date();
    await ticket.save();

    if (grievance) {
      if (message && message.trim()) grievance.officialResponse = message.trim();
      if (status) grievance.status = status === 'Resolved' ? 'Resolved' : status === 'Closed' ? 'Rejected' : 'Action Taken';
      if (assignedTo) grievance.assignedOfficer = assignedTo;
      if (status === 'Resolved') grievance.resolvedDate = new Date();
      await grievance.save();
    }

    await logAdminAction({
      admin: req.user,
      action: 'REPLY_TICKET',
      entity: 'SupportTicket',
      entityId: ticket.ticketId,
      details: `Admin ${adminName} replied to ticket ${ticket.ticketId}. Status: ${oldStatus} -> ${ticket.status} (${isInternal ? 'Internal Note' : 'Public Reply'})`,
      oldValue: { status: oldStatus },
      newValue: { status: ticket.status },
      req
    });

    res.json({ success: true, message: 'Ticket updated successfully.', ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/admin/audit-logs
 * Retrieve admin audit logs
 */
const getAuditLogs = async (req, res) => {
  try {
    if (isInMemory()) {
      const logs = (memoryStore.auditLogs || []).slice(0, 100);
      return res.json({ success: true, count: logs.length, logs });
    }
    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOverview,
  getUsers,
  updateUserStatus,
  deleteUser,
  getSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  getTickets,
  replyTicket,
  getAuditLogs
};
