const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getTicketById,
  replyTicket
} = require('../controllers/supportController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createTicket);
router.post('/tickets', optionalAuth, createTicket);
router.get('/', protect, getMyTickets);
router.get('/my-tickets', protect, getMyTickets);
router.get('/:id', optionalAuth, getTicketById);
router.get('/tickets/:id', optionalAuth, getTicketById);
router.post('/:id/reply', optionalAuth, replyTicket);
router.post('/tickets/:id/reply', optionalAuth, replyTicket);

module.exports = router;
