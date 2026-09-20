const express = require('express');
const router = express.Router();
const { getDisputes, createDispute, updateDisputeStatus } = require('../controllers/disputeController');
const { protect } = require('../middleware/auth');

router.get('/', getDisputes);
router.get('/user/:userId', getDisputes);
router.post('/', protect, createDispute);
router.put('/:id', updateDisputeStatus);


module.exports = router;
