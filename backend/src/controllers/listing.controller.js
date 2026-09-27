const { randomUUID } = require('crypto');
const db = require('../config/db');

const CO2_PER_ITEM = 2.5;
const MONEY_SAVED_MULTIPLIER = 1.5;

const getActive = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        
        // Exclude bulk orders (quantity >= 10) from student view
        let query = `
            SELECT sl.*, r.business_name, r.address, r.latitude AS lat, r.longitude AS lng, 
                   r.cuisine_type, r.rating AS restaurant_rating, r.phone AS restaurant_phone
            FROM surplus_listings sl 
            JOIN restaurants r ON sl.restaurant_id = r.id 
            WHERE sl.status='active' AND sl.quantity_available > 0 AND sl.quantity_available < 10 AND sl.pickup_end_time > NOW()
        `;
        const params = [];

        if (search) {
            query += ` AND (sl.item_name LIKE ? OR sl.description LIKE ? OR r.business_name LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (category && category !== 'all') {
            query += ` AND sl.category = ?`;
            params.push(category);
        }

        if (sort === 'price_low') {
            query += ` ORDER BY sl.base_price ASC`;
        } else if (sort === 'price_high') {
            query += ` ORDER BY sl.base_price DESC`;
        } else if (sort === 'ending_soon') {
            query += ` ORDER BY sl.pickup_end_time ASC`;
        } else if (sort === 'newest') {
            query += ` ORDER BY sl.created_at DESC`;
        } else {
            query += ` ORDER BY sl.pickup_end_time ASC`;
        }

        const [results] = await db.query(query, params);
        
        // Dynamic Decay Pricing Engine: Price drops as time gets closer to expiry
        const listings = results.map(listing => {
            const now = new Date();
            const end = new Date(listing.pickup_end_time);
            const start = new Date(listing.created_at);
            const totalDuration = end - start;
            const elapsed = now - start;
            
            if (elapsed > 0 && totalDuration > 0) {
                const decayRatio = Math.min(elapsed / totalDuration, 1);
                const priceDiff = parseFloat(listing.base_price) - parseFloat(listing.min_price);
                const dynamicPrice = parseFloat(listing.base_price) - (priceDiff * decayRatio);
                listing.base_price = Math.max(parseFloat(listing.min_price), dynamicPrice).toFixed(2);
            }
            return listing;
        });

        res.json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getDonations = async (req, res) => {
    try {
        // Smart NGO Routing: Show expired items OR active bulk orders (quantity >= 10)
        const [listings] = await db.query(`
            SELECT sl.*, r.business_name, r.address, r.latitude AS lat, r.longitude AS lng,
                   r.cuisine_type, r.phone AS restaurant_phone
            FROM surplus_listings sl 
            JOIN restaurants r ON sl.restaurant_id = r.id 
            WHERE sl.status='active' AND sl.quantity_available > 0 AND (sl.pickup_end_time <= NOW() OR sl.quantity_available >= 10)
            ORDER BY sl.quantity_available DESC
        `);
        res.json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const create = async (req, res) => {
    try {
        const [restaurants] = await db.query('SELECT id FROM restaurants WHERE owner_id = ?', [req.user.id]);
        let restaurant_id;
        
        if (restaurants.length === 0) {
            restaurant_id = randomUUID();
            await db.query('INSERT INTO restaurants (id, owner_id, business_name) VALUES (?, ?, ?)', [restaurant_id, req.user.id, 'My Restaurant']);
        } else {
            restaurant_id = restaurants[0].id;
        }
        
        const end_time = new Date(req.body.pickup_end_time);
        const id = randomUUID();
        const category = req.body.category || 'veg';
        const original_price = req.body.original_price || (parseFloat(req.body.base_price) * 2.5);
        
        await db.query(
            'INSERT INTO surplus_listings (id, restaurant_id, item_name, description, category, quantity_available, base_price, min_price, original_price, pickup_end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, restaurant_id, req.body.item_name, req.body.description, category, req.body.quantity_available, req.body.base_price, req.body.min_price, original_price, end_time]
        );
        
        res.status(201).json({ message: 'Listing created', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteListing = async (req, res) => {
    try {
        const [restaurants] = await db.query('SELECT id FROM restaurants WHERE owner_id = ?', [req.user.id]);
        if (restaurants.length === 0) return res.status(403).json({ error: 'Forbidden' });
        
        const restaurant_ids = restaurants.map(r => r.id);
        const [result] = await db.query('UPDATE surplus_listings SET status=? WHERE id=? AND restaurant_id IN (?)', ['cancelled', req.params.id, restaurant_ids]);
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Listing not found or unauthorized' });
        res.json({ message: 'Listing deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMerchantListings = async (req, res) => {
    try {
        const [restaurants] = await db.query('SELECT id FROM restaurants WHERE owner_id = ?', [req.user.id]);
        if (restaurants.length === 0) return res.json([]);
        
        const restaurant_ids = restaurants.map(r => r.id);
        const [listings] = await db.query(
            'SELECT * FROM surplus_listings WHERE restaurant_id IN (?) AND status IN ("active", "claimed", "donated") ORDER BY created_at DESC',
            [restaurant_ids]
        );
        res.json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMerchantStats = async (req, res) => {
    try {
        const [restaurants] = await db.query('SELECT id FROM restaurants WHERE owner_id = ?', [req.user.id]);
        if (restaurants.length === 0) return res.json({ total_recovered: 0, items_sold: 0, active_listings: 0, total_items_listed: 0, food_saved_kg: 0 });
        
        const restaurant_ids = restaurants.map(r => r.id);
        
        const [active] = await db.query('SELECT COUNT(*) as count FROM surplus_listings WHERE restaurant_id IN (?) AND status="active"', [restaurant_ids]);
        const [total] = await db.query('SELECT COUNT(*) as count FROM surplus_listings WHERE restaurant_id IN (?)', [restaurant_ids]);
        const [sold] = await db.query(`
            SELECT COUNT(o.id) as items_sold, COALESCE(SUM(sl.base_price), 0) as total_recovered 
            FROM orders o 
            JOIN surplus_listings sl ON o.listing_id = sl.id 
            WHERE sl.restaurant_id IN (?)
        `, [restaurant_ids]);
        
        res.json({
            total_recovered: parseFloat(sold[0].total_recovered),
            items_sold: sold[0].items_sold,
            active_listings: active[0].count,
            total_items_listed: total[0].count,
            food_saved_kg: (sold[0].items_sold * 0.8).toFixed(1)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getActive, getDonations, create, deleteListing, getMerchantListings, getMerchantStats };
