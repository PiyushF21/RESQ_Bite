const express = require('express');
const { getRestaurantProfile, updateRestaurantProfile, getRestaurantById } = require('../controllers/restaurant.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', verifyToken, requireRole('merchant'), getRestaurantProfile);
router.put('/profile', verifyToken, requireRole('merchant'), updateRestaurantProfile);
router.get('/:id', verifyToken, getRestaurantById);

module.exports = router;
