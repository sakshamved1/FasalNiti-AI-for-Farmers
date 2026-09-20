const { isInMemory, memoryStore } = require('../utils/db');

// Helper to generate Ticket ID: KS-2026-XXXXXX
const generateTicketId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `KS-2026-${randomNum}`;
};

/**
 * POST /api/support/tickets
 * Creates a new support ticket
 */
const createTicket = async (req, res) => {
  try {
    const { name, email, phone, category, subject, message, attachment, priority = 'Normal' } = req.body;

    const clientName = (name || (req.user && req.user.name) || '').trim();
    const clientPhone = (phone || (req.user && (req.user.phone || req.user.mobile)) || '').trim();
    const clientEmail = (email || (req.user && req.user.email) || '').trim().toLowerCase();

    if (!clientName || !clientPhone || !category || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile number, category, subject, and message are required.'
      });
    }

    const ticketId = generateTicketId();
    const userId = req.user ? (req.user._id || req.user.id) : (req.body.userId || 'GUEST');

    const ticketData = {
      _id: `tkt_${Date.now()}`,
      ticketId,
      userId,
      name: clientName,
      email: clientEmail,
      phone: clientPhone,
      category,
      subject: subject.trim(),
      message: message.trim(),
      attachment: attachment || '',
      priority,
      status: 'Open',
      assignedTo: 'Unassigned',
      replies: [
        {
          senderId: userId,
          senderName: clientName,
          senderRole: req.user ? req.user.role : 'USER',
          message: message.trim(),
          isInternal: false,
          createdAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isInMemory()) {
      if (!memoryStore.supportTickets) memoryStore.supportTickets = [];
      memoryStore.supportTickets.unshift(ticketData);
      return res.status(201).json({
        success: true,
        message: `Support ticket created successfully. Your Ticket ID is ${ticketId}`,
        ticketId,
        data: ticketData,
        ticket: ticketData
      });
    }

    const SupportTicket = require('../models/SupportTicket');
    const newTicket = await SupportTicket.create(ticketData);

    res.status(201).json({
      success: true,
      message: `Support ticket created successfully. Your Ticket ID is ${ticketId}`,
      ticketId,
      data: newTicket,
      ticket: newTicket
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/support/my-tickets
 * Returns support tickets created by the authenticated user
 */
const getMyTickets = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const phone = req.user.phone;

    if (isInMemory()) {
      const tickets = (memoryStore.supportTickets || []).filter(t => 
        t.userId === userId || t.phone === phone
      );
      return res.json({ success: true, count: tickets.length, tickets });
    }

    const SupportTicket = require('../models/SupportTicket');
    const tickets = await SupportTicket.find({
      $or: [{ userId }, { phone }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/support/tickets/:id
 * Retrieve single ticket details with replies
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    let ticket = null;
    if (isInMemory()) {
      ticket = (memoryStore.supportTickets || []).find(t => 
        t._id === id || t.ticketId === id
      );
    } else {
      const SupportTicket = require('../models/SupportTicket');
      ticket = await SupportTicket.findOne({
        $or: [{ _id: id }, { ticketId: id }]
      });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    // Filter out internal admin notes if user is not admin
    const isUserAdmin = req.user && req.user.role === 'ADMIN';
    const sanitized = { ...(ticket.toObject ? ticket.toObject() : ticket) };
    if (!isUserAdmin && sanitized.replies) {
      sanitized.replies = sanitized.replies.filter(r => !r.isInternal);
    }

    res.json({ success: true, ticket: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/support/tickets/:id/reply
 * User reply on open ticket
 */
const replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
    }

    const replyObj = {
      senderId: req.user ? (req.user._id || req.user.id) : 'CITIZEN',
      senderName: req.user ? req.user.name : 'User',
      senderRole: req.user ? req.user.role : 'USER',
      message: message.trim(),
      isInternal: false,
      createdAt: new Date()
    };

    if (isInMemory()) {
      const ticket = (memoryStore.supportTickets || []).find(t => 
        t._id === id || t.ticketId === id
      );
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      ticket.replies.push(replyObj);
      ticket.updatedAt = new Date();
      if (ticket.status === 'Waiting for User') ticket.status = 'Open';
      return res.json({ success: true, message: 'Reply added successfully.', ticket });
    }

    const SupportTicket = require('../models/SupportTicket');
    const ticket = await SupportTicket.findOne({
      $or: [{ _id: id }, { ticketId: id }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    ticket.replies.push(replyObj);
    if (ticket.status === 'Waiting for User') ticket.status = 'Open';
    await ticket.save();

    res.json({ success: true, message: 'Reply added successfully.', ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  replyTicket
};
