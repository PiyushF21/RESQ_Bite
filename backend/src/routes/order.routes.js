const express = require('express');
const { claimItem, claimDonation, getOrderHistory } = require('../controllers/order.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/claim', verifyToken, requireRole('student'), claimItem);
router.post('/donations/claim', verifyToken, requireRole('ngo'), claimDonation);
router.get('/history', verifyToken, getOrderHistory);

module.exports = router;
