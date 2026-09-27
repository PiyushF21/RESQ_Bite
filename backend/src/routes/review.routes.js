const express = require('express');
const { createReview, getRestaurantReviews } = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createReview);
router.get('/restaurant/:restaurant_id', verifyToken, getRestaurantReviews);

module.exports = router;
