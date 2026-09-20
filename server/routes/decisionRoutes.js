const express = require('express');
const router = express.Router();
const { getDecisionEvaluation } = require('../controllers/decisionController');

// Support both POST and GET for evaluation and recommendations
router.post('/evaluate', getDecisionEvaluation);
router.get('/evaluate', getDecisionEvaluation);
router.get('/recommendation', getDecisionEvaluation);
router.get('/', getDecisionEvaluation);

module.exports = router;
