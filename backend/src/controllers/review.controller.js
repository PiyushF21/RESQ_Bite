const { randomUUID } = require('crypto');
const db = require('../config/db');

const createReview = async (req, res) => {
    try {
        const { order_id, rating, comment } = req.body;

        if (!order_id || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valid order_id and rating (1-5) required' });
        }

        // Verify the order belongs to this user
        const [orders] = await db.query(
            `SELECT o.*, sl.restaurant_id FROM orders o 
             JOIN surplus_listings sl ON o.listing_id = sl.id 
             WHERE o.id = ? AND o.user_id = ?`,
            [order_id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if already reviewed
        const [existing] = await db.query('SELECT id FROM reviews WHERE order_id = ?', [order_id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already reviewed this order' });
        }

        const restaurant_id = orders[0].restaurant_id;
        const id = randomUUID();

        await db.query(
            'INSERT INTO reviews (id, user_id, restaurant_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)',
            [id, req.user.id, restaurant_id, order_id, rating, comment || null]
        );

        // Update restaurant rating
        const [avgRating] = await db.query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE restaurant_id = ?',
            [restaurant_id]
        );

        await db.query(
            'UPDATE restaurants SET rating = ?, total_reviews = ? WHERE id = ?',
            [avgRating[0].avg_rating, avgRating[0].total, restaurant_id]
        );

        res.status(201).json({ message: 'Review submitted', rating: avgRating[0].avg_rating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRestaurantReviews = async (req, res) => {
    try {
        const { restaurant_id } = req.params;

        const [reviews] = await db.query(`
            SELECT r.*, u.full_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.restaurant_id = ? 
            ORDER BY r.created_at DESC 
            LIMIT 20
        `, [restaurant_id]);

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createReview, getRestaurantReviews };
