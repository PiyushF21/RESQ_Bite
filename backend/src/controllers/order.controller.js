const { randomUUID } = require('crypto');
const db = require('../config/db');

const generatePickupCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const claimItem = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const listing_id = req.body.listing_id;
        
        const [listings] = await connection.query('SELECT * FROM surplus_listings WHERE id = ? AND quantity_available > 0 FOR UPDATE', [listing_id]);
        if (listings.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Item not available' });
        }
        
        const listing = listings[0];
        const pickupCode = generatePickupCode();
        
        await connection.query('UPDATE surplus_listings SET quantity_available = quantity_available - 1 WHERE id = ?', [listing_id]);
        if (listing.quantity_available - 1 === 0) {
            await connection.query('UPDATE surplus_listings SET status = "claimed" WHERE id = ?', [listing_id]);
        }
        
        const order_id = randomUUID();
        await connection.query(
            'INSERT INTO orders (id, user_id, listing_id, quantity, total_price, pickup_code) VALUES (?, ?, ?, ?, ?, ?)',
            [order_id, req.user.id, listing_id, 1, listing.base_price, pickupCode]
        );
        
        const moneySaved = (listing.original_price || listing.base_price * 2.5) - listing.base_price;
        const co2Saved = 2.5;
        
        // Update streak
        const today = new Date().toISOString().split('T')[0];
        const [currentStats] = await connection.query('SELECT * FROM user_stats WHERE user_id = ?', [req.user.id]);
        
        let streakDays = 1;
        if (currentStats.length > 0 && currentStats[0].last_rescue_date) {
            const lastDate = new Date(currentStats[0].last_rescue_date);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                streakDays = currentStats[0].streak_days + 1;
            } else if (diffDays === 0) {
                streakDays = currentStats[0].streak_days;
            }
        }
        
        await connection.query(
            `INSERT INTO user_stats (user_id, items_rescued, total_money_saved, total_co2_saved_kg, streak_days, last_rescue_date) 
             VALUES (?, 1, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             items_rescued = items_rescued + 1, 
             total_money_saved = total_money_saved + ?, 
             total_co2_saved_kg = total_co2_saved_kg + ?,
             streak_days = ?,
             last_rescue_date = ?`,
            [req.user.id, moneySaved, co2Saved, streakDays, today, moneySaved, co2Saved, streakDays, today]
        );
        
        // Create notification
        const notifId = randomUUID();
        await connection.query(
            'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
            [notifId, req.user.id, '🎉 Food Rescued!', `You claimed "${listing.item_name}" for ₹${listing.base_price}. Pickup code: ${pickupCode}`, 'order']
        );
        
        await connection.commit();
        res.json({ message: 'Item claimed successfully', moneySaved, co2Saved, pickupCode, order_id });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
};

const claimDonation = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const listing_id = req.body.listing_id;
        
        const [listings] = await connection.query('SELECT * FROM surplus_listings WHERE id = ? AND quantity_available > 0 FOR UPDATE', [listing_id]);
        if (listings.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Item not available' });
        }
        
        const listing = listings[0];
        const qtyClaimed = listing.quantity_available;
        const pickupCode = generatePickupCode();
        
        await connection.query('UPDATE surplus_listings SET quantity_available = 0, status = "donated" WHERE id = ?', [listing_id]);
        
        const order_id = randomUUID();
        await connection.query(
            'INSERT INTO orders (id, user_id, listing_id, quantity, total_price, status, pickup_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [order_id, req.user.id, listing_id, qtyClaimed, 0, 'donated', pickupCode]
        );
        
        const co2Saved = 2.5 * qtyClaimed;
        
        await connection.query(
            `INSERT INTO user_stats (user_id, items_rescued, total_co2_saved_kg, streak_days, last_rescue_date)
             VALUES (?, ?, ?, 1, CURDATE())
             ON DUPLICATE KEY UPDATE
             items_rescued = items_rescued + ?, 
             total_co2_saved_kg = total_co2_saved_kg + ?`,
            [req.user.id, qtyClaimed, co2Saved, qtyClaimed, co2Saved]
        );
        
        // Create notification
        const notifId = randomUUID();
        await connection.query(
            'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
            [notifId, req.user.id, '💚 Donation Claimed!', `You claimed ${qtyClaimed}x "${listing.item_name}" for community distribution. Pickup code: ${pickupCode}`, 'donation']
        );
        
        await connection.commit();
        res.json({ message: 'Donation claimed successfully', qtyClaimed, co2Saved, pickupCode });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        connection.release();
    }
};

const getOrderHistory = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, sl.item_name, sl.description, sl.category, sl.base_price, sl.original_price, sl.image_url,
                   r.business_name, r.address, r.id AS restaurant_id,
                   rev.rating AS user_rating, rev.comment AS user_review
            FROM orders o
            JOIN surplus_listings sl ON o.listing_id = sl.id
            JOIN restaurants r ON sl.restaurant_id = r.id
            LEFT JOIN reviews rev ON rev.order_id = o.id AND rev.user_id = o.user_id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            LIMIT 50
        `, [req.user.id]);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { claimItem, claimDonation, getOrderHistory };
