const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

// All admin routes strictly enforce authentication + ADMIN role
router.use(protect, requireAdmin);

router.get('/overview', getOverview);
router.get('/stats', getOverview);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/schemes', getSchemes);
router.post('/schemes', createScheme);
router.put('/schemes/:id', updateScheme);
router.delete('/schemes/:id', deleteScheme);

router.get('/tickets', getTickets);
router.put('/tickets/:id/reply', replyTicket);
router.post('/tickets/:id/reply', replyTicket);

router.get('/audit-logs', getAuditLogs);

module.exports = router;
