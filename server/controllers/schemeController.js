const { GovernmentSchemeService } = require('../services/governmentSchemeService');
const { isInMemory, memoryStore } = require('../utils/db');

// GET /api/schemes
const getSchemes = async (req, res) => {
  try {
    const schemes = await GovernmentSchemeService.getGovernmentSchemes(req.query);
    res.json({ success: true, count: schemes.length, schemes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/schemes/by-location
const getSchemesByLocation = async (req, res) => {
  try {
    const state = req.query.state || req.user?.state || req.user?.profile?.location?.state;
    const district = req.query.district || req.user?.district || req.user?.profile?.location?.district;
    const crop = req.query.crop;

    const userLocation = { state, district };
    const userProfile = {
      role: req.user?.role || 'FARMER',
      state,
      district,
      crop,
      farmerDetails: req.user?.farmerDetails || req.user?.profile?.farmerDetails || {}
    };

    const result = await GovernmentSchemeService.getGovernmentSchemesByLocation(userLocation, userProfile);
    res.json({ success: true, ...result, data: result.schemes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/schemes/eligibility
// Matches against authenticated user's profile OR provided query profile with strict location requirement
const checkEligibility = async (req, res) => {
  try {
    let profile = {};

    if (req.user) {
      profile = {
        name: req.user.name,
        role: req.user.role,
        state: req.user.state || req.user.profile?.location?.state,
        district: req.user.district || req.user.profile?.location?.district,
        village: req.user.village || req.user.profile?.location?.village,
        farmerDetails: req.user.farmerDetails || req.user.profile?.farmerDetails || {},
        ...req.body
      };
    } else {
      profile = req.body || {};
    }

    const state = (profile.state || '').trim();
    const district = (profile.district || '').trim();

    if (!state) {
      return res.json({
        success: true,
        requiresLocationSelection: true,
        message: 'Please select your State and District to see verified government schemes applicable to your region.',
        totalEvaluated: 0,
        eligibleCount: 0,
        schemes: [],
        data: [],
        emptyStateMessage: 'Currently, no verified matching government scheme was found for your selected location and profile.'
      });
    }

    const result = await GovernmentSchemeService.getGovernmentSchemesByLocation(
      { state, district },
      profile
    );

    res.json({
      success: true,
      data: result.schemes,
      schemes: result.schemes,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/schemes/offices (Government Connect Help Desk)
const getHelpDeskOffices = async (req, res) => {
  try {
    const state = req.params.state || req.query.state;
    const district = req.params.district || req.query.district;

    if (isInMemory()) {
      let offices = [...memoryStore.governmentOffices];
      if (state) offices = offices.filter(o => o.state?.toLowerCase().includes(state.toLowerCase()));
      if (district) offices = offices.filter(o => o.district?.toLowerCase().includes(district.toLowerCase()));
      return res.json({ success: true, count: offices.length, offices });
    }
    const GovernmentOffice = require('../models/GovernmentOffice');
    const query = {};
    if (state) query.state = new RegExp(state, 'i');
    if (district) query.district = new RegExp(district, 'i');

    const offices = await GovernmentOffice.find(query);
    res.json({ success: true, count: offices.length, offices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/schemes/grievance
const createGrievance = async (req, res) => {
  try {
    const {
      category = 'PM-KISAN Installment Not Credited',
      subject,
      description,
      department = 'Department of Agriculture',
      district = '',
      state = '',
      farmerName: explicitName,
      farmerPhone: explicitPhone
    } = req.body;

    const farmerName = req.user ? req.user.name : (explicitName || 'Citizen Applicant');
    const farmerPhone = req.user ? req.user.phone : (explicitPhone || 'Not Provided');
    const trackingNumber = `GRV-${(state || 'NAT').substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const grievanceData = {
      trackingNumber,
      farmerId: req.user ? req.user._id : undefined,
      farmerName,
      farmerPhone,
      department,
      category,
      subject: subject || `${category} - Official Inquiry`,
      description: description || 'Citizen inquiry submitted through platform.',
      district: district || (req.user ? req.user.district : 'Central'),
      state: state || (req.user ? req.user.state : 'National'),
      status: 'Submitted',
      filingDate: new Date(),
      assignedOfficer: `District Agricultural Grievance Officer, ${district || 'Central'}`
    };

    if (isInMemory()) {
      if (!memoryStore.grievances) memoryStore.grievances = [];
      memoryStore.grievances.push(grievanceData);
      if (!memoryStore.supportTickets) memoryStore.supportTickets = [];
      memoryStore.supportTickets.unshift({
        _id: `tkt_${Date.now()}`,
        ticketId: trackingNumber,
        userId: req.user ? req.user._id : undefined,
        name: farmerName,
        phone: farmerPhone,
        email: req.user?.email || '',
        category: 'Government Scheme',
        subject: `[${category}] ${subject || 'Citizen Grievance'}`,
        message: description || 'Citizen inquiry submitted through platform.',
        priority: 'High',
        status: 'Open',
        assignedTo: grievanceData.assignedOfficer,
        createdAt: new Date(),
        replies: []
      });
    } else {
      const Grievance = require('../models/Grievance');
      const doc = new Grievance(grievanceData);
      await doc.save();

      // Mirror to SupportTicket for unified Admin Helpdesk
      try {
        const SupportTicket = require('../models/SupportTicket');
        const existingTicket = await SupportTicket.findOne({ ticketId: trackingNumber });
        if (!existingTicket) {
          const ticketDoc = new SupportTicket({
            ticketId: trackingNumber,
            userId: req.user ? req.user._id?.toString() : undefined,
            name: farmerName,
            phone: farmerPhone,
            email: req.user?.email || '',
            category: 'Government Scheme',
            subject: `[${category}] ${subject || 'Citizen Grievance'}`,
            message: description || 'Citizen inquiry submitted through platform.',
            priority: 'High',
            status: 'Open',
            assignedTo: grievanceData.assignedOfficer
          });
          await ticketDoc.save();
        }
      } catch (mirrorErr) {
        console.warn('SupportTicket mirror warning:', mirrorErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Government grievance registered successfully with the portal.',
      grievance: grievanceData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/schemes/grievance/:trackingNumber
// Tracks grievance status in real time across Grievances and SupportTickets
const getGrievanceByTracking = async (req, res) => {
  try {
    const rawTracking = (req.params.trackingNumber || '').trim();
    if (!rawTracking) {
      return res.status(400).json({ success: false, message: 'Tracking number is required.' });
    }

    let grievance = null;

    if (isInMemory()) {
      grievance = (memoryStore.grievances || []).find(g => 
        g.trackingNumber?.toUpperCase() === rawTracking.toUpperCase()
      );
    } else {
      const Grievance = require('../models/Grievance');
      grievance = await Grievance.findOne({
        trackingNumber: { $regex: new RegExp(`^${rawTracking}$`, 'i') }
      });
    }

    // Fallback: check SupportTicket if not in Grievance collection
    if (!grievance) {
      const SupportTicket = require('../models/SupportTicket');
      let ticket = null;
      if (isInMemory()) {
        ticket = (memoryStore.supportTickets || []).find(t => 
          t.ticketId?.toUpperCase() === rawTracking.toUpperCase()
        );
      } else {
        ticket = await SupportTicket.findOne({
          ticketId: { $regex: new RegExp(`^${rawTracking}$`, 'i') }
        });
      }

      if (ticket) {
        grievance = {
          trackingNumber: ticket.ticketId,
          farmerName: ticket.name,
          farmerPhone: ticket.phone,
          department: 'Department of Agriculture Support',
          category: ticket.category,
          subject: ticket.subject,
          description: ticket.message,
          district: 'Central',
          state: 'National',
          status: ticket.status === 'Open' ? 'Submitted' : ticket.status,
          assignedOfficer: ticket.assignedTo || 'Senior Agricultural Nodal Officer',
          filingDate: ticket.createdAt,
          officialResponse: ticket.replies && ticket.replies.length > 0 
            ? ticket.replies[ticket.replies.length - 1].message 
            : ''
        };
      }
    }

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: `No grievance found with tracking number ${rawTracking}. Please verify and try again.`
      });
    }

    res.json({
      success: true,
      grievance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSchemes,
  getSchemesByLocation,
  checkEligibility,
  getHelpDeskOffices,
  createGrievance,
  getGrievanceByTracking
};

