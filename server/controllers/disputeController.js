const { isInMemory, memoryStore } = require('../utils/db');

// GET /api/disputes or GET /api/disputes/user/:userId
const getDisputes = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId;

    if (isInMemory()) {
      let list = [...memoryStore.disputes];
      if (userId) list = list.filter(d => d.raisedBy === userId);
      return res.json({ success: true, count: list.length, disputes: list });
    }
    const Dispute = require('../models/Dispute');
    const query = userId ? { raisedBy: userId } : {};
    const disputes = await Dispute.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: disputes.length, disputes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// POST /api/disputes (Raise Dispute)
const createDispute = async (req, res) => {
  try {
    const {
      orderId,
      category = 'Payment',
      subject,
      description,
      claimAmount = 0
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to raise a dispute' });
    }

    const disputeId = `DSP-KS-${Math.floor(100000 + Math.random() * 900000)}`;
    const raisedByName = req.user.name;
    const raisedBy = req.user._id;

    const disputeData = {
      disputeId,
      orderId,
      raisedBy,
      raisedByName,
      category,
      subject,
      description,
      claimAmount: Number(claimAmount),
      status: 'Raised',
      createdAt: new Date()
    };

    if (isInMemory()) {
      const created = { _id: `dsp_${Date.now()}`, ...disputeData };
      memoryStore.disputes.unshift(created);
      return res.status(201).json({ success: true, dispute: created });
    }

    const Dispute = require('../models/Dispute');
    const created = await Dispute.create(disputeData);
    res.status(201).json({ success: true, dispute: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/disputes/:id (Admin resolves dispute)
const updateDisputeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResolutionNotes } = req.body;

    if (isInMemory()) {
      const dispute = memoryStore.disputes.find(d => d._id === id || d.disputeId === id);
      if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

      dispute.status = status;
      if (adminResolutionNotes) dispute.adminResolutionNotes = adminResolutionNotes;
      if (status === 'Resolved') dispute.resolvedAt = new Date();
      return res.json({ success: true, dispute });
    }

    const Dispute = require('../models/Dispute');
    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    dispute.status = status;
    if (adminResolutionNotes) dispute.adminResolutionNotes = adminResolutionNotes;
    if (status === 'Resolved') dispute.resolvedAt = new Date();
    await dispute.save();

    res.json({ success: true, dispute });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDisputes,
  createDispute,
  updateDisputeStatus
};
